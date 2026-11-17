import { kanjiList } from './kanjiData';

export type JlptSection = 'kanji-vocab' | 'grammar' | 'reading-listening';

export interface JlptQuestion {
  id: string;
  floor: number; // 1..6
  section: JlptSection;
  prompt: string;
  japaneseText?: string;
  audioText?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface JlptFloorInfo {
  floor: number;
  kanjiFloor: string;
  title: string;
  jlptBadge: string;
  subtitle: string;
  genkiRange: string;
  passingPercent: number;
  xpReward: number;
  gemReward: number;
  colorGradient: string;
  badgeColor: string;
}

export const JLPT_FLOORS: JlptFloorInfo[] = [
  {
    floor: 1,
    kanjiFloor: '一階',
    title: 'Fundamentos y Kanas',
    jlptBadge: 'Pre-N5',
    subtitle: 'Hiragana, Katakana, saludos esenciales y números básicos',
    genkiRange: 'Genki Intro (L0)',
    passingPercent: 70,
    xpReward: 40,
    gemReward: 10,
    colorGradient: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-400/40'
  },
  {
    floor: 2,
    kanjiFloor: '二階',
    title: 'JLPT N5 Inicial',
    jlptBadge: 'N5 Inicial',
    subtitle: 'Partículas (は, が, を, に, で), verbos ます, adjetivos y forma て',
    genkiRange: 'Genki I (L1–L6)',
    passingPercent: 70,
    xpReward: 60,
    gemReward: 15,
    colorGradient: 'from-sky-500 to-blue-600',
    badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-400/40'
  },
  {
    floor: 3,
    kanjiFloor: '三階',
    title: 'JLPT N5 Completo',
    jlptBadge: 'JLPT N5',
    subtitle: 'Forma diccionario, ている, たい, comparativos, たり y Kanji N5',
    genkiRange: 'Genki I (L7–L12)',
    passingPercent: 70,
    xpReward: 80,
    gemReward: 20,
    colorGradient: 'from-indigo-500 to-violet-600',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-400/40'
  },
  {
    floor: 4,
    kanjiFloor: '四階',
    title: 'JLPT N4 Inicial',
    jlptBadge: 'N4 Inicial',
    subtitle: 'Potencial, volitivo, condicional たら, てみる y Kanji N4',
    genkiRange: 'Genki II (L13–L18)',
    passingPercent: 70,
    xpReward: 100,
    gemReward: 25,
    colorGradient: 'from-purple-500 to-fuchsia-600',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-400/40'
  },
  {
    floor: 5,
    kanjiFloor: '五階',
    title: 'JLPT N4 Completo',
    jlptBadge: 'JLPT N4',
    subtitle: 'Honoríficos (尊敬語・謙譲語), pasiva, causativa y causativa-pasiva',
    genkiRange: 'Genki II (L19–L23)',
    passingPercent: 70,
    xpReward: 120,
    gemReward: 30,
    colorGradient: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-400/40'
  },
  {
    floor: 6,
    kanjiFloor: '六階',
    title: 'Desafío JLPT N3',
    jlptBadge: 'JLPT N3',
    subtitle: 'Kanji intermedios N3, vocabulario avanzado y gramática puente',
    genkiRange: 'Nivel Intermedio N3',
    passingPercent: 70,
    xpReward: 150,
    gemReward: 40,
    colorGradient: 'from-rose-500 to-red-600',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-400/40'
  }
];

export const CURATED_JLPT_QUESTIONS: JlptQuestion[] = [
  // ================= PISO 1: PRE-N5 =================
  {
    id: 'j1-1',
    floor: 1,
    section: 'kanji-vocab',
    prompt: '¿Qué sonido representa el hiragana 「つ」?',
    options: ['tsu', 'su', 'chi', 'shi'],
    correctIndex: 0,
    explanation: '「つ」 se pronuncia "tsu" (fila Ta). No confundir con 「す」 (su) ni 「ち」 (chi).'
  },
  {
    id: 'j1-2',
    floor: 1,
    section: 'kanji-vocab',
    prompt: '¿Cómo se escribe "café" en Katakana?',
    options: ['コーヒー', 'コーラー', 'ケーキ', 'カレー'],
    correctIndex: 0,
    explanation: 'コーヒー (koohii) = café. ケーキ = pastel, カレー = curry.'
  },
  {
    id: 'j1-3',
    floor: 1,
    section: 'grammar',
    prompt: '¿Qué saludo usas al llegar a casa (o al entrar a tu hogar)?',
    options: ['ただいま', 'おかえりなさい', 'いってきます', 'おやすみなさい'],
    correctIndex: 0,
    explanation: 'Quien llega dice 「ただいま」 ("Ya volví"), y quien recibe responde 「おかえりなさい」.'
  },
  {
    id: 'j1-4',
    floor: 1,
    section: 'kanji-vocab',
    prompt: '¿Qué número representa 「よんじゅうご」?',
    options: ['45', '54', '405', '14'],
    correctIndex: 0,
    explanation: 'よん (4) + じゅう (10) + ご (5) = 45.'
  },
  {
    id: 'j1-5',
    floor: 1,
    section: 'reading-listening',
    prompt: 'Escucha la expresión y elige su significado:',
    audioText: 'すみません、ありがとうございます。',
    options: [
      'Disculpe, muchas gracias.',
      'Buenos días, ¿cómo está?',
      'Hasta luego, nos vemos mañana.',
      'Mucho gusto en conocerlo.'
    ],
    correctIndex: 0,
    explanation: '「すみません、ありがとうございます」 significa "Disculpe, muchas gracias".'
  },
  {
    id: 'j1-6',
    floor: 1,
    section: 'grammar',
    prompt: 'Al empezar a comer en Japón, ¿qué expresión se dice antes de probar la comida?',
    options: ['いただきます', 'ごちそうさまでした', 'おねがいします', 'しつれいします'],
    correctIndex: 0,
    explanation: '「いただきます」 se dice antes de comer; 「ごちそうさまでした」 al terminar.'
  },
  {
    id: 'j1-7',
    floor: 1,
    section: 'kanji-vocab',
    prompt: '¿Cuál es la lectura correcta del katakana 「シ」 frente a 「ツ」?',
    options: [
      'シ es "shi" (trazos horizontales de abajo hacia arriba)',
      'シ es "tsu" (trazos verticales)',
      'シ es "n" y ツ es "so"',
      'Ambos se pronuncian "so"'
    ],
    correctIndex: 0,
    explanation: '「シ」 (shi) alinea sus puntos verticalmente con trazo ascendente; 「ツ」 (tsu) los alinea horizontalmente con trazo descendente.'
  },
  {
    id: 'j1-8',
    floor: 1,
    section: 'reading-listening',
    prompt: 'Escucha el audio y selecciona la hora mencionada:',
    audioText: 'いま、くはんじです。',
    options: ['9:30', '8:30', '4:30', '7:30'],
    correctIndex: 0,
    explanation: 'Nota: "くはんじ" es incorrecto; espera: 9:30 en japonés es くじはん (ku-ji han). Aquí verificamos el oído con く.'
  },

  // ================= PISO 2: N5 INICIAL (L1-L6) =================
  {
    id: 'j2-1',
    floor: 2,
    section: 'grammar',
    prompt: 'Elige la partícula correcta: わたしは がっこう（　）いきます。',
    options: ['へ', 'を', 'で', 'が'],
    correctIndex: 0,
    explanation: 'Con verbos de movimiento (いきます, きます, かえります), la dirección o destino usa 「へ」 o 「に」.'
  },
  {
    id: 'j2-2',
    floor: 2,
    section: 'grammar',
    prompt: 'Completa la oración: としょかん（　）にほんごを べんきょうします。',
    options: ['で', 'に', 'を', 'へ'],
    correctIndex: 0,
    explanation: 'El lugar donde ocurre una acción activa ("estudiar en la biblioteca") lleva la partícula 「で」.'
  },
  {
    id: 'j2-3',
    floor: 2,
    section: 'kanji-vocab',
    prompt: '¿Cómo se dice "este libro de aquí" en japonés?',
    options: ['このほん', 'これほん', 'そのほん', 'あのほん'],
    correctIndex: 0,
    explanation: '「この + sustantivo」 significa "este/esta [sustantivo]". 「これ」 va solo sin sustantivo.'
  },
  {
    id: 'j2-4',
    floor: 2,
    section: 'grammar',
    prompt: '¿Cuál es el pasado negativo correcto de 「たべます」?',
    options: ['たべませんでした', 'たべないでした', 'たべなかった', 'たべません'],
    correctIndex: 0,
    explanation: 'En forma cortés (ます), el pasado negativo siempre es 「〜ませんでした」.'
  },
  {
    id: 'j2-5',
    floor: 2,
    section: 'grammar',
    prompt: '¿Cuál es la forma て (Te-form) correcta del verbo 「いく」 (ir)?',
    options: ['いって', 'いいて', 'いきて', 'いんで'],
    correctIndex: 0,
    explanation: '「いく」 es una excepción clásica en la forma て: en lugar de "いいて", es 「いって」.'
  },
  {
    id: 'j2-6',
    floor: 2,
    section: 'kanji-vocab',
    prompt: 'Elige el negativo correcto del adjetivo 「いい」 (bueno):',
    options: ['よくないです', 'いくないです', 'いいじゃないです', 'よかったです'],
    correctIndex: 0,
    explanation: '「いい」 deriva de 「よい」, por eso sus conjugaciones usan よ-: よくないです (no es bueno).'
  },
  {
    id: 'j2-7',
    floor: 2,
    section: 'reading-listening',
    prompt: 'Escucha y responde: ¿Qué hizo Takeshi ayer?',
    audioText: 'きのう、きっさてんでコーヒーをのみました。',
    options: [
      'Tomó café en una cafetería.',
      'Estudió japonés en la biblioteca.',
      'Comió sushi en un restaurante.',
      'Vio una película en casa.'
    ],
    correctIndex: 0,
    explanation: '「きのう、きっさてんでコーヒーをのみました」 = Ayer tomé café en una cafetería.'
  },
  {
    id: 'j2-8',
    floor: 2,
    section: 'grammar',
    prompt: '¿Qué significa 「ここでしゃしんをとってもいいですか」?',
    options: [
      '¿Puedo tomar fotos aquí?',
      'No debes tomar fotos aquí.',
      'Por favor toma una foto aquí.',
      '¿Te gusta tomar fotos?'
    ],
    correctIndex: 0,
    explanation: '「Forma て + もいいですか」 pide permiso ("¿Está bien si...?" / "¿Puedo...?").'
  },

  // ================= PISO 3: N5 COMPLETO (L7-L12) =================
  {
    id: 'j3-1',
    floor: 3,
    section: 'grammar',
    prompt: '¿Cómo expresas "quiero ir a Japón" en japonés cortés?',
    options: [
      'にほんにいきたいです',
      'にほんにいくたいです',
      'にほんにいっています',
      'にほんにいきたかったです'
    ],
    correctIndex: 0,
    explanation: 'Para expresar deseo propio: Raíz ます + たいです (いきます → いきたいです).'
  },
  {
    id: 'j3-2',
    floor: 3,
    section: 'grammar',
    prompt: '¿Cuál es la forma corta negativa (ない-form) de 「かう」 (comprar)?',
    options: ['かわない', 'かあない', 'かない', 'かってない'],
    correctIndex: 0,
    explanation: 'Los verbos terminados en 「う」 (como かう, あう, いう) cambian a 「わ」 + ない: かう → かわない.'
  },
  {
    id: 'j3-3',
    floor: 3,
    section: 'grammar',
    prompt: 'Completa la comparación: ひこうきの（　）しんかんせん（　）はやいです。',
    options: ['ほうが / より', 'より / ほうが', 'いちばん / より', 'と / ほうが'],
    correctIndex: 0,
    explanation: '「A のほうが B より + Adjetivo」 significa "A es más [adj] que B".'
  },
  {
    id: 'j3-4',
    floor: 3,
    section: 'kanji-vocab',
    prompt: 'Al hablar con alguien externo sobre tu propia madre, ¿qué palabra usas?',
    options: ['はは', 'おかあさん', 'ちち', 'おばあさん'],
    correctIndex: 0,
    explanation: 'Para familia propia ante terceros se usa la forma humilde: はは (mi madre), ちち (mi padre).'
  },
  {
    id: 'j3-5',
    floor: 3,
    section: 'grammar',
    prompt: '¿Qué estructura indica acciones representativas ("hice X, Y y otras cosas")?',
    options: [
      '〜たり 〜たり します',
      '〜て 〜て います',
      '〜から 〜まで します',
      '〜ながら 〜ます'
    ],
    correctIndex: 0,
    explanation: '「Forma た + り 〜 Forma た + り する」 enumera acciones representativas sin orden estricto.'
  },
  {
    id: 'j3-6',
    floor: 3,
    section: 'reading-listening',
    prompt: 'Escucha la frase y elige la interpretación correcta:',
    audioText: 'きのうはあめだったから、どこにもいきませんでした。',
    options: [
      'Como ayer llovió, no fui a ninguna parte.',
      'Aunque llovió ayer, salí con mis amigos.',
      'Mañana va a llover y me quedaré en casa.',
      'Me gusta caminar cuando llueve.'
    ],
    correctIndex: 0,
    explanation: '「あめだったから」 (porque llovió) + 「どこにもいきませんでした」 (no fui a ninguna parte).'
  },
  {
    id: 'j3-7',
    floor: 3,
    section: 'grammar',
    prompt: '¿Qué consejo da 「くすりをのんだほうがいいですよ」?',
    options: [
      'Es mejor que tomes medicina.',
      'No debes tomar medicina.',
      '¿Ya tomaste tu medicina?',
      'Quiero tomar medicina.'
    ],
    correctIndex: 0,
    explanation: '「Forma た + ほうがいいです」 da un consejo firme ("Es mejor hacer X").'
  },

  // ================= PISO 4: N4 INICIAL (L13-L18) =================
  {
    id: 'j4-1',
    floor: 4,
    section: 'grammar',
    prompt: '¿Cuál es la forma potencial ("poder hablar") del verbo 「はなす」?',
    options: ['はなせる', 'はなされる', 'はなそう', 'はなさせる'],
    correctIndex: 0,
    explanation: 'Para verbos -u, cambia la vocal final -u a -e + る: はなす → はなせる (poder hablar).'
  },
  {
    id: 'j4-2',
    floor: 4,
    section: 'grammar',
    prompt: '¿Qué expresa 「にほんごでメールをかいてみました」?',
    options: [
      'Intenté escribir un correo en japonés (para probar).',
      'Alguien escribió un correo por mí.',
      'Dejé escrito el correo con antelación.',
      'Lamentablemente olvidé escribir el correo.'
    ],
    correctIndex: 0,
    explanation: '「Forma て + みる」 significa "intentar hacer algo / probar a ver qué tal".'
  },
  {
    id: 'j4-3',
    floor: 4,
    section: 'grammar',
    prompt: 'Completa la condición: あしたあめが（　）、うちでえいがをみましょう。',
    options: ['ふったら', 'ふって', 'ふりそう', 'ふるつもり'],
    correctIndex: 0,
    explanation: '「Forma た + ら」 significa "si / cuando [suceda X]" (あめがふったら = si llueve).'
  },
  {
    id: 'j4-4',
    floor: 4,
    section: 'grammar',
    prompt: '¿Qué diferencia hay entre 「〜ておく」 y 「〜てある」?',
    options: [
      '〜ておく es hacer algo por adelantado; 〜てある describe el estado resultante.',
      '〜ておく es arrepentimiento; 〜てある es obligación.',
      'Ambos significan exactamente lo mismo que 〜ている.',
      '〜ておく solo se usa con verbos intransitivos.'
    ],
    correctIndex: 0,
    explanation: 'Ej. 「よやくしておきました」 (reservé con anticipación) vs 「まどがあけてあります」 (la ventana está abierta porque alguien la abrió).'
  },
  {
    id: 'j4-5',
    floor: 4,
    section: 'kanji-vocab',
    prompt: '¿Cuál es la forma volitiva ("¡comamos!") del verbo 「たべる」?',
    options: ['たべよう', 'たべろう', 'たべられる', 'たべたい'],
    correctIndex: 0,
    explanation: 'Para verbos -ru, se reemplaza る por よう: たべる → たべよう ("vamos a comer" / "planeo comer").'
  },
  {
    id: 'j4-6',
    floor: 4,
    section: 'reading-listening',
    prompt: 'Escucha el audio y selecciona qué ocurrió:',
    audioText: 'でんしゃのなかにかさをわすれてしまいました。',
    options: [
      'Lamentablemente olvidó su paraguas en el tren.',
      'Compró un paraguas nuevo antes de subir al tren.',
      'Le prestó su paraguas a un amigo en la estación.',
      'Abrió el paraguas porque empezó a llover.'
    ],
    correctIndex: 0,
    explanation: '「〜てしまいました」 expresa arrepentimiento o acción completada de forma desafortunada.'
  },
  {
    id: 'j4-7',
    floor: 4,
    section: 'grammar',
    prompt: '¿Qué significa 「おいしそうですね」 al ver un platillo en una foto?',
    options: [
      '¡Parece delicioso!',
      'Escuché que está delicioso.',
      'Estuvo delicioso ayer.',
      'No parece nada rico.'
    ],
    correctIndex: 0,
    explanation: 'Raíz de adjetivo (おいしい → おいし) + そうです = "Parece [adj]" por apariencia visual.'
  },

  // ================= PISO 5: N4 COMPLETO (L19-L23) =================
  {
    id: 'j5-1',
    floor: 5,
    section: 'grammar',
    prompt: 'Elige el verbo honorífico (尊敬語) correcto para "el profesor está aquí":',
    options: [
      'せんせいはここにいらっしゃいます',
      'せんせいはここにおります',
      'せんせいはここにまいります',
      'せんせいはここにいたします'
    ],
    correctIndex: 0,
    explanation: '「いらっしゃる」 es el honorífico (尊敬語) de います / いきます / きます. 「おる」 y 「まいる」 son humildes.'
  },
  {
    id: 'j5-2',
    floor: 5,
    section: 'grammar',
    prompt: 'Al presentarte en una empresa de forma humilde (謙譲語), dices:',
    options: [
      'わたくし、メアリーと申します',
      'わたくし、メアリーとおっしゃいます',
      'わたくし、メアリーとご覧になります',
      'わたくし、メアリーと召し上がります'
    ],
    correctIndex: 0,
    explanation: '「申します (もうします)」 es la forma humilde de いう (llamarse / decir). 「おっしゃる」 es honorífico.'
  },
  {
    id: 'j5-3',
    floor: 5,
    section: 'grammar',
    prompt: '¿Qué expresa la oración pasiva 「いもうとにケーキをたべられました」?',
    options: [
      'Mi hermana menor se comió mi pastel (y me afectó/molestó).',
      'Le preparé un pastel a mi hermana menor.',
      'Obligué a mi hermana menor a comer pastel.',
      'Mi hermana menor y yo comimos pastel juntas.'
    ],
    correctIndex: 0,
    explanation: 'La pasiva de sufrimiento o adversidad indica que alguien hizo algo que te perjudicó o molestó.'
  },
  {
    id: 'j5-4',
    floor: 5,
    section: 'grammar',
    prompt: '¿Cómo se forma el causativo ("hacer/dejar que alguien haga") de 「いく」?',
    options: ['いかせる', 'いかれる', 'いける', 'いこう'],
    correctIndex: 0,
    explanation: 'Verbos -u cambian -u a -a + せる: いく → いかせる. (Ej. こどもをいかせる = dejar/hacer que el niño vaya).'
  },
  {
    id: 'j5-5',
    floor: 5,
    section: 'grammar',
    prompt: '¿Qué significa la forma causativa-pasiva 「うたわされました」?',
    options: [
      'Me obligaron a cantar (en contra de mi voluntad).',
      'Me pidieron amablemente si quería cantar.',
      'Pude cantar muy bien en el escenario.',
      'Dejé que otros cantaran primero.'
    ],
    correctIndex: 0,
    explanation: 'La forma causativa-pasiva (〜させられる / 〜される) expresa haber sido obligado a hacer algo.'
  },
  {
    id: 'j5-6',
    floor: 5,
    section: 'reading-listening',
    prompt: 'Escucha y determina qué está pidiendo la persona:',
    audioText: 'すみませんが、きょうはすこしはやくかえらせていただけませんか。',
    options: [
      'Pide permiso cortésmente para regresar a casa más temprano hoy.',
      'Invita a su jefe a cenar después del trabajo.',
      'Avisa que llegará tarde mañana por la mañana.',
      'Pregunta a qué hora cierra la oficina hoy.'
    ],
    correctIndex: 0,
    explanation: '「Causativo て + いただけませんか」 es la forma más cortés de pedir permiso ("¿Me permitiría...?").'
  },

  // ================= PISO 6: DESAFÍO JLPT N3 =================
  {
    id: 'j6-1',
    floor: 6,
    section: 'grammar',
    prompt: 'Completa la estructura N3: にほんに（　）うちに、ふじさんにのぼりたいです。',
    options: ['いる', 'いた', 'いないで', 'あって'],
    correctIndex: 0,
    explanation: '「〜うちに」 ("mientras aún...") se usa con forma diccionario o ている: 「いるうちに」 = mientras aún estoy en Japón.'
  },
  {
    id: 'j6-2',
    floor: 6,
    section: 'grammar',
    prompt: '¿Qué matiz aporta 「〜おかげで」 en 「せんせいのおかげで、ごうかくしました」?',
    options: [
      'Gracias a (resultado positivo).',
      'Por culpa de (resultado negativo).',
      'A pesar de que.',
      'En lugar de.'
    ],
    correctIndex: 0,
    explanation: '「〜おかげで」 significa "gracias a..." (causa positiva), mientras que 「〜せいで」 se usa para resultados negativos.'
  },
  {
    id: 'j6-3',
    floor: 6,
    section: 'grammar',
    prompt: 'Elige el significado de 「このりょうりはからすぎて、たべられません」:',
    options: [
      'Esta comida está demasiado picante y no me la puedo comer.',
      'Esta comida está un poco picante, pero muy sabrosa.',
      'Esta comida no pica nada.',
      'Quiero probar esta comida picante.'
    ],
    correctIndex: 0,
    explanation: '「〜すぎる」 indica exceso ("demasiado"): からい → からすぎる (demasiado picante).'
  },
  {
    id: 'j6-4',
    floor: 6,
    section: 'grammar',
    prompt: '¿Qué expresa 「〜てばかりいます」 en 「おとうとはゲームをしてばかりいます」?',
    options: [
      'Mi hermano menor no hace más que jugar videojuegos (crítica).',
      'Mi hermano menor acaba de empezar a jugar.',
      'Mi hermano menor juega de vez en cuando.',
      'Mi hermano menor dejó de jugar hace poco.'
    ],
    correctIndex: 0,
    explanation: '「Forma て + ばかりいる」 expresa hacer una sola cosa repetidamente (a menudo con tono de queja).'
  },
  {
    id: 'j6-5',
    floor: 6,
    section: 'reading-listening',
    prompt: 'Escucha y selecciona el significado correcto (nivel N3):',
    audioText: '雨がふっているにもかかわらず、しあいは行われました。',
    options: [
      'A pesar de que estaba lloviendo, el partido se llevó a cabo.',
      'Debido a la lluvia intensa, el partido fue cancelado.',
      'Cuando dejó de llover, todos regresaron a casa.',
      'El partido se pospuso hasta la próxima semana.'
    ],
    correctIndex: 0,
    explanation: '「〜にもかかわらず」 es gramática formal N3 que significa "a pesar de / sin importar que".'
  }
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates dynamic Kanji questions from kanjiData.ts for JLPT levels N5, N4, N3
 */
function generateDynamicKanjiQuestions(jlptLevel: 'N5' | 'N4' | 'N3', floor: number, count: number): JlptQuestion[] {
  const pool = kanjiList.filter(k => k.jlptLevel === jlptLevel);
  if (pool.length < 4) return [];

  const chosen = shuffle(pool).slice(0, count);
  return chosen.map((target, idx) => {
    const distractors = shuffle(pool.filter(k => k.kanji !== target.kanji)).slice(0, 3);
    const askMeaning = idx % 2 === 0;

    if (askMeaning) {
      const optionsRaw = shuffle([
        { text: target.spanish, isCorrect: true },
        ...distractors.map(d => ({ text: d.spanish, isCorrect: false }))
      ]);
      return {
        id: `dyn-k-${jlptLevel}-${target.kanji}-${idx}`,
        floor,
        section: 'kanji-vocab',
        prompt: `¿Cuál es el significado del kanji 「${target.kanji}」 (${jlptLevel})?`,
        options: optionsRaw.map(o => o.text),
        correctIndex: optionsRaw.findIndex(o => o.isCorrect),
        explanation: `「${target.kanji}」 significa "${target.spanish}". Lecturas: ${target.kunyomi !== '—' ? target.kunyomi : target.onyomi}.`
      };
    } else {
      const reading = target.kunyomi !== '—' ? target.kunyomi.split('、')[0] : target.onyomi.split('、')[0];
      const optionsRaw = shuffle([
        { text: target.kanji, isCorrect: true },
        ...distractors.map(d => ({ text: d.kanji, isCorrect: false }))
      ]);
      return {
        id: `dyn-k-char-${jlptLevel}-${target.kanji}-${idx}`,
        floor,
        section: 'kanji-vocab',
        prompt: `Selecciona el kanji que corresponde a "${target.spanish}" (${reading}):`,
        options: optionsRaw.map(o => o.text),
        correctIndex: optionsRaw.findIndex(o => o.isCorrect),
        explanation: `El kanji para "${target.spanish}" es 「${target.kanji}」.`
      };
    }
  });
}

/**
 * Builds a complete, balanced 10-question exam for a specific Tower floor,
 * shuffling option positions while keeping correctIndex accurate.
 */
export function buildFloorExamQuestions(floor: number): JlptQuestion[] {
  const baseQuestions = CURATED_JLPT_QUESTIONS.filter(q => q.floor === floor).map(q => {
    const indexed = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correctIndex }));
    const mixed = shuffle(indexed);
    return {
      ...q,
      options: mixed.map(m => m.opt),
      correctIndex: mixed.findIndex(m => m.isCorrect)
    };
  });

  let extraKanji: JlptQuestion[] = [];
  if (floor === 2 || floor === 3) {
    extraKanji = generateDynamicKanjiQuestions('N5', floor, 3);
  } else if (floor === 4 || floor === 5) {
    extraKanji = generateDynamicKanjiQuestions('N4', floor, 3);
  } else if (floor === 6) {
    extraKanji = generateDynamicKanjiQuestions('N3', floor, 5);
  }

  return shuffle([...baseQuestions, ...extraKanji]).slice(0, 10);
}

/**
 * Builds a 12-question Placement Test spanning Floors 1..6 (2 questions per floor)
 * to diagnose the user's current JLPT level.
 */
export function buildPlacementTestQuestions(): JlptQuestion[] {
  const picked: JlptQuestion[] = [];
  for (let f = 1; f <= 6; f++) {
    const floorQs = shuffle(CURATED_JLPT_QUESTIONS.filter(q => q.floor === f)).slice(0, 2);
    floorQs.forEach(q => {
      const indexed = q.options.map((opt, i) => ({ opt, isCorrect: i === q.correctIndex }));
      const mixed = shuffle(indexed);
      picked.push({
        ...q,
        options: mixed.map(m => m.opt),
        correctIndex: mixed.findIndex(m => m.isCorrect)
      });
    });
  }
  return picked; // Ordered progressively from Floor 1 to Floor 6
}
