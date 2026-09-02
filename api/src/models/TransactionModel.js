const supabase = require('../config/supabase');

class TransactionModel {
  static async createTransaction(data) {
    const { data: newTx, error } = await supabase
      .from('transacciones')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return newTx;
  }

  // Paginación: offset y limit (default 10)
  static async getTransactions(page = 1, limit = 10, filters = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('transacciones')
      .select('*, tarjetas(tar_alias)', { count: 'exact' });

    // Aplicar filtros dinámicos (ej: por usu_id o tar_id)
    if (filters.usu_id) query = query.eq('usu_id', filters.usu_id);
    if (filters.tar_id) query = query.eq('tar_id', filters.tar_id);

    const { data, count, error } = await query
      .order('tra_created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, total: count, page, limit };
  }
}

module.exports = TransactionModel;
