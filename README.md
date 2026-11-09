# pedromasbuitrago.com

My personal blog for all my scientific and software research.

**Live:** [www.pedromasbuitrago.com](https://www.pedromasbuitrago.com/)

Built with [Astro](https://astro.build/) 5, React, TailwindCSS and TypeScript, deployed on
Vercel.

## Content

Content lives in two collections under `src/content/`, both validated by Zod schemas in
`src/content/config.ts`. Add a post by dropping a Markdown file into the right folder — the
filename becomes the URL slug.

| Collection | Folder                  | URL           | Purpose                        |
| :--------- | :---------------------- | :------------ | :----------------------------- |
| `blog`     | `src/content/blog/`     | `/posts/…`    | Papers and research write-ups  |
| `software` | `src/content/software/` | `/software/…` | Tools, catalogues and datasets |

Beyond the usual title/date/tags, the schemas carry academic metadata:

- **Papers** (`blog`): `authors`, `doi`, `arxiv`, `journal`, `volume`, `pages`, `bibtex`.
  Set `isPaper: true` to render the citation box.
- **Software**: `repo`, `docs`, `demo`, `pypi`, `npm`, `license`. Point `catalogue` at a CSV
  to get an interactive data preview on the page.

Set `draft: true` to keep something out of the build, `featured: true` to surface it on the
home page.

## MagicPlotter runs in the browser

The [MagicPlotter](https://github.com/pedromasb/magicplotter) Streamlit app is embedded on
its own software page and runs **entirely client-side**, compiled to WebAssembly by
[stlite](https://github.com/whitphx/stlite) on Pyodide. There is no server: nothing a
visitor uploads leaves their machine.

Any software entry can do this — point the `app` frontmatter field at an stlite manifest and
`src/components/StliteApp.astro` handles the rest.

The Python source is **vendored** in `public/magicplotter/`, with the upstream commit it was
copied from recorded in `public/magicplotter/manifest.json`. To pull in upstream changes,
re-copy the files and update that commit.

Two files differ from upstream, both behind an `IS_WASM` guard
(`sys.platform == "emscripten"`) so the same source still runs unchanged on a server:

- `mp_core.py` — PDF/PNG export needs Kaleido, which needs Chromium, which does not exist
  under Pyodide. Those buttons are swapped for the chart toolbar's client-side SVG export.
  HTML export is pure Python and works fine.
- `Hello.py` — the data-privacy notice describes the browser build instead of Streamlit's
  client/server model.

## Running locally

Requires **Node 24** (see `engines` in `package.json`).

```bash
npm install
npm run dev     # http://localhost:4321
```

Or with Docker:

```bash
docker compose up -d
```

| Command                | Action                                        |
| :--------------------- | :-------------------------------------------- |
| `npm run dev`          | Dev server at `localhost:4321`                |
| `npm run build`        | Production build                              |
| `npm run preview`      | Preview the production build locally          |
| `npm run sync`         | Regenerate TypeScript types for Astro modules |
| `npm run lint`         | Lint with ESLint                              |
| `npm run format`       | Format with Prettier                          |
| `npm run format:check` | Check formatting without writing              |

## Environment variables

Only the thesis chat endpoint (`src/pages/api/ask.ts`) needs these. The rest of the site is
static and builds without them.

| Variable           | Required | Purpose                               |
| :----------------- | :------- | :------------------------------------ |
| `PINECONE_API_KEY` | yes      | Vector search over the thesis         |
| `OPENAI_API_KEY`   | yes      | Answer generation                     |
| `PINECONE_INDEX`   | no       | Index name, defaults to `thesis-chat` |
| `COHERE_API_KEY`   | no       | Reranking, skipped when unset         |

The embeddings and chunked thesis text they query live in `chatbot/`.

## Deployment

Deployed on Vercel via `@astrojs/vercel`. The site is static apart from the `/api/ask`
endpoint, which is prerendered off and runs as a serverless function.

The Node version is pinned to `24.x` through `engines` in `package.json`, which **overrides
the Vercel dashboard setting** — change it there, not in the dashboard.

## Credits

Built on the [AstroPaper](https://github.com/satnaing/astro-paper) theme by
[Sat Naing](https://satnaing.dev), MIT licensed — see [LICENSE](LICENSE).
