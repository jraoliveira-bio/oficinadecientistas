// Supondo: label de mês "nov/2025" (abreviação pt-BR minúscula).
export function formatDate(
  date: Date,
  tz = "America/Manaus",
  locale: string | string[] = "pt-BR"
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/\sde\s/gi, " ")
    .toLowerCase(); // ex.: "08 nov 2025"
}

export function countTags<T extends { data: { tags: string[] } }>(entries: T[]) {
  const map = new Map<string, number>();
  for (const e of entries) {
    for (const t of e.data.tags) {
      const tag = t.trim();
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return map;
}

export function groupByMonth<T extends { data: { dataPublicacao: Date } }>(entries: T[]) {
  // retorna agrupamento ordenado desc por ano-mês
  const by: Record<string, number> = {};
  for (const e of entries) {
    const d = e.data.dataPublicacao;
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const ym = `${y}-${m}`;
    by[ym] = (by[ym] ?? 0) + 1;
  }
  const items = Object.keys(by)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((ym) => ({
      ym,
      count: by[ym],
      label: formatYmLabel(ym),
    }));
  return items;
}

function formatYmLabel(ym: string) {
  // ym: "2025-11" -> "nov/2025"
  const [y, m] = ym.split("-");
  const monthIdx = Number(m) - 1;
  const dt = new Date(Date.UTC(Number(y), monthIdx, 1));
  const label = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(dt)
    .replace(".", "")
    .toLowerCase();
  return `${label}/${y}`;
}

// Opcional: não usado agora.
export function paginate<T>(items: T[], page = 1, perPage = 10) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * perPage;
  const end = start + perPage;
  return {
    items: items.slice(start, end),
    page: p,
    totalPages,
  };
}
