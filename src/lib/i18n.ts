import { createContext, useContext } from 'react';
import type { Language } from '../db/types';

export interface LanguageOption {
  code: Language;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'bg', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'en', nativeName: 'English', flag: '🇬🇧' }
];

export const LOCALE: Record<Language, string> = {
  bg: 'bg-BG',
  en: 'en-US'
};

type Dict = Record<string, string | string[]>;

const en: Dict = {
  // Onboarding
  'onb.step': 'Step {current} of {total}',
  'onb.back': 'Back',
  'onb.continue': 'Continue',
  'onb.getStarted': 'Get started',
  'onb.language.title': 'Choose your language',
  'onb.language.sub': 'You can change this anytime in Settings.',
  'onb.welcome.title': 'Hi there 👋',
  'onb.welcome.sub': 'Let’s get a quick setup so the app feels like yours.',
  'onb.welcome.nameLabel': 'What should we call you?',
  'onb.welcome.namePlaceholder': 'Your name',
  'onb.theme.title': 'Pick a vibe',
  'onb.theme.sub': 'Choose an accent color and how light or dark you like it.',
  'onb.theme.accentLabel': 'Accent color',
  'onb.theme.themeLabel': 'Theme',
  'onb.location.title': 'Where are you?',
  'onb.location.sub': 'We use this to show times correctly. We pre-filled your current zone.',
  'onb.location.label': 'Timezone',
  'onb.format.title': 'Time format',
  'onb.format.sub': 'How would you like times to be shown?',
  'onb.format.label': 'Hour format',
  'onb.goal.title': 'Pick a goal',
  'onb.goal.sub': 'A daily fasting target. You can change this anytime.',
  'onb.goal.targetLabel': 'Target',
  'onb.goal.customLabel': 'Or custom (hours)',

  // Common
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.done': 'Done',
  'common.language': 'Language',
  'common.theme.system': 'System',
  'common.theme.light': 'Light',
  'common.theme.dark': 'Dark',
  'common.hour.24h': '24-hour',
  'common.hour.12h': '12-hour',
  'common.hour.12hLong': '12-hour (AM/PM)',
  'common.hourSuffix': 'h',

  // Tabs
  'tab.timer': 'Timer',
  'tab.history': 'History',
  'tab.settings': 'Settings',

  // Timer screen
  'timer.fasting': 'Currently fasting',
  'timer.notFasting': 'Not fasting',
  'timer.greeting.night': 'Good night',
  'timer.greeting.morning': 'Good morning',
  'timer.greeting.afternoon': 'Good afternoon',
  'timer.greeting.evening': 'Good evening',
  'timer.greeting.friend': 'friend',
  'timer.goalReached': 'Goal reached',
  'timer.elapsed': 'Elapsed',
  'timer.sinceLast': 'Since last fast',
  'timer.goalProgress': 'Goal {hours}h',
  'timer.started': 'Started',
  'timer.tapToEdit': 'Tap to edit',
  'timer.goalAt': 'Goal at',
  'timer.in': 'in {duration}',
  'timer.endFast': 'End fast',
  'timer.startFast': 'Start fasting',
  'timer.lastFast': 'Last fast',
  'timer.ended': 'Ended',
  'timer.yourTarget': 'Your target',
  'timer.targetHours': '{hours} hours',
  'timer.targetHint':
    'Tap start when your last meal is finished. You can adjust the start time after the fact.',
  'timer.lastGoal': '{hours}h · goal {target}h',
  'timer.editStart': 'Edit fast start',
  'timer.editLastEnd': 'Edit last fast end',
  'timer.confirmEnd.title': 'End fast?',
  'timer.confirmEnd.reached':
    'You’ve fasted for {elapsed} and hit your goal. Nice work.',
  'timer.confirmEnd.short':
    'You’ve fasted for {elapsed}, {remaining} short of your {target}h goal.',
  'timer.confirmEnd.keep': 'Keep fasting',
  'timer.discardFast': 'Discard this fast',
  'timer.confirmDiscard.title': 'Discard this fast?',
  'timer.confirmDiscard.sub':
    'This removes the active fast without saving it to history. Use this if you broke your fast and don’t want it recorded.',
  'timer.confirmDiscard.confirm': 'Discard',
  'timer.summary.title': 'Fast complete',
  'timer.summary.total': 'Total',
  'timer.summary.goalLine': '{hours}h · goal {target}h',
  'timer.summary.stageReached': 'Stage reached',
  'timer.summary.celebrate': 'Goal smashed — well done!',
  'timer.summary.streakOne': 'Day 1 of a new streak — let’s keep it going.',
  'timer.summary.streakMany': '{streak}-day streak — you’re on fire!',

  // Stage card
  'stageCard.current': 'Current stage',
  'stageCard.next': 'Next: {name}',

  // History
  'history.title': 'History',
  'history.subtitle': '{completed} completed · {goals} goals hit',
  'history.stat.avg': 'Avg duration',
  'history.stat.avgHint': 'over completed fasts',
  'history.stat.longest': 'Longest',
  'history.stat.longestHint': 'personal best',
  'history.stat.current': 'Current streak',
  'history.stat.best': 'Best streak',
  'history.stat.streakHint': 'days hitting goal',
  'history.chart.title': 'Last {count} fasts',
  'history.chart.hours': 'hours',
  'history.chart.empty': 'No data yet — your fasts will show up here.',
  'history.chart.fast': 'Fast',
  'history.all': 'All fasts',
  'history.empty': 'Nothing logged yet. Start a fast from the timer screen.',
  'history.goalHit': '✓ Goal hit',
  'history.goal': 'Goal {hours}h',
  'history.start': 'Start',
  'history.end': 'End',
  'history.editStart': 'Edit start time',
  'history.editEnd': 'Edit end time',
  'history.confirmDelete.title': 'Delete this fast?',
  'history.confirmDelete.sub':
    'This will remove the entry permanently. This cannot be undone.',

  // Settings
  'settings.title': 'Settings',
  'settings.subtitle': 'Everything is stored on this device.',
  'settings.name': 'Your name',
  'settings.accent': 'Accent color',
  'settings.theme': 'Theme',
  'settings.timezone': 'Timezone',
  'settings.hourFormat': 'Hour format',
  'settings.target': 'Default fasting target (hours)',
  'settings.targetHint':
    'Used for new fasts. Existing fasts keep their original goal.',
  'settings.language': 'Language',
  'settings.data': 'Data',
  'settings.dataSub': 'Export a backup or move your data to another device.',
  'settings.export': 'Export JSON',
  'settings.import': 'Import JSON',
  'settings.clearHistory': 'Clear all history',
  'settings.footerOne': 'Fasting Timer · 1 record',
  'settings.footerMany': 'Fasting Timer · {count} records',
  'settings.import.title': 'Import data',
  'settings.import.subOne':
    '1 fast found in this file. Settings will be overwritten with the imported values.',
  'settings.import.subMany':
    '{count} fasts found in this file. Settings will be overwritten with the imported values.',
  'settings.import.merge': 'Merge into current',
  'settings.import.replace': 'Replace existing',
  'settings.clear.title': 'Clear all history?',
  'settings.clear.sub':
    'This permanently deletes every recorded fast. Your settings are kept.',
  'settings.clear.confirm': 'Delete everything',
  'settings.toast.exported': 'Exported',
  'settings.toast.invalid': 'Not a valid export file',
  'settings.toast.unreadable': 'Could not read that file',
  'settings.toast.importedMerge': 'Imported (merged)',
  'settings.toast.importedReplace': 'Imported (replaced)',
  'settings.toast.cleared': 'History cleared',

  // Timezone picker
  'tz.title': 'Timezone',
  'tz.search': 'Search city or zone…',
  'tz.noMatches': 'No matches.',
  'tz.showingFirst': 'Showing first 200. Refine to narrow down.',

  // Time edit
  'timeEdit.invalid': 'Invalid date',
  'timeEdit.beforeMin': 'Time must be after the previous boundary.',
  'timeEdit.afterMax': 'Time cannot be in the future.',

  // Stages
  'stage.fed.name': 'Fed state',
  'stage.fed.summary':
    'Your body is digesting and absorbing the last meal. Insulin is elevated and energy comes from food.',
  'stage.early-fast.name': 'Early fast',
  'stage.early-fast.summary':
    'Insulin starts to drop. Your body shifts to using stored glycogen for energy.',
  'stage.metabolic-shift.name': 'Metabolic shift',
  'stage.metabolic-shift.summary':
    'Glycogen is mostly depleted. Your liver starts converting fat into ketones.',
  'stage.fat-burning.name': 'Fat burning',
  'stage.fat-burning.summary':
    'You’re running primarily on fat. Ketone levels climb noticeably.',
  'stage.ketosis.name': 'Ketosis',
  'stage.ketosis.summary':
    'You enter sustained ketosis. Brain and muscles use ketones efficiently.',
  'stage.autophagy.name': 'Autophagy',
  'stage.autophagy.summary':
    'Cells begin recycling old proteins and damaged components — your body’s self-clean cycle.',
  'stage.deep-autophagy.name': 'Deep autophagy',
  'stage.deep-autophagy.summary':
    'Autophagy intensifies. Stem cell activity and immune renewal begin.',
  'stage.prolonged.name': 'Prolonged fast',
  'stage.prolonged.summary':
    'Extended fast — significant immune reset and deep metabolic effects. Best done with medical guidance.'
};

const enList: Record<string, string[]> = {
  'stage.fed.benefits': [
    'Nutrients are being absorbed and stored',
    'Muscle protein synthesis is active'
  ],
  'stage.early-fast.benefits': [
    'Insulin levels begin to fall',
    'Glycogen stores are tapped for fuel',
    'Digestive system gets a break'
  ],
  'stage.metabolic-shift.benefits': [
    'Fat burning ramps up (lipolysis)',
    'Early ketone production begins',
    'Human growth hormone starts rising'
  ],
  'stage.fat-burning.benefits': [
    'Improved insulin sensitivity',
    'Steady energy from fat stores',
    'Mild appetite suppression'
  ],
  'stage.ketosis.benefits': [
    'Mental clarity and focus',
    'Stable energy without crashes',
    'Inflammation markers begin to drop'
  ],
  'stage.autophagy.benefits': [
    'Cellular cleanup (autophagy) increases',
    'Growth hormone surges',
    'Stronger anti-inflammatory effects'
  ],
  'stage.deep-autophagy.benefits': [
    'Peak autophagy activity',
    'Stem cell regeneration begins',
    'Insulin sensitivity at its best'
  ],
  'stage.prolonged.benefits': [
    'Immune system regeneration',
    'Maximum growth hormone',
    'Profound metabolic reset'
  ]
};

const bg: Dict = {
  // Onboarding
  'onb.step': 'Стъпка {current} от {total}',
  'onb.back': 'Назад',
  'onb.continue': 'Продължи',
  'onb.getStarted': 'Започни',
  'onb.language.title': 'Избери език',
  'onb.language.sub': 'Можеш да го смениш по всяко време от Настройки.',
  'onb.welcome.title': 'Здравей 👋',
  'onb.welcome.sub': 'Нека направим бърза настройка, за да е приложението наистина твое.',
  'onb.welcome.nameLabel': 'Как да те наричаме?',
  'onb.welcome.namePlaceholder': 'Твоето име',
  'onb.theme.title': 'Избери настроение',
  'onb.theme.sub': 'Избери акцентен цвят и колко светло или тъмно ти харесва.',
  'onb.theme.accentLabel': 'Акцентен цвят',
  'onb.theme.themeLabel': 'Тема',
  'onb.location.title': 'Къде се намираш?',
  'onb.location.sub':
    'Използваме това, за да показваме часовете правилно. Попълнихме твоята текуща зона.',
  'onb.location.label': 'Часова зона',
  'onb.format.title': 'Формат на часа',
  'onb.format.sub': 'Как да показваме часовете?',
  'onb.format.label': 'Формат',
  'onb.goal.title': 'Избери цел',
  'onb.goal.sub': 'Дневна цел за гладуване. Можеш да я смениш по всяко време.',
  'onb.goal.targetLabel': 'Цел',
  'onb.goal.customLabel': 'Или персонална (часа)',

  // Common
  'common.cancel': 'Отказ',
  'common.save': 'Запази',
  'common.delete': 'Изтрий',
  'common.done': 'Готово',
  'common.language': 'Език',
  'common.theme.system': 'Системна',
  'common.theme.light': 'Светла',
  'common.theme.dark': 'Тъмна',
  'common.hour.24h': '24-часов',
  'common.hour.12h': '12-часов',
  'common.hour.12hLong': '12-часов (AM/PM)',
  'common.hourSuffix': 'ч',

  // Tabs
  'tab.timer': 'Таймер',
  'tab.history': 'История',
  'tab.settings': 'Настройки',

  // Timer screen
  'timer.fasting': 'В момента гладуваш',
  'timer.notFasting': 'Не гладуваш',
  'timer.greeting.night': 'Лека нощ',
  'timer.greeting.morning': 'Добро утро',
  'timer.greeting.afternoon': 'Добър ден',
  'timer.greeting.evening': 'Добър вечер',
  'timer.greeting.friend': 'приятел',
  'timer.goalReached': 'Целта е постигната',
  'timer.elapsed': 'Изминали',
  'timer.sinceLast': 'Без гладуване',
  'timer.goalProgress': 'Цел {hours}ч',
  'timer.started': 'Начало',
  'timer.tapToEdit': 'Натисни за редакция',
  'timer.goalAt': 'Цел в',
  'timer.in': 'след {duration}',
  'timer.endFast': 'Прекрати гладуването',
  'timer.startFast': 'Започни гладуване',
  'timer.lastFast': 'Последно гладуване',
  'timer.ended': 'Край',
  'timer.yourTarget': 'Твоята цел',
  'timer.targetHours': '{hours} часа',
  'timer.targetHint':
    'Натисни старт, когато си приключил с последното хранене. Можеш да коригираш времето впоследствие.',
  'timer.lastGoal': '{hours}ч · цел {target}ч',
  'timer.editStart': 'Редактирай началото',
  'timer.editLastEnd': 'Редактирай края на последното',
  'timer.confirmEnd.title': 'Прекратяване на гладуването?',
  'timer.confirmEnd.reached':
    'Гладува {elapsed} и достигна целта си. Браво!',
  'timer.confirmEnd.short':
    'Гладува {elapsed}, остават {remaining} до целта от {target}ч.',
  'timer.confirmEnd.keep': 'Продължи гладуването',
  'timer.discardFast': 'Откажи това гладуване',
  'timer.confirmDiscard.title': 'Отказване на гладуването?',
  'timer.confirmDiscard.sub':
    'Активното гладуване ще бъде премахнато, без да се запази в историята. Използвай, ако си прекъснал гладуването и не искаш да остане запис.',
  'timer.confirmDiscard.confirm': 'Откажи',
  'timer.summary.title': 'Гладуването е завършено',
  'timer.summary.total': 'Общо',
  'timer.summary.goalLine': '{hours}ч · цел {target}ч',
  'timer.summary.stageReached': 'Достигнат етап',
  'timer.summary.celebrate': 'Целта е постигната — браво!',
  'timer.summary.streakOne': 'Ден 1 от нова серия — продължавай!',
  'timer.summary.streakMany': 'Серия от {streak} дни — страхотно!',

  // Stage card
  'stageCard.current': 'Текущ етап',
  'stageCard.next': 'Следва: {name}',

  // History
  'history.title': 'История',
  'history.subtitle': '{completed} завършени · {goals} цели постигнати',
  'history.stat.avg': 'Средна продължителност',
  'history.stat.avgHint': 'от завършените гладувания',
  'history.stat.longest': 'Най-дълго',
  'history.stat.longestHint': 'личен рекорд',
  'history.stat.current': 'Текуща серия',
  'history.stat.best': 'Най-добра серия',
  'history.stat.streakHint': 'дни с постигната цел',
  'history.chart.title': 'Последни {count} гладувания',
  'history.chart.hours': 'часа',
  'history.chart.empty': 'Все още няма данни — гладуванията ще се появят тук.',
  'history.chart.fast': 'Гладуване',
  'history.all': 'Всички гладувания',
  'history.empty':
    'Все още нищо не е записано. Започни гладуване от екрана с таймера.',
  'history.goalHit': '✓ Цел постигната',
  'history.goal': 'Цел {hours}ч',
  'history.start': 'Начало',
  'history.end': 'Край',
  'history.editStart': 'Редактирай начало',
  'history.editEnd': 'Редактирай край',
  'history.confirmDelete.title': 'Изтриване на това гладуване?',
  'history.confirmDelete.sub':
    'Записът ще бъде премахнат завинаги. Това действие е необратимо.',

  // Settings
  'settings.title': 'Настройки',
  'settings.subtitle': 'Всичко се пази на това устройство.',
  'settings.name': 'Твоето име',
  'settings.accent': 'Акцентен цвят',
  'settings.theme': 'Тема',
  'settings.timezone': 'Часова зона',
  'settings.hourFormat': 'Формат на часа',
  'settings.target': 'Цел за гладуване (часа)',
  'settings.targetHint':
    'Използва се за нови гладувания. Започнатите запазват първоначалната си цел.',
  'settings.language': 'Език',
  'settings.data': 'Данни',
  'settings.dataSub':
    'Експортирай резервно копие или прехвърли данните си на друго устройство.',
  'settings.export': 'Експорт JSON',
  'settings.import': 'Импорт JSON',
  'settings.clearHistory': 'Изчисти историята',
  'settings.footerOne': 'Fasting Timer · 1 запис',
  'settings.footerMany': 'Fasting Timer · {count} записа',
  'settings.import.title': 'Импорт на данни',
  'settings.import.subOne':
    '1 гладуване е намерено в този файл. Настройките ще бъдат презаписани със стойностите от файла.',
  'settings.import.subMany':
    '{count} гладувания са намерени в този файл. Настройките ще бъдат презаписани със стойностите от файла.',
  'settings.import.merge': 'Обедини със съществуващите',
  'settings.import.replace': 'Замени съществуващите',
  'settings.clear.title': 'Изчистване на цялата история?',
  'settings.clear.sub':
    'Това ще изтрие завинаги всички записани гладувания. Настройките се запазват.',
  'settings.clear.confirm': 'Изтрий всичко',
  'settings.toast.exported': 'Експортирано',
  'settings.toast.invalid': 'Невалиден файл за импорт',
  'settings.toast.unreadable': 'Файлът не може да бъде прочетен',
  'settings.toast.importedMerge': 'Импортирано (обединено)',
  'settings.toast.importedReplace': 'Импортирано (заменено)',
  'settings.toast.cleared': 'Историята е изчистена',

  // Timezone picker
  'tz.title': 'Часова зона',
  'tz.search': 'Търси град или зона…',
  'tz.noMatches': 'Няма съвпадения.',
  'tz.showingFirst': 'Показват се първите 200. Уточни търсенето.',

  // Time edit
  'timeEdit.invalid': 'Невалидна дата',
  'timeEdit.beforeMin': 'Времето трябва да е след предходната граница.',
  'timeEdit.afterMax': 'Времето не може да бъде в бъдещето.',

  // Stages
  'stage.fed.name': 'Нахранено състояние',
  'stage.fed.summary':
    'Тялото смила и усвоява последното хранене. Инсулинът е повишен и енергията идва от храната.',
  'stage.early-fast.name': 'Ранно гладуване',
  'stage.early-fast.summary':
    'Инсулинът започва да спада. Тялото преминава към използване на гликоген за енергия.',
  'stage.metabolic-shift.name': 'Метаболитен преход',
  'stage.metabolic-shift.summary':
    'Гликогенът е почти изчерпан. Черният дроб започва да преобразува мазнини в кетонни тела.',
  'stage.fat-burning.name': 'Изгаряне на мазнини',
  'stage.fat-burning.summary':
    'Работиш предимно на мазнини. Нивата на кетонни тела се покачват осезаемо.',
  'stage.ketosis.name': 'Кетоза',
  'stage.ketosis.summary':
    'Влизаш в устойчива кетоза. Мозъкът и мускулите използват ефективно кетонни тела.',
  'stage.autophagy.name': 'Автофагия',
  'stage.autophagy.summary':
    'Клетките започват да рециклират стари протеини и увредени компоненти — вътрешният цикъл на самопочистване.',
  'stage.deep-autophagy.name': 'Дълбока автофагия',
  'stage.deep-autophagy.summary':
    'Автофагията се засилва. Активността на стволовите клетки и обновяването на имунната система започват.',
  'stage.prolonged.name': 'Продължително гладуване',
  'stage.prolonged.summary':
    'Дълго гладуване — значителен имунен ресет и дълбоки метаболитни ефекти. Препоръчително под лекарско наблюдение.'
};

const bgList: Record<string, string[]> = {
  'stage.fed.benefits': [
    'Усвояват се и се складират хранителни вещества',
    'Активен синтез на мускулен протеин'
  ],
  'stage.early-fast.benefits': [
    'Нивата на инсулин започват да спадат',
    'Запасите от гликоген се ползват за гориво',
    'Храносмилателната система получава почивка'
  ],
  'stage.metabolic-shift.benefits': [
    'Изгарянето на мазнини се ускорява (липолиза)',
    'Започва ранно производство на кетонни тела',
    'Растежният хормон започва да се покачва'
  ],
  'stage.fat-burning.benefits': [
    'Подобрена инсулинова чувствителност',
    'Стабилна енергия от мастните запаси',
    'Леко потискане на апетита'
  ],
  'stage.ketosis.benefits': [
    'Умствена яснота и фокус',
    'Стабилна енергия без спадове',
    'Маркерите за възпаление започват да намаляват'
  ],
  'stage.autophagy.benefits': [
    'Усилено клетъчно почистване (автофагия)',
    'Скок на растежния хормон',
    'По-силни противовъзпалителни ефекти'
  ],
  'stage.deep-autophagy.benefits': [
    'Пикова активност на автофагията',
    'Започва регенерация на стволови клетки',
    'Инсулинова чувствителност в най-добрия си вид'
  ],
  'stage.prolonged.benefits': [
    'Регенерация на имунната система',
    'Максимален растежен хормон',
    'Дълбок метаболитен ресет'
  ]
};

const DICTS: Record<Language, Dict> = { en, bg };
const LIST_DICTS: Record<Language, Record<string, string[]>> = {
  en: enList,
  bg: bgList
};

function applyParams(
  str: string,
  params?: Record<string, string | number>
): string {
  if (!params) return str;
  let out = str;
  for (const [k, v] of Object.entries(params)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

export function translate(
  lang: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const raw = DICTS[lang]?.[key] ?? DICTS.en[key] ?? key;
  if (typeof raw !== 'string') return key;
  return applyParams(raw, params);
}

export function translateList(lang: Language, key: string): string[] {
  return LIST_DICTS[lang]?.[key] ?? LIST_DICTS.en[key] ?? [];
}

export const LanguageContext = createContext<Language>('bg');

export function useLang(): Language {
  return useContext(LanguageContext);
}

export function useT() {
  const lang = useLang();
  return (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);
}

export function useTList() {
  const lang = useLang();
  return (key: string) => translateList(lang, key);
}
