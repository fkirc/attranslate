# Manifiesto de desarrollo

El desarrollo de `attranslate` se guía por los principios que se describen en este documento.

## Concéntrese en el "tiempo de obtención de valor"

`attranslate` es una herramienta semiautomatizada.
Las herramientas semiautomatizadas solo son valiosas si el costo de configuración es menor que la recompensa de la automatización.
Por lo tanto, es importante minimizar el tiempo de configuración para los nuevos usuarios:

*   Piénselo dos veces antes de agregar cualquier nueva configuración.
*   Piénselo dos veces sobre cualquier cosa que requiera una documentación más compleja.
*   La documentación debe ser mínima, pero garantizada para funcionar y siempre actualizada.
*   Evita los momentos gotcha inesperados. En su lugar, haga cosas que los usuarios esperan.

## Evita ser obstinado

`attranslate` es una herramienta genérica que no debe aplicar ningún flujo de trabajo específico.
Por ejemplo `attranslate` no debe aplicar ninguna estructura de directorios específica.

## Desarrollo basado en el rendimiento de pruebas

*Desarrollo basado en el rendimiento de pruebas (TPDD)* es una extensión de Test Driven Development (TDD). TPDD sigue los siguientes principios básicos de TDD:

*   Todas las características deben ser probadas, incluso si es solo una prueba de humo mínima.
*   Idealmente, todas las correcciones de errores deben ser probadas por regresión.
*   El código se "prueba razonablemente" si la funcionalidad o las correcciones de errores no se pueden eliminar sin romper una prueba.

Sin embargo, TPDD tiene requisitos adicionales sobre cómo se deben realizar las pruebas:

*   Optimice agresivamente el tiempo de ejecución general de los conjuntos de pruebas.
*   Haga que las pruebas sean independientes entre sí para permitir las pruebas de múltiples núcleos.
*   Simular operaciones costosas como llamadas de red (pero no para todas las pruebas).
*   Prefiera modificaciones menores de las pruebas sobre las nuevas pruebas (pero no a expensas de pruebas demasiado complejas).
*   Prefiere los archivos de referencia a los de prueba.
*   Prefiere la estabilidad y la robustez a un número excesivo de pruebas.
*   Pruebe la lógica de alto nivel en lugar de los detalles de implementación.

No tengas miedo de esta larga lista de requisitos.
En muchos casos, probar una nueva característica es tan simple como agregar un nuevo archivo de entrada y luego generar un archivo de referencia.
