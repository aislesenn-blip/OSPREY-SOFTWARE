"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Mountain, Loader2 } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        // Register Company
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName,
              role: 'admin' // Initial user is admin
            },
          },
        });
        if (error) throw error;
        // Auto login might not happen if email confirmation is required, but let's assume it works or prompts check email
        // For development/demo, usually email confirmation is off or we handle it.
        // If "Implicit" flow or confirmation disabled, it logs in.
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A192F] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-[#E6DDC4] flex items-center justify-center">
            <Mountain className="h-6 w-6 text-[#0A192F]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#E6DDC4]">OSPREY</h1>
          <p className="text-[#8892b0] text-sm tracking-widest uppercase">Enterprise Tourism OS</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl text-[#0A192F] text-center">
              {isLogin ? "Welcome Back" : "Register Organization"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? "Enter your credentials to access the workspace." : "Create a new workspace for your safari company."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Organization Name</label>
                    <Input
                      placeholder="e.g. Serengeti Luxury Safaris"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-gray-50"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-50"
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#0A192F] hover:bg-[#1B4D3E] text-white transition-all duration-300 h-11"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isLogin ? "Sign In" : "Create Workspace")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4 bg-gray-50/50">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#0A192F] hover:underline hover:text-[#1B4D3E] transition-colors"
            >
              {isLogin ? "Don't have an account? Register Company" : "Already have an account? Sign In"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
