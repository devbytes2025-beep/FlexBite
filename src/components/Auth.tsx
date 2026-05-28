import React, { useState } from "react";
import { UserAccount } from "../types";
import { Flame, ShieldAlert, Sparkles, Smile } from "lucide-react";

interface AuthProps {
  onLoginSuccess: (account: UserAccount) => void;
  accounts: UserAccount[];
  onRegister: (email: string, name: string) => void;
}

export default function Auth({ onLoginSuccess, accounts, onRegister }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please put a valid email, bestie! 💀");
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError("Please enter your name for onboarding! 👋");
        return;
      }
      const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setError("Oop! This account already exists. Try logging in! 💅");
        return;
      }
      onRegister(email.toLowerCase(), name);
    } else {
      const match = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (!match) {
        setError("Never heard of this email. Sign up to get locked in! ⚡");
        return;
      }
      onLoginSuccess(match);
    }
  };

  const handleQuickLogin = (acc: UserAccount) => {
    onLoginSuccess(acc);
  };

  return (
    <div id="auth_container" className="min-h-screen bg-[#F9FAFB] text-[#1A1A1A] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative Grid Accent */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#D9FF00]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Branding Header */}
      <div className="mb-8 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-black text-black text-xs font-mono tracking-wider mb-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <Flame className="w-3.5 h-3.5 text-black fill-current animate-pulse" />
          DIALED OUT OF THE CHART NUTRITION
        </div>
        <h1 className="text-5xl font-black tracking-tight text-black select-none italic">
          FLEX<span className="text-[#D43F8D] not-italic">BITE</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-sans max-w-sm font-semibold">
          No cap calorie & protein tracking that actually gives main character energy. 👑
        </p>
      </div>

      <div className="w-full max-w-md bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-xl font-black text-black mb-2 flex items-center gap-2 uppercase tracking-wide">
            {isRegister ? (
              <>
                <Sparkles className="w-5 h-5 text-[#D43F8D]" />
                Create Account
              </>
            ) : (
              <>
                <Smile className="w-5 h-5 text-black" />
                Welcome Back
              </>
            )}
          </h2>

          {error && (
            <div className="p-3 bg-red-50 border-2 border-black text-red-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-mono uppercase text-gray-600 font-extrabold mb-1.5">What do we call you? *</label>
              <input
                type="text"
                placeholder="Name or nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAFAFA] border-2 border-black text-black font-semibold rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-[#D9FF00]/10 transition-all placeholder:text-gray-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-gray-600 font-extrabold mb-1.5">Your email address *</label>
            <input
              type="text"
              placeholder="e.g., bestie@flexbite.gg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAFAFA] border-2 border-black text-black font-semibold rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-[#D9FF00]/10 transition-all placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#D9FF00] hover:bg-[#C2E500] text-black border-2 border-black font-black py-3.5 px-4 rounded-xl text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRegister ? "Start Onboarding 🚀" : "Get Locked In ⚡"}
          </button>

          <p className="text-center text-xs text-gray-500 font-semibold">
            {isRegister ? "Already tracking?" : "New to the vibe?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-black underline font-black hover:text-[#D43F8D] transition-colors"
            >
              {isRegister ? "Log in here" : "Sign up in 5 seconds"}
            </button>
          </p>
        </form>

        {/* Saved Accounts helper box */}
        {accounts.length > 0 ? (
          <div className="mt-8 pt-6 border-t-2 border-black">
            <h3 className="text-xs font-mono uppercase text-black font-black mb-3 flex items-center gap-1.5">
              <span>Saved Accounts (Local Browser)</span>
              <span className="inline-flex w-2 h-2 rounded-full bg-[#D43F8D]" />
            </h3>
            <div className="max-h-28 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {accounts.map((acc, idx) => (
                <button
                  key={acc.id || idx}
                  onClick={() => handleQuickLogin(acc)}
                  className="w-full bg-[#FAFAFA] hover:bg-gray-50 hover:border-black text-left px-3.5 py-2.5 rounded-xl border-2 border-black flex justify-between items-center transition-all group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div>
                    <div className="text-xs text-black font-extrabold flex items-center gap-1.5">
                      {acc.profile.name}
                      {acc.profile.onboarded && (
                        <span className="text-[9px] bg-[#D9FF00] text-black border border-black px-1.5 py-0.2 rounded font-mono font-black">
                          {acc.profile.goal === 'lose' ? "SHRED" : acc.profile.goal === 'gain' ? "BULK" : "AESTHETIC"}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{acc.email}</div>
                  </div>
                  <span className="text-[10px] text-black font-mono bg-[#D9FF00] border border-black px-2 py-1 rounded-md font-black">
                    LOG IN →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 pt-6 border-t-2 border-black bg-[#D9FF00]/10 p-4 rounded-2xl border-2 border-black">
            <h3 className="text-xs font-black text-black flex items-center gap-2 mb-1 uppercase tracking-wider">
              💡 Pro Tip: Quick Demo
            </h3>
            <p className="text-[11px] text-gray-700 leading-relaxed font-semibold">
              No real accounts yet! Register with any fake email (e.g. <b>coach@flexbite.gg</b>) to instantly unlock calorie budgets and AI food photography!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
