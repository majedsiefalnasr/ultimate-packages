# Terminal

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Terminal is a text-based, command-line style widget: a scrollable box that shows an optional welcome message, a list of previously entered commands with their responses, and a prompt line with a text input. The component itself does no command processing. It only collects what the user types and displays whatever response the application sends back, and the two sides talk through a companion **TerminalService** (a command/response channel). All three frameworks ship it with the same visible structure, but the service differs: PrimeNG uses an Angular injectable with RxJS subjects, while PrimeVue and PrimeReact use a global event bus (`primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`, `primeng-21.1.9:packages/primeng/src/terminal/terminalservice.ts`, `primevue-4.5.5:packages/primevue/src/terminal/Terminal.vue`, `primevue-4.5.5:packages/primevue/src/terminalservice/TerminalService.js`, `primereact-10.9.9:components/lib/terminal/Terminal.js`, `primereact-10.9.9:components/lib/terminalservice/TerminalService.js`).

## 2. Names & status

- Canonical name: **Terminal**. The service is a separate import entry point named **TerminalService** in all three frameworks (PrimeNG exports it from the `primeng/terminal` entry, PrimeVue and PrimeReact from `terminalservice`). No legacy aliases.
- Not deprecated as a component. PrimeNG marks `styleClass` as `@deprecated since v20.0.0, use class instead` (`primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`; catalog module `terminal` in `docs/prime-reference/catalog/primeng.json`).
- Listed under the **Misc** category in all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- The catalog has three PrimeVue modules for it (`terminal`, `terminalservice`, `terminalstyle`) and two each for PrimeNG and PrimeReact (`terminal`, `terminalservice`). The PrimeNG `terminalservice` catalog module is empty because the service class lives in the `terminal` entry point (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`).

## 3. Per framework

| Aspect             | PrimeNG                                                                      | PrimeVue                                                      | PrimeReact                                                           |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| Import (component) | `import { TerminalModule } from 'primeng/terminal'`                          | `import Terminal from 'primevue/terminal'`                    | `import { Terminal } from 'primereact/terminal'`                     |
| Import (service)   | `import { TerminalService } from 'primeng/terminal'` (same entry point)      | `import TerminalService from 'primevue/terminalservice'`      | `import { TerminalService } from 'primereact/terminalservice'`       |
| Selector / tag     | `<p-terminal>`                                                               | `<Terminal>`                                                  | `<Terminal>`                                                         |
| Source             | `packages/primeng/src/terminal/terminal.ts`                                  | `packages/primevue/src/terminal/Terminal.vue`                 | `components/lib/terminal/Terminal.js`                                |
| Service source     | `packages/primeng/src/terminal/terminalservice.ts`                           | `packages/primevue/src/terminalservice/TerminalService.js`    | `components/lib/terminalservice/TerminalService.js`                  |
| Base               | `BaseComponent<TerminalPassThrough>`, standalone, `OnPush`, no encapsulation | `BaseComponent` via `BaseTerminal.vue`, `inheritAttrs: false` | `ComponentBase.extend` (`TerminalBase.js`), `React.memo(forwardRef)` |
| Exported with it   | `Terminal`, `TerminalModule`, `TerminalService`, `TerminalStyle`, PT types   | default export `Terminal`; `TerminalService` in own package   | `Terminal`, `TerminalService` (two packages)                         |
| Type definitions   | `packages/primeng/src/types/terminal/terminal.types.ts`                      | `packages/primevue/src/terminal/Terminal.d.ts`                | `components/lib/terminal/terminal.d.ts`                              |

- PrimeNG `public_api.ts` re-exports `primeng/types/terminal`, `./terminal`, `./terminalservice` and `./style/terminalstyle`; the module `TerminalModule` imports and exports `Terminal` plus `SharedModule` (`primeng-21.1.9:packages/primeng/src/terminal/public_api.ts`, `primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`).
- PrimeVue ships the service as a separate package folder with its own `package.json` and `.d.ts` (`primevue-4.5.5:packages/primevue/src/terminalservice/package.json`, `primevue-4.5.5:packages/primevue/src/terminalservice/TerminalService.d.ts`).
- PrimeReact ships the service as a separate package folder with its own declaration file (`primereact-10.9.9:components/lib/terminalservice/terminalservice.d.ts`, `primereact-10.9.9:components/lib/terminalservice/package.json`).
- Import snippets: `primeng-21.1.9:apps/showcase/doc/terminal/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/terminal/ImportDoc.vue`, `primereact-10.9.9:components/doc/terminal/importdoc.js`.

## 4. Anatomy

Every framework renders: root → optional welcome message → command list (one row per executed command: prompt label, command text, response) → prompt line (prompt label + text input).

| Part         | Element                         | PrimeNG PT key    | PrimeVue PT key  | PrimeReact PT key | PrimeNG / PrimeVue class      | PrimeReact class              |
| ------------ | ------------------------------- | ----------------- | ---------------- | ----------------- | ----------------------------- | ----------------------------- |
| Root         | host / `div`                    | `host`, `root`    | `root`           | `root`            | `p-terminal p-component`      | `p-terminal p-component`      |
| Welcome      | `div`                           | `welcomeMessage`  | `welcomeMessage` | `welcomeMessage`  | `p-terminal-welcome-message`  | none                          |
| Command list | `div`                           | `commandList`     | `content`        | `content`         | `p-terminal-command-list`     | `p-terminal-content`          |
| Command row  | `div`                           | `command`         | `commands`       | `commands`        | `p-terminal-command`          | none (row has no class)       |
| Prompt label | `span` (in row and prompt line) | `promptLabel`     | `prompt`         | `prompt`          | `p-terminal-prompt-label`     | `p-terminal-prompt`           |
| Command text | `span`                          | `commandValue`    | `command`        | `command`         | `p-terminal-command-value`    | `p-terminal-command`          |
| Response     | `div` with `aria-live="polite"` | `commandResponse` | `response`       | `response`        | `p-terminal-command-response` | `p-terminal-response`         |
| Prompt line  | `div`                           | `prompt`          | `container`      | `container`       | `p-terminal-prompt`           | `p-terminal-prompt-container` |
| Input        | `input type="text"`             | `promptValue`     | `commandText`    | `commandText`     | `p-terminal-prompt-value`     | `p-terminal-input`            |

- The PT key names are not portable: the same DOM part has a different key in PrimeNG than in PrimeVue/PrimeReact, and the key `prompt` means the prompt _line_ in PrimeNG but the prompt _label_ in the other two. PrimeVue and PrimeReact use the single `prompt` key for the label in both the command rows and the prompt line, and `command` for the command text, while the row wrapper is `commands` (`primeng-21.1.9:packages/primeng/src/types/terminal/terminal.types.ts`, `primevue-4.5.5:packages/primevue/src/terminal/Terminal.d.ts`, `primereact-10.9.9:components/lib/terminal/terminal.d.ts`).
- PrimeNG's template applies `ptm('promptLabel')` to the prompt label both in each command row and on the prompt line, and the host element itself is the root; PT `host` and `root` are both applied to it (`primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`).
- PrimeReact appends a non-breaking space after the prompt text (`&nbsp;`) in both places; PrimeNG and PrimeVue rely on CSS margin instead (`primereact-10.9.9:components/lib/terminal/Terminal.js`, `@primeuix/styles-2.0.3:dist/terminal/index.mjs`).

## 5. API highlights

### Component props

| Prop                                                     | PrimeNG                                              | PrimeVue                            | PrimeReact                       |
| -------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------- | -------------------------------- |
| `welcomeMessage`                                         | `string \| undefined` (`@Input`)                     | `string` (default `null`)           | `string` (default `null`)        |
| `prompt`                                                 | `string \| undefined` (`@Input`)                     | `string` (default `null`)           | `string` (default `null`)        |
| `response`                                               | `@Input() set response(value: string)` (setter only) | —                                   | —                                |
| `styleClass`                                             | `string \| undefined`, **deprecated** since v20.0.0  | —                                   | — (`className`)                  |
| `className`, `style`, `id`, other `HTMLDivElement` props | —                                                    | — (attributes fall through to root) | yes, passed to the root `div`    |
| `dt`                                                     | `InputSignal<Object>`                                | `DesignToken<any>`                  | —                                |
| `pt`, `ptOptions`, `unstyled`                            | yes (`unstyled` default `undefined`)                 | yes (`unstyled` default `false`)    | yes (`unstyled` default `false`) |

- Sources: `primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`, `primevue-4.5.5:packages/primevue/src/terminal/BaseTerminal.vue`, `primevue-4.5.5:packages/primevue/src/terminal/Terminal.d.ts`, `primereact-10.9.9:components/lib/terminal/TerminalBase.js`, `primereact-10.9.9:components/lib/terminal/terminal.d.ts`.
- The PrimeNG catalog does not list the `response` setter input (the catalog `terminal` module has `dt`, `prompt`, `pt`, `ptOptions`, `styleClass`, `unstyled`, `welcomeMessage` only), so the catalog under-reports the inputs; the source is authoritative (`docs/prime-reference/catalog/primeng.json`).
- Events, slots/templates, content projection: none in any framework. `TerminalSlots {}` and `TerminalEmitsOptions {}` are empty in PrimeVue; PrimeNG's `Terminal` declares no `@Output` and no templates; PrimeReact has an unused `children` prop (`primevue-4.5.5:packages/primevue/src/terminal/Terminal.d.ts`, `primereact-10.9.9:components/lib/terminal/terminal.d.ts`).

### Methods

- PrimeReact (ref): `focus(): void`, `getElement(): HTMLDivElement | null` (`primereact-10.9.9:components/lib/terminal/terminal.d.ts`, `primereact-10.9.9:components/lib/terminal/Terminal.js`).
- PrimeNG: public `focus(element: HTMLElement)` and `handleCommand(event: KeyboardEvent)` exist but are internal plumbing, not documented API (`primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`). PrimeVue exposes none in its typings.

### TerminalService

| Aspect         | PrimeNG                                                                      | PrimeVue                                               | PrimeReact                                                    |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| Kind           | `@Injectable()` class (no `providedIn`), two RxJS `Subject<string>`          | `EventBus()` singleton from `@primeuix/utils/eventbus` | `EventBus()` singleton from `../utils/Utils`                  |
| Send command   | internal: component calls `sendCommand(command: string)`; ignored when falsy | internal: component calls `emit('command', text)`      | internal: component calls `emit('command', text)`             |
| Listen command | `commandHandler` (an `Observable<string>`) → `subscribe(...)`                | `on('command', fn)` / `off('command', fn)`             | `on('command', fn)` / `off('command', fn)`                    |
| Send response  | `sendResponse(response: string)`; ignored when falsy                         | `emit('response', value)`                              | `emit('response', value)`                                     |
| Clear          | none                                                                         | none                                                   | `emit('clear')` resets the command list and the history index |
| Typed actions  | n/a (methods)                                                                | `'command' \| 'response' \| undefined`                 | `'command' \| 'response' \| 'clear'`                          |

- Sources: `primeng-21.1.9:packages/primeng/src/terminal/terminalservice.ts`, `primevue-4.5.5:packages/primevue/src/terminalservice/TerminalService.js`, `primevue-4.5.5:packages/primevue/src/terminalservice/TerminalService.d.ts`, `primereact-10.9.9:components/lib/terminalservice/TerminalService.js`, `primereact-10.9.9:components/lib/terminalservice/terminalservice.d.ts`.
- The PrimeVue typings describe `TerminalService` methods with copy-pasted wording ("Displays the terminal using the action options", "Confirmation Service methods"), which does not match what they do (`primevue-4.5.5:packages/primevue/src/terminalservice/TerminalService.d.ts`).
- Behaviour: each Enter pushes `{ text }` to the internal command list and emits the command; the application must then emit exactly one response, which is attached to the **last** command in the list. Nothing correlates a response to a specific command, and asynchronous or out-of-order responses attach to whatever command is last at that moment.

## 6. Usage guidance

- **Basic** (the only demo section in all three) — the application subscribes to the command channel, interprets the text (the demo splits on the first space into a command word and arguments, with `date`, `greet` and `random`) and sends the answer back through the response channel; PrimeReact's demo also handles `clear`. PrimeNG listens via `commandHandler.subscribe` and replies with `sendResponse`; PrimeVue and PrimeReact register with `TerminalService.on('command', ...)`, reply with `emit('response', ...)` and unregister with `off` on unmount (`primeng-21.1.9:apps/showcase/doc/terminal/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/terminal/BasicDoc.vue`, `primereact-10.9.9:components/doc/terminal/basicdoc.js`).
- **Required provider (PrimeNG):** `TerminalService` has no `providedIn`, and the `Terminal` constructor injects it, so a host component or module must list `TerminalService` in `providers`; the demo does so on the demo component, and the PT viewer does the same. Terminals under the same provider share one service instance (`primeng-21.1.9:apps/showcase/doc/terminal/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/terminal/pt/PTViewer.ts`).
- **No provider needed (PrimeVue, PrimeReact):** the service is a module-level singleton, so every mounted Terminal receives every `response` (and PrimeReact `clear`) event. With two terminals on one page, answers go to both; there is no per-instance channel.
- **Always unsubscribe:** the listener is the application's responsibility (PrimeNG `OnDestroy` unsubscribe, PrimeVue `beforeUnmount` + `off`, PrimeReact `useEffect` cleanup in the demos).
- **Accessible name:** PrimeVue's demo passes `aria-label="PrimeVue Terminal Service"` and PrimeNG's PT viewer does the same on the host (`primevue-4.5.5:apps/showcase/doc/terminal/BasicDoc.vue`, `primeng-21.1.9:apps/showcase/doc/terminal/pt/PTViewer.ts`). See §7 for where that attribute lands.
- **Styling in the PrimeReact demo:** the demo restyles the terminal to a dark look through `pt` classes on `root`, `prompt`, `command` and `response` (`primereact-10.9.9:components/doc/terminal/basicdoc.js`).
- **Falsy responses:** PrimeNG's `sendResponse` drops falsy values, and the PrimeReact demo routes a falsy response to `clear`. A numeric `0` (the demo's `random` command can produce it) is therefore silently dropped in PrimeNG and wipes the screen in PrimeReact's demo, whereas PrimeVue emits it (`primeng-21.1.9:packages/primeng/src/terminal/terminalservice.ts`, `primereact-10.9.9:components/doc/terminal/basicdoc.js`).
- Demo sections absent upstream: there is no Forms, Filter or Template section for this component in any showcase (`primeng-21.1.9:apps/showcase/doc/terminal/`, `primevue-4.5.5:apps/showcase/doc/terminal/`, `primereact-10.9.9:components/doc/terminal/`).

## 7. Accessibility

- Role/ARIA: the response element carries `aria-live="polite"` in all three, so new answers are announced. There is no `role` (no `role="log"`/`textbox`) and no `aria-label` on any inner element; the only interactive element is the plain text `input` with `autocomplete="off"` (`primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`, `primevue-4.5.5:packages/primevue/src/terminal/Terminal.vue`, `primereact-10.9.9:components/lib/terminal/Terminal.js`).
- Documented screen-reader guidance (identical in all three): the input can be described with `aria-label` or `aria-labelledby`, and the list of previous commands is live (`primeng-21.1.9:apps/showcase/doc/terminal/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/terminal/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/terminal/accessibilitydoc.js`).
- Source/doc mismatch: unknown attributes such as `aria-label` do not reach the input. PrimeVue sets `inheritAttrs: false` and spreads `ptmi('root')` on the root `div`; PrimeReact spreads `getOtherProps(props)` on the root `div`; PrimeNG's attribute lands on the `p-terminal` host. To label the actual input, use `pt` (`promptValue` in PrimeNG, `commandText` in PrimeVue/PrimeReact), for example `pt={{ commandText: { 'aria-label': ... } }}`. This is an inference from the source, not something the showcase demonstrates.
- Keyboard (identical doc table in all three): Tab moves focus to the input; Enter runs the command when the input has focus. Clicking anywhere on the terminal focuses the input (`HostListener('click')` in PrimeNG, `@click="onClick"` in PrimeVue, `onClick` in PrimeReact).
- Source details beyond the doc: PrimeNG detects Enter by `event.keyCode == 13`; PrimeVue by `event.key === 'Enter'` and non-empty text; PrimeReact by `event.code` `Enter` or `NumpadEnter` and non-empty text, and additionally supports **ArrowUp** to step back through command history (not in the accessibility doc). PrimeNG and PrimeVue have no history navigation.
- PrimeNG's input has the `autofocus` attribute; PrimeVue focuses it in `mounted()`; PrimeReact does not focus on mount. Auto-focus on mount can pull focus away from other content on page load.

## 8. Theming

- Style classes (catalog `style.classes` for PrimeNG; `TerminalClasses` enumeration for PrimeVue; both match the source): `p-terminal`, `p-terminal-welcome-message`, `p-terminal-command-list`, `p-terminal-command`, `p-terminal-command-value`, `p-terminal-command-response`, `p-terminal-prompt`, `p-terminal-prompt-label`, `p-terminal-prompt-value` (`primeng-21.1.9:packages/primeng/src/terminal/style/terminalstyle.ts`, `primevue-4.5.5:packages/primevue/src/terminal/style/TerminalStyle.js`). The root also gets `p-component`.
- PrimeReact classes differ (`p-terminal`, `p-terminal-content`, `p-terminal-prompt-container`, `p-terminal-command`, `p-terminal-input`, `p-terminal-prompt`, `p-terminal-response`); the welcome message and the command row carry no class. Its docs list a subset (`p-terminal`, `p-terminal-content`, `p-terminal-prompt`, `p-terminal-response`, `p-terminal-input`) (`primereact-10.9.9:components/lib/terminal/TerminalBase.js`, `primereact-10.9.9:components/doc/terminal/theming/styleddoc.js`).
- Pass-through keys: PrimeNG `host, root, welcomeMessage, commandList, command, promptLabel, commandValue, commandResponse, prompt, promptValue`; PrimeVue and PrimeReact `root, welcomeMessage, content, commands, prompt, command, response, container, commandText, hooks` (see §4) (`primeng-21.1.9:packages/primeng/src/types/terminal/terminal.types.ts`, `primevue-4.5.5:packages/primevue/src/terminal/Terminal.d.ts`, `primereact-10.9.9:components/lib/terminal/terminal.d.ts`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/terminal/index.mjs` (used by PrimeNG via `import { style } from '@primeuix/styles/terminal'` and by PrimeVue via the same import). It sets the root to `display: block`, `overflow: auto`, token-driven `height`, `background`, `color`, border, padding and radius; the prompt line is `flex` with a transparent, borderless input (`flex: 1 1 auto`, inherited font, `font-size: 1rem`); the prompt label gets `margin-inline-end` from `terminal.prompt.gap`; the response gets `terminal.command.response.margin` (`primeng-21.1.9:packages/primeng/src/terminal/style/terminalstyle.ts`, `primevue-4.5.5:packages/primevue/src/terminal/style/TerminalStyle.js`).
- Stale selector: the shared CSS still contains `.p-terminal-input::-ms-clear`, but the styled input class is `p-terminal-prompt-value`, so that rule matches nothing in PrimeNG/PrimeVue (`@primeuix/styles-2.0.3:dist/terminal/index.mjs`).
- Design tokens (`@primeuix/themes-2.0.3:types/terminal/index.d.ts`): `root.background`, `root.borderColor`, `root.color`, `root.height`, `root.padding`, `root.borderRadius`, `prompt.gap`, `commandResponse.margin`. All four presets ship the same values: background, border colour, text colour, padding (`{form.field.padding.y} {form.field.padding.x}`) and radius reference the `form.field.*` tokens (so Terminal looks like a form field), `height` `18rem`, `prompt.gap` `0.25rem`, `commandResponse.margin` `2px 0` (`@primeuix/themes-2.0.3:dist/aura/terminal/index.mjs`, `@primeuix/themes-2.0.3:dist/lara/terminal/index.mjs`, `@primeuix/themes-2.0.3:dist/material/terminal/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/terminal/index.mjs`). The `lara` preset additionally exports an empty `css` string (`@primeuix/themes-2.0.3:dist/lara/terminal/index.mjs`).
- Tailwind/unstyled: PrimeVue and PrimeReact have a Tailwind theming page (link to the Tailwind presets project); PrimeNG's showcase has no theming folder for Terminal (`primevue-4.5.5:apps/showcase/doc/terminal/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/terminal/theming/tailwinddoc.js`).
- PrimeReact: own CSS in `TerminalBase.js` inside `@layer primereact`: fixed `height: 18rem` and `overflow: auto` on the root, flex prompt container, borderless transparent input; no design tokens (N/A) and no `dt` prop (`primereact-10.9.9:components/lib/terminal/TerminalBase.js`).
- PT showcase pages: `primeng-21.1.9:apps/showcase/doc/terminal/pt/PTViewer.ts`, `primeng-21.1.9:apps/showcase/doc/terminal/pt/PTComponent.ts`, `primevue-4.5.5:apps/showcase/doc/terminal/pt/index.vue`, `primevue-4.5.5:apps/showcase/doc/terminal/pt/PTViewer.vue`, `primereact-10.9.9:components/doc/terminal/pt/wireframe.js`.

## 9. Relationships

- Embeds no other Prime component. The prompt input is a raw `<input type="text">`, not InputText, so none of InputText's props (`disabled`, `invalid`, `size`, variants) apply (`primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`, `primevue-4.5.5:packages/primevue/src/terminal/Terminal.vue`, `primereact-10.9.9:components/lib/terminal/Terminal.js`).
- Visually reuses the `form.field.*` token group shared with the input components (InputText, Textarea and others), via the preset values above.
- Companion: **TerminalService** is the only supported way to feed commands in and responses out; it is part of this record, not a separate component.
- Not embedded by other Prime components. It sits in the Misc menu category next to AnimateOnScroll, Avatar, Badge, BlockUI, Chip, FocusTrap, Fluid, Inplace, MeterGroup, ProgressBar, ProgressSpinner, ScrollTop, Skeleton, Ripple, StyleClass and Tag (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`); none of them replaces Terminal. For free-form multi-line entry use Textarea (Form category), which has no command/response model.
- No alias chain.

## 10. Dependencies

- PrimeNG: `@angular/common` (`CommonModule`, `ngIf`/`ngFor`), `@angular/core`, `@angular/forms` (`FormsModule` for `[(ngModel)]` on the input), `rxjs` (`Subscription`, `Subject`), `primeng/api` (`SharedModule`), `primeng/basecomponent`, `primeng/bind`, `primeng/base` (`BaseStyle`), `@primeuix/styles/terminal`. It imports `find` from `@primeuix/utils` but never uses it (`primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`, `primeng-21.1.9:packages/primeng/src/terminal/terminalservice.ts`, `primeng-21.1.9:packages/primeng/src/terminal/style/terminalstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `primevue/terminal/style`, `primevue/terminalservice`, `@primeuix/styles/terminal`, `@primeuix/utils/eventbus` (for the service) (`primevue-4.5.5:packages/primevue/src/terminal/Terminal.vue`, `primevue-4.5.5:packages/primevue/src/terminal/BaseTerminal.vue`, `primevue-4.5.5:packages/primevue/src/terminal/style/TerminalStyle.js`, `primevue-4.5.5:packages/primevue/src/terminalservice/TerminalService.js`).
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`), `../terminalservice/TerminalService`, `../utils/Utils` (`DomHandler`, `classNames`, `EventBus`) (`primereact-10.9.9:components/lib/terminal/Terminal.js`, `primereact-10.9.9:components/lib/terminalservice/TerminalService.js`).
- External npm packages beyond the framework runtime: none (RxJS is an Angular peer dependency).

## 11. Framework differences

| Aspect                      | PrimeNG                                                                                                             | PrimeVue                                                                                            | PrimeReact                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Service model               | DI-scoped `TerminalService` with RxJS subjects                                                                      | global `EventBus` singleton                                                                         | global `EventBus` singleton                            |
| Provider required           | yes (`providers: [TerminalService]`)                                                                                | no                                                                                                  | no                                                     |
| Per-instance isolation      | yes, per provider scope                                                                                             | no, all terminals share the bus                                                                     | no, all terminals share the bus                        |
| `clear` event               | none                                                                                                                | none                                                                                                | yes, `emit('clear')`                                   |
| Command history (↑)         | none                                                                                                                | none                                                                                                | yes, ArrowUp cycles backwards                          |
| Enter detection             | `keyCode == 13`                                                                                                     | `key === 'Enter'`                                                                                   | `code` Enter/NumpadEnter                               |
| Empty command               | pushes an empty row, nothing emitted                                                                                | ignored                                                                                             | ignored                                                |
| Falsy response              | `sendResponse` ignores it                                                                                           | emitted as is                                                                                       | emitted as is (the demo maps it to `clear`)            |
| Response before any command | throws (`commands[-1]` is undefined)                                                                                | throws (same pattern)                                                                               | guarded (`commands.length > 0`)                        |
| Response input              | `response` setter input, not in the catalog                                                                         | none                                                                                                | none                                                   |
| Auto-scroll                 | after a response (`commandProcessed` flag)                                                                          | on every `updated()`                                                                                | on every render effect                                 |
| Initial focus               | `autofocus` attribute on input                                                                                      | `focus()` in `mounted`                                                                              | none                                                   |
| Extra attributes            | on the host                                                                                                         | on root `div` (`ptmi`)                                                                              | on root `div` (`getOtherProps`)                        |
| Theming                     | `@primeuix` tokens, `dt`                                                                                            | `@primeuix` tokens, `dt`                                                                            | own CSS in `@layer primereact`, no tokens              |
| PT keys                     | `host, root, welcomeMessage, commandList, command, promptLabel, commandValue, commandResponse, prompt, promptValue` | `root, welcomeMessage, content, commands, prompt, command, response, container, commandText, hooks` | same set as PrimeVue                                   |
| Class names                 | `p-terminal-command-list`, `-command-value`, `-command-response`, `-prompt-value`                                   | same as PrimeNG                                                                                     | `-content`, `-response`, `-input`, `-prompt-container` |
| Ref API                     | none                                                                                                                | none                                                                                                | `focus()`, `getElement()`                              |

- Sources for the table rows: `primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`, `primeng-21.1.9:packages/primeng/src/terminal/terminalservice.ts`, `primevue-4.5.5:packages/primevue/src/terminal/Terminal.vue`, `primereact-10.9.9:components/lib/terminal/Terminal.js`.
- Type-definition mismatch: PrimeVue and PrimeReact declare `TerminalState.commands` as `string[]`, but the runtime items are objects `{ text, response }` (`primevue-4.5.5:packages/primevue/src/terminal/Terminal.d.ts`, `primereact-10.9.9:components/lib/terminal/terminal.d.ts`).
- Test coverage upstream: PrimeNG and PrimeVue ship spec files next to the source; PrimeReact has none in the archive (`primeng-21.1.9:packages/primeng/src/terminal/terminal.spec.ts`, `primevue-4.5.5:packages/primevue/src/terminal/Terminal.spec.js`).

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/terminal/terminal.ts`
- `primeng-21.1.9:packages/primeng/src/terminal/terminalservice.ts`
- `primeng-21.1.9:packages/primeng/src/terminal/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/terminal/terminal.spec.ts`
- `primeng-21.1.9:packages/primeng/src/terminal/style/terminalstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/terminal/terminal.types.ts`
- `primeng-21.1.9:apps/showcase/doc/terminal/` (`import-doc.ts`, `basic-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`, `pt/PTComponent.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/terminal/` (`Terminal.vue`, `BaseTerminal.vue`, `Terminal.d.ts`, `Terminal.spec.js`, `style/TerminalStyle.js`)
- `primevue-4.5.5:packages/primevue/src/terminalservice/` (`TerminalService.js`, `TerminalService.d.ts`, `package.json`)
- `primevue-4.5.5:apps/showcase/doc/terminal/` (`ImportDoc.vue`, `BasicDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `pt/PTViewer.vue`, `theming/index.vue`, `theming/TailwindDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/terminal/` (`Terminal.js`, `TerminalBase.js`, `terminal.d.ts`)
- `primereact-10.9.9:components/lib/terminalservice/` (`TerminalService.js`, `terminalservice.d.ts`, `package.json`)
- `primereact-10.9.9:components/doc/terminal/` (`importdoc.js`, `basicdoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/terminal/index.mjs`
- `@primeuix/themes-2.0.3:types/terminal/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/terminal/index.mjs`
- `@primeuix/themes-2.0.3:dist/lara/terminal/index.mjs`
- `@primeuix/themes-2.0.3:dist/material/terminal/index.mjs`
- `@primeuix/themes-2.0.3:dist/nora/terminal/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json` (modules `terminal`, `terminalservice`, `terminalstyle`)
