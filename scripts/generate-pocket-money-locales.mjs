/**
 * Generates locales/{he,en,es}/pocketMoney.json
 * Run: node scripts/generate-pocket-money-locales.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "locales");

const shared = {
  scale: { 1: "", 2: "", 3: "", 4: "", 5: "" },
};

const he = {
  intro: {
    eyebrow: "דמי כיס בשותפות משפחתית",
    title: "מחשבון דמי כיס לילדים",
    body: "הורה וילד בוחרים רקע קצר, עונים יחד על שאלון, ומקבלים תוכנית דמי כיס: סכום מומלץ, חלוקה לחיסכון/הוצאה/תרומה, וטיפים פרקטיים. הכל נשאר בדפדפן.",
  },
  setup: {
    title: "רקע קצר",
    subtitle: "הבחירות האלה מכווננות את השאלות וההמלצות.",
    ageLabel: "גיל הילד/ה",
    modelLabel: "מודל דמי הכיס",
    goalLabel: "מטרת העל כרגע",
    continue: "המשיכו לבחירת שאלון",
    age: {
      young: "צעירים 6–9",
      tween: "מתבגרים 10–14",
      teen: "בני נוער 15–18",
    },
    model: {
      fixed: "סכום קבוע מראש",
      chores: "מבוסס מטלות בבית",
      hybrid: "משולב: בסיס + חיסכון/יוזמה",
    },
    goal: {
      delay: "לימוד דחיית סיפוקים",
      "save-goal": "חיסכון למטרה גדולה",
      independence: "ניהול תקציב עצמאי ראשון",
      value: "הבנת ערך הכסף",
    },
  },
  modes: {
    quick: "שאלון מהיר",
    quickMeta: "כ־10 שאלות · כ־2 דקות",
    full: "תוכנית משפחתית מלאה",
    fullMeta: "25 שאלות · 6–8 דקות",
    backToSetup: "חזרה לרקע",
  },
  scale: {
    1: "כמעט אף פעם",
    2: "לעיתים רחוקות",
    3: "לפעמים",
    4: "לרוב",
    5: "כמעט תמיד",
  },
  currency: { symbol: "₪", code: "ILS" },
  actions: {
    start: "התחילו",
    next: "הבא",
    back: "הקודם",
    finish: "סיימו וקבלו תוכנית",
    restart: "תוכנית חדשה",
    changeMode: "החלפת מצב",
    newInsight: "תובנה נוספת",
    share: "שתפו",
    copied: "הועתק!",
    backToTools: "חזרה לכלים",
    downloadCard: "הורדת כרטיס",
    copyCard: "העתקת כרטיס",
    copyText: "העתקת טקסט",
  },
  progress: {
    label: "שאלה {{current}} מתוך {{total}}",
    percent: "{{percent}}%",
  },
  result: {
    caption: "תוכנית דמי כיס משפחתית",
    overall: "מדד שותפות פיננסית",
    amount: "סכום חודשי מומלץ",
    amountRange: "{{min}}–{{max}} {{symbol}} · מיקוד {{mid}} {{symbol}}",
    amountNote: "המלצה חינוכית — התאימו למציאות המשפחתית שלכם.",
    split: "חלוקה חכמה",
    spend: "הוצאות / כיף",
    save: "חיסכון",
    give: "תרומה / קהילה",
    dimensions: "מדדים",
    insights: "תובנות",
    tips: "טיפים פרקטיים",
    habits: "הרגלים לשותפות",
    setupSummary: "רקע",
    cardTitle: "כרטיס תוצאה",
    cardFooter: "dailylogic.app · מחשבון דמי כיס",
    shareText:
      "תוכנית דמי הכיס שלנו: {{profile}} · {{mid}} {{symbol}} · חיסכון {{save}}% | מחשבון דמי כיס — לוגיקה יומית",
    resultSummary:
      "{{profile}} · {{mid}} {{symbol}} · חיסכון {{save}}% · {{mode}}",
    bands: {
      "needs-care": "צריך מבנה ברור",
      developing: "בתרגול משותף",
      steady: "יציב ולומד",
      strong: "שותפות חזקה",
    },
    dimensionLabels: {
      moneyResponsibility: "אחריות על הכסף",
      savingDiscipline: "משמעת חיסכון",
      familyPartnership: "שותפות משפחתית",
      spendingWisdom: "חוכמת הוצאה",
    },
  },
  card: {
    saved: "הכרטיס הורד",
    copied: "הכרטיס הועתק",
    copyFailed: "לא ניתן להעתיק תמונה — הורידו במקום",
  },
  profiles: {
    "steady-partners": "שותפים יציבים לכסף בבית",
    "savvy-team": "צוות פיננסי חכם לגיל",
    "trust-builders": "בונים אמון דרך שקיפות",
    "learning-crew": "צוות שלומד ביחד",
    "fair-starters": "מתחילים בהוגנות",
    "growing-together": "גדלים יחד עם הכללים",
    "needs-structure": "צריך מבנה פשוט יותר",
    "practice-week": "שבוע תרגול לפני הרחבה",
    "clarify-rules": "ליישר קו על הכללים",
    "reset-gently": "איפוס עדין — בלי בושה",
    "start-smaller": "להתחיל מסכום קטן יותר",
    "talk-first": "קודם שיחה — אחר כך סכום",
  },
  insights: {
    "dim-moneyResponsibility-high":
      "יש תחושת בעלות על הכסף — שמרו על מעקב פשוט כדי שלא יישחק.",
    "dim-moneyResponsibility-low":
      "כשהכסף \"נעלם\" בלי סיפור — הכינו תוכנית למה קורה כשהארנק ריק.",
    "dim-savingDiscipline-high":
      "החיסכון מרגיש אמיתי אצלכם — חגגו אבני דרך קטנות בקול.",
    "dim-savingDiscipline-low":
      "בלי יעד נראה לעין, החיסכון נדחה. תלו תמונה של המטרה ליד הקופה.",
    "dim-familyPartnership-high":
      "יש תחושת שותפות — אל תשכחו לחדש את הכללים כל כמה חודשים.",
    "dim-familyPartnership-low":
      "אם רק צד אחד קובע — דמי הכיס הופכים למאבק. שבו 15 דקות לקבוע יחד.",
    "dim-spendingWisdom-high":
      "יש עצירה לפני קנייה — זה שריר נדיר. תגמלו אותו במילים, לא רק בכסף.",
    "dim-spendingWisdom-low":
      "בקשות ספונטניות שוברות תקציב. נסו כלל 24 שעות לדברים שאינם דחופים.",
    "overall-strong":
      "הבסיס חזק — זה הזמן לעגן הרגלים בכתב (סכום, חלוקה, מה קורה כשנגמר).",
    "overall-steady":
      "יש כיוון טוב עם נקודות לחיזוק — בחרו הרגל אחד לשבועיים הקרובים.",
    "overall-developing":
      "יש רצון, אבל הכללים עדיין מטושטשים. פשטו לפני שמעלים סכום.",
    "overall-needs-care":
      "עדיף לאפס בעדינות: סכום קטן יותר, כללים ברורים, ושיחה בלי האשמה.",
    "age-young":
      "בגיל הצעיר: ויזואליות מנצחת — קופות צבעוניות וספירה פיזית של מטבעות.",
    "age-tween":
      "בגיל הביניים: לחץ חברים עולה — תרגלו \"לא\" מנומס ותכנון מראש.",
    "age-teen":
      "בגיל הנוער: עצמאות דיגיטלית דורשת שקיפות בלי מעקב חונק.",
    "model-fixed":
      "במודל קבוע: ודאו שהסכום מותאם ליכולת האחריות — לא רק לנוחות.",
    "model-chores":
      "במודל מטלות: הבדילו בין חובות בית לבין מטלות בתשלום — כדי לא לסחור בכבוד.",
    "model-hybrid":
      "במודל משולב: שמרו על בסיס יציב + מסלול בונוס לחיסכון/יוזמה.",
    "goal-delay":
      "למטרת דחיית סיפוקים: כלל המתנה קבוע חשוב יותר מסכום גבוה.",
    "goal-save-goal":
      "למטרת חיסכון גדול: חלקו את היעד לשלבים קצרים עם תאריך יעד.",
    "goal-independence":
      "לתקציב עצמאי: תנו מרחב לטעות קטנה — ואז לנתח אותה ביחד.",
    "goal-value":
      "להבנת ערך הכסף: השוו מחירים וכללו תרומה קטנה כחלק מהחלוקה.",
  },
  tips: {
    "tip-sunday-reset":
      "איפוס יום ראשון: סופרים יחד מה נשאר ומתכננים את השבוע בקצרה.",
    "tip-empty-wallet-plan":
      "כתבו מראש: מה קורה כשנגמר — בלי הלוואה אוטומטית מההורים.",
    "tip-visible-tracker":
      "מעקב נראה לעין (מחברת/אפליקציה פשוטה) — 30 שניות אחרי כל קנייה.",
    "tip-pay-yourself-first":
      "מיד עם קבלת דמי הכיס — מעבירים לחיסכון לפני הכיף.",
    "tip-photo-goal":
      "תמונת היעד על המקרר או במסך הנעילה — תזכורת יומיומית.",
    "tip-match-small":
      "התאמת הורים קטנה לחיסכון (למשל 1:1 עד תקרה) מעודדת בלי לקנות הכל.",
    "tip-family-meeting":
      "פגישת דמי כיס חודשית של 15 דקות — סכום, מה עבד, מה משנים.",
    "tip-chore-menu":
      "תפריט מטלות: חובה משפחתית מול מטלות בונוס בתשלום — בשקיפות.",
    "tip-two-voices":
      "כל שינוי בכללים דורש הסכמת שני הצדדים — גם הילד וגם ההורה.",
    "tip-24h-pause":
      "כל קנייה לא דחופה מעל סף מוסכם — ממתינים 24 שעות.",
    "tip-needs-wants-list":
      "רשימת צרכים מול רצונות על דף אחד — מעדכנים פעם בשבוע.",
    "tip-give-jar":
      "קופת תרומה קטנה: בחירת מטרה יחד פעם ברבעון.",
    "tip-monthly-review":
      "בסוף החודש: מה למדנו, לא רק כמה נשאר.",
  },
  habits: {
    "habit-jar-split":
      "שלוש קופות/מעטפות: הוצאה, חיסכון, תרומה — לפי האחוזים שסוכמו.",
    "habit-receipt-photo":
      "צילום קבלה או רישום מיידי — כדי שהזיכרון לא \"ישפץ\" את הסיפור.",
    "habit-goal-countdown":
      "ספירה לאחור ליעד: כמה שבועות נשארו וכמה חסר בכל שבוע.",
    "habit-praise-ritual":
      "טקס שבחים על התנהלות טובה — לא רק על קנייה מוצלחת.",
    "habit-no-bailout-default":
      "ברירת מחדל: אין חילוץ אוטומטי. חריגים רק בשיחה מוסכמת.",
    "habit-earn-bonus-lane":
      "מסלול בונוס מוגבל: יוזמה קטנה/מטלה מיוחדת — בלי להחליף את הבסיס.",
  },
  questions: {},
};

const en = {
  intro: {
    eyebrow: "Kids allowance as a family partnership",
    title: "Pocket Money Calculator",
    body: "Parent and child set a short background, answer together, and get a family allowance plan: a fair monthly range, spend/save/give split, and practical tips. Everything stays in the browser.",
  },
  setup: {
    title: "Quick background",
    subtitle: "These choices tune the questions and recommendations.",
    ageLabel: "Child’s age",
    modelLabel: "Current allowance model",
    goalLabel: "Main money goal right now",
    continue: "Continue to quiz length",
    age: {
      young: "Young kids 6–9",
      tween: "Tweens 10–14",
      teen: "Teens 15–18",
    },
    model: {
      fixed: "Fixed amount",
      chores: "Chore-based",
      hybrid: "Hybrid: base + saving/enterprise",
    },
    goal: {
      delay: "Learn delayed gratification",
      "save-goal": "Save for a big goal",
      independence: "First independent budget",
      value: "Understand money’s value",
    },
  },
  modes: {
    quick: "Quick setup",
    quickMeta: "~10 light questions · ~2 minutes",
    full: "Full family blueprint",
    fullMeta: "25 questions · 6–8 minutes",
    backToSetup: "Back to background",
  },
  scale: {
    1: "Almost never",
    2: "Rarely",
    3: "Sometimes",
    4: "Usually",
    5: "Almost always",
  },
  currency: { symbol: "$", code: "USD" },
  actions: {
    start: "Start",
    next: "Next",
    back: "Back",
    finish: "Finish & get the plan",
    restart: "New plan",
    changeMode: "Change mode",
    newInsight: "Another insight",
    share: "Share",
    copied: "Copied!",
    backToTools: "Back to tools",
    downloadCard: "Download card",
    copyCard: "Copy card",
    copyText: "Copy text",
  },
  progress: {
    label: "Question {{current}} of {{total}}",
    percent: "{{percent}}%",
  },
  result: {
    caption: "Family pocket-money plan",
    overall: "Financial partnership score",
    amount: "Recommended monthly amount",
    amountRange: "{{min}}–{{max}} {{symbol}} · focus {{mid}} {{symbol}}",
    amountNote: "An educational guide — adapt to your household reality.",
    split: "Smart split",
    spend: "Spend / fun",
    save: "Save",
    give: "Give / community",
    dimensions: "Scores",
    insights: "Insights",
    tips: "Practical tips",
    habits: "Partnership habits",
    setupSummary: "Background",
    cardTitle: "Result card",
    cardFooter: "dailylogic.app · Pocket Money Calculator",
    shareText:
      "Our pocket-money plan: {{profile}} · {{mid}} {{symbol}} · save {{save}}% | Pocket Money — DailyLogic",
    resultSummary:
      "{{profile}} · {{mid}} {{symbol}} · save {{save}}% · {{mode}}",
    bands: {
      "needs-care": "Needs clear structure",
      developing: "Practicing together",
      steady: "Steady and learning",
      strong: "Strong partnership",
    },
    dimensionLabels: {
      moneyResponsibility: "Money responsibility",
      savingDiscipline: "Saving discipline",
      familyPartnership: "Family partnership",
      spendingWisdom: "Spending wisdom",
    },
  },
  card: {
    saved: "Card downloaded",
    copied: "Card copied",
    copyFailed: "Couldn’t copy image — download instead",
  },
  profiles: {
    "steady-partners": "Steady money partners at home",
    "savvy-team": "Age-smart money team",
    "trust-builders": "Building trust through transparency",
    "learning-crew": "Learning crew",
    "fair-starters": "Fair starters",
    "growing-together": "Growing with the rules",
    "needs-structure": "Needs simpler structure",
    "practice-week": "Practice week before scaling up",
    "clarify-rules": "Clarify the rules first",
    "reset-gently": "Gentle reset — no shame",
    "start-smaller": "Start with a smaller amount",
    "talk-first": "Talk first — then set the amount",
  },
  insights: {
    "dim-moneyResponsibility-high":
      "There’s real ownership of money — keep a simple tracker so it doesn’t fade.",
    "dim-moneyResponsibility-low":
      "When cash “vanishes” without a story — write what happens when the wallet is empty.",
    "dim-savingDiscipline-high":
      "Saving feels real — celebrate small milestones out loud.",
    "dim-savingDiscipline-low":
      "Without a visible goal, saving slips. Put a goal photo by the jar.",
    "dim-familyPartnership-high":
      "Partnership feels present — renew the rules every few months.",
    "dim-familyPartnership-low":
      "If only one side decides, allowance becomes a fight. Take 15 minutes to co-write rules.",
    "dim-spendingWisdom-high":
      "There’s a pause before buying — reward that muscle with words, not only money.",
    "dim-spendingWisdom-low":
      "Impulse asks break budgets. Try a 24-hour rule for non-urgent wants.",
    "overall-strong":
      "The base is strong — write down amount, split, and empty-wallet rules.",
    "overall-steady":
      "Good direction with a few soft spots — pick one habit for the next two weeks.",
    "overall-developing":
      "Willingness is there, rules are fuzzy. Simplify before raising the amount.",
    "overall-needs-care":
      "Reset gently: smaller amount, clearer rules, conversation without blame.",
    "age-young":
      "At this age, visuals win — colorful jars and counting coins in hand.",
    "age-tween":
      "Friend pressure rises — practice a polite “not this week” and plan ahead.",
    "age-teen":
      "Digital independence needs transparency without smothering surveillance.",
    "model-fixed":
      "With a fixed model: match the amount to responsibility — not only convenience.",
    "model-chores":
      "With chores: separate family duties from paid extras — don’t trade dignity for cash.",
    "model-hybrid":
      "Hybrid works best with a stable base plus a clear bonus lane for saving/enterprise.",
    "goal-delay":
      "For delayed gratification: a waiting rule matters more than a bigger sum.",
    "goal-save-goal":
      "For a big goal: break it into short milestones with dates.",
    "goal-independence":
      "For independence: allow a small mistake — then review it together.",
    "goal-value":
      "For money value: compare prices and keep a small give share in the split.",
  },
  tips: {
    "tip-sunday-reset":
      "Sunday reset: count what’s left and sketch the week in two minutes.",
    "tip-empty-wallet-plan":
      "Write the empty-wallet plan — no automatic parent bailout.",
    "tip-visible-tracker":
      "A visible tracker (notebook/simple app) — 30 seconds after each purchase.",
    "tip-pay-yourself-first":
      "On payday: move savings first, then fun money.",
    "tip-photo-goal":
      "Goal photo on the fridge or lock screen — daily reminder.",
    "tip-match-small":
      "A small parent match on savings (e.g. 1:1 up to a cap) motivates without buying everything.",
    "tip-family-meeting":
      "A 15-minute monthly allowance meeting — amount, what worked, what changes.",
    "tip-chore-menu":
      "Chore menu: family duties vs paid bonus tasks — written and clear.",
    "tip-two-voices":
      "Rule changes need both voices — child and parent.",
    "tip-24h-pause":
      "Non-urgent buys above an agreed threshold wait 24 hours.",
    "tip-needs-wants-list":
      "One-page needs vs wants list — refresh weekly.",
    "tip-give-jar":
      "A small give jar: pick a cause together each quarter.",
    "tip-monthly-review":
      "Month-end: what we learned, not only what remained.",
  },
  habits: {
    "habit-jar-split":
      "Three jars/envelopes: spend, save, give — at the agreed percentages.",
    "habit-receipt-photo":
      "Snap a receipt or jot it down immediately — memory rewrites stories.",
    "habit-goal-countdown":
      "Countdown to the goal: weeks left and weekly shortfall.",
    "habit-praise-ritual":
      "Praise good process — not only cool purchases.",
    "habit-no-bailout-default":
      "Default: no automatic bailout. Exceptions only after an agreed talk.",
    "habit-earn-bonus-lane":
      "A capped bonus lane for small enterprise/extra tasks — without replacing the base.",
  },
  questions: {},
};

const es = {
  intro: {
    eyebrow: "Mesada como sociedad familiar",
    title: "Calculadora de mesada / dinero de bolsillo",
    body: "Padre/madre e hijo/a eligen un contexto breve, responden juntos y reciben un plan: rango mensual recomendado, reparto gastar/ahorrar/donar y consejos prácticos. Todo queda en el navegador.",
  },
  setup: {
    title: "Contexto breve",
    subtitle: "Estas elecciones ajustan las preguntas y recomendaciones.",
    ageLabel: "Edad del niño/a",
    modelLabel: "Modelo actual de mesada",
    goalLabel: "Objetivo principal ahora",
    continue: "Continuar a elegir el cuestionario",
    age: {
      young: "Niños 6–9",
      tween: "Precios 10–14",
      teen: "Adolescentes 15–18",
    },
    model: {
      fixed: "Cantidad fija",
      chores: "Basado en tareas",
      hybrid: "Híbrido: base + ahorro/emprendimiento",
    },
    goal: {
      delay: "Aprender a diferir gratificación",
      "save-goal": "Ahorrar para una meta grande",
      independence: "Primer presupuesto independiente",
      value: "Entender el valor del dinero",
    },
  },
  modes: {
    quick: "Configuración rápida",
    quickMeta: "~10 preguntas ligeras · ~2 minutos",
    full: "Plan familiar completo",
    fullMeta: "25 preguntas · 6–8 minutos",
    backToSetup: "Volver al contexto",
  },
  scale: {
    1: "Casi nunca",
    2: "Rara vez",
    3: "A veces",
    4: "Habitualmente",
    5: "Casi siempre",
  },
  currency: { symbol: "€", code: "EUR" },
  actions: {
    start: "Empezar",
    next: "Siguiente",
    back: "Atrás",
    finish: "Terminar y ver el plan",
    restart: "Plan nuevo",
    changeMode: "Cambiar modo",
    newInsight: "Otra idea",
    share: "Compartir",
    copied: "¡Copiado!",
    backToTools: "Volver a herramientas",
    downloadCard: "Descargar tarjeta",
    copyCard: "Copiar tarjeta",
    copyText: "Copiar texto",
  },
  progress: {
    label: "Pregunta {{current}} de {{total}}",
    percent: "{{percent}}%",
  },
  result: {
    caption: "Plan familiar de mesada",
    overall: "Índice de sociedad financiera",
    amount: "Cantidad mensual recomendada",
    amountRange: "{{min}}–{{max}} {{symbol}} · foco {{mid}} {{symbol}}",
    amountNote: "Guía educativa — ajústala a la realidad de tu hogar.",
    split: "Reparto inteligente",
    spend: "Gastar / diversión",
    save: "Ahorrar",
    give: "Donar / comunidad",
    dimensions: "Indicadores",
    insights: "Ideas",
    tips: "Consejos prácticos",
    habits: "Hábitos de sociedad",
    setupSummary: "Contexto",
    cardTitle: "Tarjeta de resultado",
    cardFooter: "dailylogic.app · Calculadora de mesada",
    shareText:
      "Nuestro plan de mesada: {{profile}} · {{mid}} {{symbol}} · ahorro {{save}}% | Mesada — DailyLogic",
    resultSummary:
      "{{profile}} · {{mid}} {{symbol}} · ahorro {{save}}% · {{mode}}",
    bands: {
      "needs-care": "Necesita estructura clara",
      developing: "Practicando juntos",
      steady: "Estable y aprendiendo",
      strong: "Sociedad fuerte",
    },
    dimensionLabels: {
      moneyResponsibility: "Responsabilidad con el dinero",
      savingDiscipline: "Disciplina de ahorro",
      familyPartnership: "Sociedad familiar",
      spendingWisdom: "Sabiduría al gastar",
    },
  },
  card: {
    saved: "Tarjeta descargada",
    copied: "Tarjeta copiada",
    copyFailed: "No se pudo copiar la imagen — descárgala",
  },
  profiles: {
    "steady-partners": "Socios estables del dinero en casa",
    "savvy-team": "Equipo financiero acorde a la edad",
    "trust-builders": "Construyen confianza con transparencia",
    "learning-crew": "Equipo que aprende junto",
    "fair-starters": "Empiezan con equidad",
    "growing-together": "Crecen con las reglas",
    "needs-structure": "Necesita estructura más simple",
    "practice-week": "Semana de práctica antes de subir",
    "clarify-rules": "Aclarar las reglas primero",
    "reset-gently": "Reinicio suave — sin vergüenza",
    "start-smaller": "Empezar con menos cantidad",
    "talk-first": "Primero hablar — luego fijar monto",
  },
  insights: {
    "dim-moneyResponsibility-high":
      "Hay sentido de dueño del dinero — mantengan un seguimiento simple.",
    "dim-moneyResponsibility-low":
      "Cuando el dinero “desaparece” sin historia — escriban qué pasa con la billetera vacía.",
    "dim-savingDiscipline-high":
      "El ahorro se siente real — celebren hitos pequeños en voz alta.",
    "dim-savingDiscipline-low":
      "Sin meta visible, el ahorro se pospone. Pongan una foto de la meta junto al tarro.",
    "dim-familyPartnership-high":
      "Hay sociedad — renueven las reglas cada pocos meses.",
    "dim-familyPartnership-low":
      "Si solo un lado decide, la mesada se vuelve pelea. 15 minutos para acordar juntos.",
    "dim-spendingWisdom-high":
      "Hay pausa antes de comprar — premien ese músculo con palabras, no solo dinero.",
    "dim-spendingWisdom-low":
      "Los impulsos rompen el presupuesto. Prueben regla de 24 horas para lo no urgente.",
    "overall-strong":
      "La base es fuerte — documenten monto, reparto y reglas de billetera vacía.",
    "overall-steady":
      "Buen rumbo con puntos a reforzar — elijan un hábito para dos semanas.",
    "overall-developing":
      "Hay ganas, pero las reglas están borrosas. Simplifiquen antes de subir el monto.",
    "overall-needs-care":
      "Mejor reiniciar con suavidad: menos monto, reglas claras, charla sin culpa.",
    "age-young":
      "A esta edad gana lo visual: tarros de colores y contar monedas.",
    "age-tween":
      "Sube la presión de amigos — practiquen un “no esta semana” educado.",
    "age-teen":
      "La independencia digital pide transparencia sin vigilancia asfixiante.",
    "model-fixed":
      "Con modelo fijo: ajusten el monto a la responsabilidad — no solo a la comodidad.",
    "model-chores":
      "Con tareas: separen deberes familiares de extras pagados.",
    "model-hybrid":
      "Lo híbrido funciona con base estable + carril de bono claro.",
    "goal-delay":
      "Para diferir gratificación: la regla de espera importa más que un monto alto.",
    "goal-save-goal":
      "Para una meta grande: divídanla en hitos cortos con fecha.",
    "goal-independence":
      "Para independencia: permitan un error pequeño y revísenlo juntos.",
    "goal-value":
      "Para valor del dinero: comparen precios e incluyan una parte para donar.",
  },
  tips: {
    "tip-sunday-reset":
      "Reinicio domingo: cuenten lo que queda y planifiquen la semana en dos minutos.",
    "tip-empty-wallet-plan":
      "Escriban el plan de billetera vacía — sin rescate automático de los padres.",
    "tip-visible-tracker":
      "Seguimiento visible (cuaderno/app simple) — 30 segundos tras cada compra.",
    "tip-pay-yourself-first":
      "Al recibir la mesada: primero ahorro, luego diversión.",
    "tip-photo-goal":
      "Foto de la meta en la nevera o pantalla de bloqueo.",
    "tip-match-small":
      "Un match pequeño de los padres al ahorro motiva sin comprarlo todo.",
    "tip-family-meeting":
      "Reunión mensual de 15 minutos: monto, qué funcionó, qué cambia.",
    "tip-chore-menu":
      "Menú de tareas: deberes familiares vs extras pagados — por escrito.",
    "tip-two-voices":
      "Cambios de reglas requieren las dos voces — hijo/a y padre/madre.",
    "tip-24h-pause":
      "Compras no urgentes sobre un umbral acordado esperan 24 horas.",
    "tip-needs-wants-list":
      "Lista de necesidades vs deseos en una hoja — cada semana.",
    "tip-give-jar":
      "Tarro de donación: elijan una causa juntos cada trimestre.",
    "tip-monthly-review":
      "Fin de mes: qué aprendimos, no solo cuánto quedó.",
  },
  habits: {
    "habit-jar-split":
      "Tres tarros/sobres: gastar, ahorrar, donar — según los porcentajes acordados.",
    "habit-receipt-photo":
      "Foto del ticket o anotación inmediata — la memoria reescribe la historia.",
    "habit-goal-countdown":
      "Cuenta atrás a la meta: semanas restantes y falta semanal.",
    "habit-praise-ritual":
      "Elogiar el proceso bueno — no solo la compra cool.",
    "habit-no-bailout-default":
      "Por defecto: sin rescate automático. Excepciones solo tras charla acordada.",
    "habit-earn-bonus-lane":
      "Carril de bono limitado para emprendimiento/tareas especiales — sin reemplazar la base.",
  },
  questions: {},
};

/** @type {Record<string, {prompt: string, byAge?: Record<string,string>, byModel?: Record<string,string>}>} */
const questionsHe = {
  "money-runs-out": {
    prompt: "כשהכסף נגמר לפני סוף התקופה — יש לנו תוכנית ברורה (בלי דרמה).",
    byAge: {
      young: "כשהמטבעות נגמרים מוקדם — אנחנו יודעים מה עושים בלי לבכות או לכעוס.",
      tween: "כשדמי הכיס נגמרים באמצע — יש כלל ברור במקום ויכוח.",
      teen: "כשהתקציב נגמר מוקדם — יש הסכמה מה קורה (בלי הלוואה אוטומטית).",
    },
  },
  "track-what-spent": {
    prompt: "אנחנו יודעים לאן הלך רוב הכסף בתקופה האחרונה.",
    byAge: {
      young: "אנחנו זוכרים/כותבים לאן הלכו המטבעות (גם בציור).",
      tween: "יש מעקב פשוט — מחברת או הודעה — למה קנינו.",
      teen: "יש מעקב מינימלי להוצאות (אפליקציה/פתק) בלי לרגל.",
    },
  },
  "ask-before-borrow": {
    prompt: "לוקחים כסף מההורים/אחים רק אחרי בקשה ברורה — לא \"סתם\".",
  },
  "own-mistakes": {
    prompt: "כשקנייה התבררה כטעות — מדברים על זה בכנות בלי בושה.",
    byAge: {
      young: "אם קנינו משהו שמתחרטים עליו — אומרים את זה בקול וממשיכים.",
      tween: "טעויות קנייה הן שיעור, לא עונש.",
      teen: "מנתחים קנייה גרועה יחד — בלי האשמה ארוכה.",
    },
  },
  "plan-the-month": {
    prompt: "בתחילת התקופה יש לנו רעיון גס איך יתחלק הכסף.",
  },
  "no-secret-spending": {
    prompt: "אין הוצאות סודיות שמפרקות אמון בבית.",
  },
  "save-before-spend": {
    prompt: "חלק מהכסף עובר לחיסכון לפני שרצים לקנות.",
  },
  "goal-feels-real": {
    prompt: "יש מטרת חיסכון שנראית אמיתית לשני הצדדים.",
    byAge: {
      young: "יש מטרה שאפשר לראות (תמונה/צעצוע) ומתקרבים אליה.",
      tween: "יש יעד ברור עם תאריך גס.",
      teen: "יש יעד עם מחיר ותוכנית שבועית.",
    },
  },
  "wait-for-want": {
    prompt: "מצליחים לחכות קצת לפני קנייה לא דחופה.",
    byAge: {
      young: "לפעמים אומרים \"נחשוב מחר\" במקום לקנות מיד.",
      tween: "יש כלל המתנה לדברים שאינם דחופים.",
      teen: "יש עצירה מודעת לפני קניות אימפולס (אונליין/חברים).",
    },
  },
  "celebrate-milestones": {
    prompt: "חוגגים התקדמות בחיסכון — לא רק את הקנייה הסופית.",
  },
  "protect-savings-jar": {
    prompt: "כספי החיסכון מוגנים — לא \"שואלים\" מהם בלי הסכמה.",
    byModel: {
      fixed: "גם בסכום קבוע — החיסכון לא נבלע בהוצאות שוטפות.",
      chores: "בונוס ממטלות לא מחליף את קופת החיסכון.",
      hybrid: "במסלול המשולב ברור איזה חלק שמור לחיסכון.",
    },
  },
  "match-encourage": {
    prompt: "יש עידוד חיובי לחיסכון (מילים או התאמה קטנה) — לא רק לחץ.",
    byModel: {
      fixed: "גם במודל קבוע מעודדים חיסכון בלי לקנות במקום הילד.",
      chores: "תגמול מטלות לא מבטל את ערך החיסכון.",
      hybrid: "יש מסלול עידוד ברור לחיסכון/יוזמה.",
    },
  },
  "chores-vs-pay": {
    prompt: "ברור לנו מהי חובת בית ומהי מטלה שמשלמים עליה.",
    byModel: {
      fixed: "גם בלי תשלום על כל מטלה — ברור מה מצפים כשותפים בבית.",
      chores: "יש רשימה שקופה של מטלות ותעריפים — בלי מיקוח יומיומי.",
      hybrid: "יש בסיס קבוע + מטלות בונוס מוגדרות.",
    },
  },
  "rules-were-agreed": {
    prompt: "כללי דמי הכיס נקבעו ביחד — לא רק הוכרזו.",
  },
  "both-voices-heard": {
    prompt: "גם ההורה וגם הילד מרגישים שנשמעים בשיחות על כסף.",
    byAge: {
      young: "הילד/ה משתתפים בבחירת הקופות והמטרה.",
      tween: "יש מקום לדעה של שני הצדדים לפני שינוי כללים.",
      teen: "יש דיאלוג בוגר — לא הרצאה חד־צדדית.",
    },
  },
  "review-together": {
    prompt: "עוצרים מדי פעם לבדוק אם הסכום והכללים עדיין מתאימים.",
  },
  "fair-when-busy": {
    prompt: "גם בשבוע עמוס — ההסכמות נשמרות בלי שקט עונשי.",
    byModel: {
      fixed: "הסכום מגיע בזמן כפי שהוסכם.",
      chores: "מטלות שבוטלו מסיבה מוצדקת לא הופכות לעונש כספי מעורפל.",
      hybrid: "הבסיס יציב גם כשאין בונוס באותו שבוע.",
    },
  },
  "praise-not-only-pay": {
    prompt: "מעריכים התנהלות טובה גם במילים — לא רק בכסף.",
  },
  "sibling-or-friends-pressure": {
    prompt: "מדברים בכנות על לחץ חברים/אחים סביב קניות.",
    byAge: {
      young: "מסבירים למה לא קונים כל מה שחבר הביא.",
      tween: "מתרגלים תשובות ללחץ חברתי סביב כסף.",
      teen: "יש שיחה פתוחה על סטטוס, מותגים ותקציב אמיתי.",
    },
  },
  "impulse-pause": {
    prompt: "לפני קנייה ספונטנית יש רגע של עצירה.",
    byAge: {
      young: "לפעמים שמים את הרצון ב\"רשימת מחר\".",
      tween: "יש כלל המתנה לדברים לא דחופים.",
      teen: "באונליין/בחנות — עוצרים לפני Checkout.",
    },
  },
  "needs-vs-wants": {
    prompt: "מבדילים בין צורך לרצון בלי לזלזל ברגש.",
  },
  "give-back-share": {
    prompt: "יש מקום קטן לנתינה/תרומה כחלק מהחלוקה.",
  },
  "compare-prices": {
    prompt: "לפעמים בודקים מחיר חלופי לפני שקונים.",
    byAge: {
      young: "משווים בין שתי אפשרויות פשוטות (זול/יקר).",
      tween: "בודקים אם יש אלטרנטיבה סבירה.",
      teen: "משווים מחירים/מבצעים לפני רכישה גדולה יחסית.",
    },
  },
  "digital-vs-cash": {
    prompt: "מבינים שכסף דיגיטלי גם \"נגמר\" — לא רק מטבעות.",
    byAge: {
      young: "מדברים על זה שגם כרטיס/אפליקציה הם כסף אמיתי.",
      tween: "יש גבול ברור להוצאה דיגיטלית אם יש.",
      teen: "יש שקיפות בסיסית על הוצאות דיגיטליות בלי חודש של חשבונות.",
    },
  },
  "earn-extra-ok": {
    prompt: "יש דרך הוגנת להרוויח קצת יותר — בלי להפוך את הבית לשוק.",
    byModel: {
      fixed: "אפשר יוזמה קטנה מחוץ לסכום הקבוע, בתיאום.",
      chores: "מטלות בונוס מוגדרות מראש — לא מיקוח אינסופי.",
      hybrid: "מסלול היוזמה/הבונוס ברור ומוגבל.",
    },
  },
};

const questionsEn = {
  "money-runs-out": {
    prompt: "When money runs out before the period ends — we have a clear plan (no drama).",
    byAge: {
      young: "When the coins run out early — we know what happens without big tears or anger.",
      tween: "When allowance ends mid-way — there’s a clear rule instead of a fight.",
      teen: "When the budget ends early — we agree what happens (no automatic loan).",
    },
  },
  "track-what-spent": {
    prompt: "We roughly know where most of the money went lately.",
    byAge: {
      young: "We remember/draw where the coins went.",
      tween: "There’s a simple tracker — notebook or note — for what we bought.",
      teen: "There’s light tracking (app/note) without surveillance vibes.",
    },
  },
  "ask-before-borrow": {
    prompt: "Borrowing from parents/siblings only happens after a clear ask — not “just because”.",
  },
  "own-mistakes": {
    prompt: "When a purchase was a mistake — we talk honestly without shame spirals.",
    byAge: {
      young: "If we regret a buy — we say it out loud and move on.",
      tween: "Buying mistakes are lessons, not punishments.",
      teen: "We review a bad purchase together — without a long lecture.",
    },
  },
  "plan-the-month": {
    prompt: "At the start of the period we have a rough idea how money will split.",
  },
  "no-secret-spending": {
    prompt: "No secret spending that breaks trust at home.",
  },
  "save-before-spend": {
    prompt: "Some money goes to savings before the fun spending starts.",
  },
  "goal-feels-real": {
    prompt: "There’s a savings goal that feels real to both sides.",
    byAge: {
      young: "There’s a visible goal (photo/toy) we’re moving toward.",
      tween: "There’s a clear goal with a rough date.",
      teen: "There’s a priced goal and a weekly plan.",
    },
  },
  "wait-for-want": {
    prompt: "We can wait a bit before a non-urgent purchase.",
    byAge: {
      young: "Sometimes we say “let’s think tomorrow” instead of buying now.",
      tween: "There’s a waiting rule for non-urgent wants.",
      teen: "There’s a conscious pause before impulse buys (online/friends).",
    },
  },
  "celebrate-milestones": {
    prompt: "We celebrate saving progress — not only the final purchase.",
  },
  "protect-savings-jar": {
    prompt: "Savings are protected — not “borrowed from” without agreement.",
    byModel: {
      fixed: "Even with a fixed amount — savings don’t get swallowed by daily spend.",
      chores: "Chore bonuses don’t replace the savings jar.",
      hybrid: "In the hybrid path it’s clear which share is locked for saving.",
    },
  },
  "match-encourage": {
    prompt: "Saving gets positive encouragement (words or a small match) — not only pressure.",
    byModel: {
      fixed: "Even on a fixed model we encourage saving without buying everything for the child.",
      chores: "Paying for chores doesn’t cancel the value of saving.",
      hybrid: "There’s a clear encouragement lane for saving/enterprise.",
    },
  },
  "chores-vs-pay": {
    prompt: "We’re clear what is a family duty vs a paid task.",
    byModel: {
      fixed: "Even without paying for every chore — expectations as household partners are clear.",
      chores: "There’s a transparent chore list and rates — no daily haggling.",
      hybrid: "There’s a stable base plus defined bonus tasks.",
    },
  },
  "rules-were-agreed": {
    prompt: "Allowance rules were agreed together — not just announced.",
  },
  "both-voices-heard": {
    prompt: "Both parent and child feel heard in money talks.",
    byAge: {
      young: "The child helps choose jars and the goal.",
      tween: "Both sides get a say before changing rules.",
      teen: "There’s an adult dialogue — not a one-way lecture.",
    },
  },
  "review-together": {
    prompt: "We occasionally check if the amount and rules still fit.",
  },
  "fair-when-busy": {
    prompt: "Even in a busy week — agreements hold without silent punishment.",
    byModel: {
      fixed: "The amount arrives on time as agreed.",
      chores: "Fairly canceled chores don’t become vague money punishment.",
      hybrid: "The base stays stable even when there’s no bonus that week.",
    },
  },
  "praise-not-only-pay": {
    prompt: "Good money habits get praise in words — not only cash.",
  },
  "sibling-or-friends-pressure": {
    prompt: "We talk honestly about friend/sibling pressure around buying.",
    byAge: {
      young: "We explain why we don’t buy everything a friend has.",
      tween: "We practice answers to social pressure about money.",
      teen: "There’s an open talk about status, brands, and real budgets.",
    },
  },
  "impulse-pause": {
    prompt: "Before a spontaneous purchase there’s a pause.",
    byAge: {
      young: "Sometimes the want goes on a “tomorrow list”.",
      tween: "There’s a waiting rule for non-urgent things.",
      teen: "In-store/online — we pause before checkout.",
    },
  },
  "needs-vs-wants": {
    prompt: "We can tell needs from wants without shaming the feeling.",
  },
  "give-back-share": {
    prompt: "There’s a small place for giving/donation in the split.",
  },
  "compare-prices": {
    prompt: "Sometimes we check an alternative price before buying.",
    byAge: {
      young: "We compare two simple options (cheaper/pricier).",
      tween: "We check if a reasonable alternative exists.",
      teen: "We compare prices/deals before a relatively big buy.",
    },
  },
  "digital-vs-cash": {
    prompt: "We understand digital money also “runs out” — not only coins.",
    byAge: {
      young: "We talk about cards/apps being real money too.",
      tween: "There’s a clear limit for digital spend if it exists.",
      teen: "There’s basic transparency on digital spend without month-long audits.",
    },
  },
  "earn-extra-ok": {
    prompt: "There’s a fair way to earn a bit more — without turning home into a marketplace.",
    byModel: {
      fixed: "Small enterprise outside the fixed amount is ok when coordinated.",
      chores: "Bonus chores are defined ahead — not endless haggling.",
      hybrid: "The enterprise/bonus lane is clear and capped.",
    },
  },
};

const questionsEs = {
  "money-runs-out": {
    prompt: "Cuando el dinero se acaba antes de tiempo — tenemos un plan claro (sin drama).",
    byAge: {
      young: "Cuando se acaban las monedas temprano — sabemos qué pasa sin llanto o enfado grande.",
      tween: "Cuando la mesada se acaba a mitad — hay una regla clara en vez de pelea.",
      teen: "Cuando el presupuesto se acaba pronto — acordamos qué pasa (sin préstamo automático).",
    },
  },
  "track-what-spent": {
    prompt: "Sabemos más o menos a dónde fue la mayor parte del dinero.",
    byAge: {
      young: "Recordamos/dibujamos a dónde fueron las monedas.",
      tween: "Hay un seguimiento simple — cuaderno o nota — de lo comprado.",
      teen: "Hay seguimiento ligero (app/nota) sin sensación de vigilancia.",
    },
  },
  "ask-before-borrow": {
    prompt: "Pedir prestado a padres/hermanos solo tras una petición clara — no “porque sí”.",
  },
  "own-mistakes": {
    prompt: "Cuando una compra fue un error — hablamos con honestidad sin vergüenza.",
    byAge: {
      young: "Si nos arrepentimos de una compra — lo decimos en voz alta y seguimos.",
      tween: "Los errores de compra son lecciones, no castigos.",
      teen: "Revisamos una mala compra juntos — sin sermón largo.",
    },
  },
  "plan-the-month": {
    prompt: "Al inicio del periodo tenemos una idea aproximada de cómo se reparte el dinero.",
  },
  "no-secret-spending": {
    prompt: "No hay gastos secretos que rompan la confianza en casa.",
  },
  "save-before-spend": {
    prompt: "Parte del dinero va al ahorro antes de gastar en diversión.",
  },
  "goal-feels-real": {
    prompt: "Hay una meta de ahorro que se siente real para ambos.",
    byAge: {
      young: "Hay una meta visible (foto/juguete) a la que nos acercamos.",
      tween: "Hay una meta clara con una fecha aproximada.",
      teen: "Hay una meta con precio y plan semanal.",
    },
  },
  "wait-for-want": {
    prompt: "Podemos esperar un poco antes de una compra no urgente.",
    byAge: {
      young: "A veces decimos “pensemos mañana” en vez de comprar ya.",
      tween: "Hay una regla de espera para deseos no urgentes.",
      teen: "Hay una pausa consciente antes de impulsos (online/amigos).",
    },
  },
  "celebrate-milestones": {
    prompt: "Celebramos el progreso del ahorro — no solo la compra final.",
  },
  "protect-savings-jar": {
    prompt: "El ahorro está protegido — no se “pide prestado” sin acuerdo.",
    byModel: {
      fixed: "Aun con monto fijo — el ahorro no se traga el gasto diario.",
      chores: "Los bonos por tareas no reemplazan el tarro de ahorro.",
      hybrid: "En lo híbrido está claro qué parte está reservada al ahorro.",
    },
  },
  "match-encourage": {
    prompt: "El ahorro recibe ánimo positivo (palabras o un match pequeño) — no solo presión.",
    byModel: {
      fixed: "Aun con modelo fijo animamos el ahorro sin comprarlo todo por el niño/a.",
      chores: "Pagar tareas no anula el valor de ahorrar.",
      hybrid: "Hay un carril claro de ánimo para ahorro/emprendimiento.",
    },
  },
  "chores-vs-pay": {
    prompt: "Tenemos claro qué es deber familiar y qué es tarea pagada.",
    byModel: {
      fixed: "Aunque no se pague cada tarea — las expectativas como socios del hogar son claras.",
      chores: "Hay una lista transparente de tareas y tarifas — sin regateo diario.",
      hybrid: "Hay una base estable más tareas bonus definidas.",
    },
  },
  "rules-were-agreed": {
    prompt: "Las reglas de la mesada se acordaron juntos — no solo se anunciaron.",
  },
  "both-voices-heard": {
    prompt: "Padre/madre e hijo/a se sienten escuchados en las charlas de dinero.",
    byAge: {
      young: "El niño/a ayuda a elegir tarros y la meta.",
      tween: "Ambos lados opinan antes de cambiar reglas.",
      teen: "Hay diálogo adulto — no un sermón unidireccional.",
    },
  },
  "review-together": {
    prompt: "De vez en cuando revisamos si el monto y las reglas aún encajan.",
  },
  "fair-when-busy": {
    prompt: "Aun en una semana ocupada — los acuerdos se cumplen sin castigo silencioso.",
    byModel: {
      fixed: "El monto llega a tiempo según lo acordado.",
      chores: "Tareas canceladas con justa causa no se vuelven castigo económico vago.",
      hybrid: "La base se mantiene aunque no haya bono esa semana.",
    },
  },
  "praise-not-only-pay": {
    prompt: "Los buenos hábitos también reciben elogio en palabras — no solo dinero.",
  },
  "sibling-or-friends-pressure": {
    prompt: "Hablamos con honestidad de la presión de amigos/hermanos al comprar.",
    byAge: {
      young: "Explicamos por qué no compramos todo lo que tiene un amigo.",
      tween: "Practicamos respuestas a la presión social sobre dinero.",
      teen: "Hay charla abierta sobre status, marcas y presupuestos reales.",
    },
  },
  "impulse-pause": {
    prompt: "Antes de una compra espontánea hay una pausa.",
    byAge: {
      young: "A veces el deseo va a una “lista de mañana”.",
      tween: "Hay regla de espera para lo no urgente.",
      teen: "En tienda/online — pausamos antes del checkout.",
    },
  },
  "needs-vs-wants": {
    prompt: "Distinguimos necesidad de deseo sin avergonzar el sentimiento.",
  },
  "give-back-share": {
    prompt: "Hay un pequeño espacio para donar/dar en el reparto.",
  },
  "compare-prices": {
    prompt: "A veces comparamos un precio alternativo antes de comprar.",
    byAge: {
      young: "Comparamos dos opciones simples (más barato/más caro).",
      tween: "Revisamos si hay una alternativa razonable.",
      teen: "Comparamos precios/ofertas antes de una compra relativamente grande.",
    },
  },
  "digital-vs-cash": {
    prompt: "Entendemos que el dinero digital también “se acaba” — no solo las monedas.",
    byAge: {
      young: "Hablamos de que tarjeta/app también es dinero real.",
      tween: "Hay un límite claro para gasto digital si existe.",
      teen: "Hay transparencia básica del gasto digital sin auditorías eternas.",
    },
  },
  "earn-extra-ok": {
    prompt: "Hay una forma justa de ganar un poco más — sin convertir la casa en un mercado.",
    byModel: {
      fixed: "Un pequeño emprendimiento fuera del monto fijo está bien si se coordina.",
      chores: "Tareas bonus definidas de antemano — sin regateo infinito.",
      hybrid: "El carril de emprendimiento/bono es claro y limitado.",
    },
  },
};

he.questions = questionsHe;
en.questions = questionsEn;
es.questions = questionsEs;

for (const [locale, data] of [
  ["he", he],
  ["en", en],
  ["es", es],
]) {
  const file = path.join(root, locale, "pocketMoney.json");
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("wrote", file);
}
