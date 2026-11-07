# Asistente de mantenimiento de CeroFallas

## Propósito

El asistente permite que Gerencia consulte en lenguaje natural un resumen de incidentes, correctivos, preventivos y señales de riesgo. La pantalla presenta la conversación a la izquierda y los indicadores utilizados a la derecha.

El módulo es de solo lectura. No crea, modifica, aprueba ni anula registros y no sustituye la validación de un técnico de mantenimiento.

## Arquitectura

1. React carga un corte operativo desde Firestore y muestra los indicadores visibles.
2. Una función callable de Firebase vuelve a validar que el usuario esté activo y tenga `dashboard.read`.
3. La función forma un contexto agregado. No envía contraseñas, correos, perfiles ni identificadores de sesión.
4. La función consulta la Responses API de OpenAI y devuelve respuesta, corte utilizado y nombre del modo.
5. Si la función o el proveedor no están disponibles, la interfaz activa una contingencia determinista basada en los indicadores visibles y la identifica como `Análisis interno activo`.

## Configuración segura de OpenAI

La llave nunca debe agregarse a `.env`, al código React ni al repositorio. Se registra como secreto de Firebase desde una terminal autenticada:

```powershell
npx firebase functions:secrets:set OPENAI_API_KEY --project cerofallas-pg2-german-2026
```

Firebase solicitará el valor de forma interactiva. Después se publica únicamente la función:

```powershell
npx firebase deploy --only functions:askMaintenanceAssistant --project cerofallas-pg2-german-2026
```

El modelo predeterminado es `gpt-6-luna`, elegido para consultas breves y costo controlado. Puede cambiarse mediante el parámetro `OPENAI_MODEL` antes del despliegue.

## Demostración

1. Ingresar con Gerencia, administrador o una jefatura con permiso de dashboard.
2. Abrir **Recursos → Asistente IA**.
3. Explicar que los seis indicadores laterales constituyen la evidencia entregada al asistente.
4. Consultar: `¿Qué debería atender primero esta semana?`.
5. Señalar el estado del motor. `IA generativa conectada` indica respuesta del proveedor; `Análisis interno activo` indica contingencia local.
6. Abrir el módulo correspondiente para verificar el detalle de la respuesta.

## Controles implementados

- Autenticación y autorización en servidor.
- Consulta de solo lectura y límite de 600 caracteres.
- Historial máximo de seis mensajes.
- Contexto agregado y minimización de datos.
- Respuesta máxima y prompt con límites funcionales.
- Auditoría de consultas exitosas a la IA.
- Llave almacenada como secreto del servidor.
- Contingencia identificada; nunca se presenta como IA externa cuando no lo es.
