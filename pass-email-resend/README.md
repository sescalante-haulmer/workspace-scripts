# Incidente

https://haulmer.atlassian.net/browse/INC-12 

# Pass Email Resend Script

Script de JavaScript para procesar usuarios y enviar emails de actualización de contraseña a través de la API de Keycloak.

## Características

- ✅ Procesa IDs de usuarios desde un archivo `users.txt`
- ✅ Hace peticiones PUT a la API de Keycloak
- ✅ Delay configurable entre llamadas (3 segundos por defecto)
- ✅ Logging detallado de todas las operaciones
- ✅ Detiene el procesamiento si ocurre un error
- ✅ Genera archivo de log con todas las respuestas

## Configuración

1. **Configura las variables en el script:**
   - `BASE_URL`: URL base de tu instancia de Keycloak
   - `AUTH_TOKEN`: Token de autorización Bearer

2. **Prepara el archivo de usuarios:**
   - Crea o edita `users.txt` con un ID de usuario por línea
   - Ejemplo:
   ```
   3ee80e18-0000-0000-0000-6c40088a3834
   f47ac10b-0000-0000-0000-0e02b2c3d479
   ```

## Uso

```bash
# Ejecutar el script
node process-users.js

# O usando npm
npm start
```

## Requisitos

- Node.js 18+ (para soporte nativo de fetch)
- Acceso a la API de Keycloak
- Token de autorización válido

## Archivos generados

- `process-log.txt`: Log detallado de todas las operaciones
- Salida en consola con progreso en tiempo real

## Manejo de errores

- Si falla cualquier petición, el script se detiene inmediatamente
- Todos los errores se registran en el log
- El código de salida será 1 si hay errores, 0 si todo es exitoso
