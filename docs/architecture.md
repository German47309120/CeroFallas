# CeroFallas — Arquitectura de software

Fecha: 2026-09-02

Estado: ARQUITECTURA BASE SELECCIONADA

## Resumen

CeroFallas será una aplicación de página única (SPA) responsive, organizada por módulos funcionales. El navegador utilizará Firebase Authentication y el SDK modular de Firebase. Cloud Firestore será la base operacional y Firebase Hosting publicará los archivos construidos por Vite.

Las integraciones con SAP, Power BI y el análisis predictivo permanecerán separadas del frontend para no exponer credenciales ni detener el registro de mantenimientos cuando un servicio externo falle.

```text
USUARIO
  |
  v
REACT SPA EN FIREBASE HOSTING
  |-- Firebase Authentication
  |-- Cloud Firestore + Security Rules
  |-- Cloud Storage (solo si se autoriza Blaze)
  |
  +--> Dashboard web
  |
  +--> Capa backend segura (fase posterior / requiere evaluar Blaze)
          |-- Administración privilegiada de usuarios
          |-- Exportación controlada
          |-- Auditoría reforzada
          |
          +--> Adaptador de stock <-- SQL Server / SAP (solo lectura)
          +--> Dataset para Power BI
          +--> Servicio predictivo Python
                    |-- Entrenamiento versionado
                    |-- Cálculo programado
                    +-- Resultados hacia Firestore / Power BI
```

## Frontend

Tecnologías seleccionadas:

- React para componentes, estado de sesión y pantallas modulares.
- Vite para desarrollo y construcción estática.
- JavaScript con módulos ES y documentación JSDoc.
- CSS propio con variables de diseño y enfoque mobile-first.
- React Router para rutas protegidas y navegación.
- SDK modular de Firebase instalado mediante npm.

Se selecciona JavaScript en vez de TypeScript para reducir la curva inicial del estudiante. La organización modular, validaciones y pruebas compensarán parte del control estático perdido.

No se utilizará Create React App porque está deprecado. No se necesita renderizado de servidor para los formularios internos y dashboards de este proyecto.

## Backend y servicios Firebase

### Authentication

- Método inicial: correo electrónico y contraseña.
- El perfil, rol y estado operativo se conservarán en Firestore, vinculado por UID.
- Una cuenta autenticada sin perfil activo no tendrá acceso a datos operativos.
- La creación y actualización administrativa de cuentas ya se resuelve localmente mediante funciones privilegiadas emuladas; nunca se exponen credenciales administrativas al navegador. Su despliegue cloud y endurecimiento con App Check siguen pendientes.

### Cloud Firestore

Se selecciona sobre Realtime Database por:

- Colecciones y documentos adecuados para múltiples entidades.
- Consultas indexadas y filtros compuestos.
- Mejor separación de correctivos, preventivos, checklist, incidentes y auditoría.
- Reglas no heredadas accidentalmente por toda una rama JSON.
- Escalabilidad automática y soporte web sin conexión.

Realtime Database tendría ventaja en presencia en línea y sincronización extremadamente frecuente, pero esas características no son prioritarias para CeroFallas.

### Security Rules

- Denegación por defecto.
- Lectura y escritura basadas en usuario autenticado, perfil activo y permisos.
- Validación de campos críticos y estados permitidos.
- Restricción de modificaciones y anulaciones a administrador o soporte.
- Pruebas mediante Emulator Suite antes del despliegue.

### Firebase Hosting

- Publicará la salida estática `dist/` generada por Vite.
- Configurará una reescritura SPA hacia `index.html`.
- Proporcionará HTTPS y subdominios del proyecto.
- El despliegue se realizará solo después de probar localmente.

### Cloud Storage

- Las evidencias fotográficas son opcionales para el núcleo inicial.
- La documentación oficial actual exige plan Blaze para Cloud Storage en proyectos nuevos.
- No se habilitará ni implementará carga de archivos hasta contar con autorización expresa de facturación.
- Los modelos de datos permiten agregar URLs cuando esta función sea aprobada.

### Funciones backend

Se reservarán para operaciones que no son seguras desde el cliente:

- Crear o administrar identidades y restablecer contraseñas temporales sin cambiar la sesión del administrador.
- Sincronizar stock autorizado.
- Exportar datasets.
- Ejecutar lógica privilegiada y auditoría reforzada.

Los contratos de alta y actualización de usuarios ya están implementados y probados en emulación local. Su implementación cloud puede requerir Blaze; el despliegue esperará autorización de costos y revisión de seguridad.

## Organización propuesta del frontend

```text
src/
|-- app/
|   |-- router/
|   +-- providers/
|-- components/
|   |-- layout/
|   |-- forms/
|   +-- feedback/
|-- config/
|-- features/
|   |-- auth/
|   |-- dashboard/
|   |-- equipment/
|   |-- corrective/
|   |-- preventive/
|   |-- forklift-checklist/
|   |-- incidents/
|   |-- inventory/
|   |-- predictions/
|   +-- users/
|-- hooks/
|-- lib/
|-- services/
|   |-- firebase/
|   +-- repositories/
|-- styles/
|-- test/
+-- utils/
```

Cada `feature` podrá contener páginas, componentes, validaciones y servicios propios. Las operaciones con Firestore se encapsularán en repositorios para evitar consultas dispersas en la interfaz.

## Integración de stock con SAP SQL Server

La SPA nunca abrirá una conexión SQL.

Flujo recomendado:

1. Un proceso autorizado ejecuta la consulta SQL existente con una cuenta de solo lectura.
2. Transforma únicamente código, descripción, cantidad y almacén.
3. Registra fecha, lote y resultado de sincronización.
4. Publica un snapshot controlado para CeroFallas.
5. La SPA consulta el snapshot y muestra su fecha de actualización.

Opciones de ejecución, en orden de preferencia técnica:

1. Servicio interno de Novafiber con salida segura hacia Firebase.
2. Servicio cloud con conectividad privada autorizada hacia SQL Server.
3. Exportación manual o programada como mecanismo temporal de demostración.

La selección depende de red, firewall, disponibilidad de un servidor institucional y políticas de SAP.

## Integración con Power BI

- Power BI conservará su conexión autorizada a SAP para los datos empresariales existentes.
- Los datos de CeroFallas se expondrán mediante un dataset o exportación controlada.
- La URL del reporte no se insertará como pública hasta confirmar su modalidad de acceso.
- El dashboard web cubrirá operación diaria; Power BI cubrirá análisis y presentación consolidada.
- Una falla de actualización de Power BI no afectará escrituras operativas.

## Análisis predictivo

- Lenguaje: Python 3.12 compatible con el entorno local, sujeto a verificar dependencias.
- Entrenamiento separado de la SPA.
- Artefactos versionados: dataset, transformaciones, métricas y modelo.
- Línea base: regresión logística.
- Segundo candidato inicial: Random Forest, sujeto al histórico disponible.
- Ejecución local demostrativa primero; Cloud Run o alternativa programada después de evaluar costos.
- Los resultados se escribirán como documentos de riesgo, nunca como modificación directa del mantenimiento.

## Disponibilidad y degradación controlada

- Si SAP falla: se muestra el último snapshot y su antigüedad; mantenimiento sigue disponible.
- Si Power BI falla: dashboard y registros web siguen disponibles.
- Si el predictivo falla: se indica que el riesgo no está actualizado; no bloquea operación.
- Si Storage no está habilitado: formularios funcionan sin adjuntos.
- Si un usuario no tiene perfil activo: acceso denegado aunque Authentication lo reconozca.

## Seguridad

- Configuración pública del SDK Firebase separada de secretos administrativos.
- Variables de entorno para identificadores por ambiente.
- Cuentas de servicio solo en backend y fuera de Git.
- Mínimo privilegio para SAP y servicios cloud.
- Auditoría de cambios sensibles.
- Datos ficticios o anonimizados para demostraciones públicas.
- No confiar en validaciones de interfaz como control de seguridad.

## Ambientes

Objetivo recomendado:

- Desarrollo local con Vite y Emulator Suite.
- Proyecto Firebase de desarrollo/pruebas.
- Proyecto Firebase de producción antes de la defensa final.

Si solo se dispone de un proyecto Firebase, deberán separarse claramente colecciones y datos de demostración, pero esto aumenta el riesgo de contaminación. La creación de proyectos cloud requiere intervención del usuario autenticado.

## Decisiones condicionadas

- Cloud Storage: requiere autorización de Blaze.
- Funciones y automatización cloud: requieren estimación y autorización de facturación.
- Conexión SAP: requiere datos de red y revisión segura de la consulta.
- Publicación Power BI: requiere confirmar audiencia y modalidad de acceso.
- Región de Firestore: deberá elegirse antes de crear la base y no debe decidirse por memoria.

## Fuentes técnicas consultadas

- Firebase Web modular: https://firebase.google.com/docs/web/setup
- Comparación Firestore/Realtime Database: https://firebase.google.com/docs/database/rtdb-vs-firestore
- Firebase Hosting: https://firebase.google.com/docs/hosting
- Firebase CLI: https://firebase.google.com/docs/cli
- Cloud Storage para web: https://firebase.google.com/docs/storage/web/start
- Vite: https://vite.dev/guide/
- React: https://react.dev/learn/creating-a-react-app
