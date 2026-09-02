# Reglas de Diseño y Desarrollo Frontend (Neo-Banking Premium)

Al trabajar en este repositorio, siempre se deben respetar estas normas estéticas, de responsividad y heurísticas de usabilidad para mantener la calidad premium del producto.

## 1. Arquitectura de Layout y Navegación (Sidebar + Topbar)
El estándar de usabilidad administrativa obliga a usar un **Menú Lateral Persistente (Sidebar)** combinado con una **Barra Superior Contextual (Topbar)**.
- **Topbar:** Elementos globales de control. Buscador del sistema, Centro de notificaciones, Selector de rol/perfil (ej. "Auxiliar", "Gerente").
- **Sidebar:** Opciones de negocio agrupadas según la **Ley de Miller** (bloques de 5 a 7 opciones máximo). Ejemplo para Gestor de Tarjetas: *MIS TARJETAS*, *OPERACIONES*, *AJUSTES*.

## 2. Usabilidad en Botones de Acción (Ubicación Estratégica)
Dentro de una vista principal (Dashboard o Tabla):
- **Acción Principal (Crear/Guardar):** Un solo botón destacado (Color Primario) posicionado **arriba a la derecha** de la pantalla.
- **Acciones Secundarias / Cancelar:** Al lado del botón principal, con estilo sutil (Glass).
- **Acciones Destructivas:** Aisladas visualmente y en rojo (`#C01B22`).

## 3. Diseño para Aplicaciones Multi-Rol
Esta aplicación es operada por **Auxiliares** (captura rápida de datos, teclado) y **Gerentes** (visión macro, gráficas, KPIs).
- **Vistas dinámicas:** El Topbar debe indicar claramente el rol. No satures a un gerente con botones de captura masiva, ni a un auxiliar con KPIs irrelevantes a su función inmediata.
- **Prevención de Error:** Cambios críticos requieren modales de confirmación o un "Undo" temporal (Toast).

## 4. Uso Estricto del Color (HCI y UX del Rojo)
**NUNCA usar rojo (`#C01B22`) como color primario de botones habituales (Guardar, Aceptar, Siguiente).**
- **SÍ usar Rojo:** Acciones destructivas irreversibles, bordes de input con error, alertas críticas. Acompañar siempre de un icono para WCAG (accesibilidad).
- **Color Primario (Guardar/Aceptar):** Azul (`#195B9C`).

## 5. Estética y Tema (Glassmorphism & Dark Mode)
- **Fondo:** `#0a0a0f`.
- **Paneles:** Glassmorphism (`background: rgba(255, 255, 255, 0.03)`, `backdrop-filter: blur(20px)`).
- **Tipografía:** `Outfit` (Interfaz general) y `Space Mono` (Montos numéricos, datos de tarjetas).

## 6. Responsividad Absoluta (Mobile-First)
- Breakpoints en 900px. La cuadrícula principal colapsa a `1fr`. Sidebar debe colapsar a menú oculto en móviles.
