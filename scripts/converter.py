import csv
import json
import sys
import re
import unicodedata

def slugify(value):
    """
    Converte texto em uma 'chave' de programação limpa (slug).
    Exemplo: "Critério Principal" -> "criterioPrincipal"
    """
    value = str(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip()
    parts = re.split(r'[-\s]+', value)
    return parts[0].lower() + ''.join(x.title() for x in parts[1:])

def csv_to_json(input_file_path, output_file_path):
    """
    Lê um arquivo CSV, converte para o formato JSON desejado e salva.
    """
    headers_list = []
    rows_list = []

    try:
        with open(input_file_path, mode='r', encoding='utf-8') as csv_file:
# Define o separador diretamente como ponto e vírgula.
            csv_reader = csv.reader(csv_file, delimiter=';')

            # A primeira linha é o cabeçalho (labels)
            header_labels = next(csv_reader)

            # Cria a estrutura de headers
            header_keys = [slugify(label) for label in header_labels]
            for i in range(len(header_labels)):
                headers_list.append({"key": header_keys[i], "label": header_labels[i]})

            # Processa o resto das linhas
            for row in csv_reader:
                row_dict = {}
                for i in range(len(header_keys)):
                    row_dict[header_keys[i]] = row[i]
                rows_list.append(row_dict)

        # Monta a estrutura final do JSON
        final_json = {
            "headers": headers_list,
            "rows": rows_list
        }

        # Salva o arquivo JSON final
        with open(output_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(final_json, json_file, ensure_ascii=False, indent=2)

        print(f"✅ Sucesso! Arquivo '{output_file_path}' foi criado.")

    except FileNotFoundError:
        print(f"❌ Erro: O arquivo de entrada '{input_file_path}' não foi encontrado.")
    except Exception as e:
        print(f"❌ Um erro inesperado ocorreu: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Como usar: python scripts/converter.py <arquivo_de_entrada.csv> <arquivo_de_saida.json>")
    else:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        csv_to_json(input_path, output_path)