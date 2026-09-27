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
2. **Blog "A Prancheta"** (subtítulo: "bastidores da Oficina de Cientistas") — diário de
   desenvolvimento do próprio site. Use esse nome; "Os Bastidores" e "Blog de Desenvolvimento"
   eram nomes antigos.
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
  `npm run build` → publica `dist/` no Pages. Node 22 (com cache do npm).
- `.nojekyll` na raiz impede o Jekyll de mexer no output.
- **Não há ambiente de staging.** Push na `main` = publicar em produção.
- **Site não-listado (alfa):** `Layout.astro` e `BlogLayout.astro` têm `<meta name="robots" content="noindex, nofollow">`.
  Quem tem o link acessa; buscadores não indexam. Remova as duas tags quando for hora de listar.
  (Um `robots.txt` não resolveria: no GitHub Pages de projeto ele ficaria fora da raiz do domínio.)

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
├─ astro.config.mjs      # site/base, integração MDX, alias @→src
├─ jsconfig.json         # alias ~→src
├─ package.json
├─ .github/workflows/deploy.yml
├─ arte/                # arquivos de trabalho (.psd) e backups de imagens — FORA do build
├─ public/               # servido como está (NÃO passa por bundler) — tudo aqui vai para o ar
│  ├─ estilos.css        # ★ CSS GLOBAL do site principal (~930 linhas)
│  ├─ imagens/           # imagens das aulas e home (só o que vai para o ar)
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
   ├─ scripts/citations-hydrate.js # ÚNICO script das citações (ver seção 10)
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
| `aulas-especiais/index.astro`, `links/index.astro` | `/aulas-especiais/`, `/links/` | Páginas "em construção" (seções planejadas) |
| `404.astro` | qualquer endereço inexistente | Página 404 própria (o gato: "Este experimento não replicou") |

**Rascunhos:** aulas com `draft: true` só existem no `npm run dev`; no build (site publicado)
não viram página nem entram no menu/grade.

---

## 8. Os dois "mundos" de layout (isolados de propósito)

Há **dois sistemas de estilo deliberadamente separados** para o site não "vazar" no blog:

### Site principal — `Layout.astro`
- Carrega o **CSS global** `public/estilos.css` (a maior parte do visual do site mora aqui).
- Carrega fontes via Google Fonts, **num único `<link>`** (Lora, Source Sans 3, Lato,
  Special Elite, Courier Prime, Montserrat) e o FontAwesome 6.7 (CDN). Componentes não
  pedem fonte por conta própria: usam os papéis `--fonte-*` de `estilos.css`.
- Tem `<meta name="description">`, Open Graph (prévia de link) e canonical; recebe
  `title` e `description` como props.
- `AulaLayout.astro` **envolve** `Layout.astro` e adiciona: menu lateral de aulas (ordenado
  por `ordem`, filtrando `menu: true`), botão **"Modo leitura"** (esconde o menu; estado em
  `localStorage` sob a chave `oficina.modoLeitura`), a infra de citações e, em tela larga
  (≥1280px), uma **coluna de margem à direita** quando a aula tem `NotaDeMargem` desse lado.

### Blog — `BlogLayout.astro`
- **Não herda** `Layout.astro`. É autocontido.
- Carrega o **design system próprio**: `styles/tokens.css` (variáveis `--oc-*`) + `styles/base.css`.
- Fontes num único `<link>`: as **mesmas famílias do site** (Lato no texto, Lora nos títulos) +
  Montserrat 200 no título do header. **Favicons próprios** (`public/img/favicons/blog*`).
- **Não** tem sistema de citações.

> Regra prática: estilizou algo no site principal? É em `public/estilos.css` ou no `<style>`
> do componente. Estilizou algo no blog? Use os tokens `--oc-*` e os CSS de `src/styles/`.
>
> **Cores e tokens (três camadas):**
> 1. `src/styles/paleta.css` — as **tintas nomeadas** (`--tinta`, `--ardosia`, `--vinho`,
>    `--jade`, `--papel`…). Importada pelos **dois** mundos. Único lugar com hex de cor.
> 2. **Papéis semânticos** — site: seção 0 de `public/estilos.css` (`--cor-texto`,
>    `--cor-destaque`, `--cor-dica`, `--raio-*`, `--sombra-*`…); blog: `src/styles/tokens.css`
>    (`--oc-*`). Cada mundo distribui as mesmas tintas em papéis diferentes.
> 3. **Componentes usam só papéis** — nunca hex solto nem a tinta direto.
>
> Cor nova? Primeiro veja se uma tinta existente serve; se não, crie a tinta em `paleta.css` e
> um papel que a use. O "espelho" do blog é trocar papéis em `tokens.css`, não criar cores.
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
se aparece no menu lateral), `ordem` (int — ordem no menu), `ciclo` (int — agrupa a grade da
landing; nomes dos ciclos em `CICLOS` na própria landing), `tipo` (`'video'|'texto'`,
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

### Como funciona por baixo
- `Cite.astro` renderiza `<cite class="oc-cite" data-key="...">`; `ReferenceList.astro`
  renderiza `<div class="oc-ref-list" data-ref-list>` (placeholders vazios).
- `AulaLayout` serializa `data.references` em `<meta id="oc-refs" data-refs="...">`
  (JSON + `encodeURIComponent`) e carrega `src/scripts/citations-hydrate.js` e `citations.css`.
- **Um único script no cliente** (`citations-hydrate.js`) faz tudo: numera os `<cite>` pela
  ordem de 1ª aparição, troca cada um por botão `[n]` + popover, monta a `<ol>` em
  `[data-ref-list]` (com âncoras `#ref-n` e links DOI · Link · Google Scholar) e liga a
  interação (abrir/fechar no `[n]`, botão ×, Esc, clique fora, rolagem).
- Não há plugin de build para citações (o antigo `rehype-citations` era inerte e foi removido).
- Estilos dos popovers/lista: `src/styles/citations.css`.

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
  `prefers-reduced-motion`. Acompanhe esse padrão ao adicionar interações. Em particular:
  todo botão que abre/fecha algo leva `aria-expanded` (e `aria-controls`), e **conteúdo
  recolhido fica `inert`** (acordeão da grade, "O que é esta seção?", painel do `VideoPlayer`,
  posts do índice do blog) — senão o Tab entra em links que não aparecem na tela.
- **Responsividade:** breakpoint recorrente em `max-width: 768px` (e `900px` no blog/home).

---

## 12. Dívidas técnicas e pegadinhas conhecidas

Itens reais no repositório hoje — **não "conserte" silenciosamente; confirme antes**.
A auditoria completa (e o que já foi feito) está em
[`planejamento/revisao-2026-09.md`](planejamento/revisao-2026-09.md).

- **Dois padrões de `base` e dois aliases** (`withBase()` × cálculo inline; `@` × `~`) —
  ver seções 4 e 5. Padronizar aos poucos, sem inflar diffs.
- **Fontes ainda demais:** 6 famílias no site (Lora, Lato, Source Sans 3, Special Elite,
  Courier Prime, Montserrat). A proposta (revisão, D2) é reduzir a 3 papéis — inclusive
  decidir a fonte do corpo das aulas (hoje Source Sans 3; a revisão sugere testar uma serifada).
  É decisão de design do autor: não troque sem combinar.
- **Conteúdo:** a `description` da Aula 01 ainda fala de IMRaD (assunto do vídeo antigo);
  e-mail de contato e link do Lattes aguardam o autor (TODOs em `Sustentabilidade.astro` e
  `QuemSouEu.astro`).
- **Site não-listado** de propósito (`noindex` — ver seção 3).

---

## 13. Receitas (tarefas comuns)

**Adicionar uma aula nova:**
1. Crie `src/content/curso-escrita/aulaNN/index.mdx` (pasta com `index.mdx`).
2. Frontmatter mínimo: `title`, `ordem: NN`, `ciclo: N`, `menu: true`, `tipo: 'video'|'texto'`.
   Para vídeo, adicione `videoId/chapters/transcript` e renderize `<VideoPlayer/>` no corpo.
3. Para citações, preencha `references:` e use `<Cite/>` + `<ReferenceList/>`.
4. Detalhes e catálogo de componentes editoriais: [`docs/autoria-aulas.md`](docs/autoria-aulas.md).
5. A rota `/cursos/curso-escrita/aulaNN/` é gerada automaticamente.

**Adicionar um post no blog:** crie `src/content/blog/AAAA-MM-DD-slug.mdx` com `title`,
`dataPublicacao` (data sem aspas), `tags`, `summary`. Aparece sozinho no índice (ordenado por data).

**Mexer no visual do site principal:** quase sempre é `public/estilos.css` ou o `<style>` do componente
(cores só via papéis `--cor-*` — ver "Cores e tokens" na seção 8).
**Mexer no visual do blog:** use os tokens `--oc-*` (`src/styles/tokens.css`) e os CSS de `src/styles/`.

**Antes de finalizar qualquer mudança:** rode `npm run build` para garantir que o site estático
compila (não há testes automatizados; o build é a principal rede de segurança).
```
