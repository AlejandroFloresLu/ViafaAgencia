const CardModel = require('../models/CardModel');
const { detectFranchise } = require('../utils/cardUtils');

exports.getCards = async (req, res) => {
  try {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    const cards = await CardModel.getCardsByUserId(userId);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCard = async (req, res) => {
  try {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    const { alias, nombre, numero, fechaExp, franquicia, tipo, cupo, permite_diferir } = req.body;
    
    // Mapear los campos del frontend a la base de datos
    const cardData = {
      usu_id: userId,
      tar_alias: alias,
      tar_nombre_titular: nombre,
      tar_fecha_expiracion: fechaExp,
      tar_tipo: tipo,
      tar_cupo_maximo: cupo || 0,
      tar_saldo_disponible: cupo || 0, // Inicia con todo el cupo disponible
      tar_saldo_usado: 0,
      tar_permite_diferir: permite_diferir || false,
      tar_estado: 'ACT'
    };
    
    if (numero) {
       // 1. Extraer últimos 4 dígitos
       cardData.tar_ultimos_digitos = numero.slice(-4);
       
       // 2. Deducir la franquicia inteligentemente si el usuario no la pasó o queremos sobreescribirla
       const franquiciaDeducida = detectFranchise(numero);
       cardData.tar_franquicia = franquiciaDeducida !== 'Desconocida' ? franquiciaDeducida : (franquicia || 'Desconocida');
       
       // IMPORTANTE: El número completo NUNCA se guarda en el objeto cardData ni en la base de datos.
    } else {
       cardData.tar_franquicia = franquicia || 'Desconocida';
    }

    const newCard = await CardModel.createCard(cardData);

    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
