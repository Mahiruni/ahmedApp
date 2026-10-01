# BILOO interface polish

## Design contract

`src/app/design-system.css` is the final visual authority imported by the root layout. It defines semantic colors, spacing, typography, control dimensions, focus feedback, dialog surfaces, and responsive workspace rules. Feature styles continue to supply their existing layouts and interactions. Use the shared tokens when extending those features rather than adding another global override file.

- Preserve the purple BILOO mark and use purple consistently for primary actions and selected navigation.
- Use neutral backgrounds, quiet borders, restrained shadows, and charcoal surfaces for existing dark panels.
- Use Manrope for body text and Inter Tight for headings, with visible labels and readable secondary text.
- Use 44px primary controls and touch targets, subtle pressed feedback, and visible keyboard focus.
- On desktop, workspaces use the available width with a navigation rail. On smaller screens, the role navigation stays at the bottom and content scrolls above it.
- Honor reduced motion and forced colors. The app currently has no user-selectable dark theme; existing dark sections have their own surface and text tokens.

## Interaction changes

`useDialog` manages menus, drawers, checkout, tracking, and confirmations. It traps focus, makes background content inert, handles Escape for the topmost dialog, locks scrolling while any dialog is open, and restores focus when closing. Keep an overlay wrapper around dialog panels so pointer backdrops remain available.

The homepage now has working mobile navigation. The application has a keyboard skip link. Hidden menus and drawers cannot receive focus. Clearing a search field no longer opens the destructive-action confirmation.

Search inputs retain native placeholders and their existing query behavior. Animated DOM mutation controllers were removed from the root mount to prevent hydration interference. Customer summary values that had no action are presented as information rather than clickable controls. The cart action remains interactive.

Account pages share consistent form controls, Google sign-in buttons, password toggles, and spacing. The signup route's malformed JSX and missing shell mode support were repaired so it builds and renders.

## Preserved behavior

Catalog content, service choices, pricing, fees, cart quantities, demo role switching, checkout rules, order creation, tracking, vendor and driver workflows, auth actions, API handlers, and database code remain in place. No dependencies or backend configuration were changed.

## Verification

- `npm run build`: passed, including route generation and TypeScript compilation.
- `npm run typecheck`: passed.
- `npm run lint`: passed with seven existing warnings and zero errors.
- `git diff --check`: passed.

Chromium verification covered:

| Area | Checks |
| --- | --- |
| Desktop workspaces | Customer, driver, vendor, and admin render without horizontal overflow; customer workspace uses full desktop width |
| Mobile workspaces | Customer at 320px, 390px, and 768px; all five customer services and driver/vendor/admin at 390px |
| Navigation | Bottom role navigation, application menu, notifications, homepage mobile menu, Escape, and focus restoration |
| Dialogs | Background inert state, Tab containment, stacked checkout/cart behavior, Escape, restored focus, and scroll unlock |
| Search | Empty results and clearing without a destructive confirmation |
| Demo checkout | Add item, cart, invalid/valid card state, cash order placement, confirmation, and tracking |
| Account pages | Login on mobile/desktop, password visibility, signup on mobile/desktop, all four steps, back navigation, retained field values, and password matching |
| Public pages | Homepage, about, privacy, terms, and personal information; mobile layout and page loading |
| Auth support pages | Forgot password and check email page loading and mobile layout |

The checked flows produced no browser runtime errors. Live Supabase authentication, live order APIs, external maps, and payment settlement were not exercised with production credentials. The browser checks used the existing demo mode; this does not establish live integration behavior or a complete accessibility certification.
