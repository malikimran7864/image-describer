
import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { analyzeImage, generateStoryboard } from './services/gemini';
import { AppState, Shot } from './types';
import { 
  Upload, Film, Camera, Move, Music, Info, AlertCircle, 
  Loader2, Copy, Grid, CheckCircle2, Zap, Download 
} from 'lucide-react';

const App = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    result: null,
    storyboardImageUrl: null,
    isLoading: false,
    isGeneratingStoryboard: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({ 
          ...prev, 
          image: event.target?.result as string, 
          result: null, 
          storyboardImageUrl: null,
          error: null 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!state.image) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, result: null, storyboardImageUrl: null }));
    try {
      const result = await analyzeImage(state.image);
      setState(prev => ({ ...prev, result, isLoading: false }));
      
      // Automatically trigger storyboard generation after analysis
      generateStoryboardVisual(result);
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    }
  };

  const generateStoryboardVisual = async (resultData = state.result) => {
    if (!resultData) return;
    setState(prev => ({ ...prev, isGeneratingStoryboard: true }));
    try {
      const imageUrl = await generateStoryboard(resultData);
      setState(prev => ({ ...prev, storyboardImageUrl: imageUrl, isGeneratingStoryboard: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isGeneratingStoryboard: false }));
      console.error("Storyboard generation failed", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2 flex items-center justify-center gap-4">
          <Film className="w-10 h-10 md:w-16 md:h-16 text-red-600" />
          IMAGE DESCRIBER
        </h1>
        <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">
          AI Video Director & Storyboard Engineer
        </p>
      </header>

      <main className="space-y-12 pb-20">
        {/* Upload Section */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full md:w-1/3 aspect-square bg-zinc-950 border-2 border-dashed border-zinc-700 hover:border-red-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative"
            >
              {state.image ? (
                <img src={state.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" alt="Upload preview" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-zinc-500 group-hover:text-red-500">
                  <Upload className="w-12 h-12" />
                  <span className="font-bold uppercase tracking-wider text-xs">Drop Image or Click</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div>
                <h2 className="text-2xl font-bold mb-2">Cinematic Source</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Upload a reference image to expand it into a 9-shot cinematic sequence. The AI will analyze textures, geometry, and lighting to ensure perfect continuity.
                </p>
              </div>

              <button 
                onClick={runAnalysis}
                disabled={!state.image || state.isLoading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-900/20"
              >
                {state.isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Frame...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Begin Directed Analysis
                  </>
                )}
              </button>

              {state.error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-500 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{state.error}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {state.result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
            
            {/* Phase 1: Visual Anchor */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">PHASE 1</span>
                <h2 className="text-xl font-black uppercase tracking-tighter">The Visual Anchor</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4 text-red-500">
                    <Info className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Subject Details</h3>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{state.result.visualAnchor.subject}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4 text-blue-500">
                    <Move className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Spatial Geometry</h3>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{state.result.visualAnchor.geometry}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4 text-orange-500">
                    <div className="w-5 h-5 bg-gradient-to-tr from-orange-600 to-yellow-400 rounded-full" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Lighting & Grade</h3>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{state.result.visualAnchor.lighting}</p>
                </div>
              </div>
            </div>

            {/* Narrative Header */}
            <div className="border-l-4 border-red-600 pl-6 space-y-2 py-2">
              <div className="flex gap-2 mb-2">
                {state.result.narrativeArc.mood.map(m => (
                  <span key={m} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded">
                    {m}
                  </span>
                ))}
              </div>
              <h2 className="text-3xl font-black italic tracking-tight">{state.result.narrativeArc.logline}</h2>
            </div>

            {/* Shot List Grid */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">PHASE 2</span>
                <h2 className="text-xl font-black uppercase tracking-tighter">The Shot List (Execution Data)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.result.shotList.map((shot: Shot) => (
                  <div key={shot.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group hover:border-zinc-600 transition-colors">
                    <div className="p-4 bg-zinc-950 flex justify-between items-center border-b border-zinc-800">
                      <span className="font-black text-xs text-red-600 tracking-tighter">SHOT {shot.id}</span>
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">{shot.type} • {shot.duration}</span>
                    </div>
                    <div className="p-5 flex-1 space-y-5">
                      <p className="text-sm text-zinc-300 leading-snug">{shot.description}</p>
                      
                      <div className="space-y-4">
                        <div className="relative group/prompt">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-600 flex items-center gap-1">
                              <Camera className="w-3 h-3" /> Image Prompt
                            </label>
                            <button 
                              onClick={() => copyToClipboard(shot.imagePrompt)}
                              className="text-zinc-600 hover:text-white transition-colors p-1"
                              title="Copy Prompt"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-lg text-[11px] font-mono text-zinc-500 border border-zinc-800 line-clamp-2 hover:line-clamp-none transition-all">
                            {shot.imagePrompt}
                          </div>
                        </div>

                        <div className="relative group/prompt">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-600 flex items-center gap-1">
                              <Move className="w-3 h-3" /> Motion Prompt
                            </label>
                            <button 
                              onClick={() => copyToClipboard(shot.motionPrompt)}
                              className="text-zinc-600 hover:text-white transition-colors p-1"
                              title="Copy Prompt"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-lg text-[11px] font-mono text-zinc-500 border border-zinc-800">
                            {shot.motionPrompt}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-500">
                          <Music className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{shot.soundDesign}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consistency Check */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl flex gap-4 items-start">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest mb-2">Consistency Protocol</h3>
                <p className="text-zinc-400 text-sm italic">{state.result.consistencyCheck}</p>
              </div>
            </div>

            {/* Storyboard Image Section */}
            <div className="pt-8 border-t border-zinc-800">
               <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">PHASE 3</span>
                  <h2 className="text-xl font-black uppercase tracking-tighter">The Visual Storyboard Grid</h2>
                </div>
                {state.storyboardImageUrl && (
                   <a 
                    href={state.storyboardImageUrl} 
                    download="storyboard.png"
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download 3x3 Grid
                  </a>
                )}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden aspect-square md:aspect-video relative flex items-center justify-center">
                {state.isGeneratingStoryboard ? (
                  <div className="flex flex-col items-center gap-4 text-zinc-500">
                    <Loader2 className="w-12 h-12 animate-spin text-red-600" />
                    <div className="text-center">
                      <p className="font-black uppercase tracking-widest text-sm">Rendering 3x3 Grid</p>
                      <p className="text-xs text-zinc-600 mt-1">Applying visual anchor consistency...</p>
                    </div>
                  </div>
                ) : state.storyboardImageUrl ? (
                  <img src={state.storyboardImageUrl} className="w-full h-full object-contain" alt="3x3 Storyboard" />
                ) : (
                  <button 
                    onClick={() => generateStoryboardVisual()}
                    className="flex flex-col items-center gap-3 text-zinc-700 hover:text-red-500 transition-colors"
                  >
                    <Grid className="w-16 h-16" />
                    <span className="font-black uppercase tracking-widest text-xs">Generate Cinematic Grid</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 text-center border-t border-zinc-900 mt-20">
        <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">
          Powered by Gemini Vision & Nano Banana • Cinematic Sequence Engine v1.0
        </p>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
