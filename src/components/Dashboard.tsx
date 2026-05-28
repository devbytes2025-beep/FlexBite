import React, { useState, useRef } from "react";
import { DailyLog, MealLog, GEMINI_FOOD_ANALYSIS } from "../types";
import { 
  Camera, Plus, Trash2, Utensils, Sparkles, Loader2, Dumbbell, Flame, CheckCircle2, ShieldAlert, Droplet, Timer
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DashboardProps {
  log: DailyLog;
  calorieTarget: number;
  proteinTarget: number;
  onAddMeal: (meal: Omit<MealLog, 'id'>) => void;
  onDeleteMeal: (id: string) => void;
}

export default function Dashboard({ log, calorieTarget, proteinTarget, onAddMeal, onDeleteMeal }: DashboardProps) {
  // Manual Log States
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");
  const [carbs, setCarbs] = useState<number | "">("");
  const [fats, setFats] = useState<number | "">("");
  const [showManualLog, setShowManualLog] = useState(false);

  // AI Photographic Log States
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GEMINI_FOOD_ANALYSIS | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New features: Hydration Tracker & Gym Rest Timer States
  const [hydration, setHydration] = useState(() => {
    const saved = localStorage.getItem(`flexbite_hydration_${log.date}`);
    return saved ? Number(saved) : 0;
  });

  const updateHydration = (val: number) => {
    const next = Math.max(0, val);
    setHydration(next);
    localStorage.setItem(`flexbite_hydration_${log.date}`, String(next));
  };

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerMax, setTimerMax] = useState(45);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRestTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    setTimerMax(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRestTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimeLeft(null);
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const [activeMantra, setActiveMantra] = useState("VIBE STATUS: Pure potential. Click 'VIBE CHECK' to align macro fields, bestie! 🧘‍♂️⚡");
  const quotes = [
    "No cap, your quads looked massive today. Get another set in! 🍗",
    "Keep lifting, keep eating, keep sleeping. Consistency is key, bestie! ✊",
    "If you're missing your sets, you're capping on your future self. Let's lift! 🏋️‍♂️",
    "Chicken, rice, broccoli. It is a canonical event of mass, bestie! 🍚🐓",
    "Protein is dialled to the maximum today. Drink water to flush out lipid cells! 💦",
    "Shredding is 90% kitchen behavior. Avoid goofy snacks, lock in! 📉🍟",
    "Aesthetic values secured today. We got main character energy! 👑⚡",
    "Rest times are holy. Lock your screen, hydrate, and don't chat! 🤫🕒"
  ];
  const generateMantra = () => {
    const index = Math.floor(Math.random() * quotes.length);
    setActiveMantra(quotes[index]);
  };

  // Loading joke rotator representing sports coach personality
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const jokes = [
    "Analyzing lipid clusters... 🧬",
    "Weighting protein density index... 🥛",
    "Running vision-matrix metrics... 🧠",
    "Consulting athletic oracle engines... 🤖",
    "Double-checking carb limits, no cap... 🎯",
    "Locking in raw amino values... 🥩"
  ];

  // Totals
  const totalCalories = log.meals.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = log.meals.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = log.meals.reduce((sum, item) => sum + item.carbs, 0);
  const totalFats = log.meals.reduce((sum, item) => sum + item.fats, 0);

  const calPercent = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));
  const protPercent = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));

  // Loading joke loop
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (analyzing) {
      timer = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % jokes.length);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [analyzing]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    onAddMeal({
      foodName: foodName.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setFoodName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setShowManualLog(false);
  };

  // Quick Preset Meal helper
  const addQuickLog = (name: string, cal: number, prot: number, c: number, f: number) => {
    onAddMeal({
      foodName: name,
      calories: cal,
      protein: prot,
      carbs: c,
      fats: f,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  // Convert File to Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setAiError("Oop! Only image uploads are allowed, bestie 🖼️");
      return;
    }
    setAiError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  // Call Server-Side Gemini API
  const analyzeImage = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    setAiError(null);

    try {
      // Extract pure base64 from dataURL
      const base64Data = imagePreview.split(",")[1];
      const mimeType = imagePreview.split(",")[0].split(":")[1].split(";")[0];

      const response = await fetch("/api/ai/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, mimeType })
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || "Failed to analyze meal snapshot");
      }

      const report: GEMINI_FOOD_ANALYSIS = await response.json();
      setAnalysisResult(report);
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "AI scanning timed out. Please try again or log manually.");
    } finally {
      setAnalyzing(false);
    }
  };

  const addAiLoggedMeal = () => {
    if (!analysisResult) return;
    onAddMeal({
      foodName: analysisResult.foodName,
      calories: analysisResult.calories,
      protein: analysisResult.protein,
      carbs: analysisResult.carbs,
      fats: analysisResult.fats,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: imagePreview || undefined
    });
    // clean up states
    setImagePreview(null);
    setAnalysisResult(null);
  };

  // Fun motivator badges based on daily inputs
  const getMotivationalHype = () => {
    if (totalCalories === 0) return "DAILY SLATE CLEAN! LOG YOUR MEALS TO UNLOCK GAINS 🍽️";
    if (totalProtein >= proteinTarget && totalCalories > calorieTarget) return "BULK DIALED OUT OF THE MATRIX! 🚀⚡";
    if (totalProtein >= proteinTarget) return "PROTEIN GOAL CRUSHED! WHEY TO GO, BESTIE! 🏆🥛";
    if (totalCalories >= calorieTarget) return "FUEL FLOODED! READY TO WORKOUT FOR AESTHETICS? 💪";
    return "STAY DIALED IN. MAIN CHARACTER ENERGY ACTIVATED! ⚡👑";
  };

  const clearImage = () => {
    setImagePreview(null);
    setAnalysisResult(null);
    setAiError(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Top Motivator Bar */}
      <div className="bg-white border-2 border-black rounded-3xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 bg-black rounded-full animate-ping shrink-0" />
          <h2 className="text-xs font-mono font-black text-black uppercase tracking-wider">
            {getMotivationalHype()}
          </h2>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] bg-[#D9FF00] px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-black font-black">TODAY'S STATS:</span>
          <span className="text-black font-black">{totalCalories}KCAL</span>
          <span className="text-black/40">|</span>
          <span className="text-[#D43F8D] font-black">{totalProtein}G PRO</span>
        </div>
      </div>

      {/* Primary Nutritional Circular Meters & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Calorie Ring Card */}
        <div className={`bg-white border-2 border-black rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${totalCalories >= calorieTarget ? 'ring-4 ring-[#D43F8D]/30 border-[#D43F8D]' : ''}`}>
          {totalCalories >= calorieTarget && (
            <div className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D43F8D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D43F8D]"></span>
            </div>
          )}
          <div className="text-center mb-4">
            <span className="text-xs font-mono text-gray-500 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#D43F8D] fill-current" />
              Calories Intake
            </span>
          </div>
 
          {/* SVG Circular Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="58"
                className="stroke-gray-100 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                className={`stroke-[#D43F8D] fill-none transition-all duration-500 stroke-linecap-round ${totalCalories >= calorieTarget ? 'animate-pulse [filter:drop_shadow(0_0_8px_#D43F8D)]' : ''}`}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - calPercent / 100)}`}
              />
            </svg>
            <div className="absolute text-center bg-transparent">
              <div className="text-3xl font-mono font-black text-black">{totalCalories}</div>
              <div className="text-[10px] text-gray-500 font-mono mt-0.5">/ {calorieTarget} kcal</div>
            </div>
          </div>
 
          <div className="mt-4 text-center">
            <div className={`text-xs font-bold uppercase tracking-wide py-1 px-2.5 rounded-lg font-mono border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${calorieTarget - totalCalories > 0 ? 'text-black bg-[#D9FF00]' : 'text-white bg-[#D43F8D]'}`}>
              {calorieTarget - totalCalories > 0 
                ? `${calorieTarget - totalCalories} kcal remaining` 
                : `${Math.abs(calorieTarget - totalCalories)} kcal surplus`}
            </div>
          </div>
        </div>
 
        {/* Protein Meter Card */}
        <div className={`bg-white border-2 border-black rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${totalProtein >= proteinTarget ? 'ring-4 ring-[#D9FF00]/40 border-black' : ''}`}>
          {totalProtein >= proteinTarget && (
            <div className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9FF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D9FF00]"></span>
            </div>
          )}
          <div className="text-center mb-4">
            <span className="text-xs font-mono text-gray-500 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-black" />
              PROTEIN (BUILD ENGINE)
            </span>
          </div>
 
          {/* SVG Protein Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="58"
                className="stroke-gray-100 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                className={`stroke-[#D9FF00] fill-none transition-all duration-500 stroke-linecap-round ${totalProtein >= proteinTarget ? 'animate-pulse [filter:drop_shadow(0_0_8px_#D9FF00)]' : ''}`}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - protPercent / 100)}`}
              />
            </svg>
            <div className="absolute text-center bg-transparent">
              <div className="text-3xl font-mono font-black text-black">{totalProtein}g</div>
              <div className="text-[10px] text-gray-500 font-mono mt-0.5">/ {proteinTarget}g target</div>
            </div>
          </div>
 
          <div className="mt-4 text-center">
            <div className={`text-xs font-bold uppercase tracking-wide py-1 px-2.5 rounded-lg font-mono border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${proteinTarget - totalProtein > 0 ? 'text-black bg-gray-100' : 'text-black bg-[#D9FF00]'}`}>
              {proteinTarget - totalProtein > 0 
                ? `${proteinTarget - totalProtein}g needed today` 
                : "Aesthetic caps met! 👑"}
            </div>
          </div>
        </div>
 
        {/* Macro Elements Breakdown Card */}
        <div className="bg-white border-2 border-black rounded-3xl p-5 flex flex-col justify-center space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 font-extrabold mb-1">
            Macronutrients Logged
          </h3>
          
          {/* Carbs Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-gray-700 font-extrabold">Carbohydrates</span>
              <span className="text-gray-900 font-mono font-black">{totalCarbs}g</span>
            </div>
            <div className="w-full h-3 bg-gray-100 border border-black rounded-full overflow-hidden">
              <div className="h-full bg-orange-400" style={{ width: `${Math.min(100, Math.max(5, (totalCarbs / 300) * 100))}%` }} />
            </div>
          </div>
 
          {/* Fats Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-gray-700 font-extrabold">Dietary Fats</span>
              <span className="text-gray-900 font-mono font-black">{totalFats}g</span>
            </div>
            <div className="w-full h-3 bg-gray-100 border border-black rounded-full overflow-hidden">
              <div className="h-full bg-[#D43F8D]" style={{ width: `${Math.min(100, Math.max(5, (totalFats / 90) * 100))}%` }} />
            </div>
          </div>
 
          <div className="pt-2 border-t-2 border-black grid grid-cols-2 gap-2 text-center text-[10px] font-mono text-gray-500 font-extrabold">
            <div>MEALS: {log.meals.length} LOGGED</div>
            <div className="bg-[#D9FF00] text-black border border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase">
              STATUS: {totalProtein >= proteinTarget && totalCalories <= calorieTarget ? "CLEAN" : "ACTIVE"}
            </div>
          </div>
        </div>

        {/* Macro Split Recharts Pie Chart Card */}
        <div className="bg-white border-2 border-black rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[200px]">
          <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 font-extrabold mb-2 text-center">
            Macro Split Ratio
          </h3>
          
          <div className="w-full h-32 flex items-center justify-center relative">
            {totalCarbs > 0 || totalFats > 0 || totalProtein > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Carbs", value: totalCarbs, color: "#FB923C" },
                      { name: "Fats", value: totalFats, color: "#D43F8D" },
                      { name: "Protein", value: totalProtein, color: "#D9FF00" }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={48}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {[
                      { name: "Carbs", color: "#FB923C" },
                      { name: "Fats", color: "#D43F8D" },
                      { name: "Protein", color: "#D9FF00" }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={1.5} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #000', 
                      borderRadius: '8px', 
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#000'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-2 font-mono text-[9px] text-gray-400 font-black uppercase leading-snug">
                Equal split preview<br />(no meals logged)
                <div className="text-[14px] mt-1">🍗 🍳 🍚</div>
              </div>
            )}
            
            {/* Absolute center text for sum of total grams */}
            {(totalCarbs > 0 || totalFats > 0 || totalProtein > 0) && (
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] font-mono font-black text-black">
                  {totalCarbs + totalFats + totalProtein}g
                </span>
              </div>
            )}
          </div>

          {/* Custom micro legends */}
          <div className="grid grid-cols-3 gap-1.5 mt-2 w-full text-center text-[9px] font-mono font-black">
            <div className="flex flex-col items-center">
              <span className="w-2.5 h-1.5 rounded-full border border-black bg-orange-400 mb-0.5" />
              <span className="text-gray-600">CRB: {totalCarbs > 0 ? Math.round((totalCarbs / (totalCarbs + totalFats + totalProtein)) * 100) : 0}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-2.5 h-1.5 rounded-full border border-black bg-[#D43F8D] mb-0.5" />
              <span className="text-gray-600">FAT: {totalFats > 0 ? Math.round((totalFats / (totalCarbs + totalFats + totalProtein)) * 100) : 0}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="w-2.5 h-1.5 rounded-full border border-black bg-[#D9FF00] mb-0.5" />
              <span className="text-gray-600">PRO: {totalProtein > 0 ? Math.round((totalProtein / (totalCarbs + totalFats + totalProtein)) * 100) : 0}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* AI Photographic Snap & Log Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Camera Recognition Scanner */}
        <div className="lg:col-span-2 bg-white border-2 border-black rounded-3xl p-4 md:p-6 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9FF00]/10 rounded-bl-full pointer-events-none z-0" />
          
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-4 relative z-10">
            <div>
              <h3 className="text-lg font-black text-black flex items-center gap-1.5 uppercase">
                <Camera className="w-5 h-5 text-black" />
                Meal Scanner AI
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-semibold">
                Drag-and-drop or select any food image. Gemini analyzes metrics instantly with no cap accuracies!
              </p>
            </div>
            <span className="text-[10px] font-mono bg-black text-[#D9FF00] border border-black px-2.5 py-1 rounded-full shrink-0 font-black">
              POWERED BY GEMINI 2.5 FLASH
            </span>
          </div>

          {/* Drag and Drop Zone */}
          {!imagePreview ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerPicker}
              className={`border-4 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-[#D9FF00] bg-[#D9FF00]/10' 
                  : 'border-black hover:border-[#D9FF00] bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*;capture=camera"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="p-4 rounded-full bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-3">
                <Camera className="w-6 h-6 text-black" />
              </span>
              <p className="text-sm font-black text-black">
                Drop your food pic here, or <span className="text-black underline decoration-2 decoration-[#D9FF00]">browse</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-1 font-mono font-semibold">
                PNG, JPEG or HEIC. Camera captures fully supported.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center relative z-10">
              {/* Left Side: Photo preview & action buttons */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-black aspect-video md:aspect-square bg-gray-100 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <img 
                  src={imagePreview} 
                  alt="Meal Preview" 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay buttons */}
                {!analyzing && !analysisResult && (
                  <button 
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white hover:bg-red-100 border-2 border-black p-2 rounded-xl text-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>

              {/* Right Side: Analysis status / Results report */}
              <div className="space-y-4">
                {aiError && (
                  <div className="p-3.5 bg-red-50 border-2 border-black text-red-700 text-xs font-bold rounded-xl flex items-start gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{aiError}</span>
                  </div>
                )}

                {/* Initial scan button */}
                {!analyzing && !analysisResult && !aiError && (
                  <div className="space-y-3.5 text-center md:text-left">
                    <h4 className="text-xs uppercase font-mono text-black font-black">Image loaded successfully! 📸</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                      Wanna estimate calorie metrics using sport nutrition AI models? Click the scan button below.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={analyzeImage}
                        className="flex-1 bg-[#D9FF00] text-black border-2 border-black font-black hover:bg-[#C2E500] text-xs uppercase font-mono py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        Analyze Meal with AI 🧠
                      </button>
                      <button
                        onClick={clearImage}
                        className="bg-white border-2 border-black text-black hover:bg-gray-50 text-xs uppercase font-mono py-3 px-4 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* Analyzing Loader animation */}
                {analyzing && (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Loader2 className="w-8 h-8 text-black animate-spin" />
                    <div>
                      <p className="text-xs font-bold text-black font-mono uppercase tracking-wide">
                        {jokes[loadingTextIndex]}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1 font-sans font-semibold animate-pulse">
                        Reading composition metrics from food snapshot...
                      </p>
                    </div>
                  </div>
                )}

                {/* Analytical Response Display */}
                {analysisResult && (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border-2 border-black relative overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div className="absolute top-1 right-2">
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-black text-white bg-[#D43F8D] border border-black px-2 py-0.5 rounded uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">AI ANALYSIS COMPLETED</span>
                      <h4 className="text-base font-black text-black mt-1.5 flex items-center gap-1">
                        <Utensils className="w-4 h-4 text-black shrink-0" />
                        {analysisResult.foodName}
                      </h4>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="bg-white py-2 px-1 rounded border-2 border-black">
                        <div className="text-[8px] font-mono text-gray-500 uppercase">CAL</div>
                        <div className="text-xs font-mono font-black text-black">{analysisResult.calories}</div>
                      </div>
                      <div className="bg-[#D9FF00]/20 py-2 px-1 rounded border-2 border-black">
                        <div className="text-[8px] font-mono text-black font-black uppercase">PRO</div>
                        <div className="text-xs font-mono font-black text-black">{analysisResult.protein}g</div>
                      </div>
                      <div className="bg-white py-2 px-1 rounded border-2 border-black">
                        <div className="text-[8px] font-mono text-gray-500 uppercase">CARB</div>
                        <div className="text-xs font-mono font-black text-black">{analysisResult.carbs}g</div>
                      </div>
                      <div className="bg-white py-2 px-1 rounded border-2 border-black">
                        <div className="text-[8px] font-mono text-gray-500 uppercase">FAT</div>
                        <div className="text-xs font-mono font-black text-black">{analysisResult.fats}g</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-700 font-sans italic border-l-4 border-black pl-2 leading-relaxed">
                      "{analysisResult.analysisSummary}"
                    </div>

                    <div className="text-[10px] text-black p-2 bg-[#D9FF00]/10 border-2 border-black rounded-lg">
                      💯 <b>AI tip:</b> {analysisResult.satisfactionTip}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={addAiLoggedMeal}
                        className="flex-1 bg-black hover:bg-gray-900 text-white font-black text-xs uppercase py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Log to diary ⚡
                      </button>
                      <button
                        onClick={clearImage}
                        className="bg-white border-2 border-black text-gray-600 hover:text-black py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer font-extrabold"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}
                
                {aiError && (
                  <div className="text-center md:text-left">
                    <button 
                      onClick={clearImage}
                      className="bg-[#D9FF00] border-2 border-black text-black font-mono font-black text-xs py-2 px-4 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                    >
                      TRY AGAIN
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Log Presets Box */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 relative overflow-hidden flex flex-col shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-base font-black text-black mb-1 flex items-center gap-1.5 uppercase">
            <Plus className="w-5 h-5 text-black" />
            Quick Presets Log
          </h3>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed font-semibold">
            Wanna skip photo logic and inject typical gym macros instantly?
          </p>

          <div className="space-y-3 flex-1 scrollbar-none overflow-y-auto max-h-[190px]">
            {[
              { name: "Double Whey Shake 🥛", cal: 260, pro: 50, carb: 6, fat: 3 },
              { name: "Plump Chicken & Rice 🍚", cal: 520, pro: 42, carb: 55, fat: 8 },
              { name: "Triple Egg Egg White 🍳", cal: 210, pro: 24, carb: 2, fat: 12 },
              { name: "Cream of Rice Banana 🍌", cal: 380, pro: 6, carb: 80, fat: 2 },
              { name: "Tuna Bowl Avocado 🥑", cal: 410, pro: 35, carb: 10, fat: 22 },
            ].map((preset, index) => (
              <button
                key={index}
                onClick={() => addQuickLog(preset.name, preset.cal, preset.pro, preset.carb, preset.fat)}
                className="w-full bg-white hover:bg-gray-50 border-2 border-black rounded-2xl p-3 flex justify-between items-center transition-all cursor-pointer text-left shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                <div>
                  <div className="text-xs text-black font-black flex items-center gap-1.5">
                    {preset.name}
                  </div>
                  <div className="flex gap-2 text-[10px] text-gray-500 font-mono mt-0.5 font-bold">
                    <span>{preset.cal} kcal</span>
                    <span>•</span>
                    <span className="text-[#D43F8D]">{preset.pro}g PRO</span>
                  </div>
                </div>
                <span className="text-xs bg-[#D9FF00] border-2 border-black text-black px-2.5 py-1 rounded-xl transition-all font-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                  + LOG
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-black">
            <button
              onClick={() => setShowManualLog(!showManualLog)}
              className="w-full bg-white border-2 border-black text-black font-mono font-black text-xs py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:scale-[1.01] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              {showManualLog ? "Close Manual Editor ❌" : "Open Manual Form ✏️"}
            </button>
          </div>
        </div>

      </div>

      {/* Gym Vibe & Hydration Station HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hydration Station Card */}
        <div className="bg-white border-2 border-black rounded-3xl p-5 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#3B82F6]/5 rounded-bl-full pointer-events-none" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#3B82F6] font-extrabold mb-1 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 fill-[#3B82F6] text-[#3B82F6]" />
            Hydration Drip
          </h3>
          <p className="text-[11px] text-gray-500 font-semibold mb-3">
            Track your cellular water saturation. Stay wet standard!
          </p>

          <div className="text-center py-2.5 bg-[#3B82F6]/5 border-2 border-[#3B82F6] rounded-2xl mb-4 shadow-[2px_2px_0px_0px_#000]">
            <div className="text-2xl font-mono font-black text-black">{hydration * 250} ml</div>
            <div className="text-[10px] text-[#3B82F6] font-mono font-black uppercase mt-0.5">
              {hydration === 0 ? "Sahara Desert index 🏜️" :
               hydration <= 2 ? "Low Drip level 🐪" :
               hydration <= 5 ? "Normal hydration page 🧘" :
               hydration <= 7 ? "High vibe drip king 💦" : "Aquaman oceanic god 🔱🌊"}
            </div>
          </div>

          {/* Visual Cup droplets representation */}
          <div className="grid grid-cols-8 gap-1.5 mb-4">
            {Array.from({ length: 8 }).map((_, i) => {
              const active = i < hydration;
              return (
                <button
                  key={i}
                  onClick={() => updateHydration(active ? i : i + 1)}
                  className={`aspect-square rounded-lg border-2 border-black flex items-center justify-center transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:scale-105 cursor-pointer ${
                    active ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <Droplet className={`w-3 h-3 ${active ? 'fill-current' : ''}`} />
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateHydration(hydration + 1)}
              className="flex-1 bg-white hover:bg-gray-50 border-2 border-black text-black font-mono font-black text-[10px] py-1.5 rounded-lg active:scale-95 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              + Add Cup (+250ml)
            </button>
            <button
              onClick={() => updateHydration(hydration - 1)}
              className="bg-gray-100 hover:bg-gray-200 border-2 border-black text-gray-600 font-mono font-black text-[10px] px-2.5 py-1.5 rounded-lg active:scale-95 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              -
            </button>
          </div>
        </div>

        {/* Set Rest recovery Timer Card */}
        <div className="bg-white border-2 border-black rounded-3xl p-5 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-black/5 rounded-bl-full pointer-events-none" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-black font-extrabold mb-1 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5" />
            Lift Rest Timer
          </h3>
          <p className="text-[11px] text-gray-500 font-semibold mb-3">
            Optimize your hyper-trophy sets recursion interval.
          </p>

          {timeLeft !== null ? (
            <div className="space-y-3">
              <div className="text-center py-2 bg-black text-[#D9FF00] border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-ping">
                <div className="text-3xl font-mono font-black">{timeLeft}s</div>
                <div className="text-[9px] font-mono text-[#D9FF00]/70 font-bold uppercase tracking-wider">Resting between pump loops</div>
              </div>
              
              {/* Dynamic progress bar representing countdown */}
              <div className="w-full h-3 bg-gray-100 border border-black rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#D9FF00] transition-all duration-1000 border-r border-black animate-pulse" 
                  style={{ width: `${(timeLeft / timerMax) * 100}%` }} 
                />
              </div>

              <button
                onClick={stopRestTimer}
                className="w-full bg-[#D43F8D] hover:bg-[#b03072] text-white border-2 border-black font-mono font-black text-[10px] py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                Skip Rest Period ⚠️
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-center py-3.5 bg-gray-50 border-2 border-dashed border-black rounded-2xl font-mono text-[10px] text-gray-400 font-extrabold uppercase">
                Rest counter standby. Select interval:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[30, 45, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => startRestTimer(sec)}
                    className="bg-white hover:bg-[#D9FF00] border-2 border-black text-black font-mono font-black text-xs py-2 rounded-xl transition-all shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <div className="text-[9px] text-gray-400 font-mono italic text-center">
                Recommended rest for anabolic sets: 45s.
              </div>
            </div>
          )}
        </div>

        {/* Coach Chad Guru Mantra Advice Card */}
        <div className="bg-white border-2 border-black rounded-3xl p-5 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#D43F8D]/5 rounded-bl-full pointer-events-none" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#D43F8D] font-extrabold mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D43F8D]" />
            Aesthetic Vibe Check
          </h3>
          <p className="text-[11px] text-gray-500 font-semibold mb-3">
            Real coaching wisdom from the anabolic mindset model.
          </p>

          <div className="h-24 bg-gray-50 p-3 rounded-2xl border-2 border-black text-[11px] text-black font-semibold overflow-y-auto leading-relaxed flex items-center justify-center text-center italic relative mb-3 scrollbar-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            "{activeMantra}"
          </div>

          <button
            onClick={generateMantra}
            className="w-full bg-[#D9FF00] hover:bg-[#C2E500] text-black border-2 border-black font-mono font-black text-xs py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer tracking-wider"
          >
            ROTATE VIBE ORACLE ⚡
          </button>
        </div>

      </div>

      {/* Manual Meal logging form overlay */}
      {showManualLog && (
        <div className="p-5 bg-white border-4 border-black rounded-3xl relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-base font-black text-black mb-4 uppercase tracking-wide">Custom Manual Registry</h3>
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-black font-black uppercase mb-1">Meal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ribeye Steak"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full bg-white border-2 border-black text-black rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#D43F8D]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-black font-black uppercase mb-1">Calories (kcal)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-white border-2 border-black text-black rounded-xl p-2.5 text-xs font-mono font-semibold focus:outline-none focus:border-[#D43F8D]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-black font-black uppercase mb-1">Protein (g)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-white border-2 border-black text-black rounded-xl p-2.5 text-xs font-mono font-semibold focus:outline-none focus:border-[#D43F8D]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-black font-black uppercase mb-1">Carbs (g)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-white border-2 border-black text-black rounded-xl p-2.5 text-xs font-mono font-semibold focus:outline-none focus:border-[#D43F8D]"
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-mono text-black font-black uppercase mb-1">Fats (g)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={fats}
                  onChange={(e) => setFats(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-white border-2 border-black text-black rounded-xl p-2.5 text-xs font-mono font-semibold focus:outline-none focus:border-[#D43F8D]"
                />
              </div>
              <button
                type="submit"
                className="bg-[#D9FF00] hover:bg-[#C2E500] text-black font-black text-xs uppercase px-4 h-11 border-2 border-black rounded-xl flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                LOG 🚀
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daily Food Logged items list */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-black">
          <div>
            <h3 className="text-base font-black text-black flex items-center gap-1.5 uppercase">
              <Utensils className="w-4 h-4 text-black" />
              Today's Food Journal
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              History of meals logged during the today loop timeline.
            </p>
          </div>
          <span className="text-xs font-mono font-black bg-[#D9FF00] text-black border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {totalCalories} KCAL TOTAL
          </span>
        </div>

        {log.meals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-black rounded-2xl">
            <Utensils className="w-8 h-8 text-black mx-auto mb-2 animate-bounce" />
            <p className="text-xs text-black font-mono font-black uppercase tracking-wide">Journal is empty, bestie!</p>
            <p className="text-[11px] text-gray-600 font-sans max-w-xs mx-auto mt-0.5 leading-relaxed font-semibold">
              Snap a meal or log preset proteins to visualize composition indexes on visual gauges.
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-black max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {log.meals.map((meal) => (
              <div key={meal.id} className="py-3.5 flex justify-between items-center group first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {meal.imageUrl ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-black shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <img src={meal.imageUrl} alt="food" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <Utensils className="w-4 h-4 text-black" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-black text-black uppercase tracking-wide flex items-center gap-1.5">
                      {meal.foodName}
                      {meal.imageUrl && (
                        <span className="text-[8px] bg-[#D43F8D] text-white border border-black px-1.5 py-0.5 rounded uppercase font-black">AI SNAP</span>
                      )}
                    </h4>
                    <div className="flex gap-2.5 text-[10px] text-gray-600 font-mono mt-1 font-bold">
                      <span>{meal.calories} kcal</span>
                      <span>•</span>
                      <span className="text-[#D43F8D] font-black">P: {meal.protein}g</span>
                      <span>•</span>
                      <span>C: {meal.carbs}g</span>
                      <span>•</span>
                      <span>F: {meal.fats}g</span>
                      <span>•</span>
                      <span className="text-gray-400 font-normal">{meal.loggedAt}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMeal(meal.id)}
                  className="p-2 text-black hover:bg-red-50 hover:text-red-600 border-2 border-transparent hover:border-black rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
