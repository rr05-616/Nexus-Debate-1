import React from 'react';
import { Bot, Copy, Clock } from 'lucide-react';

interface ModelCardProps {
  name: string;
  response: string;
  delay?: number; // For animation stagger
  timing?: number; // Execution time in ms
}

export const ModelCard: React.FC<ModelCardProps> = ({ name, response, delay = 0, timing }) => {
  // Format timing to seconds with 2 decimals
  const formattedTime = timing ? `${(timing / 1000).toFixed(2)}s` : '--';

  return (
    <div 
      className="bg-nexus-card rounded-xl p-5 border border-nexus-primary/20 flex flex-col h-full transform transition-all duration-500 hover:border-nexus-primary/50 hover:shadow-lg hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-nexus-primary/20 rounded-lg">
            <Bot className="w-5 h-5 text-nexus-text" />
          </div>
          <h3 className="font-bold text-nexus-text tracking-wide">{name}</h3>
        </div>
        <div className="flex items-center gap-2">
           {timing && (
             <div className="flex items-center gap-1 px-2 py-1 bg-nexus-bg rounded text-xs text-nexus-accent font-mono" title="Generation Time">
               <Clock className="w-3 h-3" />
               {formattedTime}
             </div>
           )}
           <div className="px-2 py-1 bg-nexus-bg rounded text-xs text-nexus-accent font-mono">
             200 OK
           </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        <p className="text-sm text-nexus-text/80 leading-relaxed whitespace-pre-wrap">
          {response}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
         <button 
           onClick={() => navigator.clipboard.writeText(response)}
           className="text-nexus-accent hover:text-nexus-text transition-colors p-1"
           title="Copy Response"
         >
           <Copy className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
};