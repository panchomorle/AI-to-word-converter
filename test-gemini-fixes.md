# Pruebas de corrección del motor Gemini

## Pruebas de \$ y \% dentro de fórmulas

### Ejemplo 1: Precio simple
Un artículo de tecnología cuesta $\$40.000$. Por pagar con tarjeta de crédito, sufre un **recargo del $15\%$** sobre el precio de lista. Sin embargo, el local ofrece un **descuento del $10\%$**

### Ejemplo 2: Fórmula con resultado monetario
Recargo del $15\%$: $40.000 \cdot 1,15 = \$46.000$ (o calculando el 15% que es 6.000 y sumándolo).

### Ejemplo 3: Fórmula con mathbf
Descuento del $10\%$ sobre el nuevo monto: $46.000 \cdot 0,90 = \mathbf{\$41.400}$ (el 10% de 46.000 es 4.600; $46.000 - 4.600 = 41.400$).

### Ejemplo 4: Display math con símbolos de moneda
$$\text{Precio final} = \$40.000 \times 1.15 \times 0.90 = \$41.400$$

## Pruebas de \left y \right

### Ejemplo con paréntesis escalados
$$\frac{x + 1}{2} - 2\left(x - \frac{1}{3}\right) = \frac{x}{6} + 1$$

### Más ejemplos
$$\left[\frac{a}{b}\right]$$
$$\left\{\frac{x^2}{y^2}\right\}$$
$$\left|\frac{1}{2}\right|$$
