
# Plan: Simulador Desplegable con Persistencia de Datos

## Resumen

Transformar el simulador de optimizacion de ventana emergente (Dialog) a componente desplegable in-situ (Collapsible), con persistencia de datos del simulador en los analisis guardados.

---

## Cambios Requeridos

### 1. Nuevos Tipos para Estado del Simulador

**Archivo: `src/types/kdp.ts`**

Agregar una nueva interfaz para el estado del simulador:

```typescript
export interface SimulatorData {
  interior: InteriorType;
  size: BookSize;
  pvp: number;
  pages: number;
  cpc: number;
  margenObjetivo: number;
}
```

Modificar `NicheVersion` y `SavedNiche` para incluir:

```typescript
// En NicheVersion
simulatorData?: SimulatorData;

// En SavedNiche
simulatorData?: SimulatorData;
```

---

### 2. Refactorizar PaperbackSimulator

**Archivo: `src/components/kdp/PaperbackSimulator.tsx`**

Cambios principales:
- Recibir estado inicial opcional via props (`initialSimState`)
- Emitir cambios de estado via callback (`onStateChange`)
- El Card wrapper se elimina para que el componente pueda integrarse dentro de un Collapsible
- Agregar boton "Aplicar como nueva version" cuando hay un nicho cargado

Nueva interfaz de props:

```typescript
interface PaperbackSimulatorProps {
  data: PaperbackData;
  globalData: GlobalData;
  initialSimState?: SimulatorData;
  onStateChange?: (state: SimulatorData) => void;
  onApplyAsVersion?: () => void;
  showApplyButton?: boolean;
  embedded?: boolean; // Para quitar el Card wrapper
}
```

---

### 3. Modificar StepResults para Collapsible

**Archivo: `src/components/kdp/wizard/StepResults.tsx`**

Cambios:
- Reemplazar Dialog por Collapsible de Radix UI
- Mantener el estado del simulador localmente (`simulatorState`)
- Pasar el estado al componente `PaperbackSimulator`
- Incluir el estado del simulador al guardar analisis/version
- Agregar boton "Aplicar como nueva version" dentro del simulador

Estructura visual:

```text
[Simulador de optimizacion]  [Expandir/Contraer]
+------------------------------------------------------------+
| (Cuando expandido)                                          |
|                                                             |
|  [Controles del simulador: sliders, selects, etc.]          |
|                                                             |
|  [Resultados simulados]                                     |
|                                                             |
|  [Aplicar como nueva version] (si hay nicho cargado)        |
+------------------------------------------------------------+
```

---

### 4. Actualizar Hook useNicheComparator

**Archivo: `src/hooks/useNicheComparator.ts`**

Modificar funciones para incluir `simulatorData`:

- `saveCurrentAsNiche`: Recibir `simulatorData` como parametro opcional
- `updateNicheWithNewVersion`: Recibir `simulatorData` como parametro opcional
- Al restaurar version: Cargar tambien el `simulatorData` si existe

Nueva firma de funciones:

```typescript
saveCurrentAsNiche: (
  name: string,
  globalData: GlobalData,
  ebookData: EbookData | null,
  paperbackData: PaperbackData | null,
  ebookResults: EbookResults | null,
  paperbackResults: PaperbackResults | null,
  inversionDiaria: number,
  simulatorData?: SimulatorData  // NUEVO
) => SavedNiche;

updateNicheWithNewVersion: (
  id: string,
  ...
  simulatorData?: SimulatorData  // NUEVO
) => SavedNiche | null;
```

---

### 5. Actualizar WizardContainer

**Archivo: `src/components/kdp/WizardContainer.tsx`**

- Mantener estado del simulador a nivel del wizard (`simulatorState`)
- Pasar el estado al `StepResults`
- Recibir actualizaciones del simulador via callback
- Pasar `simulatorData` a las funciones de guardado

---

### 6. Actualizar Index.tsx

**Archivo: `src/pages/Index.tsx`**

- Mantener estado del simulador
- Al cargar un nicho guardado, tambien cargar su `simulatorData`
- Pasar el estado y callbacks al `WizardContainer`

---

## Flujo de Datos

```text
Index.tsx
  |
  |-- simulatorState (useState)
  |-- Carga simulatorData al cargar nicho
  |
  v
WizardContainer
  |
  |-- Recibe simulatorState
  |-- Pasa a StepResults
  |
  v
StepResults
  |
  |-- Collapsible expandible
  |-- PaperbackSimulator (embedded)
  |     |-- Emite cambios via onStateChange
  |     |-- Muestra boton "Aplicar como nueva version"
  |
  |-- Al guardar analisis: incluye simulatorData
  v
useNicheComparator
  |
  |-- Persiste simulatorData en localStorage
```

---

## Seccion Tecnica

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/types/kdp.ts` | Agregar `SimulatorData`, modificar `NicheVersion` y `SavedNiche` |
| `src/components/kdp/PaperbackSimulator.tsx` | Agregar props para estado externo, modo embedded, boton aplicar |
| `src/components/kdp/wizard/StepResults.tsx` | Cambiar Dialog por Collapsible, gestionar estado simulador |
| `src/hooks/useNicheComparator.ts` | Agregar simulatorData a funciones de guardado |
| `src/components/kdp/WizardContainer.tsx` | Gestionar estado simulador a nivel wizard |
| `src/pages/Index.tsx` | Mantener estado simulador, cargar al abrir nicho |

### Dependencias a Usar

- `@radix-ui/react-collapsible` (ya instalado: `src/components/ui/collapsible.tsx`)
- Lucide icons: `ChevronDown`, `ChevronUp`

### Estado del Simulador por Defecto

Cuando no hay datos previos:

```typescript
const defaultSimulatorState: SimulatorData = {
  interior: paperbackData.interior || 'BN',
  size: paperbackData.size || 'SMALL',
  pvp: paperbackData.pvp || 9.99,
  pages: paperbackData.pages || 100,
  cpc: globalData.cpc || 0.35,
  margenObjetivo: globalData.margenObjetivoPct || 30,
};
```

---

## Beneficios

1. **Sin perdida de datos** - El simulador mantiene estado al expandir/contraer
2. **Persistencia completa** - Los datos del simulador se guardan con el analisis
3. **Restauracion fiel** - Al abrir un analisis guardado, el simulador muestra los ultimos valores usados
4. **Aplicar cambios** - Boton para crear nueva version con los valores del simulador
5. **UX mejorada** - Desplegable in-situ, sin ventanas emergentes que interrumpan

---

## Orden de Implementacion

1. Modificar `src/types/kdp.ts` - Agregar tipos
2. Modificar `src/hooks/useNicheComparator.ts` - Agregar parametro simulatorData
3. Modificar `src/components/kdp/PaperbackSimulator.tsx` - Modo embedded y callbacks
4. Modificar `src/components/kdp/wizard/StepResults.tsx` - Cambiar Dialog por Collapsible
5. Modificar `src/components/kdp/WizardContainer.tsx` - Gestionar estado
6. Modificar `src/pages/Index.tsx` - Cargar/guardar estado simulador
