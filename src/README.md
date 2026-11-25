# Frontend — the part people see

The frontend is the website's screen: pages, menus, buttons, maps, tables and forms.

## How it is made

The active website uses React, TypeScript and Vite.

- **React** builds the screen from reusable pieces.
- **TypeScript** helps catch coding mistakes.
- **Vite** runs the website during development and builds the files for deployment.
- **CSS** controls colours, spacing, layout and mobile appearance.

## What is inside this folder?

| Path | Simple meaning |
|---|---|
| `main.tsx` | Starts the website. |
| `App.tsx` | Main app: pages, navigation and shared screen behaviour. |
| `components/` | Reusable screen pieces, such as the header, navigation and map. |
| `features/` | Separate website sections, such as documents, programmes, history, sources and timeline. |
| `services/` | Helpers that talk to the backend and read API responses. |
| `styles.css` | Website design and layout. |

## How does it work?

1. The browser opens `index.html`.
2. `main.tsx` starts React.
3. React displays `App.tsx` and the selected feature.
4. A service in `services/` requests information from the backend.
5. The page displays the returned information.

**Important:** this root `src/` folder is the active website frontend. The separate `frontend/` folder contains a Next.js migration version. Do not move or replace either one without checking the roadmap and deployment setup.
