# Avatar

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Avatar shows a person or entity as a small square or circular tile holding a text label (usually initials), an icon or an image, in three sizes. A companion AvatarGroup stacks several avatars with an overlap. All three frameworks ship both components (`primeng-21.1.9:packages/primeng/src/avatar/avatar.ts`, `primevue-4.5.5:packages/primevue/src/avatar/Avatar.vue`, `primereact-10.9.9:components/lib/avatar/Avatar.js`).

## 2. Names & status

- Canonical name: **Avatar**; companion **AvatarGroup** is covered by this record. No legacy aliases.
- Neither component is deprecated. In PrimeNG, `Avatar.styleClass` is `@deprecated since v20.0.0, use class instead`; `AvatarGroup.styleClass` carries no deprecation tag (`primeng-21.1.9:packages/primeng/src/avatar/avatar.ts`, `primeng-21.1.9:packages/primeng/src/avatargroup/avatargroup.ts`).
- Listed under Misc in all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                    | PrimeVue                                                                                       | PrimeReact                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Import         | `import { AvatarModule } from 'primeng/avatar'`, `import { AvatarGroupModule } from 'primeng/avatargroup'` | `import Avatar from 'primevue/avatar'`, `import AvatarGroup from 'primevue/avatargroup'`       | `import { Avatar } from 'primereact/avatar'`, `{ AvatarGroup }` from `primereact/avatargroup` |
| Selector / tag | `<p-avatar>`; group `<p-avatar-group>` (also `p-avatarGroup`, `p-avatargroup`)                             | `<Avatar>`, `<AvatarGroup>`                                                                    | `<Avatar />`, `<AvatarGroup>`                                                                 |
| Source         | `packages/primeng/src/avatar/avatar.ts`, `packages/primeng/src/avatargroup/avatargroup.ts`                 | `packages/primevue/src/avatar/Avatar.vue`, `packages/primevue/src/avatargroup/AvatarGroup.vue` | `components/lib/avatar/Avatar.js`, `components/lib/avatargroup/AvatarGroup.js`                |
| Base class     | `BaseComponent<AvatarPassThrough>` / `BaseComponent<AvatarGroupPassThrough>`, both standalone              | `BaseComponent` via `BaseAvatar.vue` / `BaseAvatarGroup.vue`                                   | `ComponentBase.extend` (`AvatarBase.js`, `AvatarGroupBase.js`)                                |

Sources: `primeng-21.1.9:apps/showcase/doc/avatar/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/avatar/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/avatar/ImportDoc.vue`, `primereact-10.9.9:components/doc/avatar/importdoc.js`.

## 4. Anatomy

| Part       | Element                       | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                         |
| ---------- | ----------------------------- | -------------- | --------------- | ----------------- | --------------------------------------------- |
| Root       | host / `div`                  | `host`, `root` | `root`          | `root`            | `p-avatar`                                    |
| Label      | `span` with the text          | `label`        | `label`         | `label`           | `p-avatar-label` (PrimeReact `p-avatar-text`) |
| Icon       | `span` (or SVG in PrimeReact) | `icon`         | `icon`          | `icon`            | `p-avatar-icon`                               |
| Image      | `img`                         | `image`        | `image`         | `image`           | none (root gets `p-avatar-image`)             |
| Group root | host / `div` wrapping avatars | `host`, `root` | `root`          | `root`            | `p-avatar-group`                              |

- Only one of label, icon or image is rendered. PrimeNG and PrimeVue check label first, then icon, then image; PrimeReact checks image first (unless it failed to load), then label, then icon (`primeng-21.1.9:packages/primeng/src/avatar/avatar.ts`, `primevue-4.5.5:packages/primevue/src/avatar/Avatar.vue`, `primereact-10.9.9:components/lib/avatar/Avatar.js`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/avatar/avatar.types.ts`, `primeng-21.1.9:packages/primeng/src/types/avatargroup/avatargroup.types.ts`, `primevue-4.5.5:packages/primevue/src/avatar/Avatar.d.ts`, `primevue-4.5.5:packages/primevue/src/avatargroup/AvatarGroup.d.ts`, `primereact-10.9.9:components/lib/avatar/avatar.d.ts`, `primereact-10.9.9:components/lib/avatargroup/avatargroup.d.ts`.

## 5. API highlights

Avatar props shared by all three:

| Prop    | Type                                          | Default    |
| ------- | --------------------------------------------- | ---------- |
| `label` | `string`                                      | none       |
| `icon`  | `string` (PrimeReact `IconType<AvatarProps>`) | none       |
| `image` | `string`                                      | none       |
| `size`  | `'normal' \| 'large' \| 'xlarge'`             | `'normal'` |
| `shape` | `'square' \| 'circle'`                        | `'square'` |

- PrimeNG: inputs `ariaLabel`, `ariaLabelledBy`, `styleClass` (deprecated); output `onImageError: EventEmitter<Event>`; content projection is rendered before the built-in content (`primeng-21.1.9:packages/primeng/src/avatar/avatar.ts`).
- PrimeVue: props `ariaLabel`, `ariaLabelledby`; emit `error(event: Event)`; slots `default` (replaces the built-in content) and `icon` (`primevue-4.5.5:packages/primevue/src/avatar/Avatar.d.ts`, `primevue-4.5.5:packages/primevue/src/avatar/BaseAvatar.vue`).
- PrimeReact: extra props `imageAlt` (default `'avatar'`), `imageFallback` (`'default' | string`, default `'default'`: on error fall back to label then icon, otherwise load the given URL), `template` (`React.ReactNode | ((props: AvatarProps) => React.ReactNode)`), `onImageError(event)`, `onClick`; method `getElement()`; `children` are rendered after the content (`primereact-10.9.9:components/lib/avatar/AvatarBase.js`, `primereact-10.9.9:components/lib/avatar/avatar.d.ts`).
- AvatarGroup has no props beyond the base ones (PrimeNG adds `styleClass` and `style`) and only projects its children.
- Full API: catalog modules `avatar` and `avatargroup` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Label** — show initials or a short string with `label` (`primeng-21.1.9:apps/showcase/doc/avatar/label-doc.ts`, `primevue-4.5.5:apps/showcase/doc/avatar/LabelDoc.vue`, `primereact-10.9.9:components/doc/avatar/labeldoc.js`).
- **Icon** — show a font icon with `icon` (`primeng-21.1.9:apps/showcase/doc/avatar/icon-doc.ts`, `primevue-4.5.5:apps/showcase/doc/avatar/IconDoc.vue`, `primereact-10.9.9:components/doc/avatar/icondoc.js`). The PrimeVue icon demo wraps an avatar in `OverlayBadge` to show a counter.
- **Image** — show a picture with `image` (`primeng-21.1.9:apps/showcase/doc/avatar/image-doc.ts`, `primevue-4.5.5:apps/showcase/doc/avatar/ImageDoc.vue`, `primereact-10.9.9:components/doc/avatar/imagedoc.js`).
- **AvatarGroup** — wrap avatars in a group to overlap them, often ending with a "+N" label avatar (`primeng-21.1.9:apps/showcase/doc/avatar/avatargroup-doc.ts`, `primevue-4.5.5:apps/showcase/doc/avatar/AvatarGroupDoc.vue`, `primereact-10.9.9:components/doc/avatar/groupdoc.js`).
- **Badge** (PrimeNG only) — attach a counter with the `pBadge` directive on `p-avatar` (`primeng-21.1.9:apps/showcase/doc/avatar/badge-doc.ts`).
- **Shape**, **Size**, **Template** (PrimeNG only as separate sections) — `shape="circle"`, `size="large" | "xlarge"`, and custom projected content (`primeng-21.1.9:apps/showcase/doc/avatar/shape-doc.ts`, `primeng-21.1.9:apps/showcase/doc/avatar/size-doc.ts`, `primeng-21.1.9:apps/showcase/doc/avatar/template-doc.ts`).

No services or providers are required.

## 7. Accessibility

- No role or ARIA attribute is set by default; authors add `role="img"` plus `aria-label` or `aria-labelledby`, and `tabindex` with their own key handlers when an avatar is interactive. There is no built-in keyboard support (`primeng-21.1.9:apps/showcase/doc/avatar/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/avatar/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/avatar/accessibilitydoc.js`).
- PrimeNG and PrimeVue expose `ariaLabel`/`ariaLabelledBy` (`ariaLabelledby`) inputs that bind to the root; the image `alt` is the `ariaLabel` in PrimeVue, while PrimeNG puts `aria-label` on the `img`. PrimeReact uses `imageAlt` (default `'avatar'`) for `alt` (`primeng-21.1.9:packages/primeng/src/avatar/avatar.ts`, `primevue-4.5.5:packages/primevue/src/avatar/Avatar.vue`, `primereact-10.9.9:components/lib/avatar/Avatar.js`).

## 8. Theming

- Style classes: `p-avatar` (with `p-component`), `p-avatar-image`, `p-avatar-circle`, `p-avatar-lg`, `p-avatar-xl`, `p-avatar-label`, `p-avatar-icon`; group `p-avatar-group` (`primeng-21.1.9:packages/primeng/src/avatar/style/avatarstyle.ts`, `primeng-21.1.9:packages/primeng/src/avatargroup/style/avatargroupstyle.ts`, `primevue-4.5.5:packages/primevue/src/avatar/style/AvatarStyle.js`, `primevue-4.5.5:packages/primevue/src/avatargroup/style/AvatarGroupStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/avatar/index.mjs` holds both the avatar and `.p-avatar-group` rules; there is no `avatargroup` module, so the AvatarGroup style services in PrimeNG and PrimeVue carry classes only.
- Design tokens (`@primeuix/themes-2.0.3:types/avatar/index.d.ts`): `root` (`width`, `height`, `fontSize`, `background`, `color`, `borderRadius`), `icon.size`, `group` (`borderColor`, `offset`), `lg` and `xl` (`width`, `height`, `fontSize`, `icon.size`, `group.offset`). Aura values: `@primeuix/themes-2.0.3:dist/aura/avatar/index.mjs`.
- `data-p` attribute on the root lists the shape and size modifiers in PrimeNG and PrimeVue.
- PrimeReact: classes and structural CSS in `AvatarBase.js`/`AvatarGroupBase.js`; label class is `p-avatar-text` and a clickable avatar gets `p-avatar-clickable`; design tokens N/A (`primereact-10.9.9:components/lib/avatar/AvatarBase.js`, `primereact-10.9.9:components/doc/avatar/theming/styleddoc.js`).
- PT docs: `primeng-21.1.9:apps/showcase/doc/avatar/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/avatar/pt/index.vue`, `primereact-10.9.9:components/doc/avatar/pt/wireframe.js`.

## 9. Relationships

- Embeds no other Prime component.
- Often combined with Badge / OverlayBadge (counter), Chip (which also shows an image or icon plus text) and Tag.
- PrimeReact Avatar detects whether its parent has `data-pc-name="avatargroup"` and stores it as `nested` state (`primereact-10.9.9:components/lib/avatar/Avatar.js`).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/base`, `@primeuix/styles/avatar` (`primeng-21.1.9:packages/primeng/src/avatar/avatar.ts`, `primeng-21.1.9:packages/primeng/src/avatar/style/avatarstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primeuix/utils` (`cn`), `@primeuix/styles/avatar` (`primevue-4.5.5:packages/primevue/src/avatar/BaseAvatar.vue`, `primevue-4.5.5:packages/primevue/src/avatar/style/AvatarStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/avatar/Avatar.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect           | PrimeNG                       | PrimeVue                        | PrimeReact                                            |
| ---------------- | ----------------------------- | ------------------------------- | ----------------------------------------------------- |
| Content priority | label → icon → image          | label → icon → image            | image → label → icon                                  |
| Image error      | `onImageError` output         | `error` emit                    | `onImageError` + `imageFallback` built-in fallback    |
| Custom content   | `ng-content` before content   | `default` slot replaces content | `template` prop replaces content; `children` appended |
| Icon template    | —                             | `icon` slot                     | `icon` accepts `IconType`                             |
| Label class      | `p-avatar-label`              | `p-avatar-label`                | `p-avatar-text`                                       |
| ARIA inputs      | `ariaLabel`, `ariaLabelledBy` | `ariaLabel`, `ariaLabelledby`   | none (spread props)                                   |
| Theming          | `@primeuix` tokens            | `@primeuix` tokens              | own CSS, no tokens                                    |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/avatar/avatar.ts`
- `primeng-21.1.9:packages/primeng/src/avatar/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/avatar/style/avatarstyle.ts`
- `primeng-21.1.9:packages/primeng/src/avatargroup/avatargroup.ts`
- `primeng-21.1.9:packages/primeng/src/avatargroup/style/avatargroupstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/avatar/avatar.types.ts`
- `primeng-21.1.9:packages/primeng/src/types/avatargroup/avatargroup.types.ts`
- `primeng-21.1.9:apps/showcase/doc/avatar/` (`import-doc.ts`, `label-doc.ts`, `icon-doc.ts`, `image-doc.ts`, `badge-doc.ts`, `shape-doc.ts`, `size-doc.ts`, `template-doc.ts`, `avatargroup-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/avatar/Avatar.vue`
- `primevue-4.5.5:packages/primevue/src/avatar/BaseAvatar.vue`
- `primevue-4.5.5:packages/primevue/src/avatar/Avatar.d.ts`
- `primevue-4.5.5:packages/primevue/src/avatar/style/AvatarStyle.js`
- `primevue-4.5.5:packages/primevue/src/avatargroup/AvatarGroup.vue`
- `primevue-4.5.5:packages/primevue/src/avatargroup/BaseAvatarGroup.vue`
- `primevue-4.5.5:packages/primevue/src/avatargroup/AvatarGroup.d.ts`
- `primevue-4.5.5:packages/primevue/src/avatargroup/style/AvatarGroupStyle.js`
- `primevue-4.5.5:apps/showcase/doc/avatar/` (`ImportDoc.vue`, `LabelDoc.vue`, `IconDoc.vue`, `ImageDoc.vue`, `AvatarGroupDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/avatar/Avatar.js`
- `primereact-10.9.9:components/lib/avatar/AvatarBase.js`
- `primereact-10.9.9:components/lib/avatar/avatar.d.ts`
- `primereact-10.9.9:components/lib/avatargroup/AvatarGroup.js`
- `primereact-10.9.9:components/lib/avatargroup/AvatarGroupBase.js`
- `primereact-10.9.9:components/lib/avatargroup/avatargroup.d.ts`
- `primereact-10.9.9:components/doc/avatar/` (`importdoc.js`, `labeldoc.js`, `icondoc.js`, `imagedoc.js`, `groupdoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/avatar/index.mjs`
- `@primeuix/themes-2.0.3:types/avatar/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/avatar/index.mjs`
