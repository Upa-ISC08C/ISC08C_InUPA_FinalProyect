import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { authService } from "../../../services/auth.service";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { GraduationCap, ArrowRight, Loader2, Mail, KeyRound } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // paso 1 = pedir correo, paso 2 = capturar el código OTP
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const dominioValido = (correo: string) =>
    correo.endsWith("@alumnos.upa.edu.mx") || correo.endsWith("@upa.edu.mx");

  const extraerError = (err: any, fallback: string) =>
    err?.response?.data?.error || err?.response?.data?.message || fallback;

  // Paso 1: solicitar el código OTP al backend
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const normalizedEmail = email.toLowerCase().trim();
    if (!dominioValido(normalizedEmail)) {
      setError("Debes usar tu correo institucional de la UPA.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestToken(normalizedEmail);
      setEmail(normalizedEmail);
      setStep(2);
      setInfo("Te enviamos un código de 6 dígitos. Revisa tu correo institucional.");
    } catch (err: any) {
      setError(extraerError(err, "No se pudo enviar el código. Intenta de nuevo."));
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: verificar el código y entrar
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.trim().length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    setIsLoading(true);
    try {
      const { accessToken, user } = await authService.verifyToken(email, code.trim());
      login(accessToken, user);
      navigate(user?.rol === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(extraerError(err, "Código inválido o expirado."));
    } finally {
      setIsLoading(false);
    }
  };

  const volverAlCorreo = () => {
    setStep(1);
    setCode("");
    setError("");
    setInfo("");
  };

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
            <h2 className="text-3xl font-bold text-[#2C3E50] tracking-tight">Bienvenido</h2>
            <p className="text-[#7F8C8D] text-sm mt-1.5 leading-relaxed">
              Acceso exclusivo para{" "}
              <span className="font-semibold text-[#003366]">@alumnos.upa.edu.mx</span>
            </p>
          </div>

          {/* PASO 1: correo institucional */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                  <span className="size-4 flex items-center justify-center rounded-full bg-red-100 font-bold">!</span>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold text-[#2C3E50]">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ej. up230188@alumnos.upa.edu.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#003366] hover:bg-[#002244] disabled:bg-[#003366]/70 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    Enviar código de acceso
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* PASO 2: código OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {info && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#003366] text-xs font-medium">
                  {info}
                </div>
              )}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                  <span className="size-4 flex items-center justify-center rounded-full bg-red-100 font-bold">!</span>
                  {error}
                </div>
              )}

              <div className="text-xs text-[#7F8C8D]">
                Código enviado a{" "}
                <span className="font-semibold text-[#2C3E50]">{email}</span>
                <button
                  type="button"
                  onClick={volverAlCorreo}
                  className="text-[#003366] font-semibold hover:underline ml-1"
                >
                  Cambiar
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-sm font-semibold text-[#2C3E50]">
                  Código de acceso (6 dígitos)
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D]" />
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="pl-10 h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm tracking-[0.4em] font-mono"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#003366] hover:bg-[#002244] disabled:bg-[#003366]/70 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar y entrar
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRequestCode}
                disabled={isLoading}
                className="w-full text-center text-xs text-[#7F8C8D] hover:text-[#003366] font-medium"
              >
                Reenviar código
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#F5F7FA] border border-[#E5E7EB]">
            <div className="size-6 rounded-lg bg-[#003366] flex items-center justify-center flex-shrink-0">
              <svg className="size-3.5 text-[#FFD700] fill-current" viewBox="0 0 24 24">
                <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" />
              </svg>
            </div>
            <div className="text-xs text-[#7F8C8D] text-center">
              <p className="font-semibold text-[#2C3E50]">Acceso sin contraseña (OTP)</p>
              <p>Administrador: <span className="font-mono bg-white px-1 rounded">admin@upa.edu.mx</span></p>
              <p>Estudiante: usa tu correo <span className="font-mono bg-white px-1 rounded">@alumnos.upa.edu.mx</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
