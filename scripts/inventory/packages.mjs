import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, posix, relative } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Observe directory-generated entries rather than guessing from variable names or
// treating every source directory as public. Only the build's read-only directory
// discovery and tsup configuration declaration are available to this evaluation.
function observedEntries(text, root, path) {
  const output = {};
  const code = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(
    code,
    {
      exports: output,
      require(name) {
        if (name === "tsup") return { defineConfig: (config) => config };
        if (name === "node:fs")
          return {
            readdirSync(directory, options) {
              const base = resolve(root, path);
              const target = resolve(base, directory);
              if (relative(base, target).startsWith(".."))
                throw new Error("Directory outside package");
              return readdirSync(target, options).sort((a, b) =>
                (typeof a === "string" ? a : a.name).localeCompare(
                  typeof b === "string" ? b : b.name
                )
              );
            },
          };
        throw new Error(`Unsupported build import: ${name}`);
      },
    },
    { timeout: 1000 }
  );
  const configs = Array.isArray(output.default) ? output.default : [output.default];
  return configs.flatMap((config) => {
    if (!config?.entry || Array.isArray(config.entry) || typeof config.entry !== "object")
      throw new Error("Unsupported build entry declaration");
    return Object.entries(config.entry).map(([key, source]) => {
      if (typeof source !== "string") throw new Error("Unsupported build entry source");
      return [key, `${path}/${source}`];
    });
  });
}

// Package topology is not an item/component census. Fine-grained authored records
// remain in the pilot schema; these reservations allocate later coverage work.
export function reconcilePackages({ root, input }) {
  const problems = [];
  const read = (p) => readFileSync(resolve(root, p), "utf8");
  const json = (p) => JSON.parse(read(p));
  const walk = (p) =>
    readdirSync(resolve(root, p), { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((e) => {
        // Angular CLI caches and Storybook build output are generated artifacts,
        // not source roots (packages/ng/angular.json declares storybook-static).
        // Do not consult gitignore: ignored source-only helpers still need owners.
        if (
          [
            "node_modules",
            "dist",
            ".git",
            "coverage",
            ".storybook",
            ".angular",
            "storybook-static",
            ".DS_Store",
          ].includes(e.name)
        )
          return [];
        const path = `${p}/${e.name}`;
        return e.isDirectory() ? walk(path) : e.isFile() ? [path] : [];
      });
  const packages = [],
    families = [],
    entries = [];
  for (const dir of readdirSync(resolve(root, "packages"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const path = `packages/${dir.name}`,
      files = walk(path);
    const manifestPath = `${path}/package.json`;
    const manifest = existsSync(resolve(root, manifestPath)) ? json(manifestPath) : null;
    const id = manifest
      ? `package.${manifest.name.replace(/^@/, "").replaceAll("/", ".")}`
      : `package.reserved.${dir.name}`;
    const sources = files.filter(
      (p) =>
        /\.(?:[cm]?[jt]sx?|vue|css|scss|json|md)$/.test(p) &&
        !/(?:^|\/)(?:test|tests|e2e|scripts)\//.test(p) &&
        !/\.(?:test|spec|stories)\./.test(p) &&
        !/(?:config|package|tsconfig|ng-package)\.[^/]+$/.test(p) &&
        p !== `${path}/README.md` &&
        !p.endsWith("THIRD-PARTY-NOTICES.md")
    );
    const code = sources.filter((p) => /\.(?:[cm]?[jt]sx?|vue|css|scss)$/.test(p));
    packages.push({
      id,
      path,
      name: manifest?.name ?? dir.name,
      state: code.length ? "implemented" : "reserved-empty",
      placeholders: files.filter((p) => p.endsWith("/.gitkeep")),
      manifest: manifest ? manifestPath : null,
      supporting: files
        .filter((f) => !sources.includes(f))
        .map((path) => ({
          path,
          reason: path.endsWith("/.gitkeep")
            ? "Placeholder, not implementation evidence"
            : "Package documentation, configuration, build/test support or evidence; not independently classified as product items",
        })),
      build: manifest?.scripts?.build ?? null,
    });
    const groups = new Map();
    for (const file of sources) {
      const relative = file.slice(path.length + 1).replace(/^src\//, "");
      const family = relative.includes("/") ? relative.split("/")[0] : "root";
      if (!groups.has(family)) groups.set(family, []);
      groups.get(family).push(file);
    }
    for (const [name, owned] of groups)
      families.push({ id: `${id}.${name}`, package: id, name, files: owned });
    const addEntry = (subpath, source, origin, target = null) =>
      entries.push({ id: `${id}:${subpath}`, package: id, subpath, source, origin, target });
    const buildSources = new Map();
    const tsup = `${path}/tsup.config.ts`;
    if (existsSync(resolve(root, tsup))) {
      const text = read(tsup);
      for (const match of text.matchAll(
        /(?:"([^"\n]+)"|\b(index|bin[\w-]*))\s*:\s*"((?:src|lib)\/[^"\n]+)"/g
      ))
        buildSources.set(match[1] ?? match[2], `${path}/${match[3]}`);
      if (Object.keys(manifest?.exports ?? {}).some((key) => key.includes("*"))) {
        try {
          const observed = observedEntries(text, root, path);
          buildSources.clear();
          for (const [key, source] of observed) buildSources.set(key, source);
        } catch (error) {
          buildSources.clear();
          problems.push({
            kind: "entry",
            subject: id,
            detail: `Cannot observe wildcard build entries: ${error.message}`,
          });
        }
      }
    }
    const ngEntries = files.filter((f) => f.endsWith("/ng-package.json"));
    for (const ng of ngEntries) {
      const base = posix.dirname(ng),
        subpath = base === path ? "." : `./${base.slice(path.length + 1)}`;
      const source = posix.normalize(`${base}/${json(ng).lib?.entryFile ?? "src/public_api.ts"}`);
      buildSources.set(subpath === "." ? "index" : `${subpath.slice(2)}/index`, source);
    }
    const exports = manifest?.exports;
    const publicEntries =
      typeof exports === "string" ||
      (exports && !Object.keys(exports).some((k) => k.startsWith(".")))
        ? { ".": exports }
        : (exports ?? {});
    const mapped = new Set();
    for (const [subpath, target] of Object.entries(publicEntries)) {
      if (subpath.includes("*")) {
        const targets = (value) =>
          typeof value === "string"
            ? [value]
            : value && typeof value === "object"
              ? Object.values(value).flatMap(targets)
              : [];
        const leaves = targets(target);
        const candidates = [...buildSources].filter(([key]) => key !== "index");
        if (
          subpath !== "./*" ||
          !leaves.length ||
          leaves.some(
            (leaf) => !/^\.\/dist\/\*\/index\.(?:mjs|js|cjs|d\.mts|d\.ts|d\.cts)$/.test(leaf)
          ) ||
          !candidates.length ||
          candidates.some(([key]) => !/^[^/*]+\/index$/.test(key))
        ) {
          problems.push({
            kind: "entry",
            subject: `${id}:${subpath}`,
            detail: "Unsupported or unobserved wildcard export mapping",
          });
          continue;
        }
        for (const [key, source] of buildSources)
          if (key !== "index") {
            const name = key.replace(/\/index$/, "");
            const expanded = subpath.replace("*", name);
            // Exact declarations take precedence even when they block public access.
            if (Object.hasOwn(publicEntries, expanded)) continue;
            addEntry(expanded, source, "manifest-pattern", target);
            mapped.add(key);
          }
        continue;
      }
      if (target === null) continue;
      const key = subpath === "." ? "index" : `${subpath.slice(2)}/index`;
      let source = buildSources.get(key);
      if (!source) {
        const candidates =
          typeof target === "string" && !target.includes("dist/")
            ? [`${path}/${target.replace(/^\.\//, "")}`]
            : [`${path}/src/${subpath === "." ? "index.ts" : `${subpath.slice(2)}/index.ts`}`];
        source = candidates.find((p) => existsSync(resolve(root, p))) ?? null;
      }
      addEntry(subpath, source, "manifest", target);
      mapped.add(key);
    }
    for (const [key, source] of buildSources)
      if (!mapped.has(key))
        addEntry(
          key === "index" ? "." : `./${key.replace(/\/index$/, "")}`,
          source,
          ngEntries.length ? "ng-packagr-generated" : "build-only"
        );
    for (const [name, target] of Object.entries(
      typeof manifest?.bin === "string" ? { [manifest.name]: manifest.bin } : (manifest?.bin ?? {})
    ))
      addEntry(
        `bin:${name}`,
        buildSources.get(posix.basename(target).replace(/\.[^.]+$/, "")) ??
          `${path}/src/${posix.basename(target).replace(/\.[^.]+$/, ".ts")}`,
        "binary",
        target
      );
    for (const e of entries.filter((e) => e.package === id))
      if (!e.source || !existsSync(resolve(root, e.source)))
        problems.push({
          kind: "entry",
          subject: e.id,
          detail: "Public/build entry has no existing source mapping",
        });
  }
  for (const item of [...packages, ...families]) {
    const owners = (input.ownership ?? []).filter((o) => o.id === item.id);
    if (
      owners.length !== 1 ||
      (!owners[0].reason?.trim() &&
        !(
          owners[0].tickets?.length &&
          owners[0].tickets.every((n) => input.tickets?.some((t) => t.number === n))
        ))
    )
      problems.push({
        kind: "coverage",
        subject: item.id,
        detail: "Expected one live-ticket owner or reasoned exclusion",
      });
    item.coverage = owners[0] ?? null;
  }
  for (const owner of input.ownership ?? [])
    if (![...packages, ...families].some((i) => i.id === owner.id))
      problems.push({
        kind: "coverage",
        subject: owner.id,
        detail: "Ownership refers to undiscovered identity",
      });
  const pending = [...packages, ...families]
    .filter((i) => i.coverage?.tickets?.length)
    .map((i) => ({
      id: i.id,
      batch: i.coverage.tickets.map((n) => `#${n}`).join(", "),
      reason: "Detailed inventory coverage pending owning ticket",
    }));
  if (input.closeout && pending.length)
    problems.push({
      kind: "reference",
      subject: input.scope,
      detail: "Global closeout rejects unresolved coverage reservations",
    });
  const facts = { packages, families, entries, pending };
  const views = {
    "packages.json": JSON.stringify(facts, null, 2) + "\n",
    "packages.md":
      "# Platform package reconciliation\n\nGenerated topology, not component counts or completed item inventory. All ticket-owned coverage is pending.\n\n" +
      packages
        .map(
          (p) =>
            `## ${p.name}\n\n${p.id}; ${p.state}; ${p.path}\n\nCoverage: ${p.coverage?.tickets?.map((n) => `#${n}`).join(", ") ?? p.coverage?.reason ?? "UNOWNED"}\n\n` +
            families
              .filter((f) => f.package === p.id)
              .map(
                (f) =>
                  `- ${f.id}: ${f.coverage?.tickets?.map((n) => `#${n}`).join(", ") ?? f.coverage?.reason ?? "UNOWNED"} (pending)`
              )
              .join("\n") +
            "\n\n" +
            entries
              .filter((e) => e.package === p.id)
              .map((e) => `- Entry ${e.subpath}: ${e.source ?? "UNRESOLVED"} (${e.origin})`)
              .join("\n")
        )
        .join("\n\n") +
      "\n",
  };
  return { problems, complete: input.closeout === true && !problems.length, facts, views };
}
