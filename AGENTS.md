# AGENTS.md

## Scope

- This repository is `LMOT`, an Electron + React + TypeScript OCR translation desktop app.
- The codebase is split across `src/main`, `src/preload`, `src/renderer/src`, and `src/shared`.
- `src/main` owns Electron app lifecycle, windows, IPC handlers, and LLM integrations.
- `src/preload` exposes the safe renderer API through `contextBridge`.
- `src/renderer/src` contains the React UI, Zustand stores, hooks, and i18n setup.
- `src/shared/types.ts` is the shared contract layer between processes.
- There is no existing `AGENTS.md` in this repository before this file.

## Repository-Specific Agent Rules

- No `.cursorrules` file is present.
- No files exist under `.cursor/rules/`.
- No `.github/copilot-instructions.md` file is present.
- Do not assume hidden Cursor or Copilot instructions exist elsewhere in the repo.

## Package Manager And Tooling

- The repo contains `bun.lock`, and `README.md` uses Bun in examples.
- `package.json` defines normal package scripts, so `bun run <script>` is the preferred form.
- Equivalent `npm run <script>` commands should also work if Bun is unavailable.
- Core tooling: Electron, electron-vite, React 19, TypeScript 5, ESLint 9, Prettier 3.
- UI stack: Tailwind CSS v4, Radix UI, shadcn-style generated components, Lucide icons.
- State and validation: Zustand and Zod.

## Build, Lint, Typecheck, And Run Commands

- Install dependencies: `bun install`
- Alternative install: `npm install`
- Start local dev app: `bun run dev`
- Preview/start built app: `bun run start`
- Format the repo: `bun run format`
- Lint the repo: `bun run lint`
- Typecheck everything: `bun run typecheck`
- Typecheck main/preload/shared only: `bun run typecheck:node`
- Typecheck renderer/shared only: `bun run typecheck:web`
- Production build: `bun run build`
- Build unpacked app bundle: `bun run build:unpack`
- Build Windows package: `bun run build:win`
- Build macOS package: `bun run build:mac`
- Build Linux package: `bun run build:linux`
- Postinstall hook: `electron-builder install-app-deps`

## Tests And Single-Test Execution

- There is currently no configured test runner in `package.json`.
- No `test` script exists.
- No `*.test.*` or `*.spec.*` files are currently present.
- No Vitest, Jest, Playwright, Cypress, Mocha, or Ava usage was found in the repo.
- That means there is currently no repository-native command for running all tests.
- That also means there is currently no repository-native command for running a single test.
- Do not claim tests passed unless you first add a test framework and run it.
- If your task requires verification today, use lint + typecheck + build instead.
- Best whole-repo verification command sequence: `bun run lint && bun run typecheck && bun run build`
- For renderer-only changes, a lighter check is: `bun run lint && bun run typecheck:web`
- For main/preload changes, a lighter check is: `bun run lint && bun run typecheck:node`
- If you introduce tests, also add and document a true single-test command here.

## High-Level Architecture

- `src/main/index.ts` initializes the app, registers IPC handlers, creates windows, and registers shortcuts.
- `src/main/windows/*` contains BrowserWindow creation and window lifecycle helpers.
- `src/main/ipc/*` contains IPC handler registration by feature area.
- `src/main/services/*` holds orchestration logic such as translation and settings persistence.
- `src/main/llm/*` isolates provider-specific translation logic and prompts.
- `src/preload/index.ts` defines the renderer-safe API surface and event wiring.
- `src/preload/index.d.ts` declares the corresponding ambient `window.api` typings.
- `src/renderer/src/App.tsx` is the main renderer shell.
- `src/renderer/src/components/ui/*` contains generated UI primitives.
- `src/renderer/src/stores/*` holds Zustand stores.
- `src/renderer/src/hooks/*` contains renderer-specific behavior hooks.
- `src/renderer/src/i18n/*` owns translations and i18n initialization.

## Formatting Rules

- Follow `.editorconfig`: UTF-8, LF line endings, 2-space indentation, final newline, no trailing whitespace.
- Follow `.prettierrc.yaml`: single quotes, no semicolons, `printWidth: 100`, `trailingComma: none`.
- Prefer running `bun run format` after non-trivial edits.
- Keep formatting machine-friendly; do not hand-format against Prettier rules.
- Some checked-in generated UI files still show double quotes; if you touch them, normalize them with the project formatter.

## Import Conventions

- Put external/package imports before internal relative imports.
- Use `import type` for type-only imports.
- Keep CSS side-effect imports at the top of renderer entry files.
- Prefer the import style already used in the file you are editing.
- Renderer path aliases exist for `@renderer/*` and `@/*`, but most current files use relative imports.
- Do not mass-convert relative imports to aliases unless the task specifically calls for it.
- Remove unused imports promptly.

## TypeScript Conventions

- Prefer explicit, narrow types over inferred `any`.
- Reuse shared domain types from `src/shared/types.ts` whenever data crosses process boundaries.
- Prefer `type` aliases for object shapes, unions, and props.
- Reserve `interface` for extensible contracts and declaration merging.
- Existing code uses `interface` mainly for `LLMProvider` and ambient `Window` typing.
- Use literal unions for enum-like values such as provider keys and target languages.
- Type async function returns explicitly, for example `Promise<void>` or `Promise<TranslateResult>`.
- Narrow unknown errors with `error instanceof Error` before reading `.message`.
- Validate external or model-generated data with Zod when practical.
- Avoid adding new `any` usage; there are legacy `electron-store` escape hatches, but do not spread them.
- Use non-null assertions only when lifecycle guarantees the value exists, like the renderer root element.

## Naming Conventions

- React component files use PascalCase, for example `SettingsModal.tsx`.
- React components use PascalCase function names.
- Hooks use camelCase and begin with `use`.
- Zustand stores use camelCase names ending in `Store`.
- Prop types use `XProps` naming.
- Local event handlers use `handleX` naming.
- Setter-style actions use `setX` naming.
- Subscription-style callbacks use `onX` naming.
- Registration helpers use `registerXHandlers` naming.
- Window constructors use `createXWindow` or `createXWindows` naming.
- Shared constant groups use upper-snake member names inside objects, such as `IPC_CHANNELS.TRANSLATE_EXECUTE`.
- File names are usually feature-driven and descriptive rather than abbreviated.

## Renderer And React Style

- Prefer functional components and hooks.
- Keep hooks at the top level of components.
- Use `react-i18next` for renderer-visible strings instead of hardcoding new UI text.
- When adding UI copy, update both `src/renderer/src/i18n/locales/ja.json` and `src/renderer/src/i18n/locales/en.json`.
- Use Zustand for app state already modeled as stores; do not introduce duplicate React state without reason.
- Prefer store selectors when you only need part of a store and rerenders matter.
- Use the shared `cn` helper from `src/renderer/src/lib/utils.ts` for conditional class names.
- Prefer existing UI primitives from `src/renderer/src/components/ui/*` before creating new wrappers.
- Keep Tailwind utility usage consistent with surrounding files.
- Preserve shadcn/Radix `data-slot`, variant, and accessibility wiring when editing generated UI primitives.

## Electron, IPC, And Security Style

- Keep Node and Electron access inside `src/main` and `src/preload`, not in renderer components.
- Expose only minimal, typed APIs from preload through `contextBridge`.
- When changing preload APIs, update both `src/preload/index.ts` and `src/preload/index.d.ts` together.
- Keep IPC channel names centralized in `src/shared/types.ts`.
- Use `ipcMain.handle` and `ipcRenderer.invoke` for request/response flows.
- Use `send` and event listeners for push-style events such as capture results.
- Preserve the existing security posture: `contextIsolation: true` and `nodeIntegration: false`.
- Keep BrowserWindow creation and shortcut registration in the main process layer.

## State, Data, And Persistence

- App settings are persisted through `electron-store` in `src/main/services/store.ts`.
- Translation history is currently in-memory only via Zustand.
- Default settings live in the main-process store layer; keep UI defaults aligned with those values.
- When updating nested settings, spread nested objects carefully so sibling values are not dropped.
- When adding a new provider or setting, update shared types, defaults, UI, preload types, and IPC/service code together.
- Keep cross-process payloads small, typed, and serializable.

## Error Handling And Logging

- Wrap async IPC and service boundaries in `try/catch` when errors need shaping or logging.
- Log failures with contextual messages like `console.error('Failed to save settings:', error)`.
- Rethrow when the caller needs to react or surface the error.
- Convert low-level failures into clear user-facing messages when they cross into the renderer.
- Preserve the current pattern of `error instanceof Error` checks before reading `.message`.
- Do not swallow errors silently.
- Translation flow currently decorates failures with elapsed time; keep that behavior unless intentionally redesigning it.
- Validate provider preconditions early, such as a required Groq API key.

## Comments, Docs, And Localization

- The repository already includes many Japanese comments and labels.
- Match the local style of the file you edit rather than forcing a full-language rewrite.
- Keep comments useful and focused on non-obvious behavior.
- Prefer self-explanatory code over redundant comments.
- Preserve or extend JSDoc-style comments where the surrounding file already uses them heavily.

## Practical Guidance For Agents

- Make focused changes that fit the current architecture.
- Prefer extending existing stores, IPC handlers, and services over parallel implementations.
- Keep process boundaries explicit whenever data moves between main and renderer.
- If you modify user-visible strings, update translations in both supported locales.
- If you add tests or new scripts, update this file so future agents have accurate commands.
- If verification is limited because no tests exist, say so clearly in your final response.
