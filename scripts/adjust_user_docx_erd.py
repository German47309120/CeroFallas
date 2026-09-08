from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(r"C:\PG2_CeroFallas")
SOURCE = Path(r"C:\Users\gh650\OneDrive\Desktop\2do Entregable PG2.docx")
OUTPUT_DIR = ROOT / "deliverables" / "segunda_entrega"
OUTPUT = OUTPUT_DIR / "2do Entregable PG2 Ajustado.docx"
ASSET = OUTPUT_DIR / "assets" / "modelo_entidad_relacion_general.png"

TEAL = "0B5960"
DARK = "24343A"
GRAY = "5F6F75"
LIGHT = "F4F7F8"
BORDER = "D9D9D9"
BLUE = "DCEEF2"


def font(size: int, bold: bool = False):
    names = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for name in names:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()


def rounded_card(draw, box, title, fields, fill="#F7FAFB"):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=24, fill=fill, outline="#0B5960", width=5)
    draw.rounded_rectangle((x1, y1, x2, y1 + 105), radius=24, fill="#0B5960")
    draw.rectangle((x1, y1 + 76, x2, y1 + 105), fill="#0B5960")
    draw.text((x1 + 30, y1 + 22), title, font=font(47, True), fill="white")
    y = y1 + 130
    for value in fields:
        draw.text((x1 + 30, y), value, font=font(35), fill="#24343A")
        y += 66


def anchor(box, side):
    x1, y1, x2, y2 = box
    if side == "l":
        return x1, (y1 + y2) // 2
    if side == "r":
        return x2, (y1 + y2) // 2
    if side == "t":
        return (x1 + x2) // 2, y1
    return (x1 + x2) // 2, y2


def connector(draw, boxes, src, dst, src_side, dst_side, labels=("1", "0..N"), dashed=False, via=None, color="#17737B"):
    start = anchor(boxes[src], src_side)
    end = anchor(boxes[dst], dst_side)
    points = [start]
    if via:
        points.extend(via)
    elif src_side in ("l", "r"):
        mid = (start[0] + end[0]) // 2
        points.extend([(mid, start[1]), (mid, end[1])])
    else:
        mid = (start[1] + end[1]) // 2
        points.extend([(start[0], mid), (end[0], mid)])
    points.append(end)
    if dashed:
        for a, b in zip(points, points[1:]):
            x1, y1 = a
            x2, y2 = b
            length = max(abs(x2 - x1), abs(y2 - y1))
            steps = max(1, length // 28)
            for i in range(0, steps, 2):
                t1, t2 = i / steps, min(1, (i + 1) / steps)
                draw.line((x1 + (x2-x1)*t1, y1 + (y2-y1)*t1, x1 + (x2-x1)*t2, y1 + (y2-y1)*t2), fill=color, width=7)
    else:
        draw.line(points, fill=color, width=7, joint="curve")
    lf = font(28, True)
    def label(pt, value, offset):
        if not value:
            return
        x, y = pt[0] + offset[0], pt[1] + offset[1]
        bbox = draw.textbbox((x, y), value, font=lf)
        draw.rounded_rectangle((bbox[0]-8, bbox[1]-4, bbox[2]+8, bbox[3]+4), radius=7, fill="white")
        draw.text((x, y), value, font=lf, fill=color)
    label(start, labels[0], (14, -42))
    label(end, labels[1], (-80, -42))


def build_erd(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (4800, 3000), "white")
    draw = ImageDraw.Draw(img)
    boxes = {
        "rol": (80, 190, 1110, 760),
        "usuario": (1260, 190, 2290, 760),
        "auditoria": (2440, 190, 3470, 760),
        "stock": (3620, 190, 4650, 760),
        "area": (80, 920, 1110, 1490),
        "equipo": (1260, 920, 2290, 1490),
        "incidente": (2440, 920, 3470, 1490),
        "correctivo": (3620, 920, 4650, 1490),
        "turno": (80, 1650, 1110, 2220),
        "plan": (1260, 1650, 2290, 2220),
        "ejecucion": (2440, 1650, 3470, 2220),
        "prediccion": (3620, 1650, 4650, 2220),
        "plantilla": (80, 2380, 1110, 2890),
        "inspeccion": (1260, 2380, 2290, 2890),
    }

    # Structural relations are drawn first so entity cards remain legible.
    connector(draw, boxes, "rol", "usuario", "r", "l")
    connector(draw, boxes, "usuario", "auditoria", "r", "l")
    connector(draw, boxes, "area", "equipo", "r", "l")
    connector(draw, boxes, "equipo", "incidente", "r", "l", labels=("1", "0..N"))
    connector(draw, boxes, "incidente", "correctivo", "r", "l", labels=("0..1", "0..1"))
    connector(draw, boxes, "equipo", "correctivo", "t", "t", via=[(1775, 835), (4135, 835)], labels=("1", "0..N"))
    connector(draw, boxes, "equipo", "plan", "b", "t")
    connector(draw, boxes, "plan", "ejecucion", "r", "l", labels=("0..1", "0..N"))
    connector(draw, boxes, "equipo", "ejecucion", "r", "t", via=[(2355, 1205), (2355, 1570), (2955, 1570)], labels=("1", "0..N"))
    connector(draw, boxes, "equipo", "prediccion", "b", "t", via=[(1775, 1570), (4135, 1570)], labels=("1", "0..N"))
    connector(draw, boxes, "plantilla", "inspeccion", "r", "l")
    connector(draw, boxes, "turno", "inspeccion", "b", "t", labels=("1", "0..N"))
    connector(draw, boxes, "equipo", "inspeccion", "l", "t", via=[(1180, 1205), (1180, 2300), (1775, 2300)], labels=("1", "0..N"))
    connector(draw, boxes, "stock", "correctivo", "b", "t", labels=("", ""), dashed=True, color="#B56B22")
    connector(draw, boxes, "stock", "ejecucion", "l", "r", labels=("", ""), dashed=True, color="#B56B22", via=[(3545, 475), (3545, 1935)])

    entities = {
        "rol": ("ROL", ["PK id : string", "name : string", "permissions : string[]", "status : enum"]),
        "usuario": ("USUARIO", ["PK uid : string", "FK roleId : string", "areaIds : string[]", "status : enum", "createdAt / updatedAt"]),
        "auditoria": ("AUDITORÍA", ["PK id : string", "FK actorId : string", "entityType + entityId", "action / occurredAt", "before / after : object?"]),
        "stock": ("STOCK REPUESTO", ["PK code + warehouse", "description : string", "quantity : decimal", "syncedAt : timestamp", "syncBatchId : string"]),
        "area": ("ÁREA", ["PK id : string", "code / name : string", "category : enum", "status : enum"]),
        "equipo": ("EQUIPO", ["PK id : string", "FK areaId : string", "code / name / type", "status / criticality", "createdBy / updatedBy"]),
        "incidente": ("INCIDENTE", ["PK id : string", "FK areaId / equipmentId?", "FK reporterId : string", "linkedCorrectiveId?", "priority / status"]),
        "correctivo": ("MANTENIMIENTO CORRECTIVO", ["PK id : string", "FK areaId / equipmentId", "technicianIds : string[]", "sourceIncidentId?", "startedAt / endedAt / status"]),
        "turno": ("TURNO", ["PK id : string", "name : string", "startTime / endTime", "crossesMidnight : boolean", "weekdays / status"]),
        "plan": ("PLAN PREVENTIVO", ["PK id : string", "FK equipmentId : string", "frequencyType / value / unit", "nextDueAt : timestamp", "assignedUserIds[] / status"]),
        "ejecucion": ("EJECUCIÓN PREVENTIVA", ["PK id : string", "FK planId? / equipmentId", "technicianIds : string[]", "startedAt / endedAt", "complianceStatus / status"]),
        "prediccion": ("PREDICCIÓN DE RIESGO", ["PK id : string", "FK equipmentId : string", "riskScore / riskLevel", "methodType / version", "calculatedAt : timestamp"]),
        "plantilla": ("PLANTILLA CHECKLIST", ["PK id : string", "version : integer", "equipmentTypes : string[]", "sections / items : object[]", "status : enum"]),
        "inspeccion": ("INSPECCIÓN MONTACARGAS", ["PK id : string", "FK equipmentId / templateId", "FK shiftId / operatorId", "answers : object[]", "overallResult / status"]),
    }
    fills = {"rol": "#EAF3F4", "usuario": "#EAF3F4", "auditoria": "#EAF3F4", "stock": "#FFF5E8"}
    for key, (title, fields) in entities.items():
        rounded_card(draw, boxes[key], title, fields, fills.get(key, "#F7FAFB"))

    draw.text((80, 45), "PK = identificador   |   FK = referencia lógica   |   ? = opcional", font=font(34), fill="#5F6F75")
    draw.line((3180, 78, 3330, 78), fill="#B56B22", width=7)
    draw.text((3360, 45), "integración de solo lectura y snapshot", font=font(34), fill="#7A4A1D")
    img.save(path, quality=95, dpi=(300, 300))


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=110, start=110, bottom=110, end=110):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for side, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{side}"))
        if node is None:
            node = OxmlElement(f"w:{side}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color=BORDER, size="6"):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = borders.find(qn(f"w:{edge}"))
        if element is None:
            element = OxmlElement(f"w:{edge}")
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_font(run, name="Times New Roman", size=12, bold=None, italic=None, color="000000"):
    run.font.name = name
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    run.font.color.rgb = RGBColor.from_string(color)


def format_body(paragraph, first_line=True, space_after=0):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    fmt = paragraph.paragraph_format
    fmt.line_spacing_rule = WD_LINE_SPACING.DOUBLE
    fmt.space_before = Pt(0)
    fmt.space_after = Pt(space_after)
    fmt.first_line_indent = Inches(0.5) if first_line else None
    for run in paragraph.runs:
        set_font(run)


def add_body(doc, text, first_line=True):
    p = doc.add_paragraph()
    p.add_run(text)
    format_body(p, first_line=first_line)
    return p


def add_heading(doc, text, level):
    p = doc.add_paragraph(style=f"Heading {level}")
    p.add_run(text)
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_before = Pt(12 if level > 1 else 0)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.0
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    for run in p.runs:
        set_font(run, size=12, bold=True)
    return p


def add_table_title(doc, number, title):
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(f"Tabla {number}")
    set_font(r, bold=True)
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(title)
    set_font(r, italic=True)


def add_relationship_table(doc):
    rows = [
        ("Rol", "1:N", "Usuario", "Un rol puede asignarse a varios usuarios; cada usuario conserva un roleId."),
        ("Área", "1:N", "Equipo", "Un área agrupa equipos; cada equipo registra el área a la que pertenece."),
        ("Área", "1:N", "Mantenimiento correctivo", "Cada correctivo conserva areaId y una copia histórica del área."),
        ("Área", "1:N", "Incidente", "Los incidentes se clasifican por el área donde fueron reportados."),
        ("Equipo", "1:N", "Mantenimiento correctivo", "Un equipo puede acumular múltiples intervenciones correctivas."),
        ("Equipo", "1:N", "Plan preventivo", "Un equipo puede tener varios planes activos o históricos."),
        ("Plan preventivo", "0..1:N", "Ejecución preventiva", "Una ejecución puede corresponder a un plan o ser extraordinaria."),
        ("Equipo", "1:N", "Ejecución preventiva", "Cada ejecución identifica el equipo atendido, aunque no provenga de un plan."),
        ("Equipo", "1:N", "Inspección de montacargas", "Las inspecciones forman el historial operativo del montacargas."),
        ("Plantilla checklist", "1:N", "Inspección de montacargas", "La inspección conserva el identificador y la versión de la plantilla usada."),
        ("Turno", "1:N", "Inspección de montacargas", "Cada inspección se registra dentro de un turno operativo."),
        ("Equipo", "1:N", "Incidente", "Un incidente puede asociarse con un equipo; la asociación es opcional al reportarlo."),
        ("Incidente", "0..1:0..1", "Mantenimiento correctivo", "Un incidente puede originar un correctivo y el correctivo conserva la referencia de origen."),
        ("Equipo", "1:N", "Predicción de riesgo", "Un equipo puede tener múltiples resultados predictivos calculados en fechas distintas."),
        ("Usuario", "N:M", "Correctivos y ejecuciones", "Los arreglos technicianIds permiten varios técnicos por mantenimiento y varios trabajos por técnico."),
        ("Usuario", "1:N", "Incidentes e inspecciones", "reporterId y operatorId identifican al usuario responsable del registro."),
        ("Usuario", "1:N", "Auditoría", "actorId identifica al usuario que efectuó cada acción registrada."),
        ("Stock de repuesto", "Asociación", "Mantenimientos", "El stock se consulta desde la integración con SAP; los repuestos utilizados se conservan como snapshots."),
    ]
    table = doc.add_table(rows=1, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    widths = [Inches(1.25), Inches(0.8), Inches(1.55), Inches(3.5)]
    headers = ["Entidad origen", "Cardinalidad", "Entidad destino", "Descripción"]
    for i, (cell, label, width) in enumerate(zip(table.rows[0].cells, headers, widths)):
        cell.width = width
        set_cell_shading(cell, TEAL)
        set_cell_margins(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(label)
        set_font(r, size=9.5, bold=True, color="FFFFFF")
    set_repeat_table_header(table.rows[0])
    for index, data in enumerate(rows):
        cells = table.add_row().cells
        for i, (cell, value, width) in enumerate(zip(cells, data, widths)):
            cell.width = width
            set_cell_margins(cell, top=85, bottom=85)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if index % 2:
                set_cell_shading(cell, "EFF6F7")
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i == 1 else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.0
            r = p.add_run(value)
            set_font(r, size=9.3)
    set_table_borders(table)
    note = doc.add_paragraph()
    note.paragraph_format.space_before = Pt(6)
    note.paragraph_format.space_after = Pt(0)
    r = note.add_run("Nota. ")
    set_font(r, size=10, italic=True)
    r = note.add_run("Elaboración propia con base en el modelo lógico y las reglas de seguridad de CeroFallas.")
    set_font(r, size=10)


def add_entity_sections(doc):
    entities = [
        ("1.3.1 Rol", "La entidad Rol agrupa los permisos que determinan las funciones disponibles para cada perfil. Incluye un identificador estable, nombre, lista de permisos, estado y la marca systemRole para proteger los roles base del sistema."),
        ("1.3.2 Usuario", "La entidad Usuario representa el perfil de aplicación vinculado con Firebase Authentication. Almacena el UID, nombre visible, correo electrónico, rol, áreas autorizadas, permisos efectivos, estado y datos de auditoría; no almacena contraseñas."),
        ("1.3.3 Área", "La entidad Área clasifica las líneas de producción y áreas de apoyo de Novafiber. Su identificador se utiliza en equipos, incidentes y mantenimientos, mientras que los snapshots conservan el código y nombre que eran válidos al registrar cada operación."),
        ("1.3.4 Turno", "La entidad Turno define los horarios operativos, incluidos la hora de inicio, hora de finalización, días aplicables y la condición de cruce de medianoche. Se utiliza para clasificar inspecciones y actividades ejecutadas dentro de una jornada."),
        ("1.3.5 Equipo", "La entidad Equipo constituye el núcleo del modelo. Registra código, nombre, tipo, marca, modelo, número de serie, área, estado y criticidad. Se relaciona con mantenimientos, planes preventivos, inspecciones, incidentes y resultados predictivos."),
        ("1.3.6 Mantenimiento correctivo", "La entidad Mantenimiento Correctivo documenta una intervención derivada de una falla. Conserva el equipo y área, fechas de inicio y finalización, duración calculada, técnicos responsables, síntoma reportado, causa identificada, trabajo realizado, repuestos utilizados y, cuando corresponde, el incidente que originó la orden."),
        ("1.3.7 Plan preventivo", "La entidad Plan Preventivo define las actividades programadas para un equipo. Incluye frecuencia, unidad, próxima fecha de vencimiento, responsables previstos, estado y la marca estimatedFrequency, que identifica frecuencias provisionales pendientes de validación institucional."),
        ("1.3.8 Ejecución preventiva", "La entidad Ejecución Preventiva registra el trabajo realmente realizado. Puede relacionarse con un plan o documentar una actividad extraordinaria; siempre identifica el equipo, los técnicos, los tiempos reales, el cumplimiento, los repuestos y el resultado de reprogramación."),
        ("1.3.9 Plantilla checklist", "La entidad Plantilla Checklist controla la versión de los puntos de inspección aplicables a cada tipo de montacargas. Las secciones y preguntas se versionan para que las modificaciones futuras no alteren el significado de inspecciones históricas."),
        ("1.3.10 Inspección de montacargas", "La entidad Inspección de Montacargas registra el equipo, la versión de la plantilla, el turno, el operador, el horómetro, las respuestas y el resultado general. También conserva evidencia autorizada y el conteo de fallas críticas que determina si el equipo puede continuar en servicio."),
        ("1.3.11 Incidente", "La entidad Incidente registra eventos reportados en las líneas de producción. Incluye área, equipo opcional, usuario informante, descripción, prioridad, estado, evidencias y seguimiento. Cuando el evento exige una reparación, puede vincularse con un mantenimiento correctivo."),
        ("1.3.12 Stock de repuesto", "La entidad Stock de Repuesto representa una vista de solo lectura sincronizada desde SAP SQL Server. Utiliza el código y almacén como clave lógica, conserva la cantidad informada por el sistema de origen y registra la fecha y el lote de sincronización. CeroFallas no modifica este inventario."),
        ("1.3.13 Predicción de riesgo", "La entidad Predicción de Riesgo conserva resultados calculados para cada equipo. Registra fecha, horizonte, puntuación, nivel de riesgo, método, versión y variables utilizadas. La marca isDemonstration impide confundir resultados de prueba con predicciones operativas validadas."),
        ("1.3.14 Auditoría", "La entidad Auditoría mantiene la trazabilidad de acciones sensibles. Identifica al usuario, la acción, el tipo y el identificador de la entidad afectada, la fecha, el motivo y los valores anteriores y posteriores permitidos. No guarda contraseñas, tokens ni secretos de conexión."),
    ]
    for heading, text in entities:
        add_heading(doc, heading, 3)
        add_body(doc, text)


def build_document():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    build_erd(ASSET)
    doc = Document(SOURCE)

    # Preserve the supplied cover and automatic table of contents.
    chapter = doc.paragraphs[45]
    title = doc.paragraphs[46]
    chapter.text = "CAPÍTULO I"
    title.text = "MODELO DE LA BASE DE DATOS"
    chapter.paragraph_format.page_break_before = True
    chapter.paragraph_format.keep_with_next = True
    chapter.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.keep_with_next = True
    for p in (chapter, title):
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(12)
        p.paragraph_format.line_spacing = 1.0
        for run in p.runs:
            set_font(run, bold=True)

    add_heading(doc, "1.1 Descripción general del modelo de base de datos", 2)
    add_body(doc, "CeroFallas utiliza un modelo lógico de datos orientado a la gestión de activos industriales, mantenimientos preventivos y correctivos, inspecciones de montacargas, incidentes, disponibilidad de repuestos y análisis predictivo. El modelo integra la información de los distintos módulos alrededor de la entidad Equipo, que permite consultar el historial completo de cada activo y relacionar sus eventos operativos.")
    add_body(doc, "La implementación actual utiliza Cloud Firestore y Firebase Authentication. Por esta razón, las entidades se materializan como colecciones de documentos y las relaciones se representan mediante identificadores, arreglos de referencias y snapshots históricos. El diagrama expresa relaciones lógicas equivalentes a un modelo entidad relación, aunque Firestore no crea claves foráneas ni operaciones JOIN automáticas.")
    add_body(doc, "El diseño prioriza la trazabilidad. Los registros operativos conservan fechas del servidor, usuario creador, usuario que realizó la última modificación y, cuando corresponde, datos para anulación lógica. Los snapshots de equipo y área evitan que un cambio posterior en los catálogos modifique la interpretación histórica de un mantenimiento, una inspección o un incidente.")

    add_heading(doc, "1.2 Modelo entidad relación", 2)
    add_body(doc, "El modelo general está conformado por 14 entidades lógicas. Rol y Usuario controlan el acceso; Área, Turno y Plantilla Checklist funcionan como catálogos; Equipo articula la operación; Mantenimiento Correctivo, Plan Preventivo, Ejecución Preventiva, Inspección de Montacargas e Incidente registran la actividad; Stock de Repuesto y Predicción de Riesgo aportan información para la toma de decisiones; y Auditoría conserva la trazabilidad de las acciones.")
    add_body(doc, "La Figura 1 presenta todas las entidades en una sola vista. Las líneas continuas representan referencias lógicas entre documentos. Las líneas color naranja representan la consulta de stock de solo lectura y la conservación de una copia de los repuestos utilizados, sin asumir una relación transaccional directa con SAP.")

    landscape = doc.add_section(WD_SECTION.NEW_PAGE)
    landscape.orientation = WD_ORIENT.LANDSCAPE
    landscape.page_width = Inches(11)
    landscape.page_height = Inches(8.5)
    landscape.top_margin = Inches(0.55)
    landscape.bottom_margin = Inches(0.55)
    landscape.left_margin = Inches(0.6)
    landscape.right_margin = Inches(0.6)
    landscape.header.is_linked_to_previous = True
    landscape.footer.is_linked_to_previous = True

    cap = doc.add_paragraph()
    cap.paragraph_format.space_after = Pt(2)
    r = cap.add_run("Figura 1")
    set_font(r, bold=True)
    cap = doc.add_paragraph()
    cap.paragraph_format.keep_with_next = True
    cap.paragraph_format.space_after = Pt(6)
    r = cap.add_run("Modelo entidad relación general de CeroFallas")
    set_font(r, italic=True)
    pic = doc.add_paragraph()
    pic.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pic.paragraph_format.keep_with_next = True
    pic.paragraph_format.space_after = Pt(5)
    pic.add_run().add_picture(str(ASSET), width=Inches(9.55))
    note = doc.add_paragraph()
    note.paragraph_format.space_after = Pt(0)
    r = note.add_run("Nota. ")
    set_font(r, size=9.5, italic=True)
    r = note.add_run("Elaboración propia. El modelo es lógico para Cloud Firestore; PK identifica el documento y FK una referencia lógica. Las relaciones con usuarios responsables también se expresan en reporterId, operatorId, technicianIds, assignedUserIds y los campos comunes createdBy y updatedBy.")
    set_font(r, size=9.5)

    portrait = doc.add_section(WD_SECTION.NEW_PAGE)
    portrait.orientation = WD_ORIENT.PORTRAIT
    portrait.page_width = Inches(8.5)
    portrait.page_height = Inches(11)
    portrait.top_margin = Inches(1)
    portrait.bottom_margin = Inches(1)
    portrait.left_margin = Inches(1)
    portrait.right_margin = Inches(1)
    portrait.header.is_linked_to_previous = True
    portrait.footer.is_linked_to_previous = True

    add_heading(doc, "1.2.1 Principales relaciones del modelo", 3)
    add_body(doc, "Las relaciones principales se resumen en la Tabla 1. Las cardinalidades describen el comportamiento lógico de la información; la aplicación y las reglas de seguridad validan su integridad.")
    add_table_title(doc, 1, "Relaciones del modelo general de CeroFallas")
    add_relationship_table(doc)

    add_heading(doc, "1.3 Descripción de las entidades", 2)
    add_body(doc, "Las entidades se describen según su función dentro del modelo general y su relación con la operación de mantenimiento.")
    add_entity_sections(doc)

    add_heading(doc, "1.4 Normalización y persistencia en Firestore", 2)
    add_body(doc, "El modelo separa usuarios, catálogos, activos, planes, ejecuciones, incidentes y auditoría para reducir duplicidades y mantener responsabilidades claras. Esta separación corresponde a una normalización lógica: cada entidad conserva un propósito definido y se relaciona mediante identificadores estables.")
    add_body(doc, "Firestore requiere desnormalización controlada para resolver consultas sin uniones. Por ello, los documentos operativos conservan snapshots mínimos de equipo y área, y las inspecciones copian la versión de la plantilla aplicada. Estas copias no sustituyen a la entidad principal; preservan el contexto histórico y evitan que una modificación posterior cambie el significado de registros ya cerrados.")
    add_body(doc, "La integridad se complementa con reglas de seguridad, validaciones de la aplicación y auditoría. Las eliminaciones físicas se restringen; los registros que deben invalidarse cambian a estado voided y conservan fecha, usuario y motivo. El stock permanece como información de solo lectura proveniente de SAP, y las predicciones registran el método y la versión utilizados para que cada resultado pueda ser reproducido y evaluado.")

    # Update core styles used by the appended academic body without disturbing the cover's direct formatting.
    normal = doc.styles["Normal"]
    normal.font.name = "Times New Roman"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
    normal.font.size = Pt(12)
    for style_name in ("Heading 1", "Heading 2", "Heading 3"):
        style = doc.styles[style_name]
        style.font.name = "Times New Roman"
        style._element.rPr.rFonts.set(qn("w:ascii"), "Times New Roman")
        style._element.rPr.rFonts.set(qn("w:hAnsi"), "Times New Roman")
        style.font.size = Pt(12)
        style.font.bold = True
        style.font.color.rgb = RGBColor(0, 0, 0)

    props = doc.core_properties
    props.title = "Modelo de la base de datos de CeroFallas"
    props.subject = "Segundo entregable de Proyecto de Graduación II"
    props.keywords = "CeroFallas, modelo entidad relación, mantenimiento, Firestore"
    doc.save(OUTPUT)
    print(OUTPUT)
    print(ASSET)


if __name__ == "__main__":
    build_document()
