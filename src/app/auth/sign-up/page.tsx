import { AuthView } from "@/components/auth";

export const metadata = {
  title: "Sign Up — CaseCipher",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">CaseCipher</h1>
          <p className="text-sm text-muted-foreground">
            Create your account to get started
          </p>
        </div>
        <AuthView pathname="sign-up" />
      </div>
    </div>
  );
}
