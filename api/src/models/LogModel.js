const supabase = require('../config/supabase');

class LogModel {
  static async getLogs(page = 1, limit = 10, filters = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('logs')
      .select('*, usuarios(usu_nombre)', { count: 'exact' });

    if (filters.log_tabla) query = query.eq('log_tabla', filters.log_tabla);
    if (filters.log_accion) query = query.eq('log_accion', filters.log_accion);

    const { data, count, error } = await query
      .order('log_created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data, total: count, page, limit };
  }
}

module.exports = LogModel;
