# Laboratorio predictivo de CeroFallas

Este directorio prepara una comparación reproducible sin afirmar que existe un modelo productivo. Los datos demo se generan sintéticamente y las salidas permanecen en `.local/`, ignorado por Git.

```powershell
npm run predictive:test
npm run predictive:demo
```

La variable objetivo es `failure_next_30d`: indica si ocurre una falla en los 30 días posteriores a la fecha de corte. Todas las variables deben calcularse usando solo información disponible hasta ese corte para impedir fuga de información futura.

La división es temporal: 80 % de fechas antiguas para entrenamiento y 20 % reciente para prueba. Se comparan regresión logística y Random Forest, seleccionando solo para demostración por PR-AUC. Antes de usar información real se deben acordar definiciones, extracción histórica, calidad, anonimización, aprobación gerencial y un mínimo de eventos positivos suficiente.

No se guarda un modelo entrenado con datos sintéticos porque podría confundirse con un artefacto válido. El resultado JSON incluye la advertencia `demonstration_only`.
