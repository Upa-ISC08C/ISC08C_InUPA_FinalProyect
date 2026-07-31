import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  GraduationCap,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  Loader2,
  Shield,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/auth.service";

const features = [
  { icon: Briefcase, title: "Empleos exclusivos", desc: "Vacantes seleccionadas para estudiantes y recién egresados de la UPA" },
  { icon: Sparkles, title: "CV con inteligencia artificial", desc: "Optimiza tu currículum y mejora tus probabilidades de ser contratado" },
  { icon: Users, title: "Red profesional UPA", desc: "Conecta con mentores, empresas y compañeros de tu institución" },
];

// Función para auto-formatear el correo en el login
const formatEmailLogin = (val: string) => {
  const lower = val.toLowerCase();
  // Si empieza con "up", lo forzamos a "UP"
  if (lower.startsWith("up")) {
    return "UP" + lower.slice(2);
  }
  return lower;
};

// Función simple para decodificar el payload del JWT de Google y obtener el email
const decodeGoogleJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const esCorreoUPA = (email: string) => {
  return email.endsWith("@alumnos.upa.edu.mx") || email.endsWith("@upa.edu.mx");
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuthStore();

  const passedEmail = location.state?.email || "";
  const openRecover = location.state?.recover === true;

  const [email, setEmail] = useState(passedEmail);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(openRecover);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  const irSegunRol = (rol?: string) => navigate(rol === "admin" ? "/admin" : "/dashboard");
  const extraerError = (err: any, fb: string) => err?.response?.data?.error || err?.response?.data?.message || fb;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const user = await login(email.toLowerCase().trim(), password);
      irSegunRol(user.rol);
    } catch (err: any) {
      setError(extraerError(err, "Correo o contraseña incorrectos."));
    } finally {
      setIsLoading(false);
    }
  };

  // Google Identity Services con VALIDACIÓN DE DOMINIO
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    
    const render = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !googleBtnRef.current) return;
      
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: any) => {
          setError("");
          
          // 1. Decodificar el token para verificar el correo ANTES de enviarlo al backend
          const payload = decodeGoogleJWT(resp.credential);
          if (!payload || !payload.email) {
            setError("No se pudo verificar tu cuenta de Google.");
            return;
          }

          // 2. VALIDACIÓN ESTRICTA: Si no es de la UPA, se bloquea aquí mismo
          if (!esCorreoUPA(payload.email)) {
            setError("Solo se permiten correos institucionales (@alumnos.upa.edu.mx o @upa.edu.mx).");
            return;
          }

          // 3. Si pasa la validación, procedemos con el login
          try {
            const user = await loginWithGoogle(resp.credential);
            irSegunRol(user.rol);
          } catch (err: any) {
            setError(extraerError(err, "No se pudo iniciar sesión con Google."));
          }
        },
      });
      
      googleBtnRef.current.innerHTML = "";
      google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: 360,
        locale: "es",
      });
    };

    if ((window as any).google?.accounts?.id) {
      render();
      return;
    }
    const ex = document.getElementById("google-gsi-script");
    if (ex) {
      ex.addEventListener("load", render);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.id = "google-gsi-script";
    s.onload = render;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="min-h-screen flex bg-white font-[Poppins,sans-serif]">
      {/* Left panel – deep navy branding */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#003366] relative overflow-hidden flex-col">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-28 -right-28 size-96 rounded-full bg-white/[0.03]" />
          <div className="absolute top-1/2 -left-20 size-64 rounded-full bg-[#FFD700]/[0.07]" />
          <div className="absolute bottom-10 right-10 size-52 rounded-full bg-[#00A8E8]/[0.07]" />
          <svg className="absolute inset-0 size-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFD700] text-[#003366] rounded-xl p-2.5 shadow-lg"><GraduationCap className="size-6" /></div>
            <div>
              <p className="text-white font-bold text-xl tracking-tight">InUPA</p>
              <p className="text-white/45 text-[10px] tracking-widest uppercase font-medium">Plataforma Universitaria</p>
            </div>
          </div>

          <div className="my-auto space-y-5 pt-16 pb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3.5 py-1.5 text-white/75 text-xs font-medium border border-white/10">
              <span className="size-1.5 rounded-full bg-[#FFD700] inline-block" />
              Universidad Politécnica de Aguascalientes
            </div>
            <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.08] tracking-tight">
              Tu futuro<br />profesional<br /><span className="text-[#FFD700]">comienza aquí</span>
            </h1>
            <p className="text-white/60 text-base max-w-sm leading-relaxed">
              La plataforma de vinculación laboral diseñada exclusivamente para la comunidad universitaria de la UPA.
            </p>
          </div>

          <div className="space-y-2.5 mb-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3.5 items-start bg-white/[0.055] rounded-xl p-3.5 border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
                <div className="bg-[#FFD700]/20 rounded-lg p-1.5 mt-0.5 flex-shrink-0"><Icon className="size-4 text-[#FFD700]" /></div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-6">
            <div className="bg-[#003366] text-white rounded-xl p-2.5"><GraduationCap className="size-5" /></div>
            <span className="text-2xl font-bold text-[#003366]">InUPA</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#2C3E50] tracking-tight">Bienvenido</h2>
            <p className="text-[#7F8C8D] text-sm mt-1.5 leading-relaxed">
              Acceso exclusivo para <span className="font-semibold text-[#003366]">@alumnos.upa.edu.mx</span> o <span className="font-semibold text-[#003366]">@upa.edu.mx</span>
            </p>
          </div>

          {/* Google OAuth */}
          <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />

          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-[#E5E7EB]" />
            <span className="text-xs text-[#7F8C8D] uppercase tracking-wider font-medium whitespace-nowrap">O usa tu correo</span>
            <div className="flex-1 border-t border-[#E5E7EB]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                <span className="size-4 flex items-center justify-center rounded-full bg-red-100 font-bold">!</span>
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#2C3E50]">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="UP230188@alumnos.upa.edu.mx"
                value={email}
                onChange={(e) => setEmail(formatEmailLogin(e.target.value))}
                className="h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] focus:ring-[#003366]/20 text-sm"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-[#2C3E50]">Contraseña</Label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-semibold text-[#003366] hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#003366] hover:bg-[#002244] disabled:bg-[#003366]/70 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {isLoading ? (<><Loader2 className="size-4 animate-spin" />Ingresando...</>) : (<><>Iniciar sesión</><ArrowRight className="size-4" /></>)}
            </button>
          </form>

          <p className="text-center text-sm text-[#7F8C8D]">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-[#003366] font-semibold hover:underline">Crear cuenta gratis</Link>
          </p>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F5F7FA] border border-[#E5E7EB]">
            <div className="size-6 rounded-lg bg-[#003366] flex items-center justify-center flex-shrink-0">
              <Shield className="size-3.5 text-[#FFD700]" />
            </div>
            <p className="text-xs text-[#7F8C8D]">
              Acceso administrador: <span className="font-semibold text-[#2C3E50] select-all">admin@upa.edu.mx</span> (inicia sesión normal).
            </p>
          </div>
        </div>
      </div>

      {showForgot && <ForgotPasswordDialog defaultEmail={email} onClose={() => setShowForgot(false)} />}
    </div>
  );
}

// ... (Mantén tu componente ForgotPasswordDialog exactamente igual al que ya tenías) ...
function ForgotPasswordDialog({ defaultEmail, onClose }: { defaultEmail: string; onClose: () => void }) {
  // ... (copia y pega aquí tu código original del modal, no necesita cambios)
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState(defaultEmail);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inputCls = "h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm";

  const enviarCodigo = async () => {
    setError(""); setLoading(true);
    try { await authService.forgotPassword(email.toLowerCase().trim()); setPaso(2); } 
    catch (e: any) { setError(e?.response?.data?.error || "No se pudo enviar el código."); } 
    finally { setLoading(false); }
  };

  const verificarCodigo = async () => {
    setError(""); setLoading(true);
    try { await authService.verifyResetToken(email.toLowerCase().trim(), token.trim()); setPaso(3); } 
    catch (e: any) { setError(e?.response?.data?.error || "Código inválido."); } 
    finally { setLoading(false); }
  };

  const restablecer = async () => {
    setError("");
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try { await authService.resetPassword(email.toLowerCase().trim(), token.trim(), password); setPaso(4); } 
    catch (e: any) { setError(e?.response?.data?.error || "No se pudo restablecer la contraseña."); } 
    finally { setLoading(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="size-5 text-[#003366]" /> Recuperar contraseña</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {error && <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{error}</div>}
          {paso === 1 && (<>
            <p className="text-sm text-[#7F8C8D]">Escribe tu correo institucional y te enviaremos un código de 6 dígitos.</p>
            <Input type="email" placeholder="nombre@alumnos.upa.edu.mx" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            <Button onClick={enviarCodigo} disabled={loading || !email} className="w-full h-11">{loading ? <Loader2 className="size-4 animate-spin" /> : "Enviar código"}</Button>
          </>)}
          {paso === 2 && (<>
            <p className="text-sm text-[#7F8C8D]">Ingresa el código que enviamos a <b>{email}</b>.</p>
            <div className="py-2"><Input placeholder="000000" value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))} className="h-14 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-center text-3xl font-mono tracking-[0.5em] font-bold" maxLength={6} autoComplete="one-time-code" /></div>
            <Button onClick={verificarCodigo} disabled={loading || token.length !== 6} className="w-full h-11">{loading ? <Loader2 className="size-4 animate-spin" /> : "Verificar código"}</Button>
            <button onClick={enviarCodigo} className="text-xs text-[#003366] hover:underline w-full text-center">Reenviar código</button>
          </>)}
          {paso === 3 && (<>
            <p className="text-sm text-[#7F8C8D]">Ingresa tu nueva contraseña y confírmala.</p>
            <div className="relative"><Input type={showPassword ? "text" : "password"} placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls + " pr-10"} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
            <div className="relative"><Input type={showConfirm ? "text" : "password"} placeholder="Confirmar nueva contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls + " pr-10"} /><button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
            <Button onClick={restablecer} disabled={loading || !password || !confirmPassword} className="w-full h-11">{loading ? <Loader2 className="size-4 animate-spin" /> : "Guardar contraseña"}</Button>
          </>)}
          {paso === 4 && (<div className="text-center py-4 space-y-3"><CheckCircle2 className="size-10 text-[#16A34A] mx-auto" /><p className="text-sm text-[#2C3E50] font-semibold">¡Contraseña actualizada!</p><p className="text-xs text-[#7F8C8D]">Ya puedes iniciar sesión con tu nueva contraseña.</p><Button onClick={onClose} className="w-full h-11">Entendido</Button></div>)}
        </div>
      </DialogContent>
    </Dialog>
  );
}