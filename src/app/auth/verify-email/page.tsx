"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Check session state and handle redirects
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        if (data.user.emailVerified) {
          // Already verified, go to dashboard
          router.push("/dashboard");
          return;
        }
        // User is signed in but not verified - get their email
        if (!emailParam && data.user.email) {
          setEmail(data.user.email);
        }
      }
      setIsCheckingSession(false);
    });
  }, [router, emailParam]);

  if (isCheckingSession) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      });

      if (error) throw error;

      // Check if auto-sign-in occurred (user is returned)
      if (data?.user) {
        router.push("/dashboard");
      } else {
        setMessage("Email verified! Redirecting to sign in...");
        setTimeout(() => router.push("/auth/sign-in"), 1500);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setIsResending(true);
    setMessage("");

    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin + "/auth/verify-email",
      });

      if (error) throw error;
      setMessage("Verification code sent! Check your inbox.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to send verification email"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">CaseCipher</h1>
          <p className="text-sm text-muted-foreground">
            Verify your email address
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold">Check your email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the verification code sent to your email
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
    
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            {message && (
              <p
                className={`text-center text-sm ${
                  message.includes("verified") || message.includes("sent")
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                }`}
              >
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || code.length < 6}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-medium text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/auth/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
