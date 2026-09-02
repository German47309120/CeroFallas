"""
Configuración Global del Módulo de Mantenimiento Predictivo (CeroFallas AI)
Proyecto de Graduación 2 - Universidad
"""
import os
from pathlib import Path

# Rutas Base del Módulo
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "saved_models"
REPORTS_DIR = BASE_DIR / "reports"
DOCS_DIR = BASE_DIR / "docs"

# Crear directorios si no existen
for directory in [DATA_DIR, MODELS_DIR, REPORTS_DIR, DOCS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Configuración de Firebase Realtime Database.
# Nunca registrar credenciales reales en Git. Configurarlas en un archivo .env local
# o en el gestor de secretos del ambiente de despliegue.
FIREBASE_CONFIG = {
    "apiKey": os.getenv("FIREBASE_API_KEY", ""),
    "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN", ""),
    "databaseURL": os.getenv("FIREBASE_DATABASE_URL", ""),
    "projectId": os.getenv("FIREBASE_PROJECT_ID", ""),
    "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET", ""),
}

FIREBASE_NODES = {
    "correctivos": ["TIMEL1", "TIMEL2", "TIMEL3", "TIMEL4", "ABAST_CORR", "CORR_AUTO"],
    "preventivos": ["PREVL1", "PREVL2", "PREVL3", "PREVL4", "ABAST_PREV", "PREVEN_AUTO"],
    "rutinas": ["RUTAL1", "RUTAL2", "RUTAL3", "RUTAL4"],
    "checklists": ["CHECKLIST_AUTO"]
}

# Estandarización de Equipos y Máquinas
EQUIPOS_CANONICOS = [
    "BATIDORA",
    "SILO",
    "SUPERMIX",
    "EXEL",
    "PRENSA",
    "FILTRACION",
    "ENVASADORA",
    "COMPRESOR",
    "SISTEMA_HIDRAULICO",
    "BOMBA_ABASTECIMIENTO"
]

# Parámetros del Modelo Predictivo
HORIZONTE_PREDICCION_DIAS = 7  # Ventana objetivo Y: Falla en los próximos 7 días
VENTANAS_ROLLING_DIAS = [7, 15, 30, 60]  # Ventanas móviles para extracción de features
RANDOM_STATE = 42

# Umbrales del Semáforo de Riesgo
UMBRAL_RIESGO_BAJO = 0.30     # < 30%: Verde (Operación Normal)
UMBRAL_RIESGO_MEDIO = 0.70    # 30% a 70%: Amarillo (Monitoreo Preventivo)
# >= 70%: Rojo (Alerta Crítica / Mantenimiento Inminente)

# Ponderación Económica para Evaluación Costo-Sensible (USD o Unidades Monetarias)
COSTO_FALSO_POSITIVO = 25.0    # Costo de inspección preventiva sin falla (1 hora técnico)
COSTO_FALSO_NEGATIVO = 850.0   # Costo promedio de paro intempestivo (horas de línea + merma)
COSTO_VERDADERO_POSITIVO = 75.0 # Costo de reparación preventiva programada anticipada
COSTO_VERDADERO_NEGATIVO = 0.0  # Sin intervención requerida

# Exportación para Integración
POWERBI_EXPORT_CSV = DATA_DIR / "powerbi_mantenimiento_predictivo.csv"
DATASET_ANALITICO_CSV = DATA_DIR / "dataset_predictivo_mantenimiento.csv"
