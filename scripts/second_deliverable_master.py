"""Actualizaciones del documento maestro. Mantiene una única salida DOCX."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt
ROOT=Path(__file__).resolve().parents[1]
AS=ROOT/'deliverables/segunda_entrega/assets'

def erd(path,title,entities,edges):
    im=Image.new('RGB',(2000,1540),'white');d=ImageDraw.Draw(im)
    def f(n,b=False):return ImageFont.truetype('C:/Windows/Fonts/'+('arialbd.ttf' if b else 'arial.ttf'),n)
    d.text((65,35),title,font=f(42,True),fill='#0b4c52')
    d.text((65,94),'ID = identificador  |  REF = referencia lógica  |  ? = opcional',font=f(25),fill='#52636b')
    for a,b,label in edges:
        ax,ay,_=entities[a];bx,by,_=entities[b]
        if ay==by:
            p=[(ax+650,ay+150),(bx,by+150)];tx=(ax+650+bx)//2;ty=ay+110
        else:
            p=[(ax+325,ay+285),(bx+325,by)];tx=bx+440;ty=(ay+285+by)//2-16
        d.line(p,fill='#126b72',width=4)
        d.text((tx-40,ty),label,font=f(26,True),fill='#0b4c52')
    for name,(x,y,fields) in entities.items():
        d.rounded_rectangle((x,y,x+650,y+285),radius=14,fill='#f4f7f8',outline='#126b72',width=3)
        d.rounded_rectangle((x,y,x+650,y+58),radius=14,fill='#0b4c52')
        d.text((x+20,y+12),name,font=f(28,True),fill='white')
        for i,v in enumerate(fields):d.text((x+20,y+78+i*37),v,font=f(25),fill='#152329')
    d.text((65,1458),'Notación: cada extremo indica cuántos registros pueden relacionarse.',font=f(24),fill='#52636b')
    d.text((65,1498),'Diseño lógico. Firestore no crea claves foráneas SQL ni JOIN automáticos.',font=f(24),fill='#52636b')
    im.save(path)

def assets():
    erd(AS/'modelo_datos.png','A. Activos y mantenimiento',{
      'ÁREA':(80,175,['ID areaId : string','code, name : string','status : enum']),
      'EQUIPO':(1220,175,['ID equipmentId : string','REF areaId : string','code, name, type : string','status : enum']),
      'PLAN PREVENTIVO':(80,650,['ID planId : string','REF equipmentId : string','frequencyType / value / unit','nextDueAt : timestamp','estimatedFrequency : boolean']),
      'CORRECTIVO':(1220,650,['ID correctiveId : string','REF equipmentId : string','startedAt / endedAt : timestamp','durationMinutes : integer','technicianIds : string[]']),
      'EJECUCIÓN PREVENTIVA':(80,1120,['ID executionId : string','REF planId? / equipmentId','activityPerformed : string','complianceStatus : enum']),
      'INCIDENTE':(1220,1120,['ID incidentId : string','REF equipmentId? / areaId','REF linkedCorrectiveId?','priority / status : enum'])
    },[('ÁREA','EQUIPO','1 — 0..N'),('EQUIPO','CORRECTIVO','1 : 0..N'),('PLAN PREVENTIVO','EJECUCIÓN PREVENTIVA','0..1 : 0..N'),('CORRECTIVO','INCIDENTE','0..1 : 0..N')])
    erd(AS/'modelo_seguridad.png','B. Identidad, inspecciones y trazabilidad',{
      'ROL (catálogo lógico)':(80,175,['ID roleId : string','name : string','permissions : string[]']),
      'USUARIO / users':(1220,175,['ID uid : string (Authentication)','REF roleId : string','permissions : string[]','status : active | disabled']),
      'PLANTILLA (configuración)':(80,650,['ID templateId : string','version : integer','sections / items : object[]','critical / required : boolean']),
      'AUDITORÍA / audit':(1220,650,['ID auditId : string','REF actorId : string','entityType + entityId','action / occurredAt / reason','before / after : object?']),
      'INSPECCIÓN / forkliftInspections':(80,1120,['ID inspectionId : string','REF equipmentId / operatorId','REF templateId + version','REF shiftId / hourMeter','answers[] / overallResult']),
      'TURNO (catálogo lógico)':(1220,1120,['ID shiftId : string','startTime / endTime : time','crossesMidnight : boolean','weekdays : integer[]'])
    },[('ROL (catálogo lógico)','USUARIO / users','1 — 0..N'),('USUARIO / users','AUDITORÍA / audit','1 : 0..N'),('PLANTILLA (configuración)','INSPECCIÓN / forkliftInspections','1 : 0..N'),('INSPECCIÓN / forkliftInspections','TURNO (catálogo lógico)','0..N — 1')])
    flow_specs=[
      ('flujo_correctivo.png','Correctivo: captura, validación y registro',['Usuario autorizado selecciona área y equipo','Captura fecha, inicio, fin, síntoma y trabajo','¿Campos y duración válidos?','Guarda correctivo y auditoría atómicamente','Consulta histórico autorizado'], 'No: corregir datos'),
      ('flujo_preventivo.png','Preventivo: planificación y ejecución',['Jefatura autorizada crea plan estimado','Técnico registra ejecución y tiempos','¿Datos de ejecución válidos?','Clasifica: a tiempo, tardía o no programada','Guarda ejecución y auditoría; conserva plan'], 'No: corregir ejecución'),
      ('flujo_checklist.png','Montacargas: inspección previa al uso',['Seleccionar equipo, turno y horómetro','Responder 25 puntos y observaciones','¿Respuestas completas y válidas?','Calcular resultado: apto / atención / fuera','Guardar inspección y auditoría'], 'No: completar puntos'),
      ('flujo_incidentes.png','Incidente: reporte y seguimiento',['Digitador / Airlay captura área y descripción','Indica prioridad y equipo opcional','¿Reporte válido?','Guarda; admin / soporte registra seguimiento','Vincula correctivo existente compatible (opcional)'], 'No: corregir reporte'),
      ('flujo_stock_bi.png','Integración de stock y análisis (propuesta)',['Servicio autorizado ejecuta consulta SAP','Extrae código, descripción, cantidad, almacén','¿Lote íntegro y válido?','Publica snapshot fechado de solo lectura','BI y predictivo consumen datasets separados'], 'No: conservar lote previo'),
    ]
    for file,title,steps,branch in flow_specs:
      im=Image.new('RGB',(1800,1400),'white');d=ImageDraw.Draw(im)
      f=lambda n,b=False:ImageFont.truetype('C:/Windows/Fonts/'+('arialbd.ttf' if b else 'arial.ttf'),n)
      d.text((60,35),title,font=f(39,True),fill='#0b4c52')
      for i,s in enumerate(steps):
       y=145+i*235
       if i==2:
        d.polygon([(720,y),(1290,y+82),(720,y+164),(150,y+82)],fill='#fff3dd',outline='#b86912',width=4)
        box=d.textbbox((0,0),s,font=f(28,True));d.text((720-(box[2]-box[0])/2,y+65),s,font=f(28,True),fill='#152329')
        d.line([(1290,y+82),(1600,y+82),(1600,145+235+80),(1290,145+235+80)],fill='#b86912',width=4)
        d.text((1320,y+105),branch,font=f(20),fill='#875211')
        d.text((750,y+180),'Sí',font=f(24,True),fill='#126b72')
       else:
        d.rounded_rectangle((150,y,1290,y+164),radius=20,fill='#e4f1ef',outline='#126b72',width=3)
        box=d.textbbox((0,0),s,font=f(29,True));d.text((720-(box[2]-box[0])/2,y+65),s,font=f(29,True),fill='#152329')
       if i<4:
        d.line([(720,y+164),(720,y+226)],fill='#126b72',width=4);d.polygon([(720,y+235),(710,y+218),(730,y+218)],fill='#126b72')
      d.text((60,1350),'Lectura de arriba hacia abajo. Error: no confirmar escritura; mostrar causa y permitir corrección.',font=f(23),fill='#52636b')
      im.save(AS/file)
    # Arquitectura: distinguir entrega de frontend, acceso a datos e integraciones.
    im=Image.new('RGB',(2000,1450),'white');d=ImageDraw.Draw(im)
    f=lambda n,b=False:ImageFont.truetype('C:/Windows/Fonts/'+('arialbd.ttf' if b else 'arial.ttf'),n)
    d.text((60,40),'Arquitectura: servicios y límites de confianza',font=f(43,True),fill='#0b4c52')
    nodes=[(80,170,'Firebase Hosting (propuesto)','Entrega HTML, CSS y JavaScript vía HTTPS'),(80,440,'Navegador: React + Vite','Páginas, rutas, formularios y servicios SDK'),(80,710,'Firebase Authentication','Valida identidad; emite sesión de usuario'),(80,980,'Security Rules + Cloud Firestore','Perfil activo, permisos, datos y auditoría'),(1180,170,'SQL Server / SAP','Origen institucional; consulta autorizada'),(1180,440,'Adaptador seguro (pendiente)','Credenciales fuera del navegador; snapshot'),(1180,710,'Power BI (pendiente)','Dataset autorizado; reporte con acceso'),(1180,980,'Predictivo (experimental)','Entrenamiento y evaluación fuera de la SPA')]
    for x,y,title,desc in nodes:
      d.rounded_rectangle((x,y,x+740,y+175),radius=18,fill='#e4f1ef' if x==80 else '#fff3dd',outline='#126b72',width=3)
      d.text((x+22,y+30),title,font=f(27,True),fill='#0b4c52');d.text((x+22,y+94),desc,font=f(24),fill='#152329')
    for x,y1,y2 in [(450,345,440),(450,615,710),(450,885,980),(1550,345,440)]:
      d.line([(x,y1),(x,y2)],fill='#126b72',width=4);d.polygon([(x,y2),(x-10,y2-18),(x+10,y2-18)],fill='#126b72')
    d.line([(1180,530),(1000,530),(1000,1065),(820,1065)],fill='#b86912',width=4)
    d.text((850,570),'Snapshot',font=f(24),fill='#875211')
    d.text((850,600),'validado',font=f(24),fill='#875211')
    d.text((65,1240),'El token identifica al usuario; las reglas autorizan cada operación de datos.',font=f(28),fill='#152329')
    d.text((65,1290),'BI y predictivo consumen exportaciones controladas; no están en la ruta de escritura operativa.',font=f(27),fill='#52636b')
    d.text((65,1340),'El navegador nunca recibe credenciales SQL. Publicación cloud y costos requieren autorización.',font=f(27),fill='#52636b')
    im.save(AS/'arquitectura.png')

def replace_section(doc,start,end,writer):
    body=doc._element.body
    def value(el):return ''.join(el.xpath('.//w:t/text()'))
    def heading(el):
      return el.tag==qn('w:p') and any(v.startswith('Heading') for v in el.xpath('./w:pPr/w:pStyle/@w:val'))
    a=next(el for el in body if heading(el) and start==value(el))
    b=next(el for el in body if heading(el) and end==value(el))
    children=list(body);i=children.index(a);j=children.index(b)
    for el in children[i:j]:body.remove(el)
    before=set(body);writer();added=[el for el in body if el not in before and el.tag!=qn('w:sectPr')]
    for el in added:body.remove(el);b.addprevious(el)

def upgrade(doc,api):
    h=api['add_heading'];p=api['add_body'];tab=api['table'];fig=api['add_figure'];br=api['page_break']
    assets()
    # Sustituir imagen antigua por la misma ruta requiere regeneración del dibujo antes de insertarlo.
    # El constructor principal invoca assets() justo después de build_assets().
    replacements={
      '1.0 — propuesta conceptual':'Documento maestro · actualización 03/09/2026',
      '06 de septiembre de 2026':'06 de septiembre (año por confirmar)',
      'Implementado: autenticación, equipos, correctivos, preventivos y checklist. Diseñado: usuarios, incidentes, stock, dashboard completo, Power BI y predictivo.':'Prototipo local: autenticación, equipos, correctivos, preventivos, checklist e incidentes; consultas de perfiles, auditoría y conteos iniciales. Propuesta: dashboard ampliado, gestión privilegiada de cuentas, SAP, Power BI y predictivo.',
      'La conceptualización cubre el 100 % del alcance previsto; el prototipo comprobado incluye los cinco módulos nucleares señalados en el control del documento y cuenta con 29 pruebas automatizadas aprobadas.':'Se documentan los puntos de la rúbrica. El estado técnico registrado en docs/project-status.md informa 43 de 43 pruebas aprobadas; ese resultado corresponde al avance anterior y no constituye una nueva ejecución en esta revisión documental.',
      'El prototipo cuenta con 29 pruebas automatizadas aprobadas que cubren reglas de acceso, cálculos de tiempo, preventivos, checklist, prohibición de borrado físico y auditoría. Además, la construcción de producción ha finalizado correctamente y se han realizado pruebas visuales en escritorio y móvil.':'El registro de avance del 03/09/2026 informa 43/43 pruebas aprobadas y construcción de producción exitosa. La revisión autenticada del flujo reciente de incidentes sigue pendiente de validación manual. Este documento no presenta las pruebas históricas como ejecutadas nuevamente.',
      'La anulación es lógica: isVoided, voidedAt, voidedBy y voidReason. La interfaz normal no elimina históricos.':'La anulación usa status=voided y metadatos específicos por módulo; el diseño lógico propone motivo, actor y fecha. No todos los campos conceptuales están materializados. La interfaz normal no elimina históricos.',
      'El entregable académico se conserva como versión histórica.':'Este archivo es el documento maestro y se actualiza en el mismo lugar.',
    }
    def allparas():
      yield from doc.paragraphs
      for t in doc.tables:
       for r in t.rows:
        for c in r.cells:yield from c.paragraphs
    for para in allparas():
      s=para.text
      for a,b in replacements.items():s=s.replace(a,b)
      if s!=para.text:para.text=s
    # Estado de operaciones y coherencia de IDs.
    for t in doc.tables:
      if [c.text for c in t.rows[0].cells]==['ID','Operación','Actor principal','Estado']:
       for row in t.rows[1:]:
        ident=row.cells[0].text
        if ident in ['CU-050','CU-051','CU-081']:row.cells[3].text='Prototipo local'
        if ident in ['CU-060','CU-070','CU-071']:row.cells[3].text='Parcial'
        if ident=='CU-051':row.cells[2].text='Administrador / soporte'
      if [c.text for c in t.rows[0].cells]==['Módulo','Estado','Evidencia']:
       updates={'Incidentes':('Prototipo local','Reporte, seguimiento administrativo y vínculo a correctivo existente; recorrido autenticado pendiente de validar.'),'Usuarios':('Parcial','Consulta de perfiles y Mi perfil; alta y gestión privilegiada de cuentas pendientes.'),'Dashboard / Power BI':('Parcial / propuesto','Conteos iniciales implementados; filtros, agenda, gráficos y Power BI pendientes.'),'Stock SAP':('Parcial / propuesto','Pantalla de consulta disponible; extracción de SAP y datos reales pendientes.')}
       for row in t.rows[1:]:
        if row.cells[0].text in updates:row.cells[1].text,row.cells[2].text=updates[row.cells[0].text]
      if t.rows[0].cells[0].text=='Rol':
       for row in t.rows[1:]:
        if row.cells[0].text=='Soporte':row.cells[4].text='Gestionar'
        if row.cells[0].text=='Gerencia':row.cells[4].text='En tablero'
        if row.cells[0].text in ['Jefe mantenimiento','Supervisor / encargado / producción']:row.cells[3].text='—'
    def model():
      h(doc,'2. Modelo de base de datos',1)
      p(doc,'Se presenta un modelo lógico documental con identificadores, referencias y cardinalidades. Cloud Firestore es la base operacional; SQL Server pertenece al origen SAP. ID identifica un documento y REF expresa una relación que debe validarse mediante servicios y reglas, no una clave foránea SQL automática. Fuente técnica: Firebase, Cloud Firestore data model [1].')
      fig(doc,AS/'modelo_datos.png','Figura 1A. Núcleo de activos y mantenimiento. Las relaciones complementarias se detallan a continuación.',6.5)
      p(doc,'Relaciones complementarias: EQUIPO 1 a 0..N PLAN_PREVENTIVO; EQUIPO 1 a 0..N EJECUCIÓN; ÁREA 1 a 0..N INCIDENTE; un incidente puede tener 0..1 equipo. Cada ejecución tiene un equipo aunque no provenga de un plan. Un correctivo puede estar vinculado a varios incidentes: el servicio actual no impone unicidad del vínculo.')
      br(doc);fig(doc,AS/'modelo_seguridad.png','Figura 1B. Identidad e inspecciones. Los catálogos lógicos no implican colecciones ya desplegadas.',6.5)
      p(doc,'Relaciones complementarias: EQUIPO 1 a 0..N INSPECCIÓN; USUARIO 1 a 0..N INSPECCIÓN como operador; USUARIO N a N intervenciones mediante technicianIds. El prototipo registra inicialmente un responsable. AUDITORÍA referencia entidades por tipo e ID. La versión de la plantilla y sus respuestas preservan la interpretación histórica.')
      h(doc,'2.1 Mapeo lógico a la implementación',2)
      tab(doc,['Entidad lógica','Materialización / condición'],[
       ['Usuario','users/{uid}; perfil vinculado con Firebase Authentication.'],['Equipo','equipment/{id}; catálogo operacional.'],['Correctivo','correctives/{id}; intervenciones y tiempos.'],['Plan / ejecución','preventivePlans/{id} y preventiveExecutions/{id}.'],['Inspección','forkliftInspections/{id}; answers y snapshots embebidos.'],['Incidente','incidents/{id}; createdAt es fecha de registro actual.'],['Auditoría','audit/{id}; actor, acción y entidad afectada.'],['Rol / área / turno','Catálogos lógicos; permisos en users y catálogos de configuración. No se afirma que existan tablas o colecciones dinámicas.'],['Plantilla checklist','src/config/forkliftChecklist.js; ID y versión copiados en cada inspección.'],['Stock / predicción','Modelo de integración propuesto; no se afirma que contenga datos SAP ni resultados validados.']], [2600,6760],9)
      h(doc,'2.2 Diccionario lógico de datos',2)
      p(doc,'Diccionario de diseño: los tipos describen el contrato objetivo. Obligatorio significa exigido por el diseño, no prueba de que todas las reglas físicas ya estén implementadas. Los nombres en diagramas se simplifican para facilitar lectura.')
      # Integrar el diccionario fuente completo, conservándolo editable.
      source=(ROOT/'docs/data-model.md').read_text(encoding='utf-8')
      current=None;heads=None;rows=[]
      def flush():
       if current and rows:
        h(doc,current,3);tab(doc,heads,rows,[2400,1450,1250,4260],8.5)
      for line in source.splitlines():
       if line.startswith('## '):
        flush();current=line[3:];heads=None;rows=[]
       elif line.startswith('|'):
        cells=[v.strip().replace('`','') for v in line.strip('|').split('|')]
        if len(cells)!=4:continue
        if all(set(v)<=set('-: ') for v in cells):continue
        if heads is None:heads=cells
        else:rows.append(cells)
      flush()
      h(doc,'2.3 Integridad y diferencias que deben resolverse',2)
      for s in [
       'El vínculo incidente-correctivo es 0..1 correctivo por incidente y 0..N incidentes por correctivo. No se debe presentar como uno a uno sin una restricción de unicidad adicional.',
       'reportedAt es un campo conceptual; el servicio de incidentes actual guarda createdAt. El formulario futuro debe diferenciar fecha del suceso y fecha de captura si se requiere.',
       'El servicio guarda areaName en algunos módulos, aunque el modelo objetivo lo agrupa como areaSnapshot. Migraciones futuras deben preservar el histórico.',
       'El resultado out_of_service pertenece a la inspección; el servicio actual no cambia automáticamente equipment.status. La advertencia no equivale a un bloqueo físico de la máquina.',
       'Stock usa clave lógica code + warehouse, cantidad de origen, syncedAt y lote. Los repuestos usados en una intervención son evidencia histórica, no una deducción automática del inventario SAP.',
       'Predicción usa equipmentId, método/versionado y fecha. Debe admitir not_calculable. No existe información suficiente para publicar probabilidades validadas.',
       'Evitar eliminación física; validar referencias activas, estados y timestamps; guardar auditoría con operaciones atómicas. Un índice acelera consultas, pero no impone integridad ni permisos.',
       'Índices previstos: equipo + fecha en intervenciones; estado + nextDueAt en planes; resultado + inspectedAt en inspecciones; prioridad/estado + fecha en incidentes. Definir índices físicos según las consultas de firestore.indexes.json.',
      ]:p(doc,s)
      br(doc)
    replace_section(doc,'2. Modelo de base de datos','3. Diagramas de procesos',model)
    def specifications():
      h(doc,'4.4 Especificación de casos de uso',2)
      p(doc,'Identificadores propios de este documento maestro. Cada caso define condición, secuencia, alternativa y resultado. «Propuesto» describe el contrato funcional, no una función ya desplegada. Las operaciones de soporte requieren perfil explícito; el usuario de soporte aún no está asignado.')
      details={
       'CU-001':('Cuenta habilitada.','Ingresar credenciales; validar identidad; cargar perfil; abrir inicio autorizado. Al salir, cerrar sesión y proteger rutas.','Credenciales inválidas o perfil inactivo: denegar sin revelar datos.','Sesión iniciada o finalizada.'),
       'CU-002':('Sesión autenticada.','Leer users/{uid}; comprobar status y permissions; filtrar navegación; aplicar reglas en cada acceso.','Perfil inexistente: no permitir operación.','Acceso limitado al rol.'),
       'CU-010':('Permiso equipment.manage y datos del activo.','Capturar código, nombre, tipo y área; validar; guardar equipo y auditoría.','Código inválido o datos incompletos: corregir antes de guardar.','Equipo disponible para selección.'),
       'CU-011':('Equipo existente y administrador/soporte.','Abrir equipo; cambiar datos o estado; confirmar; conservar referencias e histórico; auditar.','Acción no autorizada: rechazar; no borrar físicamente.','Equipo actualizado o desactivado.'),
       'CU-012':('Permiso de lectura de equipos.','Abrir catálogo; buscar y filtrar; consultar detalle disponible y registros autorizados.','Sin coincidencias: estado vacío. Historial unificado por equipo: pendiente.','Consulta sin modificación.'),
       'CU-020':('Equipo seleccionable y permiso corrective.create.','Capturar área, equipo, fecha, inicio, fin, síntoma y trabajo; calcular duración; persistir y auditar.','Cruce de medianoche debe declararse; tiempos inválidos impiden guardar.','Correctivo completed disponible.'),
       'CU-021':('Permiso corrective.read.','Abrir histórico; aplicar filtros disponibles; inspeccionar registro.','Sin registros: mostrar vacío; paginación completa pendiente.','Resultados autorizados visibles.'),
       'CU-022':('Registro existente; administrador/soporte.','Seleccionar edición o anulación; justificar acción; validar; guardar cambios y auditoría.','Sin motivo o estado inválido: rechazar.','Registro actualizado o voided, conservado.'),
       'CU-030':('Equipo activo y permiso preventive.plan.','Definir actividad, frecuencia, próxima fecha y condición estimada; validar; guardar plan y auditoría.','Frecuencia no válida: informar. No presentar estimación como estándar institucional.','Plan consultable.'),
       'CU-031':('Permiso preventive.execute; equipo; plan opcional.','Registrar trabajo y tiempos; calcular duración y cumplimiento; guardar ejecución vinculada y auditoría.','Sin plan: ejecución no programada; tiempos inválidos: rechazar.','Ejecución independiente del plan.'),
       'CU-032':('Lectura preventiva autorizada.','Consultar ejecución y fecha programada; mostrar a tiempo, tardía o no programada.','Sin programación: no calcular un cumplimiento ficticio.','Clasificación consultable; agregado gerencial pendiente.'),
       'CU-033':('Plan existente; administrador/soporte.','Editar actividad o programación, o anular; validar y auditar sin borrar ejecuciones anteriores.','Rol sin privilegio: rechazar.','Plan actualizado y trazable.'),
       'CU-040':('Montacarguista; montacargas activo.','Registrar fecha, turno y horómetro; responder 25 puntos; validar observaciones; calcular resultado; guardar inspección y auditoría.','Respuesta obligatoria faltante: bloquear guardado. Falla crítica: fuera de servicio.','Resultado histórico; no cambia automáticamente el estado del activo.'),
       'CU-041':('Permiso forklift.read.','Consultar inspecciones; revisar fecha, operador, resultado y observaciones.','Sin inspecciones: mostrar estado vacío, no presumir aptitud.','Lectura trazable.'),
       'CU-042':('Propuesto: inspección existente y permiso privilegiado.','Seleccionar inspección; ingresar motivo; confirmar anulación lógica y auditoría.','No implementar borrado físico ni sobrescritura de respuestas.','Inspección anulada conservada; interfaz pendiente.'),
       'CU-050':('Digitador/Airlay u otro perfil con incident.create.','Elegir área y equipo opcional; escribir descripción y prioridad; validar; guardar reporte y auditoría.','Descripción insuficiente o equipo de otra área: rechazar.','Incidente reported con createdAt.'),
       'CU-051':('Administrador/soporte; incidente no anulado.','Revisar; indicar estado y motivo; seleccionar correctivo existente opcional; validar área/equipo; actualizar con auditoría.','Correctivo inexistente, anulado o incompatible: rechazar vínculo.','Seguimiento guardado; no crea correctivo automáticamente.'),
       'CU-060':('Permiso stock.read.','Consultar código, descripción, cantidad, almacén y fecha del snapshot disponible.','Sin sincronización: advertir ausencia; no inventar existencias.','Consulta sin escribir en SAP.'),
       'CU-061':('Propuesto: consulta autorizada y conectividad segura.','Ejecutar SQL de solo lectura fuera del navegador; transformar campos mínimos; validar lote; publicar snapshot fechado.','Falla de origen: conservar último lote válido y reportar antigüedad.','Snapshot trazable; integración pendiente.'),
       'CU-070':('Jefatura con dashboard.read.','Elegir período/área; consultar indicadores, alertas, tendencias y agenda; abrir detalle autorizado.','Sin datos o permiso: estado explícito. Filtros y gráficos son propuestos.','Resumen operativo; conteos iniciales disponibles.'),
       'CU-071':('Gerencia con permiso de agregado.','Abrir tablero consolidado; revisar tendencias y situación general sin habilitar escritura operativa.','No ampliar permisos de documentos sensibles solo para calcular KPIs.','Vista gerencial; agregados con mínimo privilegio pendientes.'),
       'CU-080':('Propuesto: administrador autorizado.','Crear identidad en backend; asignar perfil, rol y estado; auditar; permitir corrección/desactivación controlada.','No exponer credenciales administrativas ni cambiar la sesión del administrador.','Cuenta y perfil coherentes; gestión privilegiada pendiente.'),
       'CU-081':('Permiso audit.read.','Abrir bitácora; consultar actor, fecha, acción y entidad; revisar motivo y cambios disponibles.','Sin eventos: estado vacío. No ofrecer edición de auditoría.','Histórico de consulta.'),
       'CU-090':('Propuesto: proceso autorizado y política de datos.','Extraer campos mínimos; validar fechas y calidad; generar dataset; actualizar reporte Power BI con acceso controlado.','Fallo de actualización: indicar fecha; no afectar registros operativos.','Dataset analítico autorizado.'),
       'CU-091':('Propuesto: histórico suficiente y variable objetivo definida.','Separar entrenamiento/evaluación por tiempo; entrenar línea base y segundo candidato; comparar métricas; versionar artefactos.','Sin datos suficientes: no calcular; simulación identificada expresamente.','Evaluación reproducible, no promesa de precisión.'),
       'CU-092':('Propuesto: permiso y resultado versionado.','Consultar equipo, fecha, horizonte, método y explicación; mostrar antigüedad del resultado.','Resultado inexistente: not_calculable, no cero riesgo.','Lectura de riesgo contextualizada.')}
      catalog=next(t for t in doc.tables if [c.text for c in t.rows[0].cells]==['ID','Operación','Actor principal','Estado'])
      records=[[c.text for c in r.cells] for r in catalog.rows[1:]]
      for index,(ident,title,actor,state) in enumerate(records):
       h(doc,ident+' · '+title,3)
       a,b,c,e=details[ident]
       for label,content in [('Actor / estado',actor+' / '+state),('Precondición',a),('Flujo principal',b),('Alternativa',c),('Resultado',e)]:p(doc,label+': '+content)
       if index%3==2:br(doc)
      h(doc,'Operaciones complementarias',3)
      p(doc,'Mi perfil y consulta de usuarios: la sesión activa puede consultar su propio perfil; users.read permite listar perfiles autorizados. No se deduce permiso de edición a partir de la lectura. La anulación de una ejecución preventiva y la gestión dinámica de plantillas pertenecen al alcance objetivo, pero requieren interfaz y reglas verificadas antes de declararse disponibles.')
      br(doc)
    replace_section(doc,'4.4 Especificación de casos de uso','5. Arquitectura de software',specifications)
    def mocks():
      h(doc,'6. Mockups de los casos de uso',1)
      p(doc,'Diseños conceptuales aprobados para comunicar la experiencia objetivo. No son capturas ni prueba de que todas las funciones estén implementadas. Todos los códigos, cifras y gráficas son ficticios. Se integran aquí para que la entrega pueda revisarse sin documentos separados.')
      h(doc,'6.1 Dashboard operativo-gerencial',2)
      p(doc,'El tablero prioriza acciones: incidentes pendientes, preventivos vencidos, agenda y actividad por equipos. Filtros por período y área y fecha de corte hacen explícito el contexto. Los accesos a formularios se muestran únicamente a roles autorizados; Gerencia conserva una vista de lectura.')
      tab(doc,['Indicador propuesto','Definición y unidad'],[
       ['Incidentes abiertos','Conteo de reported, acknowledged e in_progress al corte; excluir resolved y voided.'],['Preventivos vencidos','Planes activos con nextDueAt anterior al corte. Requiere reglas de reprogramación definidas.'],['Próximos 7 días','Planes activos con vencimiento desde el corte hasta antes de corte + 7 días.'],['Tiempo correctivo','Suma de durationMinutes de registros completed iniciados dentro del período / 60. Horas de intervención, no horas de paro.'],['Gráficos','Conteos por día y por equipo dentro del período, excluyendo anulados.'],['Atención prioritaria','Incidentes críticos abiertos y última inspección válida por montacargas; no sumar inspecciones antiguas como equipos distintos.']], [2700,6660],9)
      p(doc,'Estado real: existen cuatro conteos iniciales. La agenda, filtros y gráficos de esta propuesta aún deben implementarse. No se incluyen OEE, MTBF ni disponibilidad porque falta registrar exposición y paros con una definición validada.')
      br(doc)
      import json
      files=json.loads((ROOT/'deliverables/mockups_figma/manifest.json').read_text(encoding='utf-8'))
      links=['CU-001','CU-070 / CU-071','CU-010 a CU-012','CU-020 a CU-022','CU-030 / CU-033','CU-031 / CU-032','CU-040 a CU-042','CU-050 / CU-051','CU-060','CU-080','CU-081','CU-091 / CU-092','CU-070','CU-040','CU-050']
      for i,item in enumerate(files):
       h(doc,'6.'+str(i+2)+' '+item['title'],2)
       file=ROOT/'deliverables/mockups_figma'/item['file'].replace('.svg','.png')
       fig(doc,file,'Figura M'+str(i+1)+'. '+item['title']+' · '+links[i]+' · datos de demostración.',3.0 if i>=12 else 6.5)
       if i==0:p(doc,'Mensaje aprobado: «Cuida tus equipos. Fortalece tu operación». El texto secundario destaca coordinación, atención de incidentes y trabajo en equipo. La autenticación valida identidad; el perfil y las reglas determinan permisos.')
       elif i==1:p(doc,'La información se ordena de lo urgente a lo analítico: indicadores, alerta prioritaria, tendencias, equipos y agenda. Los números son ejemplos coherentes con el período indicado, no información de planta.')
       elif i==6:p(doc,'Vista resumida: el formulario real requiere 25 puntos, fecha, turno y horómetro. La criticidad debe ser aprobada en planta. Una inspección no sustituye autorización técnica para volver a operar.')
       else:p(doc,'Propósito: representar el caso de uso y la jerarquía de controles. La operación final debe aplicar validación, mensajes de error y autorización en backend, además de la interfaz.')
       br(doc)
    replace_section(doc,'6. Mockups de los casos de uso','7. Trazabilidad y estado de la solución',mocks)
    # Consistencia de las referencias de rúbrica tras la ampliación.
    for para in allparas():
      if 'Sección 6: nueve pantallas' in para.text:para.text='Sección 6: 15 vistas, dashboard operativo-gerencial, login y adaptación móvil.'
      if '26 operaciones y 12 especificaciones' in para.text:para.text='Sección 4: catálogo de operaciones y especificaciones funcionales.'
    # Geometría de tablas explícita y sin filas cortadas.
    for t in doc.tables:
      widths=[int(c._tc.get_or_add_tcPr().find(qn('w:tcW')).get(qn('w:w'))) for c in t.rows[0].cells]
      if sum(widths)!=9360:widths=[int(w*9360/sum(widths)) for w in widths];widths[-1]+=9360-sum(widths)
      pr=t._tbl.tblPr
      for name,attrs in [('tblW',{'w':9360,'type':'dxa'}),('tblInd',{'w':120,'type':'dxa'})]:
       el=pr.find(qn('w:'+name))
       if el is None:el=OxmlElement('w:'+name);pr.append(el)
       for k,v in attrs.items():el.set(qn('w:'+k),str(v))
      grid=t._tbl.tblGrid
      for el in list(grid):grid.remove(el)
      for width in widths:el=OxmlElement('w:gridCol');el.set(qn('w:w'),str(width));grid.append(el)
      margins=OxmlElement('w:tblCellMar')
      for side,v in [('top',80),('bottom',80),('start',120),('end',120)]:
       el=OxmlElement('w:'+side);el.set(qn('w:w'),str(v));el.set(qn('w:type'),'dxa');margins.append(el)
      pr.append(margins)
      if t.rows[0].cells[0].text in ('Requisito de segunda entrega','Módulo'):
       for side in ('top','bottom'):
        margins.find(qn('w:'+side)).set(qn('w:w'),'30')
      for cell in t.rows[0].cells:
       for para in cell.paragraphs:para.paragraph_format.keep_with_next=True
      for row in t.rows:
       row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
       for c,width in zip(row.cells,widths):
        c._tc.get_or_add_tcPr().find(qn('w:tcW')).set(qn('w:w'),str(width))
        for para in c.paragraphs:
         para.paragraph_format.space_before=Pt(0);para.paragraph_format.space_after=Pt(2);para.paragraph_format.line_spacing=1.05
         for run in para.runs:
          if run.font.size is None:run.font.size=Pt(8.5)
    for shape in doc.inline_shapes:
      shape._inline.docPr.set('descr','Figura de CeroFallas: '+shape._inline.docPr.get('name','diagrama o mockup'))
    # Índice compacto en página propia; no dejar una lista partida.
    for para in doc.paragraphs:
      if para.text=='Contenido':para.paragraph_format.page_break_before=True
      if para.style.name=='Heading 1' and para.text[:1].isdigit():para.paragraph_format.page_break_before=True
      if para.text=='2.3 Integridad y diferencias que deben resolverse':para.paragraph_format.page_break_before=True
    # El índice y sus entradas caben juntos sin duplicar títulos como contenido real.
    ps=doc.paragraphs
    ix=next(i for i,v in enumerate(ps) if v.text=='Contenido')
    for para in ps[ix:ix+9]:para.paragraph_format.keep_with_next=True
    # Pendientes breves, sin una página aislada de cinco viñetas.
    start=next(v._p for v in doc.paragraphs if v.text=='1.5 Supuestos y pendientes')
    end=next(v._p for v in doc.paragraphs if v.text=='2. Modelo de base de datos' and v.style.name=='Heading 1')
    cursor=start.getnext()
    while cursor is not None and cursor is not end:
      nxt=cursor.getnext();cursor.getparent().remove(cursor);cursor=nxt
    pending=doc.add_paragraph('Pendientes: catálogo real de máquinas, validación institucional del checklist y de las frecuencias, histórico predictivo e identidad del técnico de soporte. Las frecuencias son estimadas; los datos demostrativos no representan información de producción. El estudiante asumirá inicialmente la administración.')
    pending._p.getparent().remove(pending._p);start.addnext(pending._p)
    # No presentar el enlace Power BI como enlace público.
    # Sustituir párrafos vacíos de salto por salto antes del siguiente bloque.
    # Evita páginas vacías cuando un bloque anterior llena exactamente la página.
    body=doc._element.body
    for el in list(body):
      if el.tag==qn('w:p') and el.xpath('.//w:br[@w:type="page"]') and not el.xpath('.//w:t'):
       nxt=el.getnext()
       if nxt is not None and nxt.tag==qn('w:p'):
        pr=nxt.find(qn('w:pPr'))
        if pr is None:pr=OxmlElement('w:pPr');nxt.insert(0,pr)
        if pr.find(qn('w:pageBreakBefore')) is None:pr.append(OxmlElement('w:pageBreakBefore'))
        body.remove(el)
       elif nxt is not None and nxt.tag==qn('w:sectPr'):body.remove(el)
    # Los separadores vacíos después de tablas no deben crear páginas en blanco.
    cover_done=False
    for el in list(body):
      if el.tag==qn('w:p') and ''.join(el.xpath('.//w:t/text()'))=='Control del documento':cover_done=True
      if cover_done and el.tag==qn('w:p') and not el.xpath('.//w:t | .//w:drawing | .//w:br | .//w:sectPr'):
       body.remove(el)
