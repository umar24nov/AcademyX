---
name: Terminal Onyx
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#c8c5ca'
  on-secondary: '#303033'
  secondary-container: '#47464a'
  on-secondary-container: '#b6b4b8'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e4e1e6'
  secondary-fixed-dim: '#c8c5ca'
  on-secondary-fixed: '#1b1b1e'
  on-secondary-fixed-variant: '#47464a'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  border-subtle: '#27272a'
  text-heading: '#fafafa'
  text-muted: '#a1a1aa'
  success-green: '#37cd8f'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1280px
---

## Brand & Style
The design system is built for a developer-centric audience that values precision, speed, and a high-end aesthetic. It draws inspiration from modern deployment and communication platforms, utilizing a **Minimalist / Modern** style with heavy influences from the "Dark Mode" SaaS movement.

The brand personality is authoritative yet unobtrusive—functioning like a high-performance IDE. The interface prioritizes content clarity through high-density layouts, subtle monochromatic layering, and a single, vibrant indigo accent to guide the eye toward primary actions. The emotional response should be one of "expensive" reliability and technical sophistication.

## Colors
This design system utilizes a "Deep Dark" palette to minimize eye strain and maximize the vibrancy of the primary indigo accent.

- **Surfaces:** The base foundation uses `#09090b`. Elevated containers (cards, sidebars, modals) use `#18181b`.
- **Accents:** `#6366f1` (AcademyX Indigo) is used sparingly for primary buttons, active states, and focus indicators.
- **Typography:** Headlines are crisp and high-contrast (`#fafafa`), while body text and descriptions are stepped down to `#a1a1aa` to create a clear visual hierarchy.
- **Borders:** All structural divisions use a low-contrast `#27272a` to maintain a seamless, integrated look.

## Typography
The system uses **Inter** for all primary UI elements to ensure maximum legibility and a neutral, professional tone. A tight letter-spacing (tracking) is applied to headings to achieve a more "compacted" and editorial look characteristic of modern SaaS tools.

For technical data, code snippets, or status badges, **JetBrains Mono** is introduced to provide a functional, developer-friendly contrast to the sans-serif body text.

## Layout & Spacing
The layout follows a **High-Density Fluid Grid** model. 

- **Grid:** A 12-column system is used for desktop with 16px gutters.
- **Density:** Spacing is tight to allow for information-rich dashboards. Use 4px increments for internal component padding and 16px/24px for section blocks.
- **Responsive:** On mobile, margins reduce to 16px and the layout collapses to a single column. Elements should favor vertical stacking while maintaining the 16px gutter for internal card padding.

## Elevation & Depth
Depth is created through **Tonal Layering** rather than traditional shadows. 

- **Level 0 (Background):** `#09090b` - The global canvas.
- **Level 1 (Default Surface):** `#18181b` with a 1px border of `#27272a`.
- **Level 2 (Hover/Active):** Surfaces slightly lighten or gain a subtle indigo outer "glow" (0px 0px 8px rgba(99, 102, 241, 0.15)) to indicate focus.
- **Transitions:** Use 150ms ease-out transitions for all hover and focus states to ensure the UI feels responsive and smooth.

## Shapes
The design system uses a consistent **Rounded** language. Standard components like cards and input fields utilize a 0.5rem (8px) radius, while larger containers or primary "hero" sections can scale up to 1rem (16px) to soften the technical aesthetic. Buttons should remain consistent with the component-level radius for a unified look.

## Components
- **Buttons:** Primary buttons use a solid `#6366f1` background with `#fafafa` text. Secondary buttons use the `#18181b` surface with a `#27272a` border.
- **Inputs:** Fields are dark (`#09090b`) with a 1px `#27272a` border. On focus, the border transitions to indigo with a subtle 2px glow.
- **Cards:** No background gradients. Use flat `#18181b` with a clear 1px border. 
- **Chips/Badges:** Use JetBrains Mono text. Success states use a muted green border and text; neutral states use the standard border color.
- **Lists:** Use subtle dividers (`1px solid #27272a`). Rows should have a subtle background shift to `#1f1f23` on hover.
- **Code Blocks:** Use a slightly darker background than the card surface to differentiate "output" from "interface."