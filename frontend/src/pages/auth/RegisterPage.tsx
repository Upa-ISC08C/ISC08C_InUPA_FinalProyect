import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { CARRERAS_UPA, CUATRIMESTRES } from "../../utils/catalogos";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [carrera, setCarrera] = useState("");
  const [cuatrimestre, setCuatrimestre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const dominioValido = (c: string) => c.endsWith("@alumnos.upa.edu.mx") || c.endsWith("@upa.edu.mx");
  const selCls = "w-full h-11 rounded-xl border border-[#D1D5DB] focus:border-[#003366] px-3 text-sm bg-white";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const correo = email.toLowerCase().trim();
    if (nombre.trim().length < 3) return setError("Escribe tu nombre completo.");
    if (!matricula.trim()) return setError("Escribe tu matrícula (UP).");
    if (!carrera) return setError("Selecciona tu carrera.");
    if (!cuatrimestre) return setError("Selecciona tu cuatrimestre.");
    if (!dominioValido(correo)) return setError("Debes usar tu correo institucional de la UPA.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setError("Las contraseñas no coinciden.");
    setIsLoading(true);
    try {
      const user = await register({
        nombre_completo: nombre.trim(),
        email: correo,
        password,
        matricula_o_rfc: matricula.trim().toUpperCase(),
        carrera,
        cuatrimestre: Number(cuatrimestre),
      });
      navigate(user.rol === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudo crear la cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-[Poppins,sans-serif]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#003366] relative overflow-hidden flex-col">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-28 -right-28 size-96 rounded-full bg-white/[0.03]" />
          <div className="absolute top-1/2 -left-20 size-64 rounded-full bg-[#FFD700]/[0.07]" />
          <div className="absolute bottom-10 right-10 size-52 rounded-full bg-[#00A8E8]/[0.07]" />
        </div>
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFD700] text-[#003366] rounded-xl p-2.5 shadow-lg"><GraduationCap className="size-6" /></div>
            <div>
              <p className="text-white font-bold text-xl tracking-tight">InUPA</p>
              <p className="text-white/45 text-[10px] tracking-widest uppercase font-medium">Plataforma Universitaria</p>
            </div>
          </div>
          <div className="my-auto space-y-5">
            <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.08] tracking-tight">
              Crea tu<br />cuenta y<br /><span className="text-[#FFD700]">postúlate hoy</span>
            </h1>
            <p className="text-white/60 text-base max-w-sm leading-relaxed">
              Regístrate con tu correo institucional para acceder a vacantes exclusivas de la comunidad UPA.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-2">
            <div className="bg-[#003366] text-white rounded-xl p-2.5"><GraduationCap className="size-5" /></div>
            <span className="text-2xl font-bold text-[#003366]">InUPA</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#2C3E50] tracking-tight">Crear cuenta</h2>
            <p className="text-[#7F8C8D] text-sm mt-1.5">Solo para correos <span className="font-semibold text-[#003366]">@alumnos.upa.edu.mx</span></p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                <span className="size-4 flex items-center justify-center rounded-full bg-red-100 font-bold">!</span>
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-sm font-semibold text-[#2C3E50]">Nombre completo</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre completo"
                className="h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm" required disabled={isLoading} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="matricula" className="text-sm font-semibold text-[#2C3E50]">Matrícula (UP)</Label>
                <Input id="matricula" value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="UP230188"
                  className="h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm" required disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cuatri" className="text-sm font-semibold text-[#2C3E50]">Cuatrimestre</Label>
                <select id="cuatri" value={cuatrimestre} onChange={(e) => setCuatrimestre(e.target.value)} className={selCls} required disabled={isLoading}>
                  <option value="">—</option>
                  {CUATRIMESTRES.map((c) => <option key={c} value={c}>{c}°</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="carrera" className="text-sm font-semibold text-[#2C3E50]">Carrera</Label>
              <select id="carrera" value={carrera} onChange={(e) => setCarrera(e.target.value)} className={selCls} required disabled={isLoading}>
                <option value="">Selecciona tu carrera</option>
                {CARRERAS_UPA.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#2C3E50]">Correo institucional</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="up230188@alumnos.upa.edu.mx"
                className="h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm" required disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-[#2C3E50]">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                className="h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm" required disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-sm font-semibold text-[#2C3E50]">Confirmar contraseña</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repite tu contraseña"
                className="h-11 rounded-xl border-[#D1D5DB] focus:border-[#003366] text-sm" required disabled={isLoading} />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full h-11 bg-[#003366] hover:bg-[#002244] disabled:bg-[#003366]/70 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors mt-2">
              {isLoading ? (<><Loader2 className="size-4 animate-spin" />Creando cuenta...</>) : (<>Crear cuenta<ArrowRight className="size-4" /></>)}
            </button>
          </form>

          <p className="text-center text-sm text-[#7F8C8D]">
            ¿Ya tienes cuenta?{" "}
            <Link to="/" className="text-[#003366] font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
