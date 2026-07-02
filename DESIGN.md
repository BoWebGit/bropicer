# DESIGN.md — Bropicer

> Візуальні токени саме цього проєкту. Авторитет: цей файл → high-end-visual-design → gpt-taste →
> scroll-experience → характер (cinematic-dark) → design-taste-frontend (Pre-Flight).
> 🔗 **Істина:** шрифти/кольори тут **МУСЯТЬ збігатися** з реальним CSS (`@import`/`link`).

## Характер і дайли
- **Характер:** cinematic-dark editorial + brutal giant-type. «Темна сцена під чорну пляшку».
- **Дайли:** `DESIGN_VARIANCE 9` (ламаний/асиметрія) · `MOTION_INTENSITY 9` (pin/scrub/pan/kinetic) · `VISUAL_DENSITY 3` (повітря).
- **Reference-driven:** синтез R1–R5 з `resources/refs/references.md` (Bunta Beer, Angle Brewery, Independent Brewers of Europe, GRITZ, Onyx).

## Типографіка (award-grade + гарантована українська кирилиця)
> Жорстка вимога: сайт український → display і mono МУСЯТЬ мати ґ/і/ї/є. Fontshare-фаворити award-сайтів
> (Clash Display, Satoshi) — **Latin-only**, падають у фолбек → відкинуто. Обрано award-grade Google-шрифти з повною укр. підтримкою.
- **Display:** `Mazzard` (Mazzard H Black) — **self-host OTF** у `design/assets/fonts/` (GraphicUX free sample: лише Black + BlackItalic). Важкий м'яко-заокруглений геометричний дисплей, кирилиця+Ukrainian підтверджені візуально. Використовується для всіх заголовків (`--disp`).
- **Sans (текст/UI + тонкий sub):** `Onest` — Google. Нейтральний гротеск, повна кирилиця. Ваги 300–900 (300 — «жодного зайвого», 400/500 — тіло). Також fallback для `--disp`.
- **Mono (мета: 01–06, ABV, стиль, мітки):** `JetBrains Mono` — Google. Повна кирилиця. «Лабораторний» craft-tone (як Onyx).
- 🔗 Реальне підключення: display — `@font-face "Mazzard"` (self-host OTF, `assets/fonts/MazzardH-Black*.otf`);
  Google `<link>` (в `index.html`): `Onest:wght@300..900` + `JetBrains+Mono:wght@400;500`.
  CSS: `--disp:"Mazzard","Onest",…; --sans:"Onest"; --mono:"JetBrains Mono";`
- 🚫 Заборонені (бан плейбука): Inter, Roboto, Arial, Open Sans, Helvetica, Montserrat, **Oswald**, Manrope-як-дисплей.
- Тип-скейл героя: **у `vh`** (`clamp(4rem, 19vh, 17rem)`) — пропорційний висоті фото (плита height-bound), а не ширині екрана. Слова прив'язані до країв фото (кластери в `.hero__frame`), без `overflow`/тіні. Kinetic char-reveal (підйом+проявлення) + parallax.

## Колір (ЧБ база + один стриманий сигнал)
| Токен | Значення | Призначення |
|-------|----------|-------------|
| `--void` | `#060606` | найглибший чорний: прелоадер, hero, cinematic-секції |
| `--ink` | `#0E0E0E` | темні секції |
| `--paper` | `#F3F2EE` | off-white: текст на темному + інвертовані editorial-панелі |
| `--muted` | `#9B978C` | вторинний текст на темному |
| `--line` | `rgba(243,242,238,0.14)` | хейрлайни на темному |
| `--line-ink` | `rgba(11,11,11,0.14)` | хейрлайни на світлому |
| `--signal` | `#C6923E` | **приглушений амбер** (пиво). ТІЛЬКИ мікро: курсор, active, дрібні мітки. Не заливки. |

- **Тема:** dark-dominant (cinematic). Світлі (paper) панелі — **свідомі editorial-інверсії** (маніфест / один сорт), не випадковий фліп. Задокументовано як color-block ритм.
- 🚫 Без pure `#000`/`#fff`, без AI-фіолетових градієнтів, без em-dash у видимому тексті.

## Простір, форма, сітка
- Контейнер: `min(92vw, 1360px)`; бокові `clamp(1.2rem, 5vw, 4rem)`.
- **SHAPE LOCK:** гострі кути (radius 0) скрізь. Роздільники — хейрлайни, не картки.
- **Broken grid:** асиметрія, накладки, тип виходить за край. Не «заголовок + сітка» щоразу. Кожен layout-архетип — не більше 1 разу.
- Вертикаль секцій: `clamp(7rem, 14vh, 12rem)`.

## Моушн (GSAP ScrollTrigger + Lenis — змістовний)
- Стек CDN: GSAP 3.13 + ScrollTrigger, Lenis (smooth scroll, синхр. з ScrollTrigger).
- Прийоми (кожен «заробляє місце»):
  - **Прелоадер/інтро:** лічильник + curtain-reveal бренду (= водночас age-gate 18+).
  - **Hero:** kinetic char-reveal заголовка (ручний split у `<span>`) + parallax пляшки на скролі.
  - **Marquee:** швидкість реагує на скрол (skew/velocity).
  - **Маніфест:** pinned scrollytelling, рядки mask-reveal по скрабу.
  - **6 сортів:** **горизонтальний пан** (pinned wrapper + scrub) — центральна ідея (R2+R1).
  - **Pour-moment:** pinned зображення + parallax/scrub + рядок копірайту.
  - **Craft:** parallax full-bleed фото + staggered reveal пунктів (асиметрично).
  - **Magnetic CTA** + **кастомний курсор** (dot+ring, магнітиться до `[data-magnetic]`).
- 🚫 Блановий `fade-up` на все — бан.
- `prefers-reduced-motion: reduce` → Lenis off, pin/scrub/pan off (секції як звичайний вертикальний скрол), курсор дефолтний, лічильник миттєвий.

## Медіа (M2 — драфти Pollinations; апгрейд через ChatGPT/Gemini/Reve)
- Локально в `design/assets/`: `hero-bottle-v2.png` (пляшка, dark concrete), `pour.png` (макро налив), `macro-cap.png` (біла кришка макро), `stone-bottle.png` (wide на камені), `process.png` (ЧБ броварня).
- Усі — ЧБ/monochrome cinematic, `loading="lazy"` (hero `fetchpriority=high`), фільтр `grayscale(1) contrast(1.05)` для єдності.
- Промти — за формулою `02-design.md`; готові промти для якісного апгрейду → в `resources/refs/image-prompts.md`.
- ❌ Не хотлінкати зовнішні URL; ❌ не видавати AI-обличчя за реальних людей.

## Доступність
- Контраст: paper на void ≈ 17:1; таргети ≥ 44px; видимий focus-ring (2px solid --paper, offset 3px).
- Age-gate керується клавіатурою; форма — label над полем, error знизу; курсор/моушн off при reduced-motion.

## Огорожа фактів (блокери релізу)
- Назви/стилі/ABV/**ціни** 6 сортів — заглушки, `TODO: підтвердити`.
- Без вигаданих відгуків/нагород/цифр. Age-gate 18+ + дисклеймер обовʼязкові.
- Форма замовлення — демо; backend/оплата — `TODO`.
