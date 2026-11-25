# Frontend — the website people use

## 1. What is the frontend?

The frontend is the part of Raksha Atlas that appears in the browser. It contains the pages, navigation, buttons, search fields, tables, maps and other things a visitor can see and use.

The active frontend is this root `src/` folder. It uses:

- **React** to build the screen from reusable components.
- **TypeScript** to describe data shapes and catch many coding mistakes before the website runs.
- **Vite** to start the local development website and build the production files.
- **CSS** to control colours, spacing, layout and responsive behaviour.

The separate `frontend/` folder contains a Next.js migration version. It is not the active default frontend.

## 2. How a page appears

The basic startup path is:

1. The browser opens the root `index.html` file.
2. `src/main.tsx` starts the React application.
3. `src/App.tsx` builds the main application and navigation.
4. The selected feature or reusable component draws the requested screen.
5. When the screen needs data, a service from `src/services/` calls the API.
6. The API response is checked and passed to the screen.
7. React updates the page with the returned data.

The frontend should ask the backend for data. It should not directly open the backend's JSON files or connect to the database.

## 3. Folder and file guide

| Path | Responsibility |
|---|---|
| `main.tsx` | Browser entry point. Mounts the React application. |
| `App.tsx` | Main application shell, page selection and shared UI behaviour. |
| `components/` | Reusable visual pieces shared by multiple screens, such as navigation, headers, dialogs and timeline panels. |
| `features/` | Code grouped by website feature, so each section can be understood and changed separately. |
| `services/` | API clients and response helpers. These connect the UI to backend endpoints. |
| `styles.css` | Shared visual styles, layout, colours and responsive rules. |

### Components versus features

A **component** is a reusable piece of the screen. For example, a header or accessible dialog can be used in more than one place.

A **feature** is a complete area of the product. It may contain its own screen, smaller components, types and helper functions. Examples include documents, history, programmes, sources and timeline.

Keep feature-specific code inside its feature folder when possible. Put code in `components/` when it is genuinely shared.

## 4. How the frontend talks to the backend

A normal data request follows this path:

```text
Visitor clicks or opens a page
          |
          v
React feature / component
          |
          v
src/services/ API helper
          |
          v
/api/... HTTP request
          |
          v
Vercel adapter or local API proxy
          |
          v
server/ Node.js API
          |
          v
JSON response
          |
          v
React updates the screen
```

The exact API endpoint and response shape are defined by the backend. If an API response changes, update the service helper, the UI that uses it and the related tests together.

## 5. How to run the frontend

From the repository root:

```powershell
npm install
npm run dev
```

Open the local Vite URL printed in the terminal, normally http://localhost:5173.

This command starts the frontend only. For the normal full local experience, start both frontend and backend with:

```powershell
npm run dev:full
```

## 6. How to build and check it

From the root:

```powershell
npm run build
npm test
```

The build runs the TypeScript project build and Vite production build. The test command runs the repository's Node test suite; it does not automatically mean every browser interaction has been tested.

When changing a feature, also manually open the relevant page and check loading, empty, error and success states.

## 7. Safe frontend change checklist

Before changing a screen:

1. Find the feature folder and read its current code.
2. Find the API helper it uses in `services/`.
3. Check the backend response shape before changing field names.
4. Reuse existing components and styles.
5. Keep keyboard access, readable labels and mobile layout.
6. Add or update tests for changed behaviour.
7. Run `npm run build` and `npm test`.
8. Open the affected screen locally and check it with real project data.

## 8. What not to do

- Do not read `server/*.json` directly from browser code.
- Do not put API keys, database passwords or private tokens in frontend files.
- Do not create a second copy of a feature in the Next.js scaffold just to make the two frontends look similar.
- Do not rename `src/`, `main.tsx`, `App.tsx` or build entry files without checking Vite, TypeScript and deployment configuration.
- Do not treat a successful TypeScript build as proof that every API or page works.

## 9. Current status

This folder is the active React + TypeScript + Vite frontend. The Next.js application in `frontend/` is a migration scaffold. Any migration must preserve feature behaviour, API contracts, accessibility and rollback capability before it replaces this frontend.