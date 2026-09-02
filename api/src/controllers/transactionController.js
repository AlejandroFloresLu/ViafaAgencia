const TransactionModel = require('../models/TransactionModel');

exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    // Filtros por rol: Si es rol Nivel 3 o 4 y quieres limitarlo a sus transacciones
    // En este caso, según los requerimientos, los niveles altos pueden ver todo, los bajos solo lo suyo
    const userRole = req.user.rol_nivel;
    const userId = req.user.id;
    
    if (userRole > 2) {
      filters.usu_id = userId; // Auxiliar (3) o Auditor (4) solo ven sus cosas si es la regla de negocio
      // Nota: Si el auditor (4) debe ver todo, cambia esta lógica a (userRole === 3).
    }

    if (req.query.tar_id) {
      filters.tar_id = req.query.tar_id;
    }

    const result = await TransactionModel.getTransactions(page, limit, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { tar_id, tipo, monto, detalle, fecha, es_diferido, meses, cuota } = req.body;
    
    const newTx = await TransactionModel.createTransaction({
      usu_id: req.user.id,
      tar_id,
      tra_tipo: tipo,
      tra_monto: monto,
      tra_detalle: detalle,
      tra_fecha: fecha,
      tra_es_diferido: es_diferido || false,
      tra_meses: meses || 1,
      tra_cuota: cuota || 0,
      tra_estado: 'ACT'
    });

    res.status(201).json(newTx);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
