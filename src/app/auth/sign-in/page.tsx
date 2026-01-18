import { AuthView } from "@/components/auth";

export const metadata = {
  title: "Sign In — CaseCipher",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">CaseCipher</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your cases
          </p>
        </div>
        <AuthView pathname="sign-in" />
      </div>
    </div>
  );
}
