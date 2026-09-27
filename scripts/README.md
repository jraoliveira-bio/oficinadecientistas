# scripts/

## `converter.py` — CSV → JSON para o componente `Table.astro`

Para criar uma tabela `.json` que o componente `Table.astro` consiga ler, transforme um
`.csv` separado por `;` em `.json` com o comando abaixo, na pasta raiz do projeto:

```bash
python scripts/converter.py scripts/csv_source/nomedoarquivo.csv src/data/nomedoarquivo.json
```

Exemplo real: `scripts/csv_source/conceitos.csv` → `src/data/conceitos.json` (tabela de
conceitos de espécie da Aula 02).
