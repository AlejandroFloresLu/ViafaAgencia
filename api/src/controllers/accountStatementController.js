const AccountStatementModel = require('../models/AccountStatementModel');

exports.getStatements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    if (req.query.tar_id) filters.tar_id = req.query.tar_id;
    if (req.query.anio) filters.est_anio = parseInt(req.query.anio);
    if (req.query.mes) filters.est_mes = parseInt(req.query.mes);

    const result = await AccountStatementModel.getStatements(page, limit, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
