# Configuración del servicio

Actualmente, necesita obtener una clave de API si usa `attranslate` con servicios de traducción automática.
Este documento proporciona orientación sobre cómo obtener claves de API para servicios específicos.
Una vez que tenga una clave de API, pase su clave de API a `attranslate` a través del `--serviceConfig`-bandera.

### Traductor de Google

Sigue estos pasos para obtener una clave de API para Google Translate:

1.  [Seleccionar o crear un proyecto en la nube][projects]
2.  [Habilitar la API de traducción de Google Cloud][enable_api]
3.  [Crear una cuenta de servicio][auth] para obtener un `service_account_key.json`-archivo.

[projects]: https://console.cloud.google.com/project

[billing]: https://support.google.com/cloud/answer/6293499#enable-billing

[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=translate.googleapis.com

[auth]: https://cloud.google.com/docs/authentication/getting-started

Una vez que tenga una cuenta de servicio, pase una ruta a su `service_account_key.json` a través del `--serviceConfig`-bandera a `attranslate`.

### Traductor de Azure

Siga estos pasos para obtener una clave de API para Azure Translator:

*   [Únete](https://azure.microsoft.com/en-us/free/) para un
    Cuenta de Azure si aún no tiene una.
*   Crear una nueva instancia de traductor a través de https://azure.microsoft.com/services/cognitive-services/translator/
