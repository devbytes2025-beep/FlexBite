import React, { useState, useEffect } from "react";
import { UserAccount, UserProfile, DailyLog, MealLog, WorkoutLog } from "./types";
import Auth from "./components/Auth";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import CalendarPage from "./components/CalendarPage";
import ChartsPage from "./components/ChartsPage";
import ExercisesPage from "./components/ExercisesPage";
import UserPage from "./components/UserPage";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, LayoutGrid, Calendar, TrendingUp, Dumbbell, User, Sparkles, LogOut, Clock, Target 
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [logs, setLogs] = useState<{ [date: string]: DailyLog }>({});
  const [activeTab, setActiveTab] = useState<"dashboard" | "calendar" | "charts" | "exercises" | "profile">("dashboard");
  const [activeDate, setActiveDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [currentTime, setCurrentTime] = useState("");

  // Sync real-time clock header
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load registered local accounts from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("flexbite_accounts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAccounts(parsed);
        
        // Auto sign-in if check exists
        const lastEmail = localStorage.getItem("flexbite_session_email");
        if (lastEmail) {
          const match = parsed.find((a: UserAccount) => a.email === lastEmail);
          if (match) {
            setCurrentUser(match);
            loadUserLogs(match.id);
          }
        }
      } catch (e) {
        console.error("Failed loading local sessions:", e);
      }
    }
  }, []);

  const loadUserLogs = (uid: string) => {
    const savedLogs = localStorage.getItem(`flexbite_logs_${uid}`);
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        setLogs({});
      }
    } else {
      setLogs({});
    }
  };

  // Set Profile or Onboard values
  const handleOnboardingComplete = (profile: UserProfile) => {
    if (!currentUser) return;
    
    const updatedUser: UserAccount = {
      ...currentUser,
      profile
    };

    const nextAccounts = accounts.map((a) => (a.id === currentUser.id ? updatedUser : a));
    setAccounts(nextAccounts);
    localStorage.setItem("flexbite_accounts", JSON.stringify(nextAccounts));
    setCurrentUser(updatedUser);
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    handleOnboardingComplete(profile);
  };

  const handleRegister = (email: string, name: string) => {
    const newAcct: UserAccount = {
      id: Math.random().toString(36).substring(7),
      email: email.toLowerCase(),
      profile: {
        name,
        weight: 75,
        height: 175,
        age: 22,
        gender: "male",
        targetWeight: 75,
        goal: "maintain",
        activityLevel: "moderately",
        calorieTarget: 2200,
        proteinTarget: 135,
        onboarded: false,
      }
    };

    const nextAccts = [...accounts, newAcct];
    setAccounts(nextAccts);
    localStorage.setItem("flexbite_accounts", JSON.stringify(nextAccts));
    
    setCurrentUser(newAcct);
    localStorage.setItem("flexbite_session_email", newAcct.email);
    setLogs({});
  };

  const handleLogin = (acct: UserAccount) => {
    setCurrentUser(acct);
    localStorage.setItem("flexbite_session_email", acct.email);
    loadUserLogs(acct.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("flexbite_session_email");
    setLogs({});
  };

  // Unified logging helper for activeDate
  const getActiveDayLog = (): DailyLog => {
    return logs[activeDate] || {
      date: activeDate,
      meals: [],
      workouts: [],
      workoutMarked: false
    };
  };

  const updateActiveDayLog = (updatedLog: DailyLog) => {
    if (!currentUser) return;
    const nextLogs = {
      ...logs,
      [activeDate]: updatedLog
    };
    setLogs(nextLogs);
    localStorage.setItem(`flexbite_logs_${currentUser.id}`, JSON.stringify(nextLogs));
  };

  // Adding/Deleting Meals
  const handleAddMeal = (meal: Omit<MealLog, 'id'>) => {
    const current = getActiveDayLog();
    const newMeal: MealLog = {
      ...meal,
      id: Math.random().toString(36).substring(7)
    };
    const updated = {
      ...current,
      meals: [...current.meals, newMeal]
    };
    updateActiveDayLog(updated);
  };

  const handleDeleteMeal = (id: string) => {
    const current = getActiveDayLog();
    const updated = {
      ...current,
      meals: current.meals.filter((m) => m.id !== id)
    };
    updateActiveDayLog(updated);
  };

  // Adding/Deleting Workouts
  const handleAddWorkout = (workout: Omit<WorkoutLog, 'id'>) => {
    const current = getActiveDayLog();
    const newWorkout: WorkoutLog = {
      ...workout,
      id: Math.random().toString(36).substring(7)
    };
    const updated = {
      ...current,
      workouts: [...current.workouts, newWorkout],
      workoutMarked: true // Auto check dumbbell mark on workout additions! No cap!
    };
    updateActiveDayLog(updated);
  };

  const handleDeleteWorkout = (id: string) => {
    const current = getActiveDayLog();
    const updated = {
      ...current,
      workouts: current.workouts.filter((w) => w.id !== id)
    };
    updateActiveDayLog(updated);
  };

  // For retrospective edits in the Calendar component
  const handleUpdateLogByDate = (date: string, updated: DailyLog) => {
    if (!currentUser) return;
    const nextLogs = {
      ...logs,
      [date]: updated
    };
    setLogs(nextLogs);
    localStorage.setItem(`flexbite_logs_${currentUser.id}`, JSON.stringify(nextLogs));
  };

  // Render Logic
  if (!currentUser) {
    return (
      <Auth 
        accounts={accounts} 
        onLoginSuccess={handleLogin} 
        onRegister={handleRegister} 
      />
    );
  }

  if (currentUser && !currentUser.profile.onboarded) {
    return (
      <Onboarding 
        initialName={currentUser.profile.name} 
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  const activeDayLog = getActiveDayLog();
  const profile = currentUser.profile;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#D9FF00] selection:text-black">
      
      {/* Decorative Brand Grid Lines background if desired */}
      <div className="absolute top-0 left-0 w-full h-[380px] bg-linear-to-b from-[#D9FF00]/5 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Primary Action Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D9FF00] text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] select-none">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black italic tracking-tighter">FLEXBITE</span>
                <span className="text-[10px] font-mono font-bold bg-[#D9FF00] border border-black text-black px-1.5 py-0.2 rounded-full uppercase">pulse</span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider items-center flex gap-1">
                <Clock className="w-3 h-3 text-black" />
                {currentTime || "UTC PIPELINE CONNECTED"}
              </p>
            </div>
          </div>

          {/* Core Daily Date Selector with Active Goals indicator */}
          <div className="flex items-center gap-3 bg-white border-2 border-black px-3 py-1.5 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-mono text-gray-600 uppercase tracking-widest hidden sm:inline">Active Timeline:</span>
            <input
              type="date"
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
              className="bg-transparent border-0 text-xs font-mono font-bold text-black focus:outline-none focus:ring-0 select-none cursor-pointer"
            />
            <span className="text-gray-300">|</span>
            <div className="text-[10px] bg-[#D9FF00] border border-black px-2.5 py-0.5 rounded text-black font-mono uppercase font-black tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              {profile.goal === 'lose' ? "SHRED" : profile.goal === 'gain' ? "BULK 🥩" : "MAINTAIN"}
            </div>
          </div>

          {/* Short Profile HUD */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-extrabold text-black">Hey, {profile.name}! ⚡️</div>
              <div className="text-[10px] font-mono text-gray-400">{currentUser.email}</div>
            </div>
            
            <button 
              onClick={() => setActiveTab("profile")}
              className="w-10 h-10 rounded-xl bg-white border-2 border-black hover:bg-[#D9FF00] flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer relative group"
            >
              <User className="w-4.5 h-4.5" />
              <span className="absolute top-[-2px] right-[-2px] w-3 h-3 bg-[#D9FF00] border border-black rounded-full animate-ping" />
            </button>
          </div>

        </div>
      </header>

      {/* Primary Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + activeDate}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "dashboard" && (
              <Dashboard 
                log={activeDayLog}
                calorieTarget={profile.calorieTarget}
                proteinTarget={profile.proteinTarget}
                onAddMeal={handleAddMeal}
                onDeleteMeal={handleDeleteMeal}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarPage 
                logs={logs}
                calorieTarget={profile.calorieTarget}
                proteinTarget={profile.proteinTarget}
                onUpdateDailyLog={handleUpdateLogByDate}
              />
            )}

            {activeTab === "charts" && (
              <ChartsPage 
                logs={logs}
                calorieTarget={profile.calorieTarget}
                proteinTarget={profile.proteinTarget}
                targetWeight={profile.targetWeight}
                currentWeight={profile.weight}
              />
            )}

            {activeTab === "exercises" && (
              <ExercisesPage 
                log={activeDayLog}
                onAddWorkout={handleAddWorkout}
                onDeleteWorkout={handleDeleteWorkout}
              />
            )}

            {activeTab === "profile" && (
              <UserPage 
                profile={profile}
                logs={logs}
                onUpdateProfile={handleUpdateProfile}
                onLogout={handleLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Tactical Bottom Navbar with responsive tab routing */}
      <div className="sticky bottom-6 w-full flex justify-center z-40 px-4 mt-auto pb-6">
        <nav className="bg-white border-2 border-black rounded-3xl p-2.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex gap-1.5 max-w-md w-full justify-around">
          {[
            { id: "dashboard", icon: LayoutGrid, label: "Feed" },
            { id: "calendar", icon: Calendar, label: "Track" },
            { id: "charts", icon: TrendingUp, label: "Stats" },
            { id: "exercises", icon: Dumbbell, label: "Pump" },
            { id: "profile", icon: User, label: "Me" },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-all cursor-pointer ${
                  isSelected 
                    ? 'text-black font-black bg-[#D9FF00] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-5 h-5 shrink-0" />
                <span className="text-[9px] font-mono mt-1 uppercase tracking-widest">{tab.label}</span>
                
                {/* Visual marker dot if some entries logged to tab */}
                {tab.id === 'calendar' && Object.keys(logs).length > 0 && !isSelected && (
                  <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-[#D43F8D] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Human Footpath footer */}
      <footer className="py-4 border-t border-gray-200 text-center text-[10px] font-mono text-gray-400 bg-white tracking-widest uppercase">
        ⚡ FLEXBITE AESTHETIC DEVISE • NO CAP CALORIES • NO PHONY METADATA
      </footer>

    </div>
  );
}
