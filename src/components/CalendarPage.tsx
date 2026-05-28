import React, { useState } from "react";
import { DailyLog, MealLog, WorkoutLog } from "../types";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Dumbbell, Flame, Plus, Trash2, Trophy, Clock, Check 
} from "lucide-react";

interface CalendarPageProps {
  logs: { [date: string]: DailyLog };
  calorieTarget: number;
  proteinTarget: number;
  onUpdateDailyLog: (date: string, updated: DailyLog) => void;
}

export default function CalendarPage({ logs, calorieTarget, proteinTarget, onUpdateDailyLog }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split("T")[0]);

  // For retroactively logging a meal on the selected calendar date
  const [showAddMealForm, setShowAddMealForm] = useState(false);
  const [retroFood, setRetroFood] = useState("");
  const [retroCal, setRetroCal] = useState<number | "">("");
  const [retroPro, setRetroPro] = useState<number | "">("");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Selected date log reference or default empty skeleton
  const selectedLog: DailyLog = logs[selectedDateStr] || {
    date: selectedDateStr,
    meals: [],
    workouts: [],
    workoutMarked: false,
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (dayNumber: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    setSelectedDateStr(dateStr);
  };

  const toggleWorkoutMark = () => {
    const updated = { ...selectedLog, workoutMarked: !selectedLog.workoutMarked };
    onUpdateDailyLog(selectedDateStr, updated);
  };

  const handleRetroMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retroFood.trim()) return;

    const newMeal: MealLog = {
      id: Math.random().toString(36).substring(7),
      foodName: retroFood.trim(),
      calories: Number(retroCal) || 0,
      protein: Number(retroPro) || 0,
      carbs: 0,
      fats: 0,
      loggedAt: "Retro Logging"
    };

    const updated = {
      ...selectedLog,
      meals: [...selectedLog.meals, newMeal]
    };

    onUpdateDailyLog(selectedDateStr, updated);
    setRetroFood("");
    setRetroCal("");
    setRetroPro("");
    setShowAddMealForm(false);
  };

  const deleteRetroMeal = (mealId: string) => {
    const updated = {
      ...selectedLog,
      meals: selectedLog.meals.filter(m => m.id !== mealId)
    };
    onUpdateDailyLog(selectedDateStr, updated);
  };

  // Calendar render computation helpers
  const calendarCells = [];
  // Filler empty spaces for starting days offset
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="min-h-[85px] bg-transparent border border-gray-900/20" />);
  }

  // Actual day cell boxes
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    const cellLog = logs[dateStr];
    const totalCals = cellLog ? cellLog.meals.reduce((sum, m) => sum + m.calories, 0) : 0;
    const totalProt = cellLog ? cellLog.meals.reduce((sum, m) => sum + m.protein, 0) : 0;
    const isWorkoutDone = cellLog ? cellLog.workoutMarked : false;

    const isSelected = selectedDateStr === dateStr;
    const isToday = new Date().toISOString().split("T")[0] === dateStr;

    calendarCells.push(
      <button
        key={`day-${day}`}
        onClick={() => handleDayClick(day)}
        className={`min-h-[85px] p-2 border-2 text-left flex flex-col justify-between transition-all relative overflow-hidden group cursor-pointer rounded-2xl ${
          isSelected 
            ? 'bg-[#D9FF00]/25 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold' 
            : 'bg-white border-black hover:bg-gray-50'
        }`}
      >
        <div className="flex justify-between items-center w-full">
          <span className={`text-[11px] font-mono font-black px-1.5 py-0.5 rounded border ${
            isToday 
              ? 'bg-[#D9FF00] text-black border-black' 
              : isSelected 
                ? 'bg-black text-white border-black' 
                : 'text-black border-transparent'
          }`}>
            {day}
          </span>

          {/* Dumbbell Indicator for marked workout days */}
          {isWorkoutDone && (
            <span className="p-1 bg-white border border-black text-black rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Dumbbell className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Small Calorie/Protein stats labels */}
        {(totalCals > 0 || totalProt > 0) && (
          <div className="space-y-1 mt-2 w-full text-[9px] font-mono">
            {totalCals > 0 && (
              <div className={`px-1 py-0.5 rounded-lg font-black border border-black overflow-hidden text-ellipsis whitespace-nowrap block text-left ${totalCals >= calorieTarget ? 'bg-[#D43F8D]/15 text-[#D43F8D]' : 'bg-gray-100 text-black'}`}>
                🔥 {totalCals}c
              </div>
            )}
            {totalProt > 0 && (
              <div className={`px-1 py-0.5 rounded-lg font-black border border-black overflow-hidden text-ellipsis whitespace-nowrap block text-left ${totalProt >= proteinTarget ? 'bg-[#D9FF00] text-black' : 'bg-gray-50 text-black'}`}>
                🥦 {totalProt}g
              </div>
            )}
          </div>
        )}
      </button>
    );
  }

  // Count marked workouts in this month
  const workoutsInMonthCount = Object.keys(logs).reduce((count, key) => {
    if (key.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)) {
      if (logs[key].workoutMarked) return count + 1;
    }
    return count;
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-black rounded-3xl p-4 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="p-3 bg-white border-2 border-black text-[#D43F8D] rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Trophy className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[10px] font-mono text-gray-500 font-extrabold uppercase">MONTHLY HIT COMPLETED</div>
            <div className="text-lg font-mono font-black text-black">{workoutsInMonthCount} WORKOUTS</div>
            <div className="text-[10px] text-gray-400 font-sans mt-0.5 font-semibold">Logged in {months[currentMonth]} {currentYear}</div>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-4 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="p-3 bg-white border-2 border-black text-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Flame className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[10px] font-mono text-gray-500 font-extrabold uppercase">SELECTED DATE IN FOCUS</div>
            <div className="text-xl font-mono font-black text-black uppercase">{selectedDateStr}</div>
            <div className="text-[10px] text-[#D43F8D] font-mono font-extrabold mt-0.5">{selectedLog.meals.length} Meals recorded</div>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-4 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="p-3 bg-[#D9FF00] border-2 border-black text-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Check className="w-5 h-5 pb-0.5 stroke-[3px]" />
          </span>
          <div>
            <div className="text-[10px] font-mono text-gray-500 font-extrabold uppercase">WORKOUT TOGGLE MARKER</div>
            <button 
              onClick={toggleWorkoutMark}
              className={`text-xs font-mono font-black mt-1 px-3 py-1.5 rounded-xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] ${
                selectedLog.workoutMarked 
                  ? 'bg-[#D9FF00] text-black border-black/100' 
                  : 'bg-white text-gray-500 hover:text-black border-black/80 hover:bg-gray-55'
              }`}
            >
              {selectedLog.workoutMarked ? "✅ WORKOUT REGISTERED" : "🏋️‍♂️ MARK TODAY WORKOUT"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Core Calendar Box (8 Cols) */}
        <div className="lg:col-span-8 bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-black" />
              <h3 className="text-lg font-black text-black tracking-tight uppercase">
                {months[currentMonth]} {currentYear}
              </h3>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 bg-white border-2 border-black rounded-xl hover:bg-gray-50 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 bg-white border-2 border-black rounded-xl hover:bg-gray-50 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Month Week Grid Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono uppercase text-black font-black mb-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells}
          </div>
        </div>

        {/* Retroactive logger & day list panel (4 Cols) */}
        <div className="lg:col-span-4 bg-white border-4 border-black rounded-3xl p-6 flex flex-col space-y-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <h3 className="text-base font-black text-black uppercase tracking-wide">
              Day details: <span className="text-[#D43F8D]">{selectedDateStr}</span>
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Review records or retroactively add custom calories to this date block.
            </p>
          </div>

          {/* Exercises Toggle Indicator */}
          <div className="bg-gray-50 p-4 rounded-2xl border-2 border-black flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-mono text-black font-extrabold">Workout Mark status:</span>
            <button
              onClick={toggleWorkoutMark}
              className={`p-2.5 rounded-xl border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                selectedLog.workoutMarked
                  ? 'bg-[#D9FF00] text-black shadow-none scale-95'
                  : 'bg-white text-gray-500 hover:text-black'
              }`}
            >
              <Dumbbell className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* List of meals logged on this retroactive date */}
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono font-black text-black">
              <span>JOURNALED MEALS ({selectedLog.meals.length})</span>
              <button 
                onClick={() => setShowAddMealForm(!showAddMealForm)}
                className="text-xs text-[#D43F8D] hover:underline flex items-center gap-1 cursor-pointer font-black"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Meal Creation Drawer */}
            {showAddMealForm && (
              <form onSubmit={handleRetroMealSubmit} className="bg-gray-55 border-2 border-black p-4 rounded-2xl space-y-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Meal Name (e.g., Egg Bagel)"
                    value={retroFood}
                    onChange={(e) => setRetroFood(e.target.value)}
                    className="w-full bg-white border-2 border-black text-black rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-[#D43F8D]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Cals (kcal)"
                    value={retroCal}
                    onChange={(e) => setRetroCal(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-white border-2 border-black text-black rounded-xl p-2 text-xs font-mono focus:outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Pro (grams)"
                    value={retroPro}
                    onChange={(e) => setRetroPro(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-white border-2 border-black text-black rounded-xl p-2 text-xs font-mono focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#D9FF00] hover:bg-[#C2E500] text-black font-black border-2 border-black text-xs py-2 rounded-xl transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    SAVE ENTRY ⚡
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMealForm(false)}
                    className="bg-white text-black px-3 py-2 rounded-xl border-2 border-black text-xs cursor-pointer font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {selectedLog.meals.length === 0 ? (
              <div className="py-6 border-2 border-dashed border-black rounded-2xl text-center text-xs text-gray-500 font-semibold font-mono uppercase tracking-wider">
                No food logged on this date
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {selectedLog.meals.map((meal) => (
                  <div key={meal.id} className="bg-white border-2 border-black rounded-2xl p-2.5 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                      <h4 className="text-xs font-black text-black uppercase">{meal.foodName}</h4>
                      <div className="flex gap-2.5 text-[10px] text-gray-600 font-mono font-bold mt-0.5">
                        <span>🔥 {meal.calories} kcal</span>
                        <span>•</span>
                        <span className="text-[#D43F8D] font-black">P: {meal.protein}g</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRetroMeal(meal.id)}
                      className="p-1.5 text-black hover:bg-red-50 hover:text-red-600 rounded-lg border-2 border-transparent hover:border-black transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t-2 border-black text-center text-[10px] font-mono text-black font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> RETROACTIVE TIMELINE LOGGER
          </div>
        </div>

      </div>

    </div>
  );
}
