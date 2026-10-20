/**
 * Club directory — single source of truth for seeding and presentation.
 *
 * Data verified against:
 *  - tsue.uz “Community clubs”
 *  - the official Telegram network listed by @tsueuzofficial
 *  - each club's own Telegram channel (bios + recent posts), October 2026
 *
 * Adding a club = adding an entry here + `npm run db:seed`.
 */

export type ClubCategory = "intellectual" | "academic" | "creative" | "sport" | "social" | "travel";

export type ClubProject = { title: string; description: string };

export type ClubSeed = {
  slug: string;
  name: string;
  shortName?: string;
  tagline: string;
  summary: string;
  description: string;
  category: ClubCategory;
  accent: string;
  coverStyle: "grid" | "arc" | "lines" | "dots";
  telegramUrl?: string;
  instagramUrl?: string;
  email?: string;
  meetingDay?: string;
  meetingTime?: string;
  location?: string;
  featured?: boolean;
  sortOrder: number;
  projects?: ClubProject[];
};

export const CATEGORY_LABELS: Record<ClubCategory, string> = {
  intellectual: "Intellektual",
  academic: "Akademik",
  creative: "Ijodiy",
  sport: "Sport",
  social: "Ijtimoiy",
  travel: "Sayohat",
};

export const CATEGORY_ORDER: ClubCategory[] = [
  "intellectual",
  "academic",
  "creative",
  "sport",
  "social",
  "travel",
];

export const clubs: ClubSeed[] = [
  {
    slug: "book-club",
    name: "Book Club",
    shortName: "Book Club",
    tagline: "Har qanday yorug‘likka — kitob bilan.",
    summary: "Kitobxonlik madaniyati, mualliflar bilan uchrashuvlar va har oy yangi asar muhokamasi.",
    description:
      "TDIU Book Club — universitetdagi eng faol kitobxonlar hamjamiyati. Klub har oy yangi asarni tanlaydi, uni bosqichma-bosqich o‘qiydi va ochiq muhokamada tahlil qiladi. Bookonomics loyihasi, “Yosh kitobxon” tanlovi va jamoaviy tadbirlar orqali talabalar nafaqat kitob o‘qishni, balki fikrni dalillash, jamoa bilan ishlash va sahna madaniyatini ham o‘zlashtiradi.",
    category: "intellectual",
    accent: "#a8492f",
    coverStyle: "arc",
    telegramUrl: "https://t.me/tsuebookclub",
    instagramUrl: "https://instagram.com/tsuebookclub",
    meetingDay: "Shanba",
    meetingTime: "13:00",
    location: "Asosiy kampus, 2-bino",
    featured: true,
    sortOrder: 0,
    projects: [
      {
        title: "Bookonomics",
        description:
          "Klubning asosiy loyihasi: har son bir asarga bag‘ishlanadi. Muhokama yo‘nalishlari oldindan e’lon qilinadi, suhbat ochiq va dalillarga asoslanadi.",
      },
      {
        title: "Yosh kitobxon",
        description:
          "Talaba-yoshlar o‘rtasida kitobxonlik madaniyatini targ‘ib qiluvchi tanlov. “Men yoqtirgan asar” tahlili va “Eng kitobxon jamoa” bellashuvi.",
      },
      {
        title: "Ijtimoiy faollik indeksi",
        description:
          "Vazirlikning 186-son buyrug‘i bo‘yicha kitobxonlik mezoni 12 ta asar asosida baholanadi. Klub ushbu ro‘yxat bo‘yicha tizimli tayyorgarlik olib boradi.",
      },
      {
        title: "Team building",
        description:
          "Har semestr boshida klub jamoasini shakllantirish va talabalar o‘rtasida yangi aloqalarni o‘rnatish uchun ochiq tadbir.",
      },
    ],
  },
  {
    slug: "zakovat",
    name: "Zakovat klubi",
    tagline: "Bilim, mantiq va jamoa — bir stolda.",
    summary: "1- va 2-liga formatida intellektual o‘yinlar, universitet chempionati.",
    description:
      "Zakovat klubi universitet ichida to‘liq liga tizimini yuritadi: jamoalar 1- va 2-ligaga bo‘lingan, har turdan so‘ng ballar va apellyatsiya natijalari e’lon qilinadi. Eng kuchli jamoalar shahar va respublika bosqichlarida universitet sharafini himoya qiladi.",
    category: "intellectual",
    accent: "#1f4a33",
    coverStyle: "grid",
    telegramUrl: "https://t.me/zakovat_quiz_tdiu",
    instagramUrl: "https://instagram.com/tdiu_zakovat_klubi",
    meetingDay: "Shanba",
    location: "Asosiy kampus, Zakovat zali",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "debate",
    name: "Debate Club",
    tagline: "Fikrni himoya qilish — san’at.",
    summary: "Munozara o‘yinlari, notiqlik va dalillash bo‘yicha mashg‘ulotlar.",
    description:
      "Debate Club rasmiy munozara formatida o‘yinlar o‘tkazadi. “Ma’rifat ulashib” loyihasi doirasida har hafta yangi mavzu bo‘yicha jamoalar bellashadi. Klub notiqlik, tanqidiy fikrlash va ingliz tilida bahslashish ko‘nikmalarini rivojlantiradi.",
    category: "intellectual",
    accent: "#23513a",
    coverStyle: "lines",
    telegramUrl: "https://t.me/TDIUdebatklubi",
    meetingDay: "Payshanba",
    location: "7-bino, “Faollar” zali",
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "wikiclub",
    name: "TSUE WikiClub",
    tagline: "Bilimni yozib qoldirish — mas’uliyat.",
    summary: "Vikipediya tahriri, WikiDars, WikiQuiz va WikiOromgoh loyihalari.",
    description:
      "WikiClub o‘zbekcha Vikipediyani rivojlantirishga hissa qo‘shadi. Klub a’zolari maqola yaratish, manbalar bilan ishlash va faktlarni tekshirishni o‘rganadi. WikiDars darslari har hafta asosiy kampusda bo‘lib o‘tadi.",
    category: "academic",
    accent: "#2f5d45",
    coverStyle: "dots",
    telegramUrl: "https://t.me/tsue_wikiclub",
    meetingDay: "Shanba",
    location: "Asosiy kampus, 1-bino, 115-xona",
    sortOrder: 3,
  },
  {
    slug: "iqtisodchilar",
    name: "Iqtisodchilar klubi",
    tagline: "Nazariyadan amaliyotga.",
    summary: "Iqtisodiy loyihalar, “Amaliy matematika” to‘garagi va stipendiya bo‘yicha master-klasslar.",
    description:
      "Klub iqtisodiyot yo‘nalishidagi talabalar uchun amaliy muhit yaratadi: “Iqtisodchi” loyihasi, matematika bo‘yicha qo‘shimcha darslar, stipendiya va grant bo‘yicha tajriba almashish. Tadbirlar shanba kunlari bo‘lib o‘tadi.",
    category: "academic",
    accent: "#6b4f1d",
    coverStyle: "grid",
    telegramUrl: "https://t.me/tdiuiqtisodchiklubi",
    meetingDay: "Shanba",
    location: "4-bino",
    featured: true,
    sortOrder: 4,
    projects: [
      {
        title: "Amaliy matematika",
        description: "Matritsalar, optimallashtirish va iqtisodiy masalalarni amaliy misollarda o‘rganish.",
      },
      {
        title: "Stipendiya sirlari",
        description: "Nomdor stipendiyalar va grantlar bo‘yicha amaldagi talabalar bilan ochiq suhbat.",
      },
    ],
  },
  {
    slug: "speaking",
    name: "Speaking Club",
    tagline: "Til — amaliyotda o‘rganiladi.",
    summary: "Ingliz tilida so‘zlashish, SPEAK UP baholash va 4X IELTS kursi.",
    description:
      "Speaking Club ingliz tilida erkin muloqot qilish uchun muhit yaratadi. SPEAK UP loyihasi ishtirokchilarning darajasini aniqlaydi, 4X IELTS esa volontyorlik asosida to‘rt yo‘nalish bo‘yicha tizimli tayyorgarlik beradi.",
    category: "academic",
    accent: "#33573f",
    coverStyle: "arc",
    telegramUrl: "https://t.me/tsuespeaking",
    instagramUrl: "https://instagram.com/tsuespeaking",
    meetingDay: "Shanba",
    featured: true,
    sortOrder: 5,
    projects: [
      { title: "SPEAK UP", description: "Speaking darajasini aniqlash va baholash loyihasi." },
      {
        title: "4X IELTS",
        description: "Haftasiga 5 jonli dars, 6-kuni Q&A — Reading, Listening, Speaking, Writing.",
      },
    ],
  },
  {
    slug: "it-club",
    name: "IT Club",
    tagline: "G‘oyadan mahsulotgacha.",
    summary: "IDEATHON, startap workshoplar, kiberxavfsizlik va AI mavzusidagi uchrashuvlar.",
    description:
      "IT Club texnologiyaga qiziquvchi talabalarni jamlaydi: IDEATHON, startup workshop, Cyberkent musobaqasi, IT PARK va xalqaro ekspertlar bilan uchrashuvlar. Klub startap g‘oyasini prototipga aylantirishgacha kuzatib boradi.",
    category: "academic",
    accent: "#2a5236",
    coverStyle: "dots",
    telegramUrl: "https://t.me/tsueitclub",
    instagramUrl: "https://instagram.com/tsueitclub",
    meetingDay: "Shanba",
    location: "Akseleratsiya markazi",
    featured: true,
    sortOrder: 6,
    projects: [
      { title: "IDEATHON", description: "G‘oyalarni qisqa vaqt ichida prototipga aylantirish musobaqasi." },
      { title: "Startup workshop", description: "Yoshlar Venture “Debocha” loyihasi bilan hamkorlikdagi amaliy sessiyalar." },
      { title: "Cyberkent", description: "Kiberxavfsizlik sammiti doirasidagi jamoaviy musobaqa." },
    ],
  },
  {
    slug: "networking",
    name: "Networking Community",
    tagline: "To‘g‘ri odam, to‘g‘ri vaqtda.",
    summary: "Biznes-nonushta formatidagi uchrashuvlar va kasbiy tarmoq.",
    description:
      "Networking Community tadbirkorlar, mutaxassislar va bitiruvchilar bilan bevosita muloqot uchun maydon. Biznes-nonushta, davra suhbatlari va IELTS Summit kabi tadbirlar orqali talabalar kasbiy tarmog‘ini quradi.",
    category: "academic",
    accent: "#44493c",
    coverStyle: "lines",
    telegramUrl: "https://t.me/tsue_networking",
    sortOrder: 7,
  },
  {
    slug: "art-club",
    name: "Art Club",
    tagline: "Chizgi ortidagi fikr.",
    summary: "Tasviriy san’at, master-klasslar va ArtVerse tanlovi.",
    description:
      "Art Club rasm chizish, illyustratsiya va dizayn bilan qiziquvchilarni birlashtiradi. Klub master-klasslar, ochiq tanlovlar va fakultetlar bilan hamkorlikdagi ijodiy loyihalarni tashkil qiladi.",
    category: "creative",
    accent: "#7a3348",
    coverStyle: "arc",
    telegramUrl: "https://t.me/tsueartclub",
    sortOrder: 8,
  },
  {
    slug: "handmade",
    name: "Handmade Club",
    tagline: "Qo‘l mehnati — sabr va did.",
    summary: "Qo‘l ishlari ustaxonalari, ijodiy kechalar va Movie Time.",
    description:
      "Handmade Club qo‘l ishlari, dekoratsiya va DIY yo‘nalishlarida ustaxonalar o‘tkazadi. Klub a’zolari birgalikda sovg‘alar, aksessuarlar va ko‘rgazma ishlarini tayyorlaydi; kechqurunlari esa Movie Time formatidagi kino uchrashuvlari bo‘lib o‘tadi.",
    category: "creative",
    accent: "#7a4b2a",
    coverStyle: "dots",
    telegramUrl: "https://t.me/tsuehmc",
    sortOrder: 9,
  },
  {
    slug: "mushoira",
    name: "Mushoira klubi",
    tagline: "So‘z — eng qadimiy san’at.",
    summary: "She’riyat kechalari va “Qalb satrlari” loyihasi.",
    description:
      "Mushoira klubi Oliy ta’lim vazirligi tashabbusi bilan tashkil etilgan. Klub she’r yozuvchilarni birlashtiradi, “Qalb satrlari” loyihasida ijod namunalarini saralab e’lon qiladi va boshqa universitetlar bilan adabiy kechalar o‘tkazadi.",
    category: "creative",
    accent: "#5a4a2c",
    coverStyle: "lines",
    telegramUrl: "https://t.me/Mushoira_clubi",
    sortOrder: 10,
  },
  {
    slug: "ijodkor",
    name: "Ijodkor klubi",
    tagline: "G‘oyani sahnaga olib chiq.",
    summary: "Ijodiy loyihalar, media va tashabbuslar uchun platforma.",
    description:
      "Ijodkor klubi Yoshlar ittifoqi qoshida faoliyat yuritadi. Yangi a’zolar suhbat-saralash orqali qabul qilinadi; klub sahna, media, adabiyot va dizayn yo‘nalishlarida loyihalarni amalga oshiradi.",
    category: "creative",
    accent: "#7d3b3b",
    coverStyle: "arc",
    telegramUrl: "https://t.me/TDIU_Ijodkor_clubi",
    sortOrder: 11,
  },
  {
    slug: "sport",
    name: "Sport Club",
    tagline: "Maydonda ham, hayotda ham.",
    summary: "Terma jamoalar, musobaqalar va 10 dan ortiq sport seksiyasi.",
    description:
      "Sport Club universitetning sport hayotini tashkil qiladi: futbol, voleybol, suzish, tennis, shaxmat, stol tennisi, fitness, dzudo va arm-restling. Klub terma jamoalarni shahar va respublika musobaqalariga tayyorlaydi.",
    category: "sport",
    accent: "#155e4b",
    coverStyle: "grid",
    telegramUrl: "https://t.me/TSUEsportclub",
    instagramUrl: "https://instagram.com/tsue_sport",
    sortOrder: 12,
  },
  {
    slug: "running-club",
    name: "Running Club",
    tagline: "Har shanba — yangi marra.",
    summary: "Haftalik yugurishlar, “Coke Mile” va universitetlararo runlar.",
    description:
      "Running Club har shanba ertalab Anhor bo‘ylab birgalikda yuguradi. Klub “Coke Mile” kabi noodatiy musobaqalar va boshqa universitetlar bilan hamkorlikdagi runlarni tashkil qiladi.",
    category: "sport",
    accent: "#2b5540",
    coverStyle: "lines",
    telegramUrl: "https://t.me/TSUE_Running_club",
    instagramUrl: "https://instagram.com/TSUE_Running_club",
    meetingDay: "Shanba",
    meetingTime: "07:45",
    location: "Paxtakor shop oldida",
    featured: true,
    sortOrder: 13,
  },
  {
    slug: "cybersport",
    name: "Cybersport Club",
    tagline: "Raqamli maydon.",
    summary: "EA Sports FC, PlayStation turnirlari va universitet ligasi.",
    description:
      "Cybersport Club kibersport turnirlarini tashkil qiladi: EA Sports FC saralash bosqichlari, Red Bull Wings Cup universitet ligasi va o‘yin kechalari. Klub jamoalari respublika miqyosidagi musobaqalarda qatnashadi.",
    category: "sport",
    accent: "#4a3b28",
    coverStyle: "grid",
    telegramUrl: "https://t.me/cybersporttsue",
    instagramUrl: "https://instagram.com/tsue_cybersport",
    sortOrder: 14,
  },
  {
    slug: "tomchi",
    name: "Tomchi",
    tagline: "Bir tomchi — bir umid.",
    summary: "Volontyorlar harakati va xayriya loyihalari.",
    description:
      "Tomchi volontyorlar harakati ehtiyojmand talabalar va oilalarga yordam yig‘adi, xayriya tadbirlarini o‘tkazadi. Har bir aksiya va hisobot klub kanalida ochiq e’lon qilinadi.",
    category: "social",
    accent: "#9a3b2f",
    coverStyle: "arc",
    telegramUrl: "https://t.me/tomchi_charity",
    sortOrder: 15,
  },
  {
    slug: "eco-club",
    name: "Eco Club",
    tagline: "Kampus — tabiatning bir qismi.",
    summary: "Ekofaol tadbirlar, yashil tashabbuslar va barqaror kampus.",
    description:
      "Eco Club ekologik madaniyatni shakllantiradi: daraxt ekish, chiqindini saralash, resurslarni tejash va “yashil kampus” tashabbuslari. Klub Ekofaol talabalar harakati bilan birga ishlaydi.",
    category: "social",
    accent: "#2f6b3f",
    coverStyle: "dots",
    telegramUrl: "https://t.me/eco_club_tsue",
    sortOrder: 16,
  },
  {
    slug: "students-union",
    name: "Students’ Union",
    tagline: "Talaba ovozi.",
    summary: "O‘zini o‘zi boshqarish, talabalar vakilligi va yirik tadbirlar.",
    description:
      "Students’ Union talabalarning o‘zini o‘zi boshqarish organi. Talabalar manfaatlarini ifodalaydi, fakultetlar bilan ishlaydi va Open Air Cinema kabi yirik tadbirlarni uyushtiradi.",
    category: "social",
    accent: "#1f4a33",
    coverStyle: "lines",
    telegramUrl: "https://t.me/tsuesu",
    instagramUrl: "https://instagram.com/tsue.su",
    sortOrder: 17,
  },
  {
    slug: "lider-qizlar",
    name: "Lider qizlar klubi",
    tagline: "Yetakchilik — tanlov emas, ko‘nikma.",
    summary: "Talaba-qizlar uchun yetakchilik, forum va uchrashuvlar.",
    description:
      "Lider qizlar klubi talaba-qizlarning yetakchilik salohiyatini oshiradi: forumlar, motivatsion uchrashuvlar, ilm-fan va biznesdagi ayollar mavzusidagi loyihalar.",
    category: "social",
    accent: "#6b3247",
    coverStyle: "arc",
    telegramUrl: "https://t.me/lider_qizlar",
    sortOrder: 18,
  },
  {
    slug: "international",
    name: "International Club",
    tagline: "Bir kampus — ko‘p madaniyat.",
    summary: "Xalqaro talabalar, madaniyatlar almashinuvi va almashinuv dasturlari.",
    description:
      "International Club xorijiy talabalar bilan muloqot, madaniyatlar almashinuvi va xalqaro tadbirlarni tashkil qiladi. Klub almashinuv dasturlari haqida amaliy ma’lumot beradi.",
    category: "social",
    accent: "#24513a",
    coverStyle: "dots",
    telegramUrl: "https://t.me/tsue_international",
    sortOrder: 19,
  },
  {
    slug: "rekordlar",
    name: "TDIU Rekordlar kitobi",
    tagline: "Birinchi bo‘lish uchun sabab.",
    summary: "Universitet rekordlari va noodatiy musobaqalar.",
    description:
      "TDIU Rekordlar kitobi loyihasi talabalarning noodatiy yutuqlarini qayd etadi va original musobaqalarni tashkil qiladi. “Coke Mile” kabi tadbirlar Running Club bilan hamkorlikda o‘tkaziladi.",
    category: "social",
    accent: "#6b4f1d",
    coverStyle: "grid",
    telegramUrl: "https://t.me/TDIU_rekordlar",
    sortOrder: 20,
  },
  {
    slug: "travel-club",
    name: "Travel Club",
    tagline: "Universitetdan tashqarida ham birgamiz.",
    summary: "Tog‘ sayohatlari, ot-minish turlari va ekskursiyalar.",
    description:
      "Travel Club har hafta sayohat uyushtiradi: Kichik Chimyon, Amirsoy, Konniy tour va shahar ekskursiyalari. Narx transport va tashkiliy xarajatlarni o‘z ichiga oladi, klub a’zolari uchun chegirma mavjud.",
    category: "travel",
    accent: "#2f5d3f",
    coverStyle: "arc",
    telegramUrl: "https://t.me/tsuetraveling",
    instagramUrl: "https://instagram.com/tsuetraveling",
    sortOrder: 21,
  },
];

export const FEATURED_CLUB_SLUGS = clubs.filter((c) => c.featured).map((c) => c.slug);

export function getClubSeed(slug: string) {
  return clubs.find((c) => c.slug === slug);
}

export const CLUB_COUNT = clubs.length;
