# Guia de autoria de aulas (conteúdo MDX)

Como escrever e editar **aulas** do curso em `src/content/curso-escrita/`. Para a visão geral
do projeto, comandos e arquitetura, veja o [`CLAUDE.md`](../CLAUDE.md) na raiz.

As aulas são arquivos **MDX**: Markdown + componentes Astro importados. Elas são renderizadas
dentro do `AulaLayout`, que dá o menu lateral, o "modo leitura" e o sistema de citações.

---

## 1. Onde fica e como vira uma URL

- Pasta da coleção: `src/content/curso-escrita/`.
- **Aula com pasta própria** (preferido — facilita agrupar assets):
  `curso-escrita/aula01/index.mdx` → URL `/cursos/curso-escrita/aula01/`.
- **Arquivo solto:** `curso-escrita/introducao.mdx` → URL `/cursos/curso-escrita/introducao/`.

O **slug** é o nome da pasta (ou do arquivo). A rota é gerada automaticamente por
`src/pages/cursos/curso-escrita/[slug].astro` — você não cria página nenhuma.

---

## 2. Frontmatter

```mdx
---
title: 'Aula 01: Se Comunicar Bem é Muito Difícil'   # obrigatório
shortTitle: 'Aula 01: Se Comunicar Bem'              # opcional (título curto)
description: 'Resumo da aula para SEO/menus.'         # opcional
ordem: 1            # posição no menu lateral (número)
menu: true          # aparece no menu lateral? (default: false)
tipo: 'video'       # 'video' (ícone de vídeo) ou 'texto' (ícone de pena). Default 'video'
draft: false        # opcional — marca como rascunho
tags: []            # opcional
updatedAt: '2026-05-01'  # opcional (string)

# --- Dados de vídeo (NÃO fazem parte do schema; ver seção 4) ---
videoId: 'jA7iHSAumao'
chapters:
  - time: '00:00'
    title: 'Introdução'
transcript:
  - time: '00:00'
    text: 'Olá a todos.'

# --- Referências bibliográficas (ver seção 5) ---
references:
  - key: mayr1942
    author: 'Mayr, E.'
    year: '1942'
    title: 'Systematics and the Origin of Species'
    text: 'Mayr, E. (1942). Systematics and the Origin of Species. Columbia University Press.'
    doi: 'https://doi.org/10.1234/exemplo'
    url: 'https://exemplo.com/mayr-1942'
    scholar_query: 'Mayr Systematics and the Origin of Species 1942'
---
```

**Regras importantes:**
- Só `menu: true` faz a aula aparecer no menu lateral. A ordenação usa `ordem` (numérico).
  Se `menu: true` e faltar `ordem`, a ordenação quebra — sempre defina `ordem` junto com `menu`.
- O schema completo está em `src/content.config.ts`. Campos desconhecidos pelo schema (como
  `videoId/chapters/transcript`) são **ignorados** por `entry.data` — por isso o vídeo é tratado
  de forma especial (seção 4).

---

## 3. Importando componentes no MDX

Logo após o frontmatter, importe o que for usar (alias `~/` = `src/`):

```mdx
import VideoPlayer from '~/components/VideoPlayer.astro';
import NotaDeMargem from '~/components/NotaDeMargem.astro';
import InfoBox from '~/components/InfoBox.astro';
import BoxArtigo from '~/components/BoxArtigo.astro';
import Cite from '~/components/Cite.astro';
import ReferenceList from '~/components/ReferenceList.astro';
import Image from '~/components/Image.astro';
```

Para usar uma **imagem importada como módulo** (recomendado para fotos grandes):
```mdx
import capa from '~/../public/imagens/gatocard2.png';
<img src={capa.src} alt="..." />
```

---

## 4. Vídeo (`VideoPlayer`)

`videoId`, `chapters` e `transcript` vivem no frontmatter mas **não** estão no schema. Para
usá-los, leia o `frontmatter` cru e passe ao componente, **dentro do MDX**:

```mdx
import VideoPlayer from '~/components/VideoPlayer.astro';

export const { videoId, chapters, transcript } = frontmatter;

<VideoPlayer videoId={videoId} chapters={chapters} transcript={transcript} />
```

- `videoId`: ID do vídeo no YouTube (a parte depois de `watch?v=`).
- `chapters`: lista de `{ time: 'MM:SS', title: '...' }` → aba "Tópicos" clicável.
- `transcript`: lista de `{ time: 'MM:SS', text: '...' }` → aba "Transcrição" clicável.
- Clicar num timestamp pula o vídeo; o item ativo é destacado conforme o vídeo toca.
- As abas só aparecem se houver `chapters` e/ou `transcript`.
- Pode haver mais de um `VideoPlayer` na mesma aula (cada um ganha ids próprios).

---

## 5. Citações e referências

> Funciona **somente** em aulas (dentro do `AulaLayout`). Não funciona no blog.

1. Declare as fontes no frontmatter em `references:` (ver exemplo na seção 2). Campos:
   - `key` (obrigatório, único — ex.: `mayr1942`), `title` (obrigatório), `text` (a citação
     formatada que aparece na lista). Opcionais: `author`, `year`, `doi` (URL), `url` (URL),
     `scholar_query` (texto da busca no Google Scholar).
2. No corpo, cite inline:
   ```mdx
   ...isolamento reprodutivo <Cite refKey="mayr1942" /> é o critério central.
   ```
   Vira um `[n]` clicável (numerado por ordem de 1ª aparição) que abre um popover com o
   texto + links (DOI · Link · Google Scholar).
3. Onde quiser a lista numerada final, coloque:
   ```mdx
   <ReferenceList />
   ```
   A `<ol>` é montada no cliente a partir das `references` e da ordem das citações.

A mesma `key` pode ser citada várias vezes — ela mantém o mesmo número.
Detalhes da implementação interna (um único script, `src/scripts/citations-hydrate.js`) estão no `CLAUDE.md`, seção 10.

---

## 6. Catálogo de componentes editoriais

Todos ficam em `src/components/`. Props com ✱ são obrigatórias.

### `Image` — imagem com base aplicada
`<Image src="imagens/charge.png" alt="..." class="opcional" />`
- `src`✱ (caminho **relativo a `public/`**, sem barra inicial), `alt`✱, `class`.
- Já prefixa a `base` do site — **não** prefixe você. Para fotos grandes, prefira importar
  como módulo (seção 3).

### `Figure` — figura com legenda
```mdx
<Figure legenda="Fig. 1 — Esquema do IMRaD.">
  <Image src="imagens/imrad.png" alt="..." />
</Figure>
```
- `legenda`✱ (string). O conteúdo (imagem, tabela…) vai no slot.

### `NotaDeMargem` — anotação na margem
```mdx
<NotaDeMargem resumo="A cultura surge da comunicação" lado="direita" cor="#22375a" largura="22ch" offset="2rem" icone="✎">
  <p>Parágrafo principal que recebe a anotação ao lado.</p>
</NotaDeMargem>
```
- `resumo`✱ (texto curto da margem), `lado` (`'direita'`|`'esquerda'`, default `'direita'`),
  `cor` (nome de uma tinta da paleta — `'jade'`, `'vinho'`, `'ardosia'`, `'tinta'`, `'salvia'`… —
  ou qualquer cor CSS/hex; default `'jade'`), `largura` (default `'18ch'`),
  `offset` (default `'1.5rem'`), `icone` (default `'✎'`; passe `icone=""` para nenhum).
- **Onde aparece:** em tela larga (≥1280px) a nota fica na margem **direita**, sempre visível — a
  aula ganha sozinha uma coluna de margem (de ~14rem, que também limita a largura da nota).
  Em telas menores ela vira um bloco destacado acima do parágrafo.
- **Evite `lado="esquerda"`:** à esquerda fica o menu de aulas, então nesse lado a nota só aparece
  quando o leitor ativa o "Modo leitura". Mesmo assim, não use a nota para informação essencial —
  ela resume o parágrafo, não o substitui.

### `InfoBox` — caixa de destaque com ícone
```mdx
<InfoBox type="dica" title="Dica de ouro">
  Conteúdo da dica.
</InfoBox>
```
- `type`: `'dica'` | `'atencao'` | `'saiba-mais'` (default) | `'chave'` — define ícone e cor.
- `title` (opcional). Conteúdo no slot.

### `BoxArtigo` — caixa editorial de duas colunas
```mdx
<BoxArtigo palette="vermelho" title="A Comunicação é Universal" imagem={capa.src}>
  <span slot="legenda">Imagem: legenda</span>
  <div slot="coluna-esquerda"><p>...</p></div>
  <div slot="coluna-direita"><p>...</p></div>
</BoxArtigo>
```
- `palette`: `'neutro'` (default) | `'vermelho'` | `'roxo'`. `title` (opcional),
  `imagem` (URL já resolvida, ex.: `capa.src`).
- Slots: `legenda`, `coluna-esquerda`, `coluna-direita`.
- ⚠️ A prop correta é **`palette`**. Conteúdo antigo usa `type="chave"`, que **não existe**
  aqui (cai numa classe sem estilo). Ao tocar nesses trechos, troque `type` por `palette`.

### `PullOutBox` — caixa flutuante (texto flui ao redor)
```mdx
<PullOutBox align="right">
  <p>Citação ou destaque que "flutua" ao lado do texto.</p>
</PullOutBox>
```
- `align`: `'left'` (default) | `'right'`. Ocupa ~45% da largura (vira coluna no mobile).

### `Sintese` — caixa "Síntese" de fechamento
```mdx
<Sintese>
  <p>Pontos principais da aula.</p>
</Sintese>
```
- Sem props. Slot = conteúdo. Renderiza o título "Síntese" centralizado.

### `LaboratorioMental` — seção temática com selo
```mdx
<LaboratorioMental title="Laboratório Mental">
  Experimento mental / conteúdo principal.
</LaboratorioMental>
```
- `title` (default `"Laboratório Mental"`). Tem um "O que é esta seção?" expansível embutido.

### `Divider` — divisor ornamental
```mdx
import divisor from '~/../public/imagens/divider3.png';
<Divider image={divisor.src} />
```
- `image`✱ (URL). Sem `image`, não renderiza nada.

### `Table` — tabela a partir de JSON
```mdx
import conceitos from '~/data/conceitos.json';
<Table data={conceitos} />
```
- `data`✱: objeto `{ headers: [{ key, label }], rows: [{ <key>: valor, ... }] }`.
- O padrão é manter os dados em `src/data/*.json` e importar. Responsiva (vira "cards" no mobile).

### `Cite` / `ReferenceList` — citações
Ver seção 5.

---

## 7. Classes CSS utilitárias (definidas em `public/estilos.css`)

Algumas classes globais usadas direto no MDX (HTML cru é permitido em MDX):
- `paragrafo-destaque` — parágrafo em destaque (ex.: epígrafe/citação).
- `paragrafo-capitular` — primeiro parágrafo com capitular (letra inicial grande).
- `ciclos-container` + `ciclo-item` — grade de "ciclos" (ver `introducao.mdx`).
- `charge-artigo` — moldura para charges/ilustrações com `<figure>`.

Se precisar de uma classe nova recorrente, adicione em `public/estilos.css` (CSS global do
site principal). Estilos pontuais de um componente ficam no `<style>` do próprio `.astro`.

---

## 8. Checklist ao criar/editar uma aula

- [ ] Pasta `aulaNN/index.mdx` criada (ou arquivo solto, se for conteúdo avulso).
- [ ] Frontmatter com `title`, e — se for entrar no menu — `menu: true` **e** `ordem: NN`.
- [ ] `tipo: 'video'` ou `'texto'` (define o ícone no menu).
- [ ] Se houver vídeo: `videoId/chapters/transcript` no frontmatter + `export const {...} = frontmatter` + `<VideoPlayer/>`.
- [ ] Se houver citações: `references:` no frontmatter + `<Cite/>` no texto + `<ReferenceList/>` no fim.
- [ ] Imagens em `public/imagens/`, referenciadas via `<Image/>` ou import de módulo (nunca com caminho absoluto sem base).
- [ ] `npm run build` passa sem erro.
- [ ] Conferir no `npm run dev` que o menu lateral, o "Modo leitura" e os popovers de citação funcionam.
```
