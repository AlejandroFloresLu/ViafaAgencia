const supabase = require('../config/supabase');

class RoleModel {
  static async getAllRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('rol_nivel', { ascending: true });
    if (error) throw error;
    return data;
  }

  static async getRoleById(id) {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('rol_id', id)
      .single();
    if (error) throw error;
    return data;
  }
}

module.exports = RoleModel;
