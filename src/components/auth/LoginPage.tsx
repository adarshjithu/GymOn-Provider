import { useState, type FormEvent } from "react";
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface LoginPageProps {
  onSuccess?: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login({ email: email.trim(), password });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred during sign in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick autofill for quick testing with seeded provider
  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#060E1E] text-white font-sans antialiased flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-[#00C49F] selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00C49F]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#00A389]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Logo */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center space-x-3 select-none">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#00A389] to-[#00C49F] flex items-center justify-center shadow-lg shadow-[#00C49F]/20 shrink-0">
            <Dumbbell className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-black tracking-tight text-white">GYM</span>
              <span className="text-2xl font-black tracking-tight text-[#00C49F]">ON</span>
            </div>
            <p className="text-[9px] font-bold tracking-[0.2em] text-[#00C49F] uppercase -mt-1">
              PROVIDER PORTAL
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Need partner assistance?{" "}
          <a
            href="mailto:support@gymon.com"
            className="text-[#00C49F] hover:underline cursor-pointer"
          >
            Partner Support
          </a>
        </div>
      </header>

      {/* Center Sign In Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8 z-10">
        <div className="bg-[#0B1727]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#00A389]/10 border border-[#00A389]/30 text-[#00C49F] mb-3 shadow-inner">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Provider Sign In
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Access your gym dashboard, manage entries, and respond to customer leads.
            </p>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="mb-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Sparkles className="h-4 w-4 text-[#00C49F] shrink-0" />
              <span>Demo Logins:</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill("alex.morgan@fitlife.com", "Password123!")}
                className="text-[#00C49F] hover:text-[#00e0b7] font-semibold text-xs px-2.5 py-1 rounded-lg bg-[#00C49F]/10 hover:bg-[#00C49F]/20 transition-colors"
                title="Primary Provider Login"
              >
                Provider
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("david.sub@fitlife.com", "Password123!")}
                className="text-amber-400 hover:text-amber-300 font-semibold text-xs px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 transition-colors"
                title="Sub-Provider Login"
              >
                Sub-Provider
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Authentication Failed</span>
                <span className="text-rose-300/90">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Provider Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.morgan@fitlife.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className="w-full bg-[#060E1E] border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C49F] focus:ring-1 focus:ring-[#00C49F] transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact GYMON Admin or Support to reset your provider credentials.");
                  }}
                  className="text-[11px] font-medium text-[#00C49F] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full bg-[#060E1E] border border-slate-700/80 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C49F] focus:ring-1 focus:ring-[#00C49F] transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-[#00A389] focus:ring-[#00C49F] cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-xs text-slate-400 cursor-pointer select-none"
              >
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#00A389] to-[#00C49F] hover:from-[#00917a] hover:to-[#00b290] text-white font-bold text-xs transition-all shadow-lg shadow-[#00C49F]/20 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-slate-500 z-10 py-2">
        &copy; {new Date().getFullYear()} GYM ON Provider Portal &bull; All Rights Reserved
      </footer>
    </div>
  );
}

