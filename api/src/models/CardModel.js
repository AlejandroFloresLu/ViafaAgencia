const supabase = require('../config/supabase');

class CardModel {
  static async getCards(page = 1, limit = 10, filters = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('tarjetas')
      .select('*', { count: 'exact' });
      
    if (filters.usu_id) query = query.eq('usu_id', filters.usu_id);
    
    // Por defecto solo traer tarjetas activas a menos que se pida otro estado
    if (filters.tar_estado) {
      query = query.eq('tar_estado', filters.tar_estado);
    } else {
      query = query.eq('tar_estado', 'ACT');
    }

    const { data, count, error } = await query
      .order('tar_created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, total: count, page, limit };
  }

  // Crear una nueva tarjeta
  static async createCard(cardData) {
    const { data, error } = await supabase
      .from('tarjetas')
      .insert([cardData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateCard(cardId, cardData) {
    const { data, error } = await supabase
      .from('tarjetas')
      .update(cardData)
      .eq('tar_id', cardId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteCard(cardId) {
    // Borrado lógico de tarjeta
    const { data, error } = await supabase
      .from('tarjetas')
      .update({ tar_estado: 'INA' })
      .eq('tar_id', cardId)
      .select()
      .single();
    if (error) throw error;

    // Actualizar todas las transacciones asociadas a estado 'DEC'
    await supabase
      .from('transacciones')
      .update({ tra_estado: 'DEC' })
      .eq('tar_id', cardId);

    return data;
  }
}

module.exports = CardModel;
