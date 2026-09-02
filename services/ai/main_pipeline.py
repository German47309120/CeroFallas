"""
Master Pipeline Runner - CeroFallas AI
Ejecuta de punta a punta todo el flujo de Mantenimiento Predictivo:
ETL -> Limpieza -> Feature Engineering -> Entrenamiento ML -> Evaluación de Costos -> Despliegue Power BI
"""
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import time
from CeroFallasAI.etl.extractor import CeroFallasExtractor
from CeroFallasAI.etl.data_cleaner import CeroFallasCleaner
from CeroFallasAI.features.feature_engineering import FeatureEngineer
from CeroFallasAI.models.train_models import ModelTrainer
from CeroFallasAI.evaluation.cost_sensitive import CostSensitiveEvaluator
from CeroFallasAI.pipeline.predict_and_sync import RiskPredictorAndSync

def ejecutar_pipeline_completo():
    print("=" * 70)
    print(">> INICIANDO PIPELINE MAESTRO: CEROFALLAS AI (MANTENIMIENTO PREDICTIVO)")
    print("=" * 70)
    inicio = time.time()

    # 1. Extracción de Datos
    print("\n[PASO 1/6] Extrayendo datos transaccionales...")
    extractor = CeroFallasExtractor()
    extractor.extraer_todos_los_datos()

    # 2. Limpieza y Métricas de Confiabilidad
    print("\n[PASO 2/6] Limpiando datos y calculando MTBF / MTTR / Disponibilidad...")
    cleaner = CeroFallasCleaner()
    df_corr = cleaner.procesar_correctivos()
    cleaner.procesar_preventivos()
    cleaner.calcular_metricas_confiabilidad(df_corr)

    # 3. Feature Engineering
    print("\n[PASO 3/6] Generando variables predictoras y dataset analítico temporal...")
    fe = FeatureEngineer()
    fe.construir_panel_temporal()

    # 4. Entrenamiento y Validación Cruzada de Modelos
    print("\n[PASO 4/6] Entrenando y comparando modelos con Time-Series CV...")
    trainer = ModelTrainer()
    trainer.entrenar_y_comparar()

    # 5. Evaluación Costo-Sensible e Impacto en Negocio
    print("\n[PASO 5/6] Evaluando matriz de costos y retorno de inversión...")
    evaluator = CostSensitiveEvaluator()
    evaluator.evaluar_politicas_mantenimiento()

    # 6. Inferencia y Sincronización
    print("\n[PASO 6/6] Calculando scores de riesgo y exportando para Power BI...")
    sync = RiskPredictorAndSync()
    sync.ejecutar_inferencia_y_sincronizar()

    duracion = round(time.time() - inicio, 2)
    print("\n" + "=" * 70)
    print(f">> PIPELINE COMPLETADO CON EXITO EN {duracion} SEGUNDOS")
    print("=" * 70)

if __name__ == "__main__":
    ejecutar_pipeline_completo()
