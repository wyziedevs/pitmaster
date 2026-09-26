// the "money" namespace: strings for MoneyCounter.svelte, the desktop bill
// counter toy. Digits.svelte (the seven-segment clock renderer) has nothing
// user-facing to translate, so it isn't represented here.
import type { Lang } from "./langs";

/**
 * a plural-sensitive phrase. `Intl.PluralRules` picks the category for a
 * given count, falling back to `other`; the chosen string's "{count}"
 * is filled in with the number.
 */
type Plural = { zero?: string; one?: string; two?: string; few?: string; many?: string; other: string };

export interface MoneyDict {
  /** aria-label on the pile of loose cash beside the machine */
  pileAriaLabel: string;
  /** small unit legend printed next to the LED count digits */
  pcsLabel: string;
  /** the "auto start" indicator lamp on the panel */
  autoLamp: string;
  /** aria-label on the Clear key */
  clearAriaLabel: string;
  /** visible caption on the Start key */
  start: string;
  /** aria-label on the Start key */
  startAriaLabel: string;
  /** "Strap {count} bill(s)"; the amount is appended by the caller */
  strapBills: Plural;
  /** "Put the {count} counted bill(s) back in the hopper" */
  putBack: Plural;
  /** aria-label when the stacker holds nothing yet */
  stackerEmpty: string;
  /** "{amount} strapped, break one open to count it again" */
  bricksStrapped: string;
  /** aria-label when no bricks have been strapped yet */
  noBricksYet: string;
  /** hint line, shown once a full strap is ready; "{n}" is the strap size */
  hintStrap: string;
  /** hint line, shown the rest of the time */
  hintDrag: string;
  /** "{count} bill(s) counted", the screen-reader summary's first half */
  billsCounted: Plural;
  /** "{amount} in all", the screen-reader summary's second half */
  totalAll: string;
}

export const money: Record<Lang, MoneyDict> = {
  en: {
    pileAriaLabel: "A pile of cash, put a bundle in the counter",
    pcsLabel: "pcs",
    autoLamp: "Auto",
    clearAriaLabel: "Clear the count",
    start: "Start",
    startAriaLabel: "Start counting",
    strapBills: { one: "Strap {count} bill", other: "Strap {count} bills" },
    putBack: { one: "Put the {count} counted bill back in the hopper", other: "Put the {count} counted bills back in the hopper" },
    stackerEmpty: "The stacker, empty",
    bricksStrapped: "{amount} strapped, break one open to count it again",
    noBricksYet: "No bricks yet",
    hintStrap: "Tap the stack to strap {n}.",
    hintDrag: "Drag cash from the pile into the hopper.",
    billsCounted: { one: "{count} bill counted", other: "{count} bills counted" },
    totalAll: "{amount} in all",
  },
  zh: {
    pileAriaLabel: "一堆现金,把一沓放进点钞机",
    pcsLabel: "张",
    autoLamp: "自动",
    clearAriaLabel: "清除计数",
    start: "开始",
    startAriaLabel: "开始计数",
    strapBills: { other: "捆扎 {count} 张钞票" },
    putBack: { other: "把这 {count} 张已数的钞票放回料斗" },
    stackerEmpty: "出钞槽,空的",
    bricksStrapped: "已捆扎 {amount},拆开一捆重新计数",
    noBricksYet: "还没有捆好的钞票",
    hintStrap: "点击这摞钞票,捆成 {n} 张一沓。",
    hintDrag: "把现金从这堆里拖进料斗。",
    billsCounted: { other: "已数 {count} 张" },
    totalAll: "共计 {amount}",
  },
  hi: {
    pileAriaLabel: "नकदी का ढेर, एक बंडल गिनती मशीन में डालें",
    pcsLabel: "नग",
    autoLamp: "ऑटो",
    clearAriaLabel: "गिनती साफ़ करें",
    start: "शुरू करें",
    startAriaLabel: "गिनती शुरू करें",
    strapBills: { other: "{count} नोट बांधें" },
    putBack: { other: "गिने गए {count} नोट वापस हॉपर में डालें" },
    stackerEmpty: "स्टैकर, खाली",
    bricksStrapped: "{amount} बंधे हुए, एक खोलकर फिर से गिनें",
    noBricksYet: "अभी तक कोई बंडल नहीं",
    hintStrap: "{n} नोटों का बंडल बनाने के लिए ढेर पर टैप करें।",
    hintDrag: "ढेर से नकदी को हॉपर में खींचें।",
    billsCounted: { other: "{count} नोट गिने गए" },
    totalAll: "कुल मिलाकर {amount}",
  },
  es: {
    pileAriaLabel: "Una pila de efectivo, coloca un fajo en la contadora",
    pcsLabel: "uds",
    autoLamp: "Auto",
    clearAriaLabel: "Borrar el conteo",
    start: "Iniciar",
    startAriaLabel: "Iniciar el conteo",
    strapBills: { one: "Enfajar {count} billete", other: "Enfajar {count} billetes" },
    putBack: { one: "Vuelve a poner el {count} billete contado en la tolva", other: "Vuelve a poner los {count} billetes contados en la tolva" },
    stackerEmpty: "El apilador, vacío",
    bricksStrapped: "{amount} enfajados, abre uno para volver a contarlo",
    noBricksYet: "Todavía no hay fajos",
    hintStrap: "Toca la pila para enfajar {n}.",
    hintDrag: "Arrastra el efectivo de la pila a la tolva.",
    billsCounted: { one: "{count} billete contado", other: "{count} billetes contados" },
    totalAll: "{amount} en total",
  },
  fr: {
    pileAriaLabel: "Une pile de billets, mets une liasse dans le compteur",
    pcsLabel: "pcs",
    autoLamp: "Auto",
    clearAriaLabel: "Effacer le compte",
    start: "Démarrer",
    startAriaLabel: "Démarrer le comptage",
    strapBills: { one: "Sangler {count} billet", other: "Sangler {count} billets" },
    putBack: { one: "Remets le {count} billet compté dans la trémie", other: "Remets les {count} billets comptés dans la trémie" },
    stackerEmpty: "L'empileur, vide",
    bricksStrapped: "{amount} sanglés, ouvre-en un pour le recompter",
    noBricksYet: "Pas encore de liasses",
    hintStrap: "Appuie sur la pile pour sangler {n} billets.",
    hintDrag: "Fais glisser des billets de la pile vers la trémie.",
    billsCounted: { one: "{count} billet compté", other: "{count} billets comptés" },
    totalAll: "{amount} au total",
  },
  ar: {
    pileAriaLabel: "كومة من النقود، ضع حزمة في عداد النقود",
    pcsLabel: "قطعة",
    autoLamp: "تلقائي",
    clearAriaLabel: "مسح العدد",
    start: "بدء",
    startAriaLabel: "بدء العد",
    strapBills: {
      one: "اربط {count} ورقة نقدية",
      two: "اربط {count} ورقتين نقديتين",
      few: "اربط {count} أوراق نقدية",
      many: "اربط {count} ورقة نقدية",
      other: "اربط {count} ورقة نقدية",
    },
    putBack: {
      one: "أعد {count} ورقة نقدية معدودة إلى صندوق التغذية",
      two: "أعد {count} ورقتين نقديتين معدودتين إلى صندوق التغذية",
      few: "أعد {count} أوراق نقدية معدودة إلى صندوق التغذية",
      many: "أعد {count} ورقة نقدية معدودة إلى صندوق التغذية",
      other: "أعد {count} ورقة نقدية معدودة إلى صندوق التغذية",
    },
    stackerEmpty: "صينية التكديس، فارغة",
    bricksStrapped: "{amount} مربوطة، افتح واحدة لعدّها مجددا",
    noBricksYet: "لا توجد حزم بعد",
    hintStrap: "اضغط على الكومة لربط {n} ورقة.",
    hintDrag: "اسحب النقود من الكومة إلى صندوق التغذية.",
    billsCounted: {
      one: "تم عدّ {count} ورقة نقدية",
      two: "تم عدّ {count} ورقتين نقديتين",
      few: "تم عدّ {count} أوراق نقدية",
      many: "تم عدّ {count} ورقة نقدية",
      other: "تم عدّ {count} ورقة نقدية",
    },
    totalAll: "بإجمالي {amount}",
  },
  bn: {
    pileAriaLabel: "নগদের স্তূপ, একটি বান্ডিল গণনাকারী যন্ত্রে রাখুন",
    pcsLabel: "টি",
    autoLamp: "অটো",
    clearAriaLabel: "গণনা মুছে ফেলুন",
    start: "শুরু করুন",
    startAriaLabel: "গণনা শুরু করুন",
    strapBills: { other: "{count}টি নোট বাঁধুন" },
    putBack: { other: "গোনা {count}টি নোট আবার হপারে রাখুন" },
    stackerEmpty: "গোছানোর ট্রে, খালি",
    bricksStrapped: "{amount} বাঁধা, একটি খুলে আবার গুনুন",
    noBricksYet: "এখনও কোনো বান্ডিল নেই",
    hintStrap: "{n}টি নোট বাঁধতে স্তূপে চাপ দিন।",
    hintDrag: "স্তূপ থেকে নগদ টেনে হপারে নিয়ে যান।",
    billsCounted: { other: "{count}টি নোট গোনা হয়েছে" },
    totalAll: "সর্বমোট {amount}",
  },
  pt: {
    pileAriaLabel: "Uma pilha de dinheiro, coloque um maço na contadora",
    pcsLabel: "pçs",
    autoLamp: "Auto",
    clearAriaLabel: "Limpar a contagem",
    start: "Iniciar",
    startAriaLabel: "Iniciar a contagem",
    strapBills: { one: "Cintar {count} nota", other: "Cintar {count} notas" },
    putBack: { one: "Coloque a {count} nota contada de volta na tremonha", other: "Coloque as {count} notas contadas de volta na tremonha" },
    stackerEmpty: "O empilhador, vazio",
    bricksStrapped: "{amount} cintados, abra um para contar de novo",
    noBricksYet: "Ainda não há maços",
    hintStrap: "Toque na pilha para cintar {n}.",
    hintDrag: "Arraste o dinheiro da pilha para a tremonha.",
    billsCounted: { one: "{count} nota contada", other: "{count} notas contadas" },
    totalAll: "{amount} no total",
  },
};
