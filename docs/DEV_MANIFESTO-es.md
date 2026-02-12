# Manifiesto de desarrollo

El desarrollo de `attranslate` se guía por los principios que se describen en este documento.

## Enfocarse en el uso con Agentes de Código

`attranslate` es una herramienta CLI que debe ser fácil y eficiente de invocar para Agentes de Código.
Esto significa que:

- Las opciones deben ser autoexplicativas, listadas en `--help`.
- La salida debe ser breve y concisa sin ceremonias, para evitar desperdiciar tokens.
- Los mensajes de error deben estar escritos de manera que permita a los Agentes de Código corregir automáticamente el error.

## Evitar ser obstinado

`attranslate` es una herramienta genérica que no debe enforcer ningún flujo de trabajo específico.
Por ejemplo, `attranslate` no debe enforcer ninguna estructura de directorios específica.

## Desarrollo Basado en Rendimiento de Pruebas

_Desarrollo Basado en Rendimiento de Pruebas (TPDD)_ es una extensión de Test Driven Development (TDD). TPDD sigue los siguientes principios básicos de TDD:
- Todas las características deben ser probadas, incluso si es solo una prueba de humo mínima.
- Idealmente, todas las correcciones de errores deben ser probadas por regresión.
- El código se considera "razonablemente probado" si la funcionalidad o correcciones no se pueden eliminar sin romper una prueba.

Sin embargo, TPDD tiene requisitos adicionales sobre cómo deben realizarse las pruebas:

- Optimizar agresivamente el tiempo de ejecución general de los conjuntos de pruebas.
- Hacer que las pruebas sean independientes entre sí para permitir pruebas multihilo.
- Simular operaciones costosas como llamadas de red (pero no para todas las pruebas).
- Preferir modificaciones menores de pruebas sobre nuevas pruebas (pero no a costa de pruebas demasiado complejas).
- Preferir archivos de referencia sobre código de prueba.
- Preferir estabilidad y robustez sobre un número excesivo de pruebas.
- Probar lógica de alto nivel en lugar de detalles de implementación.

No temas esta larga lista de requisitos.
En muchos casos, probar una nueva característica es tan simple como agregar un nuevo archivo de entrada y luego generar un archivo de referencia.
