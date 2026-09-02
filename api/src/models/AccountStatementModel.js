const supabase = require('../config/supabase');

class AccountStatementModel {
  static async getStatements(page = 1, limit = 10, filters = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('estados_cuenta')
      .select('*, tarjetas(tar_alias)', { count: 'exact' });

    if (filters.tar_id) query = query.eq('tar_id', filters.tar_id);
    if (filters.est_anio) query = query.eq('est_anio', filters.est_anio);
    if (filters.est_mes) query = query.eq('est_mes', filters.est_mes);

    const { data, count, error } = await query
      .order('est_anio', { ascending: false })
      .order('est_mes', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, total: count, page, limit };
  }
}

module.exports = AccountStatementModel;
