const supabase = require('../config/supabase');

class CardModel {
  static async getCards(page = 1, limit = 10, filters = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('tarjetas')
      .select('*', { count: 'exact' });
      
    if (filters.usu_id) query = query.eq('usu_id', filters.usu_id);
    if (filters.tar_estado) query = query.eq('tar_estado', filters.tar_estado);

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

  // Nota: Ya no necesitamos updateBalance manual aquí si estamos usando Triggers 
  // en la base de datos (actualizar_saldos_tarjeta), pero lo dejamos comentado por si acaso.
  /*
  static async updateBalance(cardId, newSaldoDisponible, newSaldoUsado) {
    const { data, error } = await supabase
      .from('tarjetas')
      .update({ 
        tar_saldo_disponible: newSaldoDisponible,
        tar_saldo_usado: newSaldoUsado
      })
      .eq('tar_id', cardId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  */
}

module.exports = CardModel;
