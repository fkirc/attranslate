# attranslate: Sincronización de traducciones para Agentes

macOS/Ubuntu/Windows: [![Actions Status](https://github.com/fkirc/attranslate/workflows/Tests/badge.svg/?branch=master)](https://github.com/fkirc/attranslate/actions?query=branch%3Amaster)

`attranslate` es una herramienta CLI para sincronizar archivos de traducción (JSON/YAML/XML) diseñada para asistir a Agentes de Código en traducir eficientemente con uso mínimo de tokens.
Las traducciones existentes permanecen sin cambios; solo se sincronizan las nuevas cadenas de texto.

A partir de v3, `attranslate` es una herramienta completamente offline; ya no llama a ninguna API de traducción, en su lugar actúa como un ayudante de eficiencia para los agentes que realizan el trabajo principal.

## Conservar traducciones manuales

`attranslate` reconoce que las traducciones agénticas no siempre son perfectas.
Por lo tanto, siempre que no esté satisfecho con los resultados producidos, `attranslate` le permite simplemente sobrescribir textos en sus archivos de destino.
`attranslate` nunca sobrescribirá una corrección manual en ejecuciones posteriores.

## Cómo funciona: invocación agéntica

Para ayudar a los agentes de forma eficiente en tokens, attranslate usa un truco que consiste en "invocarse a sí mismo dos veces" por parte de los agentes.
En la primera invocación, attranslate imprimirá una lista de fuentes faltantes e instrucciones para el agente. Ejemplo (la salida real de la herramienta siempre se imprime en inglés, sin importar el idioma que estés traduciendo):

```
$ attranslate --srcFile=en.json --srcLng=English --format=json --targetFile=es.json --targetLng=Spanish --service=agent
Invoke 'agent' from 'English' to 'Spanish' with 2 inputs...
MISSING TRANSLATIONS:

- key: hello
  source: Hello

- key: bye
  source: Goodbye

INSTRUCTIONS FOR AGENTS:
Translate the missing sources listed above, matching the order.
Replace <translation1>, <translation2>, ... with your actual translated strings and pipe them into attranslate as follows:
echo -e "<translation1>\n<translation2>\n..." | attranslate --srcFile=en.json --srcLng=English --format=json --targetFile=es.json --targetLng=Spanish --service=agent
```

Luego el agente sigue naturalmente esas instrucciones para terminar la tarea en una segunda invocación de attranslate:

```
$ echo -e "Hola\nAdiós" | attranslate --srcFile=en.json --srcLng=English --format=json --targetFile=es.json --targetLng=Spanish --service=agent
Invoke 'agent' from 'English' to 'Spanish' with 2 inputs...
Add 2 new translations
Write target '/path/to/es.json'
```

Nota: la primera ejecución (sin canalizar stdin) sale con un código distinto de cero por diseño; esto se puede usar en CI/CD para detectar traducciones faltantes.

## Instalación

Instalar globalmente:
```bash
npm install --global attranslate
```

O en un proyecto Node.js:
```bash
npm install --save-dev attranslate
```

## Ejemplos de Prompt

Se recomienda añadir instrucciones sobre cómo invocar `attranslate` a tus instrucciones agénticas (p. ej. un agent-skill). Por ejemplo:

```
Invoca `attranslate` después de agregar una nueva traducción al archivo en.json en inglés.
attranslate --service=agent --srcFile=translations/en.json --targetFile=translations/es.json --targetLng=Spanish --srcLng=English --format=json
```

## Opciones de uso

Ejecuta `attranslate --help` para ver una lista de opciones disponibles:

```
Usage: attranslate [options]

Options:
  --srcFile <sourceFile>             The source file to be translated
  --srcLng <sourceLanguage>          The source language
  --targetFile <targetFile>          The target file for the translations
  --targetLng <targetLanguage>       The target language
  --format <format>                  Uno de "flat-json", "nested-json", "json", "yaml", "po", "xml", "ios-strings", "arb", "csv"
  --service <translationService>     "agent"
  -v, --version                      output the version number
  -h, --help                         display help for command
```
