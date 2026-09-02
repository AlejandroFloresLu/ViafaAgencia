const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRoleLevel } = require('../middlewares/roleAuth');

router.use(verifyToken);
// Solo Super-Admin y Gestor pueden auditar logs (Nivel 1 y 2)
router.get('/', requireRoleLevel([1, 2]), logController.getLogs);

module.exports = router;
