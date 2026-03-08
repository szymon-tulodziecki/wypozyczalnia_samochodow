# Wypożyczalnia Samochodów 🚗

Nowoczesna, responsywna aplikacja webowa do wynajmu samochodów z zaawansowanym interfejsem użytkownika i płynną animacją.

**Live Demo:** [https://wypozyczalniasamochodow.vercel.app/](https://wypozyczalniasamochodow.vercel.app/)

## Technologia

- **Framework:** [Next.js 15](https://nextjs.org) — React framework z App Router
- **Język:** TypeScript — dla bezpieczeństwa typów
- **Styling:** CSS-in-JS — animacje, gradient, efekty hover
- **Hosting:** [Vercel](https://vercel.com) — zero-config deployment
- **Czcionki:** Google Fonts (Bebas Neue, Barlow Condensed, Barlow)

## Struktura Projektu

```
app/
├── page.tsx                 # Strona główna (Home)
├── layout.tsx               # Layout z Header i Footer
├── globals.css              # Globalne style
├── components/
│   ├── Header.tsx           # Nawigacja
│   ├── Footer.tsx           # Stopka
│   └── main_page/
│       ├── Hero.tsx         # Hero section z samochodem
│       ├── Features.tsx     # Karta USP (Unique Selling Points)
│       └── CTA.tsx          # Call-to-Action section
└── public/
    └── car.png              # Grafika samochodu
```

## Cechy

✨ **Nowoczesny Design**
- Ciemny motyw z gradiami niebiesko-zielonymi
- Płynne animacje wejścia (fade-up, fade-right)
- Responsywny układ (mobile, tablet, desktop)
- Efekty hover na przyciski i karty

🎨 **Komponenty**
- **Header** — fixed navigation z responsywnym menu mobilne
- **Hero** — fullscreen section z tekstem i obrazem samochodu (3D perspective)
- **Features** — 3 karty z wartościami (szeroki wybór, przejrzyste ceny, szybka rezerwacja)
- **CTA** — sekcja zachęcająca do rezerwacji
- **Footer** — grid layout z linkami i social media

📱 **Responsywność**
- Mobile-first design
- Breakpoints: 540px, 900px
- Skalowalne tytuły clamp()

## Getting Started

### Wymagania

- Node.js 18+
- npm lub yarn

### Instalacja

```bash
git clone <repo-url>
cd wypozyczalnia_samochodow
npm install
```

### Uruchamianie

Serwer deweloperski:

```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

### Build

```bash
npm run build
npm start
```

## Wdrożenie

### Na Vercel (rekomendowane)

1. Push kod na GitHub
2. Połącz repozytorium z Vercel
3. Wdrażanie następuje automatycznie przy każdym push do `main`

**Aktualny deployment:** [https://wypozyczalniasamochodow.vercel.app/](https://wypozyczalniasamochodow.vercel.app/)

## Animacje

- **Fade Up** — tekst i komponenty wjeżdżają od dołu
- **Fade Right** — nagłówki wslizgują się z lewej
- **Car Slide In** — samochód wjeżdża z perspektywą 3D
- **Hover Effects** — przyciski i karty reagują na najechanie

## Color Palette

```
--blue:        #2e7ab5
--blue-light:  #4fa3d4
--green:       #6dbf45
--green-dark:  #4e9930
--bg-dark:     #08090b
--surface:     rgba(14, 18, 24, 0.92)
```

## Dokumentacja

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
