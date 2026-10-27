# Dizayn tahlili — nega sayt "AI qilgan" ko'rinadi

_TDIU Clubs · 2026-yil oktabr · tahlil va qayta ishlash rejasi_

## 1. Muammo nima

Sayt yomon chizilmagan. U **o'rtacha** chizilgan — va o'rtachalik aynan o'sha
"soxta" hisning manbai. Har bir element alohida olganda to'g'ri; yonma-yon
qo'yilganda esa hech qayerda **qaror** ko'rinmaydi: hamma narsa bir xil
yumaloq, bir xil yumshoq, bir xil balandlikda.

Quyidagi ro'yxat ekran va kod bo'yicha o'lchandi, taxmin emas.

## 2. O'n ikkita aniq belgi

| № | Belgisi | Qayerda | Nega "AI" bo'lib ko'rinadi |
|---|---------|---------|----------------------------|
| 1 | Har bir blok — yumaloq karta: 1px chegara + soya + hover'da ko'tarilish | 4 ta kanal, 4 ta klub, yangiliklar, tadbirlar, kutubxona | Karta — tayyor shablonning eng oson yechimi. Bir sahifada 20 ta karta bo'lsa, ierarxiya yo'qoladi: hamma narsa bir xil muhim. |
| 2 | Bo'lim ritmi qat'iy takrorlanadi: `01 —`, serif sarlavha, lede, grid | 9 marta ketma-ket | Inson bir marta shunday qiladi, keyin **buzadi**. Mashina hech qachon buzmaydi. |
| 3 | Hero = chapda katta sarlavha + o'ngda "suzib turgan" mahsulot kartasi | birinchi ekran | 2022–2024 landing shablonlarining eng ko'p ko'chirilgan kompozitsiyasi. |
| 4 | Bezak: blur qilingan yashil dog'lar, kontur maydon, klub nomlari marquee'si | hero, bo'limlar orasi | Ma'lumot bermaydigan bezak. "Bo'shliqni to'ldirish" uchun qo'yilgan narsa darhol seziladi. |
| 5 | Kontrast past: bej ustida bej, ink deyarli qora emas | butun sayt | Bosma nashrda qora — qora. Yumshoq kulrang matn "iliq va zamonaviy" emas, shunchaki o'qilmaydi. |
| 6 | Tipografik drama yo'q: eng katta matn 46–56px, eng kichigi 14px | butun sayt | Proportsiya 4:1. Gazeta yoki jurnalda 10:1 bo'ladi. Shkala bo'lmasa, sahifa "forma" bo'lib qoladi. |
| 7 | Radius hamma joyda 14–18px, o'tkir burchak yo'q | kartalar, tugmalar | Yumaloq = ekran. O'tkir = bosma. Faqat yumaloq bo'lsa, hech narsa "chop etilgan" his bermaydi. |
| 8 | Ikonkalar yumaloq kvadrat ichida, kartaning burchagida | kanal kartalari | Shablon to'ldiruvchisi. Ikonka o'zi yetarli. |
| 9 | Raqamlar faqat "ijtimoiy isbot": 22 / 6 / 13 / 54 — uch marta | hero, klublar, reyting | Bir xil raqamlar uch xil bezakda — mashina takrorlaydi, muharrir esa har raqamga o'z vazifasini beradi. |
| 10 | Barcha matn markazga yoki bir xil chap chetga tekislangan | barcha sarlavhalar | Asimmetriya yo'q. Simmetriya — xavfsiz tanlov, xavfsiz tanlov esa o'rtacha. |
| 11 | Hover = `translateY(-2px)` + soya, hamma joyda bir xil | har bir karta | Harakat ham ierarxiya. Hamma narsa ko'tarilsa, hech narsa ko'tarilmaydi. |
| 12 | Rasm deyarli yo'q — faqat rangli to'rtburchaklar | yangiliklar, tadbirlar | Surat — nashrning asosi. Usiz sahifa maket bo'lib qoladi. |

## 3. Xalqaro amaliyotdan nima olinadi

Tahlil qilingan yo'nalishlar: universitet va madaniyat institutlari saytlari,
jurnal/magazin tipidagi nashrlar, zamonaviy redaksion dizayn.

**Redaksion (jurnal) yondashuvi** — eng katta uchta saboq:

1. **To'r — argument, shablon emas.** 5, 7, 9 ustunli to'rlar; tor ustun —
   chekka izohlar zonasi. Asimmetriya tasodif emas, tizimning natijasi.
2. **Chiziq karta o'rnini bosadi.** Gazeta hech narsani "kartaga" solmaydi:
   bo'limlar 1px chiziq bilan ajraladi, matn chiziqlar orasida turadi.
3. **Shkala dissonansi.** Sarlavha va matn orasidagi farq keskin bo'lishi
   kerak. O'rtacha o'lchamlar ierarxiyani o'ldiradi.

**"AI ko'rinish" bo'yicha amaliy tavsiyalar** (bir necha manbadan jamlangan):

- gradient hero va uchta bir xil kartani tashlash;
- displey vaznini 700 dan 400–500 ga tushirish, o'lchamga ishlashga qo'yish;
- hamma narsani markazga tekislashni to'xtatish;
- bo'limlar orasidagi bo'shliqni 2–3 barobar oshirish;
- rang byudjeti: uchta aksent, har biri sahifada ko'pi bilan uch marta.

## 4. Yangi yo'nalish: "Universitet gazetasi"

Sayt **bosma byulleten** kabi chiziladi — Yoshlar ittifoqi devoriy gazetasi
qanday chop etilsa, shunday:

- **Nameplate.** Sahifa boshida qoidalar bilan o'ralgan gazeta nomi: emblem,
  "TDIU CLUBS", nashr satri (shahar, sana, №). Bu sahifaning birinchi
  "imzosi" — hech qanday shablonda yo'q.
- **Chiziqlar, kartalar emas.** Bo'limlar chetdan chetga cho'zilgan 1px ink
  chiziq bilan ajraladi. Faqat **bitta** element karta bo'lib qoladi (o'qish
  paneli) — shuning uchun u darhol muhim bo'lib ko'rinadi.
- **Chap metaraнka.** Har bo'lim chapda ingichka ustunda turadi: `01`,
  bo'lim nomi, sana. Matn esa o'ngda keng ustunda.
- **Tipografika.** Fraunces 96–128px gacha (clamp), 0.9 leading, kursiv
  urg'u; Manrope 15px/1.7, 62 belgi. Sanoq raqamlari jadval uslubida.
- **Rang.** Qog'oz `#f4f1e8`, ink `#16170f` (deyarli qora), bitta yashil
  `#1c5138` tekis to'ldirish sifatida, mis `#8a6a2f` faqat 1px chiziq.
  Dog'lar, gradientlar, blur — yo'q.
- **Harakat.** Ko'tarilish emas: havola ustida ink chizig'i ochiladi,
  sarlavha mask ostidan chiqadi, raqamlar sanaladi. Sekin va kam.

## 5. Bajarilgan ishlar (kod)

1. `globals.css` — tokenlar qayta yozildi: ink qoraytirildi, qog'oz
   oqartirildi, radiuslar 13–18px dan 2–6px ga tushirildi, soyalar deyarli
   yo'q qilindi. Bu butun saytga tegadi.
2. `.gz-*` qatlami — gazeta to'ri, chiziqlar, nameplate, metaraнka,
   tipografik shkala, hover chizig'i.
3. Landing to'liq qayta yozildi (12 ta bo'lim o'rniga 7 ta, har biri boshqa
   kompozitsiyada).
4. Header — nameplate satri va chiziqli navigatsiya.
5. Kartalar — `ClubCard`, `NewsCard`, `EventRow` chiziqli qatorlarga
   o'tkazildi.

## 6. Sinov

Har bir qadam: `tsc --noEmit` → `npm run build` → `next start` → Playwright
bilan yorug' (1440), qorong'i (1440) va mobil (390) ekranlarda suratga olish.
Bo'limlar **viewport** bo'yicha olinadi, `fullPage` emas — to'liq sahifa
suratida katta gradient fonlar ba'zan chizilmay qoladi va yolg'on xato
ko'rsatadi.
