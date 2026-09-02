const LogModel = require('../models/LogModel');

exports.getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    if (req.query.tabla) filters.log_tabla = req.query.tabla;
    if (req.query.accion) filters.log_accion = req.query.accion;

    const result = await LogModel.getLogs(page, limit, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
