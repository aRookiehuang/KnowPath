# Design System Strategy: The Academic Architect

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Academic Architect."** 

We are moving away from the "app-like" bubble aesthetics of modern tech and toward a sophisticated, laboratory-grade "Thinking Workbench." The goal is to provide university students with a digital environment that feels as structured as a blueprint and as focused as a high-end research library. 

This design system rejects the "card-container" trend. Instead of boxing content into shadows, we use a rigid, intentional grid and high-contrast typography to define space. We prioritize **Asymmetric Rationalism**: using the grid to create unexpected but mathematically sound layouts that lead the eye through complex information without visual clutter.

---

## 2. Colors & Surface Logic
The palette is rooted in "Bright Neutrals" to maintain a high-energy, academic atmosphere, anchored by a singular, authoritative accent.

### Color Tokens
*   **Primary (Intelligence Blue):** `#2c5ea7` — To be used surgically for focus and calls to action.
*   **Background:** `#f5f7f9` — The "Canvas."
*   **On-Surface (Charcoal):** `#2c3437` — For high-contrast, editorial readability.

### The "No-Line" Rule for Containment
Standard 1px borders are prohibited for defining sections. Instead, boundaries are created through **Tonal Transitions**. 
*   Use `surface-container-low` against the main `background` to define a side-rail.
*   Use `surface-container-lowest` (`#ffffff`) to make a primary work area "pop" forward.
*   **Surgical Lines:** Thin lines (0.5px to 1px) using `outline-variant` at 20% opacity are permitted *only* as grid-axis markers or to separate distinct data streams, never to "box in" a component.

### Surface Hierarchy & Nesting
Think of the UI as layers of fine architectural paper. 
1.  **Level 0 (Base):** `surface` (`#f5f7f9`)
2.  **Level 1 (Sub-section):** `surface-container-low`
3.  **Level 2 (Active Component):** `surface-container-lowest` (`#ffffff`)

### The Glass & Gradient Rule
To prevent the "flat template" look, floating elements (modals, hovering tooltips) should utilize **Glassmorphism**. Apply `surface-container-lowest` at 80% opacity with a `20px` backdrop blur. 
*   **Signature Polish:** For primary CTA buttons or hero progress indicators, use a subtle linear gradient from `primary` (`#2c5ea7`) to `primary-container` at a 135-degree angle. This adds a "lithographic" depth that feels premium and intentional.

---

## 3. Typography
Typography is our primary tool for hierarchy. We use a "High-Contrast Scale" to ensure the interface feels like a premium journal.

*   **Display & Headlines:** **Space Grotesk.** This is our "Rationalist" face. It feels technical, futuristic, and precise. 
*   **Title & Body:** **Inter.** This is our "Workhorse." It provides maximum legibility for dense academic content.
*   **Label & Interface:** **Inter.** Used for functional UI elements to maintain clarity.
*   **Hierarchy Note:** Always maintain a minimum 2-step jump in the type scale between a header and its sub-text to ensure an editorial, "high-end" look.

---

## 4. Elevation & Depth
In this system, we do not use shadows to show "height." We use **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." A white card (`surface-container-lowest`) placed on a light grey background creates a natural, soft lift.
*   **Ambient Shadows:** If a floating element (like a global search bar) requires a shadow, use a "Tinted Ambient" style: 
    *   `box-shadow: 0 20px 40px rgba(44, 94, 167, 0.06);` (Using the Primary Blue tint instead of grey).
*   **The Ghost Border:** For input fields or interactive zones, use a "Ghost Border" of `outline-variant` at 15% opacity. It should be barely visible, felt rather than seen.

---

## 5. Components

### Density & Spacing
The system utilizes **Compact Spacing** to maximize information density for academic workflows. Layouts should feel efficient and structured, avoiding excessive gaps while maintaining the underlying grid.

### The Cognitive Workbench (Conversational UI)
Avoid "Chat Bubbles." Instead, treat the AI interaction as a **running log**.
*   **Structure:** A vertical line (1px, `outline-variant`) runs down the left margin. 
*   **AI Responses:** Set on `surface-container-low` with a subtle `0.25rem` (sm) corner radius.
*   **Human Input:** Set in a clean, borderless `surface-container-lowest` area with a `primary` left-accent bar.

### Buttons & Chips
*   **Primary Button:** `primary` background, `on-primary` text. Radius: `0.25rem` (Subtle roundedness). No rounded pills.
*   **Secondary Button:** `surface-container-high` background. No border.
*   **Chips:** Use `surface-container-highest` with `label-md` text. These should be rectangular with subtle rounding to maintain the "Laboratory" aesthetic.

### Data Visualizations & Progress
*   **Linear Indicators:** Progress bars should be ultra-thin (2px or 4px). Use `primary` for the fill and `surface-container-highest` for the track.
*   **Rational Data:** Charts should use `primary`, `tertiary`, and `secondary` tokens. Avoid multi-color rainbows. Stick to a monochromatic blue scale for "Intelligence" data.

### Input Fields
*   **Style:** No 4-sided boxes. Use a background shift to `surface-container-high` with a 2px bottom-border of `primary` only when the field is `:focus`.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use intentional whitespace. While compact, ensure elements have room to breathe on the grid.
*   **Do** align all text to a strict 8px baseline grid.
*   **Do** use "Intelligence Blue" (`#2c5ea7`) as a beacon for the user's next step.
*   **Do** use asymmetrical layouts (e.g., a wide left column for content and a narrow, high-contrast right column for metadata).

### Don't:
*   **Don't** use standard "Drop Shadows." They feel "consumer-grade" and "cheap."
*   **Don't** use "Pill" shapes for buttons. Keep them architectural (Subtle 0.25rem radius).
*   **Don't** use 100% black text. Use `on-surface` (`#2c3437`) for a softer, premium ink-on-paper feel.
*   **Don't** use cards-inside-cards. Use background color shifts to indicate nesting.

---

*Director's Note: This design system is about restraint. Let the typography do the heavy lifting. Every line and color shift must have a functional reason for existing.*