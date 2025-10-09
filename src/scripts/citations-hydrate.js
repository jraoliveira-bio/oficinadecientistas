(() => {
  const ready = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn();

  ready(() => {
    const log = (...a) => console.log('[OC(H) LIST]', ...a);

    // utilzinho pra montar a lista a partir dos botões e do REFS
    function buildList() {
      const host = document.querySelector('[data-ref-list]');
      if (!host) { log('sem host [data-ref-list]'); return; }

      // 1) ordem por primeira aparição (via botões prontos)
      const buttons = [...document.querySelectorAll('.oc-cite-button')];
      const seen = new Set(); const order = [];
      buttons.forEach(b => {
        const k = b.getAttribute('data-key');
        if (k && !seen.has(k)) { seen.add(k); order.push(k); }
      });
      log('ordem:', order);

      // 2) refs do meta
      const meta = document.getElementById('oc-refs');
      const REFS = JSON.parse(decodeURIComponent(meta?.dataset.refs || '[]'));
      const refByKey = new Map(REFS.map(r => [String(r.key), r]));

      // --- INÍCIO DO PATCH ---
      // (NOVO) Atualiza o conteúdo de popovers existentes com os dados de REFS
      (() => {
        const btns = [...document.querySelectorAll('.oc-cite-button')];
        btns.forEach((btn) => {
          const key = btn.getAttribute('data-key');
          const pop = btn.nextElementSibling;
          if (!key || !pop || !pop.classList?.contains('oc-popover')) return;

          const ref = refByKey.get(key);
          if (!ref) {
            pop.innerHTML = `<div class="oc-pop-body"><p class="oc-pop-text">Referência não encontrada: ${key}</p></div>`;
            return;
          }

          // (Re)monta o conteúdo do popover a partir de REFS
          const scholarURL = (r) => {
            const q = r.scholar_query || [r.author, r.title, r.year].filter(Boolean).join(' ');
            return q ? 'https://scholar.google.com/scholar?q=' + encodeURIComponent(q) : null;
          };
          const makeLink = (href, label) => {
            const a = document.createElement('a');
            a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = label;
            return a;
          };

          pop.innerHTML = ''; // limpa o que veio do SSR
          const close = document.createElement('button');
          close.className = 'oc-pop-close';
          close.type = 'button';
          close.setAttribute('aria-label', 'Fechar');
          close.textContent = '×';

          const body = document.createElement('div');
          body.className = 'oc-pop-body';

          const p = document.createElement('p');
          p.className = 'oc-pop-text';
          p.textContent = ref.text || [ref.author, ref.year, ref.title].filter(Boolean).join(' — ');
          body.appendChild(p);

          const links = [];
          if (ref.doi) links.push(makeLink(ref.doi, 'DOI'));
          if (ref.url) links.push(makeLink(ref.url, 'Link'));
          const sch = scholarURL(ref); if (sch) links.push(makeLink(sch, 'Google Scholar'));
          if (links.length) {
            const lp = document.createElement('p'); lp.className = 'oc-pop-links';
            links.forEach((a, i) => { if (i) lp.append(document.createTextNode(' · ')); lp.append(a); });
            body.appendChild(lp);
          }

          pop.append(close, body);
        });
      })();
      // --- FIM DO PATCH ---

      // 3) constrói a lista
      const h2 = document.createElement('h2');
      h2.className = 'oc-ref-title';
      h2.textContent = 'Referências';

      const ol = document.createElement('ol');
      ol.className = 'oc-ref-ol';
      ol.style.listStyle = 'decimal';
      ol.style.paddingLeft = '1.25rem';
      ol.style.margin = '.5rem 0';

      order.forEach((key, i) => {
        const li = document.createElement('li');
        li.className = 'oc-ref-item';
        const ref = refByKey.get(key);
        if (ref) {
          li.textContent = ref.text || [ref.author, ref.year, ref.title].filter(Boolean).join(' — ');
        } else {
          li.textContent = `[${i + 1}] Referência não encontrada: ${key}`;
        }
        ol.appendChild(li);
      });

      host.replaceChildren(h2, ol);
      log('host.innerHTML depois:', host.innerHTML);

      // 4) debug de visibilidade
      const hs = getComputedStyle(host);
      const os = getComputedStyle(ol);
      const rect = host.getBoundingClientRect();
      log('host styles', { display: hs.display, visibility: hs.visibility, opacity: hs.opacity });
      log('ol styles', { display: os.display, visibility: os.visibility, opacity: os.opacity });
      log('host rect', rect);

      // 5) fallback: se estiver invisível/altura 0, cria uma seção no fim do artigo
      const invisible = (hs.display === 'none' || hs.visibility === 'hidden' || hs.opacity === '0');
      if (invisible || rect.height < 4) {
        log('host parece invisível/colapsado — criando fallback no final do artigo');
        const article = document.querySelector('.texto-aula') || document.querySelector('article') || document.body;
        const section = document.createElement('section');
        section.className = 'oc-ref-fallback';
        section.style.borderTop = '1px solid rgba(0,0,0,.1)';
        section.style.marginTop = '1.5rem';
        section.style.paddingTop = '1rem';

        const h2b = h2.cloneNode(true);
        const olb = ol.cloneNode(true);

        section.append(h2b, olb);
        article.appendChild(section);
      }
    }

    // chama depois que os botões já existem
    requestAnimationFrame(() => {
      requestAnimationFrame(buildList);
    });
  });
})();