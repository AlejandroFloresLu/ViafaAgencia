const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireRoleLevel } = require('../middlewares/roleAuth');

// Todas las rutas requieren estar logueado
router.use(verifyToken);

// Lector y superior (Nivel 1, 2, 3, 4)
router.get('/', requireRoleLevel([1, 2, 3, 4]), cardController.getCards);

// Auxiliar y superior (Nivel 1, 2, 3)
router.post('/', requireRoleLevel([1, 2, 3]), cardController.createCard);

// Futuras implementaciones (PUT para nivel 1 y 2, DELETE para nivel 1)
// router.put('/:id', requireRoleLevel([1, 2]), cardController.updateCard);
// router.delete('/:id', requireRoleLevel([1]), cardController.deleteCard);

module.exports = router;
