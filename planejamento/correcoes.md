# Plano de Ação — Correções e Robustez

Tarefas para deixar a **estrutura sólida antes do redesign**. Corresponde à **Fase 0** do
[`design.md`](design.md) e detalha a seção "Dívidas técnicas" do [`../CLAUDE.md`](../CLAUDE.md).

> **Escopo:** só **estrutura, bugs e inconsistências** — sem mudança de design (isso é o `design.md`).
> Documento **vivo**: marque `[x]` conforme for fechando.

**Como trabalhar:**
- Faça em **branch** separada do `main` (o push na `main` publica em produção).
- Rode **`npm run build`** depois de cada bloco — é a principal rede de segurança (não há testes).
- Para os bugs visuais, **re-tire screenshot** (o fluxo com `playwright-core` + Chrome já foi usado;
  ver `C:\Users\strid\Desktop\oc-screenshots`).
- Itens marcados **⚠️ alinhar antes** mexem em algo grande/sensível — confirmar comigo antes de executar.

---

## P0 — Bugs que quebram a experiência

- [ ] **P0.1 · Aulas ilegíveis no mobile** 🔴
  - **Arquivo:** `src/layouts/AulaLayout.astro` (`<style>`).
  - **Sintoma:** em telas estreitas o menu lateral (320px fixos) esmaga o conteúdo; texto e notas
    de margem viram ~1 caractere por linha (ver `10-aula01-mobile.png`).
  - **Causa:** `grid-template-columns: var(--menu-largura) 1fr` sem nenhum `@media` para mobile.
  - **Correção:** adicionar breakpoint (`max-width: ~768px`) que **empilhe ou recolha** o menu —
    ex.: transformá-lo em "gaveta" deslizante acionada por botão, ou colapsar a coluna do menu
    (a lógica do "modo leitura", que zera a coluna, é metade do caminho) e mostrar um acesso ao índice.
  - **Risco:** médio (mexe no layout-chave das aulas). **Verificar:** screenshot mobile 390px + 360px.

- [ ] **P0.2 · "Modo leitura" não persiste no reload** 🟠
  - **Arquivos:** `src/layouts/Layout.astro` (preload no `<head>`) e `src/layouts/AulaLayout.astro`
    (preload inline).
  - **Sintoma:** ativa no clique, mas ao recarregar volta ao normal (confirmado: `body` não recebe
    `modo-leitura-ativo`; ver `13-leitura-after-reload.png`).
  - **Causa provável:** o preload do `Layout` adiciona a classe ao `<html>` (root), mas o CSS das
    aulas chaveia em **`body.modo-leitura-ativo`**; o preload do `AulaLayout` que adicionaria ao
    `body` não está surtindo efeito antes do paint.
  - **Correção:** garantir, **antes do primeiro paint**, que `modo-leitura-ativo` seja aplicado ao
    `body` (ou unificar o CSS para chavear no `<html>`). Investigar a ordem de execução dos dois
    scripts de preload e consolidar num só.
  - **Risco:** baixo-médio. **Verificar:** ativar → F5 → continua em modo leitura.

- [ ] **P0.3 · Imagens quebradas no "Sobre" (foto + logo)** 🟠
  - **Arquivo:** `src/components/secoes-sobre/QuemSouEu.astro` (linhas ~18 e ~23).
  - **Sintoma/Causa:** `src` escrito como template literal **sem chaves** —
    `` src=`${base}imagens/joaooliveira.jpg` `` — sintaxe inválida em Astro; provavelmente a foto e
    o logo não carregam.
  - **Correção:** usar `src={`${base}imagens/joaooliveira.jpg`}` (idem para o logo). Conferir as
    duas imagens carregando.
  - **Risco:** baixo. **Verificar:** abrir `/sobre/` e ver foto + logo.

- [ ] **P0.4 · Bloco cinza vazio na home** 🟡
  - **Arquivos:** `src/pages/index.astro`, `src/components/home/CoverCard.astro`,
    `public/imagens/prancheta-card.png`.
  - **Sintoma:** o cover "A Prancheta" renderiza uma área grande e vazia (ver `01-home-desktop.png`).
  - **Causa:** a investigar — imagem da capa não aparece (caminho/`base`?) e/ou há só 1 cover num
    grid 2-up que deixa metade vazia.
  - **Correção:** corrigir/garantir a imagem da capa; fazer o grid de covers se adaptar a 1 item
    (ocupar a largura ou centralizar) com fallback de altura.
  - **Risco:** baixo. **Verificar:** screenshot da home.

---

## P1 — Inconsistências visíveis ao usuário (conteúdo / menu / placeholders)

- [ ] **P1.1 · Duas aulas com `ordem: 2` (menu fora de ordem)**
  - **Arquivos:** `src/content/curso-escrita/precisao.mdx` e `precisao2.mdx` — ambas `ordem: 2`,
    `menu: true`, com títulos diferentes ("É preciso ser preciso:" e "Exatidão e Precisão…").
  - **Causa:** parecem **versões concorrentes** da mesma aula; ordenação do menu fica indefinida.
  - **Correção:** decidir qual fica; ajustar `ordem` para sequência única (1,2,3,…). A outra:
    arquivar, `menu:false` ou `draft:true`. ⚠️ **alinhar antes** (é decisão de conteúdo).

- [ ] **P1.2 · "Sala prototipo" aparece no menu público**
  - **Arquivo:** `src/content/curso-escrita/prototype/index.mdx` (`menu: true`, `ordem: 7`).
  - **Correção:** `menu: false` (ou `draft: true`) enquanto for sala de teste — não deve aparecer
    para o aluno.

- [ ] **P1.3 · Menu usa `title` longo em vez de `shortTitle`**
  - **Arquivo:** `src/layouts/AulaLayout.astro` (monta o menu com `aula.data.title`).
  - **Sintoma:** títulos inconsistentes no menu ("Aula 01: …" vs "É preciso ser preciso:" vs
    "Exatidão e Precisão - A Primeira Virtude da Ciência").
  - **Correção:** usar `shortTitle ?? title` no menu e padronizar os `shortTitle` (ex.: "Aula 0N: …").

- [ ] **P1.4 · Ordenação do menu sem proteção**
  - **Arquivo:** `AulaLayout.astro` — `sort((a,b)=>a.data.ordem - b.data.ordem)`.
  - **Causa:** `ordem` é opcional no schema; se faltar, vira `NaN` e quebra a ordenação.
  - **Correção:** fallback (`a.data.ordem ?? 999`) ou tornar `ordem` obrigatório quando `menu:true`.

- [ ] **P1.5 · Texto placeholder (lorem ipsum / descrições vazias)**
  - **Arquivos:** `src/pages/cursos/index.astro` (parágrafo "Lorem ipsum…"),
    `src/pages/cursos/curso-escrita/index.astro` (acordeão "Descrição da Aula 01…").
  - **Correção:** substituir por texto real (ou esconder seções ainda sem conteúdo).

- [ ] **P1.6 · Marcadores de sanity-check no blog**
  - **Arquivo:** `src/pages/blog/[slug].astro` — renderiza `[pré-conteúdo]` e `[pós-conteúdo]`.
  - **Correção:** remover as duas linhas de debug.

- [ ] **P1.7 · Links de menu para páginas inexistentes**
  - **Arquivo:** `src/components/Header.astro` — `/aulas-especiais/` e `/links/` dão 404.
  - **Correção:** criar páginas-stub **ou** remover do nav até existirem. ⚠️ **alinhar antes**
    (são seções planejadas).

- [ ] **P1.8 · Link do Lattes é placeholder**
  - **Arquivo:** `QuemSouEu.astro` — `href="[SEU LINK LATTES]"`.
  - **Correção:** colocar a URL real (ou remover o link até ter).

- [ ] **P1.9 · Erros de texto no "Sobre → Bastidores"**
  - **Arquivo:** `src/components/secoes-sobre/Bastidores.astro`.
  - **Sintoma:** parêntese aberto sem fechar — "construção com IAs (Gemini e eventualmente,
    ChatGPT." — e "o sua construção".
  - **Correção:** revisar a redação.

- [ ] **P1.10 · Aspa sobrando em atributo**
  - **Arquivo:** `src/pages/cursos/index.astro` — `<a href={`${base}cursos/curso-escrita/`}"` (aspa
    dupla extra após a chave).
  - **Correção:** remover a aspa.

- [ ] **P1.11 · Rastreadores do YouTube (privacidade)**
  - **Arquivo:** `src/components/VideoPlayer.astro`.
  - **Sintoma:** o embed dispara requests a `doubleclick.net` (erros no console).
  - **Correção:** usar host `youtube-nocookie.com` na API/iframe.

---

## P2 — Higiene de código / dívida técnica

- [ ] **P2.1 · Logs de debug em produção**
  - **Arquivo:** `src/scripts/citations-hydrate.js` — vários `console.log('[OC(H) LIST]', …)`.
  - **Correção:** remover (ou guardar atrás de um flag de dev).

- [ ] **P2.2 · `BoxArtigo`: `type` vs `palette`**
  - **Arquivos:** `src/components/BoxArtigo.astro` (prop é `palette`) e `aula01/index.mdx`
    (usa `type="chave"`, que não existe → cai em classe sem estilo).
  - **Correção:** trocar `type` por `palette` no MDX (ou aceitar ambos no componente p/ retrocompat).

- [ ] **P2.3 · Consolidar o sistema de citações**
  - **Arquivos:** `Layout.astro` (inline), `AulaLayout.astro` (inline), `scripts/citations-hydrate.js`,
    `plugins/rehype-citations.mjs` (inerte p/ o fluxo `<Cite/>`), `plugins/remark-cite-to-html.mjs`
    (não registrado / legado).
  - **Sintoma:** 3 scripts client-side sobrepostos + 1 plugin de build inerte + 1 legado morto.
  - **Correção:** unificar num único caminho (idealmente resolver no build e deixar só um JS pequeno
    para os popovers); remover o que estiver morto. ⚠️ **alinhar antes** (refator de risco médio —
    entender os 3 scripts antes de mexer; é fácil quebrar a numeração/lista).

- [ ] **P2.4 · Padronizar `base` e aliases (gradual)**
  - **Sintoma:** dois aliases (`~` e `@`) p/ o mesmo `src/`; duas estratégias de `base`
    (`withBase()` vs cálculo inline copiado em ~10 arquivos).
  - **Correção:** adotar **`withBase()`** como padrão único e ir migrando os cálculos inline; escolher
    um alias. Baixa prioridade, fazer aos poucos para não inflar diffs.

---

## P3 — Infraestrutura / repositório

- [ ] **P3.1 · `.gitignore` + tirar `node_modules`/`dist` do versionamento** ⚠️ **alinhar antes**
  - **Sintoma:** não existe `.gitignore`; ~9,7k arquivos de `node_modules` e `dist/` versionados.
  - **Correção:** criar `.gitignore` (`node_modules/`, `dist/`, `.astro/`) e
    `git rm -r --cached node_modules dist .astro` num commit dedicado.
  - **Risco:** mecânico, mas é um commit grande/barulhento — fazer isolado e com cuidado.

- [ ] **P3.2 · (Opcional, futuro) Astro 5 → 6**
  - O dev avisa que há Astro 6 disponível (projeto está no 5.11). Upgrade traz migração da API de
    content collections (hoje na API legada `getCollection`/`.slug`/`.render()`).
  - **Decisão:** **não agora.** Avaliar depois da robustez, em branch isolada, com `npm run build`
    de regressão. ⚠️ **alinhar antes.**

---

## Melhorias estruturais (além de bugs)

- [ ] **M.1 · Grade curricular data-driven.** O acordeão em `cursos/curso-escrita/index.astro` é
  hardcoded (Aula 01/02 à mão). Gerar a partir de `getCollection('curso-escrita')` — também serve
  à escala multi-curso (ver `design.md`, Fase 6).
- [ ] **M.2 · Preparar o "layout de curso" para N cursos.** Hoje há rotas/landing amarradas a
  `curso-escrita`. Generalizar antes de criar Estatística/Ecologia (ver `design.md`, Fase 6).

---

## Ordem de execução sugerida

1. **P0.3, P0.4, P1.6, P1.10, P1.5** — correções rápidas e seguras (imagens, bloco vazio, lixo/placeholders).
2. **P0.1** — responsivo das aulas no mobile (maior impacto de UX).
3. **P0.2** — persistência do modo leitura.
4. **P1.1, P1.2, P1.3, P1.4** — consistência do menu/aulas (conteúdo — alinhar P1.1).
5. **P1.7, P1.8, P1.9, P1.11** — nav, Lattes, texto do Sobre, privacidade do vídeo.
6. **P2.1, P2.2** — limpeza de código rápida.
7. **P3.1** — higiene de git (commit isolado).
8. **P2.3 / M.1 / M.2** — refatores maiores, já preparando o terreno do redesign.

> Ao terminar: `npm run build` limpo + screenshots de regressão (home, aula desktop, **aula mobile**,
> modo leitura após reload, blog).
