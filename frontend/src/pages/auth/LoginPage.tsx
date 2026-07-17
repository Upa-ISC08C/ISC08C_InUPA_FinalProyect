import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.endsWith('@alumnos.upa.edu.mx') && !email.endsWith('@upa.edu.mx')) {
      setError('Debes usar tu correo institucional de la UPA.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestToken(email);
      setSuccessMsg('Código enviado. Revisa tu bandeja de entrada.');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al solicitar el código.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple chars
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fullOtp = otp.join('');
    
    if (fullOtp.length !== 6) {
      setError('Por favor ingresa los 6 dígitos del código.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.verifyToken(email, fullOtp);
      setToken(data.accessToken);
      navigate('/dashboard'); // Redirigir al inicio tras logueo
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código incorrecto o expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">InUPA</div>
          <p className="login-subtitle">Conecta tu talento con el mundo profesional</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestToken}>
            <div className="form-group">
              <label className="form-label">Correo Institucional</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} size={20} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="ejemplo@alumnos.upa.edu.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <span className="error-msg">{error}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Continuar con Correo'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyToken}>
            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center' }}>
                Ingresa el código de 6 dígitos que enviamos a<br/>
                <strong>{email}</strong>
              </label>
              
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    maxLength={1}
                    required
                  />
                ))}
              </div>
              {successMsg && <span className="success-msg">{successMsg}</span>}
              {error && <span className="error-msg" style={{ textAlign: 'center' }}>{error}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Verificar y Entrar'}
            </button>
            
            <button 
              type="button" 
              className="btn-google" 
              style={{ border: 'none', background: 'transparent', marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}
              onClick={() => setStep(1)}
            >
              Volver al inicio
            </button>
          </form>
        )}

        {step === 1 && (
          <>
            <div className="divider">O inicia sesión con</div>
            <button type="button" className="btn-google" onClick={() => alert('¡Guía de Google OAuth pendiente!')}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
              Continuar con Google
            </button>
          </>
        )}
      </div>
    </div>
  );
};
