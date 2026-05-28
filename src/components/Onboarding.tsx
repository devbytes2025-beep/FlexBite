import React, { useState } from "react";
import { UserProfile } from "../types";
import { calculateTargets, calculateBMR, calculateTDEE } from "../utils/calories";
import { ArrowLeft, ArrowRight, Activity, Target, User, HeartPulse, Check, Sparkles } from "lucide-react";

interface OnboardingProps {
  initialName: string;
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ initialName, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Omit<UserProfile, 'calorieTarget' | 'proteinTarget' | 'onboarded'>>({
    name: initialName || "Bestie",
    weight: 75,
    height: 175,
    age: 22,
    gender: 'male',
    targetWeight: 75,
    goal: 'maintain',
    activityLevel: 'moderately',
  });

  const handleNext = () => {
    if (step < 4) {
      // For progress feedback, auto sync targetWeight if it was untouched or matches weight initially
      if (step === 2 && profile.targetWeight === 75 && profile.weight !== 75) {
        setProfile(p => ({ ...p, targetWeight: p.weight }));
      }
      setStep(step + 1);
    } else {
      const targets = calculateTargets(profile);
      onComplete({
        ...profile,
        calorieTarget: targets.calories,
        proteinTarget: targets.protein,
        onboarded: true,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const bmrValue = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdeeValue = calculateTDEE(bmrValue, profile.activityLevel);
  const targets = calculateTargets(profile);

  // Dynamic status feedback labels
  const getGoalExplain = () => {
    switch (profile.goal) {
      case 'lose':
        return {
          title: "SHRED / CALORIE DEFICIT",
          explain: `Targeting -500 kcal from TDEE. Muscle retention is key! Protein at 2.0g per kg of Target Weight (${profile.targetWeight} kg) ensures your physique looks tight. No cap. 🛡️`
        };
      case 'gain':
        return {
          title: "LEAN BULK / ADVANCED GAINS",
          explain: `Aiming for +350-400 kcal surplus to maximize hypertrophy. Protein at 2.2g per kg of Target Weight (${profile.targetWeight} kg) handles protein-synthesis perfectly. Let's grow! 🥛`
        };
      case 'maintain':
      default:
        return {
          title: "AESTHETIC MAINTENANCE",
          explain: `Keep composition lean and stable. Calories match TDEE. Protein baseline set at 1.8g per kg of Target Weight (${profile.targetWeight} kg) to preserve muscle tone. Perfect balance. ⚡`
        };
    }
  };

  const stepsCount = 4;
  const progressPercent = (step / stepsCount) * 100;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1A1A1A] flex items-center justify-center py-10 px-4 relative selection:bg-[#D9FF00]">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#D9FF00]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10 flex flex-col min-h-[500px]">
        
        {/* Dynamic Timeline Indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-mono text-black font-extrabold mb-2">
            <span>GETTING LOGGED IN</span>
            <span>STEP {step} OF {stepsCount}</span>
          </div>
          <div className="w-full h-3 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D9FF00] border-r-2 border-black transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="p-2.5 rounded-xl bg-[#D9FF00] text-black inline-block border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                  <User className="w-5 h-5" />
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight uppercase">
                  What's your baseline, bestie? ✨
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 font-sans font-semibold">
                  Let's configure your unique identity traits to customize energy outputs.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-600 font-extrabold mb-1.5">What should we call you?</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-[#FAFAFA] border-2 border-black text-black font-semibold rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-[#D9FF00]/10 focus:ring-1 focus:ring-black transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-600 font-extrabold mb-1.5">Your age</label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: Math.max(12, parseInt(e.target.value) || 20) })}
                      className="w-full bg-[#FAFAFA] border-2 border-black text-black font-semibold rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-[#D9FF00]/10 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-600 font-extrabold mb-1.5">Gender Assigned</label>
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                      className="w-full bg-[#FAFAFA] border-2 border-black text-black font-semibold rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-[#D9FF00]/10 transition-all cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Non-Binary / Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="p-2.5 rounded-xl bg-[#D9FF00] text-black inline-block border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                  <Target className="w-5 h-5 fill-current" />
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight uppercase">
                  Log your biomechanics ⚖️
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 font-semibold">
                  Your targets are computed accurately as per your target body weight.
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-600 font-extrabold mb-1.5">Current (kg)</label>
                    <input
                      type="number"
                      min="30"
                      max="250"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: Math.max(1, parseFloat(e.target.value) || 70) })}
                      className="w-full bg-[#FAFAFA] border-2 border-black text-black font-black rounded-xl py-3 px-2 text-sm focus:outline-none focus:bg-[#D9FF00]/10 transition-all font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-600 font-extrabold mb-1.5">Height (cm)</label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: Math.max(1, parseFloat(e.target.value) || 170) })}
                      className="w-full bg-[#FAFAFA] border-2 border-black text-black font-black rounded-xl py-3 px-2 text-sm focus:outline-none focus:bg-[#D9FF00]/10 transition-all font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-black font-extrabold mb-1.5">Target Wt (kg)</label>
                    <input
                      type="number"
                      min="30"
                      max="250"
                      value={profile.targetWeight}
                      onChange={(e) => setProfile({ ...profile, targetWeight: Math.max(1, parseFloat(e.target.value) || 70) })}
                      className="w-full bg-[#FAFAFA] border-2 border-black text-black font-black rounded-xl py-3 px-2 text-sm focus:outline-none focus:bg-[#D9FF00]/20 transition-all font-mono text-center"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#D9FF00]/10 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-2">
                  <h4 className="text-xs uppercase font-mono text-black font-black mb-1">
                    💡 Why protein targets user target body weight?
                  </h4>
                  <p className="text-[11px] text-gray-700 leading-relaxed font-semibold">
                    Setting protein targets according to your <b>target body weight</b> allows your future metabolism to prepare for the specific body composition you desire. This ensures accurate muscle synthesis without overloading calories when shredding, or under-serving protein when bulking!
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="p-2.5 rounded-xl bg-[#D9FF00] text-black inline-block border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                  <Activity className="w-5 h-5 text-black" />
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight uppercase">
                  What's the master goal? 🎯
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 font-semibold">
                  Are we building a bulk, dialing in a cut, or optimizing baseline athletic maintenance?
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-600 font-extrabold mb-1.5">Your primary goal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'lose', label: 'Lose Weight 📉', color: 'hover:border-rose-400' },
                      { id: 'maintain', label: 'Maintain 💫', color: 'hover:border-teal-400' },
                      { id: 'gain', label: 'Lean Bulk 🥩', color: 'hover:border-lime-500' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setProfile({ ...profile, goal: g.id as any })}
                        className={`py-3 px-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          profile.goal === g.id
                            ? 'bg-[#D9FF00] border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                            : `bg-white border-black text-gray-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-600 font-extrabold mb-1.5">Your weekly activity tier</label>
                  <div className="space-y-2">
                    {[
                      { id: 'sedentary', title: 'Sedentary 💻', desc: 'Mainly sitting work, little to no exercise' },
                      { id: 'lightly', title: 'Lightly Active 🚶‍♂️', desc: '1-3 days standard workouts or brisk walking' },
                      { id: 'moderately', title: 'Moderately Active 🏃‍♂️', desc: '3-5 days high intensity workouts/cardio' },
                      { id: 'active', title: 'Very Active 🏋️‍♂️', desc: '6-7 days extreme workouts, training daily' },
                    ].map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => setProfile({ ...profile, activityLevel: act.id as any })}
                        className={`w-full p-3 rounded-xl border-2 text-left flex justify-between items-center transition-all cursor-pointer ${
                          profile.activityLevel === act.id
                            ? 'bg-gradient-to-r from-[#D9FF00]/10 to-transparent border-black text-black font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-[#FAFAFA] border-black text-gray-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        <div>
                          <div className={`text-xs uppercase font-black tracking-wider ${profile.activityLevel === act.id ? 'text-[#D43F8D]' : 'text-gray-900'}`}>
                            {act.title}
                          </div>
                          <div className="text-[10px] text-gray-500 font-semibold mt-0.5">{act.desc}</div>
                        </div>
                        {profile.activityLevel === act.id && (
                          <div className="w-5 h-5 rounded-full bg-black border border-black flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="p-2.5 rounded-xl bg-[#D9FF00] text-black inline-block border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4">
                  <HeartPulse className="w-5 h-5 text-black" />
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight uppercase">
                  Your target is custom-locked! 🔒
                </h2>
                <p className="text-sm text-gray-500 mt-1.5 font-semibold">
                  See how calories/TDEE coordinate with target body weight protein requirements.
                </p>
              </div>

              {/* Targets Summary Displays */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-black rounded-2xl p-4 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-xs font-mono uppercase text-gray-500 font-extrabold mb-1">Calories Budget</div>
                    <div className="text-3xl font-mono font-black text-black">
                      {targets.calories} <span className="text-xs text-gray-600 uppercase font-sans">kcal</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">TDEE: {tdeeValue} kcal</div>
                  </div>

                  <div className="bg-white border-2 border-black rounded-2xl p-4 text-center relative overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div className="absolute top-1 right-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#D43F8D] animate-pulse" />
                    </div>
                    <div className="text-xs font-mono uppercase text-[#D43F8D] font-black mb-1">PRO BIBLE (PROTEIN)</div>
                    <div className="text-3xl font-mono font-black text-black">
                      {targets.protein} <span className="text-xs text-[#D43F8D] uppercase font-sans">g</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">
                      Target: {profile.targetWeight} kg × {profile.goal === 'gain' ? '2.2g' : profile.goal === 'lose' ? '2.0g' : '1.8g'}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#D43F8D]/10 text-black rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="text-xs uppercase tracking-wider font-mono font-black text-black flex items-center gap-1.5">
                    🚀 {getGoalExplain().title}
                  </h4>
                  <p className="text-[11px] text-gray-700 leading-relaxed font-semibold mt-2">
                    {getGoalExplain().explain}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2 text-[10px] font-mono text-black font-extrabold">
                  <div className="bg-gray-100 border border-black p-2 rounded-xl">BMR: {Math.round(bmrValue)}</div>
                  <div className="bg-gray-100 border border-black p-2 rounded-xl">AGE: {profile.age} Y/O</div>
                  <div className="bg-gray-100 border border-black p-2 rounded-xl">HT: {profile.height} cm</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t-2 border-black">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
              step === 1 
                ? 'opacity-30 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-white hover:bg-gray-50 text-black'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-5 py-3 rounded-xl bg-[#D9FF00] border-2 border-black text-black font-black hover:bg-[#C2E500] hover:scale-[1.02] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            {step === stepsCount ? "Save & Enter Dashboard ⚡" : "Continue"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
