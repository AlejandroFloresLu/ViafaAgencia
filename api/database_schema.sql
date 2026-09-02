-- =======================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - SUPABASE
-- Proyecto: Sistema de Tarjetas (Neo-Banking)
-- Tablas: roles, usuarios, tarjetas, transacciones
-- Nomenclatura: Prefijos por tabla (rol_, usu_, tar_, tra_)
-- =======================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1.-- ==========================================
-- 1. TABLA: ROLES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.roles (
    rol_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rol_nombre TEXT NOT NULL UNIQUE, -- Ej: 'Super-Admin', 'Gestor', 'Auxiliar', 'Auditor'
    rol_nivel INTEGER NOT NULL UNIQUE, -- 1: Admin, 2: Gestor, 3: Auxiliar, 4: Auditor
    rol_descripcion TEXT,
    rol_estado TEXT DEFAULT 'ACT' CHECK (rol_estado IN ('ACT', 'DEC')), -- Estado: ACTivo / DESactivado
    rol_created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserción inicial de los 4 roles básicos para que la BD empiece con ellos
INSERT INTO public.roles (rol_nombre, rol_nivel, rol_descripcion) VALUES 
('Super-Admin', 1, 'Control total (SELECT, INSERT, UPDATE, DELETE)'),
('Gestor', 2, 'Coordinador (SELECT, INSERT, UPDATE)'),
('Auxiliar', 3, 'Captura de datos (SELECT, INSERT)'),
('Auditor', 4, 'Solo lectura (SELECT)')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 2. TABLA: USUARIOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    usu_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rol_id UUID REFERENCES public.roles(rol_id) ON DELETE SET NULL,
    usu_nombre TEXT NOT NULL,
    usu_correo TEXT UNIQUE NOT NULL,
    usu_contrasenia TEXT NOT NULL, -- Contraseña encriptada (hash)
    usu_estado TEXT DEFAULT 'ACT' CHECK (usu_estado IN ('ACT', 'DEC')), -- Estado
    usu_created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. TABLA: TARJETAS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tarjetas (
    tar_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usu_id UUID REFERENCES public.usuarios(usu_id) ON DELETE CASCADE,
    tar_alias TEXT,
    tar_nombre_titular TEXT NOT NULL,

    tar_ultimos_digitos TEXT,
    tar_fecha_expiracion TEXT,
    tar_franquicia TEXT,
    tar_tipo TEXT,
    tar_dia_corte INTEGER,
    tar_cupo_maximo NUMERIC(12,2) DEFAULT 0.00 CHECK (tar_cupo_maximo >= 0),
    tar_saldo_usado NUMERIC(12,2) DEFAULT 0.00 CHECK (tar_saldo_usado >= 0),
    tar_saldo_disponible NUMERIC(12,2) DEFAULT 0.00 CHECK (tar_saldo_disponible >= 0),
    tar_permite_diferir BOOLEAN DEFAULT false,
    tar_estado TEXT DEFAULT 'ACT' CHECK (tar_estado IN ('ACT', 'DEC')), -- Estado
    tar_created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. TABLA: TRANSACCIONES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transacciones (
    tra_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usu_id UUID REFERENCES public.usuarios(usu_id) ON DELETE CASCADE,
    tar_id UUID REFERENCES public.tarjetas(tar_id) ON DELETE CASCADE NOT NULL,
    tra_tipo TEXT NOT NULL DEFAULT 'gasto' CHECK (tra_tipo IN ('gasto', 'ingreso')), -- Solo permite 'gasto' o 'ingreso'
    tra_monto NUMERIC(12,2) NOT NULL CHECK (tra_monto > 0), -- No puede haber transacciones de 0 o negativas
    tra_detalle TEXT,
    tra_fecha DATE NOT NULL,
    tra_es_diferido BOOLEAN DEFAULT false,
    tra_meses INTEGER DEFAULT 1 CHECK (tra_meses > 0),
    tra_cuota NUMERIC(12,2) DEFAULT 0.00 CHECK (tra_cuota >= 0),
    tra_estado TEXT DEFAULT 'ACT' CHECK (tra_estado IN ('ACT', 'DEC')), -- Estado
    tra_created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. TABLA: ESTADOS DE CUENTA (Histórico Mensual)
-- ==========================================
-- Esta tabla guarda la "foto" exacta de cómo cerró la tarjeta cada mes
-- para poder graficar el historial sin tener que sumar miles de transacciones cada vez.
CREATE TABLE IF NOT EXISTS public.estados_cuenta (
    est_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tar_id UUID REFERENCES public.tarjetas(tar_id) ON DELETE CASCADE NOT NULL,
    est_anio INTEGER NOT NULL,
    est_mes INTEGER NOT NULL,
    est_cupo_maximo NUMERIC(12,2) NOT NULL CHECK (est_cupo_maximo >= 0),
    est_saldo_usado NUMERIC(12,2) NOT NULL CHECK (est_saldo_usado >= 0),
    est_saldo_disponible NUMERIC(12,2) NOT NULL CHECK (est_saldo_disponible >= 0),
    est_total_gastado_mes NUMERIC(12,2) DEFAULT 0.00 CHECK (est_total_gastado_mes >= 0),
    est_total_pagado_mes NUMERIC(12,2) DEFAULT 0.00 CHECK (est_total_pagado_mes >= 0),
    est_created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tar_id, est_anio, est_mes) -- Garantiza solo un registro por mes por tarjeta
);

-- ==========================================
-- 6. TABLA: LOGS (Auditoría)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.logs (
    log_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usu_id UUID REFERENCES public.usuarios(usu_id) ON DELETE SET NULL, -- Quién hizo la acción
    log_accion TEXT NOT NULL, -- Ej: 'INSERT', 'UPDATE', 'DELETE'
    log_tabla TEXT NOT NULL,  -- Ej: 'tarjetas', 'transacciones'
    log_registro_id UUID,     -- ID del registro afectado (puede ser nulo si se extrae del JSON)
    log_detalles JSONB,       -- Datos modificados (opcional)
    log_created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) & POLÍTICAS
-- ==========================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarjetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados_cuenta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para obtener el Nivel de Rol del usuario actual
-- Asume que el ID del usuario logueado en Supabase (auth.uid()) coincide con usu_id
CREATE OR REPLACE FUNCTION obtener_nivel_rol_usuario()
RETURNS INTEGER AS $$
DECLARE
    v_nivel INTEGER;
BEGIN
    SELECT r.rol_nivel INTO v_nivel
    FROM public.usuarios u
    JOIN public.roles r ON u.rol_id = r.rol_id
    WHERE u.usu_id = auth.uid();
    
    RETURN COALESCE(v_nivel, 99); -- 99 si no tiene rol (sin permisos)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------
-- Políticas Globales para TODAS las tablas principales (tarjetas, transacciones)
-- ------------------------------------------
-- 1. SELECT: Roles 1, 2, 3, 4 pueden Leer (<= 4)
CREATE POLICY "Lectura global permitida" ON public.tarjetas FOR SELECT USING (obtener_nivel_rol_usuario() <= 4);
CREATE POLICY "Lectura global permitida" ON public.transacciones FOR SELECT USING (obtener_nivel_rol_usuario() <= 4);
CREATE POLICY "Lectura global permitida" ON public.estados_cuenta FOR SELECT USING (obtener_nivel_rol_usuario() <= 4);

-- 2. INSERT: Roles 1, 2, 3 pueden Insertar (<= 3)
CREATE POLICY "Inserción permitida R1-R3" ON public.tarjetas FOR INSERT WITH CHECK (obtener_nivel_rol_usuario() <= 3);
CREATE POLICY "Inserción permitida R1-R3" ON public.transacciones FOR INSERT WITH CHECK (obtener_nivel_rol_usuario() <= 3);

-- 3. UPDATE: Roles 1, 2 pueden Actualizar (<= 2)
CREATE POLICY "Actualización permitida R1-R2" ON public.tarjetas FOR UPDATE USING (obtener_nivel_rol_usuario() <= 2);
CREATE POLICY "Actualización permitida R1-R2" ON public.transacciones FOR UPDATE USING (obtener_nivel_rol_usuario() <= 2);

-- 4. DELETE: Solo Rol 1 puede Borrar (= 1)
CREATE POLICY "Borrado permitido R1" ON public.tarjetas FOR DELETE USING (obtener_nivel_rol_usuario() = 1);
CREATE POLICY "Borrado permitido R1" ON public.transacciones FOR DELETE USING (obtener_nivel_rol_usuario() = 1);

-- ==========================================
-- TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- ==========================================
-- Esta función se ejecuta automáticamente al insertar una nueva transacción
-- y actualiza el saldo de la tarjeta de forma segura en la base de datos.
CREATE OR REPLACE FUNCTION actualizar_saldos_tarjeta()
RETURNS TRIGGER AS $$
DECLARE
    v_anio INTEGER;
    v_mes INTEGER;
    v_tarjeta RECORD;
BEGIN
    -- 1. Actualizar saldos en la tabla principal de Tarjetas
    IF NEW.tra_tipo = 'gasto' THEN
        UPDATE public.tarjetas
        SET tar_saldo_usado = tar_saldo_usado + NEW.tra_monto,
            tar_saldo_disponible = tar_saldo_disponible - NEW.tra_monto
        WHERE tar_id = NEW.tar_id;
    ELSIF NEW.tra_tipo = 'ingreso' THEN
        UPDATE public.tarjetas
        SET tar_saldo_usado = tar_saldo_usado - NEW.tra_monto,
            tar_saldo_disponible = tar_saldo_disponible + NEW.tra_monto
        WHERE tar_id = NEW.tar_id;
    END IF;

    -- 2. Mantener actualizado el Estado de Cuenta Mensual (Histórico)
    v_anio := EXTRACT(YEAR FROM NEW.tra_fecha);
    v_mes := EXTRACT(MONTH FROM NEW.tra_fecha);
    
    -- Obtener el estado actual de la tarjeta DESPUÉS de la actualización
    SELECT tar_cupo_maximo, tar_saldo_usado, tar_saldo_disponible 
    INTO v_tarjeta 
    FROM public.tarjetas WHERE tar_id = NEW.tar_id;

    -- Usar UPSERT (Insertar si no existe el mes, Actualizar si ya existe)
    INSERT INTO public.estados_cuenta (
        tar_id, est_anio, est_mes, est_cupo_maximo, 
        est_saldo_usado, est_saldo_disponible, 
        est_total_gastado_mes, est_total_pagado_mes
    ) VALUES (
        NEW.tar_id, v_anio, v_mes, v_tarjeta.tar_cupo_maximo,
        v_tarjeta.tar_saldo_usado, v_tarjeta.tar_saldo_disponible,
        CASE WHEN NEW.tra_tipo = 'gasto' THEN NEW.tra_monto ELSE 0 END,
        CASE WHEN NEW.tra_tipo = 'ingreso' THEN NEW.tra_monto ELSE 0 END
    )
    ON CONFLICT (tar_id, est_anio, est_mes) DO UPDATE SET 
        est_cupo_maximo = EXCLUDED.est_cupo_maximo,
        est_saldo_usado = EXCLUDED.est_saldo_usado,
        est_saldo_disponible = EXCLUDED.est_saldo_disponible,
        est_total_gastado_mes = estados_cuenta.est_total_gastado_mes + EXCLUDED.est_total_gastado_mes,
        est_total_pagado_mes = estados_cuenta.est_total_pagado_mes + EXCLUDED.est_total_pagado_mes;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_saldos
AFTER INSERT ON public.transacciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_saldos_tarjeta();

-- ==========================================
-- AUDITORÍA (Logs) TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION funcion_auditoria_logs()
RETURNS TRIGGER AS $$
DECLARE
    v_record_id UUID;
BEGIN
    -- Extraer el ID correcto según la tabla para guardarlo en la columna log_registro_id
    IF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'tarjetas' THEN v_record_id := OLD.tar_id;
        ELSIF TG_TABLE_NAME = 'transacciones' THEN v_record_id := OLD.tra_id; END IF;
        
        INSERT INTO public.logs (log_accion, log_tabla, log_registro_id, log_detalles)
        VALUES ('DELETE', TG_TABLE_NAME, v_record_id, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF TG_TABLE_NAME = 'tarjetas' THEN v_record_id := NEW.tar_id;
        ELSIF TG_TABLE_NAME = 'transacciones' THEN v_record_id := NEW.tra_id; END IF;

        INSERT INTO public.logs (log_accion, log_tabla, log_registro_id, log_detalles)
        VALUES ('UPDATE', TG_TABLE_NAME, v_record_id, jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'tarjetas' THEN v_record_id := NEW.tar_id;
        ELSIF TG_TABLE_NAME = 'transacciones' THEN v_record_id := NEW.tra_id; END IF;

        INSERT INTO public.logs (log_accion, log_tabla, log_registro_id, log_detalles)
        VALUES ('INSERT', TG_TABLE_NAME, v_record_id, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger de auditoría para Tarjetas
CREATE TRIGGER trg_auditar_tarjetas
AFTER INSERT OR UPDATE OR DELETE ON public.tarjetas
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();

-- Trigger de auditoría para Transacciones
CREATE TRIGGER trg_auditar_transacciones
AFTER INSERT OR UPDATE OR DELETE ON public.transacciones
FOR EACH ROW EXECUTE FUNCTION funcion_auditoria_logs();

-- ==========================================
-- PROTECCIÓN DE LA TABLA LOGS (Inmutabilidad)
-- ==========================================
CREATE OR REPLACE FUNCTION prevenir_modificacion_logs()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'SEGURIDAD: La tabla de logs es estrictamente de auditoría. No se permiten UPDATE ni DELETE.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proteger_logs
BEFORE UPDATE OR DELETE ON public.logs
FOR EACH ROW EXECUTE FUNCTION prevenir_modificacion_logs();

-- Nota: Como los prefijos cambiaron y agregamos usuarios/roles/logs, las políticas RLS 
-- deberán ajustarse según cómo decidas conectar public.usuarios con auth.users de Supabase.
-- Por ahora, puedes dejar RLS activo pero sin políticas si vas a probar desde el Backend Node.js 
-- (usando el Service Role Key temporalmente) o definir políticas genéricas de lectura/escritura.
