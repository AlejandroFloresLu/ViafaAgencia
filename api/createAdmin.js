require('dotenv').config();
const supabase = require('./src/config/supabase');
const bcrypt = require('bcryptjs');

async function createInitialAdmin() {
  console.log('Iniciando creación de administrador...');

  try {
    // 1. Insertar roles básicos si no existen
    const roles = [
      { rol_nombre: 'Administrador', rol_nivel: 1 },
      { rol_nombre: 'Gestor', rol_nivel: 2 },
      { rol_nombre: 'Auxiliar', rol_nivel: 3 },
      { rol_nombre: 'Auditor', rol_nivel: 4 }
    ];
    
    const { data: existingRoles } = await supabase.from('roles').select('*');
    let adminRoleId;
    
    if (existingRoles && existingRoles.length > 0) {
      console.log('Los roles ya existen.');
      const adminRole = existingRoles.find(r => r.rol_nivel === 1);
      if (adminRole) adminRoleId = adminRole.rol_id;
    } else {
      console.log('Creando roles predeterminados...');
      const { data: newRoles, error: rolesError } = await supabase.from('roles').insert(roles).select();
      if (rolesError) throw rolesError;
      adminRoleId = newRoles.find(r => r.rol_nivel === 1).rol_id;
    }

    if (!adminRoleId) throw new Error("No se pudo obtener el ID del rol Administrador");

    // 2. Crear usuario administrador
    const email = 'admin@viafa.com';
    const rawPassword = 'admin'; // Contraseña temporal
    
    // Check if user already exists
    const { data: existingUser } = await supabase.from('usuarios').select('*').eq('usu_email', email).single();
    
    if (existingUser) {
        console.log('El usuario administrador ya existe. Inicia sesión con: admin@viafa.com');
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    console.log(`Creando usuario: ${email}`);

    const { data: newUser, error: userError } = await supabase
      .from('usuarios')
      .insert([{
        rol_id: adminRoleId,
        usu_email: email,
        usu_password_hash: hashedPassword,
        usu_nombre: 'Super Admin',
        usu_estado: 'activo'
      }])
      .select();

    if (userError) throw userError;

    console.log('\n✅ ¡ÉXITO! Administrador creado.');
    console.log('--------------------------------');
    console.log('Correo: admin@viafa.com');
    console.log('Contraseña: admin');
    console.log('--------------------------------');
    
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
}

createInitialAdmin();
