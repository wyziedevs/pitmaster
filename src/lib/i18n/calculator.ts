// the floating calculator (Calculator.svelte) and its two thrown, user-facing
// error messages (calc.svelte.ts, threaded through by a stable error code).
import type { Lang } from "./langs";

export interface CalculatorDict {
  /** the popover's own accessible name */
  title: string;
  /** title on the bar, the strip it's dragged by */
  dragTitle: string;
  /** the Ghost toggle's accessible name (the icon's label) */
  ghostLabel: string;
  /** title on the Ghost toggle when ghost mode is already on (click turns it solid again) */
  ghostOn: string;
  /** title on the Ghost toggle when ghost mode is off */
  ghostOff: string;
  /** title on the show/hide-keys toggle when the keys are hidden */
  showKeysTitle: string;
  /** that toggle's icon label when the keys are hidden */
  showKeysLabel: string;
  /** title on the show/hide-keys toggle when the keys are showing */
  hideKeysTitle: string;
  /** that toggle's icon label when the keys are showing */
  hideKeysLabel: string;
  /** title on Close. {shortcut} is the key that reopens it */
  closeTitle: string;
  /** aria-label on the tape, the list of answers so far */
  tapeLabel: string;
  /** title on a line of the tape: bring that sum back to change it */
  changeSumTitle: string;
  /** title on a line's answer: use it. {value} is the formatted number */
  useValueTitle: string;
  /** title on the copy icon. {shortcut} is the key that copies */
  copyTitle: string;
  pot: {
    label: string;
    onTitle: string;
    offTitle: string;
    pot: string;
    toCall: string;
    maxRaise: string;
    takeTitle: string;
    useTitle: string;
  };
  /** the "Into X" action's label when a box on the page is known. {field} is its name */
  intoField: string;
  /** the same action's label when the box has no name of its own */
  intoBox: string;
  /** title on "Into X": what's about to be put where. {value} and {field} */
  putInTitle: string;
  /** stands in for {value} in putInTitle when there's nothing on the screen yet */
  putInValueFallback: string;
  /** stands in for {field} in putInTitle when the box has no name */
  putInFieldFallback: string;
  /** the Clear key's name when it clears the whole sum */
  clearAll: string;
  /** the Clear key's name when, on an already-clear screen, it tears off the tape */
  clearTape: string;
  openBracket: string;
  closeBracket: string;
  divide: string;
  percent: string;
  changeSign: string;
  backspace: string;
  times: string;
  minus: string;
  plus: string;
  equals: string;
  decimalPoint: string;
  /** shown on the screen for a divide-by-zero */
  errorDivideByZero: string;
  /** shown on the screen when the sum can't be read at all */
  errorCantWorkOut: string;
  /** shown on the screen when the answer is too large to show */
  errorTooBig: string;
}

export const calculator: Record<Lang, CalculatorDict> = {
  en: {
    title: "Calculator",
    dragTitle: "Drag to move. Toss it and it slides.",
    ghostLabel: "Ghost",
    ghostOn: "Solid again",
    ghostOff: "Ghost: see-through, and clicks go to the page underneath",
    showKeysTitle: "Show the keys",
    showKeysLabel: "Show keys",
    hideKeysTitle: "Just the answer",
    hideKeysLabel: "Hide keys",
    closeTitle: "Close ({shortcut} opens it again)",
    tapeLabel: "Tape",
    changeSumTitle: "Change this sum",
    useValueTitle: "Use {value}",
    copyTitle: "Copy ({shortcut})",
    pot: {
      label: "Pot Limit",
      onTitle: "Pot limit: the most a raise can be",
      offTitle: "Hide pot limit",
      pot: "Pot",
      toCall: "To Call",
      maxRaise: "Max to Put In",
      takeTitle: "Take the number on the display",
      useTitle: "Use this number",
    },
    intoField: "Into {field}",
    intoBox: "Into the Box",
    putInTitle: "Put {value} in {field}",
    putInValueFallback: "it",
    putInFieldFallback: "that box",
    clearAll: "All Clear",
    clearTape: "Clear the Tape",
    openBracket: "Open bracket",
    closeBracket: "Close bracket",
    divide: "Divide",
    percent: "Percent",
    changeSign: "Change sign",
    backspace: "Backspace",
    times: "Times",
    minus: "Minus",
    plus: "Plus",
    equals: "Equals",
    decimalPoint: "Decimal point",
    errorDivideByZero: "Can't Divide by 0",
    errorCantWorkOut: "Can't Work That Out",
    errorTooBig: "Too Big",
  },
  zh: {
    title: "计算器",
    dragTitle: "拖动可移动位置,松手会滑动,慢慢停下。",
    ghostLabel: "幽灵",
    ghostOn: "恢复为实体",
    ghostOff: "幽灵模式,半透明,点击会穿透到下面的页面",
    showKeysTitle: "显示按键",
    showKeysLabel: "显示按键",
    hideKeysTitle: "只看结果",
    hideKeysLabel: "隐藏按键",
    closeTitle: "关闭({shortcut} 可再次打开)",
    tapeLabel: "计算记录",
    changeSumTitle: "修改这条算式",
    useValueTitle: "使用 {value}",
    copyTitle: "复制({shortcut})",
    pot: {
      label: "底池限注",
      onTitle: "底池限注：加注的最大额度",
      offTitle: "隐藏底池限注",
      pot: "底池",
      toCall: "跟注额",
      maxRaise: "最多投入",
      takeTitle: "取显示屏上的数字",
      useTitle: "使用这个数字",
    },
    intoField: "填入{field}",
    intoBox: "填入输入框",
    putInTitle: "将{value}填入{field}",
    putInValueFallback: "它",
    putInFieldFallback: "那个输入框",
    clearAll: "全部清除",
    clearTape: "清空记录",
    openBracket: "左括号",
    closeBracket: "右括号",
    divide: "除号",
    percent: "百分号",
    changeSign: "正负号",
    backspace: "退格",
    times: "乘号",
    minus: "减号",
    plus: "加号",
    equals: "等于号",
    decimalPoint: "小数点",
    errorDivideByZero: "不能除以 0",
    errorCantWorkOut: "算不出来",
    errorTooBig: "数字太大",
  },
  hi: {
    title: "कैलकुलेटर",
    dragTitle: "खींचकर हटाएं। छोड़ने पर यह सरककर रुक जाएगा।",
    ghostLabel: "घोस्ट",
    ghostOn: "फिर से ठोस करें",
    ghostOff: "घोस्ट मोड, आर-पार दिखेगा, और क्लिक नीचे पेज पर पहुंचेगा",
    showKeysTitle: "बटन दिखाएं",
    showKeysLabel: "बटन दिखाएं",
    hideKeysTitle: "सिर्फ़ जवाब",
    hideKeysLabel: "बटन छुपाएं",
    closeTitle: "बंद करें ({shortcut} से फिर खुलेगा)",
    tapeLabel: "इतिहास",
    changeSumTitle: "यह जोड़ बदलें",
    useValueTitle: "{value} का उपयोग करें",
    copyTitle: "कॉपी करें ({shortcut})",
    pot: {
      label: "पॉट लिमिट",
      onTitle: "पॉट लिमिट: रेज़ ज़्यादा से ज़्यादा कितनी हो सकती है",
      offTitle: "पॉट लिमिट छिपाएं",
      pot: "पॉट",
      toCall: "कॉल के लिए",
      maxRaise: "ज़्यादा से ज़्यादा डालें",
      takeTitle: "डिस्प्ले वाला नंबर लें",
      useTitle: "यह नंबर इस्तेमाल करें",
    },
    intoField: "{field} में डालें",
    intoBox: "बॉक्स में डालें",
    putInTitle: "{value} को {field} में डालें",
    putInValueFallback: "इसे",
    putInFieldFallback: "उस बॉक्स",
    clearAll: "सब साफ़ करें",
    clearTape: "इतिहास मिटाएं",
    openBracket: "खुला कोष्ठक",
    closeBracket: "बंद कोष्ठक",
    divide: "भाग",
    percent: "प्रतिशत",
    changeSign: "चिह्न बदलें",
    backspace: "बैकस्पेस",
    times: "गुणा",
    minus: "घटाव",
    plus: "जोड़",
    equals: "बराबर",
    decimalPoint: "दशमलव बिंदु",
    errorDivideByZero: "0 से भाग नहीं हो सकता",
    errorCantWorkOut: "यह हल नहीं हो सका",
    errorTooBig: "संख्या बहुत बड़ी है",
  },
  es: {
    title: "Calculadora",
    dragTitle: "Arrastra para moverla. Suéltala y se desliza hasta detenerse.",
    ghostLabel: "Fantasma",
    ghostOn: "Volver a sólida",
    ghostOff: "Fantasma, transparente, y los clics pasan a la página de abajo",
    showKeysTitle: "Mostrar las teclas",
    showKeysLabel: "Mostrar teclas",
    hideKeysTitle: "Solo el resultado",
    hideKeysLabel: "Ocultar teclas",
    closeTitle: "Cerrar ({shortcut} la abre de nuevo)",
    tapeLabel: "Historial",
    changeSumTitle: "Cambiar esta operación",
    useValueTitle: "Usar {value}",
    copyTitle: "Copiar ({shortcut})",
    pot: {
      label: "Pot Limit",
      onTitle: "Pot limit: lo máximo que puede ser una subida",
      offTitle: "Ocultar pot limit",
      pot: "Bote",
      toCall: "Para Igualar",
      maxRaise: "Máximo a Poner",
      takeTitle: "Tomar el número de la pantalla",
      useTitle: "Usar este número",
    },
    intoField: "En {field}",
    intoBox: "En el campo",
    putInTitle: "Poner {value} en {field}",
    putInValueFallback: "el valor",
    putInFieldFallback: "ese campo",
    clearAll: "Borrar todo",
    clearTape: "Borrar el historial",
    openBracket: "Abrir paréntesis",
    closeBracket: "Cerrar paréntesis",
    divide: "Dividir",
    percent: "Porcentaje",
    changeSign: "Cambiar signo",
    backspace: "Retroceso",
    times: "Multiplicar",
    minus: "Menos",
    plus: "Más",
    equals: "Igual",
    decimalPoint: "Punto decimal",
    errorDivideByZero: "No se puede dividir entre 0",
    errorCantWorkOut: "No se pudo resolver",
    errorTooBig: "Demasiado grande",
  },
  fr: {
    title: "Calculatrice",
    dragTitle: "Glisser pour la déplacer. Lâchez-la et elle glisse jusqu'à l'arrêt.",
    ghostLabel: "Fantôme",
    ghostOn: "Redevenir opaque",
    ghostOff: "Fantôme, transparente, les clics passent à la page en dessous",
    showKeysTitle: "Afficher les touches",
    showKeysLabel: "Afficher les touches",
    hideKeysTitle: "Juste le résultat",
    hideKeysLabel: "Masquer les touches",
    closeTitle: "Fermer ({shortcut} la rouvre)",
    tapeLabel: "Historique",
    changeSumTitle: "Modifier ce calcul",
    useValueTitle: "Utiliser {value}",
    copyTitle: "Copier ({shortcut})",
    pot: {
      label: "Pot Limit",
      onTitle: "Pot limit : le maximum d'une relance",
      offTitle: "Masquer le pot limit",
      pot: "Pot",
      toCall: "Pour Suivre",
      maxRaise: "Max à Miser",
      takeTitle: "Prendre le nombre affiché",
      useTitle: "Utiliser ce nombre",
    },
    intoField: "Dans {field}",
    intoBox: "Dans le champ",
    putInTitle: "Mettre {value} dans {field}",
    putInValueFallback: "la valeur",
    putInFieldFallback: "ce champ",
    clearAll: "Tout effacer",
    clearTape: "Effacer l'historique",
    openBracket: "Parenthèse ouvrante",
    closeBracket: "Parenthèse fermante",
    divide: "Diviser",
    percent: "Pourcentage",
    changeSign: "Changer de signe",
    backspace: "Retour arrière",
    times: "Multiplier",
    minus: "Moins",
    plus: "Plus",
    equals: "Égal",
    decimalPoint: "Point décimal",
    errorDivideByZero: "Division par 0 impossible",
    errorCantWorkOut: "Impossible à résoudre",
    errorTooBig: "Trop grand",
  },
  ar: {
    title: "الآلة الحاسبة",
    dragTitle: "اسحب لتحريكها. أفلتها فتنزلق حتى تتوقف.",
    ghostLabel: "شبح",
    ghostOn: "العودة صلبة",
    ghostOff: "وضع الشبح, شفافة, والنقر يصل إلى الصفحة تحتها",
    showKeysTitle: "إظهار المفاتيح",
    showKeysLabel: "إظهار المفاتيح",
    hideKeysTitle: "الناتج فقط",
    hideKeysLabel: "إخفاء المفاتيح",
    closeTitle: "إغلاق ({shortcut} يفتحها من جديد)",
    tapeLabel: "السجل",
    changeSumTitle: "تعديل هذه العملية",
    useValueTitle: "استخدام {value}",
    copyTitle: "نسخ ({shortcut})",
    pot: {
      label: "حد البوت",
      onTitle: "حد البوت: أقصى ما يمكن أن تبلغه الزيادة",
      offTitle: "إخفاء حد البوت",
      pot: "البوت",
      toCall: "مبلغ المجاراة",
      maxRaise: "أقصى ما يُدفع",
      takeTitle: "أخذ الرقم المعروض على الشاشة",
      useTitle: "استخدام هذا الرقم",
    },
    intoField: "إلى {field}",
    intoBox: "إلى الحقل",
    putInTitle: "وضع {value} في {field}",
    putInValueFallback: "القيمة",
    putInFieldFallback: "ذلك الحقل",
    clearAll: "مسح الكل",
    clearTape: "مسح السجل",
    openBracket: "قوس فتح",
    closeBracket: "قوس إغلاق",
    divide: "قسمة",
    percent: "نسبة مئوية",
    changeSign: "تغيير الإشارة",
    backspace: "حذف للخلف",
    times: "ضرب",
    minus: "طرح",
    plus: "جمع",
    equals: "يساوي",
    decimalPoint: "الفاصلة العشرية",
    errorDivideByZero: "لا يمكن القسمة على 0",
    errorCantWorkOut: "تعذر حل هذه العملية",
    errorTooBig: "الرقم كبير جدا",
  },
  bn: {
    title: "ক্যালকুলেটর",
    dragTitle: "টেনে সরান। ছেড়ে দিলে এটি পিছলে গিয়ে থামবে।",
    ghostLabel: "ভূত",
    ghostOn: "আবার নিরেট করুন",
    ghostOff: "ভূত মোড, স্বচ্ছ, ক্লিক নিচের পাতায় চলে যাবে",
    showKeysTitle: "বোতাম দেখান",
    showKeysLabel: "বোতাম দেখান",
    hideKeysTitle: "শুধু উত্তর",
    hideKeysLabel: "বোতাম লুকান",
    closeTitle: "বন্ধ করুন ({shortcut} আবার খুলবে)",
    tapeLabel: "ইতিহাস",
    changeSumTitle: "এই হিসাবটি পাল্টান",
    useValueTitle: "{value} ব্যবহার করুন",
    copyTitle: "কপি করুন ({shortcut})",
    pot: {
      label: "পট লিমিট",
      onTitle: "পট লিমিট: রেইজ সর্বোচ্চ কত হতে পারে",
      offTitle: "পট লিমিট লুকান",
      pot: "পট",
      toCall: "কল করতে",
      maxRaise: "সর্বোচ্চ দেওয়া যায়",
      takeTitle: "ডিসপ্লের সংখ্যাটি নিন",
      useTitle: "এই সংখ্যাটি ব্যবহার করুন",
    },
    intoField: "{field} এ বসান",
    intoBox: "বাক্সে বসান",
    putInTitle: "{value}-কে {field}-এ বসান",
    putInValueFallback: "এটি",
    putInFieldFallback: "ওই বাক্স",
    clearAll: "সব মুছুন",
    clearTape: "ইতিহাস মুছুন",
    openBracket: "শুরুর বন্ধনী",
    closeBracket: "শেষের বন্ধনী",
    divide: "ভাগ",
    percent: "শতাংশ",
    changeSign: "চিহ্ন পাল্টান",
    backspace: "ব্যাকস্পেস",
    times: "গুণ",
    minus: "বিয়োগ",
    plus: "যোগ",
    equals: "সমান",
    decimalPoint: "দশমিক বিন্দু",
    errorDivideByZero: "0 দিয়ে ভাগ করা যায় না",
    errorCantWorkOut: "এটি বের করা গেল না",
    errorTooBig: "সংখ্যাটি অনেক বড়",
  },
  pt: {
    title: "Calculadora",
    dragTitle: "Arraste para mover. Solte e ela desliza até parar.",
    ghostLabel: "Fantasma",
    ghostOn: "Voltar a ficar sólida",
    ghostOff: "Fantasma, transparente, e os cliques passam para a página abaixo",
    showKeysTitle: "Mostrar as teclas",
    showKeysLabel: "Mostrar teclas",
    hideKeysTitle: "Só o resultado",
    hideKeysLabel: "Ocultar teclas",
    closeTitle: "Fechar ({shortcut} abre de novo)",
    tapeLabel: "Histórico",
    changeSumTitle: "Alterar esta conta",
    useValueTitle: "Usar {value}",
    copyTitle: "Copiar ({shortcut})",
    pot: {
      label: "Pot Limit",
      onTitle: "Pot limit: o máximo que um aumento pode ser",
      offTitle: "Ocultar pot limit",
      pot: "Pote",
      toCall: "Para Pagar",
      maxRaise: "Máximo a Pôr",
      takeTitle: "Pegar o número do visor",
      useTitle: "Usar este número",
    },
    intoField: "Em {field}",
    intoBox: "No campo",
    putInTitle: "Colocar {value} em {field}",
    putInValueFallback: "o valor",
    putInFieldFallback: "esse campo",
    clearAll: "Limpar tudo",
    clearTape: "Limpar o histórico",
    openBracket: "Abrir parêntese",
    closeBracket: "Fechar parêntese",
    divide: "Dividir",
    percent: "Porcentagem",
    changeSign: "Trocar o sinal",
    backspace: "Apagar",
    times: "Multiplicar",
    minus: "Menos",
    plus: "Mais",
    equals: "Igual",
    decimalPoint: "Ponto decimal",
    errorDivideByZero: "Não é possível dividir por 0",
    errorCantWorkOut: "Não deu para resolver",
    errorTooBig: "Número grande demais",
  },
};
