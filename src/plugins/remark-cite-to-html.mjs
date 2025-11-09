import { visit } from 'unist-util-visit';

export default function remarkCiteToHtml() {
  return (tree, file) => {                 // 👈 RECEBE file AQUI
    // file?.message?.('remark-cite-to-html: rodando'); // opcional (seguro)
    visit(tree, (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      const isMdxJsx = node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement';
      if (!isMdxJsx) return;

      if (node.name === 'Cite') {
        const attr = (node.attributes || []).find(
          (a) => a.type === 'mdxJsxAttribute' && (a.name === 'refKey' || a.name === 'key')
        );
        const refKey =
          attr && typeof attr.value === 'object' && 'value' in attr.value
            ? String(attr.value.value ?? '')
            : String(attr?.value ?? '');

        parent.children.splice(index, 1, { type: 'html', value:
          `<cite class="oc-cite" data-key="${escapeHtml(refKey)}"></cite>`
        });
        return;
      }

      if (node.name === 'ReferenceList') {
        parent.children.splice(index, 1, { type: 'html', value:
          `<div class="oc-ref-list" data-ref-list></div>`
        });
      }
    });
  };
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}
