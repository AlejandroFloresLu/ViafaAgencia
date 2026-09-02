# Gestor de Tarjetas de Crédito (Demo)

Este proyecto es una aplicación web diseñada para ayudar a los usuarios a llevar un control y administración de sus tarjetas de crédito. Esta demo se enfoca en la experiencia visual y el flujo de usuario.

## Contexto y Propósito

La aplicación permite a una persona registrar múltiples tarjetas de crédito y tener una vista consolidada de su situación financiera relacionada con estas. El objetivo principal es evitar olvidos en fechas de pago y tener claro el crédito disponible en todo momento.

## Funcionalidades Principales

1. **Gestión de Múltiples Tarjetas**:
   - Registro de nuevas tarjetas con información parcial por seguridad (ej. `**** **** **** 1234`).
   - Asignación de cupo total (límite de crédito) para cada tarjeta.

2. **Panel de Control (Dashboard)**:
   - Visualización rápida del **cupo disponible** y el **cupo gastado** por cada tarjeta.
   - Fechas de corte y **fechas de pago** próximas.

3. **Registro de Gastos**:
   - Interfaz para registrar nuevos gastos, descontando automáticamente el valor del cupo disponible de la tarjeta seleccionada.

4. **Sistema de Alertas**:
   - Alertas visuales para fechas de pago próximas.
   - Notificaciones cuando se registra un nuevo gasto o se acerca al límite de crédito.

## Flujo del Proceso (Demo Visual)

1. **Pantalla de Inicio/Dashboard**: Vista general con el resumen de todas las tarjetas.
2. **Agregar Tarjeta**: 
   - El usuario ingresa los datos base (últimos 4 dígitos, franquicia, banco).
   - Se establece el cupo máximo de la tarjeta.
3. **Detalle de Tarjeta**: 
   - Vista específica de una tarjeta mostrando sus movimientos, saldo disponible, fecha de corte y fecha de pago.
4. **Registrar Movimiento**:
   - Formulario rápido para añadir un gasto y ver cómo se actualiza el cupo disponible en tiempo real (visualmente).

## Tecnologías Utilizadas

- **Frontend**: React.js + Vite (Desplegado en Vercel)
- **Backend**: Node.js + Express (Arquitectura MVC, Desplegado en Render)
- **Base de Datos**: PostgreSQL (Supabase)
- **Entorno Local**: Docker & Docker Compose
