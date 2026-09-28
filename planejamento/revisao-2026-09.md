# Revisão geral — bugs, inconsistências e sugestões de design (set/2026)

Segunda rodada de revisão, feita **depois** da execução do [`correcoes.md`](correcoes.md).
Nada abaixo repete o que já foi corrigido lá; itens que continuam abertos daquele plano
aparecem de novo só quando ainda estão quebrados.

**Como foi feito:** leitura de todo o `src/`, `public/estilos.css` e do conteúdo MDX;
`npm run build` (compila sem erros, 16 páginas); e o site rodado num navegador
(Playwright/Chromium) em **1366px** (desktop) e **390px** (celular), clicando nas
interações. Itens marcados com ✅ foram **confirmados em tela**; os demais vêm da leitura
do código.

Legenda: 🔴 quebrado · 🟠 inconsistência visível / UX · 🟡 higiene de código

> **Andamento:**
> - Branch `claude/sharp-allen-q2cjv5`:
>   - ✅ **Bloco 1** — B1, B2, B7, B9, B10, I2, I3, I6, I7, I12, I13, H4, H5.
>   - ✅ **D1** — tokens semânticos (`src/styles/paleta.css` + papéis no site e no blog).
>   - ✅ **Bloco 2** — B5, B6, B8, I4, I8, I15, H1, H2, H3.
>   - ✅ **Bloco 3** — B3, B4 (citações num único script; plugin inerte removido).
>   - ✅ **Bloco 4** — H6, H7, H8, H9, H10 (FontAwesome estável, fontes num pedido, Node 22, SEO/OG, 404, manifesto, `CLAUDE.md`).
> - Branch `claude/blissful-wright-o1rikh`:
>   - ✅ **Bloco 5** — resto da Parte 1: I1 (blog carrega Lato; Inter fora da `NotaDeMargem`;
>     Source Sans 3), I5, I9 ("A Prancheta — bastidores da Oficina de Cientistas"), I10, I11, I14,
>     I16 (vários players por página) e H11. De quebra: `aria-current` no menu principal (parte do D3)
>     e o filtro de tags pela URL (parte do D13).
>   - 🐛 Achado no caminho: **o filtro de tags do índice do blog nunca funcionou** — o script fica no
>     `<main>`, antes da sidebar no HTML, e rodava quando ainda não havia botão nenhum. Corrigido.
>   - ✅ **Bloco 6** — os estruturais da Parte 2:
>     - **D5** — anterior/próxima no fim das aulas; "Aula 01 · com vídeo · ~8 min de leitura" sob o
>       título; índice do curso recolhível no celular (`<details>`).
>     - **D7** — campo `ciclo` nas aulas e grade agrupada pelos 3 ciclos (vazios = "em preparação").
>       As três aulas no ar foram postas no Ciclo 1 — **o autor deve conferir**.
>     - **D3** — header de ponta a ponta no site e no blog (o conteúdo segue alinhado à página).
>     - **D13** — RSS (`/blog/rss.xml`), rodapé e anterior/próximo no blog. Falta só a imagem de
>       capa opcional (campo `capa`), que fica para quando algum post tiver capa.
> - Pendentes que dependem do autor: **D2** (qual fonte no corpo das aulas; reduzir a 3 papéis),
>   I7 (e-mail de contato e Lattes) e a `description` da Aula 01 (fala de IMRaD).
> - Próximos candidatos (Parte 2, agora os de **gosto** — melhor combinar antes): D10 (o espelho de
>   cor do blog: trocar o roxo/rosa provisório por uma tinta do site), D6 (família única de caixas),
>   D4 (home menos repetitiva; card "Da Prancheta" com os últimos posts), D8 (vitrine com cursos
>   "em breve"), D12 (estética de caderno/zine no blog) e D9 (Manifesto na largura toda).

---

# Parte 1 — Bugs e inconsistências (e como corrigir)

## 🔴 Quebrados

**B1 · Links dos títulos no índice do blog apontam para `/oficinadecientistasblog/...`** ✅
- **Onde:** `src/components/PostCard.astro:15-16`.
- **Problema:** usa `import.meta.env.BASE_URL` (que não termina em `/`) e concatena `blog/`.
  O JS da expansão chama `preventDefault()` e esconde o erro. Mas Ctrl+clique, "abrir em
  nova aba", leitores sem JS e o Google caem num 404.
- **Correção:** `import { withBase } from "@/lib/url";` e `const href = withBase(\`blog/${post.slug}/\`);`.

**B2 · Todas as datas do blog aparecem um dia antes** ✅
- **Onde:** `src/lib/blog-utils.ts:4` (`formatDate`, fuso `"America/Manaus"`).
- **Problema:** `dataPublicacao: 2025-11-08` vira meia-noite UTC. Em Manaus (UTC−4) isso é
  20h do dia 7, então o post de 08/11 aparece como "07 nov. 2025".
- **Correção:** trocar o padrão para `tz = "UTC"` (o `groupByMonth` do mesmo arquivo já usa UTC).

**B3 · O "×" do popover de citação não fecha nada** ✅
- **Onde:** scripts de citação em `Layout.astro`, `AulaLayout.astro` e `citations-hydrate.js`.
- **Problema:** os três criam o botão `.oc-pop-close`, mas nenhum liga um clique a ele. O
  clique "fora" ignora cliques dentro do popover, então só Esc ou rolar a página fecham.
- **Correção:** no script que sobrar após o B4, `if (e.target.closest('.oc-pop-close')) closeOpen();`.

**B4 · A lista de referências perde os links (DOI/Link/Scholar) e as âncoras** ✅
- **Onde:** `Layout.astro` (script inline) × `src/scripts/citations-hydrate.js`.
- **Problema:** o script do `Layout` monta uma lista completa (com `id="ref-n"` e links), mas
  lê as referências de `#oc-refs` via `textContent`. Só que `#oc-refs` é um `<meta>` com
  `data-refs`, então o texto vem vazio: o primeiro render mostra "Referência não encontrada".
  Depois o `citations-hydrate.js` refaz popovers e lista **só com texto puro**. Resultado final:
  lista sem links e sem âncoras.
- **Correção (é o P2.3 do `correcoes.md`, agora com causa confirmada):** manter **um**
  script só. O mais simples é mover o script do `Layout.astro` (o mais completo) para dentro
  do `citations-hydrate.js`, corrigir a leitura para
  `JSON.parse(decodeURIComponent(meta.dataset.refs))` e incluir o fechamento do B3. Depois,
  apagar o bloco de citações do `Layout.astro` (que roda em **todas** as páginas à toa) e o do
  `AulaLayout.astro`.

**B5 · Página Sobre com rolagem horizontal no celular** ✅ (20px de sobra)
- **Onde:** `.sobre-secao { margin: 0 -40px }` em `Bastidores.astro` e `Sustentabilidade.astro`;
  `.secao-quem-sou-eu` e `.secao-visao-futuro` em `public/estilos.css`.
- **Problema:** o "sangramento" de −40px assume 40px de padding no contêiner, mas no mobile ele
  é 20px.
- **Correção:** usar uma variável única, por exemplo `--sobre-pad: 40px` (20px no mobile), e
  `margin-inline: calc(-1 * var(--sobre-pad)); padding-inline: var(--sobre-pad);` em todas as seções.

**B6 · Script solto antes do `<!DOCTYPE html>` nas aulas** ✅
- **Onde:** `src/layouts/AulaLayout.astro:24-37`, e os dois `<script>` depois de `</Layout>`.
- **Problema:** esse código fica fora do `<Layout>`, então o Astro o emite **antes do `<html>`**
  (e os outros dois depois do `</html>`). Nesse ponto `document.body` ainda é `null`: o script
  dá erro, o `try` engole e ele não faz nada. O modo leitura só funciona porque o `Layout.astro`
  tem outro preload no `<body>`.
- **Correção:** apagar esse primeiro bloco e mover os scripts do fim para **dentro** do
  `<Layout>` (no fim do `<main>`). Aproveitar para remover o `ml-preload` que o `Layout.astro`
  põe no `<html>`: nada o remove e o CSS só olha `body.ml-preload`.

**B7 · Ícone do acordeão fica torto ao abrir** ✅
- **Onde:** `cursos/curso-escrita/index.astro` (JS troca `fa-plus` → `fa-minus`) +
  `estilos.css` (`.acordeon-item.aberto .icone-acordeon { transform: rotate(45deg) }`).
- **Problema:** faz as duas coisas, e o "−" girado 45° vira uma barra inclinada.
- **Correção:** escolher uma só. Sugestão: manter o `+` e girar (vira ×), removendo as linhas
  `classList.replace(...)`.

**B8 · Capa "A Prancheta" na home pesa 4,5 MB (causa do "bloco cinza vazio")** ✅
- **Onde:** `public/imagens/prancheta-card.png` (PNG 2007×2677).
- **Problema:** com `loading="lazy"` e esse peso, o card fica cinza por muito tempo em conexões
  normais. O ajuste de grid feito antes (P0.4) não atacou a causa.
- **Correção:** exportar em ~800px de largura, WebP ou JPG (~100–150 KB). Melhor ainda:
  importar a imagem como módulo e usar `<Image>` de `astro:assets`, que otimiza no build.
  Vale o mesmo para `favicon.svg` (191 KB, provavelmente com bitmap embutido).

**B9 · 5 dos 6 favicons do blog dão 404**
- **Onde:** `src/layouts/BlogLayout.astro:39-44`.
- **Problema:** o código pede `blog.svg`, `blog-32.png`, `blog-180.png`, `blog-192.png` e
  `blog-pinned.svg`. Os arquivos reais em `public/img/favicons/` são `blog-32x32.png`,
  `blog-apple-touch-icon.png`, `blogandroid-chrome-192x192.png`, `blog-16x16.png` e `blog.ico`.
- **Correção:** acertar os nomes no layout (ou renomear os arquivos) e remover as linhas sem arquivo.

**B10 · Post "Primeiro post dos Bastidores" termina dentro de um bloco de código**
- **Onde:** `src/content/blog/2025-11-05-primeiro-post.mdx`.
- **Problema:** a cerca ` ```ts ` nunca é fechada.
- **Correção:** fechar a cerca com ` ``` ` (e pôr o exemplo que faltou, ou apagar o bloco).

## 🟠 Inconsistências visíveis / UX

**I1 · Fontes usadas que não são carregadas** ✅
- O slogan da home usa `Montserrat` (`HomeHero.astro:41`), que o site principal não carrega
  (só o blog carrega), então aparece a fonte padrão do sistema.
- `InfoBox` usa `'Bitter'`, que nunca é carregada.
- No blog, `--oc-font-sans` começa com `'Lato'`, que o `BlogLayout` não carrega (o corpo do blog
  sai em fonte do sistema). Já `Oswald` é carregada e não é usada.
- **Correção:** decidir a lista de fontes (ver D2) e carregar exatamente essas, num único
  `<link>` do Google Fonts por layout.

**I2 · Números que não batem**
- A home diz "10 aulas • ~8h de conteúdo" e `/cursos/` diz "10 AULAS", mas existem 3 aulas no ar.
- **Correção:** calcular a partir da coleção (`aulas.length`) ou trocar por "em construção".

**I3 · Metadados de aula copiados ou inconsistentes**
- `aula03` tem a mesma `description` da Aula 02 (fala de "conceito de espécie").
- A Aula 02 tem `title: 'É preciso ser preciso:'` (com dois-pontos), e a aba fica
  "É preciso ser preciso: - Oficina de Cientistas".
- Caixa inconsistente: "Aula 01: Se Comunicar Bem é Muito difícil", "Aula 02: É Preciso ser preciso".
- **Correção:** revisar o frontmatter das três. Padronizar `title` (título editorial) e
  `shortTitle` ("Aula 0N: …").

**I4 · Rascunhos publicados como páginas públicas**
- `precisao2` e `prototype` saíram do menu (`menu:false`), mas **continuam gerando páginas**
  (`/cursos/curso-escrita/precisao2/` e `/prototype/`), indexáveis, com DOI falso
  (`10.1234/example-doi`) e links `example.com`.
- `introducao.mdx` também gera `/cursos/curso-escrita/introducao/`, que duplica a landing do curso.
- O campo `draft` existe no schema, mas **nada o filtra**.
- **Correção:** em `[slug].astro` → `getStaticPaths`, usar `.filter(a => !a.data.draft)` (e o mesmo
  filtro no menu e na grade). Depois marcar `draft: true` nesses três.

**I5 · Notas de margem da Aula 01 invisíveis por padrão** ✅
- As 12 `NotaDeMargem` da Aula 01 são `lado="esquerda"`, onde fica o menu. Por isso ficam com
  `opacity: 0` e só aparecem no modo leitura. O aluno não tem como saber que elas existem.
- **Correção (sugestão):** usar `lado="direita"` e mostrar sempre em telas largas (≥1280px). Em
  telas médias, virar bloco inline, como já acontece no mobile.

**I6 · Marcação e conteúdo com defeito dentro das aulas**
- `precisao.mdx` (Síntese): o segundo `.take-home-card` está **dentro** do primeiro, com um
  `<br></br>` perdido entre eles.
- `aula01` (BoxArtigo): o parágrafo "No entanto, a comunicação intencional…" aparece
  **duplicado** nas duas colunas. A legenda ficou como placeholder ("Imagem: legenda").
- `aula01`: há um "¹" solto ("idiomas complexos, como os atuais¹") sem nota correspondente.
- `aula01`: importa `gatoCard2` e não usa.

**I7 · Placeholders e textos pendentes no "Sobre"**
- `Sustentabilidade.astro`: "bolsa PCI-B **(nº)**" e "entre em contato pelo e-mail:" **sem o e-mail**.
- `Bastidores.astro`: cita o blog e o repositório do GitHub **sem link**.
- Lattes continua pendente (já registrado no P1.8).
- Gramática: "poderá ser oferecido serviços" → "poderão ser oferecidos serviços".

**I8 · Hierarquia de títulos bagunçada** ✅
- O `Header` usa `<h1>Oficina de Cientistas</h1>` em todas as páginas, então `/sobre/` tem dois `<h1>`.
- O índice do blog não tem nenhum `<h1>`.
- A landing do curso tem `<h3>` antes do `<h2>`.
- As aulas usam o `h2.titulo-aula` como título da página.
- Os componentes usam `h4` (Síntese, BoxArtigo) e `h2` (Laboratório Mental) sem critério.
- **Correção:** o nome do site no header vira um link (`<a class="marca">`), sem ser `h1`. Cada
  página tem um `<h1>`; nas aulas, o `AulaLayout` renderiza o `title` do frontmatter como `<h1>`.

**I9 · O blog tem três nomes**
- "A Prancheta" (home e header do blog), "Os Bastidores" (sidebar e schema) e
  "Blog de Desenvolvimento" (`<title>` e página Sobre).
- **Correção:** escolher um nome principal e, se quiser, um subtítulo fixo
  (ex.: "A Prancheta — bastidores da Oficina").

**I10 · A sidebar do blog não funciona na página de um post**
- Na página de um post, os botões de tag não fazem nada: o script de filtro só existe no índice.
  Os links do arquivo (`#m-2025-11`) apontam para âncoras que só existem no índice.
- **Correção:** na página do post, as tags viram links `blog/?tag=x`, e o arquivo vira `blog/#m-…`.
  O índice passa a ler o `?tag=` ao carregar.
- **Achado depois (Bloco 5):** nem no índice o filtro funcionava — o script inline rodava antes de
  a sidebar existir no HTML. Agora espera o `DOMContentLoaded`.

**I11 · Posts recolhidos no índice continuam "tabuláveis"**
- `.post-expand[hidden] { display: block }` deixa o conteúdo invisível mas acessível: o Tab e o
  leitor de tela entram em links que não aparecem.
- **Correção:** aplicar `inert` (ou `visibility: hidden` ao fim da animação de fechar) no painel fechado.

**I12 · Mobile: caixa flutuante espremida + texto justificado** ✅
- No celular, a `PullOutBox` continua com `width: 45%` (158px). Somada ao `text-align: justify`,
  gera "rios" de espaço ("Ao      entender      a").
- **Correção:** em `@media (max-width: 768px)`, `.pull-out-box { float: none; width: auto; margin: 1rem 0; }`
  e `.texto-aula { text-align: left; }`.

**I13 · Títulos no menu de aulas empurrados para a direita** ✅
- `.menu-aulas li a` é `flex` com `justify-content: space-between`: o ícone vai para a borda
  esquerda e o título para a direita. No celular fica bem visível.
- **Correção:** `justify-content: flex-start; gap: .5rem;` e o marcador `◄` da aula ativa com
  `margin-left: auto`.

**I14 · Acessibilidade de controles**
- Hambúrguer (mobile): o `<label>` não recebe foco, não tem `aria-label` nem `aria-expanded`, e o
  Esc não fecha o menu.
- O acordeão da grade e o "O que é esta seção?" do Laboratório Mental não têm `aria-expanded`.
- No VideoPlayer, as abas não atualizam `aria-selected`, e os tempos são `href="#"`.
- **Correção:** trocar o hambúrguer por um `<button aria-expanded>` com um script pequeno e
  atualizar os `aria-*` nos toggles existentes.

**I15 · Links internos sem barra final e "primeira aula" fixa**
- "Ir para a Primeira Aula" aponta fixo para `aula01`. Os links do menu e da grade não têm `/`
  final (o GitHub Pages responde com um redirecionamento 301 a cada clique).
- **Correção:** usar `aulas[0].slug` e sempre terminar com `/`.

**I16 · VideoPlayer (provável, não visto em tela porque o YouTube é bloqueado aqui)**
- O CSS scoped `.video-wrapper iframe` não pega o `<iframe>` criado em tempo de execução pela API
  do YouTube (ele não recebe o atributo `data-astro-cid`). Use `:global(iframe)`.
- Os IDs são fixos (`youtube-player`, `interactive-panel`), então só cabe um player por página.
- O azul `#0056b3` está fora da paleta.

## 🟡 Higiene de código / dívida técnica

- **H1 · Duas fontes de verdade para a grade da sala de aula.** `estilos.css` (≥768px: coluna de
  280px, padding 40px, sticky 40px) × `<style>` do `AulaLayout` (320px). O scoped vence, então o
  global é código morto que confunde. Os breakpoints também se sobrepõem em exatamente 768px
  (`767.98` × `768`). Apagar o bloco do `estilos.css`.
- **H2 · Variáveis CSS usadas e nunca definidas:** `--cor-texto-principal` (Table),
  `--fonte-slab` (Síntese), `--menu-stick-top` (AulaLayout).
- **H3 · CSS morto** em `estilos.css`: `.navegacao-aulas`, `.video-responsivo`,
  `.tabela-conceitos`, `.grid-cursos`, `.card-curso`, `.pull-quote`. Classes Tailwind no
  `Footer.astro` (`bg-gray-800`, `mx-auto`…) sem Tailwind no projeto. Componentes sem uso:
  `home/HomeDestaques.astro` e `home/FeatureCard.astro`. Um media query vazio em `Sintese.astro`.
- **H4 · Lixo publicado no site.** Tudo em `public/` vai para o ar, e o `dist/` tem **15 MB**.
  Sem uso: 4 `.psd` (~5 MB), `gatocard2 - Copia.png`, `logo1_bk.png`, `logo2_backup.png`,
  `logo5_bk.png`, `destaque.png`, `divider1.png`, `divider2.png`, `gatocard.png`,
  `patocard-mobile.png` e `textura-papel.jpg`. Mover os `.psd` e backups para fora de
  `public/` (ex.: uma pasta `arte/` fora do build).
- **H5 · Lixo na raiz do repositório:** `Como usar script de tabela` e
  `Como usar script de tabela.txt` (idênticos), `introducao OLD.mdx`, `backup/config.ts_backup`.
  Mover a instrução da tabela para `docs/` e apagar o resto.
- **H6 · Dependências externas frágeis.** FontAwesome **6.0.0-beta3** (versão beta) via CDN em
  todas as páginas. O `InfoBox` mistura `fas` com `fa-solid`. As fontes vêm em 5 requisições
  separadas ao Google. `Source Sans Pro` foi renomeada para `Source Sans 3`.
- **H7 · Deploy desatualizado** (`.github/workflows/deploy.yml`): Node 18 (fora de suporte desde
  abr/2025) e actions `@v3`. Subir para Node 22, `actions/checkout@v4`, `actions/setup-node@v4`
  com `cache: npm`. O passo "Fix Astro CLI permissions" só existia porque `node_modules` era
  versionado e pode sair.
- **H8 · SEO e metadados.** O `Layout.astro` não tem `<meta name="description">`, Open Graph nem
  canonical. O blog já tem. O `site.webmanifest` não está linkado e usa caminhos sem a base
  (`/web-app-manifest-192x192.png` daria 404). Não existe página 404 própria.
- **H9 · Restos de plumbing.** `rehype-citations` continua registrado e inerte, e as devDeps
  `rehype-raw` e `unist-util-visit` não são importadas por nada. `Image.astro` monta a URL com
  `${base}/${src}`, um terceiro padrão que funciona por acaso; use `withBase`.
- **H10 · `CLAUDE.md` desatualizado.** A seção 12 ainda lista como pendentes itens já corrigidos
  (aulas no mobile, modo leitura, youtube-nocookie, aspa em `cursos/index`, marcadores do blog,
  typo "Vendo ar"). Isso confunde qualquer agente que ler o arquivo depois.
- **H11 · Erros de digitação no conteúdo** (amostra):
  - `precisao.mdx`: `"cadeira" , pedra"` (falta aspa), "Pischers" → "Pinschers",
    "alguns ainda trabalhava" → "trabalhavam", "comportalmente", "Isso porquê" → "porque",
    "extintas a milhares" → "há milhares", "de espécie acordo com" → "de acordo com",
    "linhagens seguidas caminhos", "os humanos… criou".
  - `aula03`: alt "Alberto Caiero".
  - `introducao.mdx`: citação terminando em `""`.

### Ordem sugerida de correção
1. **Rápidos e seguros (uma tarde):** B1, B2, B7, B9, B10, I2, I3, I6, I7, I12, I13, H4, H5.
2. **Estruturais pequenos:** B5, B6, B8, I4 (filtro de `draft`), I8, I15, H1, H2, H3.
3. **Citações (uma sessão focada):** B3 + B4 juntos, deixando um único script.
4. **Infra:** H6, H7, H8, H10.

---

# Parte 2 — Sugestões de design e layout

Complementa o [`design.md`](design.md) (que já traz o norte "caderno de naturalista" e as
fases). Aqui estão sugestões **concretas, a partir do que vi em tela**, e uma proposta para o
blog como "espelho estranho".

## Site principal

**D1 · Tokens semânticos primeiro (é o que viabiliza o espelho).** Hoje existem **70 cores hex
diferentes** espalhadas pelos componentes (azul Bootstrap no player, verde `#348455` no InfoBox,
um dourado `#D4A237` comentado como "vermelho terracota" no BoxArtigo…) e **~11 raios de borda
diferentes** (3, 4, 6, 8, 12, 16, 20px…). Proposta:
- Uma paleta **nomeada**: `--tinta` #34495E, `--ardosia` #4A698B, `--vinho` #8c4b4b,
  `--jade` #00695C, `--papel` #f7f5ef.
- Por cima dela, **papéis semânticos**: `--cor-base`, `--cor-destaque`, `--cor-texto`,
  `--cor-fundo`, `--cor-superficie`.
- Componentes só usam os papéis, nunca hex.
- Um raio (`--raio`) e uma elevação (`--sombra`).

Com isso, o blog vira literalmente **o mesmo sistema com os papéis trocados** (ver D10).

**D2 · Enxugar as fontes.** Hoje são 9 famílias pedidas ou referenciadas no site (Lora, Source
Sans Pro, Lato, Special Elite, Courier Prime, Montserrat, Inter, Bitter e a do sistema), mais
Oswald no blog. Proposta de 3 papéis:
- **Lora** para títulos.
- **Uma fonte de texto**. Para o formato "livro digital" das aulas, vale testar uma serifada de
  leitura (ex.: Source Serif 4 ou a própria Lora regular) no corpo, em vez da sans atual.
- **Special Elite / Courier Prime** só como "assinatura": Manifesto, Laboratório Mental, datas.

**D3 · Header.** A barra ardósia fica presa em 1280px e deixa faixas cinzas nas laterais em
telas largas: a barra "flutua". Ou ela vai de ponta a ponta, ou fica leve (papel + filete, como
propõe o `design.md`). O logo e o nome devem levar à home. O link da página atual precisa de
indicação (`aria-current` + sublinhado vinho).

**D4 · Home menos repetitiva, mais viva.** Hoje o logo aparece 2× e o nome 3× antes do primeiro
conteúdo (aba, header, herói). Proposta:
- O herói vira **uma frase do Manifesto + o gato** (a ilustração é o que tem alma).
- "Nossa Proposta" se funde ao herói.
- O card estático do blog vira **"Da Prancheta" com os 3 posts mais recentes**, gerados da coleção.
- O card do curso mostra dados reais (nº de aulas, status "em gravação").

**D5 · Aulas.**
- **Navegação anterior/próxima** no fim de cada aula (o CSS `.navegacao-aulas` já existe e não é usado).
- **`<h1>` com o título da aula** e tempo de leitura estimado.
- No celular, o menu de aulas ocupa a primeira tela inteira: recolher num
  `<details>` "Índice do curso".
- Notas de margem à direita e sempre visíveis em tela larga (I5).
- Texto justificado só no desktop.

**D6 · Uma família de "caixas".** Hoje cada caixa editorial fala um dialeto:
- InfoBox: borda + sombra + **sobe no hover**, mesmo não sendo clicável.
- BoxArtigo: bordas verticais duplas.
- Síntese: cinza.
- Laboratório Mental: sombra grande.
- PullOutBox: raio de 20px.

Proposta: todas com a mesma base (papel, filete e o mesmo raio, sem sombra) e **cada uma
diferenciada por um único traço autoral**: o ícone ilustrado, a fonte de máquina no
Laboratório, a cor semântica. Tirar o efeito de hover de tudo que não é link.

**D7 · Landing do curso agrupada pelos 3 ciclos.** A introdução já promete "Fundações /
Arquitetura / Reescrita". Um campo `ciclo` no frontmatter permitiria agrupar a grade por ciclo.
Fica mais legível e serve a qualquer curso futuro (multi-curso).

**D8 · Vitrine de cursos que mostra a visão.** Em `/cursos/`, acrescentar cards "em breve"
para Estatística, Ecologia e R, **em esboço a lápis** (placeholders ilustrados à mão). Isso
comunica que é uma plataforma, não um curso só, e reforça a pessoalidade.

**D9 · Toques de personalidade baratos.**
- Página **404 própria** com o gato ("Esse experimento não replicou").
- Imagens otimizadas via `astro:assets` (o site fica leve, e isso também é cuidado).
- O Manifesto em "folha" é o elemento mais forte do Sobre: deixá-lo ocupar a largura toda.

## Blog — o "espelho estranho"

O que já está no espelho, talvez sem querer:
- Os **logos já são invertidos**: o do site tem fundo vinho e o do blog tem fundo ardósia.
- O header do blog é **vinho** (`#683636`), onde o do site é **ardósia**.
- A sidebar do blog fica **à direita**, e o menu das aulas **à esquerda**.

O que quebra o espelho: links **roxos/rosas** (`--oc-accent: #7a3cff`, `--oc-accent-2: #ff3c7a`)
que não existem em lugar nenhum do site, fontes diferentes sem motivo e cards de "vidro"
genéricos.

**D10 · Conceito: o site é o palco, o blog é a coxia ("Os Bastidores").** O palco é claro: papel,
tinta ardósia, destaque vinho. A coxia é o **negativo**: fundo **vinho bem escuro** (ex.:
`#2a1616`), texto **cor de papel** (`#efe6da`) e **destaque ardósia-claro/azulado** (a cor base
do site vira o destaque). Na prática, é o mesmo `tokens.css` do D1 com os papéis trocados:

| Papel semântico   | Site (palco)       | Blog (coxia)             |
|-------------------|--------------------|--------------------------|
| `--cor-fundo`     | papel claro        | vinho profundo           |
| `--cor-texto`     | tinta ardósia      | papel                    |
| `--cor-base`      | ardósia (header)   | vinho (header)           |
| `--cor-destaque`  | vinho (links, capitular) | ardósia clara (links, capitular) |
| logo              | cogumelo em vinho  | cogumelo em ardósia (já é assim) |

Se o escuro total parecer demais: versão "luz de coxia", com fundo papel tingido de vinho
(`#f1e7e4`), cartões mais escuros que o fundo (o inverso do site) e o mesmo mapa de papéis.

**D11 · O que tem que "rimar" (igual nos dois):**
- Mesma largura máxima e mesmo grid de 2 colunas (só espelhado: sidebar à direita).
- Header com a mesma altura, a mesma posição do logo e o mesmo tamanho de título.
- A **mesma escala tipográfica e as mesmas famílias**. Opcional, como "inversão tipográfica"
  sutil: no blog, títulos em sans condensada e texto em Lora (o inverso do site).
- O mesmo raio e a mesma espessura de filete.

**D12 · Onde o blog pode ser livre (estética de caderno de laboratório / zine):**
- Posts como **fichas de arquivo** levemente rotacionadas (o `rotate(±1deg)` da NotaDeMargem já é
  esse gesto), com **fita crepe** no topo.
- **Data como carimbo** em Special Elite ("08 NOV 2025", tinta ardósia, levemente torta).
- Tags como **etiquetas de arquivo** em vez de pílulas tracejadas.
- Um componente **"Antes / Depois"** (dois prints lado a lado): é o que um diário de
  desenvolvimento mais precisa.
- Anotações manuscritas nas margens (reaproveitando a NotaDeMargem com outra fonte).
- Linha do tempo no índice (agrupada por mês, como o arquivo da sidebar já faz), em vez de pilha de cards.

**D13 · Estrutura mínima que falta no blog:**
- `<h1>` no índice.
- **Rodapé** com volta para o site (hoje só o botão do header).
- Navegação **anterior/próximo** entre posts.
- **RSS** (`@astrojs/rss`, pouca linha de código, e combina com diário de bordo).
- Filtro de tag pela URL (`?tag=`) para poder compartilhar.
- Imagem de capa opcional por post (campo `capa` no schema).

---

*Próximo passo sugerido:* executar o bloco 1 da ordem de correção numa branch separada. Depois,
fazer o D1 (tokens semânticos): é a peça que destrava tanto o redesign do site quanto o espelho
do blog.
