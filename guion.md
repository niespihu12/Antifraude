# Guion Comercial de Demostración — Centro de Operaciones Antifraude

**Audiencia:** Dirección de operaciones, fraude, transformación digital, riesgo y tecnología del banco
**Duración estimada:** 30–40 minutos
**Objetivo comercial:** Que la sala salga convencida de tres cosas: (1) entendemos su dolor operativo y financiero; (2) la solución — orquestador central + agentes digitales — es real, regida por sus reglas de negocio y medible; (3) el siguiente paso es un piloto acotado, no un proyecto de dos años.

**Propuesta de valor en una frase (repetir al inicio y al cierre):**

> *"Convertimos las 700.000 alertas mensuales que hoy no alcanzan a gestionarse, en un flujo automático, trazable y medible, donde los robots hacen el trabajo repetitivo y las personas solo deciden lo que la política del banco reserva para personas."*

---

## Arco narrativo de la demo (memorizar)

Toda la demo sigue el mismo ritmo comercial, sección por sección:

1. **Dolor** — qué cuesta hoy (dinero, riesgo, cliente).
2. **Solución** — qué hace el orquestador y sus agentes.
3. **Evidencia en pantalla** — lo ven funcionando, no un PowerPoint.
4. **Número** — la métrica que cierra el argumento.

**Los cinco pilares de valor** (volver a ellos una y otra vez):

| Pilar | Mensaje | Número ancla |
|-------|---------|--------------|
| **Cobertura** | Del 4% al 100% del volumen mensual | 20–30K → 700K alertas/mes |
| **Velocidad** | SLA medible en minutos, no en días | 40 min → <2 min |
| **Experiencia de cliente** | Menos fricción por falsos positivos | 70–80% → <50% con aprendizaje |
| **Trazabilidad** | Auditoría 24/7 sin trabajo manual | Cada acción con regla y sello |
| **Control humano** | La persona decide solo donde la política lo exige | 0 intervención en pasos repetitivos |

---

## Antes de empezar (2 min — fuera de pantalla)

- Tener la simulación **activa** (botón Play verde en el header).
- Velocidad recomendada: **1x–2x** para la pestaña **Agentes** (hay que narrar mientras se ven los clics); **5x–10x** para Dashboard/Métricas cuando se quiera mostrar throughput.
- Cerrar pestañas innecesarias; pantalla completa (F11 o tecla **F** dentro de Agentes).
- Tener preparado el **Director de escena** (icono de claqueta en la pestaña Agentes): es la herramienta que convierte la demo de "bonita" en "contada a la medida".
- Frase de apertura sugerida:

> *"Hoy no les vamos a mostrar un mockup ni una arquitectura en PowerPoint. Les vamos a mostrar el centro de operaciones antifraude funcionando: cinco agentes digitales trabajando en los sistemas que ustedes usan hoy — Monitor, BRM, EMS/MS, CRM, PPE — siguiendo las reglas de su propia operación, alerta por alerta, en tiempo real."*

---

## Agenda (decirla en voz alta, 30 segundos)

> *"Vamos a recorrer cinco cosas. Primero, **el viaje de una alerta**: la historia completa de punta a punta. Segundo —y es el corazón de la demo— **el equipo de agentes**: los verán sentados en sus estaciones operando los sistemas reales, con su pantalla, su cursor y su bitácora. Tercero, el **centro de operaciones y sus métricas**: los números que su comité vería cada mañana. Cuarto, la **salud de los sistemas** y el modelo del dominio, porque no vendemos una caja negra. Y cerramos con el **antes y el después**, en cifres."*

---

## 0. Modo Presentación — *El Viaje de una Alerta*

**Cómo abrirlo:** Botón **"Modo Presentación"** en la barra superior derecha.

> *"Antes de ver la operación, contemos la historia. No como diagrama: como el recorrido real que hace una alerta hoy, y lo que cambia cuando el orquestador la toma."*

---

### Paso 1 — Recepción de Alertas

**Título en pantalla:** *Recepción de Alertas · Monitor / Franquicias*

**Qué decir:**

> *"Todo empieza aquí. Cada mes ingresan al banco cerca de **700.000 alertas transaccionales**, y no por una sola puerta: llegan por **Monitor** (motor interno), por **BRM** cuando es Visa y por **EMS/MS** cuando es Mastercard. Hoy, de esas 700.000, solo entre **20.000 y 30.000** se gestionan operativamente. Lean ese número otra vez: estamos dejando pasar el 96% del volumen — y cada alerta sin gestionar es dinero expuesto y un riesgo regulatorio. Ese es el problema que venimos a cerrar."*

**Señalar en pantalla:**
- Acciones: normalización, clasificación de franquicia, encolado al orquestador.
- Sistemas: Monitor, BRM, EMS/MS.
- **Dato importante** (caja cyan): volumen vs. cobertura actual.

**Transición:** *"Siguiente"* →

---

### Paso 2 — Identificación del Cliente

**Título en pantalla:** *Identificación del Cliente · CRM Banco*

**Qué decir:**

> *"Una alerta sin titular identificado es un caso que no se puede cerrar. En esta fase el agente consulta **CRM Banco**: titular, celular vigente, dispositivo, ubicación. Y aquí está uno de los dolores que más nos repitieron en las conversaciones: si el celular no está actualizado, el caso **escala a monitoreo manual y se pierde el SLA**. No es un fallo del motor de fraude — es un dato maestro que hoy frena todo el flujo y le paga horas-hombre al banco por tarea que un robot hace en segundos."*

**Señalar en pantalla:**
- Duración típica hoy: ~8 minutos por alerta en esta fase.
- Insight sobre escalamiento por celular desactualizado.

**Transición:** *"Siguiente"* →

---

### Paso 3 — Comunicación con el Cliente

**Título en pantalla:** *Comunicación con el Cliente · Kari AI / WhatsApp*

**Qué decir:**

> *"Aquí cambia el juego — y es donde más dinero se mueve. Hoy la contactabilidad por llamada es menor al 40%: se llaman, no contestan, se cuelga, se repite. **Kari AI** envía un **mensaje HSM transaccional aprobado** por WhatsApp, el canal que el cliente ya usa todos los días, y espera la respuesta: *'¿Fue usted quien realizó esta compra?'* — con reintento automático a los 15 minutos y un SLA de 40. La contactabilidad por este canal ronda el **70%**, y con automatización proyectamos superar el **95%**. Traducción comercial: más casos cerrados en el primer contacto, menos llamadas salientes, menos costo por alerta."*

**Señalar en pantalla:**
- Sistemas: Kari AI, WhatsApp Business.
- Reintentos a los 15 minutos si no hay respuesta.

**Transición:** *"Siguiente"* →

---

### Paso 4 — Evaluación y Decisión

**Título en pantalla:** *Evaluación y Decisión · Cardinal / PPE*

**Qué decir:**

> *"Aquí se decide si hay fraude real o un falso positivo. **Cardinal** valida el score de riesgo en Visa; **PPE** ejecuta el bloqueo preventivo o definitivo de la tarjeta. ¿El cliente confirma? Se libera. ¿Niega? Bloqueo definitivo, irreversible, con confirmación humana donde la política lo exige. Y el dato que más duele: entre el **70% y el 80%** de las alertas son **falsos positivos**. Cada falso positivo es un cliente legítimo con la tarjeta bloqueada en un punto de venta — fricción, quejas, riesgo de fuga. Reducir ese porcentaje es un proyecto de retención, no solo de fraude."*

**Señalar en pantalla:**
- Acciones: bloqueo preventivo, desbloqueo, bloqueo definitivo.
- Insight sobre falsos positivos como problema de experiencia de cliente.

**Transición:** *"Siguiente"* →

---

### Paso 5 — Registro y Tipificación

**Título en pantalla:** *Registro y Tipificación · CRM / Bitácora*

**Qué decir:**

> *"Ningún caso se cierra sin dejar huella: se tipifica en **CRM** — legítima, fraude o sin respuesta — y el orquestador conserva la trazabilidad completa para auditoría **24/7/365**. La tipificación no es burocracia: es el combustible del aprendizaje. Sin cierre limpio no hay métricas confiables; sin métricas, la gerencia decide a ciegas y las franquicias no se pueden negociar con datos."*

**Cierre del tour — botón "Comenzar simulación":**

> *"Esa fue la historia. Ahora véanla trabajar: entremos al piso de operaciones, donde cinco agentes digitales están ejecutando exactamente este proceso, alerta por alerta."*

**Acción:** Clic en **"Comenzar simulación"**.

---

## 1. Agentes — El Equipo que Trabaja Solo

**URL:** [http://localhost:3000/#/agentes](http://localhost:3000/#/agentes)

> *"Esta es la sección más importante de la demo, y quiero que la miren con ojos de operación. Esto no es un diagrama del proceso: es el proceso **ocurriendo**. Cinco agentes digitales — Recepción, Identificación, Comunicación, Decisión y Registro — cada uno especialista en su fase, trabajando dentro de las pantallas reales de sus sistemas: se ve la ventana, se ve el cursor moverse, se ve el dato tecleado. Y todo lo que hacen obedece una regla de negocio del banco, con código y nombre — R01, R02, R06… Eso significa dos cosas: nada es caja negra, y cualquier acción es auditable en auditoría o ante la franquicia."*

**Concepto clave para la sala:** esto es *digital workforce* aplicado a fraude: la misma fuerza de trabajo de 50 personas 24/7, ejecutando sin fatiga, sin rotación de personal y sin variabilidad.

---

### 1.1 La cinta y la cola — el pulso de la operación

**Qué señalar:**
- La **cinta superior**: los 5 agentes con el caso que cada uno tiene en mano y su avance.
- Los **KPIs**: agentes activos, en cola, esperando humano, expedientes cerrados, fraudes bloqueados, **acciones documentadas** (sube en tiempo real: cada clic cuenta).
- La **cola de alertas** a la izquierda: cada caso con cliente, monto, franquicia y estado; badges de *Espera humana* y *Alto riesgo*.

**Qué decir:**

> *"Arriba ven el estado de la fuerza de trabajo digital: quién está ocupado, quién espera, cuántos casos van cerrados y —esto es clave— cuántas **acciones documentadas** lleva la jornada. Cada acción es un clic del robot que quedó registrado con hora, sistema y regla aplicada. Cuando su auditoría interna o una franquicia pregunte '¿quién bloqueó esta tarjeta y por qué?', la respuesta está ahí, sin reconstruir correos ni llamadas."*

**Tip demo:** Pausar (Espacio) sobre un caso con badge **Espera humana** y explicar el concepto de *human-in-the-loop* antes de seguir (ver 1.4).

---

### 1.2 La estación — lo que cada agente piensa y hace

**Qué señalar:**
- El panel central: *"Agente Identificación está trabajando en ALT-2026-…"* con los datos del caso (cliente, monto, franquicia, estado).
- La **burbuja de pensamiento**: el agente razona en primera persona y cita la regla que aplica (chip ambar R01, R06…).
- El **escritorio RPA** de abajo: la ventana real del sistema con el cursor trabajando.

**Qué decir:**

> *"Centrémonos en un agente. Arriba ven qué caso tiene en mano y en qué paso va. Y aquí —el detalle que más me gusta— está **lo que el agente está pensando**: lo dice en primera persona y cito textualmente, *'el titular no tiene celular vigente en CRM, aplico R01 y escalo a monitoreo manual'*. Eso es exactamente lo que su analista mejor capacitado haría, escrito en su política de fraude. La diferencia es que este 'analista' no se equivoca por cansancio, no renuncia, y escala al 100% de los casos que la política manda escalar. Y abajo ven la prueba: no es magia abstracta, es el cursor moviéndose en la pantalla de su propio sistema."*

---

### 1.3 El teatro RPA — las pantallas por etapa (recorrido comercial)

**Cómo conducirlo:** dejar la simulación en **1x–2x** y narrar mientras la estación sigue al agente que trabaja. Si la sala pide ver una etapa específica, usar el Director de escena (1.4) para producir el caso justo.

**Recepción — Monitor, BRM/EMS y PPE:**
> *"El agente de Recepción ve entrar la alerta en la consola de Monitor — o en la bandeja de BRM si es Visa, EMS/MS si es Mastercard — la reconoce, normaliza los campos uno a uno — comercio, categoría, ciudad, monto, canal — y la enruta. Si el monto se sale del patrón histórico del cliente, aplica **R06** y la marca de alto riesgo; si el riesgo es alto, dispara el **bloqueo preventivo en PPE antes de que termine la recepción** (R02). Lean la secuencia: la tarjeta queda protegida en segundos, no en el siguiente turno de un analista."*

**Identificación — CRM Banco y revisión ítem por ítem:**
> *"El agente de Identificación abre CRM, teclea la cédula y trae la ficha del titular: celular vigente, ciudad, historial de alertas y desbloqueos previos. Después pasa la revisión **ítem por ítem** — titular, celular, dispositivo, ubicación — como haría un auditor, pero en segundos. Si todo pasa, sigue el flujo. Si el celular no existe en CRM, el control falla con **R01** y el caso escala a monitoreo manual: el robot sabe exactamente cuándo no debe decidir solo. Y si el cliente acumula tres o más desbloqueos legítimos, aplica **R09** y baja su perfil de riesgo: el sistema aprende del propio historial del banco."*

**Comunicación — Kari AI y el teléfono del titular:**
> *"El agente de Comunicación prepara la plantilla HSM aprobada con las variables del caso — nombre, comercio, monto, fecha — y la envía por WhatsApp Business. Ven el reloj del SLA de 40 minutos corriendo y el reintento automático a los 15. Y fíjense en la mitad derecha del escritorio: aparece **el teléfono del titular**, con la cinta ámbar de *espera humana*. Esa cinta es el concepto comercial más importante: **el robot sabe cuándo le toca a una persona**. El titular lee, responde 'sí fui yo' o 'no fui yo', y el flujo sigue. Nadie del banco tocó nada."*

**Decisión — Revisión de riesgo y PPE:**
> *"El agente de Decisión repasa los cuatro controles de riesgo: monto contra el patrón histórico, comportamiento, comercio y —solo en Visa— el score de **Cardinal**. Si el titular confirmó, PPE **libera la tarjeta** (R03) con un diálogo de confirmación porque un desbloqueo es un compromiso. Si negó, aplica el **bloqueo definitivo** (R04), irreversible y por eso también confirmado. Cada operación queda con su referencia PPE: trazabilidad de punta a punta."*

**Registro — CRM, Expediente y sincronización:**
> *"El agente de Registro tipifica el caso en CRM y construye el **expediente digital**: siete secciones que se consolidan una a una — alerta, titular, transacción, comunicación, riesgo, decisión, tipificación — con sello **SHA-256** y acta de cierre estampada: LEGÍTIMA o FRAUDE. Y cierra el ciclo replicando la tipificación en el sistema de origen: si la alerta nació en BRM, BRM queda actualizado. **R12: trazabilidad 24/7.** Cuando la franquicia pregunte por un caso, el banco responde con un documento sellado, no con una búsqueda en Excel."*

---

### 1.4 El Director de escena — contar la historia que la sala necesita oír

**Cómo abrirlo:** Icono de **claqueta** junto a los KPIs (título: *"Elegir qué alerta entra ahora"*).

> *"La operación en vivo es buena para demostrar escala, pero los negocios se cierran con historias. Este **Director de escena** me deja producir el caso exacto que quiero contar: elijo franquicia y escenario, y el orquestador lo ejecuta delante de ustedes. Es lo mismo que haríamos en el piloto: tomar los casos reales que más les duelen y reproducirlos uno a uno."*

**Recorrido recomendado — 3 escenas que venden solas:**

**Escena 1 · «Alto riesgo · monto atípico» (Visa — R06, R02)** — *el wow de velocidad.*
> *"Compra en el exterior muy superior al patrón del cliente. Mírenlo: recepción detecta la anomalía, marca alto riesgo y **bloquea la tarjeta preventivamente antes de que el comercio entregue el recibo**. El titular recibe el WhatsApp con prioridad alta. De haber sido fraude, la pérdida era cero; si es falso positivo, el cliente responde y se libera en minutos. Velocidad que ningún equipo humano 24/7 sostiene de manera uniforme."*

**Escena 2 · «No fui yo» (Mastercard — R04, R08)** — *el cierre del fraude real.*
> *"El titular desconoce la compra. Flujo idéntico hasta la respuesta; entonces Kari AI registra el 'no fui yo' y PPE aplica el **bloqueo definitivo** con confirmación. Nuevo plástico, caso fraudulento tipificado, expediente sellado. Tiempo total: minutos. Hoy ese caso consume días y varias personas entre CRM, PPE y la tipificación."*

**Escena 3 · «Sin celular en CRM» (Mastercard — R01, R02)** — *la objeción de '¿y los datos maestros?'.*
> *"La pregunta que siempre sale: ¿y cuando el dato está mal? Aquí la respuesta. CRM no tiene celular del titular: el control falla con R01, el caso **escala a monitoreo manual**, bloqueo preventivo automático activo, y ahora decide un **analista humano** desde su consola — con la ficha completa, el contacto por canal alterno y los botones Legítima/Fraude, con diálogo de confirmación. La automatización no esconde los datos malos: los detecta, protege al cliente y entrega el caso a una persona con todo el contexto. **No reemplazamos al analista: lo potenciamos y le quitamos el trabajo de hormiga.**"*

**Escenas de repuesto** (si la conversación lo pide):
- **«Sin respuesta»** (Visa — R10, R05): reintento a los 15 min, SLA vencido, bloqueo preventivo mantenido y decisión del analista. *"El banco nunca queda en blanco: si el cliente no responde, la política decide."*
- **«Cliente recurrente»** (Mastercard — R09): tres o más desbloqueos legítimos → perfil de bajo riesgo. *"El sistema aprende: cada falso positivo bien tipificado reduce la fricción del siguiente."*
- **«Cierre bloqueado»** (Visa — R11): CRM **rechaza** cerrar sin tipificación; el agente la registra y recién entonces cierra. *"Hasta el control de calidad es automático: ningún caso mal tipificado se cuela."*

---

### 1.5 Bitácora y expediente — la trazabilidad como activo comercial

**Qué señalar:**
- **Bitácora en vivo** (columna derecha): cada evento con hora, agente, sistema y regla.
- **Expediente documentado** (tarjeta de la derecha): sello LEGÍTIMA/FRAUDE, resumen del caso y **línea de tiempo por agente** con tiempos.

**Qué decir:**

> *"Todo lo que vieron quedó escrito. La bitácora registra segundo a segundo quién hizo qué, en qué sistema y bajo qué regla. Y cada caso cerrado produce un expediente sellado criptográficamente — el mismo hash que ven ahí garantiza que nadie lo alteró después. Pregúntense cuánto cuesta hoy responder una auditoría de franquicia o una solicitud de la superintendencia: días de trabajo de varias personas. Con esto, es un documento. **La trazabilidad no es un requisito burocrático: es un activo que reduce costo de cumplimiento y acelera las negociaciones con Visa y Mastercard.**"*

---

### 1.6 Modo teatro — para el proyector

**Cómo activarlo:** Botón **"Modo teatro"** (o tecla **T**). Oculta la cola y la columna derecha; deja la cinta, la estación y el escritorio a pantalla completa (tecla **F**).

> *"Cuando presentemos esto en sala de juntas con proyector, usamos el modo teatro: solo lo que importa — el agente, su pensamiento y su pantalla — a pantalla completa. La demo que acabamos de ver es exactamente la que vería su comité directivo."*

**Transición hacia el Dashboard:**

> *"Hasta aquí vimos **cómo trabaja el equipo**. Ahora subamos un piso: **qué números le entrega esa operación a la gerencia cada mañana**."*

---

## 2. Dashboard — Centro de Operaciones

**URL:** [http://localhost:3000/#/dashboard](http://localhost:3000/#/dashboard)

> *"Este es el centro de operaciones antifraude: una sola pantalla para ver lo que hoy requiere saltar entre Monitor, CRM, Kari, PPE y Excel. Es la vista del **jefe de operaciones** — y también la que ustedes, como dirección, revisarían cada mañana con café en mano."*

---

### 2.1 El Viaje de una Alerta (pipeline horizontal superior)

**Qué señalar:**
- Las **5 fases en vivo**: Recepción → Identificación → Comunicación → Decisión → Registro.
- Contadores que **suben en tiempo real**.
- Los sistemas debajo de cada fase.

**Qué decir:**

> *"Arriba está el corazón del proceso. Cada alerta viaja por estas cinco fases sin intervención humana, y los números son el estado real de la cola — no una animación. Si pauso la simulación, se detiene; si la acelero a 10x, están viendo el throughput objetivo del piloto: el mismo proceso, a la velocidad que el volumen de 700.000 alertas exige."*

**Tip demo:** Pausar y reanudar desde el header para demostrar control.

---

### 2.2 Indicadores Operativos (KPI Cards)

**Qué señalar:**
- **700.000** alertas mensuales · **20.000–30.000** gestionadas hoy.
- **70–80%** falsos positivos · **40 min** tiempo de respuesta · **250.000** clientes impactados.
- Sparklines de tendencia.

**Qué decir:**

> *"Estos KPIs se recalculan desde el mismo motor que mueve las alertas: no son un Excel del mes pasado. Y fíjense en la implicación de negocio: con 250.000 clientes impactados al mes y 7 de cada 10 alertas siendo falsos positivos, **la fricción que hoy genera la operación antifraude le cuesta al banco más clientes que el fraude que evita**. Eso es lo que este proyecto corrige."*

---

### 2.3 Tabla de Alertas + Filtros + Sidebar

**Qué decir:**

> *"Aquí cada alerta vive con su estado exacto — de *Pendiente Revisión* a *Tipificado* — y a la derecha, el log muestra qué pasó segundo a segundo. Trazabilidad total: si mañana un cliente reclama 'nadie me avisó', o una franquicia disputa un caso, la respuesta está en este historial."*

**Tip demo:** Filtrar por **"Urgentes"** o **"Fraudulentas"**.

---

### 2.4 Automatización en Acción + Before/After

**Qué decir (Before/After — la diapositiva que la sala recordará):**

> *"Cierren con la pregunta que su comité hará: ¿qué cambia? A la izquierda, su realidad de hoy — 50 asesores, 6 plataformas, 40 minutos por caso, 4% de cobertura. A la derecha, el estado objetivo — cero intervención en los pasos repetitivos, un solo orquestador, menos de 2 minutos, 100% del volumen, WhatsApp al 95% de contactabilidad. **Cada fila es una métrica medible del piloto: no es una promesa, es un contrato de resultados.**"*

**Transición:**

> *"El dashboard les dice cómo va la operación. El pipeline les dice dónde está cada alerta, sistema por sistema."*

---

## 3. Pipeline — Vista Operativa por Sistema

**URL:** [http://localhost:3000/#/pipeline](http://localhost:3000/#/pipeline)

> *"Si el Dashboard es la sala de control, el **Pipeline** es el piso de producción: las alertas organizadas por el sistema que las está procesando en este momento."*

### 3.1 Swimlanes por sistema

**Qué señalar:** Monitor · BRM · EMS/MS · Cardinal · CRM Banco · Kari AI · PPE.

**Qué decir:**

> *"Hoy su equipo salta entre estas siete herramientas — siete logins, siete pantallas, siete curvas de aprendizaje, siete puntos donde un caso se puede perder. Con el orquestador, cada sistema se integra por API y las alertas aparecen en el carril correcto automáticamente. El humano ya no navega sistemas: **supervisa excepciones**."*

### 3.2 Tarjetas vs. Lista + Filtros

**Qué decir:**

> *"El supervisor ve en tarjetas para gestionar el día a día, o en lista para auditar y exportar. El color del borde identifica la franquicia al instante; si mañana hay un pico de alertas Visa por BRM, filtran y atacan solo ese carril."*

**Transición:**

> *"Todo esto funciona mientras los sistemas estén vivos. Veamos cómo se garantiza eso."*

---

## 4. Sistemas — Salud de la Plataforma

**URL:** [http://localhost:3000/#/sistemas](http://localhost:3000/#/sistemas)

### 4.1 Tabs de sistemas + detalle

**Qué señalar:**
- Tabs: Monitor | BRM | EMS/MS | Cardinal | CRM Banco | Kari AI | PPE.
- Indicador **Online / Offline** (uno rota como offline cada ~30 seg para simular incidentes).
- Volumen mensual por sistema, utilización y últimas alertas procesadas.

**Qué decir:**

> *"Un orquestador central solo funciona si los sistemas periféricos responden. Hoy un BRM lento se descubre cuando las alertas se acumulan — es decir, cuando ya le llegó al cliente. Aquí el equipo de operaciones lo vería en segundos, y el orquestador reintentaría, redirigiría o escalaría según la política: **200.000 alertas nunca quedan en limbo por un sistema caído.** Esto es observabilidad de clase enterprise aplicada a fraude transaccional — y es también la respuesta a la objeción de tecnología: no reemplazamos sus sistemas; los **orquestamos y los cuidamos**."*

**Transición:**

> *"Operación y sistemas, en tiempo real. Ahora el nivel que le importa a la gerencia: tendencias, cuellos de botella y el costo de cada minuto de retraso."*

---

## 5. Métricas — Análisis y Proyección To-Be

**URL:** [http://localhost:3000/#/metricas](http://localhost:3000/#/metricas)

### 5.1 Tarjetas Before/After

**Qué decir:**

> *"Cuatro números que resumen el negocio: ciclo de **40 minutos a menos de 2**; falsos positivos de **75% a ~45%** y cayendo con cada caso bien tipificado; throughput de **30.000 a 360.000 alertas por hora**; y el ciclo crítico — ese caso que hoy tarda **3,4 días** en cerrarse — en **segundos**. Si quieren traducirlo a dinero: multipliquen los minutos ahorados por caso por el costo-hora de su operación 24/7, y sumen el costo de los falsos positivos que dejan de friccionar a 250.000 clientes al mes."*

### 5.2 Volumetría, tendencia y cuellos de botella

**Qué decir:**

> *"El gráfico de tendencia muestra la brecha que ustedes conocen mejor que nadie: 700.000 recibidas contra una fracción gestionada. Y el mapa de calor les dice dónde apretar: **comunicación con el cliente es hoy el cuello más presionado — 94%** — exactamente donde WhatsApp y Kari AI atacan primero. Las razones de bloqueo — monto inusual, ubicación atípica, comercio riesgoso — son la agenda de la próxima reunión con las franquicias, con datos en la mano."*

**Transición:**

> *"Hasta aquí, el 'cómo se opera y se mide'. La última vista es el 'cómo está modelado' — la ontología que gobierna todo el sistema."*

---

## 6. Ontología — Modelo del Dominio

**URL:** [http://localhost:3000/#/ontologia](http://localhost:3000/#/ontologia)

> *"Esta sección es la prueba de que no vendemos una caja negra: documentamos **cada entidad, relación, regla y estado** del proceso antifraude del banco, en el mismo lenguaje de su equipo de arquitectura y fraude."*

**Recorrido rápido (3 minutos, sin detenerse mucho):**

- **Entidades y relaciones:** *"Ocho entidades del dominio — alerta, cliente, tarjeta, transacción, mensaje HSM, bloqueo, regla, orquestador — conectadas con cardinalidad. Este es el mapa que el equipo de integración usa para no romper nada en producción."*
- **Máquina de estados:** *"Ningún caso vaga en un limbo ambiguo: o espera al cliente, o está bloqueado preventivamente, o ya fue tipificado. Ocho estados formales, bandas por fase. Así se audita y así se reporta a regulación sin preguntar '¿en qué quedó ese caso?'"*
- **Reglas de negocio:** *"Las doce reglas que vieron trabajar en la pestaña Agentes — R01 a R12 —, con severidad y configuración. **No son reglas genéricas de un vendor: son la política de su operación, convertida en software auditable.** Cuando la política cambie, se cambia la regla, no el proceso."*
- **Glosario:** *"Cerramos con lenguaje común: cuando decimos HSM, PPE o BRM, negocio y tecnología entienden lo mismo."*

---

## Manejo de objeciones (tener a la mano)

| Objeción | Respuesta comercial |
|----------|---------------------|
| *"¿Y si el cliente no responde el WhatsApp?"* | Escena **«Sin respuesta»**: reintento a los 15 min, SLA de 40 vencido → bloqueo preventivo mantenido y decide el analista con toda la evidencia. La política del banco siempre tiene el control (R05, R10). |
| *"¿Y si los datos del CRM están mal?"* | Escena **«Sin celular»** (R01): el robot detecta el dato faltante, protege al cliente con bloqueo preventivo y escala a una **persona** con contexto completo. La automatización expone los datos maestros, no los esconde. |
| *"¿Esto reemplaza a mi equipo?"* | No: libera a los 50 analistas del trabajo repetitivo y los convierte en **supervisores de excepciones**. Los casos que la política reserva para humanos — sin celular, sin respuesta — llegan a una consola con ficha completa y botones de decisión. |
| *"¿Cómo lo audito ante la franquicia o la superintendencia?"* | Cada acción tiene regla, hora y sistema (bitácora); cada caso cierra con expediente sellado SHA-256 y acta estampada. Auditar deja de ser un proyecto y pasa a ser una **consulta**. |
| *"¿Y si se cae un sistema?"* | Vista **Sistemas**: el orquestador detecta la caída en segundos, reintenta, redirige o escala según política. Nada se pierde en limbo. |
| *"¿Esto es viable o es ciencia ficción?"* | Acaban de verlo operar ventana por ventana en los sistemas reales, con las reglas R01–R12 citadas en cada paso. La pregunta correcta no es *si* se puede, sino *con qué franquicia y volumen empezamos el piloto*. |

---

## Cierre — Mensaje final (2 min)

> *"Volvamos a los cinco pilares. **Cobertura:** del 4% al 100% de las 700.000 alertas mensuales. **Velocidad:** de 40 minutos a menos de 2. **Experiencia de cliente:** falsos positivos del 70–80% hacia menos del 50%, con aprendizaje en cada caso. **Trazabilidad:** auditoría 24/7 con expedientes sellados, no con Excel. Y **control humano:** las personas deciden exactamente los casos que la política del banco reserva para personas — ni más, ni menos.*
>
> *Lo que vieron no es un concepto ni una maqueta: es el modelo operativo, técnico y de métricas del centro de operaciones antifraude automatizado — ejecutado con las reglas de su propio proceso, ante sus ojos.*
>
> *El siguiente paso lo proponemos concreto: un **piloto de 6 a 8 semanas** sobre una franquicia acotada —sugerimos Visa por BRM—, con CRM, PPE y Kari integrados por API, y con cuatro KPIs medibles de entrada: tiempo de ciclo, contactabilidad, falsos positivos y costo por alerta. Nosotros ya tenemos el mapa que vieron hoy. Ustedes tienen el proceso y los datos. **Juntos cerramos la brecha en semanas, no en años.**"*

---

## Referencia rápida — Controles durante la demo

| Control | Ubicación | Uso |
|---------|-----------|-----|
| Play / Pause (Espacio) | Header | Pausar para explicar; reanudar para impacto |
| Velocidad 1x–10x | Header | 1x–2x en Agentes (narrar el teatro); 5x–10x para throughput |
| Director de escena (claqueta) | Pestaña Agentes, junto a KPIs | Forzar franquicia + escenario: falso positivo, «no fui yo», sin celular, alto riesgo… |
| Modo teatro (T) | Pestaña Agentes | Proyector: oculta cola y columnas laterales |
| Pantalla completa (F) | Teclado, en Agentes | Fullscreen para sala de juntas |
| N | Teclado, en Agentes | Nueva alerta inmediata |
| → (flecha derecha) | Teclado, en Agentes | Cambiar el caso en foco entre los activos |
| Modo Presentación | Header | Abrir tour de 5 pasos (apertura de la demo) |
| ESC | Teclado | Cerrar modo presentación / salir del teatro |

---

## Datos clave del proceso (memorizar)

| Métrica | Valor actual | Objetivo To-Be |
|---------|--------------|----------------|
| Alertas mensuales | ~700.000 | 100% gestionadas |
| Alertas gestionadas/mes | 20.000–30.000 (~4%) | 700.000 |
| Personal operativo | ~50 asesores 24/7 | 0 en pasos repetitivos; analistas solo en excepciones |
| Falsos positivos | 70–80% | <50% y cayendo con aprendizaje |
| Tiempo de respuesta | ~40 min | <2 min |
| Ciclo crítico de cierre | ~3,4 días | Segundos |
| Contactabilidad | Llamadas <40% | WhatsApp ~95% |
| Throughput | ~30.000 alertas/hora | ~360.000 alertas/hora |
| Clientes impactados | ~250.000/mes | Menos fricción por falso positivo |
| Auditoría y trazabilidad | Manual, multi-sistema | Expediente sellado por caso, 24/7/365 |
| Operación | 24/7/365 | 24/7/365 automatizada |

---

## Guion de la demo en 5 frases (chuleta de bolsillo)

1. *"700.000 alertas al mes, solo 4% gestionado: ese es el agujero."*
2. *"Cinco agentes digitales trabajan en sus sistemas reales, regla por regla, con auditoría de cada clic."*
3. *"El robot decide lo repetitivo y cede a las personas exactamente lo que la política reserva para personas."*
4. *"Cada caso cierra en minutos con expediente sellado: menos costo, menos fricción, menos riesgo."*
5. *"Piloto de 6–8 semanas, una franquicia, cuatro KPIs medibles: empecemos."*

---

*Documento comercial preparado para demo — Centro de Operaciones Antifraude — Américas SIM*
*Exportar a PDF para distribución: este archivo (`guion.md`) es la fuente maestra.*
