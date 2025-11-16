'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  onEditMessage,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (editTextareaRef.current && editingMessageId) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${Math.min(editTextareaRef.current.scrollHeight, 200)}px`;
      editTextareaRef.current.focus();
    }
  }, [editContent, editingMessageId]);

  const startEditing = (message: Message) => {
    if (message.role === 'user') {
      setEditingMessageId(message.id);
      setEditContent(message.content);
    }
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const saveEdit = async () => {
    if (editingMessageId && editContent.trim()) {
      await onEditMessage(editingMessageId, editContent.trim());
      cancelEditing();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
    await onSendMessage(messageContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-sm">Type a message below to begin chatting</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="max-w-3xl flex flex-col gap-2">
                {editingMessageId === message.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      ref={editTextareaRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          saveEdit();
                        } else if (e.key === 'Escape') {
                          cancelEditing();
                        }
                      }}
                      className="bg-gray-900 text-white rounded-lg px-4 py-3 border border-blue-500 focus:outline-none resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
                      style={{ minHeight: '44px' }}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={!editContent.trim() || isLoading}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Save & Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group relative flex items-start gap-2">
                    <div
                      className={`rounded-lg px-4 py-3 flex-1 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none break-words">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Style code blocks
                              code: ({ node, inline, className, children, ...props }: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline ? (
                                  <code className="block bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              // Style pre blocks
                              pre: ({ children }: any) => {
                                return <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-2">{children}</pre>;
                              },
                              // Style links
                              a: ({ children, href }: any) => {
                                return (
                                  <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                );
                              },
                              // Style lists
                              ul: ({ children }: any) => {
                                return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
                              },
                              ol: ({ children }: any) => {
                                return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
                              },
                              // Style headings
                              h1: ({ children }: any) => {
                                return <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>;
                              },
                              h2: ({ children }: any) => {
                                return <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>;
                              },
                              h3: ({ children }: any) => {
                                return <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>;
                              },
                              // Style paragraphs
                              p: ({ children }: any) => {
                                return <p className="my-2">{children}</p>;
                              },
                              // Style blockquotes
                              blockquote: ({ children }: any) => {
                                return <blockquote className="border-l-4 border-gray-600 pl-4 my-2 italic">{children}</blockquote>;
                              },
                              // Style tables
                              table: ({ children }: any) => {
                                return <table className="border-collapse border border-gray-600 my-2 w-full">{children}</table>;
                              },
                              th: ({ children }: any) => {
                                return <th className="border border-gray-600 px-4 py-2 bg-gray-700 font-semibold">{children}</th>;
                              },
                              td: ({ children }: any) => {
                                return <td className="border border-gray-600 px-4 py-2">{children}</td>;
                              },
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && !isLoading && (
                      <button
                        onClick={() => startEditing(message)}
                        className="opacity-60 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded mt-1 flex-shrink-0"
                        title="Edit message"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500 disabled:opacity-50 resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
              style={{
                minHeight: '44px',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[44px]"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

