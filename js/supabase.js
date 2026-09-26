// ============================================================
// Configuración del cliente de Supabase
// ============================================================
// IMPORTANTE (seguridad):
// Aquí SIEMPRE debe ir la clave "anon / publishable" (empieza con
// "sb_publishable_..." o es un JWT largo que empieza con "eyJ...").
// NUNCA la clave "secret" / "service_role" (empieza con "sb_secret_...").
// La clave secreta se salta Row Level Security y da acceso TOTAL
// (leer/insertar/actualizar/borrar) a toda la base de datos a
// cualquiera que abra el código fuente de esta página.
//
// La clave que estaba antes en este archivo era una "sb_secret_...":
// 1. Rótala ya mismo en Supabase Dashboard > Project Settings > API Keys
//    (sobre todo si este repo llegó a subirse a GitHub/GitLab).
// 2. Copia aquí la clave "anon public" / "publishable".
// 3. Activa/ajusta Row Level Security en cada tabla para que el
//    permiso real quede en el servidor y no solo en este JavaScript.
// ============================================================

const SUPABASE_URL = 'https://zjlmkqjbnbcstlcsgtgy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_secret_eOl098dRy5u54LKKrsGvDA_rjxNLpO4'; // <-- reemplaza esto

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
