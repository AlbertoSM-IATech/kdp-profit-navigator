
# Plan: Rediseño de "Resultados del Análisis"

Objetivo: vista limpia, jerárquica y minimalista. El Simulador pasa a ser la pieza central (no un acordeón al final), los consejos se vuelven contenido secundario, las acciones de Guardar son visibles, el panel de Versiones se rehace para que sea inteligible, y el acceso a Análisis guardados está siempre disponible en el header.

---

## 1. Jerarquía y orden visual de la pantalla

Nuevo orden vertical en `StepResults.tsx`:

```text
┌───────────────────────────────────────────────────────────┐
│ A. Cabecera de Resultados                                 │
│    Título + estado del análisis + Acciones primarias      │
│    [Guardar análisis]  [Guardar nueva versión]            │
├───────────────────────────────────────────────────────────┤
│ B. Score Global (compacto, sin gradientes)                │
│    Número grande + 3 barras de desglose + 1 línea resumen │
├───────────────────────────────────────────────────────────┤
│ C. SIMULADOR DE OPTIMIZACIÓN  ← protagonista, abierto     │
│    Controles a la izquierda · Resultados a la derecha     │
│    Cinta inferior sticky: [Aplicar al análisis]           │
│                           [Guardar como nueva versión]    │
├───────────────────────────────────────────────────────────┤
│ D. Información complementaria (acordeón colapsado)        │
│    · Tabla de resultados                                  │
│    · Consejo estratégico y posicionamiento                │
└───────────────────────────────────────────────────────────┘
```

Cambios clave:
- El Simulador deja de ser un `Collapsible` cerrado al final. Pasa a ser una sección abierta por defecto, con su propio título y descripción ("Optimiza tu libro probando variaciones de precio, páginas, coste por clic y margen objetivo").
- Tabla de resultados y Consejo estratégico se agrupan bajo un único bloque "Información complementaria" con un `Accordion` (cerrado por defecto).
- Score Global se mantiene arriba pero en versión más sobria.

---

## 2. Sistema visual: minimalismo y colores

Reglas que se aplican en todos los componentes de la pantalla:

- Sólo se usan los tokens semánticos del design system: `background`, `foreground`, `muted`, `border`, `primary` (coral Publify) y `secondary` (azul Publify).
- Los semáforos `success` / `warning` / `destructive` se reservan exclusivamente para:
  - Estado del análisis en el Score (1 punto de color).
  - Indicador de riesgo del Simulador (1 punto de color).
  - Celdas de margen y clics en la tabla cuando esté expandida.
- Se eliminan gradientes, fondos coloreados decorativos (`bg-primary/10`, `bg-secondary/10`, etc.) y emojis 🟢🟠🔴 (sustituidos por puntos de color).
- Tipografía: Poppins/Inter del design system, sin tamaños mayores a `text-3xl` salvo el número del Score.

---

## 3. Cabecera + Score Global (rediseño)

`ScoreDisplay` en modo `embedded`:

- Layout en dos columnas:
  - Izquierda: número del score (`text-5xl`), etiqueta de estado con punto de color, frase de interpretación.
  - Derecha: 3 barras de desglose (Clics máximos por venta, BACOS, Precio vs Mínimo) con tooltip `?` en cada label.
- Sin fondos coloreados según estado: `bg-card` + `border` + 1 punto de color para el estado.

Acciones primarias inmediatamente debajo del score:
- `[Guardar análisis]` — botón `default` (coral), icono `Save`.
- `[Guardar nueva versión]` — botón `secondary`, icono `History`. Sólo si hay nicho cargado.

Se elimina el bloque actual de "Save Actions" suelto a mitad de página y los botones flotantes inferiores del simulador (sustituidos por la cinta sticky del punto 4).

---

## 4. Simulador como protagonista

`PaperbackSimulator` se renderiza siempre abierto dentro de una `Card` destacada (`border-secondary/30`, `shadow-sm`).

Layout interno responsive (2 columnas en desktop):
- Izquierda: controles (Tipo de impresión, Tamaño, Precio de venta, Páginas, Coste por clic, Margen objetivo).
- Derecha: métricas clave en grid (Regalías, Margen BACOS, Clics máximos por venta, Precio mínimo viable, CPC máximo rentable) + diagnóstico en 1 línea.

Cinta sticky inferior dentro de la Card (no `fixed` global) cuando hay cambios respecto al estado inicial:
- `[Aplicar al análisis]` (primario).
- `[Guardar como nueva versión]` (secundario, sólo con nicho cargado).

Copy sin abreviaturas en labels visibles:
- "PVP" → "Precio de venta"
- "CPC" → "Coste por clic"
- "Min." / "Mín." → "Mínimo"
- "Máx." → "Máximo"
- "Ref." → "Referencia"
- BACOS se conserva como término técnico con tooltip permanente.

Tooltips (icono `HelpCircle`) en: Precio de venta, Páginas, Coste por clic, Margen objetivo, Regalías, Margen BACOS, Clics máximos por venta, Precio mínimo viable, CPC máximo rentable.

---

## 5. Acciones de guardado: claridad y protagonismo

Los CTAs se consolidan en dos lugares:

1. **Bajo el Score (acciones del análisis completo):**
   - `Guardar análisis` (coral, primario).
   - `Guardar nueva versión` (secundario, sólo si hay nicho cargado).

2. **Cinta sticky del Simulador (acciones derivadas del simulador):**
   - `Aplicar al análisis` (primario).
   - `Guardar como nueva versión` (secundario).
   - Sólo aparece cuando hay cambios respecto al estado inicial.

Microcopy en hover (tooltip):
- "Guardar análisis": "Crea una nueva entrada en tus análisis guardados."
- "Guardar nueva versión": "Añade el estado actual como nueva versión del análisis cargado."
- "Aplicar al análisis": "Sustituye los datos base del análisis actual con los valores del simulador."

---

## 6. Acceso a análisis guardados desde el header (siempre visible)

`src/pages/Index.tsx`:

- El botón **"Guardados"** del header pasa a estar **siempre visible**, no sólo cuando `niches.length > 0`.
- Cuando no hay análisis guardados aún:
  - El badge numérico no se muestra.
  - Al pulsarlo, el Dialog se abre igualmente y muestra el estado vacío del `NicheComparator` ("Aún no has guardado ningún análisis…") con un CTA `Guardar análisis actual` deshabilitado si no hay datos completos.
- Cuando hay análisis guardados, el badge muestra el contador (comportamiento actual).
- Se eliminan los renderizados duplicados del `NicheComparator` que hoy aparecen sueltos en la página cuando `niches.length === 0` — el acceso único pasa por el botón del header.

Resultado: el usuario puede consultar/gestionar sus análisis guardados desde cualquier paso del wizard sin perder estado.

---

## 7. Panel de Versiones rediseñado

Hoy mezcla tabla principal + sub-filas expandibles + diálogo paralelo de historial. Se simplifica con Tabs dentro del mismo Dialog:

```text
┌────────────────────────────────────────────────────────┐
│ Tabs: [ Análisis ]  [ Versiones del análisis ]         │
├────────────────────────────────────────────────────────┤
│ TAB 1 — Análisis                                       │
│  Tabla limpia, una fila por análisis (último estado):  │
│   Nombre · Marketplace · Formato · Precio · Clics      │
│   máximos · BACOS · Score · Estado · Acciones          │
│  Acciones por fila: [Cargar] [Ver versiones] [Borrar]  │
│                                                        │
│ TAB 2 — Versiones (al pulsar "Ver versiones")          │
│  Cabecera con nombre del análisis + botón "Volver".    │
│  Listado vertical de tarjetas (no tabla anidada):      │
│   ┌──────────────────────────────────────────────┐    │
│   │ Versión 3 · 4 jun 2026 · Actual              │    │
│   │ "Probado con PVP más alto"                   │    │
│   │ Score 78 · Clics 12 · BACOS 34%              │    │
│   │              [Cargar] [Restaurar]            │    │
│   └──────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

Cambios concretos:
- Eliminadas las filas expandibles dentro de la tabla principal y el `isHistoryDialogOpen` paralelo.
- Versión actual marcada con badge `Actual` neutro.
- Cada tarjeta muestra: número, fecha, nota, Score, Clics máximos, BACOS, y 2 acciones de texto claro (`Cargar`, `Restaurar`).
- Iconos redundantes (`Eye`, `RotateCcw`, `History`) sustituidos por labels.
- Filtros y orden sólo en Tab 1.

---

## 8. Archivos a modificar

- `src/components/kdp/wizard/StepResults.tsx` — reordenar secciones, sacar simulador del Collapsible, consolidar botones, envolver Tabla + Consejo en un Accordion "Información complementaria".
- `src/components/kdp/ScoreDisplay.tsx` (modo embedded) — quitar gradientes, layout 2 columnas, acciones primarias al pie del score.
- `src/components/kdp/PaperbackSimulator.tsx` — layout 2 columnas, copy sin abreviaturas, tooltips en labels, sin fondos coloreados decorativos.
- `src/components/kdp/PositioningSection.tsx` — eliminar gradientes y fondos `bg-primary/10` decorativos.
- `src/components/kdp/ResultsTable.tsx` — emojis → puntos de color, copy expandido, leyenda sutil.
- `src/components/kdp/NicheComparator.tsx` — rehacer modo embedded con Tabs (Análisis / Versiones), eliminar expansión de filas y diálogo de historial separado.
- `src/pages/Index.tsx` — botón "Guardados" siempre visible en header; eliminar renderizado duplicado de `NicheComparator` cuando no hay nichos.

---

## Notas técnicas

- Reutiliza componentes existentes (`Accordion`, `Tabs`, `Tooltip`, `Card`, `Button`). Sin dependencias nuevas.
- La cinta sticky del simulador es `sticky bottom-0` dentro de su Card, no `fixed` global.
- Toda la lógica de cálculo (`useKdpCalculator`, `useScoring`, `useNicheComparator`) permanece intacta. Cambio puramente de presentación, copy y reorganización de CTAs.
