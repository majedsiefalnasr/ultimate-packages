// GAP-098 (Spec §4.1 R1 / Amendment A1): Angular moves overlay, panel and mask
// elements to <body> (`uOverlay` / `appendTo`), outside the component root.
// The per-component box-model rule covers them only if the moved element binds
// a scope-key class. This static guard fails closed on any new reparenting
// site that does not.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const NG_SRC = join(__dirname, "..", "..", "ng", "src");
const SCOPE_KEY = /^(root|overlay|panel|mask|list)$|(Root|Overlay|Mask)$/; // mirrors uix-styled box-model.ts (Amendment A2)
// Measured on 2026-10-15; a change needs review, not a silent pass.
const EXPECTED_TEMPLATE_SITES = 15;
const EXPECTED_BODY_APPENDS = 1;

const OPEN_TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*\/?>/g;

interface Site {
  file: string;
  tag: string;
  attrs: string;
  rest: string;
}

function componentSources(): { file: string; text: string }[] {
  return readdirSync(NG_SRC, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .flatMap((dir) =>
      readdirSync(join(NG_SRC, dir.name))
        .filter((name) => name.endsWith(".ts") && !/\.(spec|stories)\.ts$/.test(name))
        .map((name) => ({
          file: `${dir.name}/${name}`,
          text: readFileSync(join(NG_SRC, dir.name, name), "utf8"),
        }))
    );
}

function templatesOf(text: string): string[] {
  return [...text.matchAll(/template:\s*`([\s\S]*?)`/g)].map((match) => match[1]);
}

function reparentingSites(file: string, template: string): Site[] {
  const sites: Site[] = [];
  for (const match of template.matchAll(OPEN_TAG)) {
    const attrs = match[2];
    if (/(^|\s)uOverlay(\s|=|$)/.test(attrs) || /(^|\s)\[?appendTo\]?\s*=/.test(attrs)) {
      sites.push({
        file,
        tag: match[1],
        attrs,
        rest: template.slice(match.index + match[0].length),
      });
    }
  }
  return sites;
}

function boundKey(attrs: string): string | undefined {
  return /\[class\]\s*=\s*"cx\('([^']+)'/.exec(attrs)?.[1];
}

/** Menu (named exception): the class-less wrapper renders `#menuPanel` via ngTemplateOutlet. */
function templateOutletKey(site: Site, template: string): string | undefined {
  const child = new RegExp(OPEN_TAG.source).exec(site.rest);
  const outlet = child && /\[ngTemplateOutlet\]\s*=\s*"(\w+)"/.exec(child[2])?.[1];
  if (!outlet) return undefined;
  const at = template.search(new RegExp(`<ng-template\\s+#${outlet}[\\s>]`));
  if (at < 0) return undefined;
  const afterTemplate = template.slice(template.indexOf(">", at) + 1);
  const first = new RegExp(OPEN_TAG.source).exec(afterTemplate);
  return first ? boundKey(first[2]) : undefined;
}

describe("GAP-098 Angular reparenting coverage", () => {
  const sources = componentSources();

  it("every uOverlay/appendTo element binds a scope-key class", () => {
    const sites: string[] = [];
    for (const { file, text } of sources) {
      for (const template of templatesOf(text)) {
        for (const site of reparentingSites(file, template)) {
          let key = boundKey(site.attrs);
          if (key === undefined) {
            expect(file, `${file}: class-less reparenting wrapper`).toBe("menu/menu.ts");
            key = templateOutletKey(site, template);
          }
          expect(key, `${file} <${site.tag}> binds no cx() class`).toBeDefined();
          expect(key!, `${file} <${site.tag}> binds non-scope key ${key}`).toMatch(SCOPE_KEY);
          sites.push(`${file}:${key}`);
        }
      }
    }
    expect(sites.length, sites.join(", ")).toBe(EXPECTED_TEMPLATE_SITES);
  });

  it("every code-path append to <body> is allowlisted and pins its scope class", () => {
    const appends = sources.flatMap(({ file, text }) =>
      [...text.matchAll(/appendChild\(\s*([^,)]+)[,)]|body\.appendChild\(/g)]
        .filter((match) => match[0].startsWith("body.") || /body/.test(match[1] ?? ""))
        .map(() => file)
    );
    expect(appends).toEqual(["tooltip/tooltip.ts"]);
    expect(appends.length).toBe(EXPECTED_BODY_APPENDS);
    const tooltip = sources.find(({ file }) => file === "tooltip/tooltip.ts")!.text;
    expect(tooltip).toMatch(
      /setAttribute\(\s*container,\s*"class",\s*this\.cx\("root"\)\s*\?\?\s*""\s*\)/
    );
  });

  it("reports a reparenting element without a scope class (proof the guard can fail)", () => {
    const [site] = reparentingSites("fixture.ts", `<div uOverlay appendTo="body" class="x"></div>`);
    expect(boundKey(site.attrs)).toBeUndefined();
    const [bad] = reparentingSites("fixture.ts", `<div uOverlay [class]="cx('header')"></div>`);
    expect(boundKey(bad.attrs)).not.toMatch(SCOPE_KEY);
  });
});
