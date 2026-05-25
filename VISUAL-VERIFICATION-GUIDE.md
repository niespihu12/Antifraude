# Guía de Verificación Visual - PROMPT D2

## Cómo Verificar los Cambios

### 1. Iniciar el Servidor
```bash
cd bdb-antifraude-demo
npm run dev
```
Abrir: http://localhost:3000

---

## ✅ VISTA: DASHBOARD

### KPI Cards con Sparklines
**Qué verificar:**
1. Cada KPI card tiene un mini gráfico de línea a la derecha
2. Los números son grandes (text-3xl) y protagonistas
3. Debajo del número hay una flecha (↑↓→) con porcentaje
4. El texto de tendencia está en gris pequeño
5. Los sparklines tienen colores específicos:
   - Alertas Recibidas: cyan
   - Alertas Gestionadas: verde (emerald)
   - Falsos Positivos: amarillo (amber)
   - Tiempo Respuesta: rojo
   - Fraude Bloqueado: azul
   - Contactabilidad WA: verde

**Cómo verificar:**
- Inspeccionar visualmente los 6 KPI cards en la parte superior
- Verificar que los sparklines se animan suavemente
- Hover sobre las cards para ver el efecto de escala

### Layout 2 Columnas
**Qué verificar:**
1. Barra de búsqueda arriba de la tabla (placeholder: "Buscar alerta, franquicia, número...")
2. Tabla de alertas ocupa ~70% del ancho
3. Sidebar derecha ocupa ~30% (320px)
4. Sidebar contiene:
   - Mini donut chart (180px) con título "% Distribución por Estado"
   - Mini actividad reciente (200px altura) con título "Actividad Reciente"

**Cómo verificar:**
- Scroll down en Dashboard hasta ver la sección de tabla
- Verificar que en desktop hay 2 columnas
- En mobile/tablet debe colapsar a 1 columna
- Sidebar debe mostrar máximo 5-6 logs recientes

---

## ✅ VISTA: PIPELINE

### Filtros Superiores
**Qué verificar:**
1. Fila de filtros tipo: "Todas" | "Visa" | "Mastercard" | "Monitor" | "Urgentes" | "Fraudulentas"
2. Toggle de vista: "Tarjetas" | "Lista" con iconos
3. Ambos grupos tienen fondo bg-white/[0.04]

**Cómo verificar:**
- Click en "Pipeline" en el menú superior
- Ver los filtros arriba a la derecha
- Click en "Lista" para cambiar vista
- Click en "Tarjetas" para volver

### Tarjetas Estilo MEDVISION
**Qué verificar:**
1. Cada tarjeta tiene borde superior de 3px de color:
   - VISA: azul
   - MASTERCARD: rojo
   - MONITOR: gris
2. ID en la esquina superior izquierda (gris, mono)
3. Icono de alerta (triángulo) a la derecha del ID
4. Nombre del cliente en blanco, mediano
5. Monto grande en negrita (text-lg)
6. Badge de franquicia abajo a la izquierda
7. Tiempo abajo a la derecha (gris, mono)

**Cómo verificar:**
- Scroll down hasta "Swimlanes por Aplicativo"
- Inspeccionar las tarjetas dentro de cada swimlane
- Verificar colores de borde según franquicia
- Hover sobre tarjetas para ver efecto de escala

---

## ✅ VISTA: SISTEMAS

### Tabs con Estado
**Qué verificar:**
1. 7 tabs horizontales: Monitor | BRM | EMS/MS | Cardinal | CRM Banco | Kari AI | PPE
2. Cada tab tiene un punto de estado (verde o rojo)
3. 6 sistemas con punto verde (Online)
4. 1 sistema con punto rojo (Offline) - rota cada 30 segundos
5. Tab activo tiene fondo bg-white/[0.08]

**Cómo verificar:**
- Click en "Sistemas" en el menú superior
- Ver los 7 tabs arriba
- Identificar cuál tiene punto rojo
- Esperar 30 segundos y verificar que el punto rojo cambia a otro sistema
- Click en diferentes tabs para ver el contenido

### Card de Sistema
**Qué verificar:**
1. Header con icono, nombre y badge de estado
2. Si está Online:
   - 2 métricas: "Alertas procesadas hoy" y "Tiempo promedio"
   - Barra de carga con porcentaje
   - Volumen mensual y última actividad
   - Lista de últimas 5 alertas
3. Si está Offline:
   - Mensaje rojo: "Sistema temporalmente no disponible"
   - No muestra métricas ni alertas

**Cómo verificar:**
- Click en el tab con punto rojo
- Verificar mensaje de Offline
- Click en un tab con punto verde
- Verificar que muestra todas las métricas

---

## ✅ VISTA: MÉTRICAS

### Filtros de Tiempo
**Qué verificar:**
1. Filtros arriba a la derecha: "Últimos 30 días" | ENE | FEB | MAR | ABR | MAY | JUN
2. Botón "Exportar CSV" con icono de descarga
3. Filtro activo tiene fondo cyan

**Cómo verificar:**
- Click en "Métricas" en el menú superior
- Ver los filtros arriba a la derecha
- Click en "ENE" para activarlo
- Verificar que cambia de color
- Hover sobre "Exportar CSV"

### KPIs Comparativos
**Qué verificar:**
1. 4 cards con comparativo Actual → To-Be
2. Valor actual tachado en rojo
3. Valor objetivo en verde grande
4. Iconos a la derecha de cada card

**Cómo verificar:**
- Ver los 4 KPIs superiores
- Verificar formato: "40 min" tachado → "<2 min" verde
- Verificar iconos: Clock, ShieldAlert, Gauge, TimerReset

---

## ✅ VISTA: ONTOLOGÍA

### Tabs Internos
**Qué verificar:**
1. 6 tabs: Entidades | Relaciones | Taxonomías | Máquina de Estados | Reglas de Negocio | Glosario
2. Tab activo tiene fondo bg-white/[0.08]
3. Cada tab muestra contenido diferente

**Cómo verificar:**
- Click en "Ontología" en el menú superior
- Click en cada uno de los 6 tabs
- Verificar que el contenido cambia
- Tab "Entidades" debe mostrar 7 cards con atributos
- Tab "Relaciones" debe mostrar 6 relaciones
- Tab "Glosario" debe mostrar 4 términos

---

## ✅ BARRA INFERIOR STICKY

### Verificar en Todas las Vistas
**Qué verificar:**
1. Barra fija en la parte inferior
2. Muestra 5 estados con contadores
3. Contadores se animan cuando cambian
4. Última actualización a la derecha

**Cómo verificar:**
- Navegar a Dashboard, Pipeline, Sistemas, Métricas
- Verificar que la barra aparece en todas
- Scroll down para confirmar que es sticky
- Ver que los contadores cambian en tiempo real

---

## 🎨 VERIFICACIÓN DE COLORES

### Sparklines
- Cyan: rgb(34, 211, 238)
- Emerald: rgb(52, 211, 153)
- Amber: rgb(251, 191, 36)
- Red: rgb(248, 113, 113)
- Blue: rgb(96, 165, 250)

### Bordes de Tarjetas Pipeline
- VISA: border-t-blue-400
- MASTERCARD: border-t-red-400
- MONITOR: border-t-slate-400

### Estados de Sistema
- Online: bg-emerald-500/15 text-emerald-400
- Offline: bg-red-500/15 text-red-400

---

## 🔍 VERIFICACIÓN DE ANIMACIONES

### Hover Effects
1. KPI cards: scale 1.01
2. Pipeline cards: scale 1.01
3. Botones: hover:bg-[var(--bg-hover)]

### Transiciones
1. Sparklines: suaves, sin saltos
2. Tabs: cambio instantáneo de contenido
3. Sistema Offline: rotación cada 30s sin parpadeo
4. Contadores barra inferior: animación scale [1, 1.08, 1]

---

## 📱 VERIFICACIÓN RESPONSIVE

### Desktop (>1280px)
- Dashboard: 2 columnas (tabla + sidebar)
- KPI cards: 3 columnas
- Pipeline swimlanes: scroll horizontal

### Tablet (768px - 1280px)
- Dashboard: 1 columna (sidebar abajo)
- KPI cards: 2 columnas
- Tabs: scroll horizontal

### Mobile (<768px)
- Dashboard: 1 columna
- KPI cards: 1 columna
- Tabs: scroll horizontal
- Tabla: cards verticales

---

## ✅ CHECKLIST FINAL

Marcar cada item después de verificar:

### Dashboard
- [ ] Sparklines visibles en KPI cards
- [ ] Números grandes (text-3xl)
- [ ] Trends con flechas y porcentajes
- [ ] Barra de búsqueda presente
- [ ] Layout 2 columnas en desktop
- [ ] Mini donut en sidebar
- [ ] Mini actividad en sidebar

### Pipeline
- [ ] Filtros de tipo presentes
- [ ] Toggle Tarjetas/Lista funciona
- [ ] Tarjetas con borde superior de color
- [ ] ID + icono de alerta
- [ ] Nombre cliente visible
- [ ] Monto grande en negrita

### Sistemas
- [ ] 7 tabs visibles
- [ ] Puntos de estado (verde/rojo)
- [ ] 1 sistema Offline
- [ ] Rotación cada 30s
- [ ] Card muestra métricas cuando Online
- [ ] Mensaje de error cuando Offline

### Métricas
- [ ] Filtros de tiempo presentes
- [ ] Botón "Exportar CSV" visible
- [ ] KPIs con comparativo Actual → To-Be
- [ ] Mapa de calor presente
- [ ] Razones de bloqueo presente

### Ontología
- [ ] 6 tabs presentes
- [ ] Contenido diferente por tab
- [ ] 7 entidades en tab Entidades
- [ ] Glosario con 4 términos

### General
- [ ] Barra inferior sticky en todas las vistas
- [ ] Animaciones suaves
- [ ] Sin errores en consola
- [ ] Responsive funciona correctamente

---

## 🐛 TROUBLESHOOTING

### Si los sparklines no aparecen:
- Verificar que el navegador soporta SVG
- Abrir DevTools y buscar errores en consola
- Verificar que los datos mock están definidos

### Si el sistema Offline no rota:
- Esperar 30 segundos completos
- Verificar que el useEffect está activo
- Revisar que no hay errores en consola

### Si el layout 2 columnas no funciona:
- Verificar que la ventana es >1280px de ancho
- Inspeccionar con DevTools el grid
- Verificar que xl:grid-cols-[minmax(0,1fr)_320px] está aplicado

---

## 📸 SCREENSHOTS SUGERIDOS

Para documentación, tomar screenshots de:
1. Dashboard completo con sparklines visibles
2. KPI card individual mostrando sparkline
3. Pipeline con tarjetas estilo MEDVISION
4. Sistemas con tabs y estado Offline
5. Métricas con filtros de tiempo
6. Ontología con tabs internos
7. Barra inferior sticky

---

**Última actualización:** 2026-05-25
**Prompt:** D2 - Ajustes Visuales Exactos a MEDVISION
