const express = require('express');
const router = express.Router();
const accountStatementController = require('../controllers/accountStatementController');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRoleLevel } = require('../middlewares/roleAuth');

router.use(verifyToken);
// Todos pueden ver estados de cuenta, los filtros por rol aplican en el modelo/controlador (por hacer)
// pero a nivel ruta lo dejamos abierto
router.get('/', requireRoleLevel([1, 2, 3, 4]), accountStatementController.getStatements);

module.exports = router;
