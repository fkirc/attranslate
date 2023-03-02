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

## ¿Por qué traducir?

A diferencia de los servicios de pago, un solo desarrollador puede integrar `attranslate` en cuestión de minutos.
`attranslate` puede operar en los mismos archivos de traducciones que ya está utilizando.
Esto es posible porque `attranslate` opera en su expediente de forma quirúrgica, con los menores cambios posibles.

# Funciones

## Soporte multiplataforma

`attranslate` está diseñado para traducir cualquier sitio web o aplicación con cualquier cadena de herramientas.
`attranslate` funciona para i18n / JavaScript-frameworks / Android / iOS / Flutter / Ruby / Jekyll / Symfony / Django / WordPress y muchas otras plataformas.
Para que esto sea posible, `attranslate` admite los siguientes formatos de archivo:

*   JSON plano o anidado
*   YAML plano o anidado
*   PO/POT-archivos
*   Android-XML o cualquier otro XML con contenido de texto
*   Cadenas de iOS
*   Aleteo-ARB
*   CSV (por ejemplo, para Google Docs o Microsoft Excel)

## Conservar traducciones manuales

`attranslate` reconoce que las traducciones automáticas no son perfectas.
Por lo tanto, siempre que no esté satisfecho con los resultados producidos, `attranslate` le permite simplemente sobrescribir textos en sus archivos de destino.
`attranslate` nunca sobrescribirá una corrección manual en ejecuciones posteriores.

## Opcionalmente, sobrescriba traducciones obsoletas

`attranslate` es capaz de detectar traducciones obsoletas.
La sobrescritura de traducciones obsoletas ayuda a garantizar la frescura de las traducciones.
Sin embargo, en entornos de proyectos agitados, podría ser más fácil dejar las traducciones obsoletas tal cual.
Por lo tanto `attranslate` deja las traducciones obsoletas tal cual a menos que las configure explícitamente para sobrescribirlas.

## Servicios disponibles

`attranslate` admite los siguientes servicios de traducción:

*   `manual`: Traducir textos manualmente introduciéndolos en `attranslate`.
*   [Traductor de Google Cloud](https://cloud.google.com/translate)
*   [Traductor de Azure](https://azure.microsoft.com/en-us/services/cognitive-services/translator-text-api/)
*   `sync-without-translate`: No cambia el idioma. Esto puede ser útil para convertir entre formatos de archivo o para mantener diferencias específicas de la región.

# Ejemplos de uso

Traducir un solo archivo es tan simple como la siguiente línea:

    attranslate --srcFile=json-simple/en.json --srcLng=en --srcFormat=nested-json --targetFile=json-simple/de.json --targetLng=de --targetFormat=nested-json --service=manual

Si tiene varios idiomas de destino, necesitará varias llamadas a `attranslate`.
Puede escribir algo como el siguiente script para evitar duplicaciones innecesarias:

```bash
# This example translates an english JSON-file into spanish, chinese and german. It uses Google Cloud Translate.
BASE_DIR="json-advanced"
SERVICE_ACCOUNT_KEY="gcloud/gcloud_service_account.json"
COMMON_ARGS=( "--srcLng=en" "--srcFormat=nested-json" "--targetFormat=nested-json" "--service=google-translate" "--serviceConfig=$SERVICE_ACCOUNT_KEY" )

# install attranslate if it is not installed yet
attranslate --version || npm install --global attranslate

attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/es/fruits.json --targetLng=es "${COMMON_ARGS[@]}"
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/zh/fruits.json --targetLng=zh "${COMMON_ARGS[@]}"
attranslate --srcFile=$BASE_DIR/en/fruits.json --targetFile=$BASE_DIR/de/fruits.json --targetLng=de "${COMMON_ARGS[@]}"
```

Del mismo modo, puede utilizar `attranslate` para convertir entre formatos de archivo.
Ver [scripts de ejemplo](/sample-scripts) para más ejemplos.

# Opciones de uso

Correr `attranslate --help` para ver una lista de opciones disponibles:

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
      --cacheDir <cacheDir>               The directory where a translation-cache
                                          is expected to be found (default: ".")
      --matcher <matcher>                 One of "none", "icu", "i18next",
                                          "sprintf" (default: "none")
      --overwriteOutdated <true | false>  If true, overwrite outdated translations
                                          in subsequent runs. Leave this at false
                                          unless you know what you are doing.
                                          (default: "false")
      --keySearch <regExp>                A regular expression to replace
                                          translation-keys (can be used for
                                          file-format conversions) (default: "x")
      --keyReplace <string>               The replacement for occurrences of
                                          keySearch (default: "x")
      -v, --version                       output the version number
      -h, --help                          display help for command

# Guía de integración

En primer lugar, asegúrese de que [nodejs](https://nodejs.org/) está instalado en el equipo.
Una vez que tengas `nodejs`, puede instalar `attranslate` Vía:

`npm install --global attranslate`

Alternativamente, si usted es un desarrollador de JavaScript, entonces debe instalar `attranslate` Vía:

`npm install --save-dev attranslate`

A continuación, debe escribir un script específico del proyecto que invoque `attranslate` para sus archivos específicos.
Ver [scripts de ejemplo](/sample-scripts) para obtener orientación sobre cómo traducir los archivos específicos del proyecto.

## Configuración del servicio

Si utiliza `attranslate` con un servicio de traducción automática, debe configurar una clave API.
Las claves API se pueden obtener de forma gratuita, pero es posible que deba registrar una cuenta.
Ver [configuración del servicio](docs/SERVICE_CONFIG.md) para obtener orientación sobre cómo obtener claves de API para servicios específicos.

Una vez que tenga una clave de API, pase su clave de API a `attranslate` a través del `--serviceConfig` bandera.

## Interpolaciones y matchers

> :warning: Para muchos proyectos, `attranslate` funciona de inmediato sin configurar ningún emparejador. Por lo tanto, le recomendamos que omita esta sección a menos que encuentre problemas inesperados que sean difíciles de solucionar manualmente.

Muchos sitios web / aplicaciones usan *Interpolaciones*  para insertar valores dinámicos en las traducciones.
Por ejemplo, una interpolación como `Your name is {{name}}` podría sustituirse por `Your name is Felix`.

Para ayudar con las interpolaciones, `attranslate` proporciona los llamados *emparejadores*.
Un emparejador reemplaza las interpolaciones con marcadores de posición antes de que sean
enviado a un servicio de traducción.
`attranslate` ofrece los siguientes emparejadores para diferentes estilos de interpolaciones:

*   **UCI**: Coincide con interpolaciones de UCI como `{name}`.
*   **i18n**: Partidos [i18siguiente](https://www.i18next.com/translation-function/interpolation) interpolaciones como `{{name}}`.
*   **sprintf**: Coincide con interpolaciones de estilo sprintf como `%s`.
*   **Ninguno**: No coincide con ninguna interpolación.

Puede seleccionar un emparejador con el botón `--matcher` opción.

## Caché de traducción

> :warning: Si `--overwriteOutdated` se establece en `false`entonces `attranslate` no genera ninguna caché de traducción.

El propósito de la caché de traducción es detectar *traducciones obsoletas*, de modo que las traducciones obsoletas se pueden sobrescribir en ejecuciones posteriores.
La caché de traducción consta de `attranslate-cache-*`-archivos.
Se permite eliminar una caché de traducción en cualquier momento.
Sin embargo, para que funcione sin problemas, debe poner su `attranslate-cache-*`-bajo control de versiones.

## Integración continua

Para detectar errores comunes como traducciones faltantes, es recomendable ejecutar `attranslate` a través de la integración continua (IC).
Por ejemplo, el comando `git diff --exit-code` Se puede utilizar para desencadenar un error de CI siempre que un archivo haya sido modificado por `attranslate`.
