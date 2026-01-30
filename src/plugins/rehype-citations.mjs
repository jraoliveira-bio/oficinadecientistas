// src/plugins/rehype-citations.mjs
// MDX-safe: não substitui o root; só muta 'tree'. Nunca retorna 'string'.
// Mantém o conteúdo mesmo se nada for resolvido.
// Se quiser resolver chaves -> texto/HTML, passe uma função 'resolve(key)' via opções.
export default function rehypeCitations(options = {}) {
  const { resolve } = options; // opcional: (key) => { text?: string, html?: string }

  return function transformer(tree, file) {
    if (!tree || !Array.isArray(tree.children)) return;

    /** @type {Map<string, number>} */
    const seen = new Map();
    /** @type {string[]} */
    const order = [];

    // visita elementos <cite ...>
    visitElement(tree, (node, index, parent) => {
      const tag = (node.tagName || "").toLowerCase();
      if (tag !== "cite") return;

      const props = node.properties || {};
      const key = String(props["data-key"] ?? props.key ?? "").trim();
      if (!key) return;

      let num = seen.get(key);
      if (!num) {
        num = order.length + 1;
        seen.set(key, num);
        order.push(key);
      }

      // Substitui <cite> por um marcador [n] com âncora
      if (parent && typeof index === "number") {
        parent.children[index] = el("sup", { class: "oc-cite-ref" }, [
          el("a", { href: `#ref-${num}`, id: `ref-note-${num}` }, [text(`[${num}]`)]),
        ]);
      }
    });

    if (!order.length) return; // sem citações, não adiciona lista

    // constrói lista de referências
    const items = order.map((key, i) => {
      const num = i + 1;
      const anchor = el("a", { href: `#ref-note-${num}` }, [text(`[${num}] `)]);

      let contentNodes = null;
      if (typeof resolve === "function") {
        try {
          const r = resolve(key) || {};
          if (r.html) {
            // nó "raw" é seguro no build estático do Astro (sem hidratação)
            contentNodes = [{ type: "raw", value: String(r.html) }];
          } else {
            contentNodes = [text(String(r.text ?? key))];
          }
        } catch {
          contentNodes = [text(key)];
        }
      } else {
        contentNodes = [text(key)];
      }

      return el("li", { id: `ref-${num}` }, [anchor, ...contentNodes]);
    });

    // acrescenta <hr> + seção de referências no final
    tree.children.push(
      el("hr", {}, []),
      el("section", { id: "referencias", class: "oc-refs" }, [
        el("h2", {}, [text("Referências")]),
        el("ol", {}, items),
      ]),
    );
  };
}

/** helpers sem dependência externa */
function el(tagName, properties = {}, children = []) {
  return { type: "element", tagName, properties, children };
}
function text(value) {
  return { type: "text", value };
}
function visitElement(tree, cb) {
  walk(tree, null, null, cb);
}
function walk(node, parent, index, cb) {
  if (!node) return;
  if (node.type === "element") cb(node, index, parent);
  const kids = node.children || [];
  for (let i = 0; i < kids.length; i++) walk(kids[i], node, i, cb);
}