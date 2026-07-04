# Mejoras del sistema de scoring

## Objetivo
Hacer el score de viabilidad más transparente, configurable y verificable, con consejos accionables y tests que garanticen su comportamiento progresivo.

## 1. Tests unitarios de `calculateScore`
Nuevo archivo `src/hooks/useScoring.test.ts` con Vitest + React Testing Library ya configurados en el proyecto (si faltan deps, se añaden según guía interna). Casos cubiertos:

- **Progresividad de clics**: score total crece estrictamente al subir `clicsMaxPorVenta` de 10 → 14 manteniendo BACOS y precio constantes.
- **Progresividad de BACOS**: score total crece al subir `margenPct` de 30 → 45 manteniendo clics.
- **PVP nunca fijo en 10/10 arbitrario**: con `pvp > precioMinRecomendado` pero clics=10 y BACOS=30, el bonus PVP debe ser proporcional (< 10), no máximo.
- **PVP máximo solo con clics y BACOS máximos**: pvp>min, clics≥14, BACOS≥40 → pvpVsMinScore = 10.
- **Corte de viabilidad**: clics<10 o BACOS<30 → sus componentes = 0.
- **Estado global**: totalScore ≥ 80 → `excellent`; 50–79 → `viable`; <50 → `not-recommended`.

## 2. Consejos automáticos bajo el score
En `ResultsHeader.tsx`, añadir bloque "Próximo paso recomendado" justo debajo de la barra de progreso. La lógica calcula el mayor déficit relativo:

- Si `clicsScore < 50` y es el mayor déficit → sugerir **subir precio** (más margen absoluto → más clics/venta) u **optimizar CPC/público** (bajar CPC objetivo).
- Si `bacosScore < 40` y es el mayor déficit → sugerir **reducir costes** (páginas, tipo de impresión) o **subir precio** para elevar BACOS.
- Si ambos están máximos → mensaje de enhorabuena y sugerir escalar inversión.
- Si `pvp < precioMin` → prioridad absoluta: **subir PVP al mínimo viable**.

Diseño: tarjeta con icono `Lightbulb`, título y 1-2 acciones concretas con el número objetivo (ej. "Sube el precio a 12,99€ para desbloquear 15 pts adicionales").

## 3. Umbrales configurables
Nuevo módulo `src/lib/scoringConfig.ts` con la configuración por defecto y tipos:

```ts
export interface ScoringThresholds {
  clicks: { min: number; tiers: Array<{ value: number; points: number }> };
  bacos: { tiers: Array<{ minPct: number; points: number }> };
}
```

Valores por defecto = los actuales (10/11/12/13/14 → 8/15/25/35/50; 30/35/40 → 15/25/40).

`calculateScore` acepta un segundo argumento opcional `thresholds` para inyectarlos (los tests lo aprovechan). El hook `useScoring` los lee de un contexto `ScoringConfigContext` con provider en `App.tsx` que expone `thresholds` + `setThresholds` (persistido en `localStorage`).

**UI**: nueva sección "Umbrales de scoring" dentro del `Accordion` de "Información complementaria" en `StepResults.tsx`, con inputs numéricos por tier y botón "Restaurar valores por defecto".

## 4. Consistencia clics/BACOS en el cálculo
Refactor de `calculateScore`:
- Eliminar la ruta especial `precioMinRecomendado === null → pvpVsMinScore = 10`. En ese caso se aplica la misma ponderación proporcional a `clicsScore` y `bacosScore`.
- El bonus PVP se renombra internamente a `optimizationBonus` (0–10) que refleja **cuánto está ya optimizado** el binomio clics+BACOS.
- Se documenta en JSDoc que el PVP solo actúa como gate de viabilidad (0 si < mínimo), y que el resto es siempre función de clics+BACOS.

## 5. Desglose visual del score
En `ScoreDisplay.tsx`, la sección de tarjetas ya existe. Se refuerza:

- Añadir bajo cada tarjeta (Clics, BACOS, PVP) un chip con nivel **Bajo / Medio / Alto** calculado a partir del ratio `puntos / máximo`:
  - `< 0.34` → Bajo (rojo)
  - `0.34–0.66` → Medio (naranja)
  - `> 0.66` → Alto (verde)
- Cabecera de la sección muestra en una línea: `Clics XX/50 · BACOS XX/40 · Optimización XX/10` con los mismos chips.
- El componente `ResultsHeader` reutiliza el mismo helper `getLevel(points, max)` para mantener consistencia.

## Archivos afectados
- **Nuevo**: `src/lib/scoringConfig.ts`, `src/contexts/ScoringConfigContext.tsx`, `src/hooks/useScoring.test.ts`, `src/components/kdp/wizard/ScoringThresholdsEditor.tsx`, `src/test/setup.ts` + `vitest.config.ts` (si no existen).
- **Editados**: `src/hooks/useScoring.ts` (firma con thresholds + refactor optimizationBonus), `src/components/kdp/wizard/ResultsHeader.tsx` (bloque de consejo), `src/components/kdp/ScoreDisplay.tsx` (chips de nivel + desglose), `src/components/kdp/wizard/StepResults.tsx` (montaje del editor de umbrales), `src/App.tsx` (Provider).

## Detalles técnicos
- Persistencia de umbrales: `localStorage['kdp.scoring.thresholds.v1']` con validación por zod antes de aplicar.
- Compatibilidad hacia atrás: los `SavedNiche` guardados con la ponderación anterior siguen renderizando bien; el score se recalcula en runtime con los umbrales actuales del usuario.
- Los tests se ejecutan con `bunx vitest run src/hooks/useScoring.test.ts`.
