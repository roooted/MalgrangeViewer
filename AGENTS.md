# AGENTS.md

## Source of truth
- Main requirements: `README_TZ.md`
- Visual references: `graph_ui_before_calc.svg`, `graph_ui_after_calc.svg`

## Mandatory rules
- Do not add features that are not in `README_TZ.md`
- The graph is directed
- Use the standard Malgrange algorithm only
- Keep algorithm logic separate from UI
- Keep graph and adjacency matrix synchronized both ways
- UI language must be English
- Code comments must be in Russian
- Use React + Vite + TypeScript + React Flow
- Do not add backend, database, auth, file import/export, debug panels, or step-by-step algorithm playback

## Working style
- Read `README_TZ.md` before making changes
- Follow the SVG mockups for interaction states and color meaning
- Prefer small, focused changes
- Keep files modular and readable
- Do not concentrate logic in one file