export interface JapanRegionWord {
  japanese: string;
  reading: string;
  spanish: string;
}

export interface JapanRegionChallenge {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface JapanRegion {
  id: string;
  order: number;
  name: string;
  japanese: string;
  reading: string;
  romaji: string;
  city: string;
  cityJapanese: string;
  stampTitle: string;
  stampEmoji: string;
  accentColor: string;
  /** Coordenadas en el viewBox 0 0 438 516 de @svg-maps/japan */
  pinX: number;
  pinY: number;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'end' | 'middle';
  prefectureIds: string[];
  summary: string;
  culturalFact: string;
  usefulVocab: JapanRegionWord[];
  challenge: JapanRegionChallenge;
}

export const JAPAN_REGIONS: JapanRegion[] = [
  {
    id: 'kanto',
    order: 1,
    name: 'Kantō',
    japanese: '関東・東京',
    reading: 'かんとう・とうきょう',
    romaji: 'Kantou · Toukyou',
    city: 'Tokio',
    cityJapanese: 'とうきょう',
    stampTitle: 'Sello de Shibuya',
    stampEmoji: '🗼',
    accentColor: '#1cb0f6',
    pinX: 315,
    pinY: 269,
    labelX: 344,
    labelY: 274,
    labelAnchor: 'start',
    prefectureIds: ['ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa'],
    summary:
      'Región de Kantō (ciudad principal: Tokio). Es el centro político, tecnológico y pop de Japón, donde conviven Shibuya y los templos de Asakusa.',
    culturalFact:
      'La estación de Shinjuku es la más transitada del mundo, con más de 3.5 millones de pasajeros diarios.',
    usefulVocab: [
      { japanese: '東京', reading: 'とうきょう', spanish: 'Tokio' },
      { japanese: '駅', reading: 'えき', spanish: 'Estación de tren' },
      { japanese: '電車', reading: 'でんしゃ', spanish: 'Tren' }
    ],
    challenge: {
      prompt: 'Si quieres preguntar dónde está la estación en Tokio, ¿qué palabra significa "estación"?',
      options: ['でんしゃ (densha)', 'えき (eki)', 'くうこう (kuukou)', 'ちず (chizu)'],
      correctIndex: 1,
      explanation: '「えき」(駅) significa estación de tren. Ej: 「とうきょうえき」 (Estación de Tokio).'
    }
  },
  {
    id: 'chubu',
    order: 2,
    name: 'Chūbu',
    japanese: '中部・富士山',
    reading: 'ちゅうぶ・ふじさん',
    romaji: 'Chuubu · Fujisan',
    city: 'Monte Fuji / Nagoya',
    cityJapanese: 'ふじさん',
    stampTitle: 'Sello del Monte Fuji',
    stampEmoji: '🗻',
    accentColor: '#58cc02',
    pinX: 277,
    pinY: 234,
    labelX: 258,
    labelY: 205,
    labelAnchor: 'end',
    prefectureIds: ['niigata', 'toyama', 'ishikawa', 'fukui', 'yamanashi', 'nagano', 'gifu', 'shizuoka', 'aichi'],
    summary:
      'Región central de Honshū (Monte Fuji y Nagoya). Hogar de los Alpes Japoneses y del icónico Monte Fuji (3,776 m).',
    culturalFact:
      'En japonés, al Monte Fuji se le llama con respeto "Fujisan" (ふじさん), nunca "Fujiyama".',
    usefulVocab: [
      { japanese: '富士山', reading: 'ふじさん', spanish: 'Monte Fuji' },
      { japanese: '山', reading: 'やま', spanish: 'Montaña' },
      { japanese: 'きれい', reading: 'きれい', spanish: 'Hermoso / Limpio' }
    ],
    challenge: {
      prompt: '¿Cómo se dice "El Monte Fuji es hermoso" en japonés?',
      options: [
        'ふじさんは きれいです。',
        'ふじさんは たべます。',
        'ふじさんに いきます。',
        'ふじさんを のみます。'
      ],
      correctIndex: 0,
      explanation: '「きれい」(kirei) es un adjetivo-na que significa hermoso o limpio: 「ふじさんは きれいです」.'
    }
  },
  {
    id: 'kansai',
    order: 3,
    name: 'Kansai',
    japanese: '関西・京都・大阪',
    reading: 'かんさい・きょうと・おおさか',
    romaji: 'Kansai · Kyouto · Oosaka',
    city: 'Kioto y Osaka',
    cityJapanese: 'きょうと・おおさか',
    stampTitle: 'Sello Torii de Kioto',
    stampEmoji: '⛩️',
    accentColor: '#ce82ff',
    pinX: 235,
    pinY: 281,
    labelX: 232,
    labelY: 325,
    labelAnchor: 'start',
    prefectureIds: ['mie', 'shiga', 'kyoto', 'osaka', 'hyogo', 'nara', 'wakayama'],
    summary:
      'Región de Kansai (Kioto y Osaka). Combina la antigua capital imperial llena de templos con la capital gastronómica de Japón.',
    culturalFact:
      'En Kansai se habla el dialecto Kansai-ben: en lugar de "arigatou", mucha gente dice "¡Ookini!" (おおきに).',
    usefulVocab: [
      { japanese: '京都', reading: 'きょうと', spanish: 'Kioto' },
      { japanese: 'お寺', reading: 'おてら', spanish: 'Templo budista' },
      { japanese: 'おいしい', reading: 'おいしい', spanish: 'Delicioso' }
    ],
    challenge: {
      prompt: '¿Qué palabra usas en Osaka para decir que el takoyaki está "delicioso"?',
      options: ['さむい (samui)', 'むずかしい (muzukashii)', 'おいしい (oishii)', 'おおきい (ookii)'],
      correctIndex: 2,
      explanation: '「おいしい」(oishii) significa delicioso o rico.'
    }
  },
  {
    id: 'hokkaido',
    order: 4,
    name: 'Hokkaidō',
    japanese: '北海道・札幌',
    reading: 'ほっかいどう・さっぽろ',
    romaji: 'Hokkaidou · Sapporo',
    city: 'Sapporo',
    cityJapanese: 'さっぽろ',
    stampTitle: 'Sello de Nieve',
    stampEmoji: '❄️',
    accentColor: '#38bdf8',
    pinX: 374,
    pinY: 56,
    labelX: 318,
    labelY: 58,
    labelAnchor: 'end',
    prefectureIds: ['hokkaido'],
    summary:
      'La gran isla del norte (ciudad principal: Sapporo). Célebre por sus paisajes nevados, el Festival de Nieve y el miso ramen.',
    culturalFact:
      'Hokkaidō fue habitada originalmente por el pueblo indígena Ainu, del cual provienen muchos nombres como Sapporo.',
    usefulVocab: [
      { japanese: '雪', reading: 'ゆき', spanish: 'Nieve' },
      { japanese: '寒い', reading: 'さむい', spanish: 'Frío (clima)' },
      { japanese: 'ラーメン', reading: 'らーめん', spanish: 'Ramen' }
    ],
    challenge: {
      prompt: 'En invierno en Hokkaidō hace mucho frío. ¿Qué adjetivo describe el clima frío?',
      options: ['あつい (atsui)', 'さむい (samui)', 'あたらしい (atarashii)', 'やすい (yasui)'],
      correctIndex: 1,
      explanation: '「さむい」(samui) se usa para el clima/ambiente frío.'
    }
  },
  {
    id: 'tohoku',
    order: 5,
    name: 'Tōhoku',
    japanese: '東北・仙台',
    reading: 'とうほく・せんだい',
    romaji: 'Touhoku · Sendai',
    city: 'Sendai',
    cityJapanese: 'せんだい',
    stampTitle: 'Sello Tanabata',
    stampEmoji: '🎋',
    accentColor: '#10b981',
    pinX: 335,
    pinY: 168,
    labelX: 358,
    labelY: 172,
    labelAnchor: 'start',
    prefectureIds: ['aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima'],
    summary:
      'Región noreste de Honshū (ciudad principal: Sendai). Famosa por sus aguas termales (onsen), naturaleza y festivales de verano.',
    culturalFact:
      'En el Festival Tanabata de Sendai las calles se llenan de enormes adornos de papel colorido colgando de bambú.',
    usefulVocab: [
      { japanese: 'お祭り', reading: 'おまつり', spanish: 'Festival' },
      { japanese: '温泉', reading: 'おんせん', spanish: 'Aguas termales' },
      { japanese: '自然', reading: 'しぜん', spanish: 'Naturaleza' }
    ],
    challenge: {
      prompt: '¿Qué palabra japonesa significa "aguas termales"?',
      options: ['おんせん (onsen)', 'おまつり (omatsuri)', 'としょかん (toshokan)', 'ぎんこう (ginkou)'],
      correctIndex: 0,
      explanation: '「おんせん」(温泉) son los baños de aguas termales tradicionales de Japón.'
    }
  },
  {
    id: 'chugoku',
    order: 6,
    name: 'Chūgoku',
    japanese: '中国地方・広島',
    reading: 'ちゅうごくちほう・ひろしま',
    romaji: 'Chuugoku · Hiroshima',
    city: 'Hiroshima',
    cityJapanese: 'ひろしま',
    stampTitle: 'Sello de Miyajima',
    stampEmoji: '🕊️',
    accentColor: '#f59e0b',
    pinX: 178,
    pinY: 255,
    labelX: 154,
    labelY: 235,
    labelAnchor: 'end',
    prefectureIds: ['tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi'],
    summary:
      'Oeste de Honshū (ciudad principal: Hiroshima). Hogar del Parque Memorial de la Paz y la isla sagrada de Miyajima.',
    culturalFact:
      'En Miyajima hay ciervos que caminan libremente junto al mar frente al famoso torii flotante de Itsukushima.',
    usefulVocab: [
      { japanese: '平和', reading: 'へいわ', spanish: 'Paz' },
      { japanese: '島', reading: 'しま', spanish: 'Isla' },
      { japanese: '船', reading: 'ふね', spanish: 'Barco / Ferry' }
    ],
    challenge: {
      prompt: 'Para cruzar a la isla de Miyajima tomas un ferry. ¿Qué palabra significa "barco"?',
      options: ['くるま (kuruma)', 'ふね (fune)', 'ひこうき (hikouki)', 'じてんしゃ (jitensha)'],
      correctIndex: 1,
      explanation: '「ふね」(船) significa barco o embarcación.'
    }
  },
  {
    id: 'shikoku',
    order: 7,
    name: 'Shikoku',
    japanese: '四国・松山',
    reading: 'しこく・まつやま',
    romaji: 'Shikoku · Matsuyama',
    city: 'Matsuyama / Takamatsu',
    cityJapanese: 'まつやま',
    stampTitle: 'Sello de los 88 Templos',
    stampEmoji: '🪷',
    accentColor: '#f97316',
    pinX: 192,
    pinY: 306,
    labelX: 192,
    labelY: 342,
    labelAnchor: 'middle',
    prefectureIds: ['tokushima', 'kagawa', 'ehime', 'kochi'],
    summary:
      'La menor de las cuatro islas principales (Matsuyama). Famosa por la peregrinación de 88 templos y los fideos Sanuki Udon.',
    culturalFact:
      'Dōgo Onsen en Matsuyama tiene más de 3,000 años de historia e inspiró los baños de "El viaje de Chihiro".',
    usefulVocab: [
      { japanese: 'うどん', reading: 'うどん', spanish: 'Fideos udon' },
      { japanese: '歩く', reading: 'あるく', spanish: 'Caminar' },
      { japanese: '古い', reading: 'ふるい', spanish: 'Antiguo / Viejo' }
    ],
    challenge: {
      prompt: 'Si quieres describir un templo antiguo en Shikoku, ¿qué adjetivo significa "antiguo / viejo (para cosas)"?',
      options: ['ふるい (furui)', 'わかい (wakai)', 'はやい (hayai)', 'あまい (amai)'],
      correctIndex: 0,
      explanation: '「ふるい」(古い) significa antiguo o viejo para objetos y lugares.'
    }
  },
  {
    id: 'kyushu',
    order: 8,
    name: 'Kyūshū y Okinawa',
    japanese: '九州・沖縄',
    reading: 'きゅうしゅう・おきなわ',
    romaji: 'Kyuushuu · Okinawa',
    city: 'Fukuoka y Naha',
    cityJapanese: 'ふくおか・なは',
    stampTitle: 'Sello Tropical',
    stampEmoji: '🌺',
    accentColor: '#ec4899',
    pinX: 132,
    pinY: 331,
    labelX: 96,
    labelY: 335,
    labelAnchor: 'end',
    prefectureIds: ['fukuoka', 'saga', 'nagasaki', 'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa'],
    summary:
      'El sur de Japón (Fukuoka y Okinawa). Volcanes activos y tonkotsu ramen en Kyūshū, más las playas coralinas de Okinawa.',
    culturalFact:
      'En Okinawa el saludo tradicional no es "konnichiwa", sino "Haisai!" (hombres) o "Haitai!" (mujeres).',
    usefulVocab: [
      { japanese: '海', reading: 'うみ', spanish: 'Mar / Océano' },
      { japanese: '暑い', reading: 'あつい', spanish: 'Caluroso (clima)' },
      { japanese: '飛行機', reading: 'ひこうき', spanish: 'Avión' }
    ],
    challenge: {
      prompt: 'Para viajar de Tokio a Okinawa normalmente vas en avión. ¿Cómo se dice "Voy en avión"?',
      options: [
        'ひこうきで いきます。',
        'ひこうきを みます。',
        'うみに のみます。',
        'あつい ですか。'
      ],
      correctIndex: 0,
      explanation: 'La partícula 「で」 indica el medio de transporte: 「ひこうきで いきます」(Voy en avión).'
    }
  }
];
