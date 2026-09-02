const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRoleLevel } = require('../middlewares/roleAuth');

router.use(verifyToken);

// GET: Todos los niveles leen
router.get('/', requireRoleLevel([1, 2, 3, 4]), transactionController.getTransactions);

// POST: Nivel 1, 2, 3 (Auxiliar puede registrar transacciones)
router.post('/', requireRoleLevel([1, 2, 3]), transactionController.createTransaction);

module.exports = router;
