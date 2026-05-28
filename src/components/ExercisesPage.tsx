import React, { useState } from "react";
import { WorkoutLog, DailyLog } from "../types";
import { Dumbbell, Plus, Trash2, Clock, Flame, Sparkles, PlusCircle } from "lucide-react";

interface ExercisesPageProps {
  log: DailyLog;
  onAddWorkout: (workout: Omit<WorkoutLog, 'id'>) => void;
  onDeleteWorkout: (id: string) => void;
}

export default function ExercisesPage({ log, onAddWorkout, onDeleteWorkout }: ExercisesPageProps) {
  const [customName, setCustomName] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [caloriesBurned, setCaloriesBurned] = useState<number | "">("");

  // Preset typical gyms catalog
  const presets = [
    { name: "Heavy Barbell Squats 🦵", duration: 45, cals: 310, category: "Strength" },
    { name: "Incline Bench Press 🥩", duration: 30, cals: 190, category: "Strength" },
    { name: "Deadlift Max Efforts 💀", duration: 45, cals: 360, category: "Strength" },
    { name: "Stairmaster Shred Tier 🥵", duration: 25, cals: 280, category: "Cardio" },
    { name: "Power HIIT Circuit ⚡", duration: 20, cals: 240, category: "HIIT" },
    { name: "Decompression Yoga Flow 🧘‍♀️", duration: 30, cals: 90, category: "Rehab" },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onAddWorkout({
      name: customName.trim(),
      duration: Number(duration) || 30,
      caloriesBurned: Number(caloriesBurned) || 150,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setCustomName("");
    setDuration("");
    setCaloriesBurned("");
  };

  const handleLogPreset = (p: typeof presets[0]) => {
    onAddWorkout({
      name: p.name,
      duration: p.duration,
      caloriesBurned: p.cals,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  const totalCalsBurned = log.workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const totalDuration = log.workouts.reduce((sum, w) => sum + w.duration, 0);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border-2 border-black rounded-3xl p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-white border-2 border-black text-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Dumbbell className="w-5 h-5 pb-0.5" />
            </span>
            <div>
              <span className="text-[10px] font-mono text-gray-500 font-extrabold uppercase">ACTIVE WORKOUT TIME</span>
              <div className="text-xl font-mono font-black text-black mt-0.5">{totalDuration} MINUTES</div>
            </div>
          </div>
          <span className="text-xs font-mono font-black bg-[#D9FF00] border border-black text-black px-2.5 py-1.5 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            LOCKED IN ⚡
          </span>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-white border-2 border-black text-[#D43F8D] rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <span className="text-[10px] font-mono text-gray-500 font-extrabold uppercase">DEFICIT ENERGY OFFSET</span>
              <div className="text-xl font-mono font-black text-black mt-0.5">{totalCalsBurned} KCAL BURNED</div>
            </div>
          </div>
          <span className="text-xs font-mono font-black bg-gray-50 border border-black text-black px-2.5 py-1.5 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            DAY OFFSET
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Preset Gym Catalog (8 Cols) */}
        <div className="lg:col-span-8 bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start mb-6 pb-2 border-b-2 border-black">
            <div>
              <h3 className="text-lg font-black text-black flex items-center gap-1.5 uppercase tracking-wide">
                <Dumbbell className="w-5 h-5 text-black" />
                Flex Movement Catalog
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-semibold">
                Quick click pre-configured gym exercises, cardio, or aesthetic circuits.
              </p>
            </div>
            <span className="text-[10px] font-mono font-black bg-[#D9FF00] text-black border-2 border-black px-2.5 py-1 rounded-xl uppercase shrink-0">
              PRESET ENGINE ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset, index) => (
              <div
                key={index}
                className="bg-white hover:bg-gray-50 border-2 border-black rounded-2xl p-4 flex justify-between items-center transition-all group shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <div>
                  <span className="text-[9px] font-mono font-black text-black uppercase tracking-widest bg-gray-100 border border-black px-2 py-0.5 rounded-xl">
                    {preset.category}
                  </span>
                  <h4 className="text-sm font-black text-black mt-2 group-hover:text-[#D43F8D] transition-all uppercase">
                    {preset.name}
                  </h4>
                  <div className="flex gap-3 text-[10px] text-gray-500 font-mono font-bold mt-1">
                    <span>{preset.duration} mins</span>
                    <span>•</span>
                    <span className="text-[#D43F8D] font-black">-{preset.cals} kcal</span>
                  </div>
                </div>

                <button
                  onClick={() => handleLogPreset(preset)}
                  className="bg-[#D9FF00] border-2 border-black hover:bg-[#C2E500] text-black font-black text-xs py-1.5 px-3 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1 cursor-pointer hover:scale-102"
                >
                  <Plus className="w-3.5 h-3.5" />
                  LOG
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Manual Creator & Today Workout log (4 Cols) */}
        <div className="lg:col-span-4 bg-white border-4 border-black rounded-3xl p-6 flex flex-col space-y-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <h3 className="text-base font-black text-black uppercase tracking-wider flex items-center gap-1">
              <PlusCircle className="w-4.5 h-4.5 text-black" />
              Log Custom Workouts
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-semibold">
              Enter custom exercises not listed in the default catalog.
            </p>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-3.5 bg-gray-50 p-4 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <input
                type="text"
                required
                placeholder="Workout Name (e.g. Bench Press)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-white border-2 border-black text-black rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#D43F8D]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="1"
                placeholder="Duration (min)"
                value={duration}
                onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-white border-2 border-black text-black rounded-xl p-2.5 text-xs font-medium focus:outline-none"
              />
              <input
                type="number"
                min="1"
                placeholder="Burned (kcal)"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-white border-2 border-black text-black rounded-xl p-2.5 text-xs font-medium focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#D9FF00] border-2 border-black hover:bg-[#C2E500] text-black font-black text-xs uppercase py-2.5 px-4 rounded-xl transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              SAVE EXERCISE 🚀
            </button>
          </form>

          {/* List of current workouts already logged */}
          <div className="flex-1 space-y-3">
            <h4 className="text-xs font-mono font-black text-black uppercase tracking-widest pt-2">
              LOGGED TODAY ({log.workouts.length})
            </h4>

            {log.workouts.length === 0 ? (
              <div className="py-6 border-2 border-dashed border-black rounded-2xl text-center text-xs text-gray-500 font-semibold font-mono uppercase tracking-wider">
                Quiet day so far, bestie!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                {log.workouts.map((workout) => (
                  <div key={workout.id} className="bg-white border-2 border-black rounded-2xl p-2.5 flex justify-between items-center group shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                      <h4 className="text-xs font-black text-black uppercase">{workout.name}</h4>
                      <div className="flex gap-2.5 text-[10px] text-gray-600 font-mono font-bold mt-0.5">
                        <span>⏱️ {workout.duration} min</span>
                        <span>•</span>
                        <span className="text-[#D43F8D] font-black">-{workout.caloriesBurned} kcal</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteWorkout(workout.id)}
                      className="p-1.5 text-black hover:bg-red-50 hover:text-red-600 rounded-lg border-2 border-transparent hover:border-black transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
