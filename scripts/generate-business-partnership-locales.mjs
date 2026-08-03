import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "locales");

const questionDefs = [
  ["decide-under-pressure", "כשלחץ עולה — אנחנו מצליחים להחליט בלי לשתוק או להתפוצץ.", "Under pressure we can still decide without freezing or exploding.", "Bajo presión aún podemos decidir sin congelarnos ni explotar."],
  ["failure-ownership", "כשמשהו נכשל — ברור מי לוקח אחריות, בלי משחקי האשמה.", "When something fails — ownership is clear, without blame games.", "Cuando algo falla — la responsabilidad es clara, sin culpas."],
  ["roles-clear", "התפקידים והסמכויות בינינו ברורים מספיק ליום־יום.", "Roles and authority between us are clear enough for day-to-day work.", "Los roles y la autoridad entre nosotros son lo bastante claros."],
  ["exit-talked", "דיברנו בכנות על פרידה/יציאה אפשרית — לא רק על חלום ההצלחה.", "We've talked honestly about a possible exit — not only the success dream.", "Hablamos con honestidad de una posible salida — no solo del éxito."],
  ["red-lines-named", "יש קווים אדומים שנאמרו בקול (כסף, אתיקה, זמן) ולא רק \"נראה בהמשך\".", "Red lines were named out loud (money, ethics, time) — not just \"we'll see\".", "Hay líneas rojas dichas en voz alta (dinero, ética, tiempo)."],
  ["crisis-playbook", "יש לנו הבנה מי מוביל במשבר תפעולי, גם בלי ישיבה דרמטית.", "We know who leads in an ops crisis, even without a dramatic meeting.", "Sabemos quién lidera en una crisis operativa."],
  ["ip-or-assets-clarity", "ברור לנו מה שייך לשותפות ומה נשאר אישי (נכסים / ידע / קשרים).", "It's clear what belongs to the partnership vs personal (assets / know-how / relationships).", "Está claro qué pertenece a la sociedad y qué es personal."],
  ["vendors-and-deps", "תלויות חיצוניות (ספקים/קבלנים) מנוהלות בשקיפות בין השותפים.", "External dependencies (vendors/contractors) are managed transparently between partners.", "Las dependencias externas se gestionan con transparencia."],
  ["money-talks-honest", "שיחות כסף אצלנו כנות — גם כשהמספרים לא מחמיאים.", "Money talks are honest — even when the numbers aren't flattering.", "Las conversaciones de dinero son honestas — también con números duros."],
  ["first-money-vs-sweat", "אנחנו מיישרים קו בין כסף ראשון, השקעת זמן (sweat) ותרומה לא סימטרית.", "We align on early cash, sweat equity, and asymmetric contribution.", "Alineamos cash inicial, sweat equity y aportes asimétricos."],
  ["equity-feels-fair", "חלוקת הנתח/הרווחים מרגישה הוגנת מספיק ביחס לתרומה בפועל.", "Equity/profit split feels fair enough relative to actual contribution.", "El split se siente lo bastante justo frente al aporte real."],
  ["burn-and-runway", "יש שקיפות על burn ו־runway — בלי הפתעות בסוף החודש.", "There's transparency on burn and runway — no end-of-month surprises.", "Hay transparencia de burn y runway — sin sorpresas de fin de mes."],
  ["salary-vs-reinvest", "אנחנו מסכימים מתי מושכים שכר/דיבידנד ומתי ממשיכים להשקיע בחזרה.", "We agree when to take salary/dividends vs reinvest.", "Acordamos cuándo sacar salario/dividendos y cuándo reinvertir."],
  ["expense-authority", "ברור עד איזה סכום אפשר להוציא לבד ומתי חובה יישור קו.", "It's clear up to what amount one can spend alone vs must align.", "Está claro hasta qué monto se gasta solo y cuándo hay que alinear."],
  ["investor-or-debt-views", "יש יישור קו סביב גיוס/חוב — או לפחות תהליך להגיע להחלטה.", "We're aligned on fundraising/debt — or have a process to decide.", "Hay alineación sobre captación/deuda — o un proceso para decidir."],
  ["profit-distribution-rules", "כללי חלוקת רווחים כתובים או לפחות מוסכמים במפורש.", "Profit distribution rules are written or at least explicit.", "Las reglas de reparto de beneficios están explícitas."],
  ["disagree-then-decide", "אחרי מחלוקת אנחנו יודעים איך סוגרים החלטה וממשיכים.", "After disagreement we know how to close a decision and move on.", "Tras un desacuerdo sabemos cerrar una decisión y seguir."],
  ["ego-in-meetings", "אגו לא חוסם החלטות טובות — גם כשקשה לבלוע.", "Ego doesn't block good decisions — even when it's hard to swallow.", "El ego no bloquea buenas decisiones — aunque cueste."],
  ["feedback-without-war", "אפשר לתת פידבק חד בלי להפוך את זה למלחמת עולם.", "We can give sharp feedback without starting a world war.", "Podemos dar feedback duro sin convertir eso en una guerra."],
  ["deadlock-break", "יש מנגנון לשבירת תקיעות (הכרעה / יועץ / רוטציה) — לא רק תקווה.", "There's a deadlock breaker (tie-break / advisor / rotation) — not only hope.", "Hay un mecanismo anti-bloqueo — no solo esperanza."],
  ["client-or-team-conflict", "קונפליקט מול לקוח/צוות מטופל כשותפים, לא כשני מחנות.", "Client/team conflict is handled as partners, not two camps.", "El conflicto con cliente/equipo se gestiona como socios, no bandos."],
  ["apology-and-course-correct", "התנצלות מלווה בתיקון מסלול — לא רק במייל מנומס.", "Apology comes with course-correction — not only a polite email.", "La disculpa viene con corrección de rumbo — no solo un mail educado."],
  ["transparency-default", "שקיפות היא ברירת מחדל (מידע, סיכונים, טעויות) — לא פרס על התנהגות טובה.", "Transparency is the default (info, risks, mistakes) — not a reward.", "La transparencia es el default — no un premio."],
  ["pace-mismatch", "כשיש פער בקצב עבודה — מדברים על זה לפני שהתסכול מתפוצץ.", "When work pace differs — we talk before frustration explodes.", "Cuando el ritmo difiere — hablamos antes de que explote."],
  ["invisible-labor", "עבודה \"בלתי נראית\" (אדמין, מעקב, כיבוי שריפות) מוכרת ולא רק מבוצעת.", "Invisible work (admin, follow-ups, firefighting) is recognized, not only done.", "El trabajo invisible se reconoce, no solo se hace."],
  ["who-owns-delivery", "ברור מי אחראי לדליברי בפועל — לא \"כולם אחראים\" ובסוף אף אחד.", "It's clear who owns delivery — not \"everyone\" and then no one.", "Está claro quién posee el delivery — no \"todos\" y luego nadie."],
  ["time-off-without-guilt", "אפשר לקחת הפסקה/חופש בלי תחושת בגידה בשותפות.", "We can take time off without feeling like we betrayed the partnership.", "Podemos tomarnos un descanso sin sentir traición a la sociedad."],
  ["hiring-and-firing-views", "יש יישור קו סביב גיוס ופרידה מעובדים/קבלנים.", "We're aligned on hiring and letting go of people/contractors.", "Hay alineación sobre contratar y despedir."],
  ["communication-cadence", "יש קצב תקשורת קבוע מספיק (סטטוס/סינכרון) שלא מת מווטסאפ כאוטי.", "We have enough communication cadence — not only chaotic chat threads.", "Hay una cadencia de comunicación suficiente — no solo chats caóticos."],
  ["vision-still-shared", "עדיין חולקים כיוון אסטרטגי — או יודעים איך ליישר כשמתפצלים.", "We still share strategic direction — or know how to realign when we diverge.", "Aún compartimos dirección estratégica — o sabemos realinear."],
];

const industryVariants = {
  "failure-ownership": {
    tech: ["כשפיצ'ר/שחרור נכשל — ברור מי owner, בלי זריקת באגים אחד על השני.", "When a feature/release fails — ownership is clear, without bug-blame ping-pong.", "Cuando un release falla — la ownership es clara, sin ping-pong de culpas."],
    commerce: ["כשמלאי/משלוח נכשל — ברור מי סוגר עם ספק ולקוח, בלי האשמות.", "When inventory/shipping fails — it's clear who closes with vendor and customer.", "Cuando falla stock/envío — está claro quién cierra con proveedor y cliente."],
    services: ["כשפרויקט לקוח נשבר — ברור מי מדבר עם הלקוח ומי מתקן בפנים.", "When a client project breaks — it's clear who talks to the client and who fixes inside.", "Cuando un proyecto se rompe — está claro quién habla al cliente y quién corrige."],
    food: ["כששירות/משמרת קורסים — ברור מי מושך את החבל בזמן אמת.", "When service/shift collapses — it's clear who pulls the rope in real time.", "Cuando el servicio se cae — está claro quién tira de la cuerda en tiempo real."],
    other: ["כשמשהו נכשל בשטח — ברור מי לוקח אחריות וסוגר מעגל.", "When something fails in the field — ownership and closure are clear.", "Cuando algo falla en campo — la responsabilidad y el cierre son claros."],
  },
  "crisis-playbook": {
    tech: ["באירוע פרודקשן/אבטחה — יודעים מי מוביל תקשורת ומי מתקן.", "In a prod/security incident — we know who leads comms and who fixes.", "En un incidente de prod/seguridad — sabemos quién comunica y quién corrige."],
    commerce: ["במשבר ספקים/מחסן — יודעים מי מחליט על עצירה/הנחות/פיצוי.", "In a supplier/warehouse crisis — we know who decides pause/discounts/compensation.", "En crisis de proveedor/almacén — sabemos quién decide pausa/descuentos."],
    services: ["במשבר לקוח גדול — יודעים מי מוביל את השיחה ומי מגבה משאבים.", "In a major client crisis — we know who leads the call and who backs resources.", "En crisis de cliente grande — sabemos quién lidera la llamada y quién respalda."],
    food: ["במשבר מטבח/כוח אדם — יודעים מי סוגר תפריט/משמרות באותו רגע.", "In a kitchen/staffing crisis — we know who closes menu/shifts immediately.", "En crisis de cocina/personal — sabemos quién cierra menú/turnos al momento."],
    other: ["במשבר תפעולי — יודעים מי מוביל בלי דיון אינסופי.", "In an ops crisis — we know who leads without endless debate.", "En crisis operativa — sabemos quién lidera sin debate infinito."],
  },
  "ip-or-assets-clarity": {
    tech: ["ברור מי בעלים על קוד, דאטה ו־IP — גם אם מישהו יוצא.", "It's clear who owns code, data, and IP — even if someone exits.", "Está claro quién posee código, datos e IP — aunque alguien salga."],
    commerce: ["ברור מי בעלים על מותג, קהל, וספקים קריטיים.", "It's clear who owns brand, audience, and critical suppliers.", "Está claro quién posee marca, audiencia y proveedores críticos."],
    services: ["ברור מי בעלים על קשרי לקוחות, מתודולוגיה וחומרים.", "It's clear who owns client relationships, methods, and materials.", "Está claro quién posee relaciones de cliente, métodos y materiales."],
    food: ["ברור מי בעלים על מתכונים, ספקים ושם המותג.", "It's clear who owns recipes, suppliers, and brand name.", "Está claro quién posee recetas, proveedores y marca."],
    other: ["ברור מה שייך לשותפות ומה נשאר נכס אישי.", "It's clear what belongs to the partnership vs personal assets.", "Está claro qué es de la sociedad y qué es activo personal."],
  },
  "vendors-and-deps": {
    tech: ["עבודה עם פרילנסרים/ספקים טכנולוגיים שקופה לשני הצדדים.", "Work with freelancers/tech vendors is transparent to both partners.", "El trabajo con freelancers/proveedores tech es transparente."],
    commerce: ["יחסי ספקים ומלאי מנוהלים בשקיפות — בלי \"עסקאות צד\".", "Supplier and inventory relationships are transparent — no side deals.", "Proveedores e inventario son transparentes — sin tratos laterales."],
    services: ["קבלני משנה ושותפי משנה מאושרים וגלויים לשותפים.", "Subcontractors are approved and visible to partners.", "Los subcontratistas están aprobados y visibles para los socios."],
    food: ["ספקי מזון ושירותים חיצוניים מנוהלים בשקיפות זוגית/שותפית.", "Food and external service vendors are managed with partner transparency.", "Proveedores de comida y servicios se gestionan con transparencia."],
    other: ["תלויות חיצוניות מנוהלות בשקיפות בין השותפים.", "External dependencies are managed transparently between partners.", "Las dependencias externas se gestionan con transparencia."],
  },
  "client-or-team-conflict": {
    tech: ["ויכוח על עדיפויות מוצר/לקוח נסגר כצוות מייסדים — לא כשני מחנות.", "Product/customer priority fights close as a founding team — not two camps.", "Las peleas de prioridad de producto se cierran como equipo fundador."],
    commerce: ["קונפליקט מול לקוחות/החזרות מטופל יחד — לא אחד \"הטוב\" ואחד \"הרע\".", "Customer/returns conflict is handled together — not good-cop/bad-cop theater.", "El conflicto con clientes/devoluciones se gestiona juntos."],
    services: ["כשלקוח לוחץ — אנחנו מתיישרים לפני שעונים, לא אחרי.", "When a client pushes — we align before answering, not after.", "Cuando un cliente presiona — alineamos antes de responder."],
    food: ["תלונת לקוח/ביקורת ציבורית מטופלת כחזית אחת.", "A customer complaint/public review is handled as one front.", "Una queja/reseña pública se gestiona como un solo frente."],
    other: ["קונפליקט חיצוני מטופל כשותפים, לא כמחנות.", "External conflict is handled as partners, not camps.", "El conflicto externo se gestiona como socios, no bandos."],
  },
  "who-owns-delivery": {
    tech: ["ברור מי owner על שחרור/דליברי טכני — כולל אחרי השעה חמש.", "It's clear who owns technical delivery/release — including after hours.", "Está claro quién posee el delivery técnico/release — también fuera de horario."],
    commerce: ["ברור מי אחראי ששרשרת האספקה תעמוד ביעד — מקצה לקצה.", "It's clear who owns end-to-end supply/fulfillment targets.", "Está claro quién posee el fulfillment de punta a punta."],
    services: ["ברור מי אחראי לדליברי ללקוח ומי מחזיק את לוח הזמנים.", "It's clear who owns client delivery and who holds the timeline.", "Está claro quién posee el delivery al cliente y el timeline."],
    food: ["ברור מי אחראי שאיכות השירות תעמוד בסטנדרט בכל משמרת.", "It's clear who owns service-quality standards every shift.", "Está claro quién posee el estándar de servicio en cada turno."],
    other: ["ברור מי אחראי לדליברי בפועל — מקצה לקצה.", "It's clear who owns real delivery end to end.", "Está claro quién posee el delivery real de punta a punta."],
  },
};

function buildLocale(langIdx) {
  const t = (arr) => arr[langIdx];
  const base = {
    intro: {
      eyebrow: t(["שותפות עסקית בלי איפור", "Honest business partnership", "Sociedad de negocios sin maquillaje"]),
      title: t(["מחשבון שותפות עסקית כנה", "Honest Business Partnership Calculator", "Calculadora de sociedad empresarial honesta"]),
      body: t([
        "התחילו ברקע עסקי קצר, בחרו מקוצר או עומק מלא, וקבלו פרופיל סינרגיה עם מדדים ותובנות להסכם מייסדים. הכל נשאר בדפדפן.",
        "Start with a short business setup, choose quick or full depth, and get a synergy profile with metrics and founder-agreement prompts. Everything stays in your browser.",
        "Empieza con un setup breve, elige rápido o completo, y obtén un perfil de sinergia con métricas y puntos para el acuerdo de fundadores. Todo se queda en el navegador.",
      ]),
    },
    setup: {
      title: t(["רקע לשותפות", "Partnership setup", "Setup de la sociedad"]),
      subtitle: t(["הנתונים האלה מכווננים ניסוחים ודגשים בהמשך.", "These details tune wording and emphasis later.", "Estos datos afinan el lenguaje y los énfasis después."]),
      statusLabel: t(["סטטוס השותפות", "Partnership status", "Estado de la sociedad"]),
      partnersLabel: t(["מספר השותפים", "Number of partners", "Número de socios"]),
      industryLabel: t(["תחום / ענף", "Industry / sector", "Sector / industria"]),
      equityLabel: t(["חלוקת נתח / רווחים", "Equity / profit split", "Reparto de equity / beneficios"]),
      continue: t(["המשיכו לבחירת שאלון", "Continue to questionnaire", "Continuar al cuestionario"]),
      status: {
        active: t(["כבר שותפים בפועל", "Already partners in practice", "Ya somos socios en la práctica"]),
        considering: t(["שוקלים להיכנס לשותפות", "Considering entering a partnership", "Estamos considerando asociarnos"]),
      },
      partners: {
        "2": t(["2 שותפים", "2 partners", "2 socios"]),
        "3": t(["3 שותפים", "3 partners", "3 socios"]),
        "4plus": t(["4 ומעלה", "4 or more", "4 o más"]),
      },
      industry: {
        tech: t(["טכנולוגיה / SaaS", "Technology / SaaS", "Tecnología / SaaS"]),
        commerce: t(["מסחר ואיקומרס", "Commerce & ecommerce", "Comercio y ecommerce"]),
        services: t(["שירותים / סוכנות", "Services / agency", "Servicios / agencia"]),
        food: t(["מסעדנות / קולינריה", "Food & hospitality", "Restauración / culinary"]),
        other: t(["אחר", "Other", "Otro"]),
      },
      equity: {
        equal: t(["חלוקה שווה (למשל 50-50)", "Equal split (e.g. 50-50)", "Reparto igual (p. ej. 50-50)"]),
        majority: t(["רוב ברור לאחד הצדדים", "Clear majority to one side", "Mayoría clara de un lado"]),
        complex: t(["חלוקה מורכבת / דינמית", "Complex / dynamic split", "Reparto complejo / dinámico"]),
      },
    },
    modes: {
      quick: t(["שאלון מקוצר", "Quick business check", "Chequeo rápido"]),
      quickMeta: t(["כ־10 שאלות ליבה · 2–3 דקות", "~10 core questions · 2–3 minutes", "~10 preguntas clave · 2–3 minutos"]),
      full: t(["שאלון עומק מקיף", "Full venture assessment", "Evaluación completa"]),
      fullMeta: t(["30 שאלות · 8–10 דקות", "30 questions · 8–10 minutes", "30 preguntas · 8–10 minutos"]),
      backToSetup: t(["חזרה לרקע", "Back to setup", "Volver al setup"]),
    },
    scale: {
      "1": t(["כמעט אף פעם", "Almost never", "Casi nunca"]),
      "2": t(["לעיתים רחוקות", "Rarely", "Rara vez"]),
      "3": t(["לפעמים", "Sometimes", "A veces"]),
      "4": t(["לרוב", "Often", "A menudo"]),
      "5": t(["כמעט תמיד", "Almost always", "Casi siempre"]),
    },
    actions: {
      start: t(["התחילו", "Start", "Empezar"]),
      next: t(["הבא", "Next", "Siguiente"]),
      back: t(["הקודם", "Back", "Anterior"]),
      finish: t(["סיימו וקבלו דוח", "Finish & see report", "Terminar y ver informe"]),
      restart: t(["הערכה חדשה", "New assessment", "Nueva evaluación"]),
      changeMode: t(["החלפת מצב", "Change mode", "Cambiar modo"]),
      newInsight: t(["תובנה נוספת", "Another insight", "Otra reflexión"]),
      share: t(["שתפו", "Share", "Compartir"]),
      copied: t(["הועתק!", "Copied!", "¡Copiado!"]),
      backToTools: t(["חזרה לכלים", "Back to tools", "Volver a las herramientas"]),
      downloadCard: t(["הורדת כרטיס", "Download card", "Descargar tarjeta"]),
      copyCard: t(["העתקת כרטיס", "Copy card", "Copiar tarjeta"]),
      copyText: t(["העתקת טקסט", "Copy text", "Copiar texto"]),
    },
    progress: {
      label: t(["שאלה {{current}} מתוך {{total}}", "Question {{current}} of {{total}}", "Pregunta {{current}} de {{total}}"]),
      percent: "{{percent}}%",
    },
    result: {
      caption: t(["פרופיל סינרגיה עסקית", "Business synergy profile", "Perfil de sinergia empresarial"]),
      overall: t(["ציון כולל", "Overall score", "Puntuación global"]),
      dimensions: t(["מדדים", "Dimensions", "Dimensiones"]),
      insights: t(["תובנות", "Insights", "Reflexiones"]),
      tips: t(["המלצות לשיפור", "Improvement tips", "Consejos de mejora"]),
      agreement: t(["לעגן בהסכם מייסדים", "Anchor in a founders agreement", "Anclar en el acuerdo de fundadores"]),
      setupSummary: t(["רקע", "Setup", "Setup"]),
      cardTitle: t(["כרטיס תוצאה", "Result card", "Tarjeta de resultado"]),
      cardFooter: t(["dailylogic.app · מחשבון שותפות עסקית", "dailylogic.app · Business Partnership Calculator", "dailylogic.app · Calculadora de sociedad empresarial"]),
      shareText: t([
        "פרופיל השותפות שלנו: {{profile}} ({{score}}%). {{insight}} | מחשבון שותפות עסקית — לוגיקה יומית",
        "Our partnership profile: {{profile}} ({{score}}%). {{insight}} | Business Partnership — DailyLogic",
        "Nuestro perfil de sociedad: {{profile}} ({{score}}%). {{insight}} | Sociedad empresarial — Lógica diaria",
      ]),
      resultSummary: "{{profile}} · {{score}}% · {{industry}} · {{mode}}",
      bands: {
        "needs-care": t(["דורש תשומת לב", "Needs attention", "Necesita atención"]),
        developing: t(["בתהליך יישור קו", "Aligning", "En alineación"]),
        steady: t(["יציב ומקצועי", "Steady & professional", "Estable y profesional"]),
        strong: t(["חזק ומסונכרן", "Strong & aligned", "Fuerte y alineado"]),
      },
      dimensionLabels: {
        opsResilience: t(["חוסן חוזי ותפעולי", "Contractual & ops resilience", "Resiliencia contractual y ops"]),
        financialAlignment: t(["תיאום ציפיות פיננסי", "Financial expectation alignment", "Alineación financiera"]),
        conflictGovernance: t(["ניהול קונפליקטים", "Conflict governance", "Gobernanza de conflictos"]),
        workloadClarity: t(["בהירות עומסים ותפקידים", "Workload & role clarity", "Claridad de carga y roles"]),
      },
    },
    card: {
      saved: t(["הכרטיס הורד", "Card downloaded", "Tarjeta descargada"]),
      copied: t(["הכרטיס הועתק", "Card copied", "Tarjeta copiada"]),
      copyFailed: t(["לא ניתן להעתיק תמונה — הורידו במקום", "Couldn’t copy image — download instead", "No se pudo copiar la imagen — descárgala"]),
    },
    profiles: {
      "aligned-operators": t(["מפעילים מסונכרנים — עם תחזוקה שוטפת", "Aligned operators — with ongoing maintenance", "Operadores alineados — con mantenimiento"]),
      "durable-venture": t(["מיזם עם חוסן מבני", "A venture with structural resilience", "Un venture con resiliencia estructural"]),
      "clear-bench": t(["ספסל ברור של אחריות והחלטות", "A clear bench of ownership and decisions", "Banca clara de ownership y decisiones"]),
      "working-partners": t(["שותפים עובדים — לא רק חולמים", "Working partners — not only dreamers", "Socios que trabajan — no solo sueñan"]),
      "honest-builders-biz": t(["בונים בכנות עסקית", "Honest business builders", "Constructores honestos de negocio"]),
      "pragmatic-duo": t(["פרגמטיים עם מצפן משותף", "Pragmatic partners with a shared compass", "Pragmáticos con brújula compartida"]),
      "alignment-gap": t(["פער יישור קו שדורש שיחה", "An alignment gap that needs a talk", "Brecha de alineación que pide conversación"]),
      "early-friction": t(["חיכוך מוקדם — עוד ניתן לנהל", "Early friction — still manageable", "Fricción temprana — aún gestionable"]),
      "paperwork-needed": t(["צריך נייר לפני עוד תנופה", "Paperwork needed before more momentum", "Hace falta papel antes de más impulso"]),
      "high-risk-signal": t(["אות סיכון גבוה לשותפות", "High-risk signal for the partnership", "Señal de alto riesgo para la sociedad"]),
      "pause-and-write": t(["עצרו לכתוב הסכמות", "Pause and write the agreements", "Pausa y escribe los acuerdos"]),
      "founders-talk-now": t(["שיחת מייסדים — עכשיו, לא אחר כך", "Founders talk — now, not later", "Charla de fundadores — ahora, no después"]),
    },
    insights: {},
    tips: {},
    agreement: {},
    questions: {},
  };

  // insights
  const insightPairs = [
    ["dim-opsResilience-high", "החוסן התפעולי/החוזי שלכם יחסית חזק — שמרו על זה בכתב, לא רק בזיכרון.", "Your ops/contractual resilience is relatively strong — keep it written, not only remembered.", "Vuestra resiliencia ops/contractual es relativamente fuerte — dejadla por escrito."],
    ["dim-opsResilience-low", "החוסן התפעולי מבקש חיזוק: מי מחליט, מי מוביל במשבר, ומה קורה ביציאה.", "Ops resilience needs reinforcement: who decides, who leads crises, and exit rules.", "La resiliencia ops pide refuerzo: quién decide, quién lidera crisis y reglas de salida."],
    ["dim-financialAlignment-high", "יש יישור פיננסי טוב יחסית — זה נכס נדיר. תחזקו אותו בפגישת כסף חודשית.", "Financial alignment is relatively strong — rare. Protect it with a monthly money meeting.", "La alineación financiera es relativamente fuerte — protégela con una reunión mensual."],
    ["dim-financialAlignment-low", "פערי ציפיות כספיים הם מפרק שותפויות קלאסי. יישרו קו על ספים, משיכות וחלוקה.", "Money expectation gaps are a classic partnership breaker. Align thresholds, draws, and splits.", "Las brechas de dinero rompen sociedades. Alinead umbrales, retiros y repartos."],
    ["dim-conflictGovernance-high", "אתם יודעים לנהל מחלוקת בלי להרוס את העסק — שמרו על מנגנון הכרעה כתוב.", "You can disagree without destroying the business — keep a written decision breaker.", "Podéis disentir sin destruir el negocio — mantened un mecanismo escrito."],
    ["dim-conflictGovernance-low", "בלי מנגנון קונפליקט, כל ויכוח הופך למשבר אמון. קבעו כללי הכרעה מראש.", "Without conflict rules, every fight becomes a trust crisis. Set decision rules in advance.", "Sin reglas de conflicto, cada pelea es crisis de confianza. Definid reglas antes."],
    ["dim-workloadClarity-high", "יש בהירות טובה יחסית בעומסים ותפקידים — בדקו שזה נכון גם לעבודה הבלתי נראית.", "Workload/role clarity is relatively good — verify invisible work is counted too.", "La claridad de carga/roles es buena — verificad también el trabajo invisible."],
    ["dim-workloadClarity-low", "פערי קצב ועומס שקטים שוחקים שותפות. עשו RACI קל ועדכון עומסים כל חודש.", "Silent pace/load gaps grind partnerships down. Do a light RACI and monthly load check.", "Las brechas de ritmo/carga erosionan. Haced un RACI ligero y revisión mensual."],
    ["overall-strong", "התמונה הכוללת מסונכרנת יחסית — זה הזמן לעגן בכתב לפני שהלחץ יבדוק אתכם.", "Overall alignment looks strong — write it down before pressure stress-tests you.", "La alineación global se ve fuerte — escribidlo antes de que la presión os pruebe."],
    ["overall-steady", "יש בסיס עבודה מקצועי עם נקודות לחיזוק — תעדוף נקודה אחת השבוע.", "There's a professional base with soft spots — prioritize one upgrade this week.", "Hay base profesional con puntos blandos — priorizad una mejora esta semana."],
    ["overall-developing", "יש פוטנציאל, אבל הפערים עדיין גדולים מכדי להאיץ עיוור. יישור קו לפני סקייל.", "Potential exists, but gaps are too big for blind acceleration. Align before scaling.", "Hay potencial, pero las brechas son grandes para acelerar a ciegas. Alinead antes."],
    ["overall-needs-care", "האותות מצביעים על סיכון גבוה. עצרו לסבב כנות ולמסמך מינימלי לפני עוד מחויבות.", "Signals point to high risk. Pause for an honesty round and a minimal document first.", "Las señales apuntan a alto riesgo. Pausa para honestidad y un documento mínimo."],
    ["industry-tech", "בענף טק: קניין רוחני, דליברי ושקיפות פרודקשן הם קווים אדומים — אל תשאירו בעל־פה.", "In tech: IP, delivery, and prod transparency are red lines — don't leave them oral.", "En tech: IP, delivery y transparencia de prod son líneas rojas — no lo dejéis oral."],
    ["industry-commerce", "במסחר: מלאי, ספקים ותזרים שוברים שותפויות מהר — תעדו החלטות כסף ותלויות.", "In commerce: inventory, vendors, and cashflow break partnerships fast — document money and deps.", "En comercio: stock, proveedores y caja rompen rápido — documentad dinero y dependencias."],
    ["industry-services", "בשירותים: לקוחות, מוניטין ועומס פרויקטים הם הליבה — הגדירו מי מדבר החוצה.", "In services: clients, reputation, and project load are core — define who speaks externally.", "En servicios: clientes, reputación y carga son el núcleo — definid quién habla fuera."],
    ["industry-food", "בקולינריה: משמרות, סטנדרט שירות וספקים דורשים תיאום יומיומי חזק.", "In food: shifts, service standards, and vendors demand strong daily coordination.", "En food: turnos, estándar de servicio y proveedores exigen coordinación diaria."],
    ["industry-other", "גם מחוץ לענפים ה\"קלאסיים\" — אותם עקרונות: בהירות, כסף, הכרעה ויציאה.", "Outside classic industries — same principles: clarity, money, decisions, and exit.", "Fuera de industrias clásicas — mismos principios: claridad, dinero, decisión y salida."],
    ["equity-equal", "בחלוקה שווה: שוויון בנתח לא מחליף שוויון בעומס. בדקו תרומה בפועל כל רבעון.", "Equal equity ≠ equal load. Recheck actual contribution each quarter.", "Equity igual ≠ carga igual. Revisad el aporte real cada trimestre."],
    ["equity-majority", "ברוב ברור: הגדירו הגנות למיעוט (וטו על נושאים קריטיים) כדי למנוע מרירות.", "With a clear majority: define minority protections (veto on critical topics).", "Con mayoría clara: definid protecciones de minoría (veto en temas críticos)."],
    ["equity-complex", "בחלוקה מורכבת: פשטו כללי עדכון/הבשלה — מורכבות בלי מסמך היא מלכודת.", "With complex splits: simplify update/vesting rules — complexity without docs is a trap.", "Con split complejo: simplificad reglas de update/vesting — sin docs es una trampa."],
  ];
  for (const [id, he, en, es] of insightPairs) {
    base.insights[id] = t([he, en, es]);
  }

  const tipPairs = [
    ["tip-decision-rights", "כתבו מטריצת החלטות: מה מחליטים לבד, מה ביחד, ומה דורש רוב.", "Write a decision matrix: solo / together / majority required.", "Escribid una matriz de decisión: solo / juntos / mayoría."],
    ["tip-crisis-owner", "מנו owner למשבר (פרודקשן/לקוח/תזרים) ו־deputy — לפני האירוע.", "Name a crisis owner and deputy — before the incident.", "Nombrad owner de crisis y deputy — antes del incidente."],
    ["tip-exit-clause", "הגדירו יציאה/Buyout ברמה בסיסית: הודעה, הערכה, ותשלום.", "Define a basic exit/buyout: notice, valuation, payment.", "Definid salida/buyout básico: aviso, valoración, pago."],
    ["tip-monthly-money-meeting", "פגישת כסף חודשית קבועה: burn, התחייבויות, והחלטות קרובות.", "A fixed monthly money meeting: burn, commitments, near-term decisions.", "Reunión mensual de dinero: burn, compromisos, decisiones próximas."],
    ["tip-expense-thresholds", "קבעו סף הוצאה שמתחתיו אפשר לבד ומעליו חובה יישור קו.", "Set an expense threshold for solo spend vs mandatory alignment.", "Definid umbral de gasto: solo vs alineación obligatoria."],
    ["tip-sweat-vs-cash", "תעדו תרומת זמן מול כסף — כדי שלא יהפכו לחשבונות ישנים.", "Track sweat vs cash contribution — so it doesn't become old resentment.", "Registrad sweat vs cash — para que no se vuelva rencor antiguo."],
    ["tip-deadlock-rule", "קבעו שובר תקיעות: יועץ, הגרלה מבוקרת, או הכרעת יו\"ר לסירוגין.", "Set a deadlock breaker: advisor, controlled coin-flip, or rotating chair.", "Definid anti-bloqueo: advisor, sorteo controlado o silla rotativa."],
    ["tip-feedback-ritual", "טקס פידבק דו־שבועי: 20 דקות, עובדות קודם, פרשנות אחר כך.", "Biweekly feedback ritual: 20 minutes, facts first, interpretation second.", "Ritual quincenal de feedback: 20 minutos, hechos primero."],
    ["tip-no-side-channels", "אסור ערוצי צד על החלטות קריטיות — הכל בשולחן המשותף.", "No side-channels on critical decisions — everything at the shared table.", "Sin canales laterales en decisiones críticas — todo en la mesa."],
    ["tip-raci-lite", "RACI קל ל־5 תהליכים קריטיים בלבד. לא מסמך של 40 עמודים.", "A light RACI for only 5 critical processes. Not a 40-page wiki.", "Un RACI ligero para solo 5 procesos críticos."],
    ["tip-capacity-check", "בכל שבוע: כמה אחוזי קיבולת פנויים לכל שותף — בלי הרואיות.", "Weekly: open capacity % per partner — no heroics.", "Semanal: % de capacidad libre por socio — sin heroicidades."],
    ["tip-invisible-work-log", "רשמו שבוע אחד של עבודה בלתי נראית — ואז חלקו מחדש.", "Log one week of invisible work — then redistribute.", "Registrad una semana de trabajo invisible — luego redistribuid."],
    ["tip-founders-cadence", "סינכרון מייסדים שבועי קבוע — אפילו 30 דקות — מנצח וואטסאפ כאוטי.", "A fixed weekly founders sync — even 30 minutes — beats chaotic chat.", "Un sync semanal fijo de fundadores — aunque sean 30 minutos."],
  ];
  for (const [id, he, en, es] of tipPairs) base.tips[id] = t([he, en, es]);

  const agreePairs = [
    ["agree-decision-matrix", "מטריצת סמכויות והחלטות (מה לבד / מה ביחד / מה ברוב).", "Decision-rights matrix (solo / joint / majority).", "Matriz de derechos de decisión (solo / conjunto / mayoría)."],
    ["agree-exit-and-buyout", "סעיף יציאה ו־Buyout בסיסי (הודעה, הערכה, פריסת תשלום).", "Basic exit & buyout clause (notice, valuation, payment schedule).", "Cláusula básica de salida y buyout."],
    ["agree-ip-ownership", "בעלות על IP/נכסים/קשרי לקוחות והעברה לשותפות.", "Ownership of IP/assets/client relationships and assignment to the venture.", "Propiedad de IP/activos/relaciones y cesión a la sociedad."],
    ["agree-compensation-policy", "מדיניות שכר/דיבידנד/החזר הוצאות וסף אישור.", "Salary/dividend/expense reimbursement policy and approval thresholds.", "Política de salario/dividendos/gastos y umbrales de aprobación."],
    ["agree-conflict-escalation", "מסלול הסלמה ובוררות/גישור במבוי סתום.", "Escalation path and mediation/arbitration on deadlock.", "Ruta de escalado y mediación/arbitraje en punto muerto."],
    ["agree-time-commitment", "התחייבות זמן מינימלית ועדכון כשהקיבולת משתנה.", "Minimum time commitment and updates when capacity changes.", "Compromiso mínimo de tiempo y actualización si cambia la capacidad."],
  ];
  for (const [id, he, en, es] of agreePairs) base.agreement[id] = t([he, en, es]);

  for (const [id, he, en, es] of questionDefs) {
    base.questions[id] = { prompt: t([he, en, es]) };
    if (industryVariants[id]) {
      base.questions[id].byIndustry = {};
      for (const [ind, texts] of Object.entries(industryVariants[id])) {
        base.questions[id].byIndustry[ind] = t(texts);
      }
    }
  }

  return base;
}

for (const [locale, idx] of [["he", 0], ["en", 1], ["es", 2]]) {
  const file = path.join(root, locale, "businessPartnership.json");
  fs.writeFileSync(file, JSON.stringify(buildLocale(idx), null, 2) + "\n");
  console.log("wrote", locale);
}
