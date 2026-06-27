"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, ChevronLeft, Loader2, KeyRound, CheckCircle2, XCircle, X, ArrowRight } from 'lucide-react';

type Step = "email" | "linkSent" | "code" | "verifying" | "verified" | "error" | "invited";

const RESEND_SECONDS = 30;

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const magicToken = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<Step>(magicToken ? "verifying" : errorParam === "link" ? "error" : "email");
  const [mode, setMode] = useState<"link" | "code">("link");
  const [loading, setLoading] = useState<null | "link" | "otp" | "verify">(null);
  const [magicHome, setMagicHome] = useState<string>("/");
  const [countdown, setCountdown] = useState(3);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!magicToken) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/magic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: magicToken }),
        });
        if (!res.ok) { setStep("error"); return; }
        const data = await res.json();
        setMagicHome(data.home);
        setStep("verified");
      } catch {
        setStep("error");
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [magicToken]);

  const startResendTimer = useCallback(() => {
    setResendTimer(RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (step !== "verified") return;
    const t = setTimeout(() => {
      if (countdown <= 1) router.push(magicHome);
      else setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [step, countdown, magicHome, router]);

  const code = digits.join('');

  const requestLogin = async (method: "link" | "otp") => {
    if (!email.trim()) { toast.error("Enter your email first"); return; }
    setLoading(method);
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), method }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.status === "invited") {
        setStep("invited");
      } else if (data.status === "otp") {
        setDigits(['', '', '', '', '', '']);
        setStep("code");
        startResendTimer();
        setTimeout(() => inputRefs.current[0]?.focus(), 80);
      } else {
        setStep("linkSent");
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (digits[index]) {
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); inputRefs.current[index - 1]?.focus(); }
    if (e.key === 'ArrowRight' && index < 5) { e.preventDefault(); inputRefs.current[index + 1]?.focus(); }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading("verify");
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Invalid or expired code');
        setDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        setLoading(null);
        return;
      }
      router.push(data.home);
    } catch {
      toast.error('Something went wrong. Please try again.');
      setLoading(null);
    }
  };

  const resetToEmail = () => {
    setDigits(['', '', '', '', '', '']);
    setResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("email");
    setTimeout(() => emailRef.current?.focus(), 50);
  };

  if (step === "verifying") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
        <Card className="w-full max-w-112.5 shadow-lg pt-8 pb-8 px-6 sm:px-8 rounded-xl">
          <CardHeader className="pb-4 px-0">
            <Loader2 size={40} className="animate-spin text-[#7e55f6] mb-2" />
            <CardTitle className="text-2xl leading-tight font-normal m-0">Signing You In</CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5 m-0">
              We&apos;re verifying your sign-in link. This will only take a moment.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
        <Card className="w-full max-w-112.5 shadow-lg pt-8 pb-8 px-6 sm:px-8 rounded-xl">
          <CardHeader className="pb-4 px-0">
            <XCircle size={40} className="text-red-500 mb-2" />
            <CardTitle className="text-2xl leading-tight font-normal m-0">Invalid or Expired Link</CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5 m-0">
              This sign-in link is no longer valid. Request a new one to continue.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Button className="w-full h-10" onClick={() => { window.location.href = "/login"; }}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "verified") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-105 shadow-lg pt-8 pb-8 px-8 rounded-xl">
          <CardHeader className="pb-4 px-0">
            <CheckCircle2 size={40} className="text-green-500 mb-2" />
            <CardTitle className="text-2xl leading-tight font-normal m-0">You&apos;re signed in</CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5 m-0">You&apos;re signed in. Continue to your dashboard.</p>
          </CardHeader>
          <CardContent className="p-0">
            <Button className="w-full h-10 gap-2" onClick={() => router.push(magicHome)}>
              Continue ({countdown}s) <ArrowRight size={15} />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "invited") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background relative">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-[#7e55f6]">
          <ChevronLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </Link>
        <Card className="w-full max-w-112.5 shadow-lg pt-10 pb-10 px-6 sm:px-8 rounded-xl">
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#7e55f6]/10">
              <Mail size={22} className="text-[#7e55f6]" />
            </div>
            <CardTitle className="text-xl font-semibold m-0 mb-2">Set Up Your Account First</CardTitle>
            <p className="text-muted-foreground text-center mb-6 text-sm leading-relaxed">
              We&apos;ve sent an invitation link to <strong className="text-foreground">{email}</strong>.
              Set it up first, then come back to sign in.
            </p>
            <Button type="button" variant="outline" className="w-full h-10" onClick={resetToEmail}>
              Use a different email
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "linkSent") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background relative">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-[#7e55f6]">
          <ChevronLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </Link>
        <Card className="w-full max-w-112.5 shadow-lg pt-10 pb-10 px-6 sm:px-8 rounded-xl">
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <CardTitle className="text-xl font-semibold m-0 mb-2">Check Your Email</CardTitle>
            <p className="text-muted-foreground text-center mb-6 text-sm leading-relaxed">
              We&apos;ve sent a sign-in link to <strong className="text-foreground">{email}</strong>.
              <br />Don&apos;t forget to check your spam folder.
            </p>
            <Button type="button" variant="outline" className="w-full h-10" onClick={resetToEmail}>
              Use a different email
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-[#7e55f6]">
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </Link>

      <Card className="w-full max-w-112.5 shadow-lg pt-10 pb-10 px-6 sm:px-8 rounded-xl">
        <CardHeader className="text-center pb-5 px-0">
          <CardTitle className="text-3xl leading-tight font-normal m-0">Academy Access</CardTitle>
          <p className="text-sm text-muted-foreground mt-1.5 m-0">
            {step === "code"
              ? "Enter the 6-digit code we sent to your email."
              : "Enter your email and we'll send you a sign-in link or code."}
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <form className="flex flex-col gap-4" onSubmit={step === "code" ? verifyCode : (e) => { e.preventDefault(); requestLogin(mode === "link" ? "link" : "otp"); }}>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium" htmlFor="email">Email Address</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-muted-foreground pointer-events-none" size={18} />
                <Input
                  ref={emailRef}
                  className="pl-11 h-10 pr-10"
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={step === "code"}
                  required
                />
                {step === "code" && (
                  <button
                    type="button"
                    onClick={resetToEmail}
                    className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label="Change email"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {step === "code" && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="text-sm font-medium">Sign-in Code</Label>
                <div className="flex gap-2" onPaste={handleDigitPaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      value={d}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      className="flex-1 h-12 min-w-0 rounded-md border border-input/60 bg-muted/50 text-center text-lg font-semibold text-foreground transition-colors caret-[#7e55f6] outline-none hover:border-input focus:border-[#7e55f6] focus:ring-2 focus:ring-[#7e55f6]/20"
                    />
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading !== null || (step === "code" && code.length !== 6)}
              className="w-full mt-1 h-10"
            >
              {loading !== null
                ? <Loader2 size={18} className="animate-spin" />
                : step === "code"
                  ? "Sign In"
                  : mode === "link"
                    ? <><Mail size={15} /> Email me a link</>
                    : <><KeyRound size={15} /> Email me a code</>}
            </Button>

            {step === "email" && (
              <>
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading !== null}
                  className="w-full h-10"
                  onClick={() => setMode((m) => (m === "link" ? "code" : "link"))}
                >
                  {mode === "link"
                    ? <><KeyRound size={15} /> Login with code</>
                    : <><Mail size={15} /> Login with link</>}
                </Button>
              </>
            )}

            {step === "code" && (
              <div className="flex items-center justify-center gap-1.5 border-t border-border pt-4 mt-1">
                <span className="text-sm text-muted-foreground">Didn&apos;t get the OTP?</span>
                <button
                  type="button"
                  onClick={() => { if (resendTimer === 0 && loading === null) requestLogin("otp"); }}
                  disabled={resendTimer > 0 || loading !== null}
                  className="text-sm font-semibold text-[#7e55f6] hover:text-[#6742d4] transition-colors disabled:pointer-events-none disabled:opacity-40"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>

            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-105 shadow-lg pt-10 pb-10 px-8 rounded-xl">
          <CardHeader className="pb-0 px-0">
            <div className="flex flex-col items-center justify-center gap-4 py-6">
              <Loader2 size={40} className="animate-spin text-[#7e55f6]" />
            </div>
          </CardHeader>
        </Card>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
