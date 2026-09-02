const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRoleLevel } = require('../middlewares/roleAuth');

router.use(verifyToken);
// Solo Super-Admin (1) puede crear o listar todos los usuarios
router.get('/', requireRoleLevel([1]), userController.getUsers);
router.post('/', requireRoleLevel([1]), userController.createUser);

module.exports = router;
