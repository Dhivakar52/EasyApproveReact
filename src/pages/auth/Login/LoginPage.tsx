// src/pages/auth/Login/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import srmLogo from "../../../assets/images/srm_login_logo.png";
import cupImg from "../../../assets/images/login_cup_img.png";
import loginBg from "../../../assets/images/login_left_img.png";
import { USER_ROLES, type UserRole } from "../../../dataTypes/roles";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface LoginProps {
  setUserRole: React.Dispatch<React.SetStateAction<UserRole | null | undefined>>;
}

export default function LoginPage({ setUserRole }: LoginProps) {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Helper to authenticate user
  const authenticateUser = (targetEmail: string, targetRole: UserRole) => {
    localStorage.setItem("userRole", targetRole);
    localStorage.setItem("userEmail", targetEmail);
    let targetName = "Demo User";
    if (targetRole === USER_ROLES.ADMIN) {
      targetName = "Demo Admin";
    } else if (targetRole === USER_ROLES.APPROVER) {
      targetName = targetEmail.includes("karthik") ? "Karthik Subramanian" : "Demo Approver";
    }
    localStorage.setItem("userName", targetName);
    localStorage.setItem("srm_ap_session", JSON.stringify({ email: targetEmail, role: targetRole, name: targetName }));
    setUserRole(targetRole);

    navigate("/home");
  };

  const resolveRole = (targetEmail: string, targetPassword?: string): UserRole | null => {
    const cleanEmail = targetEmail.trim().toLowerCase();

    // Standard user test accounts
    if (cleanEmail === "user@gmail.com" && (!targetPassword || targetPassword === "1" || targetPassword === "123")) {
      return USER_ROLES.USER;
    }
    if (cleanEmail === "approver@gmail.com" && (!targetPassword || targetPassword === "2" || targetPassword === "123")) {
      return USER_ROLES.APPROVER;
    }
    if (cleanEmail === "admin@gmail.com" && (!targetPassword || targetPassword === "6" || targetPassword === "123")) {
      return USER_ROLES.ADMIN;
    }

    // Prototype accounts
    if (cleanEmail === "admin@srmtech.com" && (!targetPassword || targetPassword === "123")) return USER_ROLES.ADMIN;
    if (cleanEmail === "approver@srmtech.com" && (!targetPassword || targetPassword === "123")) return USER_ROLES.APPROVER;
    if (cleanEmail === "karthik.subramanian@srmtech.com" && (!targetPassword || targetPassword === "123")) return USER_ROLES.APPROVER;
    if (cleanEmail === "user@srmtech.com" && (!targetPassword || targetPassword === "123")) return USER_ROLES.USER;
    if (cleanEmail.includes("admin") && (!targetPassword || targetPassword === "123")) return USER_ROLES.ADMIN;
    if (cleanEmail.includes("approver") && (!targetPassword || targetPassword === "123")) return USER_ROLES.APPROVER;
    if ((cleanEmail.endsWith("@srmtech.com") || cleanEmail.endsWith("@srmtechnologies.com")) && (!targetPassword || targetPassword === "123")) {
      return USER_ROLES.USER;
    }

    return USER_ROLES.USER;
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
        // Valid credentials -> Transition to Step 2 OTP Verification
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white selection:bg-[#008744] selection:text-white">
      {/* Left Promotional Panel matching Reference Website screenshot */}
      <div
        className="w-full lg:w-1/2 min-h-[380px] lg:min-h-screen relative p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden bg-[#007A3D]"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#007A3D",
        }}
      >
        {/* Subtle geometric overlay glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#007A3D]/20 to-[#005c2e]/60 pointer-events-none" />

        {/* Top Header with SRM Group Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src={srmLogo}
            alt="SRM GROUP Logo"
            className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
          />
        </div>

        {/* Center Promotional Graphic and Copy */}
        <div className="relative z-10 my-auto py-10 sm:py-16">
          <img
            src={cupImg}
            alt="Excellence Trophy"
            className="w-24 sm:w-28 lg:w-32 h-auto object-contain mb-8 drop-shadow-2xl"
          />
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-tight mb-4">
            Welcome to the Easy Approve <br className="hidden sm:inline" />

          </h1>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-lg font-normal">
            Discover, manage, and streamline approvals with EasyApprove.
            Submit requests, track approval progress, collaborate with
            approvers, and simplify your organization's approval workflow
            — all in one place.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-white/70">
          <span>&copy; {new Date().getFullYear()} SRM Technologies. All rights reserved.</span>
        </div>
      </div>

      {/* Right Sign-in Form Panel matching Reference Screenshot */}
      <div className="w-full lg:w-1/2 min-h-[500px] lg:min-h-screen flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-[420px]">
          {step === "credentials" ? (
            <div>
              {/* Heading */}
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1.5">
                  Welcome Back!
                </h2>
                <p className="text-sm text-slate-500">Sign in to your account</p>
              </div>

              {error && (
                <div className="p-3 mb-5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-5" noValidate>
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="username"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition"
                  />
                </div>

                {/* Password with Eye icon toggle */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      autoComplete="current-password"
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot Password */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#008744] focus:ring-[#008744] h-3.5 w-3.5"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={switchToOtpFlow}
                    className="text-[#008744] hover:underline font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#008744] hover:bg-[#00733a] text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : null}
                  <span>Sign In</span>
                </button>

                {/* Don't have an account? Sign up */}
                <div className="text-center text-xs text-slate-600 pt-1">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("user@srmtech.com", "123")}
                    className="text-[#008744] font-semibold hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </div>
              </form>

              {/* Quick One-Click Demo Access Box (Preserves testing ease) */}
              <div className="mt-8 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Quick Demo Accounts
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">pwd: 123</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("user@srmtech.com", "123")}
                    className="p-2 border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 rounded-lg text-left text-xs font-medium transition cursor-pointer text-slate-700 truncate"
                  >
                    <span className="text-emerald-700 font-semibold block truncate">User</span>
                    <span className="text-[10px] text-slate-500 block truncate">user@srmtech.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("approver@srmtech.com", "123")}
                    className="p-2 border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 rounded-lg text-left text-xs font-medium transition cursor-pointer text-slate-700 truncate"
                  >
                    <span className="text-amber-700 font-semibold block truncate">Approver</span>
                    <span className="text-[10px] text-slate-500 block truncate">approver@...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("admin@srmtech.com", "123")}
                    className="p-2 border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 rounded-lg text-left text-xs font-medium transition cursor-pointer text-slate-700 truncate"
                  >
                    <span className="text-blue-700 font-semibold block truncate">Admin</span>
                    <span className="text-[10px] text-slate-500 block truncate">admin@srmtech.com</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: OTP Verification Screen */
            <div>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs text-slate-500">Enter the verification code to continue</p>
              </div>

              {/* Email Notification Notice */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-slate-700 mb-4">
                <div className="text-xs space-y-1">
                  <p className="font-medium text-slate-800">
                    A verification OTP has been sent to:
                  </p>
                  <p className="font-mono text-emerald-800 font-semibold truncate">
                    {email || "user@srmtech.com"}
                  </p>
                </div>
              </div>

              {/* Testing Prototype Notice */}
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 mb-4 flex items-center justify-between text-xs text-amber-900">
                <span className="font-medium">Testing OTP:</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-800 tracking-wider">
                  1111
                </span>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="login-otp"
                    className="block text-center text-xs font-semibold text-slate-700 mb-2"
                  >
                    Enter 4-Digit Security Code
                  </label>
                  <input
                    id="login-otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center text-2xl font-mono tracking-[0.6em] font-bold py-2.5 bg-slate-50/50 focus:bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition"
                    placeholder="••••"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  <p className="text-center text-xs text-slate-400 mt-2">
                    Didn&apos;t receive code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#008744] font-semibold hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#008744] hover:bg-[#00733a] text-white text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : null}
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

