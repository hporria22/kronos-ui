
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, KeyRound, Mail, ArrowRight } from "lucide-react";
import AdaniLogo from "../components/adaniLogo";
import { useAuth } from "../lib/auth";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/seperator";
import { toast } from "sonner";

const MicrosoftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 21 21" width="18" height="18" {...props}>
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9 " height="9" fill="#FFB900" />
  </svg>
);

const OktaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" width="18" height="18" {...props}>
    <circle cx="16" cy="16" r="14" fill="none" stroke="#007DC1" strokeWidth="5" />
  </svg>
);

const SamlIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

type Provider = "adani-sso" | "microsoft" | "okta" | "saml" | "email";

const Login: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [email, setEmail] = useState<string>("");

  const doLogin = async (provider: Provider): Promise<void> => {
    if (loading) return;
    setLoading(provider);
    try {
      const u = await login({ provider, email: provider === "email" ? email : undefined });
      toast.success(`Welcome, ${u.name}`);
      nav("/app/dashboard", { replace: true });
    } catch (e) {
      toast.error("Sign-in failed. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen k-login-bg flex flex-col" data-testid="login-page">
      <div className="px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdaniLogo height={28} data-testid="adani-logo" />
          <Separator orientation="vertical" className="h-6 bg-slate-300" />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-slate-900 tracking-tight">Kronos</div>
            <div className="text-[11px] text-slate-500 -mt-0.5">Workforce OS</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="k-pulse-dot" />
          All systems operational
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 hidden lg:block"
          >
            <div className="k-stripe-gradient w-16 mb-6" />
            <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight text-slate-900 leading-[1.05]">
              Operations clarity for every<br />
              <span className="text-[color:var(--teal)]">plant & process.</span>
            </h1>
            <p className="mt-5 text-[15px] text-slate-600 max-w-xl leading-relaxed">
              Sign in with your enterprise identity
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              {[
                { k: "2.63L", l: "Active EPs" },
                { k: "709", l: "Total Plants" },
                { k: "12", l: "Businesses" },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur px-4 py-3"
                >
                  <div className="mono text-2xl font-semibold text-slate-900">{s.k}</div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 mt-1">{s.l}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[color:var(--teal)]" />
              SAML 2.0 · SOC 2 · Adani SSO federation
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="lg:col-span-2"
          >
            <div className="k-login-card p-7 sm:p-8" data-testid="login-card">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--teal)] font-semibold">
                <KeyRound className="w-3.5 h-3.5" /> Sign in
              </div>
              <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-slate-900">
                Continue to Kronos
              </h2>
              <p className="text-[13px] text-slate-500 mt-1">
                Use your Adani enterprise SSO to sign in.
              </p>

              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  data-testid="sso-adani-btn"
                  className="k-sso-btn k-sso-primary"
                  onClick={() => doLogin("adani-sso")}
                  disabled={!!loading}
                >
                  {loading === "adani-sso" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AdaniLogo height={14} monochrome />
                  )}
                  <span>Continue with Adani SSO</span>
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </button>

                <button
                  type="button"
                  data-testid="sso-microsoft-btn"
                  className="k-sso-btn"
                  onClick={() => doLogin("microsoft")}
                  disabled={!!loading}
                >
                  {loading === "microsoft" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MicrosoftIcon />}
                  Continue with Microsoft
                </button>

              </div>

              <div className="flex items-center gap-3 my-6">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] uppercase tracking-wider text-slate-400">or</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="space-y-2">
                <Label className="k-label" htmlFor="email">Work email</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    data-testid="email-input"
                    type="email"
                    placeholder="name@adani.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-[#F8FAFC] border-slate-200 focus-visible:ring-[color:var(--teal)] focus-visible:ring-offset-0 h-10"
                  />
                </div>
                <button
                  type="button"
                  data-testid="email-continue-btn"
                  className="k-sso-btn mt-2"
                  onClick={() => {
                    if (!email || !email.includes("@")) {
                      toast.error("Enter a valid work email");
                      return;
                    }
                    doLogin("email");
                  }}
                  disabled={!!loading}
                >
                  {loading === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Continue with email
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mt-6 leading-relaxed text-center">
                By continuing you agree to the Adani Group{" "}
                <span className="underline decoration-dotted underline-offset-2 cursor-pointer">Acceptable Use Policy</span>.
              </p>
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-4">
              Trouble signing in? <span className="text-[color:var(--teal)] font-medium cursor-pointer">Contact IT support</span>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-5 text-[11px] text-slate-400 flex items-center justify-between">
        <span>© {new Date().getFullYear()} Adani Group · Kronos</span>
        <span className="mono">v2.0</span>
      </div>
    </div>
  );
};

export default Login;