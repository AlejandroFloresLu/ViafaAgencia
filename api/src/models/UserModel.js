const supabase = require('../config/supabase');

class UserModel {
  static async createUser(userData) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(rol_nivel, rol_nombre)')
      .eq('usu_correo', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 es 'No rows found'
    return data;
  }

  static async getUserById(id) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(rol_nivel, rol_nombre)')
      .eq('usu_id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async getAllUsers() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(rol_nombre)');
    if (error) throw error;
    return data;
  }
}

module.exports = UserModel;
