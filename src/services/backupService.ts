import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { dbService } from './db';
import { UserProfile } from '../types';
import pkg from '../../package.json';

export interface NihonGoBackupPayload {
  appName: 'NihonGo!';
  version: string;
  exportedAt: string;
  profile: UserProfile;
  lessonProgress: Record<string, { unlocked: boolean; completedSteps: number; stars: number; totalSteps?: number }>;
  flashcardSRS: Record<string, { srsLevel: number; intervalDays: number; nextReviewDate: string; timesReviewed: number; timesCorrect: number }>;
  quests?: Record<string, any>;
  dailyStats?: Record<string, any>;
  jlptTower?: any;
}

const BACKUP_TIMESTAMP_KEY = 'nihongo_last_backup_at';

export const backupService = {
  getLastBackupDate(): string | null {
    try {
      return localStorage.getItem(BACKUP_TIMESTAMP_KEY);
    } catch {
      return null;
    }
  },

  async exportBackupData(): Promise<NihonGoBackupPayload> {
    const nowIso = new Date().toISOString();
    try {
      localStorage.setItem(BACKUP_TIMESTAMP_KEY, nowIso);
    } catch {
      // ignore
    }

    const profile = await dbService.getUserProfile();
    const lessonProgress = await dbService.getLessonProgress();
    const flashcardSRS = await dbService.getFlashcardSRSMap();

    // Collect daily quests and stats from localStorage
    const quests: Record<string, any> = {};
    const dailyStats: Record<string, any> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('genki_quests_')) {
          quests[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } else if (key && key.startsWith('genki_daily_stats_')) {
          dailyStats[key] = JSON.parse(localStorage.getItem(key) || '{}');
        }
      }
    } catch {
      // ignore
    }

    let jlptTower: any = undefined;
    try {
      const rawTower = localStorage.getItem('nihongo_jlpt_tower_v1');
      if (rawTower) jlptTower = JSON.parse(rawTower);
    } catch {
      // ignore
    }

    return {
      appName: 'NihonGo!',
      version: pkg.version,
      exportedAt: nowIso,
      profile,
      lessonProgress,
      flashcardSRS,
      quests,
      dailyStats,
      jlptTower,
    };
  },

  async downloadBackupFile(jsonString: string, fileName: string): Promise<{ savedPath?: string }> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: jsonString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });
        return { savedPath: `Documentos/${fileName}` };
      } catch {
        // Fallback: escribir en caché y abrir selector nativo para guardar en Archivos/Drive
        const cached = await Filesystem.writeFile({
          path: fileName,
          data: jsonString,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({
          title: `Respaldo NihonGo! (${fileName})`,
          text: 'Guarda este archivo JSON en tu dispositivo o Google Drive.',
          files: [cached.uri],
          dialogTitle: 'Guardar archivo de respaldo',
        });
        return { savedPath: fileName };
      }
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return {};
  },

  async exportToDriveOrShare(): Promise<{ shared: boolean; fileName: string; savedPath?: string }> {
    const payload = await this.exportBackupData();
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePart = `${yyyy}-${mm}-${dd}`;
    const fileName = `nihongo-respaldo-${datePart}.json`;
    const jsonString = JSON.stringify(payload, null, 2);

    if (Capacitor.isNativePlatform()) {
      const writeRes = await Filesystem.writeFile({
        path: fileName,
        data: jsonString,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({
        title: `Respaldo NihonGo! (${datePart})`,
        text: 'Guarda este archivo en tu Google Drive o Archivos para respaldar tu progreso de NihonGo!.',
        files: [writeRes.uri],
        dialogTitle: 'Guardar respaldo en Drive / Compartir',
      });
      return { shared: true, fileName };
    }

    const file = new File([jsonString], fileName, { type: 'application/json' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Respaldo NihonGo! (${datePart})`,
        text: 'Guarda este archivo en tu Google Drive para respaldar tu progreso de NihonGo!.',
        files: [file],
      });
      return { shared: true, fileName };
    } else {
      const dl = await this.downloadBackupFile(jsonString, fileName);
      return { shared: false, fileName, savedPath: dl.savedPath };
    }
  },

  async importBackupData(payload: Partial<NihonGoBackupPayload>): Promise<boolean> {
    if (!payload || typeof payload !== 'object') {
      throw new Error('El archivo de respaldo no es válido.');
    }

    const hasValidKeys =
      payload.appName === 'NihonGo!' ||
      payload.profile !== undefined ||
      payload.lessonProgress !== undefined ||
      payload.flashcardSRS !== undefined;

    if (!hasValidKeys) {
      throw new Error('El archivo seleccionado no pertenece a un respaldo de NihonGo!.');
    }

    // Rehydrate SQLite & fallback
    await dbService.importAllData({
      profile: payload.profile || (await dbService.getUserProfile()),
      lessonProgress: payload.lessonProgress || {},
      flashcardSRS: payload.flashcardSRS || {},
    });

    // Rehydrate quests & daily stats
    if (payload.quests && typeof payload.quests === 'object') {
      for (const [k, v] of Object.entries(payload.quests)) {
        try {
          localStorage.setItem(k, JSON.stringify(v));
        } catch {}
      }
    }
    if (payload.dailyStats && typeof payload.dailyStats === 'object') {
      for (const [k, v] of Object.entries(payload.dailyStats)) {
        try {
          localStorage.setItem(k, JSON.stringify(v));
        } catch {}
      }
    }

    if (payload.jlptTower && typeof payload.jlptTower === 'object') {
      try {
        localStorage.setItem('nihongo_jlpt_tower_v1', JSON.stringify(payload.jlptTower));
      } catch {}
    }

    try {
      localStorage.setItem(BACKUP_TIMESTAMP_KEY, new Date().toISOString());
    } catch {}

    return true;
  },
};
