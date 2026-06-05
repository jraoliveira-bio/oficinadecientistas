# CLAUDE.md

Guia para agentes de IA (e humanos) trabalharem no projeto **Oficina de Cientistas**.
Escrito em português porque todo o projeto — código, conteúdo e público-alvo — é em pt-BR.

> Para escrever/editar **aulas** (conteúdo MDX, componentes editoriais, citações),
> veja o guia dedicado: [`docs/autoria-aulas.md`](docs/autoria-aulas.md).

---

## 1. O que é o projeto

Site educacional gratuito voltado a alunos de pós-graduação (e curiosos), focado em
**escrita científica**. Tem três frentes:

1. **Cursos** — atualmente o curso "Escrita Científica: Da Estrutura ao Impacto",
   composto por **aulas** em vídeo + texto longo (formato "livro digital" com
   componentes editoriais ricos).
2. **Blog "A Prancheta" / "Os Bastidores"** — diário de desenvolvimento do próprio site.
3. **Sobre** — manifesto, quem sou eu, visão de futuro etc.

Autor/desenvolvedor: João Rafael Alves de Oliveira (biólogo, não-programador de formação).
O projeto vinha sendo desenvolvido com ajuda de IA **por chat**; estes docs existem para
que agentes consigam trabalhar direto no repositório com contexto suficiente.

### Visão e direção — LEIA antes de qualquer decisão de design/arquitetura

- **É uma plataforma multi-curso, não "o curso de escrita".** A meta é reunir vários cursos
  essenciais para um pesquisador em formação (escrita, **estatística**, **ecologia**, …). O
  curso de **Escrita Científica é só o primeiro**. Ao estruturar qualquer coisa, pense em
  escala/repetição para N cursos — **não amarre arquitetura ao curso de escrita**. (Ex.: a
  "grade curricular" hardcoded e o menu de aulas deveriam, no futuro, ser data-driven por coleção.)
- **Status: alfa.** Muita coisa vai mudar. As **vídeo-aulas atuais são antigas e placeholder** —
  não trate o conteúdo/SEO/transcrições delas como definitivos.
- **Identidade = personalidade humana, de propósito.** Na era de enxurrada de conteúdo de IA
  genérico, o diferencial é parecer *feito por uma pessoa*: ilustrações autorais (o gato, as
  charges), voz própria, toques editoriais. Ao sugerir mudanças, **preserve e reforce a
  pessoalidade** — não "limpe" o site rumo a um template neutro/corporativo.
- **Site ↔ Blog = "espelho estranho" (relação INTENCIONAL).** O blog não é um site à parte por
  acidente: é um reflexo deliberado do site principal, com **inversões** — a *cor de destaque*
  do site vira a *cor base* do blog, entre outras trocas. Devem ser **parecidos, mas diferentes**.
  Logo, a separação dos dois design systems é proposital: **não unifique a marca achatando um no
  outro**. (Para o "espelho" ser legível, o ideal é inverter sobretudo a **cor** e manter
  estrutura/hierarquia/tipografia "rimando" entre os dois.)

---

## 2. Stack e comandos

- **Framework:** [Astro](https://astro.build) v5 (`output: 'static'` — site 100% estático).
- **Conteúdo:** MDX (`@astrojs/mdx`) + Content Collections.
- **Sem framework de UI** (sem React/Vue/Svelte). Interatividade = `<script>` vanilla JS.
- **Sem TypeScript estrito** — usa `jsconfig.json` (não há `tsconfig.json`). Há tipos `.ts`
  pontuais (`src/lib/*.ts`) mas o grosso é `.astro` + JS.
- **Sem CSS framework / sem build de CSS** — CSS escrito à mão (global + `<style>` por componente).

```bash
npm install      # instala dependências
npm run dev      # servidor de desenvolvimento (http://localhost:4321/oficinadecientistas)
npm run build    # gera dist/ estático
npm run preview  # serve o dist/ localmente
```

> ⚠️ No dev e no site publicado a aplicação vive **sob o caminho base
> `/oficinadecientistas`** (ver seção 4). A raiz `/` não serve o site.

---

## 3. Deploy

- **GitHub Pages.** `site: 'https://jraoliveira-bio.github.io'`, `base: '/oficinadecientistas'`.
- CI em `.github/workflows/deploy.yml`: a cada **push na `main`**, roda `npm ci` →
  `npm run build` → publica `dist/` no Pages. Node 18.
- `.nojekyll` na raiz impede o Jekyll de mexer no output.
- **Não há ambiente de staging.** Push na `main` = publicar em produção.

---

## 4. ⚠️ Regra de ouro: SEMPRE prefixe links e assets com a `base`

Como o site é servido em `/oficinadecientistas/...`, **todo** link interno e caminho de
asset precisa incluir esse prefixo, senão quebra em produção (e no dev). Há **dois jeitos**
em uso no código — mantenha o padrão do arquivo onde estiver mexendo:

**a) Helper `withBase()` — usado no blog** (`src/lib/url.ts`):
```astro
---
import { withBase } from "@/lib/url";
---
<a href={withBase("blog")}>Blog</a>
<img src={withBase("img/logo5.png")} />
```

**b) Cálculo inline da `base` — usado no site principal** (Layout, Header, páginas, home):
```astro
---
const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : import.meta.env.BASE_URL + '/';
---
<a href={`${base}cursos/`}>Cursos</a>
<img src={`${base}logo2.png`} />
```

Esse trecho de `base` aparece copiado em ~10 arquivos. Prefira reutilizá-lo igual ao redor;
não invente um terceiro padrão. Em componentes MDX use `<Image src="imagens/x.png" />`
(o `Image.astro` já aplica a base) ou importe a imagem como módulo (`import x from '~/../public/...'`).

---

## 5. Aliases de import

Existem **dois aliases que apontam para o mesmo `src/`** (resquício histórico — ambos funcionam):

| Alias | Onde é definido | Quem usa |
|-------|-----------------|----------|
| `~/*` → `src/*` | `jsconfig.json` | Site principal (Layout, páginas de curso, componentes, MDX das aulas) |
| `@/*` → `src/*` | `astro.config.mjs` (Vite `resolve.alias`) | Blog (layouts/components/lib do blog) |

Ambos resolvem `src`. Ao editar um arquivo, **siga o alias que ele já usa**. Para importar
um asset de `public/` como módulo, o padrão no projeto é `~/../public/imagens/arquivo.png`.

---

## 6. Mapa do repositório

```
oficinadecientistas/
├─ astro.config.mjs      # site/base, integração MDX, rehype-citations, alias @→src
├─ jsconfig.json         # alias ~→src
├─ package.json
├─ .github/workflows/deploy.yml
├─ public/               # servido como está (NÃO passa por bundler)
│  ├─ estilos.css        # ★ CSS GLOBAL do site principal (~930 linhas)
│  ├─ imagens/           # imagens das aulas e home (inclui .psd de trabalho)
│  ├─ img/               # favicons do blog + logos
│  ├─ js/blog-index-expand.js
│  └─ logo*.png, favicon*, site.webmanifest
└─ src/
   ├─ content.config.ts  # schemas Zod das coleções (curso-escrita, blog)
   ├─ pages/             # rotas (ver seção 7)
   ├─ layouts/           # Layout / AulaLayout / BlogLayout (ver seção 8)
   ├─ components/
   │  ├─ Header.astro, Footer.astro
   │  ├─ <componentes editoriais MDX>   # → docs/autoria-aulas.md
   │  ├─ Cite.astro, ReferenceList.astro  # citações (ver seção 9)
   │  ├─ home/           # cards e seções da home
   │  └─ secoes-sobre/   # blocos da página Sobre
   ├─ content/
   │  ├─ curso-escrita/  # aulas .mdx  → coleção "curso-escrita"
   │  └─ blog/           # posts .mdx  → coleção "blog"
   ├─ data/conceitos.json   # dados consumidos por Table.astro
   ├─ lib/url.ts, lib/blog-utils.ts
   ├─ plugins/
   │  ├─ rehype-citations.mjs      # registrado no astro.config (ver seção 9)
   │  └─ remark-cite-to-html.mjs   # NÃO registrado — legado/dormiente
   ├─ scripts/citations-hydrate.js # constrói a lista de referências no cliente
   └─ styles/            # tokens.css, base.css, blog-index.css, citations.css
```

---

## 7. Rotas (`src/pages/`)

| Arquivo | URL (sob a base) | Observação |
|---------|------------------|------------|
| `index.astro` | `/` | Home |
| `sobre/index.astro` | `/sobre/` | Compõe blocos de `components/secoes-sobre/` |
| `cursos/index.astro` | `/cursos/` | Vitrine de cursos |
| `cursos/curso-escrita/index.astro` | `/cursos/curso-escrita/` | Landing do curso (intro + grade) |
| `cursos/curso-escrita/[slug].astro` | `/cursos/curso-escrita/<slug>/` | Renderiza cada aula via `AulaLayout` |
| `blog/index.astro` | `/blog/` | Índice com expansão inline + filtro de tags |
| `blog/[slug].astro` | `/blog/<slug>/` | Post individual |

**Links de menu sem página correspondente (pendência):** o `Header.astro` aponta para
`/aulas-especiais/` e `/links/`, que **ainda não existem**. Não são bugs introduzidos — são
seções planejadas. Não remova sem confirmar com o autor.

---

## 8. Os dois "mundos" de layout (isolados de propósito)

Há **dois sistemas de estilo deliberadamente separados** para o site não "vazar" no blog:

### Site principal — `Layout.astro`
- Carrega o **CSS global** `public/estilos.css` (a maior parte do visual do site mora aqui).
- Carrega fontes via Google Fonts (Lora, Source Sans Pro, Special Elite, Courier Prime, Lato).
- Inclui o **script de hidratação de citações** (ver seção 9).
- `AulaLayout.astro` **envolve** `Layout.astro` e adiciona: menu lateral de aulas (ordenado
  por `ordem`, filtrando `menu: true`), botão **"Modo leitura"** (esconde o menu; estado em
  `localStorage` sob a chave `oficina.modoLeitura`) e a infra de citações.

### Blog — `BlogLayout.astro`
- **Não herda** `Layout.astro`. É autocontido.
- Carrega o **design system próprio**: `styles/tokens.css` (variáveis `--oc-*`) + `styles/base.css`.
- Fontes próprias (Oswald, Lora, Montserrat) e **favicons próprios** (`public/img/favicons/blog*`).
- **Não** tem sistema de citações.

> Regra prática: estilizou algo no site principal? É em `public/estilos.css` ou no `<style>`
> do componente. Estilizou algo no blog? Use os tokens `--oc-*` e os CSS de `src/styles/`.
>
> A diferença visual entre os dois é **proposital** — o "espelho estranho" da seção 1 (a cor de
> destaque do site vira a cor base do blog, com outras inversões). Mantenha-os
> **parecidos-mas-invertidos**; não tente unificá-los.

---

## 9. Content Collections

Definidas em `src/content.config.ts` (API legada de content collections: `getCollection`,
`entry.slug`, `await entry.render()`).

### Coleção `curso-escrita` (as aulas)
Arquivos em `src/content/curso-escrita/`. **Slug** depende da forma do arquivo:
- `aula01/index.mdx` → slug **`aula01`** (pasta com `index.mdx`; preferido para aulas com assets).
- `introducao.mdx` → slug **`introducao`** (arquivo solto na raiz da coleção).

Campos do schema (todos opcionais têm default — não quebram conteúdo existente):
`title` (obrigatório), `description`, `shortTitle`, `menu` (bool, default `false` — controla
se aparece no menu lateral), `ordem` (int — ordem no menu), `tipo` (`'video'|'texto'`,
default `'video'` — define o ícone no menu), `draft`, `tags`, `updatedAt`, `references` (array — ver abaixo).

> **Pegadinha — dados de vídeo fora do schema:** `videoId`, `chapters` e `transcript`
> aparecem no frontmatter de várias aulas, mas **NÃO** estão no schema. Por isso
> `entry.data.videoId` é `undefined`. Eles são consumidos **dentro do MDX**, lendo o
> `frontmatter` cru e passando para o componente:
> ```mdx
> export const { videoId, chapters, transcript } = frontmatter;
> <VideoPlayer videoId={videoId} chapters={chapters} transcript={transcript} />
> ```
> Isso é intencional. Não tente ler vídeo via `getCollection(...).data`.

### Coleção `blog`
Arquivos `src/content/blog/AAAA-MM-DD-titulo.mdx`. Schema: `title`, `dataPublicacao`
(**`z.date()`** — use `AAAA-MM-DD` no frontmatter, sem aspas), `tags` (array, **obrigatório**),
`summary` (opcional). Helpers em `src/lib/blog-utils.ts` (`formatDate`, `countTags`, `groupByMonth`).

---

## 10. Sistema de citações (só funciona dentro de `AulaLayout`)

Para autores, é simples (detalhes em [`docs/autoria-aulas.md`](docs/autoria-aulas.md)):
1. Liste as fontes no frontmatter em `references:` (cada uma com `key`, `title`, `text` e,
   opcionalmente, `author`, `year`, `doi`, `url`, `scholar_query`).
2. No corpo, cite com `<Cite refKey="mayr1942" />` (vira um `[n]` clicável com popover).
3. Ponha `<ReferenceList />` onde a lista numerada deve aparecer.

### Como funciona por baixo (avançado — há dívida técnica aqui)
- `Cite.astro` renderiza `<cite class="oc-cite" data-key="...">`; `ReferenceList.astro`
  renderiza `<div class="oc-ref-list" data-ref-list>` (placeholders vazios).
- `AulaLayout` serializa `data.references` em `<meta id="oc-refs" data-refs="...">`
  (JSON + `encodeURIComponent`) e injeta `scripts/citations-hydrate.js`.
- **No cliente**, três scripts cooperam (com sobreposição):
  1. inline em `Layout.astro` — numera os `<cite>` e cria os botões `[n]` + popovers;
  2. `citations-hydrate.js` — preenche os popovers com o texto real e monta a `<ol>` em `[data-ref-list]`;
  3. inline em `AulaLayout.astro` — liga os cliques (abrir/fechar/posicionar popover) via `MutationObserver`.
- Estilos dos popovers/lista: `src/styles/citations.css`.

> **Atenção / dívida técnica:**
> - O plugin **`rehype-citations.mjs`** está registrado no `astro.config.mjs`, mas ele só
>   captura tags `<cite>` **literais** escritas à mão no markdown — **não** captura o
>   componente `<Cite/>`. Na prática, para o fluxo normal de autoria ele fica **inerte**.
> - O plugin **`remark-cite-to-html.mjs`** **não está registrado em lugar nenhum** (legado).
> - Há **lógica de citação duplicada** em 3 arquivos (Layout inline, AulaLayout inline,
>   citations-hydrate.js). Antes de "consertar" citações, entenda os três — mexer em um só
>   costuma quebrar o conjunto. Idealmente isso seria consolidado num único script.

---

## 11. Convenções de código

- **Idioma:** tudo em português — nomes de componentes (`NotaDeMargem`, `LaboratorioMental`,
  `BoxArtigo`), props (`resumo`, `lado`, `cor`, `legenda`), classes CSS (`.texto-aula`,
  `.menu-aulas`) e comentários. Mantenha assim.
- **Componentes Astro:** props via `Astro.props` com defaults no destructuring; `<style>`
  local (scoped) por componente; use `:global(...)` quando precisar atingir conteúdo de `<slot/>`.
- **Interatividade:** `<script>` vanilla. Use `is:inline` quando o script precisa rodar cedo
  (ex.: evitar flash do "modo leitura") ou ler dados embutidos no HTML.
- **Acessibilidade:** o código existente capricha em `aria-*`, `role`, foco visível e
  `prefers-reduced-motion`. Acompanhe esse padrão ao adicionar interações.
- **Responsividade:** breakpoint recorrente em `max-width: 768px` (e `900px` no blog/home).

---

## 12. Dívidas técnicas e pegadinhas conhecidas

Itens reais no repositório hoje — **não "conserte" silenciosamente; confirme antes**:

- **`node_modules/` e `dist/` estão versionados no git e não existe `.gitignore`.**
  São ~9.7k arquivos de `node_modules` rastreados. Criar um `.gitignore`
  (`node_modules/`, `dist/`, `.astro/`) e remover esses diretórios do índice é uma melhoria
  desejável, mas é uma mudança grande — alinhe com o autor antes.
- **Citações:** ver a dívida descrita na seção 10 (3 scripts sobrepostos + 1 plugin inerte + 1 legado).
- **Logs de debug:** `scripts/citations-hydrate.js` tem vários `console.log('[OC(H) LIST]', ...)`.
- **Marcadores de sanity-check:** `blog/[slug].astro` ainda renderiza `[pré-conteúdo]` e
  `[pós-conteúdo]` (havia um comentário "remova depois de validar").
- **Bug pequeno:** em `cursos/index.astro` há uma aspa sobrando no atributo
  (`<a href={...}"` — aspa dupla extra após a chave).
- **Grade curricular hardcoded:** o acordeão em `cursos/curso-escrita/index.astro` é estático
  (Aula 01/02 escritas à mão), não é gerado a partir da coleção.
- **Páginas de menu inexistentes:** `/aulas-especiais/` e `/links/` (seção 7).

**Encontrados rodando o site (confirmados em tela — ainda NÃO corrigidos):**

- 🔴 **Aulas quebradas no mobile.** `AulaLayout` usa `grid-template-columns: 320px 1fr` e
  **não tem nenhum `@media` para telas estreitas** — no celular o menu lateral esmaga a coluna
  de conteúdo e o texto/notas viram ~1 caractere por linha. Maior prioridade de UX. (A lógica
  do "modo leitura", que zera a coluna do menu, é metade do caminho para o conserto.)
- 🟠 **"Modo leitura" não persiste no reload.** O clique no botão funciona, mas o preload não
  reaplica o estado salvo em `localStorage` (`oficina.modoLeitura`) ao recarregar a página.
- 🟡 **Home com bloco cinza vazio.** O `CoverCard` do blog na home renderiza uma área grande e
  vazia (a imagem da capa não aparece e há só 1 cover num grid 2-up).
- 🟡 **Rastreadores do YouTube.** O `VideoPlayer` embeda `youtube.com`, que dispara requests a
  `doubleclick.net` (erros no console + privacidade). Avaliar `youtube-nocookie.com`.
- **Typo de conteúdo:** título de uma aula no menu — "Vendo a**r** Coisas como as Coisas São"
  (deveria ser "as"), no frontmatter da aula correspondente.

---

## 13. Receitas (tarefas comuns)

**Adicionar uma aula nova:**
1. Crie `src/content/curso-escrita/aulaNN/index.mdx` (pasta com `index.mdx`).
2. Frontmatter mínimo: `title`, `ordem: NN`, `menu: true`, `tipo: 'video'|'texto'`.
   Para vídeo, adicione `videoId/chapters/transcript` e renderize `<VideoPlayer/>` no corpo.
3. Para citações, preencha `references:` e use `<Cite/>` + `<ReferenceList/>`.
4. Detalhes e catálogo de componentes editoriais: [`docs/autoria-aulas.md`](docs/autoria-aulas.md).
5. A rota `/cursos/curso-escrita/aulaNN/` é gerada automaticamente.

**Adicionar um post no blog:** crie `src/content/blog/AAAA-MM-DD-slug.mdx` com `title`,
`dataPublicacao` (data sem aspas), `tags`, `summary`. Aparece sozinho no índice (ordenado por data).

**Mexer no visual do site principal:** quase sempre é `public/estilos.css` ou o `<style>` do componente.
**Mexer no visual do blog:** use os tokens `--oc-*` (`src/styles/tokens.css`) e os CSS de `src/styles/`.

**Antes de finalizar qualquer mudança:** rode `npm run build` para garantir que o site estático
compila (não há testes automatizados; o build é a principal rede de segurança).
```
