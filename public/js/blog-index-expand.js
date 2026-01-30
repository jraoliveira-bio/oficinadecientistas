/* Expansão in-place com animação de altura + opacidade */
(function () {
  const links = /** @type {NodeListOf<HTMLAnchorElement>} */ (
    document.querySelectorAll('[data-behavior="expand-link"]')
  );

  function measureOpen(panel) {
    panel.removeAttribute('hidden');
    panel.classList.add('is-open');
    panel.style.height = 'auto';
    const h = panel.scrollHeight;
    panel.style.height = '0px';
    // força um reflow para a transição ler o estado inicial
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = panel.offsetHeight;
    return h;
  }

  function expand(panel, link) {
    const h = measureOpen(panel);
    panel.style.opacity = '1';
    panel.style.height = h + 'px';
    if (link) link.setAttribute('aria-expanded', 'true');

    const onEnd = () => {
      panel.style.height = 'auto'; // para acomodar conteúdo dinâmico depois
      panel.removeEventListener('transitionend', onEnd);
    };
    panel.addEventListener('transitionend', onEnd);
    panel.setAttribute('tabindex', '-1');
    try { panel.focus({ preventScroll: false }); } catch {}
  }

  function collapse(panel, link) {
    const h = panel.scrollHeight;
    panel.style.height = h + 'px';
    // reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = panel.offsetHeight;
    panel.style.height = '0px';
    panel.style.opacity = '0';
    if (link) link.setAttribute('aria-expanded', 'false');

    const onEnd = () => {
      panel.setAttribute('hidden', '');
      panel.classList.remove('is-open');
      panel.removeEventListener('transitionend', onEnd);
    };
    panel.addEventListener('transitionend', onEnd);
  }

  // expõe colapso p/ integração com filtro
  window.__ocCollapse = collapse;

  function closeAll(exceptId) {
    document.querySelectorAll('.post-expand.is-open').forEach((p) => {
      if (p.id === exceptId) return;
      const slug = p.id.replace(/^expand-/, '');
      const link = document.getElementById('link-' + slug);
      collapse(p, link);
    });
  }

  links.forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = a.getAttribute('aria-controls');
      if (!id) return;
      const panel = document.getElementById(id);
      if (!panel) return;

      const isOpen = panel.classList.contains('is-open');
      if (isOpen) {
        collapse(panel, a);
      } else {
        closeAll(id);         // comente esta linha se quiser múltiplos abertos
        expand(panel, a);
      }
    });
  });
})();
