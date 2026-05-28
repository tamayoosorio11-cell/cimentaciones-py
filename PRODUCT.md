# Product

## Register

product

## Users

Civil engineering students and practitioners at Universidad de Ibagué working on foundation analysis. Primary user is a student running a geotechnical verification: they have soil boring logs, column loads, and need to confirm bearing capacity and settlement meet NSR-10. Secondary user is a professional verifying or designing shallow/deep foundations. Context: desktop browser, seated at a desk, mid-task, focused on getting numbers right.

## Product Purpose

STRATEX is a geotechnical analysis tool covering the full shallow-foundation workflow: soil profile input, effective stress calculation, Meyerhof bearing capacity (9 correction factors, 3 water table cases), Boussinesq stress distribution, Schmertmann-Hartman granular settlement, Timoshenko-Janbu immediate settlement, Terzaghi consolidation (NC/OC), differential settlement and NSR-10 angular distortion check. Pile verification by Tomlinson alpha and beta methods. Auto-design mode selects foundation type based on soil conditions. All formulas implemented in closed form in JavaScript, no tables or nomographs. Success is a complete calculation memory the engineer can export and defend.

## Brand Personality

Precise, rigorous, confident. The tool earns trust by showing every intermediate step. Engineering authority without institutional coldness.

## Anti-references

- Generic SaaS landing pages (cream backgrounds, purple-to-blue gradients, floating orbs)
- Corporate engineering blue (SAP, Autodesk blue-on-grey)
- Dashboard templates with pie charts as decoration
- Any interface where the aesthetic competes with the data

## Design Principles

1. The calculation is the product. Every pixel either shows data or makes data easier to read. Decoration competes.
2. Show the work. Intermediate values, formula references, and step-by-step breakdowns are features, not clutter.
3. Engineer-grade density. Tables with 8+ columns, small labels, monospaced numbers are correct here. Airiness wastes screen real estate engineers need.
4. State is always visible. FS passing/failing, settlement within/exceeding limits, module complete/incomplete — the UI communicates status without the user hunting for it.
5. Earn the dark mode. The sidebar is dark because engineers work at night and the contrast between dark nav and light content helps module navigation. Not for aesthetics.

## Accessibility & Inclusion

WCAG AA minimum. Focus visible on all interactive elements. Color never the sole indicator of state (pair with icons/text). Respect prefers-reduced-motion.
