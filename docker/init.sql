-- =====================================================
-- BASE DE DATOS InUPA
-- Universidad Politécnica de Aguascalientes
-- Ingeniería en Sistemas Computacionales
-- Proyecto: Plataforma Inteligente de Vinculación y CV
-- =====================================================

-- Eliminar tablas existentes (en orden inverso de dependencias)
DROP TABLE IF EXISTS NOTIFICACIONES CASCADE;
DROP TABLE IF EXISTS POSTULACIONES CASCADE;
DROP TABLE IF EXISTS ADAPTACIONES_CV CASCADE;
DROP TABLE IF EXISTS VACANTE_HABILIDADES CASCADE;
DROP TABLE IF EXISTS PERFIL_HABILIDADES CASCADE;
DROP TABLE IF EXISTS PROYECTOS_PORTAFOLIO CASCADE;
DROP TABLE IF EXISTS EDUCACION CASCADE;
DROP TABLE IF EXISTS EXPERIENCIA_LABORAL CASCADE;
DROP TABLE IF EXISTS EMPRESA_RECLUTADORES CASCADE;
DROP TABLE IF EXISTS PERFILES CASCADE;
DROP TABLE IF EXISTS VACANTES CASCADE;
DROP TABLE IF EXISTS EMPRESAS CASCADE;
DROP TABLE IF EXISTS HABILIDADES CASCADE;
DROP TABLE IF EXISTS CATEGORIAS_HABILIDAD CASCADE;
DROP TABLE IF EXISTS USUARIOS CASCADE;

-- =====================================================
-- TABLA: USUARIOS
-- =====================================================
CREATE TABLE USUARIOS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula_o_rfc VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    correo_institucional VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'estudiante',
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: CATEGORIAS_HABILIDAD
-- =====================================================
CREATE TABLE CATEGORIAS_HABILIDAD (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- =====================================================
-- TABLA: HABILIDADES
-- =====================================================
CREATE TABLE HABILIDADES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    categoria_id UUID REFERENCES CATEGORIAS_HABILIDAD(id)
);

-- =====================================================
-- TABLA: EMPRESAS
-- =====================================================
CREATE TABLE EMPRESAS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) UNIQUE NOT NULL,
    rfc VARCHAR(50),
    industria VARCHAR(150),
    sitio_web VARCHAR(200),
    descripcion TEXT,
    logo_url VARCHAR(500),
    correo_contacto VARCHAR(200),
    telefono VARCHAR(30),
    ciudad VARCHAR(150),
    direccion VARCHAR(300),
    tamano VARCHAR(50),
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: PERFILES
-- =====================================================
CREATE TABLE PERFILES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES USUARIOS(id) ON DELETE CASCADE,
    titular_profesional VARCHAR(200),
    biografia TEXT,
    url_cv_base VARCHAR(500),
    url_foto VARCHAR(500),
    github_url VARCHAR(200),
    linkedin_url VARCHAR(200),
    telefono VARCHAR(20),
    ubicacion VARCHAR(200),
    disponibilidad BOOLEAN DEFAULT TRUE,
    buscando_empleo BOOLEAN DEFAULT TRUE,
    nivel_experiencia VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: EMPRESA_RECLUTADORES
-- =====================================================
CREATE TABLE EMPRESA_RECLUTADORES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES USUARIOS(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES EMPRESAS(id) ON DELETE CASCADE,
    rol VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: EXPERIENCIA_LABORAL
-- =====================================================
CREATE TABLE EXPERIENCIA_LABORAL (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES PERFILES(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES EMPRESAS(id),
    empresa_nombre VARCHAR(200),
    puesto VARCHAR(200) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    actual BOOLEAN DEFAULT FALSE,
    descripcion TEXT,
    tipo_contrato VARCHAR(100),
    tecnologias_usadas TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: EDUCACION
-- =====================================================
CREATE TABLE EDUCACION (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES PERFILES(id) ON DELETE CASCADE,
    institucion VARCHAR(200) NOT NULL,
    carrera_o_grado VARCHAR(200) NOT NULL,
    cohorte_o_grupo VARCHAR(50),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    graduado BOOLEAN DEFAULT FALSE,
    nivel_estudios VARCHAR(100),
    promedio DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: PROYECTOS_PORTAFOLIO
-- =====================================================
CREATE TABLE PROYECTOS_PORTAFOLIO (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES PERFILES(id) ON DELETE CASCADE,
    nombre_proyecto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    url_repositorio VARCHAR(500),
    url_despliegue VARCHAR(500),
    fecha_realizacion DATE,
    tecnologias TEXT[],
    rol_en_proyecto VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: PERFIL_HABILIDADES
-- =====================================================
CREATE TABLE PERFIL_HABILIDADES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES PERFILES(id) ON DELETE CASCADE,
    habilidad_id UUID REFERENCES HABILIDADES(id) ON DELETE CASCADE,
    nivel VARCHAR(50),
    anos_experiencia INTEGER,
    UNIQUE(perfil_id, habilidad_id)
);

-- =====================================================
-- TABLA: VACANTES
-- =====================================================
CREATE TABLE VACANTES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES EMPRESAS(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    requisitos TEXT,
    url_origen VARCHAR(500),
    activa BOOLEAN DEFAULT TRUE,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    salario_min DECIMAL(10,2),
    salario_max DECIMAL(10,2),
    modalidad VARCHAR(50),
    tipo_contrato VARCHAR(100),
    nivel_experiencia VARCHAR(50),
    ubicacion VARCHAR(200),
    fecha_limite DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: VACANTE_HABILIDADES
-- =====================================================
CREATE TABLE VACANTE_HABILIDADES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacante_id UUID REFERENCES VACANTES(id) ON DELETE CASCADE,
    habilidad_id UUID REFERENCES HABILIDADES(id) ON DELETE CASCADE,
    nivel_requerido VARCHAR(50),
    es_obligatoria BOOLEAN DEFAULT FALSE,
    UNIQUE(vacante_id, habilidad_id)
);

-- =====================================================
-- TABLA: ADAPTACIONES_CV
-- =====================================================
CREATE TABLE ADAPTACIONES_CV (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES PERFILES(id) ON DELETE CASCADE,
    vacante_id UUID REFERENCES VACANTES(id) ON DELETE CASCADE,
    contenido_adaptado JSONB,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: POSTULACIONES
-- =====================================================
CREATE TABLE POSTULACIONES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES PERFILES(id) ON DELETE CASCADE,
    vacante_id UUID REFERENCES VACANTES(id) ON DELETE CASCADE,
    cv_adaptado_id UUID REFERENCES ADAPTACIONES_CV(id),
    fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(perfil_id, vacante_id)
);

-- =====================================================
-- TABLA: CONEXIONES
-- Red profesional: un perfil sigue/conecta con otro perfil
-- =====================================================
CREATE TABLE CONEXIONES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES PERFILES(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES PERFILES(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CONSTRAINT check_no_auto_conexion CHECK (follower_id <> following_id)
);

-- =====================================================
-- TABLA: NOTIFICACIONES
-- Avisos internos para el usuario (postulaciones, conexiones, matches...)
-- =====================================================
CREATE TABLE NOTIFICACIONES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES USUARIOS(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    enlace VARCHAR(500),
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON USUARIOS
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perfiles_updated_at
    BEFORE UPDATE ON PERFILES
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================
CREATE INDEX idx_usuarios_correo ON USUARIOS(correo_institucional);
CREATE INDEX idx_usuarios_matricula ON USUARIOS(matricula_o_rfc);
CREATE INDEX idx_perfiles_usuario ON PERFILES(usuario_id);
CREATE INDEX idx_notificaciones_usuario ON NOTIFICACIONES(usuario_id, created_at DESC);
CREATE INDEX idx_notificaciones_no_leidas ON NOTIFICACIONES(usuario_id, leida);
CREATE INDEX idx_perfiles_buscando ON PERFILES(buscando_empleo, disponibilidad);
CREATE INDEX idx_experiencia_perfil ON EXPERIENCIA_LABORAL(perfil_id);
CREATE INDEX idx_experiencia_empresa ON EXPERIENCIA_LABORAL(empresa_id);
CREATE INDEX idx_educacion_perfil ON EDUCACION(perfil_id);
CREATE INDEX idx_proyectos_perfil ON PROYECTOS_PORTAFOLIO(perfil_id);
CREATE INDEX idx_perfil_habilidades_perfil ON PERFIL_HABILIDADES(perfil_id);
CREATE INDEX idx_perfil_habilidades_habilidad ON PERFIL_HABILIDADES(habilidad_id);
CREATE INDEX idx_vacantes_empresa ON VACANTES(empresa_id);
CREATE INDEX idx_vacantes_activas ON VACANTES(activa, fecha_publicacion DESC);
CREATE INDEX idx_vacantes_modalidad ON VACANTES(modalidad);
CREATE INDEX idx_vacantes_nivel ON VACANTES(nivel_experiencia);
CREATE INDEX idx_vacante_habilidades_vacante ON VACANTE_HABILIDADES(vacante_id);
CREATE INDEX idx_vacante_habilidades_habilidad ON VACANTE_HABILIDADES(habilidad_id);
CREATE INDEX idx_postulaciones_perfil ON POSTULACIONES(perfil_id);
CREATE INDEX idx_postulaciones_vacante ON POSTULACIONES(vacante_id);
CREATE INDEX idx_postulaciones_estado ON POSTULACIONES(estado);
CREATE INDEX idx_habilidades_nombre ON HABILIDADES(nombre);
CREATE INDEX idx_habilidades_categoria ON HABILIDADES(categoria_id);
CREATE INDEX idx_empresa_reclutadores_usuario ON EMPRESA_RECLUTADORES(usuario_id);
CREATE INDEX idx_empresa_reclutadores_empresa ON EMPRESA_RECLUTADORES(empresa_id);
CREATE INDEX idx_adaptaciones_cv_perfil ON ADAPTACIONES_CV(perfil_id);
CREATE INDEX idx_adaptaciones_cv_vacante ON ADAPTACIONES_CV(vacante_id);
CREATE INDEX idx_conexiones_follower ON CONEXIONES(follower_id);
CREATE INDEX idx_conexiones_following ON CONEXIONES(following_id);

-- =====================================================
-- CONSTRAINTS ADICIONALES DE VALIDACIÓN
-- =====================================================
ALTER TABLE USUARIOS 
ADD CONSTRAINT check_email_institucional 
CHECK (correo_institucional LIKE '%@alumnos.upa.edu.mx' 
       OR correo_institucional LIKE '%@upa.edu.mx'
       OR correo_institucional NOT LIKE '%@%');

ALTER TABLE VACANTES
ADD CONSTRAINT check_salario
CHECK (salario_min >= 0 AND (salario_max IS NULL OR salario_max >= salario_min));

ALTER TABLE EXPERIENCIA_LABORAL
ADD CONSTRAINT check_fechas_experiencia
CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio);

ALTER TABLE EDUCACION
ADD CONSTRAINT check_fechas_educacion
CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio);

ALTER TABLE POSTULACIONES
ADD CONSTRAINT check_estado_postulacion
CHECK (estado IN ('pendiente', 'revisada', 'aceptada', 'rechazada'));

-- =====================================================
-- COMENTARIOS EN TABLAS (Documentación)
-- =====================================================
COMMENT ON TABLE USUARIOS IS 'Usuarios del sistema (estudiantes y reclutadores)';
COMMENT ON TABLE PERFILES IS 'Perfiles profesionales de los estudiantes';
COMMENT ON TABLE EMPRESAS IS 'Empresas que publican vacantes';
COMMENT ON TABLE VACANTES IS 'Ofertas laborales publicadas';
COMMENT ON TABLE HABILIDADES IS 'Catálogo de habilidades técnicas y blandas';
COMMENT ON TABLE POSTULACIONES IS 'Registro de postulaciones a vacantes';

-- =====================================================
-- DATOS SEMILLA (para que la plataforma arranque funcional)
-- =====================================================

-- Cuenta de administrador dedicada (solo para gestionar la plataforma).
-- Login por OTP: en desarrollo el codigo se imprime en los logs del backend.
INSERT INTO USUARIOS (matricula_o_rfc, nombre_completo, correo_institucional, password_hash, rol)
VALUES ('ADMIN', 'Administrador InUPA', 'admin@upa.edu.mx', 'OTP_LOGIN_NO_PASSWORD', 'admin')
ON CONFLICT (correo_institucional) DO NOTHING;

-- Categorias y habilidades base
INSERT INTO CATEGORIAS_HABILIDAD (nombre) VALUES
    ('Lenguajes de Programación'),
    ('Frameworks y Librerías'),
    ('Bases de Datos'),
    ('Herramientas y DevOps')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO HABILIDADES (nombre, categoria_id) VALUES
    ('JavaScript',  (SELECT id FROM CATEGORIAS_HABILIDAD WHERE nombre = 'Lenguajes de Programación')),
    ('TypeScript',  (SELECT id FROM CATEGORIAS_HABILIDAD WHERE nombre = 'Lenguajes de Programación')),
    ('Python',      (SELECT id FROM CATEGORIAS_HABILIDAD WHERE nombre = 'Lenguajes de Programación')),
    ('React',       (SELECT id FROM CATEGORIAS_HABILIDAD WHERE nombre = 'Frameworks y Librerías')),
    ('Node.js',     (SELECT id FROM CATEGORIAS_HABILIDAD WHERE nombre = 'Frameworks y Librerías')),
    ('PostgreSQL',  (SELECT id FROM CATEGORIAS_HABILIDAD WHERE nombre = 'Bases de Datos')),
    ('Docker',      (SELECT id FROM CATEGORIAS_HABILIDAD WHERE nombre = 'Herramientas y DevOps')),
    ('Git',         (SELECT id FROM CATEGORIAS_HABILIDAD WHERE nombre = 'Herramientas y DevOps'))
ON CONFLICT (nombre) DO NOTHING;

-- Empresas de ejemplo
INSERT INTO EMPRESAS (nombre, industria, sitio_web, descripcion, correo_contacto, telefono, ciudad, direccion, tamano, activa) VALUES
    ('TechAgs Solutions', 'Tecnología', 'https://techags.example.com', 'Desarrollo de software a la medida para empresas de la región.', 'rh@techags.example.com', '449-100-1000', 'Aguascalientes', 'Av. Universidad 100', '50–200', TRUE),
    ('Innova Software', 'Software', 'https://innova.example.com', 'Fábrica de software especializada en soluciones web y móviles.', 'talento@innova.example.com', '449-200-2000', 'Aguascalientes', 'Blvd. Zacatecas 200', '200–500', TRUE),
    ('DataMX', 'Datos e IA', 'https://datamx.example.com', 'Consultoría de datos, analítica e inteligencia artificial.', 'jobs@datamx.example.com', '449-300-3000', 'Ciudad de México', 'Reforma 300', '1,000+', TRUE),
    ('Nube Digital', 'Cloud', 'https://nubedigital.example.com', 'Servicios de infraestructura en la nube y DevOps.', 'contacto@nubedigital.example.com', '449-400-4000', 'Guadalajara', 'Av. Chapultepec 400', '50–200', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Vacantes de ejemplo (empresa referenciada por nombre)
INSERT INTO VACANTES (empresa_id, titulo, descripcion, requisitos, activa, salario_min, salario_max, modalidad, tipo_contrato, nivel_experiencia, ubicacion, fecha_limite) VALUES
    ((SELECT id FROM EMPRESAS WHERE nombre = 'TechAgs Solutions'),
     'Desarrollador Frontend Jr', 'Únete al equipo de producto para construir interfaces con React y TypeScript.',
     'React, TypeScript, HTML/CSS. Deseable experiencia con Tailwind.', TRUE, 12000, 18000, 'Híbrido', 'Tiempo completo', 'Junior', 'Aguascalientes', CURRENT_DATE + INTERVAL '30 days'),
    ((SELECT id FROM EMPRESAS WHERE nombre = 'Innova Software'),
     'Desarrollador Backend Node.js', 'Diseño e implementación de APIs REST con Node.js y PostgreSQL.',
     'Node.js, Express, PostgreSQL, Git. Deseable Docker.', TRUE, 15000, 22000, 'Remoto', 'Tiempo completo', 'Junior', 'Remoto', CURRENT_DATE + INTERVAL '25 days'),
    ((SELECT id FROM EMPRESAS WHERE nombre = 'DataMX'),
     'Practicante de Ciencia de Datos', 'Apoya proyectos de analítica y modelos de datos con Python.',
     'Python, SQL, estadística básica. Ganas de aprender.', TRUE, 8000, 10000, 'Presencial', 'Prácticas', 'Sin experiencia', 'Ciudad de México', CURRENT_DATE + INTERVAL '40 days'),
    ((SELECT id FROM EMPRESAS WHERE nombre = 'Nube Digital'),
     'Ingeniero DevOps Jr', 'Automatización de despliegues y mantenimiento de infraestructura en la nube.',
     'Docker, Git, Linux. Deseable CI/CD y cloud.', TRUE, 16000, 24000, 'Híbrido', 'Tiempo completo', 'Junior', 'Guadalajara', CURRENT_DATE + INTERVAL '20 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- CONSULTA DE VERIFICACIÓN
-- =====================================================
SELECT 'Base de datos InUPA creada exitosamente' as estado,
       CURRENT_TIMESTAMP as fecha_creacion;
