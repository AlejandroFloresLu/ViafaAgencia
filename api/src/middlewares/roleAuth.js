/**
 * Middleware para restringir rutas basadas en el Nivel de Rol.
 * @param {Array<number>} allowedLevels - Arreglo de niveles permitidos, ej. [1, 2]
 */
exports.requireRoleLevel = (allowedLevels) => {
  return (req, res, next) => {
    const userRoleLevel = req.user?.rol_nivel;

    if (!userRoleLevel) {
      return res.status(403).json({ error: 'Nivel de rol no encontrado en el token' });
    }

    // Verificar si el nivel del usuario está en el arreglo de niveles permitidos
    // o si podemos hacerlo matemáticamente: allowedLevels es un nivel máximo? 
    // Lo haremos con arreglo de roles permitidos explícitamente para mayor control.
    if (!allowedLevels.includes(userRoleLevel)) {
      return res.status(403).json({ 
        error: 'No tienes los permisos necesarios para realizar esta acción' 
      });
    }

    next();
  };
};
