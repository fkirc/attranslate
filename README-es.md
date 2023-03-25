# attranslate: Traductor de texto semiautomático para sitios web y aplicaciones

<p align="center">
  <img alt="attranslate - Semi-automated Text Translator for Websites and Apps" src="docs/logo/attranslate_logo.png">
</p>

macOS/Ubuntu/Windows: [![Actions Status](https://github.com/fkirc/attranslate/workflows/Tests/badge.svg/?branch=master)](https://github.com/fkirc/attranslate/actions?query=branch%3Amaster)

`attranslate` es una herramienta para sincronizar archivos de traducción, incluyendo JSON/YAML/XML y otros formatos.
`attranslate` está optimizado para implementaciones fluidas en entornos de proyectos agitados, incluso si ya tiene muchas traducciones.
Opcionalmente `attranslate` trabaja con servicios de traducción automática.
Por ejemplo, supongamos que un servicio de traducción logra un 80% de traducciones correctas.
Con `attranslate`, una solución rápida del 20% restante puede ser más rápida que hacer todo a mano.
Aparte de eso, `attranslate` admite traducciones puramente manuales o incluso conversiones de formato de archivo sin cambiar el idioma.

## ¿Por qué attranslate?

A diferencia de los servicios de pago, un solo desarrollador puede integrar `attranslate` en cuestión de minutos.
`attranslate` puede operar en los mismos archivos de traducciones que ya está utilizando.
Esto es posible porque `attranslate` opera en su expediente de forma quirúrgica, con los menores cambios posibles.

# Funciones

## Soporte multiplataforma

`attranslate` está diseñado para traducir cualquier sitio web o aplicación.
`attranslate` funciona para i18n / JavaScript / Android / iOS / Flutter / Ruby / Jekyll / Django / WordPress y muchas otras plataformas.
Para que esto sea posible, `attranslate` admite los siguientes formatos de archivo:

*   JSON plano o anidado
*   YAML
*   PO/POT-archivos
*   Android-XML o cualquier otro XML
*   Cadenas de iOS
*   Flutter-ARB
*   CSV (por ejemplo, para Google Docs o Excel)

## Conservar traducciones manuales

`attranslate` reconoce que las traducciones automáticas no son perfectas.
Por lo tanto, siempre que no esté satisfecho con los resultados producidos, `attranslate` le permite simplemente sobrescribir textos en sus archivos de destino.
`attranslate` nunca sobrescribirá una corrección manual en ejecuciones posteriores.

## Servicios disponibles

`attranslate` admite los siguientes servicios de traducción; Muchos de ellos son gratis:

*   `openai`: Utiliza un modelo como ChatGPT; gratis hasta un límite
*   [google-translate](https://cloud.google.com/translate): Necesita una cuenta de GCloud; gratis hasta un límite
*   [azure](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/): Necesita una cuenta de Microsoft; cuesta dinero
*   `sync-without-translate`: No cambia el idioma. Esto puede ser útil para convertir entre formatos de archivo o para mantener diferencias específicas de la región.
*   `manual`: Traducir textos manualmente

# Ejemplos de uso

Traducir un solo archivo es tan simple como la siguiente línea:

    attranslate --srcFile=json-simple/en.json --srcLng=English --srcFormat=nested-json --targetFile=json-simple/de.json --targetLng=German --targetFormat=nested-json --service=openai

Si tiene varios idiomas de destino, necesitará varias llamadas a `attranslate`.
Puede escribir algo como el siguiente script:

```bash
# Este ejemplo traduce un archivo JSON en inglés a español y alemán.
BASE_DIR="json-advanced"
SERVICE_ACCOUNT_KEY="gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcLng=en" "--srcFormat=nested-json" "--targetFormat=nested-json" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" )

# instalar attranslate si aún no está instalado
attranslate --version || npm install --global attranslate

attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/es/fruits.json --targetLng=es "${COMMON_ARGS[@]}"
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/de/fruits.json --targetLng=de "${COMMON_ARGS[@]}"
```

Del mismo modo, puede utilizar `attranslate` para convertir entre formatos de archivo.
Ver [scripts de ejemplo](https://github.com/fkirc/attranslate/tree/master/sample-scripts) para más ejemplos.

# Guía de integración

En primer lugar, asegúrese de que [nodejs](https://nodejs.org/) está instalado en el equipo.
Una vez que tengas `nodejs`, puede instalar `attranslate` Vía:

`npm install --global attranslate`

Alternativamente, si usted es un desarrollador de JavaScript, entonces debe instalar `attranslate` Vía:

`npm install --save-dev attranslate`

A continuación, debe escribir un script específico del proyecto que invoque `attranslate` para sus archivos específicos.
Ver [scripts de ejemplo](https://github.com/fkirc/attranslate/tree/master/sample-scripts) para obtener orientación sobre cómo traducir los archivos específicos del proyecto.

# Opciones de uso

Correr `attranslate --help` para ver una lista de opciones disponibles:

```
    Usage: attranslate [options]

    Options:
      --srcFile <sourceFile>              The source file to be translated
      --srcLng <sourceLanguage>           A language code for the source language
      --srcFormat <sourceFileFormat>      One of "flat-json", "nested-json",
                                          "yaml", "po", "xml", "ios-strings",
                                          "arb", "csv"
      --targetFile <targetFile>           The target file for the translations
      --targetLng <targetLanguage>        A language code for the target language
      --targetFormat <targetFileFormat>   One of "flat-json", "nested-json",
                                          "yaml", "po", "xml", "ios-strings",
                                          "arb", "csv"
      --service <translationService>      One of "openai", "manual",
                                          "sync-without-translate",
                                          "google-translate", "azure"
      --serviceConfig <serviceKey>        supply configuration for a translation
                                          service (either a path to a key-file or
                                          an API-key)
      --matcher <matcher>                 One of "none", "icu", "i18next",
                                          "sprintf" (default: "none")
      --overwriteOutdated <true | false>  If true, overwrite outdated translations
                                          in subsequent runs. Leave this at false
                                          unless you know what you are doing.
                                          (default: "false")
      -v, --version                       output the version number
```

## Matchers

> :warning: Para muchos proyectos, `attranslate` funciona de inmediato sin configurar ningún Matchers. Por lo tanto, le recomendamos que omita esta sección.

Muchos sitios web/aplicaciones insertan valores dinámicos en las traducciones.
Por ejemplo, una traducción como `Su nombre es {{name}}` podría sustituirse por `Su nombre es Felix`.


Para ayudar con esto, `attranslate` ofrece los siguientes Matchers para diferentes estilos de reemplazos:

*   **UCI**: Coincide con algo como `{name}`.
*   **i18n**: Coincide [i18siguiente](https://www.i18next.com/translation-function/interpolation) como `{{name}}`.
*   **sprintf**: Coincide estilo de sprintf como `%s`.

## Caché de traducción

> :warning: Por defecto, `attranslate` no genera ningún caché de traducción, por lo tanto, también puede omitir esta sección

Por defecto, `attranslate` nunca sobrescribe ninguna traducción obsoleta.
Sin embargo, `attranslate` proporciona una opción para detectar traducciones desactualizadas.
El propósito de la memoria caché de traducción es detectar tales traducciones obsoletas.
El caché de traducción consta de archivos `attranslate-cache-*`.

## Integración continua

Para detectar errores comunes como traducciones faltantes, es recomendable ejecutar `attranslate` a través de la integración continua (IC).
Por ejemplo, el comando `git diff --exit-code` Se puede utilizar para desencadenar un error de CI siempre que un archivo haya sido modificado por `attranslate`.
