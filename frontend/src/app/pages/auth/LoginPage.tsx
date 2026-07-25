import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { authService } from "../../../services/auth.service";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { GraduationCap, ArrowRight, Loader2, Mail, Lock, Shield } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [adminMode, setAdminMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  const extraerError = (err: any, fallback: string) =>
    err?.response?.data?.error || err?.response?.data?.message || fallback;

  const entrarSegunRol = (user: any) => {
    navigate(user?.rol === "admin" ? "/admin" : "/dashboard");
  };

  // Inicio de sesión con correo institucional + contraseña
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { accessToken, user } = await authService.login({
        correo_institucional: email.toLowerCase().trim(),
        password,
      });

      // En el acceso de administrador exigimos rol admin.
      if (adminMode && user?.rol !== "admin") {
        setError("Esta cuenta no tiene permisos de administrador.");
        setIsLoading(false);
        return;
      }

      login(accessToken, user);
      entrarSegunRol(user);
    } catch (err: any) {
      setError(extraerError(err, "Correo o contraseña incorrectos."));
    } finally {
      setIsLoading(false);
    }
  };

  // Recibe el ID token de Google y lo canjea por el JWT de InUPA
  const handleGoogleCredential = async (idToken: string) => {
    setError("");
    setIsLoading(true);
    try {
      const { accessToken, user } = await authService.googleLogin(idToken);
      login(accessToken, user);
      entrarSegunRol(user);
    } catch (err: any) {
      setError(extraerError(err, "No se pudo iniciar sesión con Google."));
    } finally {
      setIsLoading(false);
    }
  };

  // Google Identity Services (solo en el acceso de estudiantes)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || adminMode) return;

    const renderGoogleButton = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !googleBtnRef.current) return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => handleGoogleCredential(response.credential),
      });
      googleBtnRef.current.innerHTML = "";
      google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline", size: "large", text: "continue_with", width: 320, locale: "es",
      });
    };

    if ((window as any).google?.accounts?.id) { renderGoogleButton(); return; }
    const existing = document.getElementById("google-gsi-script");
    if (existing) { existing.addEventListener("load", renderGoogleButton); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true; script.defer = true; script.id = "google-gsi-script";
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminMode]);

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
        </div>

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFD700] text-[#003366] rounded-xl p-2.5 shadow-lg">
              <GraduationCap className="size-6" />
            </div>
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
              Tu futuro<br />profesional<br />
              <span className="text-[#FFD700]">comienza aquí</span>
            </h1>
            <p className="text-white/60 text-base max-w-sm leading-relaxed">
              La plataforma de vinculación laboral diseñada exclusivamente para la comunidad universitaria de la UPA.
            </p>
          </div>

          <div className="space-y-2.5 mb-8">
            {[
              { title: "Empleos exclusivos", desc: "Vacantes seleccionadas para estudiantes y recién egresados" },
              { title: "CV con inteligencia artificial", desc: "Optimiza tu currículum y mejora tus probabilidades" },
              { title: "Red profesional UPA", desc: "Conecta con mentores, empresas y compañeros" },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-3.5 items-start bg-white/[0.055] rounded-xl p-3.5 border border-white/[0.08]">
                <div className="bg-[#FFD700]/20 rounded-lg p-1.5 mt-0.5 flex-shrink-0">
                  <GraduationCap className="size-4 text-[#FFD700]" />
                </div>
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
        <div className="w-full max-w-[400px] space-y-7">
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-6">
            <div className="bg-[#003366] text-white rounded-xl p-2.5">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-2xl font-bold text-[#003366]">InUPA</span>
          </div>

          <div>
            {adminMode ? (
              <>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003366] bg-[#003366]/[0.08] px-2.5 py-1 rounded-full mb-2">
                  <Shield className="size-3.5" /> Acceso administrador
                </div>
                <h2 className="text-3xl font-bold text-[#2C3E50] tracking-tight">Panel de administración</h2>
                <p className="text-[#7F8C8D] text-sm mt-1.5">Ingresa con tu cuenta de administrador.</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-[#2C3E50] tracking-tight">Bienvenido</h2>
                <p className="text-[#7F8C8D] text-sm mt-1.5 leading-relaxed">
                  Inicia sesión con tu correo{" "}
                  <span className="font-semibold text-[#003366]">@alumnos.upa.edu.mx</span>
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                <span className="size-4 flex items-center justify-center rounded-full bg-red-100 font-bold">!</span>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#2C3E50]">Correo institucional</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
                <Input
                  id="email" type="email"
                  placeholder={adminMode ? "admin@upa.edu.mx" : "up230188@alumnos.upa.edu.mx"}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm"
                  required disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-[#2C3E50]">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
                <Input
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm"
                  required disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full h-11 bg-[#003366] hover:bg-[#002244] disabled:bg-[#003366]/70 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {isLoading ? (<><Loader2 className="size-4 animate-spin" />Ingresando...</>) : (<>Iniciar sesión<ArrowRight className="size-4" /></>)}
            </button>
          </form>

          {/* Registro + Google (solo en acceso de estudiantes) */}
          {!adminMode && (
            <>
              <p className="text-center text-sm text-[#7F8C8D]">
                ¿No tienes cuenta?{" "}
                <Link to="/register" className="text-[#003366] font-semibold hover:underline">Crear cuenta</Link>
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                  <span className="text-xs text-[#7F8C8D] font-medium">o continúa con</span>
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                </div>
                <div ref={googleBtnRef} className="flex justify-center" />
              </div>
            </>
          )}

          {/* Acceso administrador AL FONDO */}
          <div className="pt-2 border-t border-[#F0F0F0] text-center">
            <button
              type="button"
              onClick={() => { setAdminMode(!adminMode); setError(""); }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7F8C8D] hover:text-[#003366] mt-3"
            >
              <Shield className="size-3.5" />
              {adminMode ? "Volver al acceso de estudiantes" : "Acceso administrador"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
