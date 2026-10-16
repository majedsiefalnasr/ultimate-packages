# Third-Party Notices

This package incorporates source derived from `primereact@10.9.9`: library source from `components/lib` (never the repository's Next.js showcase app) and, for two stylesheets (`chip-style.ts`, `tag-style.ts`), declaration values from the PrimeReact saga-blue and tailwind-light theme CSS, which the `primereact` package distributes as `resources/themes` (built from the repository's `public/themes` by its `gulp build-themes` task). It also retains a statement from `primeng@21.1.9`. Per-file lineage is recorded in `docs/architecture/provenance/react.json`.

## PrimeReact

MIT License

Copyright (c) 2016-2025 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**Note:** PrimeReact 11 (`11.1.0`) is architectural reference only — commercially licensed, not incorporated. Only PrimeReact 10.9.9 source may be incorporated here.

## PrimeNG

`docs/architecture/provenance/react.json` records `packages/react/src/chip/chip.tsx` as retaining a statement from `primeng@21.1.9` `packages/primeng/src/chip/chip.ts` (source class COPY under ADR-064).

MIT License (PrimeNG Community Versions License section)

Copyright (c) 2016-2026 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

PrimeNG ships a dual-license `LICENSE.md`; only its Community Versions (MIT) section, reproduced here, applies to the pinned `primeng@21.1.9` (no `-lts` suffix). The commercial LTS section does not apply and is not reproduced.

**Scope of this notice:** the per-file lineage above is recorded from repository evidence. Whether any further notice is required is a legal question this repository does not determine; legal review before external distribution applies where company policy requires it (Blueprint §8).

See `docs/architecture/PROVENANCE.md` for full provenance detail.
