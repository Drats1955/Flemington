import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertTriangle, Info, Loader2, ChevronDown, ShieldAlert, Activity, MapPin, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { chatWithAssistant } from "./services/geminiService";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "System initialized. Flemington Signal Box Station HazMat Assistant active. Ready for query.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));
      
      const response = await chatWithAssistant(userMessage, history);
      setMessages((prev) => [...prev, { role: "model", content: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "An error occurred while communicating with the assistant. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-dark text-ink font-sans flex flex-col selection:bg-safety-yellow selection:text-black">
      {/* Top Safety Stripe */}
      <div className="h-2 safety-stripes w-full" />

      {/* Header */}
      <header className="border-b border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-safety-yellow rounded-lg text-black shadow-[0_4px_10px_rgba(250,204,21,0.2)]">
            <ShieldAlert size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-1.5 py-0.5 bg-safety-red text-[10px] font-bold uppercase rounded text-white animate-pulse">Live Data</span>
              <h1 className="text-[10px] uppercase tracking-[0.2em] font-mono text-slate-500 font-bold">Sydney Trains Asset 445</h1>
            </div>
            <h2 className="text-xl font-display font-extrabold tracking-tight text-ink">Flemington HazMat Assistant</h2>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">Last Inspection</span>
            <span className="text-sm font-mono font-bold text-ink">18 FEB 2021</span>
          </div>
          <div className="h-10 w-[1px] bg-slate-200 hidden sm:block" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">Status</span>
            <span className="text-sm font-mono font-bold text-safety-orange flex items-center gap-1.5">
              <Activity size={14} className="animate-pulse" />
              ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full p-4 gap-4 overflow-hidden">
        
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col glass-panel rounded-xl overflow-hidden relative">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`flex-shrink-0 h-10 w-10 rounded-lg border flex items-center justify-center transition-all ${
                    msg.role === "user" 
                      ? "bg-slate-800 border-slate-700 text-white" 
                      : "bg-safety-yellow border-black/10 text-black shadow-sm"
                  }`}>
                    {msg.role === "user" ? <User size={18} /> : <Bot size={18} strokeWidth={2.5} />}
                  </div>
                  
                  <div className={`max-w-[85%] sm:max-w-[70%] ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">
                        {msg.role === "user" ? "Authorized Personnel" : "HazMat System"}
                      </span>
                    </div>
                    <div className={`p-4 rounded-2xl border ${
                      msg.role === "user" 
                        ? "bg-slate-800 text-slate-100 border-slate-700 rounded-tr-none" 
                        : "bg-white text-ink border-slate-200 rounded-tl-none shadow-sm"
                    }`}>
                      <div className={`prose prose-sm max-w-none text-sm leading-relaxed font-sans ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex gap-4"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center shadow-sm">
                  <Loader2 size={18} className="animate-spin text-safety-orange" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 border-dashed text-xs text-slate-400 italic flex items-center gap-2">
                  <Activity size={12} className="animate-pulse" />
                  Accessing encrypted register data...
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-safety-yellow/20 to-safety-orange/20 rounded-xl blur opacity-10 group-focus-within:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Enter query (e.g. 'Lead paint locations' or 'Asbestos risk')..."
                  className="w-full p-4 pr-16 bg-transparent focus:outline-none font-mono text-sm placeholder:text-slate-400"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2.5 bg-safety-yellow text-black rounded-lg disabled:opacity-20 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <Send size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-slate-400">
                <AlertTriangle size={10} className="text-safety-red" />
                DANGER: ASBESTOS
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-slate-400">
                <ShieldAlert size={10} className="text-safety-orange" />
                RESTRICTED ACCESS
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-slate-400">
                <Activity size={10} className="text-safety-orange" />
                SYSTEM SECURE
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Asset Info */}
        <aside className="hidden lg:flex flex-col w-80 gap-4 shrink-0">
          <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-safety-yellow flex items-center gap-2">
              <MapPin size={14} className="text-safety-orange" />
              Location Details
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase text-slate-400 mb-1">Address</p>
                <p className="text-xs leading-relaxed font-medium text-slate-200">Flemington Maintenance Centre, Bachell Avenue, Lidcombe, NSW 2141</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] uppercase text-slate-400 mb-1">GPS Coordinates</p>
                <p className="text-xs font-mono font-bold text-slate-200">-33.863768, 151.063836</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-safety-yellow flex items-center gap-2">
              <FileText size={14} className="text-safety-orange" />
              Register Summary
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Asbestos", status: "Detected", color: "text-safety-red" },
                { label: "Lead Paint", status: "Detected", color: "text-safety-orange" },
                { label: "Lead Dust", status: "Detected", color: "text-safety-orange" },
                { label: "PCBs", status: "Presumed", color: "text-safety-orange" },
                { label: "SMF", status: "None", color: "text-slate-500" },
              ].map((item) => (
                <li key={item.label} className="flex justify-between items-center text-xs p-2 bg-white/5 rounded border border-white/5">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <span className={`font-bold uppercase text-[10px] ${item.color}`}>{item.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-slate-400">
          Property Risk Australia &copy; 2021-2026
        </p>
        <div className="flex gap-4">
          <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-50 rounded border border-slate-200 text-slate-500">ENC-AES256</span>
          <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-50 rounded border border-slate-200 text-slate-500">V1.0.4-ST</span>
        </div>
      </footer>
    </div>
  );
}
