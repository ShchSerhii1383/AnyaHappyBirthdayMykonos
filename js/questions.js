/* =========================================================================
   THE SECRET JOURNAL — content file
   -------------------------------------------------------------------------
   Everything a non-programmer should need to edit lives in this file:
   the question bank, the final identity question, the journal's replies,
   and a few global settings. game.js only reads from here.
   ========================================================================= */


/* -------------------------------------------------------------------------
   QUESTION BANK — 56 questions

   ЯК РЕДАГУВАТИ (коротко):
   • Кожне питання — окремий блок { ... } між фігурними дужками.
   • question — текст питання (журнал "пише" його на лівій сторінці).
   • answers  — рівно 4 варіанти в лапках, через кому: A, B, C, D.
   • correct  — номер правильної відповіді: 0 = A, 1 = B, 2 = C, 3 = D.
   • Після кожного блоку ставиться кома.
   • Якщо в тексті потрібен апостроф, пиши його як ' (він уже всередині
     подвійних лапок, тож нічого не зламає). Подвійні лапки " всередині
     тексту не використовуй — заміни на «ялинки».

   Length guide (from the stress test): questions up to ~190 characters
   and answers up to ~60 characters stay comfortably readable. Longer
   texts still fit, but the letters get small; the browser console warns
   if a text no longer fits at all.

   On every run the game shuffles this bank and takes
   GAME_CONFIG.trialCount (8) questions with no repeats, so the bank can
   be any size as long as it has at least 8 entries.
   ------------------------------------------------------------------------- */
const QUESTION_BANK = [

  /* ---------- MYKONOS & GREECE ---------- */
  {
    question: "Як називають головне містечко Міконоса?",
    answers: ["Фіра", "Хора", "Іракліон", "Пірей"],
    correct: 1
  },
  {
    question: "Як називається район Міконоса, де будиночки стоять просто над водою?",
    answers: ["Маленька Венеція", "Старий Париж", "Нова Барселона", "Мала Прага"],
    correct: 0
  },
  {
    question: "Як називаються знамениті вітряки на пагорбі над Хорою?",
    answers: ["Акрополі", "Олімпія", "Като Мілі", "Санторіні Мілз"],
    correct: 2
  },
  {
    question: "Хто вже десятиліттями є живим талісманом Міконоса й гуляє вуличками Хори?",
    answers: ["Кіт Зевс", "Осел Ґеорґіос", "Папуга Афіна", "Пелікан Петрос"],
    correct: 3
  },
  {
    question: "Яке море омиває Міконос?",
    answers: ["Егейське", "Чорне", "Балтійське", "Червоне"],
    correct: 0
  },
  {
    question: "Сусідній з Міконосом острів у міфах вважають місцем народження Аполлона. Як він називається?",
    answers: ["Корфу", "Делос", "Крит", "Родос"],
    correct: 1
  },
  {
    question: "Як грецькою сказати «дякую»?",
    answers: ["Калімера", "Опа", "Евхаристо", "Яссас"],
    correct: 2
  },
  {
    question: "Який сир обов'язково кладуть у справжній грецький салат?",
    answers: ["Моцарела", "Брі", "Пармезан", "Фета"],
    correct: 3
  },
  {
    question: "Що таке цацикі?",
    answers: ["Соус з йогурту, огірка й часнику", "Грецький танець", "Солодкий пиріг з медом", "Рибальський човен"],
    correct: 0
  },
  {
    question: "Як називається грецький анісовий напій, який біліє, коли в нього доливають воду?",
    answers: ["Лимончело", "Узо", "Сангрія", "Граппа"],
    correct: 1
  },
  {
    question: "Яка валюта в Греції?",
    answers: ["Драхма", "Долар", "Євро", "Ліра"],
    correct: 2
  },

  /* ---------- TRAVEL ---------- */
  {
    question: "Скільки мілілітрів рідини в одній ємності зазвичай можна взяти в ручну поклажу?",
    answers: ["50 мл", "250 мл", "500 мл", "100 мл"],
    correct: 3
  },
  {
    question: "У якому місці салону літака зазвичай найменше трясе в турбулентність?",
    answers: ["Біля крила", "У самому хвості", "Біля кабіни пілотів", "Біля туалету"],
    correct: 0
  },
  {
    question: "Яке місто називають «Вічним містом»?",
    answers: ["Афіни", "Рим", "Стамбул", "Єрусалим"],
    correct: 1
  },
  {
    question: "Яку країну щороку відвідує найбільше іноземних туристів у світі?",
    answers: ["Італію", "Іспанію", "Францію", "Таїланд"],
    correct: 2
  },
  {
    question: "Що з цього НЕ варто класти в ручну поклажу?",
    answers: ["Паспорт", "Зарядку для телефону", "Книжку", "Літрову пляшку води"],
    correct: 3
  },
  {
    question: "Як називається найвища гора Греції, де за міфами жили боги?",
    answers: ["Олімп", "Етна", "Монблан", "Парнас"],
    correct: 0
  },

  /* ---------- SHOPPING & FASHION ---------- */
  {
    question: "Якого кольору фірмові коробочки Tiffany & Co.?",
    answers: ["Рожевого", "Бірюзового", "Золотого", "Чорного"],
    correct: 1
  },
  {
    question: "Яка фірмова деталь туфель Christian Louboutin?",
    answers: ["Золотий каблук", "Бантик на носку", "Червона підошва", "Прозорий ремінець"],
    correct: 2
  },
  {
    question: "На честь кого названо знамениту сумку Hermès Birkin?",
    answers: ["Засновника бренду", "Англійської королеви", "Міста у Франції", "Актриси Джейн Біркін"],
    correct: 3
  },
  {
    question: "Як насправді звали Коко Шанель?",
    answers: ["Габріель", "Жаклін", "Моніка", "Бріжит"],
    correct: 0
  },
  {
    question: "З якої країни бренд Gucci?",
    answers: ["Франція", "Італія", "Іспанія", "США"],
    correct: 1
  },
  {
    question: "Яке місто вважають модною столицею Італії?",
    answers: ["Неаполь", "Венеція", "Мілан", "Палермо"],
    correct: 2
  },
  {
    question: "Як називається найвідоміша шопінг-вулиця Парижа?",
    answers: ["Бродвей", "Оксфорд-стріт", "Рамбла", "Єлисейські Поля"],
    correct: 3
  },
  {
    question: "У якому місті з'явилися перші джинси Levi's?",
    answers: ["Сан-Франциско", "Нью-Йорк", "Лондон", "Чикаго"],
    correct: 0
  },
  {
    question: "Хто придумав «маленьку чорну сукню»?",
    answers: ["Крістіан Діор", "Коко Шанель", "Джорджо Армані", "Донателла Версаче"],
    correct: 1
  },
  {
    question: "Що означає слово SALE на вітрині?",
    answers: ["Новинки", "Магазин зачиняється", "Розпродаж", "Тільки для VIP"],
    correct: 2
  },

  /* ---------- JUST FOR FUN ---------- */
  {
    question: "Що робити, коли валіза вже не закривається?",
    answers: ["Викласти половину речей", "Скасувати подорож", "Купити ще одну валізу", "Сісти на неї зверху"],
    correct: 3
  },
  {
    question: "Скільки пар взуття треба брати у відпустку на тиждень?",
    answers: ["Завжди на одну більше, ніж планувала", "Одну", "Дві", "Жодної, ходитиму боса"],
    correct: 0
  },
  {
    question: "Що першим купується в дьюті-фрі?",
    answers: ["Лише те, що в списку", "Те, чого точно не планувала", "Нічого", "Пляшка води"],
    correct: 1
  },
  {
    question: "Що найважливіше на будь-якій вечірці?",
    answers: ["Торт", "Музика", "Іменинниця", "Дрес-код"],
    correct: 2
  },
  {
    question: "Яке найкраще місце для фото на Міконосі?",
    answers: ["Парковка біля порту", "Аеропорт", "Номер готелю", "Маленька Венеція на заході сонця"],
    correct: 3
  },

  /* ---------- FROM THE EXPLORER'S JOURNAL (shared with the Bazaar game) ----------
     Imported from journalQuestions.js. The `story` lines of that file are
     not used here: this journal has no place to show them. */
  {
    question: "У якій із цих країн сонце влітку може не заходити навіть поза Полярним колом?",
    answers: ["Норвегія", "Австрія", "Швейцарія", "Чехія"],
    correct: 0
  },
  {
    // Original wording said "столиця", but Istanbul is not Turkey's capital.
    question: "Яке з цих міст розташоване одразу на двох континентах?",
    answers: ["Афіни", "Будапешт", "Стамбул", "Бухарест"],
    correct: 2
  },
  {
    question: "Яка країна має найбільшу кількість островів?",
    answers: ["Хорватія", "Греція", "Норвегія", "Швеція"],
    correct: 3
  },
  {
    question: "У якій країні найдовший у Європі залізничний тунель?",
    answers: ["Франція", "Швейцарія", "Австрія", "Італія"],
    correct: 1
  },
  {
    question: "Яке море НЕ омиває Італію?",
    answers: ["Лігурійське", "Адріатичне", "Іонічне", "Егейське"],
    correct: 3
  },
  {
    question: "Яка країна має найбільше сусідів у Європі?",
    answers: ["Німеччина", "Франція", "Польща", "Австрія"],
    correct: 0
  },
  {
    question: "Яка столиця знаходиться найближче до моря?",
    answers: ["Мадрид", "Відень", "Лісабон", "Прага"],
    correct: 2
  },
  {
    question: "У якій країні розташований найвищий водоспад материкової Європи?",
    answers: ["Ісландія", "Норвегія", "Австрія", "Словенія"],
    correct: 1
  },
  {
    // Source file marked "Посадка" (0) as correct; check-in closes first
    // (about 40–60 min before departure, boarding about 15–20 min).
    question: "Ти запізнюєшся на літак. Що закриється раніше?",
    answers: ["Посадка", "Реєстрація", "Паспортний контроль", "Duty Free"],
    correct: 1
  },
  {
    question: "Який ряд місць у літаку найчастіше відсутній?",
    answers: ["7", "9", "13", "21"],
    correct: 2
  },
  {
    question: "Яку валюту використовують у Швейцарії?",
    answers: ["Євро", "Франк", "Крона", "Флорин"],
    correct: 1
  },
  {
    question: "Що найчастіше означає синій прапор на пляжі?",
    answers: ["Пляж закритий", "Висока хвиля", "Вода відповідає високим стандартам чистоти", "Заборонено купатися"],
    correct: 2
  },
  {
    question: "У якій країні найчастіше можна побачити дорожні знаки одразу двома мовами?",
    answers: ["Польща", "Бельгія", "Італія", "Данія"],
    correct: 1
  },
  {
    question: "Який документ найкраще тримати окремо від паспорта під час подорожі?",
    answers: ["Квитанцію", "Банківську картку", "Копію паспорта", "Туристичний путівник"],
    correct: 2
  },
  {
    question: "Який бренд НЕ є італійським?",
    answers: ["Prada", "Gucci", "Chanel", "Versace"],
    correct: 2
  },
  {
    question: "Який із цих брендів заснований у Швеції?",
    answers: ["Zara", "Mango", "H&M", "Desigual"],
    correct: 2
  },
  {
    question: "У якій країні народився бренд Zara?",
    answers: ["Франція", "Іспанія", "Португалія", "Італія"],
    correct: 1
  },
  {
    question: "Ти випадково замовила каву, нічого не зрозумівши з меню. Найімовірніше, ти зараз у:",
    answers: ["Фінляндії", "Італії", "Норвегії", "Латвії"],
    correct: 1
  },
  {
    question: "У трьох подруг залишилося місце лише для одного сувеніра в ручній поклажі. Що найімовірніше повернеться додому цілим?",
    answers: ["Скляна куля", "Магніт на холодильник", "Пляшка оливкової олії", "Керамічна чашка"],
    correct: 1
  },
  {
    question: "Який із цих брендів НЕ входить до французької групи LVMH?",
    answers: ["Louis Vuitton", "Dior", "Givenchy", "Gucci"],
    correct: 3
  },
  {
    question: "Який бренд починав свою історію як майстерня з виготовлення шкіряних валіз і дорожніх скринь?",
    answers: ["Chanel", "Louis Vuitton", "Prada", "Balenciaga"],
    correct: 1
  },
  {
    question: "Яке місто найбільш відоме своїм «Тижнем моди», який традиційно відкриває сезон показів?",
    answers: ["Мілан", "Париж", "Лондон", "Нью-Йорк"],
    correct: 3
  },
  {
    question: "Який із цих брендів був заснований НЕ в Італії?",
    answers: ["Fendi", "Bottega Veneta", "Max Mara", "Hermès"],
    correct: 3
  },
  {
    question: "У якій країні народився бренд Mango?",
    answers: ["Франція", "Португалія", "Іспанія", "Італія"],
    correct: 2
  }
];


/* -------------------------------------------------------------------------
   FINAL IDENTITY CHECK (Q9)
   Not part of the bank, never gets a progress stamp, and every answer
   is correct — that's the joke. Keep exactly 4 answers.
   ------------------------------------------------------------------------- */
const FINAL_QUESTION = {
  heading: "FINAL IDENTITY CHECK",
  question: "І останнє, найскладніше питання цього журналу… У кого сьогодні День народження?",
  answers: [
    "Аня",
    "Анна",
    "Анечка",
    "Та сама Аня, через яку ми взагалі тут зібралися"
  ],
  revealLine: "Несподівано. Але правильні всі відповіді.",
  stampText: "OWNER CONFIRMED"
};


/* -------------------------------------------------------------------------
   THE JOURNAL'S REPLIES
   One line is picked at random each time. Add or remove freely.
   ------------------------------------------------------------------------- */
const JOURNAL_REPLIES = {
  wrong: [
    "Ммм… точно? 👀",
    "Журнал радить подумати ще раз ☀️",
    "Міконос не поспішає. Спробуй ще 😌",
    "Навіть богині іноді перевіряють маршрут двічі."
  ],
  correct: [
    "Traveller instinct confirmed.",
    "Shopping instinct confirmed.",
    "Excellent choice."
  ]
};


/* -------------------------------------------------------------------------
   FINAL SCENE — the last two journal spreads
   (memory photos → wish + Brocard certificate)

   ЯК РЕДАГУВАТИ:
   • Тексти побажання — нижче, у FINAL_SCENE.wish.
     \n усередині лапок = перенос рядка в цьому місці.
   • Фото лежать у папці assets/photos/ під назвами
     Mykonos_Photo_01.jpg (велике зліва), Mykonos_Photo_02.jpg (мале
     справа зверху), Mykonos_Photo_03.jpg (справа знизу). Щоб замінити
     фото, поклади новий файл із тією самою назвою.
   • Кадрування фото — у css/style.css, блок «PHOTO FRAMING» на початку.
   • Сертифікат — assets/ui/Brocard_Certificate.png.
   ------------------------------------------------------------------------- */
const FINAL_SCENE = {
  wish: {
    opening: "Але деякі речі\nжоден тест перевіряти не повинен.",
    body:    "Нехай у твоєму житті завжди буде місце\nдля спонтанності, сміху\nй маленьких пригод.",
    accent:  "Не втрачай свою легкість.",
    closing: "З нею навіть звичайний день\nможе стати початком нової історії. ✨"
  },

  // Label on the small tab that turns from the memory spread to the finale.
  nextPageLabel: "ДАЛІ",

  // Label on the travel tag that leaves the journal.
  returnLabel: "ПОВЕРНУТИСЯ НА МАПУ"
};


/* -------------------------------------------------------------------------
   GAME CONFIG
   ------------------------------------------------------------------------- */
const GAME_CONFIG = {
  // Number of random trials per run. The open-journal artwork has exactly
  // 8 stamp slots, so changing this also means changing the artwork.
  trialCount: 8,

  // Stamp icon for each slot, in order (see js/stamps.js for the drawings).
  stampOrder: ["airplane", "bag", "sun", "compass", "heart", "heel", "wave", "crown"],

  // Background melody volume: 0 = off, 1 = full. The file itself is
  // assets/audio/mykonos-daylight-groove.mp3 — replace it to change the track.
  musicVolume: 0.35,

  // Where "ПОВЕРНУТИСЯ НА МАПУ" leads. Leave empty ("") to keep the current
  // behaviour: the journal closes and waits on the table again. Set it to a
  // page path (e.g. "../hub/index.html") once the HTML hub exists.
  returnUrl: ""
};
