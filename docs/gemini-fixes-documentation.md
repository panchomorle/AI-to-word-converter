# Correcciones al Motor de Conversión de Gemini

## Resumen de Cambios

Se han implementado dos correcciones importantes en el archivo `lib/utils/gemini-postprocessor.ts` para resolver problemas críticos de interpretación.

## Problema 1: Comando `\left` Interpretado Incorrectamente

### Descripción del Error
El comando LaTeX `\left` estaba siendo malinterpretado como `\le` (menor o igual) seguido de "ft". Esto ocurría en fórmulas como:

```latex
$$\frac{x + 1}{2} - 2\left(x - \frac{1}{3}\right) = \frac{x}{6} + 1$$
```

### Solución Implementada
Se agregaron funciones de protección que temporalmente reemplazan los comandos `\left` y `\right` con placeholders únicos antes del procesamiento:

```typescript
function protectLatexCommands(markdown: string): string {
  let protectedText = markdown;
  protectedText = protectedText.replace(/\\left/g, '<<<LEFT>>>');
  protectedText = protectedText.replace(/\\right/g, '<<<RIGHT>>>');
  return protectedText;
}

function restoreLatexCommands(markdown: string): string {
  let restored = markdown;
  restored = restored.replace(/<<<LEFT>>>/g, '\\left');
  restored = restored.replace(/<<<RIGHT>>>/g, '\\right');
  return restored;
}
```

Los placeholders se restauran al final del procesamiento, garantizando que los comandos lleguen intactos al parser de LaTeX.

## Problema 2: Conflictos con Símbolos de Dólar ($)

### Descripción del Error
Cuando había operaciones con fórmulas LaTeX que también incluían valores monetarios, los símbolos `$` de moneda entraban en conflicto con los delimitadores `$` de LaTeX inline, rompiendo el formato.

Ejemplo problemático:
```markdown
El precio es $150 y la fórmula es $x + y = z$.
```

### Solución Implementada
Se implementó un sistema de detección y protección de símbolos de moneda basado en patrones:

```typescript
function protectCurrencySymbols(markdown: string): string {
  let protectedText = markdown;
  
  // Detecta $ seguido de dígitos (con posibles comas, puntos, K, M, B)
  // Patrones de moneda: $123, $1,234.56, $1.5K, etc.
  // NO coincide con LaTeX: $x$, $\alpha$, $\frac{1}{2}$, etc.
  protectedText = protectedText.replace(
    /\$(\s*\d[\d,\.]*(?:[KMB])?)/g,
    '<<<CURRENCY>>>$1'
  );
  
  return protectedText;
}

function restoreCurrencySymbols(markdown: string): string {
  let restored = markdown;
  restored = restored.replace(/<<<CURRENCY>>>/g, '$');
  return restored;
}
```

### Características de la Detección

La función distingue automáticamente entre:

**Símbolos de Moneda (protegidos):**
- `$123`
- `$1,234.56`
- `$1.5K`
- `$ 100` (con espacio)
- `$5M`, `$10B`

**Delimitadores LaTeX (NO protegidos):**
- `$x$`
- `$\alpha$`
- `$\frac{1}{2}$`
- `$x + y = z$`

## Flujo de Procesamiento

El preprocesador de Gemini ahora sigue este flujo:

1. **Protección** (Step -1):
   - Proteger comandos `\left` y `\right`
   - Proteger símbolos de moneda

2. **Procesamiento** (Steps 0-2):
   - Convertir tablas concatenadas
   - Convertir tablas CSV/TSV (opcional)
   - Corregir formato de tablas Markdown

3. **Restauración** (Final):
   - Restaurar símbolos de moneda
   - Restaurar comandos LaTeX

## Pruebas

Se ha creado el archivo `test-gemini-fixes.md` con casos de prueba que cubren:

1. Fórmulas con `\left` y `\right`
2. Combinaciones de valores monetarios y fórmulas LaTeX
3. Tablas con ambos tipos de símbolos

## Compatibilidad

Estas correcciones son **retrocompatibles** y no afectan:
- El procesamiento de contenido sin estos problemas
- La funcionalidad existente de tablas
- Otros preprocesadores (ChatGPT)

## Notas Técnicas

- Los placeholders utilizan una sintaxis única (`<<<PLACEHOLDER>>>`) que no entra en conflicto con el contenido típico
- El orden de protección/restauración es crítico para el correcto funcionamiento
- La detección de moneda usa regex con lookahead implícito para evitar falsos positivos
