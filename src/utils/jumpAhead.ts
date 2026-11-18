import { Unit, LessonNode, Exercise } from '../types';

export interface JumpAheadLessonNode extends LessonNode {
  targetUnitId: number;
  targetNodeId?: string;
  skippedNodeIds: string[];
  skippedUnitsCount: number;
  isMultiUnit: boolean;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Determina si un nodo de lección pertenece al Cuaderno (Workbook)
 */
function isWorkbookNode(node: LessonNode): boolean {
  return node.title.toLowerCase().includes('workbook') || node.id.includes('wb');
}

/**
 * Determina si un nodo de lección ya fue completado/superado por el usuario
 */
export function isLessonNodeCompleted(node: LessonNode): boolean {
  return node.stars > 0;
}

export interface MultiJumpOptions {
  units: Unit[];
  targetUnitId: number;
  targetNodeId?: string;
  mode?: 'textbook' | 'workbook';
}

/**
 * Crea una lección especial de examen para saltar múltiples unidades o lecciones.
 * Recopila ejercicios ÚNICAMENTE de las lecciones no completadas/superadas desde el punto
 * actual del usuario hasta la unidad o lección objetivo seleccionada.
 */
export function createMultiUnitJumpAheadLesson(options: MultiJumpOptions): JumpAheadLessonNode | null {
  const { units, targetUnitId, targetNodeId, mode } = options;

  const targetUnit = units.find(u => u.id === targetUnitId);
  if (!targetUnit) return null;

  const targetNode = targetNodeId
    ? targetUnit.nodes.find(n => n.id === targetNodeId)
    : undefined;

  const effectiveMode: 'textbook' | 'workbook' | undefined =
    mode ?? (targetNode ? (isWorkbookNode(targetNode) ? 'workbook' : 'textbook') : undefined);

  const belongsToTrack = (node: LessonNode) => {
    if (!effectiveMode) return true;
    return effectiveMode === 'workbook' ? isWorkbookNode(node) : !isWorkbookNode(node);
  };

  const uncompletedNodes: LessonNode[] = [];
  const skippedNodeIds: string[] = [];
  const uncompletedUnitsSet = new Set<number>();

  for (const unit of units) {
    const trackNodes = unit.nodes.filter(belongsToTrack);
    if (unit.id < targetUnitId) {
      for (const node of trackNodes) {
        if (!isLessonNodeCompleted(node)) {
          uncompletedNodes.push(node);
          skippedNodeIds.push(node.id);
          uncompletedUnitsSet.add(unit.id);
        }
      }
    } else if (unit.id === targetUnitId) {
      if (targetNodeId) {
        // Saltar hasta un nodo específico dentro de la unidad objetivo
        for (const node of trackNodes) {
          if (node.id === targetNodeId) {
            // Llegamos al nodo destino; este se desbloqueará, no se marca como completado
            break;
          }
          if (!isLessonNodeCompleted(node)) {
            uncompletedNodes.push(node);
            skippedNodeIds.push(node.id);
            uncompletedUnitsSet.add(unit.id);
          }
        }
      } else {
        // Saltar hasta la unidad completa (desbloquear el primer nodo de targetUnit)
        // Si la unidad objetivo ya estaba desbloqueada (ej. salto de la unidad activa),
        // incluimos también sus nodos pendientes para desbloquear la siguiente.
        const isTargetUnitUnlocked = trackNodes.some(n => n.unlocked);
        if (isTargetUnitUnlocked) {
          for (const node of trackNodes) {
            if (!isLessonNodeCompleted(node)) {
              uncompletedNodes.push(node);
              skippedNodeIds.push(node.id);
              uncompletedUnitsSet.add(unit.id);
            }
          }
        }
      }
      break;
    }
  }

  // Solo usar nodos no completados/superados (nunca incluir lecciones ya superadas)
  const fallbackUncompleted = targetUnit.nodes.filter(n => belongsToTrack(n) && !isLessonNodeCompleted(n));
  const sourceNodes = uncompletedNodes.length > 0 ? uncompletedNodes : fallbackUncompleted;
  if (sourceNodes.length === 0) return null;

  // Agrupar ejercicios por unidad para garantizar representatividad equilibrada
  const exercisesByUnit = new Map<number, Exercise[]>();
  sourceNodes.forEach(node => {
    const list = exercisesByUnit.get(node.unitId) || [];
    list.push(...node.exercises);
    exercisesByUnit.set(node.unitId, list);
  });

  const unitIds = Array.from(exercisesByUnit.keys());
  const selectedExercises: Exercise[] = [];

  // Calcular número objetivo de preguntas:
  // 1 unidad: 8-10 preguntas.
  // 2-3 unidades: 12-14 preguntas.
  // 4+ unidades: 16-20 preguntas.
  const targetExerciseCount = Math.min(20, Math.max(8, unitIds.length * 3 + 2));
  const perUnitQuota = Math.max(2, Math.floor(targetExerciseCount / (unitIds.length || 1)));

  // 1. Extraer preguntas balanceadas de cada unidad pendiente
  unitIds.forEach(uId => {
    const unitExercises = exercisesByUnit.get(uId) || [];
    if (unitExercises.length === 0) return;

    const shuffled = shuffle(unitExercises);
    const types = ['listening', 'multiple-choice', 'word-order', 'match-pairs'] as const;

    // Intentar tomar variedad de tipos dentro de esta unidad
    const chosenFromUnit: Exercise[] = [];
    for (const t of types) {
      if (chosenFromUnit.length >= perUnitQuota) break;
      const matching = shuffled.find(e => e.type === t && !chosenFromUnit.some(c => c.id === e.id));
      if (matching) chosenFromUnit.push(matching);
    }

    // Rellenar hasta la cuota si faltaron
    for (const ex of shuffled) {
      if (chosenFromUnit.length >= perUnitQuota) break;
      if (!chosenFromUnit.some(c => c.id === ex.id)) {
        chosenFromUnit.push(ex);
      }
    }

    selectedExercises.push(...chosenFromUnit);
  });

  // 2. Si aún no alcanzamos el total deseado, rellenar de los ejercicios restantes
  if (selectedExercises.length < targetExerciseCount) {
    const allRemaining = sourceNodes
      .flatMap(n => n.exercises)
      .filter(e => !selectedExercises.some(s => s.id === e.id));

    const shuffledRemaining = shuffle(allRemaining);
    selectedExercises.push(...shuffledRemaining.slice(0, targetExerciseCount - selectedExercises.length));
  }

  // 3. Mezclar todas las preguntas finales para que se alternen temas y tipos
  const finalExercises = shuffle(selectedExercises).slice(0, targetExerciseCount);

  // 4. Barajar las opciones en ejercicios de opción múltiple y escucha
  const randomizedExercises: Exercise[] = finalExercises.map(ex => {
    if ((ex.type === 'multiple-choice' || ex.type === 'listening') && ex.options && ex.options.length > 1) {
      return {
        ...ex,
        options: shuffle(ex.options)
      };
    }
    return { ...ex };
  });

  const isMulti = uncompletedUnitsSet.size > 1 || (skippedNodeIds.length > 3);
  const targetLabel = targetNode
    ? `Lección: ${targetNode.title}`
    : targetUnit.title;

  return {
    id: `jump-ahead-multi-${targetUnitId}-${Date.now()}`,
    unitId: targetUnitId,
    lessonNumber: targetUnitId,
    title: isMulti ? `Examen de Salto: Hasta ${targetLabel}` : `Prueba de Salto: ${targetLabel}`,
    japaneseTitle: isMulti ? '飛び級総合テスト (Examen Multilección)' : '飛び級テスト (Examen de Salto)',
    description: isMulti
      ? `Demuestra tu dominio de las lecciones pendientes (${skippedNodeIds.length} lecciones no completadas). Máximo 3 errores permitidos.`
      : 'Demuestra tu dominio de los temas pendientes. Máximo 3 errores permitidos.',
    icon: 'FastForward',
    color: 'orange',
    totalSteps: randomizedExercises.length,
    unlocked: true,
    completedSteps: 0,
    stars: 0,
    exercises: randomizedExercises,
    targetUnitId,
    targetNodeId,
    skippedNodeIds,
    skippedUnitsCount: uncompletedUnitsSet.size,
    isMultiUnit: isMulti
  };
}

/**
 * Mantiene compatibilidad con salto de una sola unidad
 */
export function createJumpAheadLesson(unit: Unit): LessonNode {
  return createMultiUnitJumpAheadLesson({
    units: [unit],
    targetUnitId: unit.id
  }) || {
    id: `jump-ahead-unit-${unit.id}-${Date.now()}`,
    unitId: unit.id,
    lessonNumber: unit.id,
    title: `Prueba de Salto: ${unit.title}`,
    japaneseTitle: '飛び級テスト (Examen de Salto)',
    description: 'Demuestra que dominas todos los temas de esta unidad. Máximo 3 errores permitidos.',
    icon: 'FastForward',
    color: 'orange',
    totalSteps: 8,
    unlocked: true,
    completedSteps: 0,
    stars: 0,
    exercises: []
  };
}
