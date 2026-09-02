const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRoleLevel } = require('../middlewares/roleAuth');

router.use(verifyToken);
// Solo el Admin (Nivel 1) y Gestor (Nivel 2) deberían ver roles, tal vez Nivel 3.
// Vamos a dejarlo abierto para los 3 primeros, o solo 1.
router.get('/', requireRoleLevel([1, 2]), roleController.getRoles);
router.get('/:id', requireRoleLevel([1, 2]), roleController.getRoleById);

module.exports = router;
