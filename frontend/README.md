# 🕷️ Tarjetas Neo-Banking (Frontend)

Este proyecto React ha sido diseñado con un enfoque **Neo-Banking Premium** utilizando Dark Mode y Glassmorphism.

## 📚 Arquitectura y Normas de Usabilidad (HCI)

### 1. Arquitectura de Layout
- **Sidebar (Izquierda):** Navegación persistente estructurada usando la **Ley de Miller**. Agrupación: `MIS TARJETAS`, `OPERACIONES`, `PREFERENCIAS`.
- **Topbar (Arriba):** Elementos globales como Buscador, Notificaciones y Selector de Rol de Usuario.

### 2. Ubicación Estratégica de Botones
- El botón primario de acción (ej. `Guardar Tarjeta`) siempre se ubicará **arriba a la derecha** en las vistas de formulario y tablas.
- Acciones secundarias (`Cancelar`) van junto al botón principal con diseño sutil.

### 3. Colores y Estética
- **Fondo General:** `#0a0a0f`
- **Color Primario (Éxito, Neutro, Guardar):** `#195B9C` (Azul). **Nunca usar rojo para acciones positivas.**
- **Color de Peligro / Destrucción:** `#C01B22` (Rojo).

### 4. Fuentes
- **Outfit:** Para toda la interfaz y títulos.
- **Space Mono:** Exclusivo para números de tarjeta, CVV, montos monetarios.

## 🚀 Cómo Iniciar

```bash
npm install
npm run dev
```
