"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const passwordValidation = useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    passwordsMatch: password === confirmPassword && password.length > 0,
  }), [password, confirmPassword]);

  const isPasswordValid =
    passwordValidation.minLength &&
    passwordValidation.hasUppercase &&
    passwordValidation.hasLowercase &&
    passwordValidation.hasNumber;

  const canSubmit = name.trim() && email.trim() && isPasswordValid && passwordValidation.passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please fix the errors");
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs ${valid ? "text-green-600" : "text-muted-foreground"}`}>
      {valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {text}
    </div>
  );

  return (
    <section className="flex min-h-screen px-4 py-16 bg-background">
      <form onSubmit={handleSubmit} className="m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] p-0.5">
        <div className="p-8 pb-0">
          <div className="flex flex-col items-center justify-center">
            <Link href="/" aria-label="go home">
              <Settings className="h-8 w-8 text-primary" />
            </Link>
            <h1 className="mb-1 mt-2 text-xl font-semibold">Create a GearGuard Account</h1>
            <p className="text-sm text-muted-foreground">Welcome! Create an account to get started</p>
          </div>
          <hr className="my-4 border-dashed" />
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd">Password</Label>
              <Input type="password" id="pwd" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} placeholder="••••••••" required />
              {password.length > 0 && (
                <div className="mt-2 space-y-1 p-2 bg-muted/50 rounded-md">
                  <ValidationItem valid={passwordValidation.minLength} text="At least 8 characters" />
                  <ValidationItem valid={passwordValidation.hasUppercase} text="One uppercase letter" />
                  <ValidationItem valid={passwordValidation.hasLowercase} text="One lowercase letter" />
                  <ValidationItem valid={passwordValidation.hasNumber} text="One number" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPwd">Confirm Password</Label>
              <Input type="password" id="confirmPwd" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} placeholder="••••••••" required />
              {confirmPassword.length > 0 && !passwordValidation.passwordsMatch && <p className="text-xs text-destructive">Passwords do not match</p>}
              {passwordValidation.passwordsMatch && <p className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Passwords match</p>}
            </div>
            <Button className="w-full" type="submit" disabled={isLoading || !canSubmit}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Continue"}
            </Button>
          </div>
        </div>
        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Have an account ?<Button asChild variant="link" className="px-2"><Link href="/sign-in">Sign In</Link></Button>
          </p>
        </div>
      </form>
    </section>
  );
}
