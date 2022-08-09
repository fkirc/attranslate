Aunque existen muchas herramientas de traducción, `attranslate` tiene por objeto evitar duplicaciones innecesarias.
Por lo tanto, comparamos `attranslate` contra las siguientes herramientas:

## Plataformas de traducción comercial

Típicamente `attranslate` no es un competidor directo frente a las plataformas comerciales, sino una herramienta complementaria.
Muchas plataformas comerciales como https://lingohub.com/ proporcionan una interfaz web para administrar traducciones con múltiples colaboradores.
En contraste, `attranslate` es una herramienta de línea de comandos diseñada para modificar los archivos existentes lo más rápido posible.

De hecho, es posible combinar `attranslate` con plataformas comerciales.
En este escenario, los desarrolladores usarían `attranslate` para hacer su trabajo lo más rápido posible, y luego se usaría una plataforma como https://lingohub.com/ para revisar las traducciones generadas automáticamente más adelante.
Aunque `attranslate` proporciona soporte para revisiones manuales, plataformas como https://lingohub.com/ proporcionan una gestión de usuarios mucho más sofisticada, así como una interfaz más conveniente para usuarios no técnicos.

## Bibliotecas de tiempo de ejecución: i18next, Flutter-intl, Android-resources,...

`attranslate` no es un competidor contra las bibliotecas de tiempo de ejecución, sino una herramienta complementaria.
Considerando que las bibliotecas en tiempo de ejecución proporcionan soporte técnico para diferentes marcos, `attranslate` actúa como un "motor de transformación de archivos" para diferentes archivos de origen.

## Bibliotecas de bajo nivel

[traductor de google-cloud](https://github.com/googleapis/nodejs-translate), [DeepL](https://github.com/vsetka/deepl-translator) y bibliotecas similares traducen `a` Para `b`, pero no proporcionan un flujo de trabajo utilizable por sí solo.
Por lo tanto, para usar esas bibliotecas de bajo nivel de manera efectiva, infraestructura adicional como `attranslate` es necesario.

## json-autotraducción

[json-autotraducción](https://github.com/leolabs/json-autotranslate) es el predecesor directo de `attranslate`.
En realidad `attranslate` ha sido creado específicamente para resolver algunas limitaciones de `json-autotranslate`:

*   No aplique ninguna estructura de carpetas específica.
*   Admite formatos de archivo adicionales distintos de JSON.
*   Genere cachés solo para archivos de origen, pero no para archivos de destino.
*   Ponga un mayor énfasis en la estabilidad y calidad de los archivos.
*   Simplifique la adición de nuevos servicios o nuevos formatos de archivo.

## Evernote Serge

Mientras que [Serge](https://github.com/evernote/serge) está orientado a flujos de trabajo altamente optimizados, `attranslate` está orientado a una integración rápida en cuestión de minutos.

## Bramante

[Bramante](https://github.com/scelis/twine) se distribuye a través de Ruby/gem, mientras que `attranslate` se distribuye a través de npm.
Además, el concepto de uso es diferente.
Mientras que `Twine` utiliza el llamado "archivo de datos Twine", `attranslate` está diseñado para sincronizar archivos arbitrarios de A a B.

## BabelEditar

[BabelEditar](https://www.codeandweb.com/babeledit) es una herramienta GUI patentada.
`attranslate` es una herramienta CLI gratuita.

## Babelish

[Babelish](https://github.com/netbe/Babelish) está dirigido a un caso de uso específico:
Convierta archivos CSV en traducciones nativas de Android o iOS.
`attranslate` también resuelve este caso de uso, pero no está restringido a CSV / Android / iOS.
Además `attranslate` facilita la aplicación de correcciones manuales específicas de la plataforma.

## strsync

[strsync](https://github.com/metasmile/strsync) está dirigido a "iOS-native" y se distribuye a través de `pip`.
En contraste, `attranslate` no está restringido a iOS y se distribuye a través de `npm`.

## simpleen.io

Si [simpleen.io](https://simpleen.io/) era totalmente de código abierto, `attranslate` tal vez no existiría.

## loctool

[loctool](https://github.com/iLib-js/loctool) admite muchas características similares, pero los flujos de trabajo son diferentes a `attranslate`.
Mientras que `loctool` está orientado a `xliff`-archivos y agencias de traducción externas, `attranslate` está orientado a una configuración rápida y flujos de trabajo de autoservicio.
