// Estimativa do tempo de leitura a partir do corpo MDX cru (sem o frontmatter — então a
// transcrição do vídeo não conta). Tira imports/exports, tags JSX/HTML (com os atributos)
// e expressões {…}; conta as palavras a ~200 por minuto, um ritmo de leitura atenta de
// texto técnico. É uma estimativa: serve para o leitor se planejar, não para cronometrar.
export function tempoDeLeitura(corpo: string, palavrasPorMinuto = 200): number {
  const texto = (corpo ?? "")
    .replace(/^\s*(import|export)\s.*$/gm, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\{[^}]*\}/g, " ");
  const palavras = texto.split(/\s+/).filter((p) => /\p{L}/u.test(p)).length;
  return Math.max(1, Math.round(palavras / palavrasPorMinuto));
}
