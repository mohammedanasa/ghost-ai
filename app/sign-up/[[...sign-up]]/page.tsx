import { SignUp } from "@clerk/nextjs";
import { AuthLeftPanel } from "@/components/auth/auth-left-panel";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-base flex">
      <AuthLeftPanel />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <SignUp />
      </div>
    </div>
  );
}
