# Референси — Bropicer (reference-driven, етап 02-design)

> Мета: побудувати сайт рівня цих робіт. Синтез кількох, не копія одного. Джерела — award/curated.

## Обрані референси (напої, award/curated)

### R1 — Bunta Beer · 3D product scroll (Awwwards inspiration)
https://www.awwwards.com/inspiration/3d-product-scroll-animation-bunta-beer
- **Прийом:** пляшка/банка як герой, **пришпилена (pin) + скраб на скролі** — обертається/масштабується поки скролиш.
- **Беремо:** pinned «product moment» — секція, де пляшка тримається в центрі, а навколо змінюється текст/сорт (scrub). Замість 3D (parking-lot) — pin + parallax + scrub 2D-зображення.

### R2 — Angle Brewery · product collection horizontal scroll (Awwwards)
https://www.awwwards.com/inspiration/product-collection-horizontal-scroll-angle-brewery
- **Прийом:** колекція продукту **горизонтальним скролом** (вертикальний скрол → горизонтальний пан).
- **Беремо:** 6 сортів як **горизонтальний пан** (pinned wrapper + scrub), кожен сорт — повноекранний слайд-кадр. Дає композиційну різноманітність (не сітка).

### R3 — Independent Brewers of Europe · SOTD-honorable (React/Framer)
https://www.awwwards.com/sites/independent-brewers-of-europe
- **Прийом:** scrollytelling — текст і зображення розкриваються синхронно зі скролом, сильний ритм.
- **Беремо:** маніфест-секцію як **kinetic scrollytelling** (рядки виїжджають/маскуються по черзі, SplitText).

### R4 — GRITZ Brewing (All Creative Agency, Awwwards HM)
https://www.awwwards.com/sites/gritz-brewing
- **Прийом:** сильна бренд-типографіка як носій, стримана палітра, великі кадри.
- **Беремо:** тип = герой, гігантський kinetic-заголовок, повітря.

### R5 — Onyx Coffee Lab (SCA Design Award, преміум-напій)
https://onyxcoffeelab.com/
- **Прийом:** editorial-подача продукту, «лабораторний» tone (мета-дані: origin/ABV/process як типографічні мітки), чистий контраст.
- **Беремо:** meta-мітки сортів у **моно-шрифті** (ABV/стиль/обсяг як технічні дані), editorial-стриманість.

## Синтез — що будуємо
- **Характер:** cinematic-dark editorial + brutal-giant-type (ЧБ). Пляшка чорна = сцена темна.
- **Hero:** гігантський **kinetic-тип по центру** (типографіка = герой), пляшка дрібно/позаду, НЕ спліт-колонки.
- **6 сортів:** горизонтальний пан (R2) з pinned product-moment (R1).
- **Маніфест:** kinetic scrollytelling (R3), рядки маскуються.
- **Meta сортів:** моно-мітки (R5).
- **Типографіка (індустрія):** ~80% award-напоїв = heavy display + clean sans. Наш вибір нижче в DESIGN.md.
- **Моушн:** GSAP ScrollTrigger + Lenis; pin/scrub/horizontal-pan/kinetic-type/parallax + magnetic CTA. Не блановий fade.
- **Дрібниці:** кастомний курсор (магнітиться до CTA) + прелоадер/інтро.

## Джерела (лінки)
- Awwwards Food & Drink: https://www.awwwards.com/websites/food-drink/
- Awwwards «17 websites dedicated to drinks»: https://www.awwwards.com/17-websites-dedicated-to-drinks.html
- Bunta Beer, Angle Brewery, Independent Brewers of Europe, GRITZ Brewing (лінки вище), Onyx Coffee Lab.
