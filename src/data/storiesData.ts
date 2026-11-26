export interface StoryParagraph {
  japanese: string;
  kanaOnly: string;
  romaji: string;
  spanish: string;
  audioText: string;
}

export interface StoryQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GradedStory {
  id: string;
  level: number;
  difficultyLabel: 'Muy Fácil' | 'Fácil' | 'Medio' | 'Avanzado';
  jlptTag: string;
  title: string;
  japaneseTitle: string;
  romajiTitle: string;
  emoji: string;
  estimatedMinutes: number;
  summary: string;
  paragraphs: StoryParagraph[];
  questions: StoryQuestion[];
}

export const GRADED_STORIES: GradedStory[] = [
  {
    id: 'story-1-tama',
    level: 1,
    difficultyLabel: 'Muy Fácil',
    jlptTag: 'N5 · Básico',
    title: 'El gato Tama',
    japaneseTitle: '猫のたま',
    romajiTitle: 'Neko no Tama',
    emoji: '🐱',
    estimatedMinutes: 2,
    summary: 'Un cuento cortito sobre un gato blanco que ama el pescado y la leche.',
    paragraphs: [
      {
        japanese: 'これは たま です。白い 猫 です。',
        kanaOnly: 'これは たま です。しろい ねこ です。',
        romaji: 'Kore wa Tama desu. Shiroi neko desu.',
        spanish: 'Este es Tama. Es un gato blanco.',
        audioText: 'これはたまです。しろいねこです。'
      },
      {
        japanese: 'たまは 魚が 好き です。毎日 魚を 食べます。',
        kanaOnly: 'たまは さかなが すき です。まいにち さかなを たべます。',
        romaji: 'Tama wa sakana ga suki desu. Mainichi sakana o tabemasu.',
        spanish: 'A Tama le gusta el pescado. Todos los días come pescado.',
        audioText: 'たまはさかながすきです。まいにちさかなをたべます。'
      },
      {
        japanese: 'お水も 飲みます。そして、よく 寝ます。',
        kanaOnly: 'おみずも のみます。そして、よく ねます。',
        romaji: 'Omizu mo nomimasu. Soshite, yoku nemasu.',
        spanish: 'También bebe agua. Y luego, duerme mucho.',
        audioText: 'おみずものみます。そして、よくねます。'
      }
    ],
    questions: [
      {
        prompt: '¿De qué color es Tama?',
        options: ['Negro (くろい)', 'Blanco (しろい)', 'Azul (あおい)'],
        correctIndex: 1,
        explanation: 'El texto dice 「しろい ねこ です」 (Es un gato blanco).'
      },
      {
        prompt: '¿Qué come Tama todos los días?',
        options: ['Pescado (さかな)', 'Pan (パン)', 'Fruta (くだもの)'],
        correctIndex: 0,
        explanation: '「まいにち さかなを たべます」 significa "Todos los días come pescado".'
      }
    ]
  },
  {
    id: 'story-2-sakura-park',
    level: 2,
    difficultyLabel: 'Muy Fácil',
    jlptTag: 'N5 · Básico',
    title: 'Flores en el parque',
    japaneseTitle: '公園の 花',
    romajiTitle: 'Kouen no Hana',
    emoji: '🌸',
    estimatedMinutes: 2,
    summary: 'Un paseo tranquilo de primavera para ver los cerezos con amigos.',
    paragraphs: [
      {
        japanese: 'きょうは いい 天気 です。とても あたたかい です。',
        kanaOnly: 'きょうは いい てんき です。とても あたたかい です。',
        romaji: 'Kyou wa ii tenki desu. Totemo atatakai desu.',
        spanish: 'Hoy hace buen tiempo. Hace mucho calorcito agradable.',
        audioText: 'きょうはいいてんきです。とてもあたたかいです。'
      },
      {
        japanese: 'わたしは 友だちと 公園へ 行きます。',
        kanaOnly: 'わたしは ともだちと こうえんへ いきます。',
        romaji: 'Watashi wa tomodachi to kouen e ikimasu.',
        spanish: 'Yo voy al parque con mis amigos.',
        audioText: 'わたしはともだちとこうえんへいきます。'
      },
      {
        japanese: '公園に さくらが あります。とても きれい です。',
        kanaOnly: 'こうえんに さくらが あります。とても きれい です。',
        romaji: 'Kouen ni sakura ga arimasu. Totemo kirei desu.',
        spanish: 'En el parque hay flores de cerezo. Son muy hermosas.',
        audioText: 'こうえんにさくらがあります。とてもきれいです。'
      }
    ],
    questions: [
      {
        prompt: '¿Cómo está el clima hoy?',
        options: ['Frío (さむい)', 'Agradable / cálido (あたたかい)', 'Lluvioso'],
        correctIndex: 1,
        explanation: 'Dice 「いい てんき です。とても あたたかい です」.'
      },
      {
        prompt: '¿Qué hay en el parque?',
        options: ['Flores de cerezo (さくら)', 'Una biblioteca', 'Un tren'],
        correctIndex: 0,
        explanation: '「公園に さくらが あります」 (En el parque hay cerezos).'
      }
    ]
  },
  {
    id: 'story-3-fruits',
    level: 3,
    difficultyLabel: 'Muy Fácil',
    jlptTag: 'N5 · Básico',
    title: 'En la tienda de frutas',
    japaneseTitle: 'くだものやさん',
    romajiTitle: 'Kudamonoyasan',
    emoji: '🍎',
    estimatedMinutes: 2,
    summary: 'Práctica de números, precios con 円 (en) y peticiones con ください.',
    paragraphs: [
      {
        japanese: 'ここは 小さい くだものや です。りんごが 五つ あります。',
        kanaOnly: 'ここは ちいさい くだものや です。りんごが いつつ あります。',
        romaji: 'Koko wa chiisai kudamonoya desu. Ringo ga itsutsu arimasu.',
        spanish: 'Aquí es una pequeña frutería. Hay cinco manzanas.',
        audioText: 'ここはちいさいくだものやです。りんごがいつつあります。'
      },
      {
        japanese: 'りんごは 一つ 百円 です。バナナも 安い です。',
        kanaOnly: 'りんごは ひとつ ひゃくえん です。バナナも やすい です。',
        romaji: 'Ringo wa hitotsu hyakuen desu. Banana mo yasui desu.',
        spanish: 'Una manzana cuesta cien yenes. Los plátanos también son baratos.',
        audioText: 'りんごはひとつひゃくえんです。バナナもやすいです。'
      },
      {
        japanese: '「すみません、りんごを 二つ ください。」',
        kanaOnly: '「すみません、りんごを ふたつ ください。」',
        romaji: '"Sumimasen, ringo o futatsu kudasai."',
        spanish: '"Disculpe, deme dos manzanas, por favor."',
        audioText: 'すみません、りんごをふたつください。'
      }
    ],
    questions: [
      {
        prompt: '¿Cuánto cuesta una manzana?',
        options: ['100 yenes (ひゃくえん)', '200 yenes', '500 yenes'],
        correctIndex: 0,
        explanation: '「りんごは ひとつ ひゃくえん です」 (Una manzana cuesta 100 yenes).'
      },
      {
        prompt: '¿Cuántas manzanas pide el cliente?',
        options: ['Una (ひとつ)', 'Dos (ふたつ)', 'Cinco (いつつ)'],
        correctIndex: 1,
        explanation: 'Dice 「りんごを ふたつ ください」 (Deme dos manzanas, por favor).'
      }
    ]
  },
  {
    id: 'story-4-morning',
    level: 4,
    difficultyLabel: 'Fácil',
    jlptTag: 'Genki L3–L4 · N5',
    title: 'Mi mañana',
    japaneseTitle: 'わたしの 朝',
    romajiTitle: 'Watashi no Asa',
    emoji: '🌅',
    estimatedMinutes: 3,
    summary: 'Rutina diaria con horas específicas, partícula に y medios de transporte.',
    paragraphs: [
      {
        japanese: 'わたしは 毎朝 七時に 起きます。',
        kanaOnly: 'わたしは まいあさ しちじに おきます。',
        romaji: 'Watashi wa maiasa shichiji ni okimasu.',
        spanish: 'Yo me levanto todas las mañanas a las siete.',
        audioText: 'わたしはまいあさしちじにおきます。'
      },
      {
        japanese: '朝ごはんに パンと コーヒーを 飲みます。ときどき りんごも 食べます。',
        kanaOnly: 'あさごはんに パンと コーヒーを のみます。ときどき りんごも たべます。',
        romaji: 'Asagohan ni pan to koohii o nomimasu. Tokidoki ringo mo tabemasu.',
        spanish: 'Para el desayuno tomo pan y café. A veces también como una manzana.',
        audioText: 'あさごはんにパンとコーヒーをのみます。ときどきりんごもたべます。'
      },
      {
        japanese: '八時半に バスで 大学へ 行きます。日本語の クラスは 九時からです。',
        kanaOnly: 'はちじはんに バスで だいがくへ いきます。にほんごの クラスは くじからです。',
        romaji: 'Hachiji han ni basu de daigaku e ikimasu. Nihongo no kurasu wa kuji kara desu.',
        spanish: 'A las ocho y media voy en autobús a la universidad. La clase de japonés es desde las nueve.',
        audioText: 'はちじはんにバスでだいがくへいきます。にほんごのクラスはくじからです。'
      }
    ],
    questions: [
      {
        prompt: '¿Cómo va el protagonista a la universidad?',
        options: ['En tren (でんしゃ)', 'En autobús (バス)', 'Caminando (あるいて)'],
        correctIndex: 1,
        explanation: 'Dice 「バスで だいがくへ いきます」 (Voy en autobús a la universidad).'
      },
      {
        prompt: '¿A qué hora empieza la clase de japonés?',
        options: ['A las 7:00', 'A las 8:30', 'A las 9:00'],
        correctIndex: 2,
        explanation: '「にほんごの クラスは くじからです」 (La clase de japonés es desde las nueve).'
      }
    ]
  },
  {
    id: 'story-5-library',
    level: 5,
    difficultyLabel: 'Fácil',
    jlptTag: 'Genki L4 · N5',
    title: 'La biblioteca tranquila',
    japaneseTitle: '静かな 図書館',
    romajiTitle: 'Shizuka na Toshokan',
    emoji: '📚',
    estimatedMinutes: 3,
    summary: 'Práctica de verbos de existencia (います / あります) y ubicaciones.',
    paragraphs: [
      {
        japanese: '大学の となりに 大きい 図書館が あります。',
        kanaOnly: 'だいがくの となりに おおきい としょかんが あります。',
        romaji: 'Daigaku no tonari ni ookii toshokan ga arimasu.',
        spanish: 'Al lado de la universidad hay una biblioteca grande.',
        audioText: 'だいがくのとなりにookiiとしょかんがあります。'.replace('ookii', 'おおきい')
      },
      {
        japanese: '図書館の 中は とても 静かです。学生が たくさん います。',
        kanaOnly: 'としょかんの なかは とても しずかです。がくせいが たくさん います。',
        romaji: 'Toshokan no naka wa totemo shizuka desu. Gakusei ga takusan imasu.',
        spanish: 'Dentro de la biblioteca está muy tranquilo. Hay muchos estudiantes.',
        audioText: 'としょかんのなかはとてもしずかです。がくせいがたくさんいます。'
      },
      {
        japanese: 'わたしは いすの 上に かばんを おいて、二時間 勉強しました。',
        kanaOnly: 'わたしは いすの うえに かばんを おいて、にじかん べんきょうしました。',
        romaji: 'Watashi wa isu no ue ni kaban o oite, nijikan benkyou shimashita.',
        spanish: 'Puse mi mochila sobre la silla y estudié dos horas.',
        audioText: 'わたしはいすのうえにかばんをおいて、にじかんべんきょうしました。'
      }
    ],
    questions: [
      {
        prompt: '¿Dónde está la biblioteca?',
        options: ['Al lado de la universidad (大学の となり)', 'Lejos de la estación', 'Detrás del hospital'],
        correctIndex: 0,
        explanation: '「大学の となりに 大きい 図書館が あります」.'
      },
      {
        prompt: '¿Cuánto tiempo estudió el protagonista?',
        options: ['1 hora', '2 horas (にじかん)', '3 horas'],
        correctIndex: 1,
        explanation: '「二時間 (にじかん) 勉強しました」 (Estudié dos horas).'
      }
    ]
  },
  {
    id: 'story-6-konbini',
    level: 6,
    difficultyLabel: 'Fácil',
    jlptTag: 'Vida Diaria · N5',
    title: 'De noche en el Konbini',
    japaneseTitle: '夜の コンビニ',
    romajiTitle: 'Yoru no Konbini',
    emoji: '🏪',
    estimatedMinutes: 3,
    summary: 'Un clásico japonés: comprar onigiri y té caliente en la tienda 24 horas.',
    paragraphs: [
      {
        japanese: '夜 十時に おなかが すきました。だから、近くの コンビニへ 行きました。',
        kanaOnly: 'よる じゅうじに おなかが すきました。だから、ちかくの コンビニへ いきました。',
        romaji: 'Yoru juuji ni onaka ga sukimashita. Dakara, chikaku no konbini e ikimashita.',
        spanish: 'A las diez de la noche me dio hambre. Por eso, fui al konbini cercano.',
        audioText: 'よるじゅうじにおなかがすきました。だから、ちかくのコンビニへいきました。'
      },
      {
        japanese: 'さけの おにぎりと あたたかい お茶を かいました。',
        kanaOnly: 'さけの おにぎりと あたたかい おちゃを かいました。',
        romaji: 'Sake no onigiri to atatakai ocha o kaimashita.',
        spanish: 'Compré un onigiri de salmón y un té verde calientito.',
        audioText: 'さけのおにぎりとあたたかいおちゃをかいました。'
      },
      {
        japanese: '店員さんは 「ありがとうございました」と 元気に 言いました。',
        kanaOnly: 'てんいんさんは 「ありがとうございました」と げんきに いいました。',
        romaji: 'Teninsan wa "Arigatou gozaimashita" to genki ni iimashita.',
        spanish: 'El empleado dijo "¡Muchas gracias!" con mucha energía.',
        audioText: 'てんいんさんはありがとうございましたとげんきにいいました。'
      }
    ],
    questions: [
      {
        prompt: '¿Por qué fue al konbini a las 10 de la noche?',
        options: ['Porque tenía hambre (おなかが すきました)', 'Porque perdió su llave', 'Para estudiar'],
        correctIndex: 0,
        explanation: '「おなかが すきました」 significa "Me dio hambre".'
      },
      {
        prompt: '¿Qué compró para beber?',
        options: ['Café frío', 'Té calientito (あたたかい お茶)', 'Jugo de naranja'],
        correctIndex: 1,
        explanation: 'Compró 「あたたかい おちゃ」 (té calientito).'
      }
    ]
  },
  {
    id: 'story-7-tokyo-train',
    level: 7,
    difficultyLabel: 'Medio',
    jlptTag: 'Genki L5–L7 · N5',
    title: 'Un domingo en Tokio',
    japaneseTitle: '東京の 日曜日',
    romajiTitle: 'Toukyou no Nichiyoubi',
    emoji: '🚆',
    estimatedMinutes: 3,
    summary: 'Mary y Takeshi pasean por Shibuya y buscan un restaurante tranquilo.',
    paragraphs: [
      {
        japanese: '昨日は 日曜日でした。メアリーさんと たけしさんは 東京へ 行きました。',
        kanaOnly: 'きのうは にちようびでした。メアリーさんと たけしさんは とうきょうへ いきました。',
        romaji: 'Kinou wa nichiyoubi deshita. Mearii-san to Takeshi-san wa Toukyou e ikimashita.',
        spanish: 'Ayer fue domingo. Mary y Takeshi fueron a Tokio.',
        audioText: 'きのうはにちようびでした。メアリーさんとたけしさんはとうきょうへいきました。'
      },
      {
        japanese: '渋谷の 駅は とても にぎやかでした。二人は デパートで おみやげを 買いました。',
        kanaOnly: 'しぶやの えきは とても にぎやかでした。ふたりは デパートで おみやげを かいました。',
        romaji: 'Shibuya no eki wa totemo nigiyaka deshita. Futari wa depaato de omiyage o kaimashita.',
        spanish: 'La estación de Shibuya estaba muy animada. Los dos compraron recuerdos en la tienda departamental.',
        audioText: 'しぶやのえきはとてもにぎやかでした。ふたりはデパートでおみやげをかいました。'
      },
      {
        japanese: 'それから、小さい レストランで おいしい ラーメンを 食べました。とても 楽しかったです。',
        kanaOnly: 'それから、ちいさい レストランで おいしい ラーメンを たべました。とても たのしかったです。',
        romaji: 'Sorekara, chiisai resutoran de oishii raamen o tabemashita. Totemo tanoshikatta desu.',
        spanish: 'Después, comieron un ramen delicioso en un restaurante pequeño. Fue muy divertido.',
        audioText: 'それから、ちいさいレストランでおいしいラーメンをたべました。とてもたのしかったです。'
      }
    ],
    questions: [
      {
        prompt: '¿Qué compraron en la tienda departamental?',
        options: ['Ropa nueva', 'Recuerdos (おみやげ)', 'Boletos de cine'],
        correctIndex: 1,
        explanation: '「デパートで おみやげを 買いました」 (Compraron recuerdos).'
      },
      {
        prompt: '¿Cómo estaba la estación de Shibuya?',
        options: ['Muy animada (とても にぎやか)', 'Muy silenciosa', 'Muy fría'],
        correctIndex: 0,
        explanation: '「とても にぎやかでした」 significa "estaba muy animada".'
      }
    ]
  },
  {
    id: 'story-8-kyoto-trip',
    level: 8,
    difficultyLabel: 'Medio',
    jlptTag: 'Genki L8–L10 · N5/N4',
    title: 'Viaje en Shinkansen a Kioto',
    japaneseTitle: '新幹線で 京都へ',
    romajiTitle: 'Shinkansen de Kyouto e',
    emoji: '🚅',
    estimatedMinutes: 4,
    summary: 'Un viaje en tren bala con comparaciones y deseos (〜たいです).',
    paragraphs: [
      {
        japanese: '来週の 土曜日に 友だちと 京都へ 旅行する つもりです。',
        kanaOnly: 'らいしゅうの どようびに ともだちと きょうとへ りょこうする つもりです。',
        romaji: 'Raishuu no doyoubi ni tomodachi to Kyouto e ryokou suru tsumori desu.',
        spanish: 'El próximo sábado planeo viajar a Kioto con un amigo.',
        audioText: 'らいしゅうのどようびにともだちときょうとへりょこうするつもりです。'
      },
      {
        japanese: '東京から 京都まで 新幹線は バスより ずっと 速くて べんりです。',
        kanaOnly: 'とうきょうから きょうとまで しんかんせんは バスより ずっと はやくて べんりです。',
        romaji: 'Toukyou kara Kyouto made shinkansen wa basu yori zutto hayakute benri desu.',
        spanish: 'De Tokio a Kioto, el Shinkansen es mucho más rápido y conveniente que el autobús.',
        audioText: 'とうきょうからきょうとまでしんかんせんはバスよりずっとはやくてべんりです。'
      },
      {
        japanese: '京都で 古い お寺を 見たり、まっちゃの アイスを 食べたり したいです。',
        kanaOnly: 'きょうとで ふるい おてらを みたり、まっちゃの アイスを たべたり したいです。',
        romaji: 'Kyouto de furui otera o mitari, maccha no aisu o tabetari shitai desu.',
        spanish: 'En Kioto quiero ver templos antiguos, comer helado de matcha y cosas así.',
        audioText: 'きょうとでふるいおてらをみたり、まっちゃのアイスをたべたりしたいです。'
      }
    ],
    questions: [
      {
        prompt: '¿Por qué prefieren el Shinkansen al autobús?',
        options: ['Es más barato', 'Es mucho más rápido y conveniente (速くて べんり)', 'Es más lento'],
        correctIndex: 1,
        explanation: '「バスより ずっと 速くて べんりです」.'
      },
      {
        prompt: '¿Qué quiere comer en Kioto?',
        options: ['Helado de matcha (まっちゃの アイス)', 'Takoyaki', 'Sushi'],
        correctIndex: 0,
        explanation: '「まっちゃの アイスを 食べたり したいです」.'
      }
    ]
  },
  {
    id: 'story-9-momotaro',
    level: 9,
    difficultyLabel: 'Medio',
    jlptTag: 'Cuento Clásico · N5/N4',
    title: 'Momotarō, el niño del durazno',
    japaneseTitle: '桃太郎',
    romajiTitle: 'Momotarou',
    emoji: '🍑',
    estimatedMinutes: 4,
    summary: 'Adaptación del famoso cuento popular japonés con forma pasada y conjunciones.',
    paragraphs: [
      {
        japanese: 'むかしむかし、おじいさんと おばあさんが 住んでいました。ある日、おばあさんは 川で 大きい 桃を 見つけました。',
        kanaOnly: 'むかしむかし、おじいさんと おばあさんが すんでいました。あるひ、おばあさんは かわで おおきい ももを みつけました。',
        romaji: 'Mukashi mukashi, ojiisan to obaasan ga sunde imashita. Aru hi, obaasan wa kawa de ookii momo o mitsukemashita.',
        spanish: 'Hace mucho tiempo vivían un abuelo y una abuela. Un día, la abuela encontró un durazno grande en el río.',
        audioText: 'むかしむかし、おじいさんとおばあさんがすんでいました。あるひ、おばあさんはかわでおおきいももをみつけました。'
      },
      {
        japanese: '桃を 切ると、中から 元気な 男の子が 生まれました。二人は その子を 「桃太郎」と 呼びました。',
        kanaOnly: 'ももを きると、なかから げんきな おとこのこが うまれました。ふたりは そのこを 「ももたろう」と よびました。',
        romaji: 'Momo o kiru to, naka kara genki na otokonoko ga umaremashita. Futari wa sono ko o "Momotarou" to yobimashita.',
        spanish: 'Al cortar el durazno, nació de adentro un niño saludable. Los dos llamaron a ese niño "Momotarō".',
        audioText: 'ももをきると、なかからげんきなおとこのこがうまれました。ふたりはそのこをももたろうとよびました。'
      },
      {
        japanese: '大きくなった 桃太郎は、犬と さると きじと いっしょに おにの 島へ 行きました。',
        kanaOnly: 'おおきくなった ももたろうは、いぬと さると きじと いっしょに おにの しまへ いきました。',
        romaji: 'Ookiku natta Momotarou wa, inu to saru to kiji to issho ni oni no shima e ikimashita.',
        spanish: 'Momotarō, ya crecido, fue a la isla de los ogros junto con un perro, un mono y un faisán.',
        audioText: 'おおきくなったももたろうは、いぬとさるときじといっしょにおにのしまへいきました。'
      }
    ],
    questions: [
      {
        prompt: '¿Dónde encontró la abuela el durazno gigante?',
        options: ['En la montaña (やま)', 'En el río (かわ)', 'En el bosque (もり)'],
        correctIndex: 1,
        explanation: '「川で 大きい 桃を 見つけました」 (Encontró un durazno grande en el río).'
      },
      {
        prompt: '¿Qué tres animales acompañaron a Momotarō?',
        options: ['Gato, ratón y oso', 'Perro, mono y faisán', 'Caballo, zorro y grulla'],
        correctIndex: 1,
        explanation: '「犬 (perro) と さる (mono) と きじ (faisán)」.'
      }
    ]
  },
  {
    id: 'story-10-tsuru',
    level: 10,
    difficultyLabel: 'Avanzado',
    jlptTag: 'Cuento Clásico · N4',
    title: 'La grulla agradecida',
    japaneseTitle: '鶴の 恩返し',
    romajiTitle: 'Tsuru no Ongaeshi',
    emoji: '🦢',
    estimatedMinutes: 4,
    summary: 'Historia tradicional japonesa con cláusulas descriptivas y prohibición (〜ないで).',
    paragraphs: [
      {
        japanese: '冬の 寒い 日、やさしい おじいさんが 雪の 中で けがをした 鶴を 助けました。',
        kanaOnly: 'ふゆの さむい ひ、やさしい おじいさんが ゆきの なかで けがをした つるを たすけました。',
        romaji: 'Fuyu no samui hi, yasashii ojiisan ga yuki no naka de kega o shita tsuru o tasukemashita.',
        spanish: 'Un día frío de invierno, un anciano bondadoso salvó a una grulla herida en la nieve.',
        audioText: 'ふゆのさむいひ、やさしいおじいさんがゆきのなかでけがをしたつるをたすけました。'
      },
      {
        japanese: 'その 夜、美しい 娘が 家へ 来て、「わたしを およめさんに してください」と 言いました。',
        kanaOnly: 'その よる、うつくしい むすめが うちへ きて、「わたしを およめさんに してください」と いいました。',
        romaji: 'Sono yoru, utsukushii musume ga uchi e kite, "Watashi o oyomesan ni shite kudasai" to iimashita.',
        spanish: 'Esa noche, una joven hermosa llegó a casa y dijo: "Por favor, permítame ser su esposa".',
        audioText: 'そのよる、うつくしいむすめがうちへきて、わたしをおよめさんにしてくださいといいました。'
      },
      {
        japanese: '娘は 「部屋の 中を 絶対に 見ないで ください」と 言って、毎晩 きれいな 布を 織りました。',
        kanaOnly: 'むすめは 「へやの なかを ぜったいに みないで ください」と いって、まいばん きれいな ぬのを おりました。',
        romaji: 'Musume wa "Heya no naka o zettai ni minaide kudasai" to itte, maiban kirei na nuno o orimashita.',
        spanish: 'La joven dijo "Por favor, nunca mire dentro de la habitación", y cada noche tejía una hermosa tela.',
        audioText: 'むすめはへやのなかをぜったいにみないでくださいといって、まいばんきれいなぬのをおりました。'
      }
    ],
    questions: [
      {
        prompt: '¿Qué le pidió la joven antes de entrar a tejer?',
        options: [
          'Que no mirara dentro de la habitación (見ないで ください)',
          'Que comprara más comida',
          'Que abriera todas las ventanas'
        ],
        correctIndex: 0,
        explanation: '「絶対に 見ないで ください」 significa "Por favor, absolutamente no mire".'
      },
      {
        prompt: '¿Qué animal salvó el anciano en la nieve?',
        options: ['Un zorro (きつね)', 'Una grulla (つる)', 'Una tortuga (かめ)'],
        correctIndex: 1,
        explanation: '「けがをした 鶴を 助けました」 (Salvó a una grulla herida).'
      }
    ]
  },
  {
    id: 'story-11-tanabata',
    level: 11,
    difficultyLabel: 'Avanzado',
    jlptTag: 'Leyenda de Verano · N4',
    title: 'La leyenda de Tanabata',
    japaneseTitle: '七夕の 伝説',
    romajiTitle: 'Tanabata no Densetsu',
    emoji: '🎋',
    estimatedMinutes: 5,
    summary: 'La historia de Orihime y Hikoboshi separados por la Vía Láctea (天の川).',
    paragraphs: [
      {
        japanese: '織姫と 彦星は とても 働き者でしたが、結婚してから 毎日 遊んでばかり いました。',
        kanaOnly: 'おりひめと ひこぼしは とても はたらきものでしたが、けっこんしてから まいにち あそんでばかり いました。',
        romaji: 'Orihime to Hikoboshi wa totemo hatarakimono deshita ga, kekkon shite kara mainichi asonde bakari imashita.',
        spanish: 'Orihime y Hikoboshi eran muy trabajadores, pero después de casarse solo se la pasaban jugando todos los días.',
        audioText: 'おりひめとひこぼしはとてもはたらきものでしたが、けっこんしてからまいにちあそんでばかりいました。'
      },
      {
        japanese: '神様は おこって、二人を 天の川の 反対側に 離して しまいました。',
        kanaOnly: 'かみさまは おこって、ふたりを あまのがわの はんたいがわに はなして しまいました。',
        romaji: 'Kamisama wa okotte, futari o Amanogawa no hantaigawa ni hanashite shimaimashita.',
        spanish: 'El dios se enojó y los separó a lados opuestos de la Vía Láctea.',
        audioText: 'かみさまはおこって、ふたりをあまのがわのはんたいがわにはなしてしまいました。'
      },
      {
        japanese: 'しかし、一年に 一度だけ、七月 七日の 夜に 会うことが 許されました。それが 「七夕」です。',
        kanaOnly: 'しかし、いちねんに いちどだけ、しちがつ なのかの よるに あうことが ゆるされました。それが 「たなばた」です。',
        romaji: 'Shikashi, ichinen ni ichido dake, shichigatsu nanoka no yoru ni au koto ga yurusaremashita. Sore ga "Tanabata" desu.',
        spanish: 'Sin embargo, solo una vez al año, la noche del 7 de julio, se les permitió verse. Eso es "Tanabata".',
        audioText: 'しかし、いちねんにいちどだけ、しちがつなのかのよるにあうことがゆるされました。それがたなばたです。'
      }
    ],
    questions: [
      {
        prompt: '¿Por qué se enojó el dios con Orihime y Hikoboshi?',
        options: [
          'Porque dejaron de trabajar y solo jugaban (遊んでばかり いました)',
          'Porque viajaron sin permiso',
          'Porque perdieron un tesoro'
        ],
        correctIndex: 0,
        explanation: '「結婚してから 毎日 遊んでばかり いました」.'
      },
      {
        prompt: '¿Cuándo pueden reunirse cada año?',
        options: ['El 1 de enero', 'La noche del 7 de julio (七月 七日)', 'El 15 de agosto'],
        correctIndex: 1,
        explanation: '「一年に 一度だけ、七月 七日の 夜に」 (Solo la noche del 7 de julio).'
      }
    ]
  },
  {
    id: 'story-12-kaguya',
    level: 12,
    difficultyLabel: 'Avanzado',
    jlptTag: 'Leyenda Clásica · N4+',
    title: 'La princesa Kaguya',
    japaneseTitle: 'かぐや姫',
    romajiTitle: 'Kaguyahime',
    emoji: '🌕',
    estimatedMinutes: 5,
    summary: 'La leyenda más antigua de Japón, con lenguaje descriptivo y obligación (〜なければなりません).',
    paragraphs: [
      {
        japanese: '竹を 切る 仕事を していた おじいさんは、ある 日 光っている 竹の 中から 小さい 女の子を 見つけました。',
        kanaOnly: 'たけを きる しごとを していた おじいさんは、ある ひ ひかっている たけの なかから ちいさい おんなのこを みつけました。',
        romaji: 'Take o kiru shigoto o shite ita ojiisan wa, aru hi hikatte iru take no naka kara chiisai onnanoko o mitsukemashita.',
        spanish: 'Un anciano que trabajaba cortando bambú encontró un día a una niña pequeña dentro de un bambú que brillaba.',
        audioText: 'たけをきるしごとをしていたおじいさんは、あるひひかっているたけのなかからちいさいおんなのこをみつけました。'
      },
      {
        japanese: '女の子は すぐに 美しい 「かぐや姫」に なりました。しかし、ある 夏の 夜、月の ことを 思い出して 泣きはじめました。',
        kanaOnly: 'おんなのこは すぐに うつくしい 「かぐやひめ」に なりました。しかし、ある なつの よる、つきの ことを おもいだして なきはじめました。',
        romaji: 'Onnanoko wa sugu ni utsukushii "Kaguyahime" ni narimashita. Shikashi, aru natsu no yoru, tsuki no koto o omoidashite nakihajimemashita.',
        spanish: 'La niña se convirtió pronto en la hermosa "Princesa Kaguya". Sin embargo, cierta noche de verano, recordó la luna y comenzó a llorar.',
        audioText: 'おんなのこはすぐにうつくしいかぐやひめになりました。しかし、あるなつのよる、つきのことをおもいだしてなきはじめました。'
      },
      {
        japanese: '「わたしは 月から 来ました。八月の 十五夜に 月へ 帰らなければ なりません。」そう 言って、かぐや姫は 空へ 上って 行きました。',
        kanaOnly: '「わたしは つきから きました。はちがつの じゅうごやに つきへ かえらなければ なりません。」そう いって、かぐやひめは そらへ のぼって いきました。',
        romaji: '"Watashi wa tsuki kara kimashita. Hachigatsu no juugoya ni tsuki e kaeranakereba narimasen." Sou itte, Kaguyahime wa sora e nobotte ikimashita.',
        spanish: '"Vine de la luna. En la noche de luna llena de agosto debo regresar a la luna." Diciendo eso, la princesa Kaguya subió hacia el cielo.',
        audioText: 'わたしはつきからきました。はちがつのじゅうごやにつきへかえらなければなりません。そういって、かぐやひめはそらへのぼっていきました。'
      }
    ],
    questions: [
      {
        prompt: '¿Dónde encontró el anciano a Kaguyahime?',
        options: ['Dentro de un bambú brillante (光っている 竹)', 'En una cueva', 'En la orilla del mar'],
        correctIndex: 0,
        explanation: '「光っている 竹の 中から」 (Desde adentro de un bambú que brillaba).'
      },
      {
        prompt: '¿Por qué lloraba Kaguyahime en la noche de verano?',
        options: [
          'Porque tenía hambre',
          'Porque debía regresar a la luna (月へ 帰らなければ なりません)',
          'Porque perdió su abanico'
        ],
        correctIndex: 1,
        explanation: 'Recordó su hogar en la luna y explicó que debía regresar allí.'
      }
    ]
  }
];
