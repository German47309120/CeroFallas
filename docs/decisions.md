# CeroFallas — Registro de decisiones

## DECISIÓN 001

Fecha: 2026-09-02

Tema: Plataforma objetivo.

Situación: Se debía confirmar si el producto incluiría aplicación Android.

Alternativas: Web responsive; web más Android nativo.

Decisión tomada: Construir únicamente una aplicación web responsive.

Motivo: Es el alcance confirmado por el propietario del proyecto y permite acceso desde computadora, tablet y teléfono mediante navegador.

Impacto: No se planificará una aplicación Android independiente.

## DECISIÓN 002

Fecha: 2026-09-02

Tema: Objetivo de entrega.

Situación: La tercera entrega exige aproximadamente 75 % de funcionamiento.

Alternativas: Limitar el proyecto al 75 %; planificar el alcance completo.

Decisión tomada: Trabajar hacia el 100 % del alcance.

Motivo: Llegar a la defensa con margen funcional y evitar omitir módulos importantes.

Impacto: Se priorizará primero el núcleo operativo, pero se conservarán todas las fases del Prompt Maestro.

## DECISIÓN 003

Fecha: 2026-09-02

Tema: Checklist de montacargas.

Situación: Novafiber no cuenta con un formulario establecido.

Alternativas: Esperar un formulario; diseñar uno nuevo.

Decisión tomada: Diseñar un checklist nuevo y adaptable al tipo de montacargas.

Motivo: El usuario autorizó cubrir el estado mecánico, hidráulico, operativo y de seguridad.

Impacto: La lista definitiva deberá contrastarse con los modelos y manuales reales cuando estén disponibles.

## DECISIÓN 004

Fecha: 2026-09-02

Tema: Históricos y operaciones administrativas.

Situación: Se debía definir quién modifica, anula o desactiva registros.

Alternativas: Permitir edición por cada creador; limitarla a perfiles privilegiados.

Decisión tomada: Solo administrador y técnico de soporte podrán modificar, anular o desactivar registros protegidos.

Motivo: Conservar control y trazabilidad.

Impacto: No habrá eliminación física normal; toda acción sensible deberá quedar auditada.

## DECISIÓN 005

Fecha: 2026-09-02

Tema: Control de versiones.

Situación: La carpeta no era un repositorio Git.

Alternativas: Continuar sin control de versiones; inicializar Git localmente.

Decisión tomada: Inicializar Git en la rama `main`.

Motivo: Mantener respaldo y trazabilidad técnica desde el inicio.

Impacto: Se utilizarán commits pequeños y `.gitignore` para proteger secretos.

## DECISIÓN 006

Fecha: 2026-09-02

Tema: Arquitectura base y base de datos operacional.

Situación: Debe compararse Cloud Firestore con Realtime Database.

Alternativas: Cloud Firestore o Realtime Database; frontend simple o SPA por componentes.

Decisión tomada: React con Vite y JavaScript modular para el frontend; Firebase Authentication; Cloud Firestore; Security Rules; Firebase Hosting.

Motivo: Firestore se ajusta mejor a las entidades, históricos, filtros e índices. React permite organizar las numerosas pantallas y permisos sin introducir un backend monolítico. Vite es compatible con Node.js 22.20.0.

Impacto: La aplicación será una SPA; las consultas se encapsularán; Hosting reescribirá rutas hacia `index.html`.

Fuente oficial: https://firebase.google.com/docs/database/rtdb-vs-firestore

## DECISIÓN 007

Fecha: 2026-09-02

Tema: Evidencias fotográficas.

Situación: Cloud Storage exige actualmente el plan Blaze.

Alternativas: Habilitar facturación ahora; bloquear módulos hasta tener Storage; conservar adjuntos como función opcional condicionada.

Decisión tomada: Los formularios principales funcionarán sin archivos adjuntos. La carga de evidencias se habilitará únicamente después de autorizar Blaze.

Motivo: Evitar costos o facturación no autorizados sin bloquear el núcleo operacional.

Impacto: El modelo admite URLs futuras, pero la primera implementación no dependerá de Storage.

Fuente oficial: https://firebase.google.com/docs/storage/web/start

## DECISIÓN 008

Fecha: 2026-09-02

Tema: Integración con SAP.

Situación: El stock procede de una consulta SQL Server autorizada.

Alternativas: Conexión SQL directa desde navegador; backend intermedio; snapshot sincronizado.

Decisión tomada: Prohibir conexión SQL desde el navegador y utilizar un proceso seguro de solo lectura que publique un snapshot controlado.

Motivo: Proteger credenciales, aislar la red de SAP y mantener la aplicación disponible si SAP falla.

Impacto: Se deberá definir dónde se ejecutará el sincronizador antes de implementar la conexión real.
