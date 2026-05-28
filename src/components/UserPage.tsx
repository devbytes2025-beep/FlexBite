import React, { useState } from "react";
import { UserProfile, DailyLog } from "../types";
import { calculateTargets } from "../utils/calories";
import { User, Scale, Award, ShieldAlert, LogOut, ChevronRight, Activity, Flame, Dumbbell } from "lucide-react";

interface UserPageProps {
  profile: UserProfile;
  logs: { [date: string]: DailyLog };
  onUpdateProfile: (profile: UserProfile) => void;
  onLogout: () => void;
}

export default function UserPage({ profile, logs, onUpdateProfile, onLogout }: UserPageProps) {
  const [weight, setWeight] = useState(profile.weight);
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight);
  const [goal, setGoal] = useState(profile.goal);
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel);

  const [notif, setNotif] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotif(null);

    // Compute updated targets on the fly!
    const targets = calculateTargets({
      ...profile,
      weight,
      targetWeight,
      goal,
      activityLevel
    });

    onUpdateProfile({
      ...profile,
      weight,
      targetWeight,
      goal,
      activityLevel,
      calorieTarget: targets.calories,
      proteinTarget: targets.protein
    });

    setNotif("BIOMETRIC VALUES SECURED, NO CAP! 🔒⚡");
    setTimeout(() => setNotif(null), 3000);
  };

  // Compute stats for achievements
  const totalMealsCount = Object.values(logs).reduce((sum, log) => sum + log.meals.length, 0);
  const totalWorkoutsMarked = Object.values(logs).filter(log => log.workoutMarked).length;
  const loggedAiCount = Object.values(logs).reduce((sum, log) => {
    return sum + log.meals.filter(m => m.imageUrl).length;
  }, 0);

  // Simple Gen Z themed rewards list
  const achievements = [
    {
      title: "WHEY SACRIFICE 🥩",
      desc: "Logged at least 5 meals to the nutrition tracker.",
      met: totalMealsCount >= 5,
    },
    {
      title: "PUMP CHAMPION 🏋️‍♂️",
      desc: "Marked at least 3 workouts on the official calendar.",
      met: totalWorkoutsMarked >= 3,
    },
    {
      title: "Caught in 4K 📸",
      desc: "Uploaded at least 1 food picture for AI analysis.",
      met: loggedAiCount >= 1,
    },
    {
      title: "GOLDEN BESTIE 👑",
      desc: "Completed onboarding quiz with target weights.",
      met: profile.onboarded,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Save metrics notification toast */}
      {notif && (
        <div className="bg-[#D9FF00] text-black font-black text-xs uppercase tracking-wider py-4 px-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black font-mono text-center animate-bounce">
          {notif}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Edit physical metrics & target recalculates (7 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white border-4 border-black rounded-3xl p-6 space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h3 className="text-lg font-black text-black flex items-center gap-1.5 uppercase">
                <User className="w-5 h-5 text-black" />
                Biometrics Coordinator
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                Edit physical properties. Changes recalculate calories & protein budgets dynamically.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-2.5 bg-white border-2 border-black text-black hover:bg-red-50 hover:text-red-600 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <LogOut className="w-3.5 h-3.5" />
              LOGOUT
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-500 font-black mb-1.5">Current Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="250"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 70)}
                className="w-full bg-white border-2 border-black text-black rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#D43F8D]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-black font-black mb-1.5">Target Weight (kg) *</label>
              <input
                type="number"
                min="30"
                max="250"
                value={targetWeight}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 70)}
                className="w-full bg-[#D9FF00]/10 border-2 border-black text-black rounded-xl py-3 px-4 text-sm font-black focus:outline-none focus:border-[#D43F8D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-500 font-black mb-1.5">Weekly Goal Mode</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full bg-white border-2 border-black text-black rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#D43F8D] transition-all cursor-pointer"
              >
                <option value="lose">Calorie Deficit / Shred 📉</option>
                <option value="maintain">Baseline Aesthetic Maintenance 💫</option>
                <option value="gain">Lean Mass Bulking surplus 🥩</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-gray-500 font-black mb-1.5">Activity Tier</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full bg-white border-2 border-black text-black rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#D43F8D] transition-all cursor-pointer"
              >
                <option value="sedentary">Sedentary (sitting/desk work) 💻</option>
                <option value="lightly">Lightly Active (1-3 d/wk walk) 🚶‍♂️</option>
                <option value="moderately">Moderately Active (3-5 d/wk pump) 🏃‍♂️</option>
                <option value="active">Extreme Active (6-7 d/wk athlete) 🏋️‍♂️</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#D9FF00] border-2 border-black text-black font-black uppercase py-4 px-4 rounded-xl text-xs tracking-wider hover:bg-[#C2E500] hover:translate-x-[0.5px] hover:translate-y-[0.5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer font-mono"
            >
              SAVE UPDATES & LOCK GOALS ⚡
            </button>
          </div>
        </form>

        {/* Right Side: Achievements & Math Explanation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Achievements Container */}
          <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-base font-black text-black mb-2 flex items-center gap-1.5 uppercase">
              <Award className="w-5 h-5 text-[#D43F8D] shrink-0" />
              Flex Rewards Trophies
            </h3>
            <p className="text-xs text-gray-500 mb-4 font-semibold">
              Collect active badging based on logs in local browser.
            </p>

            <div className="space-y-2.5">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-2xl p-3 flex justify-between items-center transition-all ${
                    ach.met 
                      ? 'bg-white border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <div>
                    <h4 className={`text-xs font-black leading-none ${ach.met ? 'text-black' : 'text-gray-400'}`}>
                      {ach.title}
                    </h4>
                    <p className={`text-[10px] mt-1 leading-snug font-medium ${ach.met ? 'text-gray-650' : 'text-gray-400'}`}>{ach.desc}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-mono font-black px-2.5 py-1 rounded-xl border-2 shrink-0 ${
                    ach.met 
                      ? 'bg-[#D9FF00] border-black text-black' 
                      : 'bg-transparent border-gray-200 text-gray-300'
                  }`}>
                    {ach.met ? "CLAIMED 🏆" : "LOCKED 🔒"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulas and math equations reference card */}
          <div className="p-5 bg-gray-50 border-2 border-black rounded-3xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-xs uppercase font-mono text-black font-black mb-1.5 flex items-center gap-1">
              <Activity className="w-4 h-4 text-black" />
              Active Sports Calculations
            </h4>
            <div className="space-y-2 text-[11px] text-gray-750 font-medium leading-relaxed">
              <p>
                <b>BMR Equation:</b> Calculated using the Mifflin-St Jeor formula based on height ({profile.height} cm), age ({profile.age} years) and weight ({profile.weight} kg).
              </p>
              <p>
                <b>TDEE Index:</b> Scales BMR by activity multiplier ({profile.activityLevel === 'sedentary' ? '1.2' : profile.activityLevel === 'lightly' ? '1.375' : profile.activityLevel === 'moderately' ? '1.55' : '1.725'}).
              </p>
              <p>
                <b>Protein Floor:</b> Strictly formulated on <b>Target Weight ({profile.targetWeight} kg)</b> at {profile.goal === 'gain' ? '2.2g/kg' : profile.goal === 'lose' ? '2.0g/kg' : '1.8g/kg'} ratio.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
