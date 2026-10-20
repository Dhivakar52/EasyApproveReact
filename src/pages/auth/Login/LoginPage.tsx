// src/pages/auth/Login/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import whiteLogo from "../../../assets/images/white-logo.png";
import { USER_ROLES, type UserRole } from "../../../dataTypes/roles";
import { toast } from "sonner";

interface LoginProps {
  setUserRole: React.Dispatch<React.SetStateAction<UserRole | null | undefined>>;
}

export default function LoginPage({ setUserRole }: LoginProps) {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Helper to authenticate user
  const authenticateUser = (targetEmail: string, targetRole: UserRole) => {
    localStorage.setItem("userRole", targetRole);
    localStorage.setItem("userEmail", targetEmail);
    localStorage.setItem("srm_ap_session", JSON.stringify({ email: targetEmail, role: targetRole }));
    setUserRole(targetRole);

    switch (targetRole) {
      case USER_ROLES.ADMIN:
        navigate("/home");
        break;
      case USER_ROLES.USER:
      default:
        navigate("/my-nominations");
        break;
    }
  };

  const resolveRole = (targetEmail: string, targetPassword?: string): UserRole | null => {
    const cleanEmail = targetEmail.trim().toLowerCase();

    // Standard user test accounts
    if (cleanEmail === "user@gmail.com" && (!targetPassword || targetPassword === "1" || targetPassword === "123")) {
      return USER_ROLES.USER;
    }
    if (cleanEmail === "admin@gmail.com" && (!targetPassword || targetPassword === "6" || targetPassword === "123")) {
      return USER_ROLES.ADMIN;
    }

    // Prototype accounts
    if (cleanEmail === "admin@srmtech.com" && (!targetPassword || targetPassword === "123")) return USER_ROLES.ADMIN;
    if (cleanEmail === "user@srmtech.com" && (!targetPassword || targetPassword === "123")) return USER_ROLES.USER;
    if (cleanEmail.includes("admin") && (!targetPassword || targetPassword === "123")) return USER_ROLES.ADMIN;
    if ((cleanEmail.endsWith("@srmtech.com") || cleanEmail.endsWith("@srmtechnologies.com")) && (!targetPassword || targetPassword === "123")) {
      return USER_ROLES.USER;
    }

    return null;
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Enter your official SRM email address.");
      return;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const role = resolveRole(cleanEmail, password);
      if (role) {
        // Valid credentials -> Transition to Step 2 OTP Verification matching prototype
        setStep("otp");
        setOtp("1111");
        setError(null);
        toast.info("A verification OTP has been sent to your registered email address.");
      } else {
        setError("Invalid email address or password.");
      }
    }, 200);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError("Please enter the 4-digit OTP.");
      return;
    }

    if (cleanOtp !== "1111") {
      setError("Invalid OTP. Please enter the correct OTP.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase() || "user@srmtech.com";
      const role = resolveRole(cleanEmail, password) || USER_ROLES.USER;
      authenticateUser(cleanEmail, role);
      toast.success("Welcome back! Signed in successfully.");
    }, 200);
  };

  const handleResendOtp = () => {
    const target = email.trim() || "user@srmtech.com";
    setOtp("1111");
    setError(null);
    toast.info(`A verification OTP (1111) has been resent to ${target}.`);
  };

  const fillDemoAccount = (demoEmail: string, demoPwd: string = "123") => {
    setEmail(demoEmail);
    setPassword(demoPwd);
    setError(null);
  };

  const switchToOtpFlow = () => {
    if (!email.trim()) {
      setEmail("user@srmtech.com");
    }
    setOtp("1111");
    setError(null);
    setStep("otp");
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-12 bg-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* Hero Left Column */}
      <div className="login-hero hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 lg:p-16 text-white relative overflow-hidden">
        {/* Background decorative gradients */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="logo-mark shadow-lg shadow-emerald-600/30">
              <img src={whiteLogo} alt="Easy Approve Logo" className="logo-img" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">Easy Approve</span>
              <span className="text-xs uppercase tracking-wider text-emerald-200/90 font-medium">
                Enterprise Workflow Suite
              </span>
            </div>
          </div>

          <div className="mt-20 max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm mb-6">
              <i className="fa-solid fa-shield-halved text-[10px]"></i> Enterprise Audit Compliance v2.4
            </span>
            <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-white">
              Every request. <br />
              One transparent{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-blue-200">
                decision trail.
              </span>
            </h2>
            <p className="mt-5 text-base text-slate-300 leading-relaxed font-normal">
              Accelerate corporate governance with multi-stage sign-offs, real-time stakeholder tracking, dynamic
              delegation, and immutable decision histories.
            </p>
          </div>

          {/* Feature badges */}
          <div className="mt-12 grid grid-cols-2 gap-4 max-w-lg">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <i className="fa-solid fa-bolt text-emerald-400 text-lg mb-2 block"></i>
              <h4 className="text-sm font-semibold text-white">Fast-Track Routing</h4>
              <p className="text-xs text-slate-300 mt-1">
                Multi-tier approval workflows with auto-escalation &amp; reminders.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <i className="fa-solid fa-timeline text-blue-400 text-lg mb-2 block"></i>
              <h4 className="text-sm font-semibold text-white">Audited History</h4>
              <p className="text-xs text-slate-300 mt-1">Lifecycle revision tracking and tamper-proof decision logs.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} SRM Technologies. All rights reserved.</span>
          <span className="text-slate-500">Security &amp; ISO 27001 Certified</span>
        </div>
      </div>

      {/* Login Form Right Column */}
      <div className="lg:col-span-6 xl:col-span-5 flex min-h-screen items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          {step === "credentials" ? (
            /* STEP 1: Credentials Form Panel */
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="logo-mark lg:hidden">
                    <img src={whiteLogo} alt="Easy Approve Logo" className="logo-img" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign In</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Access your Easy Approve Workspace</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 hidden sm:inline-block">
                  SSO Enabled
                </span>
              </div>

              {error && (
                <div className="p-3 mb-5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official SRM Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                      autoComplete="username"
                      placeholder="name@srmtech.com"
                    />
                    <i className="fa-solid fa-envelope absolute left-3.5 top-3 text-slate-400 text-sm"></i>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={switchToOtpFlow}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                    >
                      OTP Alternative?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-16 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                      autoComplete="current-password"
                      placeholder="Enter password"
                    />
                    <i className="fa-solid fa-lock absolute left-3.5 top-3 text-slate-400 text-sm"></i>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded cursor-pointer"
                      aria-pressed={showPassword}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  )}
                  <span>Sign In to Platform</span>
                </button>
              </form>

              {/* Quick Demo Access Box */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <i className="fa-solid fa-wand-magic-sparkles text-amber-500"></i> One-Click Demo Accounts
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">pwd: 123</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("user@srmtech.com", "123")}
                    className="p-2 border border-slate-200 bg-white rounded-lg text-left text-xs font-medium hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer flex items-center gap-1.5 text-slate-700"
                  >
                    <i className="fa-solid fa-user text-emerald-600"></i> User (Requester)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("admin@srmtech.com", "123")}
                    className="p-2 border border-slate-200 bg-white rounded-lg text-left text-xs font-medium hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer flex items-center gap-1.5 text-slate-700"
                  >
                    <i className="fa-solid fa-user-shield text-blue-600"></i> Admin (Approver)
                  </button>
                </div>
                <p className="mt-2.5 text-[11px] text-slate-400 leading-tight">
                  Enterprise workflow simulation. Session and records are stored securely in your browser.
                </p>
              </div>
            </div>
          ) : (
            /* STEP 2: OTP Verification Screen */
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-lg">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">OTP Verification</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Two-Factor Security Sign-In</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                  <i className="fa-solid fa-circle-check text-[10px]"></i> Step 2/2
                </span>
              </div>

              {/* Email Notification Notice */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-slate-700 mb-4">
                <div className="flex items-start gap-2.5">
                  <i className="fa-solid fa-envelope-circle-check text-emerald-600 mt-0.5 text-base flex-shrink-0"></i>
                  <div className="text-xs space-y-1">
                    <p className="font-medium text-slate-800 leading-relaxed">
                      A verification OTP has been sent to your registered email address.
                    </p>
                    <p className="font-mono text-emerald-700 font-semibold truncate">
                      {email || "user@srmtech.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Testing Prototype Notice */}
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 mb-4 flex items-center justify-between text-xs text-amber-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <i className="fa-solid fa-key text-amber-600"></i> Testing OTP:
                </span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-800 tracking-wider">
                  1111
                </span>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="login-otp" className="block text-center text-xs font-semibold text-slate-700 mb-2">
                    Enter 4-Digit Security Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="login-otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full text-center text-2xl font-mono tracking-[0.6em] font-bold py-3 bg-slate-50/50 focus:bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                      placeholder="••••"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                    <i className="fa-solid fa-lock absolute left-3.5 top-4 text-slate-300 text-sm pointer-events-none"></i>
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-2">
                    Didn&apos;t receive code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-shield-check"></i>
                  )}
                  <span>Verify OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep("credentials");
                  }}
                  className="w-full py-2.5 px-4 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Back to Login</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
