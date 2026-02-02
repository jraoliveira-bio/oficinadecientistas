// Garante exatamente UMA barra entre base e path.
export function withBase(path: string, baseRaw: string | undefined = import.meta.env.BASE_URL) {
  const base = (baseRaw ?? "/");
  const b = base.endsWith("/") ? base : base + "/";
  const p = path.startsWith("/") ? path.slice(1) : path;
  return b + p;
}
