import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Send, Activity, BrainCircuit, Sparkles, Terminal, Timer, Zap } from 'lucide-react';
import { fetchDebateResult } from './services/debateService';
import { DebateResponse, DebateStatus } from './types';
import { ModelCard } from './components/ModelCard';
import { AnalysisCharts } from './components/AnalysisCharts';

const App: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<DebateStatus>(DebateStatus.IDLE);
  const [data, setData] = useState<DebateResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setStatus(DebateStatus.LOADING);
    setData(null);

    try {
      const result = await fetchDebateResult(question);
      setData(result);
      setStatus(DebateStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(DebateStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-nexus-bg text-nexus-text selection:bg-nexus-primary selection:text-white pb-20">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-nexus-bg/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-nexus-primary to-nexus-card p-2 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">NEXUS <span className="text-nexus-accent font-light">DEBATE</span></h1>
              <p className="text-[10px] text-nexus-accent uppercase tracking-widest">Multi-Agent Consensus Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-xs text-nexus-accent">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> System Online</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-nexus-primary"></div> v2.1.0</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Input Section */}
        <section className="mb-12 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Ask the Collective Intelligence</h2>
            <p className="text-nexus-accent">Simulate a debate between OpenAI, Claude, and Gemini to find the optimal truth.</p>
          </div>

          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-nexus-primary to-nexus-accent rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative flex items-center bg-nexus-card rounded-xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="pl-4">
                <Terminal className="w-5 h-5 text-nexus-accent" />
              </div>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: What is the most efficient way to scale a Node.js microservice?"
                className="w-full bg-transparent border-none py-4 px-4 text-white placeholder-nexus-accent/50 focus:ring-0 focus:outline-none text-lg"
                disabled={status === DebateStatus.LOADING}
              />
              <button
                type="submit"
                disabled={status === DebateStatus.LOADING || !question.trim()}
                className={`p-4 m-1 rounded-lg transition-all duration-300 ${
                  status === DebateStatus.LOADING 
                    ? 'bg-nexus-bg text-nexus-accent cursor-not-allowed' 
                    : 'bg-nexus-primary text-white hover:bg-[#1a5f7a] shadow-lg'
                }`}
              >
                {status === DebateStatus.LOADING ? (
                  <Activity className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Loading State Visualization */}
        {status === DebateStatus.LOADING && (
           <div className="flex flex-col items-center justify-center py-20 space-y-6">
             <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-4 border-nexus-card rounded-full"></div>
               <div className="absolute inset-0 border-4 border-nexus-primary rounded-full border-t-transparent animate-spin"></div>
               <div className="absolute inset-4 border-4 border-nexus-accent/30 rounded-full border-b-transparent animate-spin-reverse"></div>
             </div>
             <p className="text-nexus-accent animate-pulse font-mono">Synthesizing Neural Pathways...</p>
           </div>
        )}

        {/* Results Section */}
        {status === DebateStatus.SUCCESS && data && (
          <div className="space-y-12 animate-fade-in">
            
            {/* The Final Verdict (Judge) */}
            <div className="relative bg-gradient-to-b from-nexus-card to-nexus-bg rounded-2xl p-8 border border-nexus-primary/30 shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-32 h-32 text-white" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-nexus-primary text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      Consensus Reached
                    </div>
                    <div className="h-px bg-white/10 w-12 hidden sm:block"></div>
                  </div>
                  
                  {/* Consensus Timing Metrics */}
                  <div className="flex items-center gap-4 text-xs font-mono text-nexus-accent">
                    <div className="flex items-center gap-1" title="Time taken to synthesize answers">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span>Synthesis: {(data.timings.consensus / 1000).toFixed(2)}s</span>
                    </div>
                    <div className="flex items-center gap-1" title="Total round trip time">
                        <Timer className="w-3 h-3" />
                        <span>Total: {(data.timings.total / 1000).toFixed(2)}s</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">Final Synthesis</h3>
                <div className="prose prose-invert max-w-none prose-p:text-nexus-text/90 prose-strong:text-white prose-li:text-nexus-text/90">
                   <p className="whitespace-pre-wrap text-lg leading-relaxed">{data.finalAnswer}</p>
                </div>
              </div>
            </div>

            {/* Individual Model Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ModelCard 
                name="OpenAI GPT-4o" 
                response={data.models.openai} 
                delay={0} 
                timing={data.timings.openai}
              />
              <ModelCard 
                name="Anthropic Claude 3.5" 
                response={data.models.claude} 
                delay={100} 
                timing={data.timings.claude}
              />
              <ModelCard 
                name="Google Gemini 1.5" 
                response={data.models.gemini} 
                delay={200} 
                timing={data.timings.gemini}
              />
            </div>

            {/* Analytics Dashboard */}
            <div className="border-t border-white/5 pt-8">
               <div className="flex items-center gap-3 mb-2">
                 <Activity className="w-5 h-5 text-nexus-primary" />
                 <h2 className="text-xl font-bold text-white">Response Telemetry</h2>
               </div>
               <p className="text-sm text-nexus-accent mb-6">Real-time analysis of model reasoning depth, factuality, and consensus contribution.</p>
               <AnalysisCharts data={data} />
            </div>

          </div>
        )}

        {status === DebateStatus.ERROR && (
           <div className="text-center py-20 bg-red-900/10 rounded-xl border border-red-500/20">
             <h3 className="text-xl text-red-400 font-bold mb-2">Connection Failure</h3>
             <p className="text-nexus-accent">Unable to establish a connection with the neural consensus grid.</p>
             <button 
                onClick={() => setStatus(DebateStatus.IDLE)}
                className="mt-6 text-sm text-white bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded transition"
             >
               Reset Connection
             </button>
           </div>
        )}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);