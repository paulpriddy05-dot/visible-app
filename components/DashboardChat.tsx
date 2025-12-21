'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';

export default function DashboardChat({ contextData }: { contextData: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, setInput, append, handleInputChange } = useChat({
    api: '/api/chat',
    body: { context: contextData },
  });

  // ⚡️ MAIN SEND FUNCTION
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput(''); // Clear input immediately
    
    await append({
      role: 'user',
      content: userMessage,
    });
  };

  // ⌨️ KEYBOARD LISTENER
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Stop default form behavior
      handleSend();       // Fire the send function
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all hover:scale-105 border-4 border-white"
        title="Ask AI about your dashboard"
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
            {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-10 px-6">
                    <div className="bg-slate-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-magic text-indigo-400 text-lg"></i>
                    </div>
                    <p>I've read your dashboard data.</p>
                    <p className="mt-2 text-xs opacity-75">Try asking: <br/>"What is the schedule for next week?" or "Do we have any missions trips planned?"</p>
                </div>
            )}
            
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 🟢 UPDATED: No <form> tag, just a div with onKeyDown */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
            <input
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 placeholder:text-slate-400"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}  // 👈 THIS IS THE FIX
              placeholder="Ask a question..."
            />
            <button 
              onClick={handleSend} 
              className="bg-indigo-600 text-white h-9 w-9 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <i className="fas fa-paper-plane text-xs"></i>
            </button>
          </div>

        </div>
      )}
    </>
  );
}