import React, { useState, useRef } from 'react';
import {
  Download,
  Play,
  Sparkles,
  BookOpen,
  Mic,
  Trophy,
  Heart,
  Star,
  CheckCircle2,
  Github,
  ArrowRight,
  ExternalLink,
  HardDrive,
  Smartphone,
  Globe,
  Layers,
  Flame,
  Check,
  Languages,
  PenTool
} from 'lucide-react';
import pkg from '../../package.json';

const APP_VERSION = pkg.version;

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const APK_DOWNLOAD_URL = `https://github.com/joestark96/nihonGo/raw/main/releases/nihongo-v${APP_VERSION}.apk`;

  const handleDownloadApk = () => {
    setDownloadStarted(true);
    // 1. Direct GitHub release raw URL download
    const link = document.createElement('a');
    link.href = APK_DOWNLOAD_URL;
    link.setAttribute('download', `nihongo-v${APP_VERSION}.apk`);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Direct browser navigation fallback for mobile Chrome/Android
    setTimeout(() => {
      window.location.href = APK_DOWNLOAD_URL;
    }, 300);

    setTimeout(() => setDownloadStarted(false), 4500);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="h-screen w-full overflow-y-auto scroll-smooth bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0f171c] dark:via-[#131f24] dark:to-[#0b1114] text-gray-800 dark:text-gray-100 font-['Nunito',sans-serif] selection:bg-duo-green selection:text-white"
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#131f24]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#283842] transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-2xl bg-duo-green flex items-center justify-center text-white font-black text-xl shadow-[0_3px_0_0_#46a302]">
              日
            </div>
            <div>
              <div className="font-black text-lg leading-tight tracking-tight flex items-center gap-1.5">
                <span>NihonGo!</span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-duo-green/15 text-duo-green">v{APP_VERSION}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 leading-none">日本語 • Genki I & II</p>
            </div>
          </div>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://github.com/joestark96/nihonGo"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 dark:border-[#283842] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-black text-xs flex items-center gap-1.5 transition-colors"
              title="Ver repositorio en GitHub"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <button
              onClick={handleDownloadApk}
              className="px-3.5 py-2 rounded-xl bg-duo-blue hover:bg-duo-blue-dark text-white font-black text-xs shadow-[0_3px_0_0_#1899d6] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar APK</span>
            </button>

            <button
              onClick={onEnterApp}
              className="px-4 py-2 rounded-xl bg-duo-green hover:bg-duo-green-dark text-white font-black text-xs shadow-[0_3px_0_0_#46a302] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span className="hidden xs:inline">Probar Web</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 px-4">
        {/* Decorative background blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-duo-green/10 dark:bg-duo-green/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-duo-blue/10 dark:bg-duo-blue/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-duo-green/15 border border-duo-green/30 text-duo-green dark:text-green-400 font-black text-xs mb-6 animate-fade-in shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Versión {APP_VERSION} Oficial Disponible para Android y Web</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] max-w-4xl text-gray-900 dark:text-white mb-6">
            Aprende <span className="text-duo-green">Japonés Real</span> con el rigor de Genki y la adicción de Duolingo
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg font-bold text-gray-600 dark:text-gray-300 max-w-2xl mb-8 leading-relaxed">
            Domina las <strong>23 unidades completas de Genki I y II</strong>: Hiragana, Katakana, Kanjis N5/N4, nuevo examen de saltos multilección, laboratorio de voz con IA, sistema SRS de dominio de palabras y modo 100% offline.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-md mb-12">
            <button
              onClick={handleDownloadApk}
              className="flex-1 min-w-[200px] py-4 px-6 rounded-2xl bg-duo-green hover:bg-duo-green-dark text-white font-black text-sm uppercase tracking-wider shadow-[0_5px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Download className="w-5 h-5 stroke-[2.5px] group-hover:translate-y-0.5 transition-transform" />
              <span>{downloadStarted ? 'Descargando...' : `Descargar APK v${APP_VERSION}`}</span>
            </button>

            <button
              onClick={onEnterApp}
              className="flex-1 min-w-[200px] py-4 px-6 rounded-2xl bg-white dark:bg-[#18272e] border-2 border-duo-blue text-duo-blue hover:bg-duo-blue hover:text-white font-black text-sm uppercase tracking-wider shadow-[0_5px_0_0_#1899d6] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Probar App Web</span>
            </button>
          </div>

          {/* Highlights Mini Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 bg-white dark:bg-[#18272e] border border-gray-200 dark:border-[#283842] px-3 py-1 rounded-xl">
              <Check className="w-3.5 h-3.5 text-duo-green stroke-[3px]" /> 100% Gratuito y Open Source
            </span>
            <span className="flex items-center gap-1 bg-white dark:bg-[#18272e] border border-gray-200 dark:border-[#283842] px-3 py-1 rounded-xl">
              <Check className="w-3.5 h-3.5 text-duo-green stroke-[3px]" /> Sin Anuncios Invasivos
            </span>
            <span className="flex items-center gap-1 bg-white dark:bg-[#18272e] border border-gray-200 dark:border-[#283842] px-3 py-1 rounded-xl">
              <Check className="w-3.5 h-3.5 text-duo-green stroke-[3px]" /> Funciona 100% Offline
            </span>
          </div>

          {/* Interactive Mockup Preview Card */}
          <div className="w-full max-w-3xl mt-12 p-3 sm:p-5 rounded-3xl bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] shadow-2xl relative">
            {/* Top Device Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#283842] mb-4 text-xs font-black">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 text-gray-400">nihongo.app</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-rose-500"><Heart className="w-3.5 h-3.5 fill-rose-500" /> 5</span>
                <span className="flex items-center gap-1 text-amber-500"><Flame className="w-3.5 h-3.5 fill-amber-500" /> 14</span>
                <span className="flex items-center gap-1 text-duo-blue"><Trophy className="w-3.5 h-3.5 text-duo-blue" /> 320 XP</span>
              </div>
            </div>

            {/* Mock Serpentine Roadmap */}
            <div className="bg-gray-50 dark:bg-[#131f24] rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="text-center mb-6">
                <span className="px-3 py-1 rounded-xl bg-duo-green/20 text-duo-green font-black text-xs uppercase tracking-wider">
                  Unidad 1 • Diálogos y Presentaciones
                </span>
                <h3 className="text-lg font-black mt-1">あいさつと自己紹介 (Genki I)</h3>
              </div>

              {/* Sample Nodes */}
              <div className="flex flex-col items-center gap-4 relative w-full max-w-xs">
                {/* Node 1: Completed */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-duo-yellow border-b-4 border-duo-yellow-dark flex items-center justify-center text-white shadow-lg">
                    <Star className="w-8 h-8 fill-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black">Lección 1: Saludos</p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ 3/3 Estrellas</span>
                  </div>
                </div>

                {/* Node 2: Active with bouncing badge */}
                <div className="flex items-center gap-3 relative">
                  <div className="absolute -top-7 left-3 animate-bounce">
                    <span className="px-2 py-0.5 rounded-lg bg-duo-green text-white font-black text-[10px] shadow-sm uppercase tracking-wide">
                      ¡Comenzar!
                    </span>
                  </div>
                  <div className="w-18 h-18 rounded-full bg-duo-green border-b-4 border-duo-green-dark flex items-center justify-center text-white shadow-xl ring-4 ring-duo-green/30 animate-pulse">
                    <Play className="w-8 h-8 fill-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black">Lección 2: La Hora y Números</p>
                    <span className="text-[10px] text-duo-blue font-bold">Disponible ahora</span>
                  </div>
                </div>

                {/* Node 3: Locked */}
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 border-b-4 border-gray-400 dark:border-gray-800 flex items-center justify-center text-gray-500">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-gray-400">Lección 3: Ocupaciones</p>
                    <span className="text-[10px] text-gray-400 font-medium">Bloqueado</span>
                  </div>
                </div>
              </div>

              {/* Try it out overlay button */}
              <div className="mt-8">
                <button
                  onClick={onEnterApp}
                  className="px-6 py-2.5 rounded-xl bg-duo-green hover:bg-duo-green-dark text-white font-black text-xs shadow-[0_3px_0_0_#46a302] active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explorar Todo el Roadmap Interactivo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="bg-white dark:bg-[#18272e] border-y border-gray-200 dark:border-[#283842] py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-duo-green">23</span>
            <span className="text-xs font-black uppercase text-gray-400 mt-1">Unidades de Genki I y II</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-duo-blue">850+</span>
            <span className="text-xs font-black uppercase text-gray-400 mt-1">Palabras y Kanjis SRS</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">40+</span>
            <span className="text-xs font-black uppercase text-gray-400 mt-1">Diálogos de Roleplay IA</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-amber-500">100%</span>
            <span className="text-xs font-black uppercase text-gray-400 mt-1">Offline y Gratuito</span>
          </div>
        </div>
      </section>

      {/* 6 Key Superpowers / Features */}
      <section className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-wider text-duo-green">Todo en una sola aplicación</span>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white mt-1 mb-4">
            Diseñado para que hables, leas y domines japonés de verdad
          </h2>
          <p className="text-sm sm:text-base font-bold text-gray-500 dark:text-gray-400">
            Sin suscripciones ocultas ni muros de pago. El currículum más respetado del mundo ahora completamente gamificado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-duo-green flex items-center justify-center font-black">
              <Layers className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">Roadmap Completo de Genki I y II</h3>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
              23 unidades interactivas que cubren desde los primeros saludos hasta gramática intermedia avanzada con exámenes de salto de nivel y repaso por unidad.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              <Mic className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">Laboratorio de Voz y Roleplay con IA</h3>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
              Habla japonés en conversaciones reales. El sistema normaliza números, horas y kanji para una calificación fonética justa y avance automático de diálogos.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-duo-blue flex items-center justify-center font-black">
              <Trophy className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">Banco de Dominio y Repaso SRS</h3>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
              Algoritmo de repetición espaciada en 5 niveles (⚪ Desconocida, 🔴 Débil, 🟡 Aprendiendo, 🟢 Familiar, 💎 Dominada) con filtro exclusivo de lecciones vistas.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black">
              <HardDrive className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">100% Offline y Descarga en Segundo Plano</h3>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
              Descarga paquetes de voz neuronal por unidad. El gestor en segundo plano continúa descargando aunque cambies de pestaña o apagues la pantalla.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-black">
              <PenTool className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">Taller de Escritura y Trazos</h3>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
              Lienzo digital interactivo para practicar Hiragana, Katakana y Kanjis oficiales del JLPT N5 y N4 siguiendo el orden exacto de los trazos.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18272e] border-2 border-duo-gray-200 dark:border-[#283842] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-black">
              <BookOpen className="w-6 h-6 stroke-[2.5px]" />
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">Guía Completa de Teoría y Gramática</h3>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
              Acceso instantáneo a explicaciones gramaticales detalladas en español para cada tema antes o después de cada lección del roadmap.
            </p>
          </div>
        </div>
      </section>

      {/* APK v1.0 Production Download Section */}
      <section id="download-apk" className="py-16 px-4 bg-gradient-to-b from-gray-100 to-white dark:from-[#0b1114] dark:to-[#131f24] border-t border-gray-200 dark:border-[#283842]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#18272e] rounded-3xl p-6 sm:p-10 border-2 border-duo-green shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <span className="px-3 py-1 rounded-xl bg-duo-green/20 text-duo-green font-black text-xs uppercase tracking-wider">
                Compilado Oficial para Android
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2 mb-2">
                NihonGo! v{APP_VERSION} (APK Release)
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Descarga el archivo APK de producción directamente a tu dispositivo móvil. Compatible con teléfonos y tablets Android 8.0 en adelante.
              </p>

              {/* APK Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 mb-6">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#131f24] border border-gray-200 dark:border-[#283842]">
                  <span className="block text-[10px] text-gray-400 uppercase">Versión</span>
                  <span className="text-gray-800 dark:text-gray-100 font-black">{APP_VERSION} (Release)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#131f24] border border-gray-200 dark:border-[#283842]">
                  <span className="block text-[10px] text-gray-400 uppercase">Tamaño</span>
                  <span className="text-gray-800 dark:text-gray-100 font-black">~18 MB</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#131f24] border border-gray-200 dark:border-[#283842] col-span-2 sm:col-span-1">
                  <span className="block text-[10px] text-gray-400 uppercase">Requisitos</span>
                  <span className="text-gray-800 dark:text-gray-100 font-black">Android 8.0+</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadApk}
                  className="py-3.5 px-6 rounded-2xl bg-duo-green hover:bg-duo-green-dark text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5 stroke-[2.5px]" />
                  <span>{downloadStarted ? 'Descargando APK...' : `Descargar APK v${APP_VERSION}`}</span>
                </button>

                <a
                  href="https://github.com/joestark96/nihonGo/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-4 h-4" />
                  <span>Releases en GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Direct fallback link */}
              <div className="mt-3">
                <a
                  href={APK_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-duo-green dark:text-green-400 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>¿No inició automáticamente? Clic aquí para descarga directa inmediata (16 MB)</span>
                </a>
              </div>
            </div>

            {/* Android Icon / Illustration */}
            <div className="w-40 h-40 rounded-3xl bg-gradient-to-tr from-emerald-500 to-duo-green flex items-center justify-center text-white shadow-xl flex-shrink-0">
              <Smartphone className="w-20 h-20 stroke-[1.5px]" />
            </div>
          </div>

          {/* Quick Install Guide */}
          <div className="mt-8 p-6 rounded-3xl bg-gray-50 dark:bg-[#131f24] border border-gray-200 dark:border-[#283842]">
            <h4 className="text-sm font-black uppercase text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span>📱 Guía de Instalación Rápida en Android</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-duo-green text-white font-black flex items-center justify-center flex-shrink-0">1</span>
                <p>Descarga el archivo <strong>nihongo-v{APP_VERSION}.apk</strong> presionando el botón verde.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-duo-green text-white font-black flex items-center justify-center flex-shrink-0">2</span>
                <p>Abre el archivo descargado. Si Android lo solicita, activa <em>Permitir desde esta fuente</em>.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-duo-green text-white font-black flex items-center justify-center flex-shrink-0">3</span>
                <p>Toca en <strong>Instalar</strong>, abre la aplicación y ¡comienza a aprender japonés gratis!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Changelog / Historial de Cambios */}
      <section className="py-16 px-4 bg-white dark:bg-[#131f24] border-t border-gray-200 dark:border-[#283842]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="px-3 py-1 rounded-xl bg-duo-blue/15 text-duo-blue font-black text-xs uppercase tracking-wider">
              Historial de Versiones
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2">
              Novedades y Evolución de NihonGo!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
              Todas las mejoras, correcciones y nuevas funciones añadidas en cada lanzamiento.
            </p>
          </div>

          <div className="space-y-4">
            {/* v1.3.3 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/70 dark:bg-[#18272e] border-2 border-duo-green shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-duo-green text-white font-black text-xs">v1.3.3</span>
                  <span className="text-xs font-black uppercase tracking-wider text-duo-green">Actual</span>
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Pestaña Explorar: Minijuegos, Mapa de Japón y Respaldo Android</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                <li>• <strong>Nueva pestaña Explorar con 3 minijuegos:</strong> Kana Blitz (contrarreloj 45s), Parejas Rápidas (vocabulario Genki con audio) y Constructor Express (armar oraciones y partículas), con recompensas de XP y gemas.</li>
                <li>• <strong>Mapa Interactivo de Japón (8 regiones):</strong> Contornos reales de las 47 prefecturas, pronunciación, datos culturales, vocabulario local y sistema de sellos (駅スタンプ) para desbloquear cada región.</li>
                <li>• <strong>Respaldo nativo en Android:</strong> Descarga directa del JSON en Documentos y menú nativo para guardar o compartir en Google Drive mediante Capacitor Filesystem y Share.</li>
                <li>• <strong>Mejoras de calidad y audio:</strong> Corrección de preguntas obvias en Chat con Mary y tiempo con に, y habilitación de voz neural/diccionario para palabras de 2 sílabas como あさ (asa).</li>
              </ul>
            </div>

            {/* v1.3.2 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.3.2</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Distractores Coherentes en Frases y Verbos</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Opciones más equilibradas sin respuestas obvias:</strong> Las frases completas en forma ます/です (como にほんにいきます) ya no se mezclan con verbos sueltos en diccionario con kanji (como 飲む o 起きる), y los distractores respetan si la respuesta está en hiragana o kanji.</li>
              </ul>
            </div>

            {/* v1.3.1 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.3.1</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Guía Visual y Audio en Ejercicios Escritos del Workbook</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Traducción y audio en «Ordena la oración del ejercicio escrito» (L3–L23):</strong> Ahora estos ejercicios del Workbook muestran automáticamente la frase en español y los botones Escuchar / Lento para poder resolverlos sin depender del libro físico.</li>
              </ul>
            </div>

            {/* v1.3.0 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.3.0</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Arquitectura Modular SOLID</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Fase 1 — Quiz y Ejercicios:</strong> Extracción de componentes por tipo de ejercicio (opción múltiple, ordenamiento, pares, habla y diálogo), pantallas de resultado y formateadores de opciones.</li>
                <li>• <strong>Fase 2 — Chat con Sensei:</strong> Separación del generador de pasos/retos interactivos y del componente de burbuja de chat respecto al controlador principal.</li>
                <li>• <strong>Fase 3 — Motor de Audio:</strong> División en módulos de perfiles de voz, normalización fonética japonesa y efectos Web Audio API manteniendo compatibilidad total.</li>
                <li>• <strong>Fase 4 — Navegación y Roadmap:</strong> Extracción del hook de navegación/gesto Atrás en Android y del modal de detalle de lección.</li>
              </ul>
            </div>

            {/* v1.2.7 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.2.7</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Audio en Ordenamiento Auditivo del Workbook</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Reproductor de audio en ejercicios de ordenar frase auditiva:</strong> Los ejercicios del Workbook L3–L23 («Ordena la frase clave de la situación auditiva») ahora muestran los botones Escuchar y Lento para oír la frase antes de ordenarla.</li>
              </ul>
            </div>

            {/* v1.2.6 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.2.6</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Control de Vidas y Ejercicios de Habla en Lecciones</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Bloqueo real sin corazones:</strong> Al entrar a una lección con 0 vidas ya muestra correctamente la pantalla de «Sin vidas» en lugar de permitir jugar.</li>
                <li>• <strong>Ejercicios de habla en lecciones:</strong> Ahora cada lección incluye práctica de pronunciación con micrófono para hablar en voz alta (con opción de continuar si no puedes hablar en ese momento).</li>
              </ul>
            </div>

            {/* v1.2.5 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.2.5</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Estabilidad en Modo Aleatorio de Flashcards</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Volteo estable en Flashcards Aleatorias:</strong> Al tocar una tarjeta para ver su significado y lectura en modo Aleatorio, la tarjeta ya no cambia ni se vuelve a barajar el mazo.</li>
              </ul>
            </div>

            {/* v1.2.4 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.2.4</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Filtro Estricto por Lecciones Completadas</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Flashcards y Dominio fieles a tu avance real:</strong> Tanto las tarjetas (incluido el modo Aleatorio) como las sesiones de Dominio ahora filtran estrictamente según las lecciones que ya completaste, sin adelantar vocabulario o kanjis de unidades aún no cursadas.</li>
              </ul>
            </div>

            {/* v1.2.3 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-blue/15 text-duo-blue font-black text-xs">v1.2.3</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Filtro en Flashcards y Gestos Atrás en Android</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Filtro por progreso y Modo Aleatorio en Flashcards:</strong> Nuevo filtro para repasar solo hasta la lección alcanzada en el Roadmap y botón «Aleatorio» para mezclar las tarjetas.</li>
                <li>• <strong>Soporte nativo para gesto/botón Atrás en Android:</strong> Al deslizar hacia atrás o pulsar Atrás en el teléfono, cierra modales, pide confirmación al salir de una lección o vuelve a la pestaña anterior en lugar de cerrar la app.</li>
              </ul>
            </div>

            {/* v1.2.1 – v1.2.2 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.2.1 – v1.2.2</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Memoria en Chat, Selector 3★ y Detector de Actualizaciones</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Memoria y Auto-Audio en Chat con Sensei:</strong> Guarda automáticamente en qué paso te quedaste por unidad, añade botón «Auto/Mudo» en la cabecera y permite reintentar quizzes o constructores de oraciones fallados.</li>
                <li>• <strong>Lista seleccionable «Subir a 3★ Oro»:</strong> Cuando tienes varias lecciones en Bronce o Plata, puedes elegir cuál perfeccionar desde una lista rápida en el Roadmap.</li>
                <li>• <strong>Botón «Repetir» en feedback de audio:</strong> Al comprobar un ejercicio de listening, puedes volver a reproducir el audio mientras lees su transcripción.</li>
              </ul>
            </div>

            {/* v1.2.0 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.2.0</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Actualizaciones, Estrellas, Repaso de Errores y Saltos en Chat</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Detector de actualizaciones en la app:</strong> Nuevo verificador en tu Perfil para comprobar si hay una versión nueva en GitHub y descargar el APK al instante.</li>
                <li>• <strong>Estrellas visibles y atajo a 3★ Oro:</strong> Los nodos completados muestran 1, 2 o 3 estrellitas junto al color Bronce/Plata/Oro, con un botón rápido para perfeccionar lecciones pendientes.</li>
                <li>• <strong>Audio instantáneo y repaso de errores:</strong> Precarga del siguiente ejercicio, transcripción automática al comprobar listening y botón «Repasar mis errores» al terminar una lección.</li>
                <li>• <strong>Salto rápido de temas en Chat con Sensei:</strong> Barra superior para ir directo a cualquier tema gramatical de la unidad.</li>
              </ul>
            </div>

            {/* v1.1.14 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-green/15 text-duo-green font-black text-xs">v1.1.14</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Voces en Workbook y Medallas en Roadmap</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Voces fieles por personaje en Workbook:</strong> Detección automática del personaje en preguntas y diálogos del Cuaderno para que Mary, Takeshi, Yamashita y el resto respondan con su voz oficial.</li>
                <li>• <strong>Bronce, Plata y Oro en el Roadmap:</strong> Los nodos completados ahora cambian de color según tus estrellas obtenidas (1 estrella = Bronce, 2 estrellas = Plata, 3 estrellas = Oro).</li>
              </ul>
            </div>

            {/* v1.1.13 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-blue/15 text-duo-blue font-black text-xs">v1.1.13</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Lectura Hiragana y Vocabulario Genki I</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Hiragana preservado en opciones:</strong> Al ocultar romaji en lecciones avanzadas, se conserva la lectura en hiragana dentro de paréntesis (ej. 二年生 (にねんせい)).</li>
                <li>• <strong>Expansión de vocabulario (L1–L8):</strong> Ampliación del banco de vocabulario Genki I con nuevas palabras clave como かく (escribir).</li>
              </ul>
            </div>

            {/* v1.1.12 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-black text-xs">v1.1.12</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Filtro de Ejercicios de Escucha</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Preguntas de gramática intactas:</strong> Se evita convertir preguntas conceptuales en ejercicios de audio usando subtítulos mixtos, manteniendo claridad total en cada ejercicio.</li>
              </ul>
            </div>

            {/* v1.1.11 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 font-black text-xs">v1.1.11</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Pausas en Diálogos y Fonética</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Pausa natural entre pregunta y respuesta:</strong> Los diálogos de teoría ahora hacen una pausa clara antes de decir la respuesta.</li>
                <li>• <strong>Pronunciación correcta de はたち (20 años):</strong> Normalización fonética a 二十歳 para evitar que el motor TTS lo confunda con わたし.</li>
              </ul>
            </div>

            {/* v1.1.8 – v1.1.10 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 font-black text-xs">v1.1.8 – v1.1.10</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Modo Chat Interactivo con tu Sensei</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Aprende teoría conversando:</strong> Nuevo modo chat guiado por tu personaje seleccionado con explicaciones compactas paso a paso y ejemplos con audio.</li>
                <li>• <strong>Retos didácticos integrados:</strong> Practica al momento con construcción de oraciones con fichas, escucha a ciegas, mini-quizzes y pronunciación por voz.</li>
                <li>• <strong>Scroll interno fluido:</strong> Al interactuar en el chat, la vista se mantiene en el mensaje actual sin saltar al inicio.</li>
              </ul>
            </div>

            {/* v1.1.7 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs">v1.1.7</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Economía Balanceada y 12 Logros</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Economía de gemas y corazones:</strong> Reajuste de precios para rellenar vidas y recompensas más equilibradas al avanzar y saltar lecciones.</li>
                <li>• <strong>12 logros progresivos:</strong> Ampliación de medallas e hitos de aprendizaje a largo plazo.</li>
              </ul>
            </div>

            {/* v1.1.5 – v1.1.6 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 font-black text-xs">v1.1.5 – v1.1.6</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Audio de こ y Versionado Automático</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Corrección del sonido こ (ko):</strong> Reemplazo de audio corrupto y normalización fonética de こ a コ para una pronunciación nítida.</li>
                <li>• <strong>Versionado automatizado:</strong> Flujo de compilación sincronizado entre Web y Android con npm run bump.</li>
              </ul>
            </div>

            {/* v1.1.4 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-xs">v1.1.4</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Mejoras de Examen, Workbook y UX</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Saltos de unidad precisos:</strong> Al saltar lecciones o unidades, el examen ahora solo incluye temas de lecciones no completadas/superadas.</li>
                <li>• <strong>Confirmación al salir:</strong> Al presionar cerrar en una lección o examen en curso, ahora solicita confirmación para evitar perder el progreso accidentalmente.</li>
                <li>• <strong>Voces variadas en Workbook:</strong> Los diálogos y ejercicios de escucha del Cuaderno alternan voces distintas de personajes Genki para cada interlocutor.</li>
                <li>• <strong>Distractores coherentes y sin pistas:</strong> Corregidas las opciones en ejercicios iniciales de Kanas (sin mezclar vocabulario avanzado) y eliminada la pista en la pregunta de la partícula 「は」.</li>
                <li>• <strong>Rachas y vidas en tiempo real:</strong> Reinicio automático de rachas vencidas, indicador visual diario y regeneración de corazones al reanudar.</li>
              </ul>
            </div>

            {/* v1.1.3 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-duo-blue/15 text-duo-blue font-black text-xs">v1.1.3</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Torre JLPT y Audio L3–L23</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Torre de Niveles JLPT (N5–N3):</strong> Desafío escalonado y Test Rápido de Ubicación para medir tu nivel real de japonés.</li>
                <li>• <strong>42 ejercicios de listening alineados:</strong> Corrección completa en Workbook L3–L23 y limpieza de pistas asimétricas en opciones.</li>
                <li>• <strong>Pronunciación natural:</strong> Normalización fonética de はは/母 para evitar lecturas erróneas en motores TTS.</li>
              </ul>
            </div>

            {/* v1.1.2 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 font-black text-xs">v1.1.2</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Trazos, Respaldo Cloud y Transcripciones</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Respaldo en Google Drive:</strong> Sincronización y copia de seguridad completa de perfil, progreso, estrellas y niveles SRS.</li>
                <li>• <strong>Animador de trazos y transcripciones:</strong> Animación interactiva de orden de trazos, transcripción revelable en listening y recordatorios diarios de racha.</li>
                <li>• <strong>Expansión de Workbook:</strong> 5 módulos de cuaderno por unidad con ejercicios oficiales de escucha.</li>
              </ul>
            </div>

            {/* v1.1.1 & v1.1.0 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gray-50 dark:bg-[#18272e] border border-gray-200 dark:border-[#283842]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs">v1.1.0 – v1.1.1</span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Modo Workbook y Saltos Multilección</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                <li>• <strong>Modo Cuaderno (Workbook) en el Roadmap:</strong> Selector dedicado para alternar entre Libro de Texto y Cuaderno Oficial Genki I &amp; II.</li>
                <li>• <strong>Examen de salto multilección:</strong> Salta directamente a cualquier lección o unidad superando un examen diagnóstico.</li>
                <li>• <strong>Descargas offline bajo demanda:</strong> APK ligero (~18 MB) con gestor para descargar paquetes de voces localmente.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Web Version Alternative Banner */}
      <section className="py-14 px-4 bg-duo-blue text-white text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <Globe className="w-12 h-12 stroke-[2px] mb-3 text-white/90" />
          <h2 className="text-2xl sm:text-3xl font-black mb-3">
            ¿Quieres probarla ahora mismo en tu navegador?
          </h2>
          <p className="text-xs sm:text-sm font-bold text-white/90 max-w-xl mb-6">
            NihonGo! cuenta con una versión web 100% interactiva que corre directamente en Chrome, Safari, Firefox o Edge sin necesidad de instalar nada.
          </p>
          <button
            onClick={onEnterApp}
            className="py-3.5 px-8 rounded-2xl bg-white text-duo-blue hover:bg-gray-100 font-black text-sm uppercase tracking-wider shadow-lg active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-duo-blue" />
            <span>Abrir NihonGo! en el Navegador</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#131f24] border-t border-gray-200 dark:border-[#283842] py-10 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-black text-gray-800 dark:text-gray-100">NihonGo! (日本語) • Versión {APP_VERSION}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Basado en el currículum de <em>GENKI: An Integrated Course in Elementary Japanese</em> (The Japan Times).
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onEnterApp}
              className="text-duo-green hover:underline font-black cursor-pointer"
            >
              Versión Web
            </button>
            <button
              onClick={handleDownloadApk}
              className="text-duo-blue hover:underline font-black cursor-pointer"
            >
              Descargar APK
            </button>
            <a
              href="https://github.com/joestark96/nihonGo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 font-black"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
