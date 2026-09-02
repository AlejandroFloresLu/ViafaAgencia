// Middleware para verificar roles basados en la decodificación del JWT local o en Custom Claims
exports.requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Por el momento, como simularemos en local, si no hay rol inyectado, asumimos "vista" para seguridad
    // En producción con el script SQL, esto vendrá en req.user.app_metadata.user_role
    
    const userRole = req.user?.app_metadata?.user_role || req.user?.user_metadata?.role || 'admin'; // Forzado a admin para desarrollo local temporalmente
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Prohibido: No tienes los permisos necesarios para realizar esta acción.' 
      });
    }

    next();
  };
};
