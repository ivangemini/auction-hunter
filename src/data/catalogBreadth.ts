import type { LotTemplate } from '../domain/types';
import { LOTS } from './catalog';

/**
 * P5 lot-breadth packs.
 * Reuse accepted semantic environment art while adding new truthful clue/pool combinations.
 */
export const BREADTH_LOTS: readonly LotTemplate[] = [
  {
    id: 'moving-sale-35', artId: 'garage-market',
    name: { ru: 'Распродажа переезда №35', en: 'Moving Sale Unit #35' },
    location: { ru: 'Склад срочного переезда', en: 'Rush-move storage yard' },
    clues: [
      { text: { ru: 'В открытой коробке лежат старые радиодетали и экран', en: 'Old radio parts and a small screen sit in an open box' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'На стеллаже видны модели и жестяные игрушки', en: 'Models and tin toys are visible on a shelf' }, signal: { categories: ['toys'] } },
      { text: { ru: 'Под столом стоит ящик с ручным инструментом', en: 'A hand-tool crate sits beneath the table' }, signal: { categories: ['tools'] } },
    ],
    reservePrice: 400, bidIncrement: 75, itemCount: 4,
    itemPool: ['multimeter', 'portable-radio', 'pocket-tv', 'tin-car', 'model-train', 'toolbox', 'soldering-station'],
  },
  {
    id: 'club-locker-11', artId: 'garage-workshop',
    name: { ru: 'Клубный шкаф №11', en: 'Club Locker #11' },
    location: { ru: 'Подвал закрытого дома культуры', en: 'Closed community-club basement' },
    clues: [
      { text: { ru: 'На полке стоят коробки с комиксами и пластинками', en: 'Comic and record boxes line a shelf' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'В углу лежит старая портативная камера', en: 'An old portable camera rests in the corner' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'В витрине осталась небольшая заводная игрушка', en: 'A small wind-up toy remains in a display case' }, signal: { categories: ['toys'] } },
    ],
    reservePrice: 425, bidIncrement: 75, itemCount: 4,
    itemPool: ['comic-stack', 'vinyl-box', 'manual-typewriter', 'film-camera', 'instant-camera', 'tin-car', 'toy-robot'],
  },
  {
    id: 'music-estate-24', artId: 'estate-studio',
    name: { ru: 'Музыкальный архив №24', en: 'Music Estate #24' },
    location: { ru: 'Дом бывшего музыкального продюсера', en: 'Former music producer estate' },
    clues: [
      { text: { ru: 'В коробках стоят пластинки и подписанные конверты', en: 'Record boxes include signed sleeves' }, signal: { categories: ['art', 'collectibles'] } },
      { text: { ru: 'На стене свёрнуты концертные афиши', en: 'Concert posters are rolled beside the wall' }, signal: { categories: ['art'] } },
      { text: { ru: 'На столе оставлена старая портативная техника', en: 'Old portable electronics were left on the desk' }, signal: { categories: ['electronics'] } },
    ],
    reservePrice: 700, bidIncrement: 100, itemCount: 4,
    itemPool: ['vinyl-box', 'signed-vinyl', 'signed-poster', 'gallery-print', 'portable-radio', 'cassette-player', 'mini-console'],
  },
  {
    id: 'traveler-estate-12', artId: 'estate-attic',
    name: { ru: 'Архив путешественника №12', en: 'Traveler Estate #12' },
    location: { ru: 'Чердак дома коллекционера-путешественника', en: 'Attic of a collector-traveler estate' },
    clues: [
      { text: { ru: 'В кожаном футляре лежат часы и дорожные принадлежности', en: 'A leather case holds watches and travel accessories' }, signal: { categories: ['watches'] } },
      { text: { ru: 'У окна стоят бинокль и оптический чехол', en: 'Binoculars and an optical case sit by the window' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'В кофре видна старая камера', en: 'An old camera is visible inside a travel trunk' }, signal: { categories: ['electronics'] } },
    ],
    reservePrice: 725, bidIncrement: 100, itemCount: 4,
    itemPool: ['travel-clock', 'military-watch', 'chronograph-watch', 'binoculars', 'telescope', 'film-camera', 'instant-camera'],
  },
  {
    id: 'design-vault-21', artId: 'collector-gallery',
    name: { ru: 'Дизайнерский сейф №21', en: 'Design Vault #21' },
    location: { ru: 'Частный интерьерный архив', en: 'Private interiors archive' },
    clues: [
      { text: { ru: 'В витрине видны предметы яркого дизайна эпохи', en: 'Period-design pieces are visible in a display' }, signal: { categories: ['art', 'collectibles'] } },
      { text: { ru: 'Рядом лежит дорогой футляр для часов', en: 'A premium watch presentation case sits nearby' }, signal: { categories: ['watches'] } },
      { text: { ru: 'Под тканью угадывается фарфоровая фигура', en: 'A porcelain figure is visible beneath a cloth' }, signal: { itemIds: ['porcelain-figurine'] } },
    ],
    reservePrice: 1200, bidIncrement: 150, itemCount: 4,
    itemPool: ['art-deco-lamp', 'porcelain-figurine', 'fountain-pen', 'chronograph-watch', 'master-study', 'enamel-brooch', 'clockwork-automaton'],
  },
  {
    id: 'prototype-vault-7', artId: 'collector-vault',
    name: { ru: 'Прототипный сейф №7', en: 'Prototype Vault #7' },
    location: { ru: 'Закрытое хранилище промышленного дизайнера', en: 'Industrial designer private vault' },
    clues: [
      { text: { ru: 'На коробках стоят пометки «образец» и номера партий', en: 'Boxes carry sample labels and production numbers' }, signal: { itemIds: ['prototype-toy', 'preproduction-figure', 'mini-console'] } },
      { text: { ru: 'В антистатическом кейсе лежит портативная электроника', en: 'Portable electronics sit in an anti-static case' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'Под стеклом виден сложный механический объект', en: 'A complex mechanical object is visible under glass' }, signal: { itemIds: ['clockwork-automaton', 'chronograph-watch'] } },
    ],
    reservePrice: 1250, bidIncrement: 150, itemCount: 4,
    itemPool: ['prototype-toy', 'preproduction-figure', 'mini-console', 'arcade-handheld', 'clockwork-automaton', 'chronograph-watch', 'pocket-watch'],
  },
  {
    id: 'maker-locker-41', artId: 'garage-workshop',
    name: { ru: 'Мастерская энтузиаста №41', en: 'Maker Locker #41' },
    location: { ru: 'Гаражный ряд радиолюбителей', en: 'Electronics hobbyist garage row' },
    clues: [
      { text: { ru: 'На верстаке лежат паяльник, щупы и измеритель', en: 'A soldering iron, probes and meter cover the bench' }, signal: { categories: ['tools'] } },
      { text: { ru: 'В коробках видны экраны, антенны и старые платы', en: 'Screens, antennas and old boards fill the boxes' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'В шкафу стоит тяжёлая механическая машинка', en: 'A heavy mechanical machine sits in the cabinet' }, signal: { categories: ['collectibles'] } },
    ],
    reservePrice: 425, bidIncrement: 75, itemCount: 4,
    itemPool: ['soldering-station', 'multimeter', 'toolbox', 'portable-radio', 'pocket-tv', 'manual-typewriter', 'film-camera'],
  },
  {
    id: 'toy-market-crate-9', artId: 'garage-market',
    name: { ru: 'Игрушечный ящик №9', en: 'Toy Market Crate #9' },
    location: { ru: 'Склад закрытой барахолки', en: 'Closed flea-market storage' },
    clues: [
      { text: { ru: 'Сверху лежат жестяные машинки и детали моделей', en: 'Tin cars and model parts are stacked on top' }, signal: { categories: ['toys'] } },
      { text: { ru: 'Под ними видны комиксы и музыкальные коробки', en: 'Comics and music boxes are visible underneath' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'В углу лежит небольшое устройство с экраном', en: 'A small screened device sits in one corner' }, signal: { categories: ['electronics'] } },
    ],
    reservePrice: 450, bidIncrement: 75, itemCount: 4,
    itemPool: ['tin-car', 'toy-robot', 'model-train', 'comic-stack', 'vinyl-box', 'mini-console', 'portable-radio'],
  },
  {
    id: 'writer-estate-33', artId: 'estate-attic',
    name: { ru: 'Архив писателя №33', en: 'Writer Estate #33' },
    location: { ru: 'Чердак дома частного издателя', en: 'Private publisher estate attic' },
    clues: [
      { text: { ru: 'На столе лежат рукописи, редкие книги и футляр ручки', en: 'Manuscripts, rare books and a pen case cover the desk' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'У стены стоят подписанные афиши и номерные листы', en: 'Signed posters and numbered sheets line the wall' }, signal: { categories: ['art'] } },
      { text: { ru: 'В кофре осталась старая камера для поездок', en: 'An old travel camera remains in a trunk' }, signal: { categories: ['electronics'] } },
    ],
    reservePrice: 750, bidIncrement: 100, itemCount: 4,
    itemPool: ['first-edition-book', 'fountain-pen', 'manual-typewriter', 'gallery-print', 'signed-poster', 'travel-clock', 'film-camera'],
  },
  {
    id: 'collector-parlor-15', artId: 'estate-studio',
    name: { ru: 'Салон коллекционера №15', en: 'Collector Parlor #15' },
    location: { ru: 'Гостиная старого городского особняка', en: 'Old townhouse parlor' },
    clues: [
      { text: { ru: 'В центре комнаты стоят лампа и фарфоровая фигура', en: 'A lamp and porcelain figure dominate the room' }, signal: { categories: ['art', 'collectibles'] } },
      { text: { ru: 'На комоде лежит часовой футляр и коробка украшений', en: 'A watch case and jewelry box sit on the dresser' }, signal: { categories: ['watches', 'collectibles'] } },
      { text: { ru: 'На полке видна подписанная пластинка', en: 'A signed record is visible on the shelf' }, signal: { itemIds: ['signed-vinyl'] } },
    ],
    reservePrice: 775, bidIncrement: 100, itemCount: 4,
    itemPool: ['art-deco-lamp', 'porcelain-figurine', 'enamel-brooch', 'silver-ring', 'chronograph-watch', 'instant-camera', 'signed-vinyl'],
  },
  {
    id: 'media-vault-31', artId: 'collector-gallery',
    name: { ru: 'Медиа-хранилище №31', en: 'Media Vault #31' },
    location: { ru: 'Закрытый архив частного продюсера', en: 'Private producer archive' },
    clues: [
      { text: { ru: 'На стенах стоят подписанные пластинки, афиши и графика', en: 'Signed records, posters and prints line the walls' }, signal: { categories: ['art'] } },
      { text: { ru: 'В антистатических боксах лежат ранние игровые устройства', en: 'Early gaming devices sit in anti-static cases' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'В сейфе видны редкие печатные издания', en: 'Rare printed editions are visible in the safe' }, signal: { categories: ['collectibles'] } },
    ],
    reservePrice: 1300, bidIncrement: 150, itemCount: 4,
    itemPool: ['signed-vinyl', 'signed-poster', 'master-study', 'first-edition-book', 'mini-console', 'arcade-handheld', 'preproduction-figure'],
  },
  {
    id: 'mechanical-vault-18', artId: 'collector-vault',
    name: { ru: 'Механическое хранилище №18', en: 'Mechanical Vault #18' },
    location: { ru: 'Частная коллекция инженера-механика', en: 'Mechanical engineer private collection' },
    clues: [
      { text: { ru: 'В витрине лежат несколько сложных часовых механизмов', en: 'Several complex watch movements sit in a display' }, signal: { categories: ['watches'] } },
      { text: { ru: 'Под стеклом видны заводные игрушки и прототипные детали', en: 'Clockwork toys and prototype parts are visible under glass' }, signal: { categories: ['toys'] } },
      { text: { ru: 'В отдельном футляре лежит дорогой письменный инструмент', en: 'A premium writing instrument rests in a separate case' }, signal: { itemIds: ['fountain-pen'] } },
    ],
    reservePrice: 1350, bidIncrement: 150, itemCount: 4,
    itemPool: ['pocket-watch', 'chronograph-watch', 'military-watch', 'clockwork-automaton', 'prototype-toy', 'preproduction-figure', 'fountain-pen'],
  },
  {
    id: 'photo-lab-locker-27', artId: 'garage-workshop',
    name: { ru: 'Фотолаборатория №27', en: 'Photo Lab Locker #27' },
    location: { ru: 'Гараж бывшего фотокружка', en: 'Former photo-club garage' },
    clues: [
      { text: { ru: 'На столе лежат камеры, кассеты и старые кабели', en: 'Cameras, cassettes and old cables cover the desk' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'В шкафу стоят подписанные коробки с бумагой и архивом', en: 'Labeled paper and archive boxes fill a cabinet' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'Под увеличителем лежит измерительный прибор', en: 'A measuring instrument rests beneath the enlarger' }, signal: { categories: ['tools'] } },
    ],
    reservePrice: 475, bidIncrement: 75, itemCount: 4,
    itemPool: ['film-camera', 'instant-camera', 'cassette-player', 'portable-radio', 'manual-typewriter', 'comic-stack', 'multimeter'],
  },
  {
    id: 'rail-hobby-unit-44', artId: 'garage-market',
    name: { ru: 'Железнодорожный клуб №44', en: 'Rail Hobby Unit #44' },
    location: { ru: 'Склад закрытого клуба моделистов', en: 'Closed model-club storage' },
    clues: [
      { text: { ru: 'На макете стоят локомотивы и жестяные машинки', en: 'Locomotives and tin cars sit on a layout' }, signal: { categories: ['toys'] } },
      { text: { ru: 'В коробках лежат старые журналы и коллекционные детали', en: 'Old magazines and collectible parts fill the boxes' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'У стены видны паяльная станция и радиоприёмник', en: 'A soldering station and radio sit by the wall' }, signal: { categories: ['tools', 'electronics'] } },
    ],
    reservePrice: 475, bidIncrement: 75, itemCount: 4,
    itemPool: ['model-train', 'tin-car', 'toy-robot', 'comic-stack', 'travel-clock', 'soldering-station', 'portable-radio'],
  },
  {
    id: 'scholar-estate-26', artId: 'estate-attic',
    name: { ru: 'Кабинет учёного №26', en: 'Scholar Estate #26' },
    location: { ru: 'Дом частного исследователя', en: 'Private researcher estate' },
    clues: [
      { text: { ru: 'На столе лежат редкие книги, ручка и машинописные листы', en: 'Rare books, a pen and typed pages cover the desk' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'На стене висит номерная графика', en: 'A numbered print hangs on the wall' }, signal: { categories: ['art'] } },
      { text: { ru: 'В ящике лежат дорожные и наручные часы', en: 'Travel and wrist watches sit in a drawer' }, signal: { categories: ['watches'] } },
    ],
    reservePrice: 800, bidIncrement: 100, itemCount: 4,
    itemPool: ['first-edition-book', 'fountain-pen', 'manual-typewriter', 'gallery-print', 'porcelain-figurine', 'travel-clock', 'military-watch'],
  },
  {
    id: 'photographer-studio-34', artId: 'estate-studio',
    name: { ru: 'Студия фотографа №34', en: 'Photographer Studio #34' },
    location: { ru: 'Мастерская известного городского фотографа', en: 'Known city photographer studio' },
    clues: [
      { text: { ru: 'В кейсах лежат несколько поколений фототехники', en: 'Several generations of camera gear sit in cases' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'На стенах висят принты и подписанные афиши', en: 'Prints and signed posters hang on the walls' }, signal: { categories: ['art'] } },
      { text: { ru: 'На полке стоит оптика в мягком футляре', en: 'Optics sit on a shelf in a padded case' }, signal: { categories: ['collectibles'] } },
    ],
    reservePrice: 825, bidIncrement: 100, itemCount: 4,
    itemPool: ['film-camera', 'instant-camera', 'pocket-tv', 'gallery-print', 'signed-poster', 'binoculars', 'art-deco-lamp'],
  },
  {
    id: 'jeweler-vault-12', artId: 'collector-vault',
    name: { ru: 'Ювелирное хранилище №12', en: 'Jeweler Vault #12' },
    location: { ru: 'Закрытый архив частного ювелира', en: 'Private jeweler archive' },
    clues: [
      { text: { ru: 'В сейфе лежат кольца, броши и бархатные футляры', en: 'Rings, brooches and velvet cases fill the safe' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'На столе открыты несколько дорогих часовых коробок', en: 'Several premium watch boxes are open on the desk' }, signal: { categories: ['watches'] } },
      { text: { ru: 'На стене висит небольшой этюд с архивной биркой', en: 'A small tagged study hangs on the wall' }, signal: { itemIds: ['master-study'] } },
    ],
    reservePrice: 1400, bidIncrement: 150, itemCount: 4,
    itemPool: ['silver-ring', 'enamel-brooch', 'fountain-pen', 'porcelain-figurine', 'chronograph-watch', 'pocket-watch', 'master-study'],
  },
  {
    id: 'prototype-gallery-23', artId: 'collector-gallery',
    name: { ru: 'Галерея прототипов №23', en: 'Prototype Gallery #23' },
    location: { ru: 'Закрытая коллекция промышленного дизайна', en: 'Private industrial-design collection' },
    clues: [
      { text: { ru: 'Под стеклом стоят предсерийные игрушки и механизмы', en: 'Pre-production toys and mechanisms sit under glass' }, signal: { categories: ['toys'] } },
      { text: { ru: 'В кейсах лежат ранние портативные устройства', en: 'Early portable devices sit in fitted cases' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'В архивном тубусе лежит подписанная графика', en: 'Signed artwork rests in an archival tube' }, signal: { categories: ['art'] } },
    ],
    reservePrice: 1450, bidIncrement: 150, itemCount: 4,
    itemPool: ['prototype-toy', 'preproduction-figure', 'clockwork-automaton', 'arcade-handheld', 'mini-console', 'signed-poster', 'master-study'],
  },
];

export const ALL_LOTS: readonly LotTemplate[] = [...LOTS, ...BREADTH_LOTS];