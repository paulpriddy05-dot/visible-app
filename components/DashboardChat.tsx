'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';

export default function DashboardChat({ contextData }: { contextData: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 1. Grab 'isLoading' and 'error' to debug silent failures
  const { messages, append, isLoading, error } = useChat({
    api: '/api/chat',
    body: { context: contextData },
    onError: (err) => {
      console.error("Chat API Error:", err);
    }
  });

  const handleSend = async () => {
    if (!localInput.trim()) return;
    const content = localInput;
    setLocalInput(''); // Clear UI
    
    try {
      await append({ role: 'user', content });
    } catch (e) {
      console.error("Failed to send:", e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all hover:scale-105 border-4 border-white"
      >
        {isOpen ? <i className="fas fa-times text-xl"></i> : <i className="fas fa-sparkles text-xl"></i>}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          <div className="bg-slate-900 text-white p-4 flex items-center gap-3 shrink-0">
             <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xs">AI</div>
             <div>
                <h4 className="font-bold text-sm">Visible Assistant</h4>
                <p className="text-[10px] text-slate-300">Powered by Gemini</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scroll">
            
            {/* ERROR DISPLAY: This will tell us what's wrong */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
                <strong>Error:</strong> {error.message || "Check your API Key"}
              </div>
            )}

            {messages.length === 0 && !error && (
                <div className="text-center text-slate-400 text-sm mt-10 px-6">
                    <p>I've read your dashboard data.</p>
                    <p className="mt-2 text-xs opacity-75">Ask me anything!</p>
                </div>
            )}
            
            {messages.map((m, index) => (
              <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {/* LOADING SPINNER */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 px-4 py-2 rounded-2xl rounded-bl-none text-xs flex items-center gap-2 shadow-sm border border-slate-200">
                  <i className="fas fa-circle-notch fa-spin"></i> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
            <input
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder:text-slate-400"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={isLoading} 
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-indigo-600 text-white h-9 w-9 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <i className="fas fa-paper-plane text-xs"></i>
            </button>
          </div>

        </div>
      )}
    </>
  );
}