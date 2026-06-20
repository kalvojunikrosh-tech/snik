import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  Lock,
  Compass,
  DollarSign,
  Palette,
  Layers,
  Brain,
  Cpu,
  Activity,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../api.ts';
import { Product } from '../types.ts';

interface AiRecommenderProps {
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  wishlistItems: any[];
  onToggleWishlist: (product: Product) => void;
}

const PRESET_ACTIVITIES = [
  'Cyberspace Exploration',
  'Underground Rave & Dance',
  'Cyber Combat & Combat Training',
  'Zero-Gravity Sports',
  'Stealth Missions & Urban Hacking',
  'Minimalist City Walking',
  'Metaverse Business Lounge Meeting',
];

const PRESET_COLORS = [
  'All',
  'Glow Accent',
  'White',
  'Black',
  'Orange',
  'Cyan',
  'Gold',
  'Silver',
];

export default function AiRecommender({
  onViewProduct,
  onAddToCart,
  wishlistItems,
  onToggleWishlist,
}: AiRecommenderProps) {
  // Input selections
  const [budget, setBudget] = useState<'under-1000' | '1000-2000' | 'over-2000'>('1000-2000');
  const [brand, setBrand] = useState<string>('All');
  const [shoeType, setShoeType] = useState<string>('All');
  const [color, setColor] = useState<string>('All');
  const [activity, setActivity] = useState<string>('Metaverse Business Lounge Meeting');

  // Loading and result states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generalOverview, setGeneralOverview] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // loading steps cycle simulation
  const loadingMessages = [
    'Deploying neural recommendation agents...',
    'Querying high-fidelity inventory indices...',
    'Analyzing brand DNA and category metrics...',
    'Matching budget limits against market indexes...',
    'Scoring activity compatibility indices...',
    'Synthesizing bespoke stylist briefs with Gemini intelligence...',
    'Polishing interactive holographic renders...',
  ];

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    setLoadingStep(0);
    setError(null);
    setGeneralOverview(null);
    setRecommendations(null);

    // Increment loading text index periodically
    const timer = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await api.recommendations.get({
        budget,
        brand,
        shoeType,
        color,
        activity,
      });

      setGeneralOverview(response.generalOverview);
      setRecommendations(response.recommendations);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'The AI stylist neural bridge timed out. Try again!');
    } finally {
      clearInterval(timer);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12" id="ai-sneaker-recommender">
      
      {/* Title Header Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-zinc-950/40 border border-white/5 p-8 sm:p-12 luxury-glass">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-96 h-96 rounded-full bg-[#00E5FF]/5 blur-3xl -z-10" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00E5FF] font-mono text-[10px] font-bold uppercase tracking-widest">
              <Brain className="w-3.5 h-3.5 fill-current" />
              Gemini AI Stylist engine
            </span>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tight leading-[1.1] luxury-text-gradient">
              AI Sneaker <br className="hidden sm:inline" /> Recommender
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed font-sans">
              Match your budget, brand parameters, colorway goals, and scheduled micro-activities. Our active design intelligence scans Sneakerverse index pools to construct responsive curated recommendations.
            </p>
          </div>
          <div className="flex gap-4 shrink-0 font-mono text-xs">
            <div className="px-5 py-4 bg-black/45 rounded-2xl border border-white/5 flex flex-col justify-center">
              <span className="text-zinc-500 text-[8px] uppercase tracking-widest">STYLING_STREAMS</span>
              <span className="text-[#00E5FF] font-black tracking-tight mt-1 text-sm">ACTIVE</span>
            </div>
            <div className="px-5 py-4 bg-black/45 rounded-2xl border border-white/5 flex flex-col justify-center">
              <span className="text-zinc-500 text-[8px] uppercase tracking-widest">DECISION_LOGIC</span>
              <span className="text-amber-400 font-black tracking-tight mt-1 text-sm">GEMINI_1.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommender Form and Results Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input Sidebar Panel */}
        <div className="lg:col-span-4 bg-zinc-950/45 border border-white/5 rounded-[28px] p-6 sm:p-8 space-y-8 luxury-glass">
          <h3 className="font-display font-medium text-xs text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
            <Cpu className="w-4 h-4 text-[#00E5FF]" />
            PARAMETER MATRIX
          </h3>

          <div className="space-y-6">
            
            {/* 1. BUDGET PARADIGM */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 flex items-center gap-2 font-display">
                <DollarSign className="w-3.5 h-3.5 text-[#00E5FF]" />
                VALUE BRACKET
              </label>
              <div className="grid grid-cols-1 gap-1.5 font-mono text-xs">
                <button
                  onClick={() => setBudget('under-1000')}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    budget === 'under-1000'
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <span>Under 1,000 CR</span>
                  <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full ${budget === 'under-1000' ? 'bg-black/10 text-black font-bold' : 'bg-white/5 text-zinc-500'}`}>Tier 1</span>
                </button>
                <button
                  onClick={() => setBudget('1000-2000')}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    budget === '1000-2000'
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <span>1,000 - 2,000 CR</span>
                  <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full ${budget === '1000-2000' ? 'bg-black/10 text-black font-bold' : 'bg-white/5 text-zinc-500'}`}>Tier 2</span>
                </button>
                <button
                  onClick={() => setBudget('over-2000')}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                    budget === 'over-2000'
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <span>Over 2,000 CR</span>
                  <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full ${budget === 'over-2000' ? 'bg-black/10 text-black font-bold' : 'bg-white/5 text-zinc-500'}`}>Tier 3</span>
                </button>
              </div>
            </div>

            {/* 2. BRAND CHOICE */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 flex items-center gap-2 font-display">
                <Award className="w-3.5 h-3.5 text-[#00E5FF]" />
                CORPORATE BRAND
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-black/40 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none transition-all font-display font-semibold uppercase"
              >
                <option value="All">All Tech-Corporates</option>
                <option value="AETHERLABS">AETHERLABS</option>
                <option value="CHRONO">CHRONO</option>
                <option value="EXO_ARMOR">EXO ARMOR</option>
              </select>
            </div>

            {/* 3. SHOE TYPE / CATEGORY */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 flex items-center gap-2 font-display">
                <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                SHOES OVERLAY CLASS
              </label>
              <select
                value={shoeType}
                onChange={(e) => setShoeType(e.target.value)}
                className="w-full bg-black/40 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none transition-all font-display font-semibold uppercase"
              >
                <option value="All">All Space Silhouettes</option>
                <option value="cyber-neon">Cyber Neon Series</option>
                <option value="chrono-minimalist">Chrono Woven Series</option>
                <option value="exo-brutalist">Exo Brutalist Series</option>
              </select>
            </div>

            {/* 4. DESIGN COLOR PALETTE */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A1A1AA] flex items-center gap-2 font-display">
                <Palette className="w-3.5 h-3.5 text-[#00E5FF]" />
                OUTER VISUAL BASE
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((colName) => (
                  <button
                    key={colName}
                    type="button"
                    onClick={() => setColor(colName)}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-semibold tracking-wide transition-all ${
                      color === colName
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-black/40 border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
                    }`}
                  >
                    {colName}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. USER CORE ACTIVITY */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#A1A1AA] flex items-center gap-2 font-display">
                <Activity className="w-3.5 h-3.5 text-[#00E5FF]" />
                INTEGRATED SCENARIO
              </label>
              
              <div className="flex flex-wrap gap-1 pb-1">
                {PRESET_ACTIVITIES.map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setActivity(act)}
                    className={`text-[9px] text-left px-3 py-1.5 rounded-full border transition-all max-w-full font-sans truncate ${
                      activity === act
                        ? 'bg-[#7C3AED]/20 text-white border-[#7C3AED]/40 font-semibold'
                        : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
                    }`}
                    title={act}
                  >
                    {act}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <textarea
                placeholder="Or script custom style behavior..."
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full min-h-[85px] bg-black/40 border border-white/5 hover:border-white/10 focus:border-[#00E5FF]/40 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none transition-all leading-relaxed font-sans"
              />
            </div>

            {/* Action launcher */}
            <button
              id="ai-generate-button"
              disabled={isLoading || !activity.trim()}
              onClick={handleGenerateRecommendations}
              className="w-full mt-2 py-4 bg-white hover:bg-zinc-200 text-black font-display font-bold tracking-[0.05em] text-xs uppercase rounded-full shadow-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black fill-current animate-pulse" />
              GENERATE STYLIST BRIEF
            </button>

          </div>
        </div>

        {/* Right Recommended Results Panel */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Default Start State */}
          {!isLoading && !recommendations && !error && (
            <div className="bg-zinc-950/20 rounded-[32px] border border-white/5 p-12 sm:p-20 text-center space-y-6 luxury-glass">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center mx-auto shadow-md">
                <Brain className="w-7 h-7 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-3">
                <h4 className="font-display font-medium text-lg text-white uppercase tracking-wider">
                  DESIGN MATRIX STANDBY
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans">
                  Configure your active parameter values, design classes, and meta-scenarios in the configuration panel, then initiate briefing generation to curating luxury assets.
                </p>
              </div>

              <div className="inline-flex flex-wrap justify-center gap-3 text-xs font-mono text-zinc-500">
                <span className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                  KNOWLEDGE_MATRIX: SECURE
                </span>
                <span className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
                  GEMINI_SYSTEMS: INSTALLED
                </span>
              </div>
            </div>
          )}

          {/* Loading States */}
          {isLoading && (
            <div className="bg-zinc-950/30 rounded-[32px] border border-white/5 p-12 sm:p-20 text-center space-y-8 luxury-glass">
              <div className="relative w-20 h-20 mx-auto">
                {/* Double spinners */}
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#00E5FF] animate-spin" />
                <div className="absolute inset-2 rounded-full border-[3px] border-transparent border-t-[#7C3AED] animate-spin [animation-duration:1.5s]" />
                <div className="absolute inset-4 rounded-full bg-black border border-white/15 flex items-center justify-center text-white">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <span className="inline-block text-[9px] font-mono tracking-widest text-[#00E5FF] uppercase py-1 px-3 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full">
                  STREAMING DESIGN MATRIX
                </span>
                <h4 className="font-display font-medium text-white uppercase text-sm tracking-widest h-6">
                  {loadingMessages[loadingStep]}
                </h4>
              </div>

              {/* Progress Bar indicator */}
              <div className="w-full max-w-xs mx-auto h-[3px] bg-black/80 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#00E5FF] to-[#7C3AED] transition-all duration-1000"
                  style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[24px] p-8 text-center space-y-4">
              <span className="text-[9px] text-red-400 font-mono uppercase bg-red-500/15 px-3 py-1.5 rounded-full border border-red-500/20 inline-block font-bold">
                NEURAL_LINK_FAULT
              </span>
              <p className="text-sm text-red-200">{error}</p>
              <button
                onClick={handleGenerateRecommendations}
                className="px-6 py-2.5 bg-red-500 text-black font-bold uppercase text-xs tracking-wider rounded-full hover:bg-red-400 transition"
              >
                Retry Request
              </button>
            </div>
          )}

          {/* Successful Recommendations Brief View */}
          {!isLoading && recommendations && (
            <div className="space-y-10 animate-fade-in">
              
              {/* Personal Stylist Brief intro section */}
              {generalOverview && (
                <div className="bg-zinc-950/45 border border-white/5 rounded-[32px] p-8 relative overflow-hidden luxury-glass">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00E5FF]" />
                  <div className="space-y-4 flex flex-col sm:flex-row gap-6 items-start relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-display font-medium text-zinc-400 uppercase text-[10px] tracking-widest leading-none">
                        AI STYLIST OVERVIEW BRIEFING
                      </h4>
                      <p className="text-white text-xs sm:text-sm leading-relaxed pr-4 font-sans font-medium">
                        "{generalOverview}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of recommended items */}
              <div className="space-y-6">
                <h3 className="font-display font-medium text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
                  <Award className="w-4 h-4 text-amber-400" />
                  CURATED MATCHES
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {recommendations.map((rec: any, idx: number) => {
                    const product = rec.product;
                    const isFavorited = wishlistItems?.some((w) => w.productId === product.id);

                    return (
                      <div
                        key={product.id}
                        className="bg-zinc-950/45 border border-white/5 rounded-[24px] overflow-hidden shadow-2xl hover:border-zinc-700/50 transition-all duration-500 flex flex-col justify-between group relative"
                      >
                        {/* Rating order medallion */}
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white text-black text-[8px] font-mono font-bold uppercase tracking-widest rounded-full flex items-center gap-1 shadow">
                          <Sparkles className="w-2.5 h-2.5 fill-current" />
                          Curated #{idx + 1}
                        </div>

                        {/* Recommendation Match Rating Score gauge on top-right */}
                        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md font-mono font-bold text-[9px] text-[#00E5FF]">
                          {rec.score}% MATCH
                        </div>

                        {/* Image Showcase */}
                        <div 
                          onClick={() => onViewProduct(product)}
                          className="aspect-[4/3] w-full bg-[#080808] overflow-hidden cursor-pointer relative flex items-center justify-center p-6 border-b border-white/5"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-[85%] h-auto object-contain transition duration-750 ease-out group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Core Details and AI commentary */}
                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            
                            {/* Title & Brand */}
                            <div className="space-y-1.5">
                              <span className="block font-mono text-[9px] font-bold tracking-widest text-[#00E5FF] uppercase">
                                {product.brand} | {product.category?.name}
                              </span>
                              <h4 
                                onClick={() => onViewProduct(product)}
                                className="font-display font-medium text-base leading-tight text-white uppercase tracking-tight cursor-pointer hover:text-[#00E5FF]"
                              >
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                <span className="font-bold text-white">{product.price.toLocaleString()} CR</span>
                                <span className="text-zinc-500 text-[9px]">(RETAIL {product.retailPrice.toLocaleString()} CR)</span>
                              </div>
                            </div>

                            {/* Bespoke AI explanation block */}
                            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-1.5">
                              <span className="block text-[8px] font-mono tracking-widest text-[#00E5FF] uppercase font-bold">
                                Stylist Insight
                              </span>
                              <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
                                "{rec.insight || `Ideal match for your budget, colorway choices, and performance scenario.`}"
                              </p>
                            </div>

                            {/* Bespoke AI Styling coordinates */}
                            {rec.stylingTip && (
                              <div className="space-y-1.5">
                                <span className="block text-[8px] font-mono tracking-widest text-[#7C3AED] uppercase font-bold">
                                  STYLING COORDINATES
                                </span>
                                <p className="text-[11px] text-zinc-400 leading-relaxed pl-2.5 border-l border-[#7C3AED] font-sans font-medium">
                                  {rec.stylingTip}
                                </p>
                              </div>
                            )}

                          </div>

                          {/* Action Items */}
                          <div className="pt-4 border-t border-white/5 flex gap-2 pt-4">
                            <button
                              onClick={() => onViewProduct(product)}
                              className="flex-1 py-3 bg-black/40 hover:bg-white/5 border border-white/5 text-zinc-300 rounded-full text-[10px] font-bold font-display uppercase tracking-wider transition-all"
                            >
                              Spec details
                            </button>
                            <button
                              id={`ai-recommender-cart-${product.id}`}
                              onClick={() => onAddToCart(product, product.sizes.split(',')[0] || '10')}
                              className="flex-1 py-3 bg-white hover:bg-zinc-200 text-black rounded-full text-[10px] font-bold tracking-wider font-display uppercase transition-all flex items-center justify-center gap-1.5"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 fill-current" />
                              Acquire
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
