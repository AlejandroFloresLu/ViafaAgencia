const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ error: 'Token no provisto' });
  }

  const token = authHeader.split(' ')[1]; // Formato: "Bearer <token>"
  if (!token) {
    return res.status(403).json({ error: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
    req.user = decoded; // { id, rol_nivel, rol_nombre }
    
    // NOTA: Para RLS, podríamos setear este token en supabase o pasarlo de alguna forma, 
    // pero por ahora el middleware asume la protección a nivel de Express.
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
