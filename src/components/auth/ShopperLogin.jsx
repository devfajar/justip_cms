import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Server,
  KeyRound
} from 'lucide-react';
import { authApi } from '../../api/client';

export default function ShopperLogin({ onLoginSuccess, backendOnline }) {
  const [email, setEmail] = useState('sarah@justip.local');
  const [password, setPassword] = useState('SecretPassword123!');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await authApi.login(email, password);

      if (!res.success) {
        setErrorMessage(res.message || 'Email atau kata sandi tidak sesuai');
        setLoading(false);
        return;
      }

      const userData = res.data?.user;
      const token = res.data?.token;

      // Role Check: Verify that user is Shopper or Admin
      if (userData?.role !== 'SHOPPER' && userData?.role !== 'ADMIN') {
        setErrorMessage(`Akses ditolak: Akun ${userData?.email} terdaftar dengan role ${userData?.role}. CMS ini khusus untuk role SHOPPER.`);
        setLoading(false);
        return;
      }

      setSuccessMessage(`Login berhasil! Selamat datang, ${userData.name}`);
      setTimeout(() => {
        onLoginSuccess(userData, token);
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menghubungi backend');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  const handleGoogleSSO = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await authApi.ssoGoogle('mock-google-id-token-xyz');
      if (!res.success) {
        setErrorMessage(res.message || 'Google SSO gagal');
        setLoading(false);
        return;
      }
      const userData = res.data?.user;
      const token = res.data?.token;
      onLoginSuccess(userData, token);
    } catch (err) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
        {/* Top Header Card */}
        <div className="bg-slate-950 p-7 text-white border-b border-slate-800 text-center relative">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-emerald-500/30 mb-3">
            J
          </div>
          <h1 className="text-xl font-bold tracking-tight">Justip Shopper CMS</h1>
          <p className="text-xs text-slate-400 mt-1">Platform Manajemen Kloter & Pesanan Penyedia Jasa</p>

          {/* Backend Connection Indicator */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            <Server className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Backend API:</span>
            {backendOnline ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Online (:8080)
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Connecting / Standby
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-7 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Akun Shopper</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@justip.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Memverifikasi Token...</span>
              ) : (
                <>
                  <span>Masuk ke CMS Shopper</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Shortcut */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Akun Shopper Bawaan (Test Auth)
            </span>
            <button
              type="button"
              onClick={() => handleQuickLogin('sarah@justip.local', 'SecretPassword123!')}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
                  alt="Sarah" 
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                    Sarah Wijaya <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="text-[10px] text-slate-400">sarah@justip.local (Shopper Tokyo)</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Gunakan
              </span>
            </button>
          </div>

          {/* Google SSO Login */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGoogleSSO}
              className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Login dengan Google SSO</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
