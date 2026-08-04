---
name: AcademyX Executive
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#464555'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  code:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style
The design system is engineered for high-stakes educational environments where clarity, authority, and precision are paramount. It adopts a **Premium Minimalist** aesthetic, drawing inspiration from industry-leading developer tools and fintech platforms. The visual narrative focuses on "reductive elegance"—removing unnecessary ornamentation to highlight data and educational content. 

The system utilizes high whitespace density to reduce cognitive load for administrators and educators. It avoids trendy effects like glassmorphism or heavy gradients in favor of structural integrity, crisp borders, and deliberate typographic hierarchy. The emotional response is one of institutional stability, professional reliability, and modern sophistication.

## Colors
The palette is rooted in a professional "Enterprise Indigo" and "Charcoal" foundation. 

- **Primary & Neutrals:** Use the Primary Indigo for interactive elements and brand touchpoints. Secondary Charcoal is reserved for high-level navigation and primary headings.
- **Surface Strategy:** Employs a tiered grayscale. `Background Main` is pure white for content areas, while `Background Subtle` is used for sidebars, headers, and empty states to create structural contrast.
- **Dark Mode:** Transition to a "Deep Slate" ecosystem. Avoid pure black (#000) for backgrounds to prevent high-contrast eye strain; instead, use #0B0F1A as the base layer with slightly lighter overlays for cards and modals.
- **Semantics:** Use standard professional tones. Success, Warning, and Error colors are desaturated slightly to maintain the premium feel without appearing "neon" or distracting.

## Typography
This design system utilizes **Inter** for all UI and editorial content to ensure maximum legibility across dense data views. 

- **Hierarchy:** Strict adherence to font-weight stepping. Use `600` (Semi-bold) for headings to provide a strong anchor point.
- **Leading:** Generous line-height is applied to `body-lg` (1.5x) to facilitate reading of long-form educational material.
- **Tracking:** Negative letter-spacing is applied to larger display types to keep the "premium" tight look characteristic of modern SaaS.
- **Mono-spacing:** Use **JetBrains Mono** specifically for student IDs, transaction codes, and technical logs to differentiate them from standard prose.

## Layout & Spacing
The layout follows a **Fluid-Fixed Hybrid** model. The main navigation remains fixed (either top or side), while the content area uses a fluid 12-column grid that caps at a maximum width of 1440px to prevent excessive line lengths on ultra-wide monitors.

- **Rhythm:** A 4px baseline grid governs all spatial relationships. 
- **Density:** High whitespace is the default. Information-dense views (like the Gradebook) can toggle to a "Compact" mode where internal paddings are reduced by 50%.
- **Breakpoints:**
  - Mobile (< 768px): 4 columns, 16px margins.
  - Tablet (768px - 1024px): 8 columns, 24px margins.
  - Desktop (> 1024px): 12 columns, 32px margins.

## Elevation & Depth
This design system utilizes a "Tonal Stacking" approach rather than heavy physical metaphors. Depth is communicated through subtle border-bottoms on headers and soft, multi-layered ambient shadows.

- **Surface 0 (Base):** #FFFFFF. The canvas.
- **Surface 1 (Floating Cards):** Uses a very soft shadow (0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)).
- **Surface 2 (Modals/Dropdowns):** Higher elevation. Uses a diffused shadow (0px 10px 15px -3px rgba(0,0,0,0.1)) to indicate focus.
- **Outlines:** All containers use a 1px solid border (#E5E7EB) to define boundaries clearly, even when shadows are present.

## Shapes
The shape language is "Approachable Executive." Corners are rounded enough to feel modern and friendly but remain structured.

- **Standard Elements:** Buttons, inputs, and small cards use `0.5rem` (8px).
- **Large Containers:** Content cards, modals, and primary layout wrappers use `rounded-lg` (1rem / 16px).
- **Interactive States:** Hovering over list items or menu entries should show a ghost-background with `0.25rem` (4px) roundedness for a subtle hint of interactivity.

## Components

### Buttons
- **Primary:** Solid Indigo (#4F46E5) with white text. No gradient.
- **Secondary:** White background, #E5E7EB border, #111827 text. Subtle shadow on hover.
- **Ghost:** No border or background. Indigo text for actions, Charcoal for navigation.

### Cards
- Always use a 1px border.
- Internal padding should default to `lg` (24px).
- Title areas should be separated by a subtle horizontal rule or a distinct header background (#F9FAFB).

### Tables (TanStack Style)
- **Header:** #F9FAFB background, 12px font-size, uppercase, 600 weight.
- **Rows:** 1px border-bottom. No vertical borders between columns.
- **Hover:** Row highlight uses #F9FAFB.

### Charts (Recharts Style)
- **Palette:** Use the Primary Indigo as the main data point. Secondary data uses soft slates, teals, and ambers.
- **Grid Lines:** Stroke #F3F4F6, dashed.
- **Tooltip:** High-elevation card (Surface 2) with a 1px border.

### Badges / Chips
- **Status:** Light background tint of the semantic color (e.g., Success is #ECFDF5 background with #065F46 text).
- **Shape:** Rounded-full (pill) for status, `rounded-md` for categories.

### Inputs & Fields
- 1px border. Focused state uses a 2px Indigo ring with a 2px white offset (outline-offset).
- Labels are always positioned above the input in `label-md` style.