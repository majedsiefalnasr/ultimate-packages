# Prime catalog

Generated JSON, one file per framework, holding the API facts each pinned Prime archive publishes in its showcase apidoc index. Do not edit these files; regenerate them.

| File              | Source                                                      |
| ----------------- | ----------------------------------------------------------- |
| `primeng.json`    | `primeng-21.1.9:apps/showcase/doc/apidoc/index.json`        |
| `primevue.json`   | `primevue-4.5.5:apps/showcase/doc/common/apidoc/index.json` |
| `primereact.json` | `primereact-10.9.9:components/doc/common/apidoc/index.json` |

## Regenerate and check

```sh
node scripts/prime-reference/generate-catalog.mjs          # write the three files
node scripts/prime-reference/generate-catalog.mjs --check  # exit 1 when stale
node --test scripts/prime-reference/*.test.mjs             # determinism + freshness
```

The generator reads the apidoc straight out of the `.tar.gz` archives in `.vendor-cache/` after verifying each archive's SHA-256 against `docs/architecture/checksums.json`. A missing archive or a mismatch stops it. Fetch archives with `pnpm run vendor:fetch -- primeng primevue primereact`. The cache is looked up in `--vendor-dir`, then `$PRIME_VENDOR_CACHE`, then `<checkout>/.vendor-cache`, then the main checkout's `.vendor-cache` (for git worktrees).

## Schema (`schemaVersion` 1)

```json
{
  "header": {
    "archive": ".vendor-cache/<file>.tar.gz",
    "archiveSha256": "<verified sha256>",
    "commit": "<pinned git commit>",
    "counts": { "components": 0, "modules": 0 },
    "generator": "scripts/prime-reference/generate-catalog.mjs",
    "package": "primeng | primevue | primereact",
    "schemaVersion": 1,
    "source": "<package>-<version>:<apidoc path>",
    "version": "<pinned version>"
  },
  "modules": { "<upstream module key>": {} }
}
```

`counts.components` is the number of entries under every module's `components` key; `counts.modules` is the number of upstream module keys.

Each module keeps its framework's own apidoc structure, changed only by these rules:

1. **No prose.** Every `description`, `eventDescription`, `methodDescription` and `typeDescription` key is removed.
2. **Sections unwrapped.** An upstream `{ "description", "values" }` wrapper becomes its `values`. `components.Button.props.values[]` is written as `components.Button.props[]`; a PrimeVue or PrimeReact type alias `types.values.Foo.values` is written as `types.Foo` (a string).
3. **Empty values omitted.** Empty strings (upstream's "no default"), `null`, `[]` and `{}` are dropped. Modules and components whose content is empty remain as `{}` so that their names are still listed.
4. **`deprecated` is one line.** Only the first line is kept; later lines repeat prose.
5. **Type strings are plain text.** Showcase `<span>` markup is removed, `&rArr;` becomes `=>`, `// comment` text inside multi-line object types is dropped, and multi-line values are folded onto one line.
6. **Stable order.** Object keys are sorted. Arrays of named entries (by `name`, or `class` for style classes) are sorted by that key. `parameters` keeps upstream order because it is a call signature.

Output is 2-space JSON with a trailing newline and no timestamps; it is Prettier-clean.

## Shape per framework

The three apidoc indexes are not shaped alike. Typical paths inside `modules.<key>`:

| Fact                     | PrimeNG                                               | PrimeVue                                                      | PrimeReact                                 |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| Inputs / props           | `components.<Class>.props[]`                          | `interfaces.<Name>Props.props[]`                              | `components.<Name>.props[]`                |
| Outputs / emits / events | `components.<Class>.emits[]`                          | `interfaces.<Name>EmitsOptions.methods[]`                     | `components.<Name>.callbacks[]`, `events`  |
| Templates / slots        | `components.<Class>.templates[]`, `types.templates[]` | `interfaces.<Name>Slots.methods[]`                            | (props typed `ReactNode` / template types) |
| Public methods           | `components.<Class>.methods[]`                        | `interfaces.<Name>Methods.methods[]`                          | `components.<Name>.methods[]`              |
| Interfaces               | `types.interfaces[]`, `interfaces[]`                  | `interfaces.<Name>`                                           | `interfaces.<Name>`                        |
| Type aliases             | `types.types[]`                                       | `types.<Name>`                                                | `types.<Name>`                             |
| Style classes            | `style.classes[]` (same module)                       | `enumerations.<Name>Classes.members[]` (`<name>style` module) | N/A (not in the apidoc)                    |
| Design tokens            | N/A (not in the apidoc)                               | `tokens` (every entry empty upstream, so omitted)             | N/A                                        |

Design tokens are not in any apidoc index; see `docs/prime-reference/foundations/primeuix.md` for the `@primeuix/themes` token layers.
