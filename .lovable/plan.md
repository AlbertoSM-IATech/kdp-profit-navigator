
# Plan: Rediseno UX - Wizard de Viabilidad con Branding Publify

## Resumen Ejecutivo

Transformar la interfaz actual de multiples modulos en un **wizard guiado paso a paso** que simplifique la experiencia. Se integraran los logos de Publify en el header y se anadiran disclaimers de referencia en los consejos estrategicos.

---

## Logos Publify

Se copiaran los logos subidos al proyecto:
- **Logo completo** (`Artboard_26@2x.png`) → `src/assets/publify-logo.png` (para header desktop)
- **Logo icono** (`Artboard_23@2x.png`) → `src/assets/publify-icon.png` (para mobile/favicon)

---

## Estructura Visual del Wizard

```text
+------------------------------------------------------------------+
|  HEADER                                                          |
|  [Logo Publify]  Calculadora de Viabilidad   [Guardados] [Costes]|
+------------------------------------------------------------------+
|                                                                  |
|  WIZARD - Indicador de Progreso                                  |
|  [1. Formato] → [2. Mercado] → [3. Libro] → [4. Resultados]     |
|                                                                  |
|  +------------------------------------------------------------+  |
|  |                                                            |  |
|  |  CONTENIDO DEL PASO ACTUAL                                 |  |
|  |                                                            |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  [← Anterior]                               [Siguiente →]        |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Pasos del Wizard

### Paso 1: Formato
- Cards grandes con iconos claros
- eBook (icono BookOpen, color azul)
- Formato impreso (icono Book, color naranja)
- Sin otros campos, solo la seleccion

### Paso 2: Mercado y Competencia
- Marketplace (dropdown ES/COM)
- CPC estimado (input con tooltip explicativo)
- Ventas diarias competencia (input con tooltip)
- Margen objetivo (input con advertencia si menor a 30%)

### Paso 3: Datos del Libro
**Si eBook:**
- PVP, Regalia (70%/35%), Tamano MB (solo 70%), IVA (solo ES)

**Si Formato Impreso:**
- Encuadernacion (Tapa blanda/dura)
- Tipo impresion, Tamano, Paginas, PVP, IVA (solo ES)
- Muestra coste de impresion calculado en tiempo real

### Paso 4: Resultados Finales
Layout completo:

1. **Score Global** (destacado arriba)
   - Numero grande con estado visual
   - Desglose: Clics, BACOS, PVP vs Min

2. **Tabla de Resultados** (ancho completo)

3. **Metricas + Consejo Estrategico** (2 columnas: 25/75)
   - Izquierda: Conversion Ref., Clics Diarios, Inversion Diaria
   - Derecha: Texto de consejo + breakeven + **DISCLAIMER**

4. **Acciones** (botones)
   - Exportar PDF (naranja, destacado)
   - Guardar version (si hay nicho cargado)

---

## Disclaimer Obligatorio

Texto a mostrar al final del consejo estrategico y en el PDF:

> **Aviso importante:** Los valores mostrados son estimaciones orientativas basadas en los datos introducidos y en tasas de referencia del sector. No constituyen predicciones exactas de resultados. El rendimiento real de tus campanas dependera de multiples factores como la calidad creativa, la competencia del momento, las tendencias del mercado y la ejecucion de la estrategia.

---

## Nuevos Archivos a Crear

| Archivo | Proposito |
|---------|-----------|
| `src/assets/publify-logo.png` | Logo completo (copiado) |
| `src/assets/publify-icon.png` | Icono logo (copiado) |
| `src/components/kdp/WizardContainer.tsx` | Contenedor principal del wizard con navegacion |
| `src/components/kdp/wizard/StepFormat.tsx` | Paso 1: Seleccion de formato |
| `src/components/kdp/wizard/StepMarket.tsx` | Paso 2: Mercado y competencia |
| `src/components/kdp/wizard/StepBookData.tsx` | Paso 3: Datos del libro (dinamico) |
| `src/components/kdp/wizard/StepResults.tsx` | Paso 4: Resultados finales |
| `src/components/kdp/wizard/WizardProgress.tsx` | Indicador de progreso visual |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/Index.tsx` | Reemplazar layout actual por WizardContainer, integrar logo Publify en header |
| `src/components/kdp/PositioningSection.tsx` | Anadir disclaimer al final |
| `src/components/kdp/ScoreDisplay.tsx` | Anadir disclaimer en guia de accion y PDF |

---

## Seccion Tecnica

### Componente WizardContainer

```typescript
// Estados principales
const [currentStep, setCurrentStep] = useState(0);
const steps = ['Formato', 'Mercado', 'Libro', 'Resultados'];

// Validacion por paso
const canProceed = (step: number) => {
  switch(step) {
    case 0: return !!globalData.selectedFormat;
    case 1: return !!globalData.marketplace && 
                   globalData.cpc !== null && 
                   globalData.ventasDiariasCompetencia !== null;
    case 2: return isBookDataComplete(); // Depende del formato
    case 3: return true; // Siempre puede ver resultados
  }
};
```

### Componente WizardProgress

Barra visual con:
- Circulos numerados para cada paso
- Linea conectora entre pasos
- Estado activo/completado/pendiente
- Colores Publify (naranja para activo/completado)

### Integracion de Logos

```tsx
// En el header
import publifyLogo from '@/assets/publify-logo.png';
import publifyIcon from '@/assets/publify-icon.png';

// Desktop
<img src={publifyLogo} alt="Publify" className="h-8" />

// Mobile
<img src={publifyIcon} alt="Publify" className="h-8 w-8" />
```

### Reutilizacion de Hooks Existentes

El wizard seguira usando los mismos hooks sin modificaciones:
- `useKdpCalculator` - Calculos de regalias
- `useScoring` - Score de viabilidad
- `useNicheComparator` - Gestion de nichos guardados

### Simulador

El simulador de optimizacion (PaperbackSimulator) se movera fuera del flujo principal:
- Accesible desde un boton en Step 4
- Se abrira en un Dialog modal
- Solo visible cuando hay resultados de formato impreso

---

## Beneficios del Rediseno

1. **Branding Publify** - Logo visible, identidad coherente
2. **Menor saturacion visual** - Un paso a la vez
3. **Proceso guiado** - El usuario no se pierde
4. **Resultados enfocados** - Todo lo importante en una pantalla
5. **Disclaimers claros** - Expectativas realistas
6. **Simulador separado** - No distrae del analisis principal

---

## Orden de Implementacion

1. Copiar logos a `src/assets/`
2. Crear componente `WizardProgress.tsx`
3. Crear pasos individuales (`StepFormat`, `StepMarket`, `StepBookData`)
4. Crear `StepResults.tsx` con layout de resultados
5. Crear `WizardContainer.tsx` con logica de navegacion
6. Modificar `PositioningSection.tsx` para anadir disclaimer
7. Modificar `ScoreDisplay.tsx` para anadir disclaimer
8. Refactorizar `Index.tsx` para usar el wizard con logo Publify
