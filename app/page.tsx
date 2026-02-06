"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industryType, setIndustryType] = useState("COMPANY");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              company_name: companyName,
              industry_type: industryType,
            },
          },
        });
        if (error) throw error;
        alert("Check your email for the confirmation link! Your organization environment is being auto-configured.");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-navy text-sand">
      <div className="z-10 max-w-md w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-gold">OSPREY</h1>

        <div className="bg-sand text-navy p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">{isLogin ? "Login" : "Register Organization"}</h2>

            <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Organization Name</label>
                            <input
                                type="text"
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Organization Type</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded"
                                value={industryType}
                                onChange={(e) => setIndustryType(e.target.value)}
                            >
                                <option value="COMPANY">Company / Enterprise</option>
                                <option value="UNIVERSITY">University / Education</option>
                                <option value="NGO">NGO / Non-Profit</option>
                                <option value="GOVERNMENT">Government / Public Sector</option>
                            </select>
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest text-white p-2 rounded hover:bg-opacity-90 transition-colors"
                >
                    {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Organization")}
                </button>
            </form>

            <div className="mt-4 text-center text-sm">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-navy underline hover:text-gold"
                >
                    {isLogin ? "Need to register a new organization?" : "Already have an account?"}
                </button>
            </div>
        </div>
      </div>
    </main>
  );
}
