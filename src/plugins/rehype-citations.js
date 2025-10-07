// src/plugins/rehype-citations.js

/** @typedef {import('hast').Root} Root */
/** @typedef {import('hast').Element} Element */
import { visit } from 'unist-util-visit';

/**
 * Rehype plugin que:
 * - coleta <cite class="oc-cite" data-key="..."> na ordem de aparição
 * - numera por primeira aparição e substitui por <button><sup>[n]</sup></button> + popover adjacente
 * - preenche <div data-ref-list> com a lista ordenada final
 */
export default function rehypeCitations() {
  return /** @param {Root} tree @param {any} file */ (tree, file) => {
    const fm = file?.data?.astro?.frontmatter ?? {};
    const refs = Array.isArray(fm.references) ? fm.references : [];
    /** @type {Map<string, any>} */
    const refByKey = new Map(refs.map((r) => [r.key, r]));

    /** @type {Map<string, number>} */
    const numByKey = new Map();
    /** @type {string[]} */
    const order = [];

    // 1) Substituir cada <cite> por botão numerado + popover
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.tagName !== 'cite') return;

      const cls = toArray(node.properties?.className).map(String);
      if (!cls.includes('oc-cite')) return;

      const key = String(node.properties?.['data-key'] ?? '');
      if (!key) return;

      if (!numByKey.has(key)) {
        numByKey.set(key, order.length + 1);
        order.push(key);
      }
      const n = numByKey.get(key);

      // Construir botão [n]
      /** @type {Element} */
      const btn = {
        type: 'element',
        tagName: 'button',
        properties: {
          className: ['oc-cite-button'],
          'data-key': key,
          'data-cite-num': String(n),
          'aria-label': `Ver referência [${n}]`,
          type: 'button',
        },
        children: [
          {
            type: 'element',
            tagName: 'sup',
            properties: { className: ['oc-cite-sup'] },
            children: [{ type: 'text', value: `[${n}]` }],
          },
        ],
      };

      const ref = refByKey.get(key);
      const popChildren = ref
        ? buildPopoverChildren(ref, n)
        : [
            { type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: 'Referência não encontrada: ' }] },
            { type: 'text', value: key },
          ];

      /** @type {Element} */
      const pop = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['oc-popover'],
          hidden: true,
          role: 'dialog',
          'aria-modal': 'false',
          'data-cite-popover': String(n),
        },
        children: popChildren,
      };

      // Substitui <cite> por [botão, popover]
      parent.children.splice(index, 1, btn, pop);
    });

    // 2) Preencher <div data-ref-list> com a lista ordenada
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'div') return;
      if (node.properties?.['data-ref-list'] === undefined) return;

      /** @type {Element[]} */
      const items = order.map((key, i) => {
        const num = i + 1;
        const ref = refByKey.get(key);
        return {
          type: 'element',
          tagName: 'li',
          properties: { id: `ref-${num}`, className: ['oc-ref-item'] },
          children: ref ? buildRefListItemChildren(ref, num) : [
            { type: 'text', value: `[${num}] ` },
            { type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: 'Referência não encontrada: ' }] },
            { type: 'text', value: key },
          ],
        };
      });

      node.children = [
        { type: 'element', tagName: 'h2', properties: { className: ['oc-ref-title'] }, children: [{ type: 'text', value: 'Referências' }] },
        { type: 'element', tagName: 'ol', properties: { className: ['oc-ref-ol'] }, children: items },
      ];
    });

    // 3) Warnings de build: chaves citadas inexistentes e refs não usadas
    const used = new Set(order);
    for (const key of used) {
      if (!refByKey.has(key)) file.message(`Citação com key desconhecida: ${key}`);
    }
    for (const key of refByKey.keys()) {
      if (!used.has(key)) file.message(`Referência no frontmatter não utilizada: ${key}`);
    }
  };
}

// Helpers
function toArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  return [v];
}

/** @param {any} ref @param {number} n */
function buildPopoverChildren(ref, n) {
  const scholar = scholarURL(ref);
  const links = [];
  if (ref.doi) links.push(linkNode(ref.doi, 'DOI'));
  if (ref.url) links.push(linkNode(ref.url, 'Link'));
  if (scholar) links.push(linkNode(scholar, 'Google Scholar'));

  return [
    { type: 'element', tagName: 'button', properties: { className: ['oc-pop-close'], 'aria-label': 'Fechar', type: 'button' }, children: [{ type: 'text', value: '×' }] },
    { type: 'element', tagName: 'div', properties: { className: ['oc-pop-body'] }, children: [
      { type: 'element', tagName: 'p', properties: { className: ['oc-pop-text'] }, children: [{ type: 'text', value: String(ref.text || fallbackText(ref)) }] },
      links.length ? { type: 'element', tagName: 'p', properties: { className: ['oc-pop-links'] }, children: intersperse(links, sepNode()) } : null,
    ].filter(Boolean) },
  ];
}

/** @param {any} ref @param {number} num */
function buildRefListItemChildren(ref, num) {
  const scholar = scholarURL(ref);
  const children = [ { type: 'text', value: '' } ];
  // Conteúdo principal
  children.push({ type: 'text', value: ref.text ? ref.text : fallbackText(ref) });

  // Links
  const links = [];
  if (ref.doi) links.push(linkNode(ref.doi, 'DOI'));
  if (ref.url) links.push(linkNode(ref.url, 'Link'));
  if (scholar) links.push(linkNode(scholar, 'Google Scholar'));

  if (links.length) {
    children.push({ type: 'text', value: ' ' });
    children.push({ type: 'element', tagName: 'span', properties: { className: ['oc-ref-links'] }, children: intersperse(links, sepNode()) });
  }

  return children;
}

function fallbackText(ref) {
  const bits = [ref.author, ref.year, ref.title].filter(Boolean);
  return bits.join(' — ');
}

function linkNode(href, label) {
  return { type: 'element', tagName: 'a', properties: { href, target: '_blank', rel: 'noopener noreferrer' }, children: [{ type: 'text', value: label }] };
}

function sepNode() {
  return { type: 'text', value: ' · ' };
}

function intersperse(arr, sep) {
  const out = [];
  arr.forEach((item, i) => { if (i) out.push(sep); out.push(item); });
  return out;
}

function scholarURL(ref) {
  const q = ref.scholar_query || [ref.author, ref.title, ref.year].filter(Boolean).join(' ');
  if (!q) return null;
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`;
}