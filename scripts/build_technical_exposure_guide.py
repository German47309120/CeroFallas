from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "deliverables" / "guia_tecnica_exposicion"
OUTPUT = OUT_DIR / "CeroFallas_Guia_Tecnica_Exposicion.docx"

NAVY = "123A43"
TEAL = "0F7478"
PALE = "EAF4F4"
LIGHT = "F4F6F7"
GRAY = "5B6770"
WHITE = "FFFFFF"
BLACK = "000000"


def set_cell_fill(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=110, start=120, bottom=110, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def prevent_row_split(row):
    tr_pr = row._tr.get_or_add_trPr()
    tr_pr.append(OxmlElement("w:cantSplit"))


def set_keep_with_next(paragraph, value=True):
    paragraph.paragraph_format.keep_with_next = value


def add_heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    set_keep_with_next(p)
    return p


def add_bullets(doc, items, level=0):
    for item in items:
        p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
        p.add_run(item)


def add_steps(doc, items):
    for index, item in enumerate(items, start=1):
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.28)
        p.paragraph_format.first_line_indent = Inches(-0.28)
        p.add_run(f"{index}. ").bold = True
        p.add_run(item)


def add_code(doc, code):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.left_indent = Inches(0.22)
    p.paragraph_format.right_indent = Inches(0.12)
    p.paragraph_format.keep_together = True
    p_pr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), "EEF1F2")
    p_pr.append(shd)
    run = p.add_run(code)
    run.font.name = "Consolas"
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), "Consolas")
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), "Consolas")
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor.from_string(NAVY)


def add_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    table.autofit = False
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for idx, header in enumerate(headers):
        cell = hdr.cells[idx]
        set_cell_fill(cell, NAVY)
        set_cell_margins(cell)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(header)
        run.bold = True
        run.font.color.rgb = RGBColor.from_string(WHITE)
        run.font.size = Pt(9)
    for row_index, values in enumerate(rows):
        row = table.add_row()
        prevent_row_split(row)
        for idx, value in enumerate(values):
            cell = row.cells[idx]
            set_cell_margins(cell)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            if row_index % 2:
                set_cell_fill(cell, PALE)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(str(value))
            run.font.size = Pt(8.6)
    if widths:
        for row in table.rows:
            for idx, width in enumerate(widths):
                row.cells[idx].width = Inches(width)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def add_architecture(doc):
    add_heading(doc, "Arquitectura recomendada de integración", 2)
    rows = [
        ("Red de planta", "WireGuard o red interna", "SQL Server de SAP", "Consulta SELECT con usuario de solo lectura"),
        ("Puente interno", "Proceso Node programado", "Firestore", "Normaliza y publica código, descripción, cantidad y almacén"),
        ("Aplicación", "Firebase Hosting", "Usuarios de CeroFallas", "Consulta Firestore; nunca recibe credenciales SQL"),
        ("Analítica", "Gateway local", "Power BI Service", "Actualiza el modelo semántico desde SQL Server"),
        ("Visualización", "Backend de tokens", "Power BI Embedded", "Entrega token temporal al usuario ya autenticado en CeroFallas"),
    ]
    add_table(doc, ["Zona", "Componente", "Destino", "Responsabilidad"], rows, [1.0, 1.45, 1.45, 3.0])


doc = Document()
section = doc.sections[0]
section.top_margin = Inches(0.72)
section.bottom_margin = Inches(0.92)
section.footer_distance = Inches(0.28)
section.left_margin = Inches(0.78)
section.right_margin = Inches(0.78)

styles = doc.styles
styles["Normal"].font.name = "Aptos"
styles["Normal"]._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
styles["Normal"]._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
styles["Normal"].font.size = Pt(10.2)
styles["Normal"].font.color.rgb = RGBColor.from_string(BLACK)
styles["Normal"].paragraph_format.space_after = Pt(6)
styles["Normal"].paragraph_format.line_spacing = 1.12

for name, size in (("Title", 26), ("Heading 1", 17), ("Heading 2", 13), ("Heading 3", 11)):
    style = styles[name]
    style.font.name = "Aptos Display"
    style._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    style._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor.from_string(BLACK)
    style.paragraph_format.space_before = Pt(12 if name != "Title" else 0)
    style.paragraph_format.space_after = Pt(6)

# Word and LibreOffice can apply a theme border to the built-in Title style.
# Remove it explicitly so hierarchy comes from typography and whitespace.
title_ppr = styles["Title"]._element.get_or_add_pPr()
for border in title_ppr.findall(qn("w:pBdr")):
    title_ppr.remove(border)

footer = section.footer
footer_p = footer.paragraphs[0]
footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
footer_run = footer_p.add_run("CeroFallas  |  Guía técnica para exposición")
footer_run.font.size = Pt(8)

title = doc.add_paragraph(style="Title")
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.add_run("CeroFallas Guía técnica para exposición")
subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run("Integración SAP SQL Server  Power BI  Firebase  e inteligencia artificial")
run.bold = True
run.font.size = Pt(13)
run.font.color.rgb = RGBColor.from_string(TEAL)
meta = doc.add_paragraph()
meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
meta.add_run("Proyecto de Graduación II\nGerman Antonio Hernández Sánchez\nVersión 15 de octubre de 2026")
doc.add_paragraph()
intro = doc.add_paragraph()
intro.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
intro.add_run("Propósito. ").bold = True
intro.add_run("Esta guía permite explicar y demostrar cómo funciona CeroFallas, dónde se encuentra el código y la información, cómo se prepara la conexión con SAP y qué se necesita para mostrar Power BI dentro de la aplicación sin entregar credenciales a los usuarios. También establece la forma correcta de presentar la inteligencia artificial sin confundir una simulación académica con un modelo productivo de planta.")

add_heading(doc, "Conclusión técnica", 1)
doc.add_paragraph("CeroFallas ya posee la base web, Firebase Authentication, Firestore, reglas por permisos, trazabilidad, el conector controlado de stock y un laboratorio predictivo reproducible. La conexión directa del navegador a SAP no es segura ni técnicamente viable desde Firebase Hosting. El diseño correcto utiliza un proceso interno que entra a SQL Server a través de WireGuard y publica un snapshot de solo lectura en Firestore.")
doc.add_paragraph("Power BI puede aparecer dentro de CeroFallas. Si se desea evitar por completo un segundo inicio de sesión, debe utilizarse la modalidad Embed for your customers, también conocida como app owns data. Esta modalidad requiere un backend seguro, una identidad de servicio de Microsoft Entra y una capacidad de Power BI Embedded o Microsoft Fabric. Un iframe privado sencillo todavía solicita autenticación Microsoft; Publicar en la web no solicita autenticación, pero vuelve pública la información y no debe usarse con datos institucionales.")

add_table(doc, ["Componente", "Estado demostrable", "Pendiente real"], [
    ("Aplicación web", "Publicada y protegida por roles", "Aceptación institucional final"),
    ("Base operacional", "Firestore con colecciones y auditoría", "Gobierno y respaldo institucional"),
    ("Stock SAP", "Consulta y sincronizador implementados", "Automatización permanente dentro de la red o VPN"),
    ("Power BI", "Exportación analítica y ruta preparada", "PBIX privado, gateway y modalidad de incrustación"),
    ("IA predictiva", "Dos modelos y simulación reproducible", "Histórico real, validación y automatización"),
], [1.45, 2.65, 2.8])

doc.add_page_break()
add_heading(doc, "1 Integración segura con SAP SQL Server", 1)
add_architecture(doc)
add_heading(doc, "Por qué no se conecta el navegador directamente", 2)
add_bullets(doc, [
    "Firebase Hosting entrega archivos estáticos y no forma parte del túnel WireGuard de la computadora de planta.",
    "Una conexión SQL desde React expondría servidor, usuario y contraseña a cualquier persona que inspeccione el navegador.",
    "SQL Server no debe publicarse a Internet para resolver esta integración.",
    "El mantenimiento debe continuar funcionando aunque SAP o la VPN estén temporalmente fuera de servicio.",
])
add_heading(doc, "Flujo correcto del stock", 2)
add_steps(doc, [
    "WireGuard conecta una computadora o servidor autorizado con la red donde reside SQL Server.",
    "El proceso scripts/sap-stock-sync.mjs ejecuta únicamente la consulta SELECT aprobada.",
    "El proceso valida y normaliza código, descripción, cantidad y almacén.",
    "El snapshot se publica en la colección stock y registra el resultado en integrationStatus.",
    "La aplicación consulta Firestore. Si SAP falla, conserva el último snapshot y muestra su antigüedad.",
])
add_heading(doc, "Consulta autorizada", 2)
add_code(doc, "SELECT W.ItemCode AS codigo, I.ItemName AS descripcion,\n       W.OnHand AS cantidad, W.WhsCode AS almacen\nFROM OITW AS W\nINNER JOIN OITM AS I ON I.ItemCode = W.ItemCode\nWHERE W.OnHand <> 0 AND W.ItemCode LIKE 'REP%'\nORDER BY W.ItemCode ASC;")
doc.add_paragraph("Esta consulta alimenta inventario. No contiene mantenimientos, incidentes ni datos predictivos. Tampoco descuenta repuestos: CeroFallas registra el consumo dentro del mantenimiento, mientras SAP continúa siendo la fuente oficial del inventario. Un descuento real requeriría una transacción autorizada o una API de SAP, revisión funcional y auditoría adicional.")

add_heading(doc, "Procedimiento para conectar y publicar", 2)
add_steps(doc, [
    "Active WireGuard y confirme que el túnel muestre un handshake reciente.",
    "Sin proyectar información sensible, compruebe el puerto con Test-NetConnection SERVIDOR -Port PUERTO.",
    "Guarde servidor, puerto, base, usuario y contraseña solamente en .local/sap-stock.env. La carpeta .local está fuera de Git.",
    "Guarde la consulta aprobada en .local/sap-stock-query.sql.",
    "Valide la configuración sin conectarse mediante npm run sap:stock:check.",
    "Ejecute npm run sap:stock:dry-run. Debe informar cantidad de filas y almacenes sin publicar ni imprimir credenciales.",
    "Revise el resultado y publique únicamente después con la confirmación exacta del proyecto.",
    "Abra CeroFallas en Repuestos y confirme códigos, almacenes y la fecha de sincronización.",
])
add_code(doc, "npm run sap:stock:check\nnpm run sap:stock:dry-run\nnpm run sap:stock:publish -- --confirm-project=cerofallas-pg2-german-2026\nnpm run sap:stock:verify-cloud")

add_heading(doc, "Automatización recomendada", 2)
doc.add_paragraph("Para producción, el script debe ejecutarse desde una computadora o servidor institucional siempre encendido. En Windows puede configurarse una tarea programada cada 15 o 30 minutos con una cuenta técnica de mínimo privilegio. WireGuard debe iniciar con el equipo y mantener el túnel activo. La tarea debe guardar únicamente estado, fecha y conteos seguros; nunca la contraseña ni el contenido completo de SAP en sus registros.")

add_heading(doc, "2 Power BI dentro de CeroFallas", 1)
add_heading(doc, "Alternativas y decisión", 2)
add_table(doc, ["Modalidad", "Experiencia", "Seguridad y licencia", "Uso recomendado"], [
    ("Publicar en la web", "Sin segundo inicio de sesión", "El reporte queda público en Internet", "Solo datos públicos o totalmente anonimizados"),
    ("Incrustación segura", "Reporte dentro de la app, pero solicita Microsoft", "Respeta permisos; cada visor necesita licencia salvo capacidad compatible", "Portal interno con usuarios Microsoft"),
    ("Embed for your customers", "El usuario inicia sesión únicamente en CeroFallas", "Backend, identidad Entra y capacidad Embedded o Fabric", "Opción final para centralización real"),
], [1.25, 1.75, 2.35, 1.75])

add_heading(doc, "Diseño recomendado de inicio único", 2)
add_steps(doc, [
    "El usuario inicia sesión en CeroFallas mediante Firebase Authentication.",
    "El frontend solicita al backend la configuración del reporte y envía su token Firebase.",
    "El backend valida la identidad, el perfil activo y el permiso dashboard read o analytics export.",
    "Una identidad de servicio de Microsoft Entra solicita a Power BI un embed token de corta duración.",
    "El backend devuelve únicamente reportId, embedUrl y el token temporal; jamás entrega el secreto de Entra.",
    "La página Analítica carga el reporte con powerbi client y renueva el token antes de su vencimiento.",
    "Las reglas de Row Level Security se aplican si la audiencia necesita ver datos diferentes por área o rol.",
])

add_heading(doc, "Requisitos que deben conseguirse", 2)
add_bullets(doc, [
    "Área de trabajo privada de Power BI; el contenido no puede depender de un espacio personal para la modalidad embebida final.",
    "Aplicación registrada en Microsoft Entra y service principal autorizado por el administrador del tenant.",
    "Workspace ID, Report ID y Dataset o semantic model ID.",
    "Capacidad de Power BI Embedded o Microsoft Fabric asignada al área de trabajo para producción.",
    "Backend con secretos fuera del frontend. En Firebase, Cloud Functions o Cloud Run requieren facturación Blaze; también puede usarse un servidor institucional HTTPS.",
    "Definición de audiencia y Row Level Security antes de publicar datos reales.",
])

add_heading(doc, "Origen y actualización de los datos", 2)
doc.add_paragraph("El PBIX puede usar la misma consulta SQL de stock. Para actualizarla en Power BI Service cuando SQL Server está dentro de la red, se instala On premises data gateway en un equipo que alcance SQL Server por red local o WireGuard. El nombre del servidor y la base deben coincidir entre Power BI Desktop y la fuente configurada en el gateway.")
doc.add_paragraph("Los correctivos, preventivos, incidentes y predicciones no salen de esa consulta. Actualmente CeroFallas genera un CSV controlado desde Reporte consolidado. Para una actualización automática futura se necesita un endpoint backend autorizado, una réplica analítica o una integración administrada hacia BigQuery. No se deben consultar colecciones de Firestore con credenciales administrativas dentro del PBIX compartido.")

add_heading(doc, "Implementación por etapas", 2)
add_table(doc, ["Etapa", "Resultado", "Riesgo controlado"], [
    ("1 Presentación", "PBIX privado con stock y CSV de CeroFallas", "Actualización manual identificada"),
    ("2 Operación", "Gateway programado para SQL Server", "Credenciales administradas por el gateway"),
    ("3 Centralización", "Backend de embed tokens y reporte dentro de Analítica", "Sin segundo login y sin secretos en navegador"),
    ("4 Gobierno", "RLS, monitoreo, expiración y auditoría", "Acceso mínimo y trazable"),
], [1.2, 3.0, 2.9])

add_heading(doc, "3 Cómo demostrar el código", 1)
doc.add_paragraph("Abra Visual Studio Code en C:\\PG2_CeroFallas. Evite abrir .env local, archivos de cuenta de servicio o credenciales durante la exposición.")
add_table(doc, ["Archivo", "Qué demuestra"], [
    ("src/app/App.jsx", "Rutas de la aplicación y páginas protegidas"),
    ("src/features/auth/AuthContext.jsx", "Sesión Firebase, perfil activo y permisos"),
    ("src/config/roles.js", "Once roles, catálogo de permisos y dependencias"),
    ("firestore.rules", "Seguridad aplicada también en la base de datos"),
    ("src/services/firebase/", "Separación entre interfaz y acceso a datos"),
    ("scripts/sap-stock-sync.mjs", "Conector SQL de solo lectura y publicación controlada"),
    ("predictive/train_compare.py", "Entrenamiento y comparación de modelos"),
    ("tests/user-permissions.rules.test.js", "Pruebas negativas y de autorización"),
], [2.55, 4.65])

add_heading(doc, "Recorrido de cinco minutos", 2)
add_steps(doc, [
    "Muestre App jsx y explique que React Router decide qué pantalla corresponde a cada URL.",
    "Muestre AuthContext y roles js. Explique que la interfaz oculta opciones, pero la protección real también está en Firestore Rules.",
    "Muestre una regla concreta, por ejemplo users o correctives, y señale autenticación, permiso, timestamp del servidor y auditoría.",
    "Muestre un servicio de Firebase para explicar que los componentes no escriben directamente de forma dispersa.",
    "Muestre una prueba que intente una operación sin permiso y explique que el emulador confirma el rechazo.",
])
add_heading(doc, "Comandos seguros para demostrar calidad", 2)
add_code(doc, "npm run lint\nnpm run build\nnpm run predictive:test")
doc.add_paragraph("La suite completa npm test levanta el emulador de Firestore y puede tomar más tiempo. Para una exposición corta, ejecute previamente las pruebas y conserve el resultado; durante la defensa puede mostrar una prueba focalizada si el tiempo es limitado.")

add_heading(doc, "Explicación breve sugerida", 2)
doc.add_paragraph("La aplicación usa una arquitectura por capas. React presenta la interfaz, los servicios encapsulan Firestore, Firebase Authentication identifica a la persona y Firestore Rules vuelve a validar cada lectura o escritura. Por eso ocultar un botón no es la única protección. Las operaciones sensibles generan auditoría en el mismo lote para evitar registros sin trazabilidad.")

add_heading(doc, "4 Cómo demostrar la base de datos", 1)
add_heading(doc, "Firestore", 2)
add_steps(doc, [
    "Abra Firebase Console y seleccione el proyecto cerofallas pg2 german 2026.",
    "Entre a Firestore Database y abra la pestaña Datos.",
    "Muestre primero equipment y un documento con código, área, criticidad y estado.",
    "Muestre correctives, preventivePlans, preventiveExecutions, incidents y forkliftInspections.",
    "Muestre stock y señale source, syncedAt, código, cantidad y almacén.",
    "Muestre riskPredictions y explique calculatedAt, riskScore, riskLevel, methodVersion y featuresSnapshot.",
    "Termine con audit para enseñar quién realizó la operación, cuándo y sobre qué entidad.",
])

add_table(doc, ["Colección", "Información principal", "Mensaje para la defensa"], [
    ("users", "Perfil, rol, permisos y estado", "Authentication identifica; users autoriza"),
    ("equipment", "Catálogo de maquinaria", "Punto central de los historiales"),
    ("correctives", "Falla, atención, duración y repuestos usados", "Hora oficial y trazabilidad"),
    ("preventivePlans", "Frecuencia y próxima fecha", "Alimenta agenda y Gantt"),
    ("preventiveExecutions", "Trabajo realizado y cumplimiento", "Separa plan de ejecución real"),
    ("incidents", "Reporte, prioridad y seguimiento", "Puede vincularse con un correctivo"),
    ("stock", "Snapshot de SAP por código y almacén", "Solo lectura en CeroFallas"),
    ("riskPredictions", "Riesgo fechado y versionado", "Resultado de IA separado de la operación"),
    ("audit", "Actor, acción, entidad y tiempo", "No se elimina desde la aplicación"),
], [1.5, 2.65, 3.25])

add_heading(doc, "SQL Server de SAP", 2)
add_steps(doc, [
    "Active WireGuard antes de abrir SQL Server Management Studio.",
    "Conecte con su usuario autorizado sin mostrar la contraseña al público.",
    "Seleccione la base correcta y ejecute la consulta REP de solo lectura.",
    "Enseñe las cuatro columnas: código, descripción, cantidad y almacén.",
    "Compare uno o dos códigos con la pantalla Repuestos y la fecha de sincronización.",
])
doc.add_paragraph("No edite documentos directamente desde Firebase Console durante la exposición. Use los formularios de CeroFallas para demostrar que las reglas, timestamps y auditoría intervienen. En SQL Server ejecute únicamente SELECT.")

add_heading(doc, "Respuesta si preguntan por el descuento de repuestos", 2)
doc.add_paragraph("Respuesta correcta: CeroFallas registra qué repuesto se utilizó en la orden de mantenimiento, pero no descuenta el inventario oficial. El stock es un espejo de consulta proveniente de SAP. Para descontarlo se debe integrar una operación autorizada de SAP con validación, reversión y auditoría; no es seguro convertir la aplicación web en un cliente con permisos de escritura sobre SAP.")

doc.add_page_break()
add_heading(doc, "5 Cómo demostrar la inteligencia artificial", 1)
add_heading(doc, "Qué hace el laboratorio", 2)
doc.add_paragraph("Cada fila representa un equipo en una fecha de corte. Las variables utilizan únicamente información conocida hasta esa fecha. La etiqueta failure next 30d indica si hubo una falla en los 30 días posteriores. El código divide las fechas antiguas para entrenamiento y las recientes para prueba, compara regresión logística con Random Forest y reporta métricas reproducibles.")

add_table(doc, ["Elemento", "Explicación"], [
    ("Regresión logística", "Línea base interpretable para comparar dirección y peso de variables"),
    ("Random Forest", "Segundo candidato que captura relaciones no lineales e interacciones"),
    ("PR AUC", "Métrica principal porque las fallas pueden ser la clase minoritaria"),
    ("División temporal", "Evita entrenar con eventos posteriores al período evaluado"),
    ("featuresSnapshot", "Conserva las variables usadas para explicar y auditar el resultado"),
    ("methodVersion", "Permite conocer exactamente qué versión produjo cada predicción"),
], [1.8, 5.6])

add_heading(doc, "Demostración paso a paso", 2)
add_steps(doc, [
    "Abra predictive schema py y señale los campos, rangos y variable objetivo.",
    "Abra generate demo dataset py y explique que crea datos sintéticos con semilla fija.",
    "Abra train compare py y enseñe la división temporal y los dos modelos.",
    "Ejecute las pruebas predictivas y luego la simulación reproducible.",
    "Abra el JSON de resultados en .local y muestre métricas, huella y advertencia demonstration only.",
    "En la aplicación abra Riesgo predictivo, filtre un equipo y explique fecha, nivel, puntuación, variables y versión.",
])
add_code(doc, "npm run predictive:test\nnpm run predictive:demo")

add_heading(doc, "Qué debe decir y qué no debe decir", 2)
add_table(doc, ["Sí decir", "No afirmar"], [
    ("El pipeline de IA es reproducible y compara dos modelos.", "La IA ya predice fallas reales de Novafiber."),
    ("Los resultados visibles están identificados como simulación.", "Las métricas sintéticas representan exactitud productiva."),
    ("El diseño evita usar información posterior a la fecha de corte.", "La IA toma decisiones o programa mantenimiento sola."),
    ("El siguiente paso es validar histórico real con Mantenimiento.", "El modelo está terminado sin catálogo ni histórico real."),
], [3.6, 3.6])

add_heading(doc, "Camino hacia un modelo real", 2)
add_steps(doc, [
    "Acordar con Mantenimiento qué evento cuenta como falla y qué horizonte se desea anticipar.",
    "Obtener historial autorizado con equipos estables, fechas, correctivos, preventivos, incidentes, checklist y horas de operación.",
    "Validar calidad, duplicados, anulaciones, períodos faltantes y representatividad.",
    "Entrenar y evaluar por períodos; comparar contra una regla simple y revisar falsos positivos y falsos negativos.",
    "Aprobar el modelo con responsables humanos antes de publicar resultados reales.",
    "Automatizar cada 24 horas y conservar versión, fecha, variables, monitoreo y posibilidad de reversión.",
])

add_heading(doc, "6 Guion completo de exposición", 1)
add_table(doc, ["Minuto", "Demostración", "Mensaje principal"], [
    ("0 a 2", "Problema, objetivo y arquitectura", "Una sola plataforma para operación, trazabilidad y análisis"),
    ("2 a 5", "Login, menú y permisos", "Cada rol ve y ejecuta únicamente lo autorizado"),
    ("5 a 9", "Correctivo, preventivo e incidente", "Tiempos del servidor, estados y auditoría"),
    ("9 a 11", "Repuestos y SAP", "Snapshot de solo lectura sincronizado desde SQL Server"),
    ("11 a 14", "Dashboard, Gantt y reporte", "La información operativa se convierte en decisiones gerenciales"),
    ("14 a 17", "IA predictiva", "Pipeline reproducible, simulación honesta y ruta hacia datos reales"),
    ("17 a 20", "Código, Firestore y pruebas", "La seguridad existe en interfaz, servicios y reglas"),
], [0.85, 2.7, 3.65])

add_heading(doc, "Respuestas rápidas a preguntas probables", 2)
add_table(doc, ["Pregunta", "Respuesta sugerida"], [
    ("¿Dónde están los datos?", "En Cloud Firestore; la identidad está en Firebase Authentication y SAP sigue siendo la fuente oficial del stock."),
    ("¿Por qué Firestore y no todo en SQL Server?", "Firestore soporta la aplicación web, permisos y sincronización en tiempo real; SAP se mantiene aislado como sistema empresarial."),
    ("¿Qué pasa si WireGuard se cae?", "La app continúa con el último snapshot e informa su fecha; no bloquea mantenimientos."),
    ("¿Power BI puede abrir dentro de la app?", "Sí. Con app owns data el backend entrega un token temporal y el usuario no inicia sesión nuevamente."),
    ("¿Por qué no usar Publicar en la web?", "Porque el enlace es público y no corresponde a datos institucionales."),
    ("¿La IA ya es productiva?", "No. El pipeline está implementado y validado con simulación; falta histórico real y aprobación técnica."),
    ("¿Cómo evitan cambios de hora?", "Las operaciones críticas usan timestamps del servidor y las reglas rechazan valores manipulados."),
    ("¿Cómo se controla el acceso?", "Firebase Authentication identifica; el perfil y Firestore Rules autorizan; la auditoría registra cambios sensibles."),
], [2.3, 4.9])

add_heading(doc, "Lista de verificación antes de presentar", 2)
add_bullets(doc, [
    "Probar las cuentas que se utilizarán y liberar sesiones antiguas si corresponde.",
    "Confirmar acceso a Internet, URL publicada y carga de Firestore.",
    "Si se demostrará SAP, activar WireGuard y probar SQL Server antes de iniciar la reunión.",
    "No proyectar archivos .env, contraseñas, claves privadas ni tokens.",
    "Preparar Power BI Desktop o el reporte privado; no usar un enlace público con datos reales.",
    "Ejecutar previamente lint, build y pruebas predictivas.",
    "Abrir las pestañas necesarias con anticipación: CeroFallas, Firebase Console, VS Code y Power BI.",
    "Mantener disponible una captura o video breve por si falla la red, sin sustituir la demostración principal.",
])

add_heading(doc, "7 Información necesaria para completar las integraciones", 1)
add_table(doc, ["Integración", "Datos o decisión requerida"], [
    ("SAP", "Host o instancia, puerto TCP fijo, base, usuario SQL de solo lectura, disponibilidad permanente de WireGuard y equipo ejecutor"),
    ("Power BI", "Tenant, workspace, report, semantic model, licencia o capacidad, administrador Entra y política de RLS"),
    ("Backend", "Elegir Cloud Functions o Cloud Run con Blaze, o servidor institucional HTTPS; definir custodia de secretos"),
    ("IA real", "Catálogo estable, definición de falla, histórico, horas de uso, calidad, aprobación y calendario de reentrenamiento"),
], [1.25, 5.95])

add_heading(doc, "Fuentes oficiales consultadas", 1)
sources = [
    ("Microsoft Learn", "Conectar y actualizar SQL Server local mediante On premises data gateway", "https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-sql-tutorial"),
    ("Microsoft Learn", "Incrustar un reporte en un portal seguro", "https://learn.microsoft.com/power-bi/collaborate-share/service-embed-secure"),
    ("Microsoft Learn", "Escenario Embed for your customers", "https://learn.microsoft.com/en-us/power-bi/guidance/powerbi-implementation-planning-usage-scenario-embed-for-your-customers"),
    ("Microsoft Learn", "Tokens e identidad de servicio para Power BI Embedded", "https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-tokens"),
    ("Firebase", "Integrar Firebase Hosting con servicios de Cloud Run", "https://firebase.google.com/docs/hosting/cloud-run"),
]
for organization, label, url in sources:
    p = doc.add_paragraph()
    p.add_run(f"{organization}. ").bold = True
    p.add_run(f"{label}. {url}")

add_heading(doc, "Ubicaciones técnicas del proyecto", 2)
add_bullets(doc, [
    "Repositorio local: C:\\PG2_CeroFallas",
    "Aplicación publicada: https://cerofallas-pg2-german-2026.web.app",
    "Conector SAP: scripts\\sap-stock-sync.mjs",
    "Consulta base: integrations\\sap-stock-query.example.sql",
    "Modelo de datos: docs\\data-model.md",
    "Plan predictivo: docs\\predictive-plan.md",
    "Laboratorio IA: predictive\\",
    "Reglas de seguridad: firestore.rules",
])

OUT_DIR.mkdir(parents=True, exist_ok=True)
doc.core_properties.title = "CeroFallas Guía técnica para exposición"
doc.core_properties.subject = "SAP SQL Server Power BI Firebase e inteligencia artificial"
doc.core_properties.author = "German Antonio Hernández Sánchez"
doc.core_properties.keywords = "CeroFallas, SAP, SQL Server, Power BI, Firebase, IA"
doc.save(OUTPUT)
print(OUTPUT)
