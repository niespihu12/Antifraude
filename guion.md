# Guion de Demostración — BdB Antifraude Demo

**Audiencia:** Dirección de operaciones, fraude, transformación digital y tecnología del Banco de Bogotá  
**Duración estimada:** 25–35 minutos  
**Objetivo:** Demostrar que entendemos el dolor operativo actual y que la solución propuesta — orquestador central + automatización — es real, medible y alineada con su proceso.

---

## Antes de empezar (2 min — fuera de pantalla)

- Tener la simulación **activa** (botón Play verde en el header).
- Velocidad recomendada para la demo: **2x** o **5x** (muestra movimiento sin ir demasiado rápido).
- Cerrar pestañas innecesarias; pantalla completa (F11) si es posible.
- Frase de apertura sugerida:

> *"Hoy no les vamos a mostrar un mockup estático. Les vamos a mostrar cómo se vería el centro de operaciones antifraude del Banco de Bogotá cuando las 700.000 alertas mensuales dejen de depender de 50 personas en 6 sistemas desconectados, y pasen a fluir por un solo orquestador inteligente — en tiempo real."*

---

## 0. Modo Presentación — *El Viaje de una Alerta*

**Cómo abrirlo:** Botón **"Modo Presentación"** en la barra superior derecha (icono de presentación).

> *"Antes de entrar al tablero, queremos contarles la historia completa. No como un diagrama en PowerPoint, sino como el recorrido real que hace una alerta en su operación hoy — y cómo la automatizamos."*

---

### Paso 1 — Recepción de Alertas

**Título en pantalla:** *Recepción de Alertas · Monitor / Franquicias*

**Qué decir:**

> *"Todo empieza aquí. Cada mes ingresan aproximadamente **700.000 alertas transaccionales** al banco. No vienen de un solo lugar: llegan por **Monitor** (motor interno), por **BRM** cuando es Visa, y por **EMS/MS** cuando es Mastercard. Hoy, de esas 700.000, solo entre **20.000 y 30.000** se gestionan de forma operativa. El resto queda sin cobertura automatizada — y eso es exactamente el problema que venimos a resolver."*

**Señalar en pantalla:**
- Acciones: normalización, clasificación de franquicia, encolado al orquestador.
- Sistemas: Monitor, BRM, EMS/MS.
- **Dato importante** (caja cyan): volumen vs. cobertura actual.

**Transición:** *"Siguiente"* →

---

### Paso 2 — Identificación del Cliente

**Título en pantalla:** *Identificación del Cliente · CRM Banco*

**Qué decir:**

> *"La alerta no sirve si no sabemos con quién hablar. En esta fase el bot consulta **CRM Banco**: cruza titular, celular, dispositivo y ubicación. Y aquí está uno de los dolores que más nos mencionaron: si el celular no está actualizado, el caso **escala a monitoreo manual** y se pierde el SLA. No es un fallo del motor de fraude — es un fallo de datos maestros que hoy frena todo el flujo."*

**Señalar en pantalla:**
- Duración típica: ~8 min por alerta (hoy).
- Insight sobre escalamiento por celular desactualizado.

**Transición:** *"Siguiente"* →

---

### Paso 3 — Comunicación con el Cliente

**Título en pantalla:** *Comunicación con el Cliente · Kari AI / WhatsApp*

**Qué decir:**

> *"Aquí cambia el juego. En lugar de llamadas con contactabilidad inferior al 40%, **Kari AI** envía un **mensaje HSM** por WhatsApp — canal que el cliente ya usa todos los días. La plantilla está aprobada, es transaccional, y el bot espera la respuesta: '¿Fue usted quien realizó esta compra?'. Con reintentos automáticos dentro del SLA de **40 minutos**. La contactabilidad por este canal ronda el **70%** — y con la automatización proyectamos superar el **95%**."*

**Señalar en pantalla:**
- Sistemas: Kari AI, WhatsApp Business.
- Reintentos a los 15 minutos si no hay respuesta.

**Transición:** *"Siguiente"* →

---

### Paso 4 — Evaluación y Decisión

**Título en pantalla:** *Evaluación y Decisión · Cardinal / PPE*

**Qué decir:**

> *"Esta es la fase donde se define si hay fraude real o un falso positivo. **Cardinal** valida el score de riesgo en transacciones Visa; **PPE** ejecuta el bloqueo preventivo o definitivo de la tarjeta. Si el cliente confirma la compra → desbloqueo. Si niega → bloqueo definitivo. Y aquí está el dato que más duele operativamente: entre el **70% y el 80%** de las alertas resultan ser **falsos positivos**. Eso significa fricción masiva con clientes legítimos — no solo riesgo de fraude."*

**Señalar en pantalla:**
- Acciones: bloqueo preventivo, desbloqueo, bloqueo definitivo.
- Insight sobre falsos positivos.

**Transición:** *"Siguiente"* →

---

### Paso 5 — Registro y Tipificación

**Título en pantalla:** *Registro y Tipificación · CRM / Bitácora*

**Qué decir:**

> *"Ningún caso se cierra sin dejar huella. Se tipifica en **CRM** (legítima, fraude, sin respuesta) y el **orquestador** guarda trazabilidad completa para auditoría **24/7/365**. La tipificación no es burocracia — es lo que alimenta el tablero que van a ver a continuación. Sin cierre limpio, no hay métricas; sin métricas, no hay mejora continua."*

**Cierre del tour — botón "Comenzar simulación":**

> *"Ahora sí: entremos al centro de operaciones en vivo. La simulación ya está corriendo — van a ver alertas moviéndose solas por el pipeline."*

**Acción:** Clic en **"Comenzar simulación"** (cierra el modal e inicia/continúa la simulación).

---

## 1. Dashboard — Centro de Operaciones

**URL:** [http://localhost:3000/#/dashboard](http://localhost:3000/#/dashboard)

> *"Este es el **centro de operaciones antifraude** del Banco de Bogotá. Una sola pantalla para ver lo que hoy requiere saltar entre Monitor, CRM, Kari, PPE y Excel."*

---

### 1.1 El Viaje de una Alerta (Pipeline horizontal superior)

**Qué señalar:**
- Las **5 fases en vivo**: Recepción → Identificación → Comunicación → Decisión → Registro.
- Los contadores que **suben en tiempo real** (la simulación mueve alertas).
- Los sistemas debajo de cada fase: Monitor/BRM, CRM, Kari AI, Cardinal/PPE.

**Qué decir:**

> *"Arriba ven el corazón del proceso. Cada alerta viaja por estas cinco fases sin intervención humana. Los números que ven no son decorativos: son el estado actual de la cola simulada. Si pausamos la simulación, se detiene; si la aceleramos a 5x o 10x, ven el throughput que podrían alcanzar."*

**Tip demo:** Pausar y reanudar la simulación desde el header para demostrar control.

---

### 1.2 Indicadores Operativos (KPI Cards)

**Qué señalar:**
- **700.000** alertas mensuales.
- **20.000–30.000** gestionadas hoy vs. potencial de **700.000** automatizadas.
- **70–80%** falsos positivos.
- **40 min** tiempo de respuesta promedio.
- **250.000** clientes impactados.
- Sparklines de tendencia en cada tarjeta.

**Qué decir:**

> *"Estos KPIs no salen de un Excel del mes pasado. Se recalculan desde la simulación en vivo — el mismo motor que mueve las alertas en el pipeline. Cuando el proceso esté en producción, estos números serán los que su equipo de fraude mira cada mañana."*

---

### 1.3 Tabla de Alertas + Filtros + Sidebar

**Qué señalar:**
- Tabla con ID, franquicia (VISA / MASTERCARD / MONITOR), monto, estado, tiempo.
- Filtros: Todas, Visa, Mastercard, Monitor, Urgentes, Fraudulentas.
- Barra de búsqueda.
- Sidebar derecha: **donut de distribución por estado** + **actividad reciente** (logs en vivo).

**Qué decir:**

> *"Aquí el analista — o en el futuro, nadie — ve cada alerta con su estado exacto: Pendiente Revisión, En Verificación CRM, WhatsApp Enviado, Esperando Cliente, Bloqueo Preventivo, Desbloqueado, Bloqueo Definitivo, Tipificado. A la derecha, el log de actividad muestra qué pasó segundo a segundo: 'Alerta generada', 'Movida a comunicación', 'Bloqueo preventivo activado'. Trazabilidad total."*

**Tip demo:** Aplicar filtro **"Urgentes"** o **"Fraudulentas"** para mostrar reactividad.

---

### 1.4 Automatización en Acción (Simulación + WhatsApp)

**Qué señalar:**
- Panel izquierdo: secuencia **Detección → Orquestador → Enriquecimiento CRM → WhatsApp HSM → Espera → Decisión → Bloqueo/Desbloqueo → Tipificación**.
- Panel derecho: preview del **mensaje WhatsApp** con Kari AI.

**Qué decir:**

> *"Esto es el 'cómo' detrás del 'qué'. En menos de 2 minutos — objetivo To-Be — el orquestador detecta, enriquece en CRM, envía el HSM, espera respuesta, decide en PPE y tipifica. A la derecha ven exactamente lo que recibe el cliente en su celular. Sin llamada. Sin espera en IVR. Sin token manual."*

---

### 1.5 Impacto Ejecutivo (Before vs After)

**Qué señalar:**
- Columna roja (Actual) vs. columna verde (Automatizado).
- Filas clave: 50 asesores → 0 intervención; 6 plataformas → 1 orquestador; 40 min → <2 min; 20–30K alertas → 700K; 70–80% falsos positivos → <50% con IA; llamadas <40% → WhatsApp ~95%.

**Qué decir:**

> *"Cerramos el dashboard con la pregunta que su comité directivo va a hacer: ¿qué cambia? A la izquierda, su realidad de hoy. A la derecha, el estado objetivo con orquestación. No es una promesa vaga — cada fila es una métrica que podemos medir en el piloto."*

**Transición hacia Pipeline:**

> *"Ahora entremos a la vista que su equipo operativo usaría día a día para gestionar el flujo por sistema."*

---

## 2. Pipeline — Vista Operativa por Sistema

**URL:** [http://localhost:3000/#/pipeline](http://localhost:3000/#/pipeline)

> *"Si el Dashboard es la sala de control, el **Pipeline** es el piso de producción. Aquí vemos las alertas organizadas por el sistema que las está procesando en este momento."*

---

### 2.1 Pipeline de fases (parte superior)

**Qué señalar:**
- Mismo flujo de 5 fases, ahora con **swimlanes** debajo.

**Qué decir:**

> *"Arriba sigue el flujo macro. Abajo, el detalle por plataforma."*

---

### 2.2 Swimlanes por sistema

**Qué señalar:**
- **Monitor** — recepción interna.
- **BRM** — Visa Risk Manager.
- **EMS/MS** — Mastercard.
- **Cardinal** — autenticación Visa.
- **CRM Banco** — identificación y registro.
- **Kari AI** — WhatsApp conversacional.
- **PPE** — bloqueos y desbloqueos.

**Qué decir:**

> *"Hoy su equipo salta entre estas siete herramientas. Mañana, el orquestador es el único punto de entrada y salida — cada sistema se integra por API, y las alertas aparecen en el carril correcto automáticamente. Ven las tarjetas moviéndose: cada una es una alerta real con monto, cliente, franquicia y tiempo en fase."*

---

### 2.3 Tarjetas vs. Lista + Filtros

**Qué señalar:**
- Toggle **Tarjetas / Lista**.
- Borde superior de color por franquicia (azul Visa, rojo Mastercard, gris Monitor).
- Filtros globales (Visa, Mastercard, Monitor, Urgentes, Fraudulentas).

**Qué decir:**

> *"El supervisor puede ver en tarjetas — visual, rápido — o en lista para exportar y auditar. El color del borde identifica la franquicia al instante. Si mañana hay un pico de alertas Visa por BRM, filtran y ven solo ese carril."*

**Transición:**

> *"Cada carril depende de que el sistema detrás esté arriba. Veamos eso."*

---

## 3. Sistemas — Salud de la Plataforma

**URL:** [http://localhost:3000/#/sistemas](http://localhost:3000/#/sistemas)

> *"Un orquestador central solo funciona si los sistemas periféricos responden. Esta vista es el **monitor de salud** de toda la arquitectura antifraude."*

---

### 3.1 Tabs de sistemas

**Qué señalar:**
- Tabs: Monitor | BRM | EMS/MS | Cardinal | CRM Banco | Kari AI | PPE.
- Indicador **Online / Offline** (uno rota como offline cada ~30 seg para simular incidentes).

**Qué decir:**

> *"En producción, su equipo de operaciones sabría en segundos si BRM está lento, si CRM no responde o si Kari AI tiene degradación. Hoy descubren eso cuando las alertas se acumulan — aquí lo ven antes de que impacte al cliente."*

---

### 3.2 Detalle del sistema seleccionado

**Qué señalar:**
- Volumen mensual del sistema (ej. Monitor ~320K alertas/mes, BRM ~210K).
- Barra de carga / utilización.
- Últimas 5 alertas procesadas por ese sistema.
- Mensaje de **"Sistema temporalmente no disponible"** cuando está Offline.

**Qué decir:**

> *"Cada tab muestra cuántas alertas procesó hoy, el tiempo promedio y las últimas transacciones. Si un sistema cae, el orquestador puede redirigir, reintentar o escalar — no dejar 200.000 alertas en limbo. Esto es observabilidad de clase enterprise aplicada a fraude transaccional."*

**Transición:**

> *"Operación y sistemas los vemos en tiempo real. Ahora subamos al nivel que le importa a la gerencia: números, tendencias y cuellos de botella."*

---

## 4. Métricas — Análisis y Proyección To-Be

**URL:** [http://localhost:3000/#/metricas](http://localhost:3000/#/metricas)

> *"Esta es la vista del **comité de transformación**: dónde estamos, hacia dónde vamos, y cuánto nos cuesta cada minuto de retraso."*

---

### 4.1 Tarjetas Before/After (superior)

**Qué señalar:**
- Tiempo ciclo: **40 min → <2 min**.
- Falsos positivos: **75% → ~45%** (valor dinámico según simulación).
- Throughput: **30.000 → 360.000** alertas/hora.
- Ciclo crítico: **3.4 días → 10 seg**.

**Qué decir:**

> *"Cuatro números que resumen el negocio. Hoy un caso puede tardar días en cerrarse; con orquestación, el ciclo crítico baja a segundos. El throughput pasa de gestionar miles a procesar el volumen completo."*

---

### 4.2 Volumetría y Analytics (gráficos)

**Qué señalar:**
- **Alertas por Franquicia** (barras: Monitor, BRM, EMS/MS, Cardinal).
- **Distribución de Estados** (donut con 8 estados operativos).
- **Tendencia Mensual** (recibidas vs. gestionadas — brecha visible).
- **Before vs After** (radar: cobertura, velocidad, precisión, trazabilidad, escalabilidad, costo).

**Qué decir:**

> *"El gráfico de tendencia muestra la brecha que ustedes conocen: 700.000 recibidas, pero solo una fracción gestionada. El radar 'Before vs After' cuantifica el salto en cobertura y trazabilidad — no es solo eficiencia, es **visibilidad** que hoy no existe."*

---

### 4.3 Cuellos de botella + Razones de bloqueo

**Qué señalar:**
- Mapa de calor: Recepción (82%), Identificación CRM (76%), Comunicación (94%), Decisión (68%), Registro (55%) — barras rojas "Actual" vs. cyan "To-Be".
- Razones de bloqueo: monto inusual, ubicación atípica, comercio riesgoso, etc.

**Qué decir:**

> *"Comunicación con el cliente es el cuello más presionado — 94% de presión operativa actual. Ahí es donde WhatsApp y Kari AI más impactan. Las razones de bloqueo les permiten negociar con franquicias y ajustar reglas con datos, no con intuición."*

**Transición:**

> *"Hasta aquí vimos el 'cómo se opera'. La última vista es el 'cómo está modelado' — la ontología del dominio que gobierna todo el sistema."*

---

## 5. Ontología — Modelo del Dominio

**URL:** [http://localhost:3000/#/ontologia](http://localhost:3000/#/ontologia)

> *"Esta sección es la prueba de que no vendemos una caja negra. Documentamos **cada entidad, cada relación, cada regla y cada estado** del proceso antifraude del Banco de Bogotá — el mismo lenguaje que su equipo de arquitectura y fraude usa."*

---

### 5.1 Tab Entidades

**Qué señalar:**
- AlertaTransaccional, Cliente, TarjetaCredito, Transaccion, MensajeHSM, BloqueoTemporal, ReglaNegocio, Orquestador.

**Qué decir:**

> *"Estas son las ocho entidades del dominio. No inventamos conceptos genéricos: son los objetos que su operación ya maneja, con atributos como franquicia, monto, estado, celular, respuesta HSM. Esto es la base para integrar APIs con CRM, PPE y las franquicias."*

---

### 5.2 Tab Relaciones

**Qué señalar:**
- Diagrama jerárquico SVG: AlertaTransaccional en el centro, relaciones con cardinalidad (1:N, 1:1, N:M).

**Qué decir:**

> *"Aquí ven cómo se conecta todo: el cliente posee la tarjeta, la transacción dispara la alerta, la alerta genera el mensaje WhatsApp, PPE ejecuta el bloqueo, las reglas de negocio evalúan cada caso. Esto es el mapa que el equipo de integración necesita para no romper nada en producción."*

---

### 5.3 Tab Taxonomías

**Qué señalar:**
- Franquicias: VISA (~45%), MASTERCARD (~40%), MONITOR (~15%).
- Tipos de validación: Identificación, Comunicación, Riesgo, Bloqueo, Operativas.
- Áreas del proceso con roles, sistemas y duración.

**Qué decir:**

> *"Clasificamos el volumen como ustedes lo viven: por franquicia, por tipo de validación y por área operativa. Cuando diseñamos reglas o SLAs, partimos de esta taxonomía — no de suposiciones."*

---

### 5.4 Tab Máquina de Estados

**Qué señalar:**
- Diagrama con 8 estados y bandas por fase (Recepción, Identificación, Comunicación, Decisión, Registro).
- Transiciones etiquetadas: "sí fui yo", "no fui yo", "sin respuesta", "sin celular".

**Qué decir:**

> *"Cada alerta tiene un ciclo de vida formal. No hay estados ambiguos: o está esperando al cliente, o está bloqueada preventivamente, o ya fue tipificada. Esto es lo que permite auditar, reportar y cumplir regulación sin preguntar '¿en qué quedó ese caso?'"*

---

### 5.5 Tab Reglas de Negocio

**Qué señalar:**
- Tabla con 12 reglas: celular CRM, bloqueo preventivo, confirmación cliente, SLA 40 min, tipificación obligatoria, etc.
- Severidad: Bloqueante, Advertencia, Operativa.

**Qué decir:**

> *"Estas no son reglas genéricas de un vendor. Son las reglas de su proceso: si no hay celular, escalar; si el cliente niega, bloqueo definitivo; si no responde en 40 minutos, mantener bloqueo preventivo. Cada una es configurable y auditable."*

---

### 5.6 Tab Glosario

**Qué señalar:**
- Términos: HSM, PPE, BRM, EMS/MS, Kari AI, Orquestador, Falso positivo, Tipificación, SLA.

**Qué decir:**

> *"Cerramos con un lenguaje común. Cuando hablamos de HSM, PPE o BRM, todos en la sala — negocio y tecnología — entienden lo mismo."*

---

## Cierre — Mensaje final (2 min)

> *"En resumen: entendemos que el Banco de Bogotá recibe **700.000 alertas al mes**, que hoy solo gestiona una fracción con **50 personas** en **6 sistemas**, que el **70–80% son falsos positivos** que frustan clientes legítimos, y que el canal de **WhatsApp con Kari AI** es la palanca para contactabilidad y SLA.*
>
> *Lo que vieron no es un concepto. Es el modelo operativo, técnico y de métricas de cómo se vería el **centro de operaciones antifraude automatizado** — con orquestador central, trazabilidad 24/7 y visibilidad para operación, tecnología y gerencia.*
>
> *El siguiente paso natural es definir el piloto: qué franquicia, qué volumen y qué integraciones (CRM, PPE, Kari) entran primero. Nosotros ya tenemos el mapa. Ustedes tienen el proceso. Juntos cerramos la brecha."*

---

## Referencia rápida — Controles durante la demo

| Control | Ubicación | Uso |
|---------|-----------|-----|
| Play / Pause | Header derecho | Pausar para explicar; reanudar para impacto |
| Stop | Header | Reiniciar tick si hace falta |
| Velocidad 1x–10x | Header | 2x–5x recomendado para demo |
| Modo Presentación | Header | Abrir tour de 5 pasos |
| Filtros globales | Dashboard / Pipeline | Visa, Mastercard, Urgentes, Fraudulentas |
| ESC | Teclado | Cerrar modo presentación |

---

## Datos clave del proceso (memorizar)

| Métrica | Valor actual | Objetivo To-Be |
|---------|--------------|----------------|
| Alertas mensuales | ~700.000 | 100% gestionadas |
| Alertas gestionadas/mes | 20.000–30.000 | 700.000 |
| Personal operativo | ~50 asesores 24/7 | 0 intervención humana |
| Falsos positivos | 70–80% | <50% con IA |
| Tiempo respuesta | ~40 min | <2 min |
| Contactabilidad | Llamadas <40% | WhatsApp ~95% |
| Clientes impactados | ~250.000 | — |
| Operación | 24/7/365 | 24/7/365 automatizado |

---

*Documento preparado para demo BdB Antifraude — Américas SIM*
