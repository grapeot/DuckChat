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
    <div className="flex flex-col h-full bg-paper">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="h-[3px] w-5 rounded-full bg-brand" aria-hidden="true" />
                <span className="sa-label text-brand-text">AI Builders</span>
              </div>
              <h2 className="font-display text-4xl font-semibold text-ink mb-3">Start a conversation</h2>
              <p className="text-[15px] text-muted">Type a message below to begin chatting</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex flex-col gap-1.5 min-w-0 ${
                    message.role === 'user' ? 'items-end max-w-[85%]' : 'items-start w-full'
                  } ${editingMessageId === message.id ? 'w-full max-w-full' : ''}`}
                >
                  <div className="sa-label px-1">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  {editingMessageId === message.id ? (
                    <div className="flex flex-col gap-2 w-full">
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
                        className="bg-surface text-ink text-[15px] leading-relaxed rounded-2xl px-4 py-3 border border-brand ring-2 ring-brand/15 focus:outline-none resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
                        style={{ minHeight: '44px' }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEditing}
                          className="h-9 px-4 text-sm font-medium text-ink-2 rounded-xl border border-rule-strong bg-surface hover:bg-sidebar-hover transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          disabled={!editContent.trim() || isLoading}
                          className="h-9 px-4 text-sm font-semibold bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Save & Regenerate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`group relative flex items-start gap-1.5 min-w-0 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'w-full'
                      }`}
                    >
                      <div
                        className={`min-w-0 ${
                          message.role === 'user'
                            ? 'bg-brand-tint text-ink border border-brand-line rounded-2xl rounded-tr-md px-4 py-2.5 text-[15px] leading-relaxed'
                            : 'flex-1 bg-surface text-ink border border-rule rounded-2xl rounded-tl-md px-5 py-4'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="sa-markdown">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Open links in a new tab
                                a: ({ children, href }: any) => {
                                  return (
                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                      {children}
                                    </a>
                                  );
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
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-2 text-muted hover:text-ink hover:bg-sidebar-hover rounded-lg mt-0.5 flex-shrink-0"
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
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-col gap-1.5 items-start">
                  <div className="sa-label px-1">Assistant</div>
                  <div className="bg-surface border border-rule rounded-2xl rounded-tl-md px-5 py-4">
                    <div className="flex items-center gap-1.5 h-4" aria-label="Assistant is typing">
                      <div className="sa-dot"></div>
                      <div className="sa-dot" style={{ animationDelay: '0.15s' }}></div>
                      <div className="sa-dot" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 pt-3 pb-5 bg-paper">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end bg-surface border border-rule-strong rounded-2xl p-2 pl-4 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message DuckChat…"
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent text-ink text-[15px] leading-relaxed placeholder:text-muted py-2.5 focus:outline-none disabled:opacity-50 resize-none min-h-[44px] max-h-[200px] overflow-y-auto"
              style={{
                minHeight: '44px',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 h-11 px-5 bg-brand text-white font-semibold text-[15px] rounded-xl hover:bg-brand-hover disabled:bg-code disabled:text-muted disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-center text-xs text-muted mt-2">
            Enter to send · Shift+Enter for a new line
          </p>
        </form>
      </div>
    </div>
  );
}
