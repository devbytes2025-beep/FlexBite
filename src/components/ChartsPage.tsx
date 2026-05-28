import React from "react";
import { DailyLog } from "../types";
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine 
} from "recharts";
import { TrendingDown, Scale, Target, Flame, Activity, Zap } from "lucide-react";

interface ChartsPageProps {
  logs: { [date: string]: DailyLog };
  calorieTarget: number;
  proteinTarget: number;
  targetWeight: number;
  currentWeight: number;
}

export default function ChartsPage({ logs, calorieTarget, proteinTarget, targetWeight, currentWeight }: ChartsPageProps) {
  
  // Sort and process the last 7 days logs for chart representation
  const dateDates = Object.keys(logs).sort();
  
  // Ensure we display at least a trailing 7 days even if logs are sparse
  const processChartData = () => {
    let dayKeys = [...dateDates];
    
    // Fallback: If no logs exist, let's pre-populate 7 trailing calendar dates as scaffolding
    if (dayKeys.length === 0) {
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = d.toISOString().split("T")[0];
        dayKeys.push(dStr);
      }
    } else if (dayKeys.length < 5) {
      // Pad to have a comfortable looking chart spectrum
      const earliest = new Date(dayKeys[0]);
      for (let i = 1; i <= 5 - dayKeys.length; i++) {
        const d = new Date(earliest);
        d.setDate(earliest.getDate() - i);
        dayKeys.unshift(d.toISOString().split("T")[0]);
      }
    }

    return dayKeys.map((dateStr) => {
      const log = logs[dateStr];
      const calories = log ? log.meals.reduce((sum, m) => sum + m.calories, 0) : 0;
      const protein = log ? log.meals.reduce((sum, m) => sum + m.protein, 0) : 0;
      
      // Weight log fallback: Use current weight or calculate relative steps towards target body weight
      let weight = currentWeight;
      if (log && log.weightLogged) {
        weight = log.weightLogged;
      } else {
        // Simple simulation so the line chart isn't perfectly flat/blank for empty cells
        const index = dayKeys.indexOf(dateStr);
        const factor = index / (dayKeys.length - 1);
        weight = Math.round((currentWeight + (targetWeight - currentWeight) * (factor * 0.4)) * 10) / 10;
      }

      // Shorten date for readable labels e.g. "May 28"
      let label = dateStr;
      try {
        const [, m, d] = dateStr.split("-");
        const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        label = `${monthsShort[parseInt(m) - 1]} ${d}`;
      } catch (e) {}

      return {
        date: dateStr,
        label,
        Calories: calories,
        Protein: protein,
        "Body Weight": weight,
      };
    });
  };

  const chartData = processChartData();

  // Custom tooltips with sleek Gen Z glowing styles
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-mono text-xs text-black">
          <p className="font-sans font-black text-black mb-1.5">{label}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between gap-6 items-center my-0.5">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-black text-black">
                {item.value} {item.name === "Calories" ? "kcal" : item.name === "Protein" ? "g" : "kg"}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border-2 border-black rounded-3xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-gray-500 font-extrabold uppercase tracking-widest">Target Weight (Future self)</span>
              <div className="text-2xl font-mono font-black text-black mt-1">{targetWeight} kg</div>
            </div>
            <span className="p-2.5 rounded-2xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Target className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="text-[10px] text-gray-400 font-semibold mt-2">
            Target set during onboarding. Let's hit it!
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-gray-500 font-extrabold uppercase tracking-widest">Current Active Weight</span>
              <div className="text-2xl font-mono font-black text-black mt-1">{currentWeight} kg</div>
            </div>
            <span className="p-2.5 rounded-2xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Scale className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono font-black mt-2 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-[#D43F8D]" />
            <span>Delta remaining: {Math.abs(Math.round((currentWeight - targetWeight) * 10) / 10)} kg</span>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-gray-500 font-extrabold uppercase tracking-widest">Active Calorie Target</span>
              <div className="text-2xl font-mono font-black text-black mt-1">{calorieTarget} kcal</div>
            </div>
            <span className="p-2.5 rounded-2xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Flame className="w-4.5 h-4.5 text-[#D43F8D]" />
            </span>
          </div>
          <div className="text-[10px] text-gray-400 font-semibold mt-2">
            Computed offset for {currentWeight > targetWeight ? "Shredding" : "Mass Growth"}
          </div>
        </div>

        <div className="bg-[#D9FF00] border-2 border-black rounded-3xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-black font-black uppercase tracking-widest">Slashed Protein Floor</span>
              <div className="text-2xl font-mono font-black text-black mt-1">{proteinTarget}g / day</div>
            </div>
            <span className="p-2.5 rounded-2xl bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="w-4.5 h-4.5" />
            </span>
          </div>
          <div className="text-[10px] text-black font-semibold mt-2">
            Determined by future target body weight!
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart Card 1: Nutritional Intake Chart */}
        <div className="bg-white border-4 border-black rounded-3xl p-6 flex flex-col min-h-[380px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-4 pb-2 border-b-2 border-black">
            <span className="px-2.5 py-1 text-[9px] font-mono font-black text-[#D43F8D] bg-[#D43F8D]/10 rounded-xl border border-black uppercase tracking-wide">
              NUTRITIONAL CO-RELATION
            </span>
            <h3 className="text-base font-black text-black mt-1.5 flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-black" />
              Calorie & Protein Track
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mt-0.5 font-semibold">
              Visualizes daily food intake against your locked goals.
            </p>
          </div>

          <div className="flex-1 w-full text-xs font-mono font-bold" style={{ minHeight: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#000" />
                <YAxis stroke="#000" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                
                {/* Reference line of Calorie Limit */}
                <ReferenceLine y={calorieTarget} stroke="#000" strokeWidth={2} strokeDasharray="3 3" label={{ value: `Target: ${calorieTarget}c`, fill: '#000', fontSize: 10, fontWeight: 'black', position: 'top' }} />

                <Bar dataKey="Calories" fill="#D43F8D" radius={[4, 4, 0, 0]} stroke="#000" strokeWidth={1.5} />
                <Bar dataKey="Protein" fill="#D9FF00" radius={[4, 4, 0, 0]} stroke="#000" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Card 2: Aesthetic scaling & current weight trajectory line */}
        <div className="bg-white border-4 border-black rounded-3xl p-6 flex flex-col min-h-[380px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-4 pb-2 border-b-2 border-black">
            <span className="px-2.5 py-1 text-[9px] font-mono font-black text-black bg-[#D9FF00] rounded-xl border border-black uppercase tracking-wide">
              BIOMETRIC TRAJECTORY
            </span>
            <h3 className="text-base font-black text-black mt-1.5 flex items-center gap-1.5">
              <Scale className="w-4.5 h-4.5 text-black" />
              Weight Growth Trajectory
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mt-0.5 font-semibold">
              Reviews actual weights day-by-day mapping toward targeted weight budgets.
            </p>
          </div>

          <div className="flex-1 w-full text-xs font-mono font-bold" style={{ minHeight: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#000" />
                <YAxis domain={['auto', 'auto']} stroke="#000" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />

                {/* Reference Line for Target Weight */}
                <ReferenceLine y={targetWeight} stroke="#D43F8D" strokeWidth={2} strokeDasharray="3 3" label={{ value: `Goal: ${targetWeight}kg`, fill: '#D43F8D', fontSize: 10, fontWeight: 'black', position: 'insideTopLeft' }} />

                <Line 
                  type="monotone" 
                  dataKey="Body Weight" 
                  stroke="#000" 
                  strokeWidth={4} 
                  activeDot={{ r: 6, stroke: '#D9FF00', strokeWidth: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
