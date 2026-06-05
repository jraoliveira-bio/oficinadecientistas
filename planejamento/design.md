# Plano de Implementação do Design — Oficina de Cientistas

Documento de planejamento (vivo). Registra a **direção de design** acordada e um **roteiro de
implementação do mais simples ao mais rebuscado**. Contexto geral do projeto e regras técnicas
estão no [`../CLAUDE.md`](../CLAUDE.md). O catálogo de ícones a virar ilustração está em
[`icones.html`](icones.html).

> **Status:** projeto em **alfa**. As vídeo-aulas atuais são placeholder. Este plano é a direção,
> não um contrato — a ordem pode mudar.
>
> **Ordem combinada com o autor:** primeiro deixar a **estrutura robusta** (corrigir bugs e
> inconsistências — ver seção "Fase 0"); o **redesign começa depois disso**.

---

## Norte de design: "caderno de naturalista, editorial e moderno"

Cruzamento de **diário de campo de naturalista** com **site editorial contemporâneo**: sóbrio,
analógico-pessoal (papel, tinta, manuscrito) e atual — o oposto do genérico de IA.

**Princípios que guiam toda decisão:**
1. **Personalidade humana de propósito.** Ilustração autoral, voz própria, toques editoriais.
   Na dúvida, escolha o que parece *feito por uma pessoa*, não por template.
2. **Sobriedade é qualidade — o que envelhece o site é o *chrome*** (ícones genéricos, barras
   sólidas, caixas com borda+sombra+gradiente), não a contenção. Troque chrome por **tipografia,
   papel e o motivo do micélio**.
3. **A identidade já existe: o cogumelo / micélio.** "O corpo visível de uma vasta rede
   subterrânea que conecta ecossistemas." Use isso como sistema visual, não só como logo.
4. **Pensar em escala.** É uma plataforma **multi-curso** (escrita, estatística, ecologia, R…).
   Tudo que for criado deve servir a N cursos e ser herdável barato.
5. **Site ↔ Blog = "espelho estranho".** Inversão **intencional** (cor de destaque do site → cor
   base do blog). O blog vem **depois** do principal estável.

**Manter (é o que tem alma):** paleta terrosa contida (jade/vinho/ardósia), leitura serifada,
ilustrações autorais (gato, charges), textura de papel, toque de máquina de escrever, a calma,
o instinto de "assinatura" do Manifesto.

**Trocar (é o que data/pesa):** FontAwesome, header de barra sólida, herói com emblema+tagline
em caixa-alta, card+borda+sombra+gradiente, justificado na web, simetria centralizada em caixa.

---

## Roteiro (do mais simples ao mais avançado)

Cada fase é incremental e (idealmente) entregável sozinha. Risco e dependências marcados.

### Fase 0 — Robustez primeiro (pré-design) · risco baixo
*Não é design, mas é pré-requisito. Detalhes na seção "Dívidas técnicas" do CLAUDE.md.*
- Corrigir os bugs confirmados: **responsivo das aulas no mobile**, **persistência do modo
  leitura**, **bloco vazio da home**, e os placeholders/erros de marcação do "Sobre"
  (link do Lattes, parêntese aberto, `src` sem chaves em `QuemSouEu.astro`).
- Higiene de repositório (`.gitignore`, tirar `node_modules`/`dist` do versionamento) — alinhar antes.
- **Por quê:** redesenhar sobre estrutura quebrada retrabalha tudo. Estrutura sólida = redesign limpo.

### Fase 1 — Sistema de tokens & tipografia · risco baixo · **maior alavanca**
- Criar um **design system do site principal** (hoje só o blog tem tokens `--oc-*`): cores
  **nomeadas**, **escala tipográfica**, escala de espaçamento, **UMA escala de raio**, **UMA
  linguagem de elevação** (ou hairline, ou sombra suave — nunca os dois).
- Reduzir para **~3 famílias de fonte** com papéis claros: display serifado (títulos), serif/sans
  de leitura (corpo) e a **máquina de escrever reservada só como assinatura**.
- (Opcional) Auto-hospedar e *subsetar* as fontes — performance + controle.
- **Por quê:** define o "vocabulário". Tudo depois fica consistente e barato de repetir por curso.

### Fase 2 — Aliviar o *chrome* (de-blocar) · risco baixo · só CSS
- **Header mais leve:** papel/off-white + filete (hairline) embaixo; *wordmark* no lugar de
  logo+`<h1>`; nav mais simples. O conteúdo deve ser o elemento mais forte da tela, não a barra.
- **Footer** mais discreto.
- Trocar **borda+sombra+gradiente** por **painéis planos sobre textura de papel separados por
  espaço e filetes**. Aplicar a UMA linguagem de elevação (Fase 1).
- Remover `backdrop-filter: blur`; conter `hover` (menos `translateY`) e transições.
- **Tirar o texto justificado da web geral** — manter justificado só dentro da aula (contexto "livro").
- **Por quê:** é o remédio direto para o "blocado/quadradão/pesado".

### Fase 3 — Diagramação editorial & ritmo · risco médio
- Escala de tipos **confiante** (títulos grandes e quietos fazem o trabalho que os ícones/caixas faziam).
- Medida de leitura confortável (~65ch), ritmo vertical, **mais ar** entre e dentro das seções.
- Menos divisores; usá-los como momentos especiais, não como "linhas em todo lugar".
- Introduzir **assimetria** e momentos *full-bleed* (ex.: Manifesto sobre papel, de ponta a ponta).
- **Por quê:** o que mais lê como "atual" sem perder sobriedade.

### Fase 4 — Ilustrações no lugar dos ícones · depende de arte
- Produzir o conjunto de ilustrações (ver [`icones.html`](icones.html)) no traço autoral
  (estilo do logo do cogumelo + charges).
- Substituir os `<i class="fa-…">` por **SVG inline** e **remover a dependência do FontAwesome**
  (CDN) — perf + des-generaliza num golpe.
- (Opcional) Marcas de interface em traço de tinta (setas `→`, fechar `×`, etc.).
- **Por quê:** os ícones FontAwesome são o sinal nº 1 de "template antigo"; trocá-los é o maior
  salto de personalidade.

### Fase 5 — Identidade do micélio como sistema visual · risco médio
- Motivo de **fios miceliais / esporos** como linguagem recorrente: divisores, conexões sutis
  entre seções, ritmo de pontos.
- **Grade de cursos como "rede que cresce"** (em vez de fileira de cards).
- **Por quê:** dá uma linguagem visual **própria e inconfundível**, ancorada na metáfora do projeto.

### Fase 6 — Sistema multi-curso (escala) · risco médio-alto
- Componentizar o **layout de curso** para servir a N cursos (hoje amarrado ao de escrita).
- Tornar **grade e menu data-driven** por coleção (acabar com a grade hardcoded).
- Definir um **"kit de personalidade" reutilizável** (estilo de ilustração, 2–3 componentes
  assinatura, guia curto de voz) que cada novo curso herda.
- **Por quê:** sem isso, o curso 1 tem alma e os cursos 5–10 viram template por falta de fôlego.

### Fase 7 — O "espelho estranho" (blog) · risco médio · **por último**
- Só depois do site principal estável: refazer o blog saindo do *default de IA*.
- Aplicar as **inversões** (cor de destaque do site → cor base do blog, e outras), mantendo
  **estrutura/hierarquia/tipografia rimando** — para o reflexo ser legível como espelho, e não
  como "dois sites soltos".

---

## Dependências rápidas

- Fases 2–3 dependem da **Fase 1** (tokens/tipografia).
- Fase 4 depende de **produção de arte** (paralelizável com 1–3).
- Fase 7 depende do site principal estar **fechado** (Fases 1–5).

## Ideias soltas / a decidir depois
- Auto-hospedar FontAwesome→remover, ou trocar por SVGs (Fase 4 resolve).
- `youtube-nocookie.com` no `VideoPlayer` (privacidade) — cabe na Fase 0/robustez.
- Definir paleta nomeada definitiva (e como ela inverte para o blog).
