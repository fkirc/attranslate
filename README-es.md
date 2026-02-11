# attranslate: Traductor de texto semiautomático para sitios web y aplicaciones

<p align="center">
  <img alt="attranslate - Semi-automated Text Translator for Websites and Apps" src="docs/logo/attranslate_logo.png">
</p>

macOS/Ubuntu/Windows: [![Actions Status](https://github.com/fkirc/attranslate/workflows/Tests/badge.svg/?branch=master)](https://github.com/fkirc/attranslate/actions?query=branch%3Amaster)

`attranslate` es una herramienta CLI para sincronizar archivos de traducción (JSON/YAML/XML) diseñada para asistir a Agentes de Código en traducir eficientemente con uso mínimo de tokens.
Las traducciones existentes permanecen sin cambios; solo se sincronizan las nuevas cadenas de texto.

# Funciones

## Conservar traducciones manuales

`attranslate` reconoce que las traducciones automáticas no son perfectas.
Por lo tanto, siempre que no esté satisfecho con los resultados producidos, `attranslate` le permite simplemente sobrescribir textos en sus archivos de destino.
`attranslate` nunca sobrescribirá una corrección manual en ejecuciones posteriores.

## Servicios disponibles

- `agent`: Para usar con Agentes de Código. Solicita al agente traducir nuevas cadenas de forma interactiva cuando se detectan.
- `sync-without-translate`: Verifica la integridad de las traducciones sin traducir (p. ej. para tuberías CI/CD).

Otros servicios (openai, google-translate, azure, manual, typechat, etc.) están deprecados pero se retienen para compatibilidad hacia atrás.

# Ejemplos de uso

Traducir un archivo único es tan simple como la siguiente línea:

```
attranslate --srcFile=json-simple/en.json --srcLng=English --srcFormat=nested-json --targetFile=json-simple/es.json --targetLng=Spanish --targetFormat=nested-json --service=agent
```

Para varios idiomas de destino, invoca `attranslate` para cada uno:

```bash
attranslate --srcFile=en/fruits.json --targetFile=es/fruits.json --targetLng=Spanish --srcLng=English --srcFormat=nested-json --targetFormat=nested-json --service=agent
attranslate --srcFile=en/fruits.json --targetFile=de/fruits.json --targetLng=German --srcLng=English --srcFormat=nested-json --targetFormat=nested-json --service=agent
```

# Opciones de uso

Ejecuta `attranslate --help` para ver una lista de opciones disponibles:

```
Usage: attranslate [options]

Options:
  --srcFile <sourceFile>             The source file to be translated
  --srcLng <sourceLanguage>          A language code for the source language
  --srcFormat <sourceFileFormat>     One of "flat-json", "nested-json", "yaml",
                                     "po", "xml", "ios-strings", "arb", "csv"
  --targetFile <targetFile>          The target file for the translations
  --targetLng <targetLanguage>       A language code for the target language
  --targetFormat <targetFileFormat>  One of "flat-json", "nested-json", "yaml",
                                     "po", "xml", "ios-strings", "arb", "csv"
  --service <translationService>     One of "agent", "sync-without-translate"
  -v, --version                      output the version number
  -h, --help                         display help for command
```

## Ejemplos de Prompt

Se recomienda expandir tu AGENTS.md/CLAUDE.md o similar para instruir a tus Agentes de Código sobre cómo deben hacer traducciones.
Por ejemplo, agrega algo como esto a tu prompt del sistema:

```
Al realizar traducciones, recuerda que estás desarrollando una aplicación de salud para profesionales médicos. Términos técnicos como 'EKG', 'MRI', 'CT scan', 'blood pressure', 'pulse oximeter' y 'vital signs' deben permanecer en inglés. Por favor, mantén la terminología médica apropiada y un tono formal en las traducciones.
Invoca `attranslate` después de agregar una nueva traducción al archivo en.json en inglés.
Por ejemplo:
attranslate --service=agent --srcFile=translations/en.json --targetFile=translations/es.json --targetLng=Spanish --srcLng=English --srcFormat=nested-json --targetFormat=nested-json
```

Para reducir el uso de contexto, esto puede envolverse en una declaración condicional:

```
Al agregar nuevas claves de traducción, consulta <some-explanation.md> para ver cómo deben hacerse las nuevas traducciones.
```
