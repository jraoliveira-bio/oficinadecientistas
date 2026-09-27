// src/scripts/citations-hydrate.js
// ÚNICO script do sistema de citações (antes eram três, sobrepostos).
// Carregado só pelo AulaLayout. Faz tudo no cliente:
//   1. lê as referências do frontmatter, serializadas em <meta id="oc-refs" data-refs="...">;
//   2. numera os <cite class="oc-cite" data-key> (vindos de <Cite/>) pela ordem de 1ª aparição
//      e troca cada um por um botão [n] + popover;
//   3. monta a lista numerada dentro de [data-ref-list] (vindo de <ReferenceList/>),
//      com âncoras #ref-n e links DOI · Link · Google Scholar;
//   4. liga o popover: abrir/fechar no [n], botão ×, Esc, clique fora, rolagem e redimensionamento.

(() => {
  const ready = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn();

  // ---------- dados ----------
  function lerReferencias() {
    const meta = document.getElementById('oc-refs');
    try {
      return JSON.parse(decodeURIComponent(meta?.dataset.refs || '[]'));
    } catch (e) {
      console.warn('[citações] não consegui ler as referências do frontmatter', e);
      return [];
    }
  }

  const textoDaRef = (ref) =>
    ref.text || [ref.author, ref.year, ref.title].filter(Boolean).join(' — ');

  function scholarURL(ref) {
    const q = ref.scholar_query || [ref.author, ref.title, ref.year].filter(Boolean).join(' ');
    return q ? 'https://scholar.google.com/scholar?q=' + encodeURIComponent(q) : null;
  }

  // Links DOI · Link · Google Scholar, separados por " · "
  function linksDaRef(ref) {
    const pares = [];
    if (ref.doi) pares.push(['DOI', ref.doi]);
    if (ref.url) pares.push(['Link', ref.url]);
    const sch = scholarURL(ref);
    if (sch) pares.push(['Google Scholar', sch]);
    const frag = document.createDocumentFragment();
    pares.forEach(([rotulo, href], i) => {
      if (i) frag.append(' · ');
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = rotulo;
      frag.append(a);
    });
    return { frag, total: pares.length };
  }

  // ---------- montagem ----------
  function transformarCitacoes(refPorChave) {
    const numPorChave = new Map();
    const ordem = [];

    document.querySelectorAll('cite.oc-cite[data-key]').forEach((cite) => {
      const chave = cite.getAttribute('data-key');
      if (!numPorChave.has(chave)) {
        numPorChave.set(chave, ordem.length + 1);
        ordem.push(chave);
      }
      const n = numPorChave.get(chave);
      const ref = refPorChave.get(chave);
      const idPop = `oc-pop-${n}-${Math.random().toString(36).slice(2, 7)}`;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'oc-cite-button';
      btn.dataset.key = chave;
      btn.setAttribute('aria-label', `Ver referência ${n}`);
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', idPop);
      const sup = document.createElement('sup');
      sup.className = 'oc-cite-sup';
      sup.textContent = `[${n}]`;
      btn.append(sup);

      const pop = document.createElement('div');
      pop.className = 'oc-popover';
      pop.id = idPop;
      pop.hidden = true;
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-label', `Referência ${n}`);

      const fechar = document.createElement('button');
      fechar.type = 'button';
      fechar.className = 'oc-pop-close';
      fechar.setAttribute('aria-label', 'Fechar');
      fechar.textContent = '×';

      const corpo = document.createElement('div');
      corpo.className = 'oc-pop-body';
      const p = document.createElement('p');
      p.className = 'oc-pop-text';
      p.textContent = ref ? textoDaRef(ref) : `Referência não encontrada: ${chave}`;
      corpo.append(p);
      if (ref) {
        const { frag, total } = linksDaRef(ref);
        if (total) {
          const lp = document.createElement('p');
          lp.className = 'oc-pop-links';
          lp.append(frag);
          corpo.append(lp);
        }
      }

      pop.append(fechar, corpo);
      cite.replaceWith(btn, pop);
    });

    return ordem;
  }

  function montarLista(ordem, refPorChave) {
    const host = document.querySelector('[data-ref-list]');
    if (!host || !ordem.length) return;

    const h2 = document.createElement('h2');
    h2.className = 'oc-ref-title';
    h2.textContent = 'Referências';

    const ol = document.createElement('ol');
    ol.className = 'oc-ref-ol';
    ordem.forEach((chave, i) => {
      const li = document.createElement('li');
      li.className = 'oc-ref-item';
      li.id = `ref-${i + 1}`;
      const ref = refPorChave.get(chave);
      if (!ref) {
        li.textContent = `Referência não encontrada: ${chave}`;
      } else {
        li.append(textoDaRef(ref));
        const { frag, total } = linksDaRef(ref);
        if (total) {
          const span = document.createElement('span');
          span.className = 'oc-ref-links';
          span.append(' ', frag);
          li.append(span);
        }
      }
      ol.append(li);
    });

    host.replaceChildren(h2, ol);
  }

  // ---------- interação ----------
  function ligarPopovers() {
    let aberto = null; // { btn, pop }

    function fechar({ devolverFoco = false } = {}) {
      if (!aberto) return;
      aberto.pop.hidden = true;
      aberto.btn.setAttribute('aria-expanded', 'false');
      if (devolverFoco) aberto.btn.focus();
      aberto = null;
    }

    function posicionar(btn, pop) {
      const r = btn.getBoundingClientRect();
      const margem = 8;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      pop.style.left = '0px';
      pop.style.top = '-10000px';
      pop.hidden = false; // mede fora da tela, sem "piscar"
      const pr = pop.getBoundingClientRect();
      let left = Math.min(r.left, vw - pr.width - margem);
      left = Math.max(margem, left);
      let top = r.bottom + margem;
      if (top + pr.height > vh - margem) top = Math.max(margem, r.top - pr.height - margem);
      pop.style.left = Math.round(left) + 'px';
      pop.style.top = Math.round(top) + 'px';
    }

    // Um único ouvinte no documento cobre botões [n], o × e o clique fora
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.oc-cite-button');
      if (btn) {
        const pop = document.getElementById(btn.getAttribute('aria-controls'));
        if (!pop) return;
        if (aberto && aberto.pop === pop) { fechar(); return; }
        fechar();
        posicionar(btn, pop);
        btn.setAttribute('aria-expanded', 'true');
        aberto = { btn, pop };
        return;
      }
      if (e.target.closest('.oc-pop-close')) { fechar({ devolverFoco: true }); return; }
      if (aberto && !aberto.pop.contains(e.target)) fechar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') fechar({ devolverFoco: true });
    });
    window.addEventListener('scroll', () => fechar(), { passive: true });
    window.addEventListener('resize', () => fechar());
  }

  ready(() => {
    if (!document.querySelector('cite.oc-cite[data-key], [data-ref-list]')) return;
    const refs = lerReferencias();
    const refPorChave = new Map(refs.map((r) => [String(r.key), r]));
    const ordem = transformarCitacoes(refPorChave);
    montarLista(ordem, refPorChave);
    ligarPopovers();
  });
})();
