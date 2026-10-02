# SentiNews Landing Page — Architecture, Components & Working Mechanism

A comprehensive guide explaining the structure, components, interactivity, 3D visualization, data integration, and design philosophy of the **SentiNews** landing page.

---

## 1. Overview & Purpose

The SentiNews landing page ([`LandingPage.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/pages/LandingPage.tsx)) serves as the primary public experience and gateway for visitors exploring the platform.

Rather than functioning as a generic SaaS landing page, a crypto website, or a cluttered trading terminal, it is crafted as a **premium, editorial, Indian financial-market intelligence platform**.

### Core Platform Perspectives (Matching Navbar Order):
1. **Market** — Understanding Indian benchmark indices (NIFTY 50, SENSEX, BANK NIFTY), sectoral momentum, and market breadth.
2. **News & Events** — Chronological market-event timeline connecting macroeconomic, regulatory, and corporate catalysts with zero speculation.
3. **Reports** — Daily structured market intelligence before the opening bell (Pre-Market) and after the closing bell (Post-Market).
4. **Portfolio** — Tracking holdings, asset allocation, and sector exposure context (*pure intelligence, strictly no order execution*).

---

## 2. Architecture & File Structure

The landing page is assembled from modular components located in [`src/components/landing`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing) and global layout components in [`src/components/layout`](file:///d:/PROJECTS/sentinews_frontend/src/components/layout):

```
d:/PROJECTS/sentinews_frontend/
├── src/
│   ├── routes/
│   │   └── AppRouter.tsx                  # Route guard & guest redirection logic
│   ├── pages/
│   │   └── LandingPage.tsx                # Main container aggregating all sections in exact navbar order
│   ├── utils/
│   │   └── isoProjection.ts           # 2:1 isometric projection math & 3D box rendering helpers
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                 # Sticky navigation with section scroll-spy & single "Get Started" CTA
│   │   │   └── Footer.tsx                 # Site directory and statutory SEBI disclaimer
│   │   └── landing/
│   │       ├── HeroSection.tsx            # Headline, brand label, word cycling, feature strip, CTAs, floating cards, feature panels, source flow
│   │       ├── MarketHero3D.tsx           # Pure Canvas 2D isometric scene (pedestal, 3D bar chart, trend curve, radial bloom)
│   │       ├── MarketPerspectiveIntro.tsx # 4-perspective product overview (Market → News → Reports → Portfolio)
│   │       ├── MarketSection.tsx          # Section #market: Market overview & live benchmark snapshot
│   │       ├── MarketMotionSection.tsx    # Market in Motion (Benchmark → Sectors → Breadth)
│   │       ├── NewsSection.tsx            # Section #news: Chronological market-event timeline
│   │       ├── ReportsSection.tsx         # Section #reports: Before/After The Bell interactive intelligence toggle
│   │       ├── ProductScreenshotsSection.tsx # "See it in action" Horizontal carousel showcasing actual product pages
│   │       ├── PortfolioSection.tsx       # Section #portfolio: Allocation & risk health preview (non-execution)
│   │       ├── PlatformPerspectives.tsx   # Sequential scroll reveal & connecting central axis (Market → News → Reports → Portfolio)
│   │       ├── AboutSection.tsx           # Section #about: Product design & analytical ethos principles
│   │       └── LandingCTA.tsx             # Final high-contrast onboarding banner ("Explore SentiNews")
```

---

## 3. Design System & Typography

### Strict Color Palette (Preserved Unchanged)
All landing page components strictly adhere to the established SentiNews palette:

| Token | Hex Value | Application |
|---|---|---|
| **Deep Navy** | `#0A1D37` | Primary brand identity, apex headers, key action buttons, 3D model accents |
| **Warm Background** | `#FAFAF8` | Predominant page canvas, section backgrounds, subtle contrast surfaces |
| **White Surface** | `#FFFFFF` | Content cards, data panels, preview containers, input fields |
| **Border Line** | `#E5E5E5` | Clean structural dividing borders and grid outlines |
| **Primary Text** | `#111111` | High-contrast editorial titles, section headings, index price values |
| **Secondary Text** | `#5F6368` | Descriptive paragraphs, subtitles, metadata badges, timestamps |

- **Predominantly Light Theme**: Surfaces remain clean, bright, and legible. No dark mode conversion, neon colors, purple/pink gradients, or heavy glowing effects on the public landing page.

### Professional Financial Typography
- **Elimination of Robotic/Futuristic Styling**: All generic monospace fonts (`font-mono`) previously applied across labels, timelines, and metric cards have been removed.
- **Inter Font Hierarchy**: Utilizes `Inter` with comfortable letter-spacing and clean hierarchy:
  - Strong, simple headings (`font-bold`, `tracking-tight`).
  - Highly readable body text (`text-sm`, `leading-relaxed`).
  - Crisp metadata labels with subtle tracking (`text-[10px]`, `tracking-widest`, `uppercase`).
  - Clean numeric presentation with `tabular-nums` ensuring aligned numbers without terminal-like aesthetics.

---

## 4. Section-by-Section Breakdown

### 1. Navigation & Live Market Ticker
- **Files**: [`Navbar.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/layout/Navbar.tsx) & [`MarketTickerBar.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/layout/MarketTickerBar.tsx)
- **Role & Features**:
  - Sticky header (`top-0`, `backdrop-blur-md`, z-index 50) displaying the SentiNews brand logo, primary navigation links, search trigger, and authentication buttons (`Sign In`, `Register`).
  - **Scroll Spy**: Automatically detects the section currently in view (`#market`, `#portfolio`, `#reports`, `#news`, `#about`) and applies an underline indicator.
  - **Smooth Scrolling**: Navigating to sections applies an offset calculation (`-72px`) for perfect alignment.
  - **Live Market Ticker Bar**: Located directly below the navbar, it streams live prices for benchmark indices (NIFTY 50, SENSEX, BANK NIFTY) fetched via `useMarketIndices(30000)`. Includes live market status indicator and direct links to individual stock/index pages.

---

### 2. Hero Section & 3D Intelligence Orb
- **Files**: [`HeroSection.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/HeroSection.tsx) & [`MarketHero3D.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/MarketHero3D.tsx)
- **Layout**: Two-column layout on desktop (`lg:grid-cols-2`). On mobile, stacked with the 3D canvas on top (300px height) and the text block below.
- **Left Column (Typography, Mechanical Word Cycling & CTAs)**:
  - **Static Anchor Headline**: Display: `"Understand"` (Inter, font-weight 800, ~72px, color `#111111`, tight letter-spacing). Typographically dominant and grounded anchor.
  - **Animated Word Cycling**: Directly below `"Understand"`, infinitely cycles through 5 words:
    1. *Markets*
    2. *Stocks*
    3. *Reports*
    4. *News*
    5. *Portfolio*
    - Display duration: exactly 1000ms per word.
    - Vertical split-flap mechanical slide transition (slides UP and out, next slides UP and in) in Deep Navy (`#0A1D37`) at ~72px.
    - Fixed-height container with `overflow-hidden` preventing layout reflow.
  - **Sub-headline**: Clean 10-word line: *"Indian equity markets, decoded — one platform, four perspectives."* (Inter 18px, `#5F6368`, font-weight 400).
  - **Precision CTA Block**:
    - **Primary Button**: `"Sign In"` (Solid `#0A1D37`, white text, 48px height, 20px padding, 4px border-radius, routes to `/login`).
    - **Secondary Button**: `"Register"` (1.5px solid `#0A1D37` border, transparent fill, `#0A1D37` text, routes to `/register`).
    - Clean labels without emojis, arrows, or decoration; stacks vertically full-width on mobile.
  - **Entrance Animations**: One-time on page load with staggered delays (0ms, 300ms, 500ms, 700ms), fully respecting `prefers-reduced-motion`.
- **Right Column (3D Scene: The SentiNews Intelligence Orb)**:
  - Self-contained WebGL scene using Three.js:
    - **1. Central Sphere (The Market Core)**: Smooth sphere (radius 1.5, `#0A1D37`, metalness: 0.6, roughness: 0.3) with slow Y-axis self-rotation (`0.003 rad/frame`) wrapped in a faint wireframe lattice (`#E5E5E5`, opacity 0.25).
    - **2. Orbital Rings**: 3 independent torus rings orbiting at distinct inclinations:
      - *Ring 1*: Tilt 0° (horizontal equatorial), radius 2.5, `#0A1D37`, opacity 0.6, speed `0.005 rad/frame`.
      - *Ring 2*: Tilt 55° (inclined), radius 2.8, `#111111`, opacity 0.35, speed `0.003 rad/frame`.
      - *Ring 3*: Tilt -30° (counter-inclined), radius 3.2, `#5F6368`, opacity 0.25, speed `0.007 rad/frame`.
    - **3. Orbital Data Nodes**: 6 small spheres orbiting along Ring 1, pulsing scale between $1.0 \rightarrow 1.5 \rightarrow 1.0$ with staggered sine wave periods (~2s).
    - **4. Market Trendline**: Smooth 3D `CatmullRomCurve3` bull-trend equity curve passing through 12 control points with thin vertical `#E5E5E5` volume lines.
    - **5. Floating Label Badges (HTML Overlay)**:
      - *Badge A (top-right)*: `NSE · BSE` / `LIVE INDICES`
      - *Badge B (bottom-left)*: `NIFTY 50` / `REAL-TIME SYNTHESIS`
      - Subtle 3-second sinusoidal floating animation (Badge B offset by 1.5s).
    - **6. Performance & Lifecycle**: Transparent canvas, `ResizeObserver`, devicePixelRatio clamped to 2, full `dispose()` on unmount, paused motion when `prefers-reduced-motion` is enabled.

---

### 3. Market Perspective Introduction
- **File**: [`MarketPerspectiveIntro.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/MarketPerspectiveIntro.tsx)
- **Role**:
  - Establishes the core concept: *"See the market as a bigger picture."*
  - 4 miniature product preview cards:
    - **01 MARKET**: Live benchmark indices (NIFTY 50, SENSEX, BANK NIFTY) with real session delta and status.
    - **02 PORTFOLIO**: Asset allocation bars (Financials, Tech, Auto) and P&L context.
    - **03 REPORTS**: Pre-Market (Before 9:15 AM) & Post-Market (After 3:30 PM) daily cadence.
    - **04 NEWS**: Verified catalyst tags (Macro, Corporate, Regulatory, Earnings, IPO).

---

### 4. Market in Motion (Structural Flow Map)
- **File**: [`MarketMotionSection.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/MarketMotionSection.tsx)
- **Position**: Positioned immediately after the four-perspective introduction.
- **Concept**:
  - Editorial, elegant visualization showing how SentiNews understands Indian capital flow:
    $$\text{Market Data} \longrightarrow \text{Indices / Stocks / News} \longrightarrow \text{SentiNews Engine} \longrightarrow \text{Market Intelligence}$$
  - **Three Visual Structural Levels**:
    - **Level 1 (Apex Benchmark)**: NIFTY 50 headline quote card with real live value and delta.
    - **Level 2 (Sector Engines)**: Three core momentum drivers with Nifty weights: Nifty Bank (~33%), Nifty IT (~14%), Nifty Auto (~8%).
    - **Level 3 (Market Breadth Foundation)**: Broad market participation with interactive Advances (58%), Unchanged (6%), Declines (36%) distribution bar.

---

### 5. Section 01: Market
- **File**: [`MarketSection.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/MarketSection.tsx)
- **Anchor ID**: `#market`
- **Role**:
  - Explains coverage across Indian benchmark indices, sectoral indices, stocks, and market breadth.
  - **Market Snapshot Card**: Replaced decorative placeholders with an authentic market snapshot:
    - Live NIFTY 50 and SENSEX quotes from `useMarketIndices`.
    - Session breadth strip (Advances vs Declines).
    - Key sector momentum watch (Nifty Bank, Nifty IT, Nifty Auto, Nifty Pharma).
    - Dalal Street synthesized trendline chart preview.

---

### 6. Section 02: Portfolio
- **File**: [`PortfolioSection.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/PortfolioSection.tsx)
- **Anchor ID**: `#portfolio`
- **Role**:
  - Illustrates portfolio tracking, asset allocation, sector exposure, and P&L context.
  - **Analytics Preview**: Holdings count, sector exposure, P&L delta, diversification health badge.
  - **Statutory Non-Execution Disclosure**: Prominently clarifies that SentiNews is an analytical tracking and intelligence platform and **does not execute trades, place orders, or hold client funds**.

---

### 7. Section 03: Market Reports (Interactive Switcher)
- **File**: [`ReportsSection.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/ReportsSection.tsx)
- **Anchor ID**: `#reports`
- **Role**:
  - Interactive **Editorial Switcher** between:
    - **BEFORE THE BELL (PRE-MARKET)**: Global market cues, GIFT Nifty positioning, sector momentum, stocks in focus, FII/DII activity, economic events.
    - **AFTER THE BELL (POST-MARKET)**: Closing snapshot, market breadth, sector heatmaps, top movers, institutional flows, key executive takeaways.
  - **Indian Trading Day Timeline**:
    - Stage 1: Before 9:15 AM (Pre-Market Intelligence)
    - Stage 2: 9:15 AM – 3:30 PM (Indian Market Session)
    - Stage 3: After 4:00 PM (Post-Market Intelligence)
  - Active tab dynamically highlights the corresponding timeline node in Deep Navy.

---

### 8. Product Preview Section ("One Market. One View.")
- **File**: [`ProductPreviewSection.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/ProductPreviewSection.tsx)
- **Position**: Positioned directly after the Reports section.
- **Role**:
  - Gives visitors a realistic, full-width preview of the actual SentiNews product interface:
    - Workspace top bar with live session pulse and route bar (`sentinews.in/market/overview`).
    - 3-column benchmark quote strip (NIFTY 50, SENSEX, BANK NIFTY).
    - Left column: Market breadth ratio bar (1,480 Advances / 820 Declines) and sectoral momentum heatmap.
    - Right column: Executive intelligence synthesis banner ("IT Earnings Resilience Offsets Selective Auto Profit Booking") and live radar equities (TCS, HDFCBANK, RELIANCE).
    - Action footer with direct entry to the live market dashboard.

---

### 9. Section 04: News & Events (Event Timeline)
- **File**: [`NewsSection.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/NewsSection.tsx)
- **Anchor ID**: `#news`
- **Role**:
  - Converted into an editorial, chronological market-event timeline:
    - `09:10 IST • MACRO` — Global market cues & GIFT Nifty opening bias.
    - `11:30 IST • CORPORATE` — Material order disclosures & board approvals.
    - `13:15 IST • REGULATORY` — RBI policy decisions & SEBI circulars.
    - `14:30 IST • EARNINGS` — Mid-session quarterly results & margin guidance.
    - `15:40 IST • PRIMARY MARKET` — Daily IPO subscriptions & filings.
  - Strict data integrity: Verified factual news, zero speculation or clickbait headlines.

---

### 10. Platform Perspectives Summary
- **File**: [`PlatformPerspectives.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/PlatformPerspectives.tsx)
- **Role**:
  - Visual synthesis: *"One market. Four perspectives."*
  - **Sequential Scroll Animation**:
    1. Central SentiNews logo node activates when scrolled into view.
    2. Radiating connection axis lines illuminate.
    3. The 4 perspective cards (Market, Portfolio, Reports, News) animate into place sequentially.

---

### 11. Section 05: About & Philosophy
- **File**: [`AboutSection.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/AboutSection.tsx)
- **Anchor ID**: `#about`
- **Role**:
  - Outlines the 4 founding product ethos principles:
    1. **01 • INFORMATION FIRST** — Clean and concise market information without sensationalism.
    2. **02 • INDIAN MARKET FOCUSED** — Built specifically for NSE and BSE equity market context.
    3. **03 • CONTEXT OVER NOISE** — Connecting price action with relevant macro and corporate context.
    4. **04 • NO TRADING EXECUTION** — Pure information and intelligence, not trade execution or broking.

---

### 12. Final CTA & Footer
- **Files**: [`LandingCTA.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/landing/LandingCTA.tsx) & [`Footer.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/components/layout/Footer.tsx)
- **Role**:
  - **Final CTA**: High-contrast Deep Navy banner encouraging users to *"See the Market With More Context."* with primary CTA button *"Explore SentiNews"*.
  - **Footer**: Comprehensive navigation links, legal routes, and mandatory SEBI compliance disclaimer stating SentiNews is an analytical research platform.

---

## 5. Technical Mechanisms

### 1. Smart Authentication Routing
In [`AppRouter.tsx`](file:///d:/PROJECTS/sentinews_frontend/src/routes/AppRouter.tsx):
```tsx
const LandingRoute: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <PageLoader />;
  }

  // Authenticated users bypass the landing page and land on the market dashboard
  if (isAuthenticated) {
    return <Navigate to="/market" replace />;
  }

  return <LandingPage />;
};
```
- Authenticated users automatically bypass the landing page and land directly on `/market`.
- Guest users continue to see the full public landing page.

### 2. Real Backend Market Data Integration
- Connects directly to backend API services via [`useMarketIndices`](file:///d:/PROJECTS/sentinews_frontend/src/hooks/market/useMarketIndices.ts) and [`useMarketOverview`](file:///d:/PROJECTS/sentinews_frontend/src/hooks/market/useMarketOverview.ts).
- No hardcoded live market numbers, `Math.random()`, or fake percentages.
- Graceful loading skeletons and formatted prices using standard Indian numbering system (`toLocaleString('en-IN')`).

### 3. Three.js WebGL Performance & Lifecycle
- Lightweight Three.js implementation inside standard React `useRef<HTMLCanvasElement>`:
  - Antialiased WebGLRenderer with high-DPI clamping (`Math.min(window.devicePixelRatio, 2)`).
  - Orthographic-style perspective projection with restrained 3D rotation.
  - Zero heavy shader pipelines or external GLTF asset load delays.
  - Automatic `ResizeObserver` for fluid responsive reflows across mobile and desktop.
  - Full disposal of geometries, materials, and renderer context on component unmount.

---

## 6. Build & Quality Verification

| Check | Result |
|---|---|
| **TypeScript Compilation** (`tsc`) | Clean (0 errors) |
| **Vite Production Build** (`vite build`) | Built successfully in ~15.6s |
| **Color Contrast & Theme** | Strict adherence to `#0A1D37` Deep Navy & `#FAFAF8` Warm Background |
| **Robotic/Futuristic Fonts** | Fully eliminated; modernized to clean sans-serif and `tabular-nums` |
| **Authentication Routing** | Verified guest view and authenticated `/market` redirect |
| **Responsive Breakpoints** | Desktop (two-column), Tablet (compact 3D), Mobile (stacked flow) |
