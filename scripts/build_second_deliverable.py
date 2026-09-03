from pathlib import Path
from datetime import date
import textwrap

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "deliverables" / "segunda_entrega"
ASSETS = OUT / "assets"
DOCX_PATH = OUT / "CeroFallas_Segunda_Entrega.docx"

NAVY = "103B4C"
TEAL = "128C8C"
CYAN = "35B8C5"
GOLD = "F3B61F"
INK = "18333E"
MUTED = "5E7480"
PALE = "EAF5F5"
LIGHT = "F4F6F7"
WHITE = "FFFFFF"
RED = "B44747"
GREEN = "278062"


def font(size, bold=False):
    candidates = ["C:/Windows/Fonts/aptos.ttf", "C:/Windows/Fonts/calibri.ttf", "C:/Windows/Fonts/arial.ttf"]
    bolds = ["C:/Windows/Fonts/aptos-bold.ttf", "C:/Windows/Fonts/calibrib.ttf", "C:/Windows/Fonts/arialbd.ttf"]
    for p in (bolds if bold else candidates):
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def rounded(draw, box, fill, outline=None, width=3, radius=18):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def centered(draw, box, text, fnt, fill="#18333E", spacing=5):
    x1, y1, x2, y2 = box
    max_w = x2 - x1 - 24
    words = text.split()
    lines, current = [], ""
    for word in words:
        trial = (current + " " + word).strip()
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_w:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    line_h = fnt.size + spacing
    y = y1 + ((y2 - y1) - len(lines) * line_h) / 2
    for line in lines:
        box2 = draw.textbbox((0, 0), line, font=fnt)
        x = x1 + ((x2 - x1) - (box2[2] - box2[0])) / 2
        draw.text((x, y), line, font=fnt, fill=fill)
        y += line_h


def arrow(draw, start, end, fill="#128C8C", width=6):
    draw.line([start, end], fill=fill, width=width)
    x, y = end
    if abs(end[0] - start[0]) >= abs(end[1] - start[1]):
        pts = [(x, y), (x - 18 if end[0] > start[0] else x + 18, y - 11), (x - 18 if end[0] > start[0] else x + 18, y + 11)]
    else:
        pts = [(x, y), (x - 11, y - 18 if end[1] > start[1] else y + 18), (x + 11, y - 18 if end[1] > start[1] else y + 18)]
    draw.polygon(pts, fill=fill)


def save_general_process(path):
    im = Image.new("RGB", (1800, 1000), "white")
    d = ImageDraw.Draw(im)
    d.text((80, 45), "Proceso general de CeroFallas", font=font(54, True), fill="#103B4C")
    nodes = [
        ("1. Autenticación", "Identidad, perfil activo y permisos"),
        ("2. Operación", "Equipo · correctivo · preventivo · checklist · incidente"),
        ("3. Validación", "Campos, tiempos, estado y reglas de negocio"),
        ("4. Persistencia", "Firestore + timestamp + usuario responsable"),
        ("5. Explotación", "Históricos · dashboard · Power BI · predictivo"),
    ]
    y = 150
    for i, (title, sub) in enumerate(nodes):
        rounded(d, (250, y, 1550, y + 125), "#EAF5F5", "#128C8C", 4, 22)
        d.text((300, y + 22), title, font=font(34, True), fill="#103B4C")
        d.text((720, y + 29), sub, font=font(25), fill="#395966")
        if i < len(nodes) - 1:
            arrow(d, (900, y + 126), (900, y + 165))
        y += 165
    d.text((250, 965), "Principio transversal: autorización por rol, auditoría y conservación del histórico.", font=font(23, True), fill="#B44747")
    im.save(path)


def save_flow(path, title, steps, decisions=None):
    im = Image.new("RGB", (1800, 1050), "white")
    d = ImageDraw.Draw(im)
    d.text((70, 40), title, font=font(48, True), fill="#103B4C")
    y, box_h = 135, 115
    for i, step in enumerate(steps):
        fill = "#FFF6D8" if decisions and i in decisions else "#EAF5F5"
        outline = "#F3B61F" if decisions and i in decisions else "#128C8C"
        rounded(d, (260, y, 1540, y + box_h), fill, outline, 4, 20)
        centered(d, (280, y + 5, 1520, y + box_h - 5), step, font(29, i == 0), "#18333E")
        if i < len(steps) - 1:
            arrow(d, (900, y + box_h), (900, y + box_h + 34))
        y += box_h + 38
    im.save(path)


def save_erd(path):
    im = Image.new("RGB", (2200, 1450), "white")
    d = ImageDraw.Draw(im)
    d.text((80, 45), "Modelo lógico de datos — relaciones principales", font=font(52, True), fill="#103B4C")
    boxes = {
        "ROL": (80, 200, 430, 350), "USUARIO": (520, 200, 900, 350), "AUDITORÍA": (1010, 200, 1450, 350),
        "ÁREA": (80, 570, 430, 720), "EQUIPO": (520, 570, 900, 720), "CORRECTIVO": (1040, 470, 1510, 620),
        "PLAN PREVENTIVO": (1040, 690, 1510, 840), "EJECUCIÓN": (1690, 690, 2110, 840),
        "PLANTILLA CHECKLIST": (80, 1030, 550, 1180), "INSPECCIÓN": (700, 1030, 1100, 1180),
        "INCIDENTE": (1280, 1030, 1660, 1180), "PREDICCIÓN": (1780, 1030, 2140, 1180),
        "STOCK SAP": (1690, 470, 2110, 620),
    }
    for name, box in boxes.items():
        rounded(d, box, "#EAF5F5" if name not in ["AUDITORÍA", "STOCK SAP"] else "#FFF6D8", "#128C8C", 4, 18)
        centered(d, box, name, font(29, True), "#103B4C")
    links = [
        ("ROL", "USUARIO", "1:N"), ("USUARIO", "AUDITORÍA", "1:N"), ("ÁREA", "EQUIPO", "1:N"),
        ("EQUIPO", "CORRECTIVO", "1:N"), ("EQUIPO", "PLAN PREVENTIVO", "1:N"),
        ("PLAN PREVENTIVO", "EJECUCIÓN", "1:N"), ("EQUIPO", "INSPECCIÓN", "1:N"),
        ("PLANTILLA CHECKLIST", "INSPECCIÓN", "1:N"), ("EQUIPO", "INCIDENTE", "1:N"),
        ("EQUIPO", "PREDICCIÓN", "1:N"), ("INCIDENTE", "CORRECTIVO", "0..1"),
    ]
    for a, b, label in links:
        aa, bb = boxes[a], boxes[b]
        p1 = ((aa[0] + aa[2]) // 2, (aa[1] + aa[3]) // 2)
        p2 = ((bb[0] + bb[2]) // 2, (bb[1] + bb[3]) // 2)
        d.line([p1, p2], fill="#6C8791", width=4)
        mx, my = (p1[0] + p2[0]) // 2, (p1[1] + p2[1]) // 2
        rounded(d, (mx - 40, my - 22, mx + 40, my + 22), "white", "#6C8791", 2, 8)
        centered(d, (mx - 40, my - 22, mx + 40, my + 22), label, font(18, True))
    d.text((80, 1330), "Firestore materializa las entidades como colecciones de documentos; las líneas representan referencias lógicas, no JOIN físicos.", font=font(23), fill="#5E7480")
    im.save(path)


def save_architecture(path):
    im = Image.new("RGB", (2100, 1350), "white")
    d = ImageDraw.Draw(im)
    d.text((80, 45), "Arquitectura de software propuesta", font=font(52, True), fill="#103B4C")
    layers = [
        ("PRESENTACIÓN", "Aplicación web responsive React · navegador de PC, tablet o teléfono", "#EAF5F5"),
        ("ACCESO", "Firebase Authentication · perfil activo · permisos RBAC", "#DDF1F0"),
        ("NEGOCIO", "Módulos React + servicios/repositorios + validaciones + cálculos", "#EAF5F5"),
        ("DATOS", "Cloud Firestore · reglas de seguridad · índices · auditoría", "#DDF1F0"),
        ("PUBLICACIÓN", "Vite build → Firebase Hosting → HTTPS y reescritura SPA", "#EAF5F5"),
    ]
    y = 145
    for name, body, fill in layers:
        rounded(d, (170, y, 1500, y + 150), fill, "#128C8C", 4, 20)
        d.text((215, y + 24), name, font=font(27, True), fill="#128C8C")
        d.text((215, y + 74), body, font=font(27), fill="#18333E")
        y += 185
    rounded(d, (1620, 235, 2020, 430), "#FFF6D8", "#F3B61F", 4, 20)
    centered(d, (1640, 245, 2000, 420), "SQL Server / SAP\nconsulta de stock\nsolo lectura", font(27, True))
    rounded(d, (1620, 545, 2020, 740), "#FFF6D8", "#F3B61F", 4, 20)
    centered(d, (1640, 555, 2000, 730), "Power BI\ndataset publicado\ny enlace controlado", font(27, True))
    rounded(d, (1620, 855, 2020, 1050), "#FFF6D8", "#F3B61F", 4, 20)
    centered(d, (1640, 865, 2000, 1040), "Servicio predictivo\nPython · ejecución\nprogramada", font(27, True))
    for yy in (330, 640, 950):
        arrow(d, (1500, yy), (1605, yy), fill="#F3B61F")
    d.text((170, 1235), "Las integraciones externas se aíslan: si SAP, Power BI o el predictivo fallan, el registro operativo continúa.", font=font(25, True), fill="#B44747")
    im.save(path)


def save_use_case(path):
    im = Image.new("RGB", (2100, 1400), "white")
    d = ImageDraw.Draw(im)
    d.text((80, 45), "Mapa de actores y capacidades", font=font(52, True), fill="#103B4C")
    rounded(d, (610, 150, 1540, 1310), "#F7FAFA", "#103B4C", 5, 30)
    d.text((830, 180), "CEROFALLAS", font=font(38, True), fill="#103B4C")
    cases = ["Autenticarse", "Gestionar equipos", "Registrar correctivo", "Planificar preventivo", "Registrar ejecución", "Completar checklist", "Reportar incidente", "Consultar stock", "Consultar dashboard", "Administrar usuarios", "Anular y auditar"]
    y = 260
    for case in cases:
        rounded(d, (760, y, 1390, y + 70), "#EAF5F5", "#128C8C", 3, 30)
        centered(d, (775, y, 1375, y + 70), case, font(23, True))
        y += 88
    actors = [
        ("Administrador / soporte", (50, 255), [1, 2, 3, 4, 5, 7, 8, 9, 10]),
        ("Técnico de mantenimiento", (50, 610), [2, 4, 7]),
        ("Montacarguista", (50, 980), [5]),
        ("Jefaturas y supervisión", (1630, 270), [2, 3, 4, 7, 8]),
        ("Digitador / Airlay", (1630, 650), [6]),
        ("Gerencia", (1630, 1000), [8]),
    ]
    for label, (x, y0), links in actors:
        rounded(d, (x, y0, x + 390, y0 + 115), "#FFF6D8", "#F3B61F", 3, 18)
        centered(d, (x + 10, y0 + 5, x + 380, y0 + 110), label, font(23, True))
        for idx in links:
            target_y = 260 + idx * 88 + 35
            if x < 600:
                d.line([(x + 390, y0 + 57), (760, target_y)], fill="#AAB9BF", width=2)
            else:
                d.line([(x, y0 + 57), (1390, target_y)], fill="#AAB9BF", width=2)
    im.save(path)


def save_mockup_sheet(path, title, screens):
    im = Image.new("RGB", (2100, 1450), "#EEF3F4")
    d = ImageDraw.Draw(im)
    d.text((65, 35), title, font=font(48, True), fill="#103B4C")
    positions = [(65, 130, 665, 1350), (750, 130, 1350, 1350), (1435, 130, 2035, 1350)]
    for (screen_title, status, fields), box in zip(screens, positions):
        x1, y1, x2, y2 = box
        rounded(d, box, "white", "#B8C9CE", 4, 28)
        d.rounded_rectangle((x1, y1, x2, y1 + 105), radius=28, fill="#103B4C")
        d.rectangle((x1, y1 + 70, x2, y1 + 105), fill="#103B4C")
        d.text((x1 + 30, y1 + 28), "CeroFallas", font=font(29, True), fill="white")
        d.text((x1 + 30, y1 + 145), screen_title, font=font(34, True), fill="#103B4C")
        badge_fill = "#DDF1E9" if status == "IMPLEMENTADO" else "#FFF1C2"
        badge_text = "#278062" if status == "IMPLEMENTADO" else "#8A6500"
        rounded(d, (x1 + 30, y1 + 205, x1 + 255, y1 + 255), badge_fill, None, 1, 16)
        centered(d, (x1 + 35, y1 + 205, x1 + 250, y1 + 255), status, font(18, True), badge_text)
        yy = y1 + 300
        for label, kind in fields:
            d.text((x1 + 30, yy), label, font=font(21, True), fill="#395966")
            if kind == "metric":
                rounded(d, (x1 + 30, yy + 38, x2 - 30, yy + 135), "#EAF5F5", "#C7DADB", 2, 14)
                centered(d, (x1 + 40, yy + 45, x2 - 40, yy + 128), "Indicador / estado", font(26, True), "#128C8C")
                yy += 170
            elif kind == "options":
                for j, opt in enumerate(["Bueno", "Atención", "Fuera", "N/A"]):
                    xx = x1 + 30 + j * 132
                    rounded(d, (xx, yy + 40, xx + 115, yy + 92), "#F4F6F7", "#C7DADB", 2, 12)
                    centered(d, (xx + 2, yy + 40, xx + 113, yy + 92), opt, font(15, True))
                yy += 135
            elif kind == "button":
                rounded(d, (x1 + 30, yy + 35, x2 - 30, yy + 100), "#128C8C", None, 1, 14)
                centered(d, (x1 + 35, yy + 35, x2 - 35, yy + 100), label, font(22, True), "white")
                yy += 125
            else:
                rounded(d, (x1 + 30, yy + 38, x2 - 30, yy + 95), "white", "#B8C9CE", 2, 10)
                yy += 125
        d.text((x1 + 30, y2 - 65), "Diseño responsive · ancho ilustrativo", font=font(18), fill="#6C8791")
    im.save(path)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_width(cell, dxa):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_w = tc_pr.find(qn("w:tcW"))
    if tc_w is None:
        tc_w = OxmlElement("w:tcW")
        tc_pr.append(tc_w)
    tc_w.set(qn("w:w"), str(dxa))
    tc_w.set(qn("w:type"), "dxa")


def table(doc, headers, rows, widths=None, font_size=8.5):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    total = 9360
    widths = widths or [total // len(headers)] * len(headers)
    for i, h in enumerate(headers):
        c = t.rows[0].cells[i]
        c.text = h
        c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_shading(c, NAVY)
        set_cell_width(c, widths[i])
        for r in c.paragraphs[0].runs:
            r.font.bold = True; r.font.color.rgb = RGBColor.from_string(WHITE); r.font.size = Pt(font_size)
    set_repeat_table_header(t.rows[0])
    for row in rows:
        cells = t.add_row().cells
        for i, value in enumerate(row):
            cells[i].text = str(value)
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            set_cell_width(cells[i], widths[i])
            if len(t.rows) % 2 == 1:
                set_cell_shading(cells[i], LIGHT)
            for p in cells[i].paragraphs:
                p.paragraph_format.space_after = Pt(2)
                for r in p.runs:
                    r.font.size = Pt(font_size); r.font.name = "Aptos"
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("Página ")
    run.font.size = Pt(8); run.font.color.rgb = RGBColor.from_string(MUTED)
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    paragraph._p.append(fld)


def add_heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    p.paragraph_format.keep_with_next = True
    return p


def add_body(doc, text, bold_lead=None):
    p = doc.add_paragraph()
    if bold_lead and text.startswith(bold_lead):
        p.add_run(bold_lead).bold = True
        p.add_run(text[len(bold_lead):])
    else:
        p.add_run(text)
    return p


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.add_run(item)


def add_figure(doc, path, caption, width=6.25):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(path), width=Inches(width))
    cap = doc.add_paragraph(caption)
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.style = doc.styles["Caption"]
    cap.paragraph_format.keep_with_next = False


def page_break(doc):
    doc.add_page_break()


def setup_styles(doc):
    sec = doc.sections[0]
    sec.page_width = Inches(8.5); sec.page_height = Inches(11)
    sec.top_margin = Inches(0.85); sec.bottom_margin = Inches(0.8)
    sec.left_margin = Inches(1); sec.right_margin = Inches(1)
    sec.header_distance = Inches(0.42); sec.footer_distance = Inches(0.42)
    normal = doc.styles["Normal"]
    normal.font.name = "Aptos"; normal.font.size = Pt(10.5); normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_after = Pt(7); normal.paragraph_format.line_spacing = 1.15
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    for style_name, size, color, before, after in [
        ("Title", 30, NAVY, 0, 10), ("Heading 1", 18, NAVY, 14, 8),
        ("Heading 2", 14, TEAL, 11, 5), ("Heading 3", 11.5, NAVY, 8, 4),
    ]:
        s = doc.styles[style_name]
        s.font.name = "Aptos Display" if style_name != "Heading 3" else "Aptos"
        s.font.size = Pt(size); s.font.bold = True; s.font.color.rgb = RGBColor.from_string(color)
        s.paragraph_format.space_before = Pt(before); s.paragraph_format.space_after = Pt(after)
        s.paragraph_format.keep_with_next = True
    cap = doc.styles["Caption"]
    cap.font.name = "Aptos"; cap.font.size = Pt(8.5); cap.font.italic = True; cap.font.color.rgb = RGBColor.from_string(MUTED)
    for style_name in ["List Bullet", "List Number"]:
        s = doc.styles[style_name]
        s.font.name = "Aptos"; s.font.size = Pt(10.5)
        s.paragraph_format.left_indent = Inches(0.38); s.paragraph_format.first_line_indent = Inches(-0.19)
        s.paragraph_format.space_after = Pt(4); s.paragraph_format.line_spacing = 1.15
    for section in doc.sections:
        hp = section.header.paragraphs[0]
        hp.text = "CEROFALLAS  |  PROPUESTA CONCEPTUAL DE LA SOLUCIÓN DE IT"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        for r in hp.runs:
            r.font.name = "Aptos"; r.font.size = Pt(7.5); r.font.bold = True; r.font.color.rgb = RGBColor.from_string(MUTED)
        add_page_number(section.footer.paragraphs[0])


def build_assets():
    ASSETS.mkdir(parents=True, exist_ok=True)
    save_general_process(ASSETS / "proceso_general.png")
    save_flow(ASSETS / "flujo_correctivo.png", "Proceso específico — mantenimiento correctivo", [
        "Usuario autorizado selecciona área, equipo y fecha", "Registra síntoma, inicio, fin y trabajo realizado",
        "El sistema valida campos y calcula duración", "¿Datos válidos y equipo activo?", "Guarda correctivo + auditoría en una operación",
        "Actualiza histórico y datos disponibles para indicadores"], {3})
    save_flow(ASSETS / "flujo_preventivo.png", "Proceso específico — mantenimiento preventivo", [
        "Responsable crea plan con frecuencia estimada", "El sistema registra próxima fecha y estado activo",
        "Técnico selecciona plan o actividad no programada", "Registra ejecución, tiempo, actividad y repuestos",
        "El sistema clasifica cumplimiento", "Histórico conserva plan y ejecución por separado"])
    save_flow(ASSETS / "flujo_checklist.png", "Proceso específico — checklist de montacargas", [
        "Montacarguista selecciona equipo, turno y horómetro", "Responde 25 puntos: bueno, atención, fuera o no aplica",
        "¿Todos los obligatorios están respondidos?", "¿Existe una condición crítica?",
        "Calcula apto, requiere atención o fuera de servicio", "Guarda plantilla versionada, respuestas y auditoría"], {2, 3})
    save_flow(ASSETS / "flujo_incidentes.png", "Proceso específico — incidente y atención", [
        "Digitador u operador Airlay reporta incidente", "Se registra área, equipo opcional, prioridad y descripción",
        "Incidente aparece en reporte gerencial", "Responsable confirma y prioriza",
        "¿Requiere intervención de mantenimiento?", "Se relaciona con un correctivo sin perder su identidad"], {4})
    save_flow(ASSETS / "flujo_stock_bi.png", "Proceso específico — stock, Power BI y análisis", [
        "Proceso seguro ejecuta consulta SQL Server de solo lectura", "Transforma código, descripción, cantidad y almacén",
        "Publica snapshot con fecha y lote de sincronización", "CeroFallas consulta stock sin credenciales SAP",
        "Dataset controlado alimenta Power BI", "Histórico suficiente habilita evaluación predictiva"])
    save_erd(ASSETS / "modelo_datos.png")
    save_architecture(ASSETS / "arquitectura.png")
    save_use_case(ASSETS / "casos_uso.png")
    save_mockup_sheet(ASSETS / "mockups_1.png", "Mockups — acceso y operación principal", [
        ("Inicio de sesión", "IMPLEMENTADO", [("Correo", "field"), ("Contraseña", "field"), ("Ingresar", "button")]),
        ("Dashboard", "DISEÑADO", [("Correctivos", "metric"), ("Preventivos", "metric"), ("Incidentes", "metric"), ("Filtros", "field")]),
        ("Catálogo de equipos", "IMPLEMENTADO", [("Buscar / filtrar", "field"), ("Código y nombre", "field"), ("Estado", "field"), ("Nuevo equipo", "button")]),
    ])
    save_mockup_sheet(ASSETS / "mockups_2.png", "Mockups — mantenimiento", [
        ("Nuevo correctivo", "IMPLEMENTADO", [("Área y equipo", "field"), ("Fecha, inicio y fin", "field"), ("Síntoma y trabajo", "field"), ("Guardar correctivo", "button")]),
        ("Plan preventivo", "IMPLEMENTADO", [("Equipo y actividad", "field"), ("Frecuencia estimada", "field"), ("Próxima fecha", "field"), ("Guardar plan", "button")]),
        ("Ejecución preventiva", "IMPLEMENTADO", [("Plan / equipo", "field"), ("Tiempo calculado", "metric"), ("Trabajo y repuestos", "field"), ("Guardar ejecución", "button")]),
    ])
    save_mockup_sheet(ASSETS / "mockups_3.png", "Mockups — seguridad y análisis", [
        ("Checklist montacargas", "IMPLEMENTADO", [("Equipo, turno, horómetro", "field"), ("Punto de inspección", "options"), ("Resultado", "metric"), ("Guardar inspección", "button")]),
        ("Reporte de incidente", "DISEÑADO", [("Área y equipo", "field"), ("Prioridad", "field"), ("Descripción", "field"), ("Reportar", "button")]),
        ("Stock de repuestos", "DISEÑADO", [("Código o descripción", "field"), ("Almacén", "field"), ("Cantidad disponible", "metric"), ("Solo lectura", "field")]),
    ])


def build_docx():
    OUT.mkdir(parents=True, exist_ok=True)
    build_assets()
    doc = Document()
    setup_styles(doc)

    # Cover: editorial_cover pattern with restrained academic branding.
    doc.add_paragraph().paragraph_format.space_after = Pt(70)
    p = doc.add_paragraph("PROYECTO DE GRADUACIÓN II")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in p.runs:
        r.font.size = Pt(12); r.font.bold = True; r.font.color.rgb = RGBColor.from_string(TEAL)
    p = doc.add_paragraph("CeroFallas")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in p.runs:
        r.font.size = Pt(34); r.font.bold = True; r.font.color.rgb = RGBColor.from_string(NAVY)
    p = doc.add_paragraph("Propuesta conceptual de la solución de IT")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in p.runs:
        r.font.size = Pt(18); r.font.color.rgb = RGBColor.from_string(TEAL)
    p = doc.add_paragraph("SEGUNDA ENTREGA")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(20); p.paragraph_format.space_after = Pt(45)
    for r in p.runs:
        r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = RGBColor.from_string(GOLD)
    title = "Diseño e Implementación de un Sistema de Gestión de Mantenimientos Preventivos, Correctivos y Control de Activos Industriales en las Líneas de Producción en Novafiber"
    p = doc.add_paragraph(title)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in p.runs:
        r.font.size = Pt(12); r.font.bold = True; r.font.color.rgb = RGBColor.from_string(INK)
    doc.add_paragraph().paragraph_format.space_after = Pt(25)
    table(doc, ["Dato académico", "Información"], [
        ["Universidad", "Universidad Mariano Gálvez de Guatemala"],
        ["Curso", "Proyecto de Graduación II"],
        ["Estudiante", "Germán Hernández"],
        ["Carné / carrera / docente", "Información no proporcionada al cierre de esta versión"],
        ["Fecha de entrega", "06 de septiembre de 2026"],
        ["Versión", "1.0 — propuesta conceptual"],
    ], [2600, 6760], 9.5)
    p = doc.add_paragraph("Documento académico basado en requisitos confirmados, diseño técnico y evidencia del prototipo local.")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in p.runs:
        r.font.size = Pt(9); r.font.italic = True; r.font.color.rgb = RGBColor.from_string(MUTED)
    page_break(doc)

    add_heading(doc, "Control del documento", 1)
    table(doc, ["Elemento", "Definición"], [
        ["Propósito", "Presentar la propuesta conceptual completa de CeroFallas según la rúbrica de la segunda entrega."],
        ["Producto", "Aplicación web responsive; no se contempla una aplicación Android nativa."],
        ["Alcance documental", "Modelo de datos, procesos, casos de uso, arquitectura, mockups, trazabilidad y guía de defensa."],
        ["Estado de evidencia", "Implementado: autenticación, equipos, correctivos, preventivos y checklist. Diseñado: usuarios, incidentes, stock, dashboard completo, Power BI y predictivo."],
        ["Datos institucionales", "Se emplean nombres funcionales confirmados; códigos y modelos reales de maquinaria quedan pendientes de visita a planta."],
    ], [2300, 7060], 9)
    add_heading(doc, "Resumen ejecutivo", 1)
    add_body(doc, "CeroFallas es una solución web responsive para centralizar el mantenimiento industrial de Novafiber. Sustituye registros dispersos y bitácoras físicas por operaciones trazables de mantenimiento correctivo, mantenimiento preventivo, inspección de montacargas, control de equipos, incidentes y consulta de repuestos. La solución incorpora autenticación, permisos por rol, conservación del histórico y auditoría.")
    add_body(doc, "La arquitectura seleccionada utiliza React y Vite en el navegador, Firebase Authentication para identidad, Cloud Firestore como base operacional, Security Rules para autorización y Firebase Hosting para publicación HTTPS. SAP SQL Server, Power BI y el análisis predictivo se integran mediante procesos separados para proteger credenciales y evitar que la indisponibilidad externa bloquee la operación.")
    add_body(doc, "Este documento distingue el diseño total del producto del avance implementado. La conceptualización cubre el 100 % del alcance previsto; el prototipo comprobado incluye los cinco módulos nucleares señalados en el control del documento y cuenta con 29 pruebas automatizadas aprobadas.")
    add_heading(doc, "Contenido", 1)
    add_bullets(doc, [
        "1. Contexto, alcance y objetivos", "2. Modelo de base de datos", "3. Diagramas de procesos",
        "4. Casos de uso y permisos", "5. Arquitectura de software", "6. Mockups de la solución",
        "7. Trazabilidad y estado", "8. Guía para presentación y defensa", "Referencias y anexos",
    ])
    page_break(doc)

    add_heading(doc, "1. Contexto, alcance y objetivos", 1)
    add_heading(doc, "1.1 Problema", 2)
    add_body(doc, "Actualmente parte de la información de mantenimiento se registra en papel o en fuentes separadas. Esto retrasa la comunicación, dificulta reconstruir el histórico, debilita la calidad de los indicadores y aumenta el trabajo administrativo. CeroFallas propone una fuente operacional común y consultable desde navegador.")
    add_heading(doc, "1.2 Objetivo general", 2)
    add_body(doc, "Diseñar e implementar una aplicación web responsive para registrar, administrar, almacenar y consultar las actividades de mantenimiento industrial y control de activos de Novafiber, con trazabilidad, seguridad, indicadores y capacidad de integración analítica.")
    add_heading(doc, "1.3 Objetivos específicos", 2)
    add_bullets(doc, [
        "Digitalizar correctivos y calcular automáticamente el tiempo de atención, incluso cuando una labor cruza medianoche.",
        "Separar los planes preventivos de sus ejecuciones para medir pendientes, vencimientos y cumplimiento.",
        "Aplicar un checklist de montacargas versionado que evalúe condiciones mecánicas, hidráulicas, operativas y de seguridad.",
        "Mantener un catálogo de equipos sin inventar datos institucionales aún no levantados en planta.",
        "Proteger las operaciones mediante autenticación, permisos por rol, reglas de base de datos y auditoría.",
        "Preparar datos para dashboards, Power BI y análisis predictivo sin acoplar la operación a servicios externos.",
    ])
    add_heading(doc, "1.4 Alcance organizacional confirmado", 2)
    table(doc, ["Dimensión", "Valores confirmados"], [
        ["Áreas y líneas", "Líneas 1, 2, 3 y 4; Abastecimiento; Mantenimiento; Servicios Generales."],
        ["Turnos operativos", "Turno 1: 06:00–18:00. Turno 2: 18:00–06:00 del día siguiente."],
        ["Turno de jefaturas", "Mixto: 08:00–18:00, lunes a viernes."],
        ["Plataforma", "Web responsive, accesible desde PC, laptop, tablet y teléfono mediante navegador."],
        ["Integraciones", "SQL Server/SAP para stock; Power BI publicado mediante licencia disponible."],
    ], [2300, 7060], 9)
    add_heading(doc, "1.5 Supuestos y pendientes", 2)
    add_bullets(doc, [
        "Los códigos, nombres, modelos y líneas reales de las máquinas fotografiadas se incorporarán después de la visita a planta.",
        "Las frecuencias preventivas actuales son estimadas y deben validarse con mantenimiento y manuales de fabricante.",
        "La plantilla de montacargas es una propuesta técnica de 25 puntos y requiere aprobación institucional.",
        "No existe histórico suficiente para validar un modelo predictivo; cualquier demostración debe identificarse como experimental.",
        "La identidad del futuro técnico de soporte aún no está definida; el estudiante asumirá inicialmente administración.",
    ])
    add_heading(doc, "2. Modelo de base de datos", 1)
    add_body(doc, "El modelo se define de forma lógica para conservar independencia tecnológica. En la implementación, Cloud Firestore almacena documentos en colecciones; por ello las relaciones se expresan mediante identificadores, snapshots históricos y reglas de integridad en servicios y Security Rules.")
    add_figure(doc, ASSETS / "modelo_datos.png", "Figura 1. Modelo lógico de datos de CeroFallas.")
    add_heading(doc, "2.1 Entidades y responsabilidad", 2)
    entities = [
        ("ROL", "Agrupa permisos estables."), ("USUARIO", "Perfil vinculado al UID de Authentication."),
        ("ÁREA", "Línea o unidad organizacional."), ("TURNO", "Horario operativo o mixto."),
        ("EQUIPO", "Activo mantenible y su estado."), ("CORRECTIVO", "Falla no planificada y atención realizada."),
        ("PLAN_PREVENTIVO", "Actividad, frecuencia y próxima fecha."), ("EJECUCIÓN_PREVENTIVA", "Trabajo real y cumplimiento."),
        ("PLANTILLA_CHECKLIST", "Versión inmutable de puntos de inspección."), ("INSPECCIÓN_MONTACARGAS", "Respuestas, horómetro y aptitud."),
        ("INCIDENTE", "Reporte rápido operativo y prioridad."), ("STOCK_REPUESTO", "Snapshot de solo lectura desde SAP."),
        ("PREDICCIÓN_RIESGO", "Resultado versionado, fecha y explicación."), ("AUDITORÍA", "Actor, acción, motivo y cambios."),
    ]
    table(doc, ["Entidad", "Responsabilidad"], entities, [3000, 6360], 9)
    add_heading(doc, "2.2 Campos clave", 2)
    rows = [
        ["USUARIO", "id, displayName, email, roleId, permissions, areaIds, status, createdAt/By, updatedAt/By"],
        ["EQUIPO", "id, code, name, type, brand, model, serialNumber, areaId, status, criticality, notes"],
        ["CORRECTIVO", "eventDate, startedAt, endedAt, durationMinutes, area/equipment snapshots, technicianIds, symptom, cause, workPerformed, spareParts, status"],
        ["PLAN_PREVENTIVO", "equipmentId, activityName, frequencyType/value/unit, estimatedFrequency, nextDueAt, status"],
        ["EJECUCIÓN", "planId, equipmentId, scheduledAt, startedAt, endedAt, durationMinutes, technicianIds, activityPerformed, complianceStatus"],
        ["INSPECCIÓN", "equipmentId, templateId/version, inspectedAt, shiftId, operatorId, hourMeter, answers, criticalFailures, overallResult"],
        ["INCIDENTE", "reportedAt, areaId, equipmentId opcional, reporterId, description, priority, status, linkedCorrectiveId"],
        ["STOCK", "code, description, quantity, warehouse, sourceUpdatedAt, syncedAt, syncBatchId"],
        ["PREDICCIÓN", "equipmentId, calculatedAt, horizonDays, riskScore/level, methodType/version, featuresSnapshot, isDemonstration"],
        ["AUDITORÍA", "occurredAt, actorId, action, entityType/id, reason, before, after, metadata"],
    ]
    table(doc, ["Entidad", "Campos principales"], rows, [2300, 7060], 8.5)
    add_heading(doc, "2.3 Integridad, histórico e índices", 2)
    add_bullets(doc, [
        "Los registros operativos usan timestamps completos y durationMinutes calculado; no se confía en un valor manual.",
        "Los snapshots de equipo y área preservan cómo se llamaba el activo cuando ocurrió el evento.",
        "La anulación es lógica: isVoided, voidedAt, voidedBy y voidReason. La interfaz normal no elimina históricos.",
        "Las operaciones sensibles escriben el dato y la auditoría de forma atómica.",
        "Se requieren índices por fecha, equipo, área, técnico, estado, cumplimiento, resultado y almacén según módulo.",
        "Las credenciales de SAP y las contraseñas nunca forman parte del modelo operacional.",
    ])
    page_break(doc)

    add_heading(doc, "3. Diagramas de procesos", 1)
    add_heading(doc, "3.1 Proceso general", 2)
    add_figure(doc, ASSETS / "proceso_general.png", "Figura 2. Flujo general desde autenticación hasta explotación analítica.")
    add_body(doc, "El flujo inicia con identidad y permiso, continúa con una operación de negocio validada y finaliza con persistencia trazable. Los históricos son la fuente para dashboards y análisis; no se generan indicadores sin los datos mínimos.")
    page_break(doc)
    for n, fig_no, title, img, explanation in [
        ("3.2", 3, "Mantenimiento correctivo", "flujo_correctivo.png", "La duración se calcula con fecha y hora completas. La escritura del correctivo y de su auditoría se realiza conjuntamente para impedir registros sin trazabilidad."),
        ("3.3", 4, "Mantenimiento preventivo", "flujo_preventivo.png", "Plan y ejecución son entidades distintas. Esto permite saber qué estaba programado, qué se ejecutó y si se realizó a tiempo."),
        ("3.4", 5, "Checklist de montacargas", "flujo_checklist.png", "Una falla crítica, por ejemplo en frenos o sistema hidráulico, cambia el resultado a fuera de servicio. Una respuesta defectuosa exige observación."),
        ("3.5", 6, "Incidentes", "flujo_incidentes.png", "El incidente es un reporte gerencial breve; cuando requiere mantenimiento puede vincularse con un correctivo sin reemplazar ninguno de los dos históricos."),
        ("3.6", 7, "Stock, Power BI y predictivo", "flujo_stock_bi.png", "El navegador nunca se conecta directamente a SQL Server. Un proceso intermedio publica datos mínimos y fechados; la capa analítica permanece desacoplada."),
    ]:
        add_heading(doc, f"{n} {title}", 2)
        add_figure(doc, ASSETS / img, f"Figura {fig_no}. Proceso específico: {title.lower()}.")
        add_body(doc, explanation)
        page_break(doc)

    add_heading(doc, "4. Casos de uso y operaciones permitidas", 1)
    add_figure(doc, ASSETS / "casos_uso.png", "Figura 8. Mapa conceptual de actores y casos de uso.")
    add_heading(doc, "4.1 Actores", 2)
    table(doc, ["Actor", "Capacidad principal"], [
        ["Administrador", "Control integral, usuarios, equipos, modificaciones, anulaciones y auditoría."],
        ["Técnico de soporte", "Operaciones protegidas de corrección, anulación y desactivación; identidad pendiente."],
        ["Técnico de mantenimiento", "Registrar tiempos preventivos/correctivos y consultar stock."],
        ["Montacarguista", "Completar checklist de montacargas."],
        ["Jefe de mantenimiento", "Dashboard y registros preventivos/correctivos."],
        ["Digitador / operador Airlay", "Reportar incidentes de máquinas."],
        ["Supervisor / encargado de línea / jefe de producción", "Registrar preventivos/correctivos; consultar dashboard y stock."],
        ["Gerencia", "Consultar dashboard gerencial consolidado."],
        ["Proceso programado", "Sincronizar stock, preparar dataset y calcular riesgo cuando proceda."],
    ], [3200, 6160], 8.7)
    page_break(doc)
    add_heading(doc, "4.2 Matriz de permisos", 2)
    matrix = [
        ["Administrador", "Sí", "Sí", "Sí", "Sí", "Sí", "Sí", "Sí", "Sí"],
        ["Soporte", "Sí", "Sí", "Sí", "Consultar", "Sí", "Sí", "—", "Sí"],
        ["Técnico mantenimiento", "Registrar", "Registrar", "—", "—", "Leer", "—", "—", "—"],
        ["Montacarguista", "—", "—", "Registrar", "—", "—", "—", "—", "—"],
        ["Jefe mantenimiento", "Registrar", "Registrar", "Consultar", "—", "Según permiso", "Leer", "—", "—"],
        ["Digitador / Airlay", "—", "—", "—", "Reportar", "—", "—", "—", "—"],
        ["Supervisor / encargado / producción", "Registrar", "Registrar", "Consultar", "—", "Leer", "Leer", "—", "—"],
        ["Gerencia", "—", "—", "—", "Consultar", "—", "Leer general", "—", "—"],
    ]
    table(doc, ["Rol", "Corr.", "Prev.", "Check", "Incid.", "Stock", "Dash", "Usuarios", "Anular"], matrix, [1900, 900, 900, 900, 900, 900, 900, 1100, 960], 7.1)
    add_body(doc, "Nota: “—” significa que el rol no recibe esa operación por su perfil base. El administrador puede configurar perfiles, pero las reglas de backend conservan denegación por defecto.")
    page_break(doc)

    add_heading(doc, "4.3 Catálogo completo de operaciones", 2)
    ops = [
        ("CU-001", "Autenticarse y cerrar sesión", "Todos", "Implementado"),
        ("CU-002", "Resolver perfil activo y navegación por permisos", "Todos", "Implementado"),
        ("CU-010", "Crear equipo", "Administrador", "Implementado"),
        ("CU-011", "Editar o desactivar equipo", "Administrador / soporte", "Implementado"),
        ("CU-012", "Consultar equipo e histórico", "Autorizado", "Parcial"),
        ("CU-020", "Registrar correctivo", "Técnico / jefaturas autorizadas", "Implementado"),
        ("CU-021", "Filtrar histórico correctivo", "Autorizado", "Implementado"),
        ("CU-022", "Editar o anular correctivo", "Administrador / soporte", "Implementado"),
        ("CU-030", "Crear plan preventivo", "Jefaturas autorizadas / admin", "Implementado"),
        ("CU-031", "Registrar ejecución preventiva", "Técnico / jefaturas", "Implementado"),
        ("CU-032", "Consultar cumplimiento", "Jefaturas / gerencia autorizada", "Parcial"),
        ("CU-033", "Editar o anular plan", "Administrador / soporte", "Implementado"),
        ("CU-040", "Completar checklist", "Montacarguista", "Implementado"),
        ("CU-041", "Consultar inspecciones", "Jefaturas autorizadas", "Implementado"),
        ("CU-042", "Anular inspección", "Administrador / soporte", "Diseñado"),
        ("CU-050", "Reportar incidente", "Digitador / Airlay", "Diseñado"),
        ("CU-051", "Gestionar estado y vincular correctivo", "Responsable autorizado", "Diseñado"),
        ("CU-060", "Consultar stock", "Técnicos y jefaturas autorizadas", "Diseñado"),
        ("CU-061", "Sincronizar snapshot de SAP", "Proceso seguro", "Diseñado"),
        ("CU-070", "Consultar dashboard operativo", "Jefaturas", "Prototipo"),
        ("CU-071", "Consultar dashboard gerencial", "Gerencia", "Prototipo"),
        ("CU-080", "Crear, editar o desactivar perfil", "Administrador", "Diseñado"),
        ("CU-081", "Consultar auditoría", "Administrador", "Diseñado"),
        ("CU-090", "Preparar dataset y exportar a Power BI", "Proceso autorizado", "Diseñado"),
        ("CU-091", "Entrenar/evaluar modelos", "Administrador técnico", "Diseñado"),
        ("CU-092", "Consultar riesgo por equipo", "Jefaturas / gerencia", "Diseñado"),
    ]
    table(doc, ["ID", "Operación", "Actor principal", "Estado"], ops, [1050, 4100, 2800, 1410], 8)
    page_break(doc)

    add_heading(doc, "4.4 Especificación de casos de uso", 2)
    cases = [
        ("CU-001 — Autenticarse", "Usuario con cuenta habilitada", "Cuenta existente y conexión disponible.", "Ingresa correo y contraseña; Authentication valida; Firestore recupera perfil; la aplicación carga rutas autorizadas.", "Credenciales inválidas o perfil desactivado producen mensaje seguro y no abren rutas protegidas.", "Sesión activa y permisos resueltos."),
        ("CU-020 — Registrar correctivo", "Técnico o jefatura autorizada", "Sesión activa y equipo seleccionable.", "Selecciona área/equipo; registra fecha, inicio, fin, síntoma, causa y trabajo; el sistema calcula duración; guarda correctivo y auditoría.", "Campos incompletos, intervalo inválido o equipo inactivo impiden guardar.", "Correctivo visible en histórico e indicadores."),
        ("CU-030 — Crear plan preventivo", "Jefatura autorizada o administrador", "Equipo activo.", "Define actividad, frecuencia, carácter estimado y próxima fecha; confirma; el sistema guarda plan y auditoría.", "Una frecuencia no positiva o datos incompletos son rechazados.", "Plan activo y consultable."),
        ("CU-031 — Registrar ejecución preventiva", "Técnico o jefatura autorizada", "Equipo activo; plan opcional.", "Selecciona plan/equipo; registra tiempos y trabajo; añade repuestos; se calcula duración y cumplimiento; guarda ejecución y auditoría.", "Puede registrarse como no programada; un intervalo inválido se rechaza.", "Ejecución histórica clasificada."),
        ("CU-040 — Completar checklist", "Montacarguista", "Montacargas activo y plantilla vigente.", "Registra turno y horómetro; evalúa 25 puntos; agrega observaciones; el sistema calcula aptitud; guarda versión y respuestas.", "Faltantes bloquean el guardado; falla crítica produce fuera de servicio.", "Inspección inmutable y trazable."),
        ("CU-050 — Reportar incidente", "Digitador u operador Airlay", "Sesión activa.", "Selecciona área y equipo opcional; describe; asigna prioridad; guarda; el reporte aparece en vista gerencial.", "Si el equipo no se conoce, el incidente conserva el área y puede completarse después por rol autorizado.", "Incidente reportado con timestamp."),
        ("CU-051 — Vincular incidente a correctivo", "Responsable autorizado", "Incidente existente.", "Revisa reporte; determina intervención; crea o selecciona correctivo; relaciona ambos registros.", "Si no requiere mantenimiento, cambia el estado sin crear correctivo.", "Trazabilidad desde reporte hasta atención."),
        ("CU-060 — Consultar stock", "Técnico o jefatura autorizada", "Snapshot disponible.", "Busca código/descripcion; filtra almacén; consulta cantidad y fecha de sincronización.", "Si SAP no responde, se presenta el último snapshot válido con advertencia de fecha.", "Consulta de solo lectura."),
        ("CU-070 — Consultar dashboard", "Jefaturas o gerencia", "Permiso de lectura y datos mínimos.", "Abre tablero; aplica filtros; consulta indicadores; navega al detalle autorizado.", "Un KPI sin campos suficientes se muestra como no calculable, no como cero inventado.", "Vista acorde con rol y datos."),
        ("CU-080 — Administrar usuarios", "Administrador", "Sesión administrativa.", "Crea identidad por canal privilegiado; asigna rol, áreas y estado; audita cada cambio.", "No se crean cuentas desde una operación cliente que exponga credenciales administrativas.", "Perfil activo o desactivado y trazable."),
        ("CU-081 — Anular registro", "Administrador o soporte", "Registro existente.", "Selecciona registro; solicita anulación; ingresa motivo; confirma; sistema conserva original y escribe auditoría.", "Sin motivo no se procesa; el borrado físico se rechaza.", "Registro voided excluido de cálculos aplicables."),
        ("CU-090 — Calcular riesgo", "Proceso programado / administrador técnico", "Dataset suficiente o demostración explícita.", "Extrae; limpia; crea variables; ejecuta regresión logística y candidato; calcula métricas; guarda resultado versionado.", "Datos insuficientes generan not_calculable; datos ficticios se etiquetan isDemonstration.", "Resultado explicable por equipo y fecha."),
    ]
    for idx, c in enumerate(cases):
        add_heading(doc, c[0], 3)
        table(doc, ["Elemento", "Detalle"], [["Actor", c[1]], ["Precondición", c[2]], ["Flujo principal", c[3]], ["Alternativas", c[4]], ["Postcondición", c[5]]], [1800, 7560], 8.3)
        if idx in [2, 5, 8]:
            page_break(doc)
    page_break(doc)

    add_heading(doc, "5. Arquitectura de software", 1)
    add_figure(doc, ASSETS / "arquitectura.png", "Figura 9. Arquitectura por capas e integraciones desacopladas.")
    add_heading(doc, "5.1 Decisiones tecnológicas", 2)
    table(doc, ["Componente", "Elección", "Justificación"], [
        ["Frontend", "React 19 + JavaScript", "Componentes reutilizables, rutas y estado de sesión; JavaScript reduce la curva de aprendizaje."],
        ["Herramienta de construcción", "Vite 8", "Servidor de desarrollo rápido y salida estática optimizada en dist/."],
        ["Autenticación", "Firebase Authentication", "Correo/contraseña sin almacenar claves en la aplicación."],
        ["Base operacional", "Cloud Firestore", "Colecciones por módulo, filtros, índices, operación web y reglas por documento."],
        ["Autorización", "Security Rules + perfil", "Denegación por defecto, usuario activo y permiso específico; no depende de ocultar botones."],
        ["Publicación", "Firebase Hosting", "HTTPS, CDN y reescritura de rutas SPA; no depende de la PC de desarrollo."],
        ["SAP", "Adaptador backend / snapshot", "La consulta SQL Server existente se ejecuta con credencial de solo lectura fuera del navegador."],
        ["BI", "Power BI", "Reporte publicado desde fuentes autorizadas; CeroFallas opera aunque el reporte no esté disponible."],
        ["Predictivo", "Python, regresión logística + Random Forest por evaluar", "Línea base interpretable y segundo candidato sujeto a volumen, balance y calidad real."],
    ], [1800, 2200, 5360], 8.2)
    add_heading(doc, "5.2 Estructura del código", 2)
    add_body(doc, "La interfaz se separa en páginas, componentes de layout, features de autenticación, configuración, servicios Firebase, utilidades y estilos. Cada módulo operativo utiliza un servicio/repositorio para encapsular lecturas y escrituras; así las consultas no quedan dispersas en la interfaz.")
    table(doc, ["Ruta lógica", "Responsabilidad"], [
        ["src/pages", "Pantallas y formularios enrutados."], ["src/components", "Layout y elementos reutilizables."],
        ["src/features/auth", "Sesión, perfil y protección de rutas."], ["src/services/firebase", "Autenticación, Firestore y repositorios."],
        ["src/config", "Navegación, catálogos y plantilla de checklist."], ["src/utils", "Cálculos de duración, frecuencia, cumplimiento y aptitud."],
        ["firestore.rules", "Autorización y validación en base de datos."], ["tests", "Pruebas de reglas y lógica."],
    ], [2600, 6760], 8.8)
    add_heading(doc, "5.3 Flujo técnico de una escritura", 2)
    add_bullets(doc, [
        "La pantalla obtiene datos controlados y muestra validaciones comprensibles.",
        "Una utilidad calcula valores derivados, por ejemplo duración o resultado del checklist.",
        "El servicio construye el documento, snapshots y metadatos de auditoría.",
        "Firestore evalúa autenticación, perfil activo, permiso, forma de datos y estados permitidos.",
        "Una operación atómica guarda el registro y la auditoría; si alguna parte falla, ninguna se confirma.",
        "La pantalla vuelve al histórico y refleja el resultado persistido.",
    ])
    add_heading(doc, "5.4 Seguridad, disponibilidad y costos", 2)
    add_bullets(doc, [
        "HTTPS en publicación; secretos únicamente en entornos seguros; ningún secreto versionado.",
        "Una cuenta autenticada sin perfil activo no obtiene acceso operacional.",
        "Las reglas se prueban con Firebase Emulator Suite antes de desplegar.",
        "SAP, Power BI y predictivo están desacoplados para conservar continuidad operativa.",
        "Cloud Storage y funciones cloud que requieran facturación no se habilitan sin autorización expresa.",
    ])
    page_break(doc)

    add_heading(doc, "6. Mockups de los casos de uso", 1)
    add_body(doc, "Los siguientes mockups muestran la jerarquía de información y los controles esperados. “Implementado” indica que existe una pantalla funcional en el prototipo local; “Diseñado” representa el contrato visual de un módulo aún pendiente. El diseño es mobile-first y se adapta desde 360 px.")
    for i, file in enumerate(["mockups_1.png", "mockups_2.png", "mockups_3.png"], start=10):
        add_figure(doc, ASSETS / file, f"Figura {i}. Mockups agrupados de CeroFallas.", 6.35)
        if i < 12:
            page_break(doc)
    add_heading(doc, "6.1 Reglas de interacción", 2)
    add_bullets(doc, [
        "El menú sólo presenta módulos permitidos, pero la seguridad real se aplica también en Firestore.",
        "Los campos obligatorios usan etiqueta y mensajes de error; el color no es el único indicador.",
        "Los formularios calculan duración, cumplimiento o aptitud antes de guardar.",
        "Los listados permiten búsqueda y filtros; estados vacíos explican qué debe hacer el usuario.",
        "En móvil la navegación se colapsa y los controles mantienen área táctil suficiente.",
    ])
    page_break(doc)

    add_heading(doc, "7. Trazabilidad y estado de la solución", 1)
    add_heading(doc, "7.1 Cobertura de la rúbrica", 2)
    table(doc, ["Requisito de segunda entrega", "Evidencia en este documento", "Cobertura"], [
        ["Modelo de BD", "Sección 2: ERD lógico, entidades, campos, relaciones, integridad e índices.", "Completa"],
        ["Diagrama de procesos general", "Sección 3.1, Figura 2.", "Completa"],
        ["Diagramas específicos", "Secciones 3.2–3.6: correctivo, preventivo, checklist, incidentes y analítica.", "Completa"],
        ["Casos de uso", "Sección 4: actores, permisos, catálogo de 26 operaciones y 12 especificaciones.", "Completa"],
        ["Arquitectura de SW", "Sección 5: capas, tecnologías, seguridad, datos e integraciones.", "Completa"],
        ["Mockups", "Sección 6: nueve pantallas operativas y analíticas.", "Completa"],
    ], [2700, 5200, 1460], 8.4)
    add_heading(doc, "7.2 Estado técnico a la fecha", 2)
    table(doc, ["Módulo", "Estado", "Evidencia"], [
        ["Autenticación", "Implementado", "Login, rutas protegidas, persistencia de sesión y cierre."],
        ["Equipos", "Implementado", "Alta, consulta, filtro, edición y desactivación lógica."],
        ["Correctivos", "Implementado", "Duración, histórico, edición/anulación y auditoría."],
        ["Preventivos", "Implementado", "Plan, ejecución, frecuencia estimada y cumplimiento."],
        ["Checklist", "Implementado", "25 puntos, criticidad, resultado y auditoría."],
        ["Incidentes", "Diseñado", "Modelo, flujo y permisos definidos; desarrollo siguiente."],
        ["Usuarios", "Diseñado", "Modelo RBAC y permisos definidos; interfaz pendiente."],
        ["Stock SAP", "Diseñado", "Campos y arquitectura de snapshot definidos; conexión pendiente."],
        ["Dashboard / Power BI", "Prototipo / diseñado", "Estructura visual disponible; indicadores e integración pendientes."],
        ["Predictivo", "Diseñado", "Variables y enfoque definidos; sin histórico real para validar."],
    ], [2500, 1800, 5060], 8.5)
    add_heading(doc, "7.3 Evidencia de calidad", 2)
    add_body(doc, "El prototipo cuenta con 29 pruebas automatizadas aprobadas que cubren reglas de acceso, cálculos de tiempo, preventivos, checklist, prohibición de borrado físico y auditoría. Además, la construcción de producción ha finalizado correctamente y se han realizado pruebas visuales en escritorio y móvil.")
    add_body(doc, "La prueba más representativa del checklist confirmó que una falla ficticia en el freno de servicio produce inmediatamente el resultado “Fuera de servicio — no operar”. Esto demuestra que la interfaz no se limita a capturar texto: aplica reglas de negocio verificables.")
    page_break(doc)

    add_heading(doc, "8. Guía para presentación y defensa", 1)
    add_heading(doc, "8.1 Explicación de 90 segundos", 2)
    add_body(doc, "“CeroFallas digitaliza procesos de mantenimiento que actualmente pueden quedar dispersos en papel. Es una aplicación web responsive, por lo que funciona desde computadora o teléfono sin desarrollar una app Android separada. El usuario inicia sesión y recibe únicamente los permisos de su rol. Los módulos operativos guardan correctivos, planes y ejecuciones preventivas, equipos e inspecciones de montacargas, siempre con usuario, timestamp y auditoría. React organiza la interfaz; Firebase Authentication resuelve identidad; Firestore guarda los datos y sus reglas validan permisos. SAP y Power BI se conectarán mediante una capa separada para no exponer credenciales ni detener la aplicación. El predictivo se tratará como experimental hasta contar con histórico real.”")
    add_heading(doc, "8.2 Recorrido sugerido de demostración", 2)
    steps = [
        ("1", "Iniciar sesión", "Explicar que Authentication valida identidad y Firestore resuelve perfil/rol."),
        ("2", "Mostrar equipos", "Crear o filtrar un equipo ficticio; destacar desactivación lógica."),
        ("3", "Registrar correctivo", "Usar un caso que cruce medianoche y mostrar duración automática."),
        ("4", "Planificar preventivo", "Mostrar que la frecuencia está marcada como estimada."),
        ("5", "Registrar ejecución", "Explicar clasificación a tiempo, tardía o no programada."),
        ("6", "Completar checklist", "Marcar todo bueno y luego cambiar un punto crítico para demostrar la regla."),
        ("7", "Cerrar con arquitectura", "Señalar que SAP, Power BI y predictivo son capas separadas."),
    ]
    table(doc, ["Paso", "Acción", "Qué defender"], steps, [800, 2500, 6060], 8.8)
    add_heading(doc, "8.3 Cómo explicar el desarrollo", 2)
    table(doc, ["Pregunta", "Respuesta breve sugerida"], [
        ["¿Por qué web responsive?", "Cubre escritorio y móvil con una sola base de código, reduce costo y cumple el alcance confirmado."],
        ["¿Por qué React?", "Divide la interfaz en componentes y módulos; facilita reutilización, rutas y estados de formulario."],
        ["¿Por qué Firestore?", "Las entidades del sistema se separan bien en colecciones, requieren filtros e índices y se protegen por documento."],
        ["¿Dónde está el backend?", "Firebase aporta autenticación, base de datos y reglas. Las tareas privilegiadas e integraciones requieren una capa backend separada."],
        ["¿Ocultar un botón es seguridad?", "No. La UI mejora experiencia, pero Security Rules decide si una lectura o escritura se permite."],
        ["¿Cómo se evita perder históricos?", "No hay borrado físico normal; se usa estado inactivo o anulado con motivo y auditoría."],
        ["¿Cómo se calcula el tiempo?", "Con timestamps completos; la utilidad acepta cruce de medianoche controlado y rechaza rangos inválidos."],
        ["¿Cómo se conecta SAP?", "Una credencial de solo lectura vive fuera del navegador; un proceso publica un snapshot mínimo y fechado."],
        ["¿El predictivo ya predice fallas reales?", "No. Sin histórico suficiente sólo puede demostrarse la tubería; la efectividad exige datos reales y métricas."],
    ], [3000, 6360], 8.6)
    add_heading(doc, "8.4 Preguntas difíciles y criterio técnico", 2)
    add_bullets(doc, [
        "Si preguntan por equipos reales: indicar que no se inventaron códigos o modelos y que el levantamiento autorizado se hará en planta.",
        "Si preguntan por frecuencia preventiva: aclarar que es configurable y las actuales se etiquetan como estimadas hasta validación.",
        "Si preguntan por Power BI: explicar que puede consumir SAP y CeroFallas, pero no es la base operacional ni una dependencia para registrar.",
        "Si preguntan por seguridad: mencionar HTTPS, Authentication, perfil activo, permisos, Security Rules, ausencia de secretos y auditoría.",
        "Si preguntan por 75 %: el objetivo del proyecto es 100 %; para esta entrega se presenta diseño total y evidencia honesta del avance.",
    ])
    add_heading(doc, "8.5 Comandos de prueba local para la defensa", 2)
    table(doc, ["Objetivo", "Comando / dirección"], [
        ["Instalar dependencias", "npm install"],
        ["Iniciar emuladores", "npx firebase emulators:start --project demo-cerofallas"],
        ["Cargar datos ficticios", "npm run seed:emulator"],
        ["Abrir aplicación local", "http://127.0.0.1:5000 o la URL mostrada por Hosting Emulator"],
        ["Ejecutar pruebas", "npm test"],
        ["Construir producción", "npm run build"],
    ], [2600, 6760], 9)
    add_body(doc, "Advertencia para la exposición: los datos del emulador son locales y pueden desaparecer al detenerlo. No deben presentarse como información real de producción.")
    page_break(doc)

    add_heading(doc, "Referencias", 1)
    refs = [
        "Firebase. Cloud Firestore data model. https://firebase.google.com/docs/firestore/data-model",
        "Firebase. Get started with Cloud Firestore Security Rules. https://firebase.google.com/docs/firestore/security/get-started",
        "Firebase. Get started with Firebase Hosting. https://firebase.google.com/docs/hosting/quickstart",
        "React. Quick Start. https://react.dev/learn",
        "Microsoft Learn. Conectores y fuentes de datos de Power BI. https://learn.microsoft.com/power-bi/connect-data/",
        "CeroFallas. Requisitos, modelo de datos, arquitectura, casos de uso, decisiones y registro de pruebas del repositorio local. Versión consultada: 03 de septiembre de 2026.",
    ]
    for i, ref in enumerate(refs, 1):
        p = doc.add_paragraph(style="List Number")
        p.add_run(ref)
    add_heading(doc, "Anexo A. Checklist de montacargas propuesto", 1)
    checklist = [
        ("Inspección visual", "Llantas, tuercas/rines, horquillas, pasadores, mástil/cadenas, mangueras, cilindros, fugas y estructura."),
        ("Niveles y energía", "Aceite de motor, aceite hidráulico, refrigerante, combustible/carga y batería/conectores."),
        ("Operación", "Freno de servicio, freno de estacionamiento, dirección, elevación, inclinación y aceleración/desplazamiento."),
        ("Seguridad", "Bocina, alarma de reversa, luces, cinturón/asiento, extintor y señalización/placas."),
        ("Estados", "Bueno; Requiere atención; Fuera de servicio; No aplica."),
        ("Regla crítica", "Una falla crítica genera fuera de servicio; toda condición defectuosa exige observación."),
    ]
    table(doc, ["Sección", "Puntos cubiertos"], checklist, [2300, 7060], 9)
    add_heading(doc, "Anexo B. Variables predictivas propuestas", 1)
    add_bullets(doc, [
        "Días desde el último preventivo.", "Cantidad de fallas en 30, 60 y 90 días.",
        "Promedio de duración de correctivos por equipo.", "Línea, turno y tipo de falla, cuando la calidad lo permita.",
        "Variable objetivo: ocurrencia de una falla dentro de una ventana futura aprobada.",
        "Métricas mínimas: precision, recall y matriz de confusión; F1 y PR-AUC cuando correspondan.",
    ])
    add_body(doc, "Selección del segundo modelo: se propone evaluar Random Forest frente a un árbol de decisión después de revisar tamaño, balance de clases, valores faltantes y cardinalidad. La recomendación final no debe basarse sólo en exactitud; debe priorizar la detección de fallas reales y conservar explicabilidad.")

    doc.core_properties.title = "CeroFallas — Segunda Entrega"
    doc.core_properties.subject = "Propuesta conceptual de la solución de IT"
    doc.core_properties.author = "Germán Hernández"
    doc.core_properties.keywords = "CeroFallas, mantenimiento, arquitectura, casos de uso, modelo de datos"
    doc.save(DOCX_PATH)
    print(DOCX_PATH)


if __name__ == "__main__":
    build_docx()
