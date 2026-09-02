# PROPUESTA TÉCNICA Y METODOLÓGICA DE PROYECTO DE GRADUACIÓN 2

**Para:** Ing. Mario Aceituno – Asesor / Revisor de Proyecto de Graduación  
**De:** Estudiante de Ingeniería – Proyecto CeroFallas  
**Fecha:** 31 de agosto de 2026  
**Proyecto:** *Ecosistema CeroFallas: Sistema Inteligente de Soporte a Decisiones para la Confiabilidad Operacional y Mantenimiento Predictivo mediante Aprendizaje Automático en Líneas de Producción*

---

## 1. Justificación y Planteamiento del Problema

### 1.1. Contexto Operativo y Limitaciones del Esquema Tradicional
En el entorno industrial moderno, la gestión del mantenimiento suele limitarse a dos enfoques tradicionales:
1. **Mantenimiento Correctivo (Reactivo):** Se interviene la maquinaria únicamente después de ocurrida la falla, lo que ocasiona paros imprevistos de línea, pérdidas en volumen de producción, costos elevados de reparación de emergencia y desabastecimiento en la cadena de valor.
2. **Mantenimiento Preventivo (Basado en Tiempo o Calendario):** Se ejecutan revisiones e intercambios de componentes a intervalos fijos. Aunque reduce fallas catastróficas, con frecuencia genera intervenciones innecesarias en componentes en buen estado o paros preventivos que no logran anticipar fallas aleatorias o aceleradas por fatiga y condiciones operativas del turno.

### 1.2. Transición de un Sistema Transaccional a un Sistema de Soporte a Decisiones (DSS)
La primera fase del proyecto **CeroFallas** desarrolló la infraestructura web y móvil para la captura fidedigna y centralizada de tiempos de paro, turnos y mantenimientos correctivos/preventivos por línea (`Línea 1` a `Línea 4`) y por equipo (`Batidoras`, `Silos`, `Supermix`, `Prensas`, `Filtración`, etc.).

Atendiendo a la retroalimentación sobre la necesidad de profundizar el alcance ingenieril del proyecto, se incorpora el **Módulo de Mantenimiento Predictivo (CeroFallas AI)**. Con esto, el sistema deja de ser un mero repositorio de digitalización de registros para convertirse en un **Sistema Ciber-Físico de Inteligencia Operacional**, capaz de:
* Analizar los patrones temporales de degradación y frecuencia de fallas.
* Estimar con rigor probabilístico el **Índice de Riesgo de Falla ($Risk\ Score \in [0, 100\%]$)** en un horizonte temporal de 7 días.
* Proveer alertas tempranas y recomendaciones prescriptivas integradas con tableros ejecutivos en Power BI y la plataforma web.

---

## 2. Objetivos del Proyecto Reestructurado

### 2.1. Objetivo General
Diseñar e implementar un módulo analítico de mantenimiento predictivo basado en algoritmos de aprendizaje automático (Machine Learning) integrado al ecosistema CeroFallas, para anticipar fallas críticas en equipos industriales y optimizar la toma de decisiones en la planeación del mantenimiento.

### 2.2. Objetivos Específicos
1. **Pipeline de Datos (ETL):** Extraer y estructurar el histórico transaccional de mantenimientos correctivos y preventivos desde Firebase Realtime Database hacia un dataset analítico formal.
2. **Ingeniería de Características:** Modelar variables dinámicas de confiabilidad ($MTBF$, $MTTR$, días acumulados desde el último preventivo, tasas móviles de falla a 7, 15, 30 y 60 días, y ponderación por turno operativo).
3. **Modelado Comparativo:** Entrenar, validar y comparar un modelo de línea base interpretable (*Regresión Logística con regularización*) frente a un modelo de ensamble no lineal (*Random Forest Classifier*), utilizando validación cruzada temporal (*TimeSeriesSplit*) para evitar fuga de información (*data leakage*).
4. **Evaluación Costo-Sensible:** Cuantificar el impacto del modelo mediante métricas orientadas al negocio ($Recall$, $F_2\text{-Score}$ y Matriz de Costos Industriales), priorizando la minimización de Falsos Negativos (fallas no detectadas).
5. **Despliegue y Validación Operativa:** Automatizar la ejecución periódica del modelo y sincronizar los índices de riesgo y alertas tempranas con Firebase y tableros gerenciales en Power BI, validando su desempeño en paralelo al proceso operativo actual.

---

## 3. Marco Metodológico (CRISP-DM)

El desarrollo del módulo se rige bajo el estándar internacional **CRISP-DM** (*Cross-Industry Standard Process for Data Mining*):

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│ 1. Comprensión del      │ ──> │ 2. Comprensión de       │ ──> │ 3. Preparación de       │
│    Negocio / Operación  │     │    los Datos (Firebase) │     │    Datos & Features     │
└─────────────────────────┘     └─────────────────────────┘     └────────────┬────────────┘
                                                                             │
┌─────────────────────────┐     ┌─────────────────────────┐                  │
│ 6. Despliegue & MLOps   │ <── │ 5. Evaluación Costo-    │ <────────────────┘
│ (Power BI / Firebase)   │     │    Sensible (F2-Score)  │     ┌─────────────────────────┐
└─────────────────────────┘     └─────────────────────────┘ <── │ 4. Modelado Matemático  │
                                                                │    (LogReg vs RF)       │
                                                                └─────────────────────────┘
```

### 3.1. Fase I: Extracción y Consolidación de Datos
Se integran los nodos transaccionales de Firebase:
* Registros de correctivos: `TIMEL1`, `TIMEL2`, `TIMEL3`, `TIMEL4`.
* Registros de preventivos: `PREVL1`, `PREVL2`, `PREVL3`, `PREVL4`.
* Rutinas operativas y checklists: `RUTAS` y `CHECKLIST_AUTO`.

### 3.2. Fase II: Ingeniería de Características (Feature Engineering)
Para cada equipo $i$ en el instante temporal $t$, se calculan las siguientes variables predictoras:
* **Tiempo desde última intervención preventiva:** $\Delta t_{prev} = t - t_{último\_prev}$
* **Tiempo desde última falla correctiva:** $\Delta t_{corr} = t - t_{última\_falla}$
* **Ventanas móviles de frecuencia:** Conteo de fallas en $[t-7d, t]$, $[t-15d, t]$, $[t-30d, t]$ y $[t-60d, t]$.
* **Severidad acumulada:** Minutos totales de paro de línea en los últimos 30 días.
* **Factor de turno:** Distribución de carga y fallas en Turno 1 vs Turno 2.
* **Variable Objetivo ($Y$):**
  $$Y_{i, t} = \begin{cases} 1 & \text{si el equipo } i \text{ presenta una falla en el intervalo } [t, t + 7\text{ días}] \\ 0 & \text{en caso contrario} \end{cases}$$

### 3.3. Fase III: Modelado y Validación Científica
Se implementan y comparan dos familias de algoritmos:
1. **Regresión Logística:**
   $$P(Y=1|X) = \frac{1}{1 + e^{-(\beta_0 + \beta_1 X_1 + \dots + \beta_k X_k)}}$$
   *Función:* Proporcionar explicabilidad directa a través de los coeficientes $\beta$ (Odds Ratios).
2. **Random Forest Classifier:**
   Ensamble de árboles de decisión con remuestreo (*bagging*) y selección aleatoria de características para capturar relaciones no lineales complejas entre el desgaste y las condiciones operativas.
3. **Esquema de Validación:** Validación cruzada en series temporales (*Time Series Split*) para garantizar que el modelo solo use información del pasado para predecir el futuro.

### 3.4. Fase IV: Evaluación Costo-Sensible (Cost-Sensitive Matrix)
En la operación real de planta:
* **Costo de Falso Positivo ($C_{FP}$):** Inspección técnica de rutina sin encontrar avería grave (Costo estimado: Bajo $\sim \$15 - \$30$ USD en HH de técnico).
* **Costo de Falso Negativo ($C_{FN}$):** Falla imprevista en plena producción que detiene la línea completa (Costo estimado: Crítico $\sim \$500 - \$2,000+$ USD en horas de paro y mermas).

Por lo tanto, la función de optimización no busca únicamente *Accuracy* (Exactitud simple), sino maximizar el **Recall** y el **$F_2\text{-Score}$**:
$$F_2 = (1 + 2^2) \frac{\text{Precision} \times \text{Recall}}{(2^2 \times \text{Precision}) + \text{Recall}} = 5 \cdot \frac{\text{Precision} \times \text{Recall}}{4 \cdot \text{Precision} + \text{Recall}}$$

---

## 4. Arquitectura de Despliegue y MLOps

1. **Ejecución Programada (Batch):** Un proceso automatizado en Python ejecuta la inferencia diaria, evaluando el estado actualizado de todos los equipos.
2. **Publicación de Resultados:** Los puntajes de riesgo se escriben automáticamente en el nodo `/PREDICCIONES_RIESGO/` de Firebase Realtime Database.
3. **Visualización y Toma de Decisiones:**
   * **Nivel Operativo:** Semáforo de riesgo en la aplicación web CeroFallas (`Verde: Riesgo < 30%`, `Amarillo: Riesgo 30%-70%`, `Rojo: Riesgo > 70%`).
   * **Nivel Gerencial:** Tablero interactivo en Power BI con curvas de tendencia de fallas, confiabilidad esperada y programación preventiva sugerida.

---

## 5. Cronograma y Entregables de Proyecto 2

| Semana | Fase / Entregable | Estado |
| :---: | :--- | :---: |
| **S1-S2** | Consolidación del dataset analítico y pipeline ETL de Firebase. | ⚙️ En ejecución |
| **S3-S4** | Ingeniería de variables dinámicas ($MTBF$, $MTTR$, ventanas móviles). | 📅 Programado |
| **S5-S6** | Entrenamiento de modelos, optimización de hiperparámetros y validación temporal. | 📅 Programado |
| **S7-S8** | Análisis costo-sensible, integración con Power BI y validación en paralelo. | 📅 Programado |
| **S9-S10**| Redacción final de la memoria de tesis, pruebas operativas y defensa. | 📅 Programado |

---

## 6. Conclusión
Esta propuesta eleva sustancialmente la envergadura técnica del proyecto de graduación, integrando ciencia de datos, ingeniería de confiabilidad y desarrollo de software moderno en una solución integral que aporta valor tangible a la gestión industrial.
