# CeroFallas — Mockups para Figma

Este paquete contiene 12 pantallas de escritorio y 3 vistas web móviles. Son propuestas conceptuales basadas en los requisitos del proyecto: no son capturas exactas ni evidencia de funcionalidades terminadas.

## Importación

1. Abre el archivo en el editor **Figma Design**, no en la vista de presentación `/proto/`:
   https://www.figma.com/design/heDrqPqJ9rmLH6WOqlGajM
2. Abre esta carpeta en el Explorador de Windows.
3. Arrastra los archivos `.svg` al lienzo del editor. Puedes comenzar con `02-dashboard.svg`.
4. Organiza los diseños y crea marcos por pantalla si necesitas enlazarlos en un prototipo.
5. Si Figma solicita una fuente, usa Inter o Segoe UI disponible en tu equipo.

Los SVG contienen texto y figuras vectoriales, no capturas rasterizadas. La conservación del texto como texto depende del importador de Figma. No incluyen componentes nativos, auto-layout, validaciones ni enlaces de prototipo. La importación en tu cuenta no se ha podido verificar por el límite de herramientas del plan Starter.

`galeria.html` permite revisar todas las pantallas desde el navegador. `manifest.json` enumera los archivos y dimensiones. Los archivos SVG son la fuente visual principal; las imágenes PNG, si están presentes, son únicamente vistas previas.

## Cómo explicarlo en la defensa

- **Mockup:** describe cómo se organiza una pantalla. No ejecuta procesos ni guarda datos.
- **Aplicación web responsive:** una misma solución se adapta a escritorio y teléfono; no hay una aplicación Android nativa.
- **Formulario:** captura datos con validación. Por ejemplo, en correctivos las horas de inicio y fin permiten calcular la duración.
- **Modelo de datos:** cada intervención se relaciona con un equipo y un usuario. Los planes y sus ejecuciones se conservan como registros relacionados.
- **Permisos:** la interfaz muestra opciones por rol; la seguridad también debe imponerse en el backend. Ocultar un botón no es una autorización suficiente.
- **Auditoría:** permite conocer quién cambió un registro, cuándo y por qué, sin permitir editar la propia bitácora.
- **Stock:** se prevé consultar SQL Server/SAP mediante una integración autorizada de solo lectura. El navegador no debe recibir credenciales SQL.
- **Predictivo:** sin histórico suficiente no se debe prometer precisión. Primero hay que recopilar y depurar eventos y luego comparar modelos con evaluación temporal.

## Alcance y cautelas

Todos los códigos y valores de ejemplo son ficticios. Las frecuencias preventivas son ilustrativas y requieren validación técnica. El checklist mostrado es un resumen, no una certificación de seguridad. Los nombres y modelos reales de máquinas siguen pendientes de planta. Los mockups no sustituyen la verificación del estado real del desarrollo.

## Reproducir los archivos

Desde la raíz del proyecto: `node scripts/build-figma-mockups.cjs`.
El generador solo escribe en esta carpeta; no modifica la aplicación ni sus datos.
