import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { BookOpen, GraduationCap, Sparkles, Upload, X } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://harry-backend-api-5slf.onrender.com'
).replace(/\/$/, '');
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { pdf: string; page: number; paragraph: number }[];
}

const SUGGESTED_QUESTIONS = [
  "What is the Transformer architecture?",
  "Explain the attention mechanism",
  "What is Named Entity Recognition?",
  "How does BERT work?",
  "Explain word embeddings",
  "What is transfer learning in NLP?",
];

export default function App() {
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [isReady, setIsReady] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll /ready endpoint
  useEffect(() => {
    let cancelled = false;
    const checkReady = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ready`);
        const data = await res.json();
        if (data.ready && !cancelled) {
          setIsReady(true);
          return;
        }
      } catch (e) {
        // Backend not up yet
      }
      if (!cancelled) {
        setTimeout(checkReady, 2000);
      }
    };
    checkReady();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(`${API_BASE_URL}/cleanup?session_id=${sessionId}`);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      fetch(`${API_BASE_URL}/cleanup?session_id=${sessionId}`, { method: 'DELETE' }).catch(() => {});
    };
  }, [sessionId]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hey there! I\'m your NLP Study Buddy. Ask me anything about Advanced Natural Language Processing — from transformers and attention to NER, parsing, and beyond. I\'ll explain it from your course notes!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const url = new URL(`${API_BASE_URL}/query`);
      url.searchParams.append('question', content);
      url.searchParams.append('session_id', sessionId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error querying backend:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || "Sorry, I couldn't reach the backend to answer your question.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const showSuggestions = messages.length <= 1 && !isProcessing;

  // Loading screen while knowledge base is being ingested
  if (!isReady) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center space-y-6 animate-pulse">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
            <BookOpen size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-gray-900 mb-2">Loading your NLP course notes...</h2>
            <p className="text-gray-500">Preparing the knowledge base for your study session</p>
          </div>
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Upload Slide-over Panel */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowUpload(false)} />
          <div className="relative ml-auto w-96 h-full shadow-2xl animate-in slide-in-from-right">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
            <FileUpload sessionId={sessionId} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 text-lg leading-tight">NLP Study Buddy</h1>
            <p className="text-indigo-500 text-xs font-medium">Advanced Natural Language Processing</p>
          </div>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
        >
          <Upload size={16} />
          Add Notes
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              sources={message.sources}
            />
          ))}
          
          {/* Suggested Questions */}
          {showSuggestions && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-indigo-500" />
                <p className="text-sm text-gray-500 font-medium">Try asking</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-left px-4 py-3 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100">
                <p className="text-gray-500 text-sm">Searching your course notes...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput onSendMessage={handleSendMessage} disabled={isProcessing} />
      </div>
    </div>
  );
}
