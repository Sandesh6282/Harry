import { GraduationCap, User, ChevronDown, ChevronUp, FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Source {
  pdf: string;
  page: number;
  paragraph: number;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  sources?: Source[];
}

export function ChatMessage({ role, content, timestamp, sources }: ChatMessageProps) {
  const isUser = role === 'user';
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-xs ${
        isUser ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
      }`}>
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <GraduationCap size={16} className="text-white" />
        )}
      </div>
      
      <div className={`flex flex-col gap-1.5 max-w-[85%] md:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3.5 rounded-2xl ${
          isUser 
            ? 'bg-gray-900 text-white rounded-br-xs shadow-xs' 
            : 'bg-white/95 backdrop-blur-sm text-gray-900 border border-indigo-100 shadow-xs rounded-bl-xs w-full'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm md:text-[15px] leading-relaxed">{content}</p>
          ) : (
            <div className="text-sm md:text-[15px] leading-relaxed break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="mb-2.5 last:mb-0 leading-relaxed text-gray-800">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-950">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-800">
                      {children}
                    </em>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2.5 pl-5 list-disc space-y-1.5 marker:text-indigo-500 text-gray-800">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2.5 pl-5 list-decimal space-y-1.5 marker:text-indigo-600 font-normal text-gray-800">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed pl-0.5">
                      {children}
                    </li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-base md:text-lg font-bold text-gray-950 mt-4 mb-2 first:mt-0 tracking-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm md:text-base font-bold text-gray-950 mt-3.5 mb-1.5 first:mt-0 tracking-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-indigo-950 mt-3 mb-1 first:mt-0">
                      {children}
                    </h3>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-3 border-indigo-400 pl-3 py-1 my-2 bg-indigo-50/50 rounded-r-md text-gray-700 italic text-sm">
                      {children}
                    </blockquote>
                  ),
                  pre: ({ children }) => (
                    <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-sm">
                      <div className="px-3 py-1.5 bg-slate-800/90 border-b border-slate-700/50 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">code</span>
                      </div>
                      <pre className="p-3 text-xs md:text-sm font-mono text-slate-100 overflow-x-auto leading-relaxed">
                        {children}
                      </pre>
                    </div>
                  ),
                  code: ({ className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isMultiLine = String(children).includes('\n');
                    if (match || isMultiLine) {
                      return <code className={className} {...props}>{children}</code>;
                    }
                    return (
                      <code
                        className="px-1.5 py-0.5 mx-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-mono font-medium border border-indigo-100"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  table: ({ children }) => (
                    <div className="my-3 overflow-x-auto rounded-lg border border-indigo-100">
                      <table className="min-w-full text-left text-xs md:text-sm border-collapse divide-y divide-indigo-100">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-indigo-50/70 font-semibold text-gray-800">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-indigo-50 bg-white">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-indigo-50/30 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-gray-800 font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 text-gray-700">
                      {children}
                    </td>
                  ),
                  hr: () => (
                    <hr className="my-3 border-t border-indigo-100" />
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 font-medium"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action bar (citations, copy, timestamp) for assistant */}
        {!isUser && (
          <div className="flex items-center gap-3 px-1 mt-0.5 flex-wrap">
            {sources && sources.length > 0 && (
              <button 
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium bg-indigo-50/70 hover:bg-indigo-100/70 px-2 py-0.5 rounded-md border border-indigo-100"
              >
                <FileText size={12} />
                {showSources ? 'Hide Citations' : `View Citations (${sources.length})`}
                {showSources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors font-medium px-1.5 py-0.5 rounded-md hover:bg-white"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-600" />
                  <span className="text-emerald-600 text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>

            {timestamp && (
              <span className="text-gray-400 text-xs">{timestamp}</span>
            )}
          </div>
        )}

        {/* Citations panel */}
        {!isUser && showSources && sources && sources.length > 0 && (
          <div className="w-full mt-1.5 space-y-2">
            {sources.map((source, idx) => (
              <div key={idx} className="bg-white border border-indigo-100 rounded-lg p-3 text-sm shadow-xs">
                <p className="font-medium text-indigo-700 text-xs mb-1">
                  📄 {source.pdf} — Page {source.page}
                </p>
                <p className="text-gray-500 text-xs">
                  Paragraph {source.paragraph}
                </p>
              </div>
            ))}
          </div>
        )}

        {isUser && timestamp && (
          <span className="text-gray-400 px-2 text-xs">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
