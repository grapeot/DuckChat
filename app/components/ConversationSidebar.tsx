'use client';

import { Conversation, Model } from '../types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  currentModel?: Model;
  onModelChange?: (model: Model) => void;
}

const MODELS: { value: Model; label: string; description: string }[] = [
  { value: 'grok-4-fast', label: 'Grok-4-Fast', description: 'Fast reasoning model' },
  { value: 'secondmind-agent-v1', label: 'SecondMind Agent', description: 'Multi-tool agent with web search' },
  { value: 'deepseek', label: 'DeepSeek', description: 'Fast and cost-effective' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: "Google's Gemini model" },
  { value: 'gpt-5', label: 'GPT-5', description: 'OpenAI-compatible passthrough' },
];

export default function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  currentModel = 'grok-4-fast',
  onModelChange,
}: ConversationSidebarProps) {
  return (
    <aside className="flex flex-col h-full w-72 shrink-0 bg-sidebar text-ink border-r border-rule">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <span className="h-[3px] w-5 rounded-full bg-brand" aria-hidden="true" />
          <span className="sa-label text-brand-text">AI Builders</span>
        </div>
        <div className="font-display text-[28px] leading-none font-semibold text-ink mt-2.5">
          DuckChat
        </div>
      </div>

      <div className="px-5 pb-5 space-y-5 border-b border-rule">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 h-11 px-4 bg-brand text-white rounded-xl hover:bg-brand-hover active:translate-y-px transition-colors font-semibold text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
        {onModelChange && (
          <div>
            <label htmlFor="model-select" className="sa-label block mb-2">Model</label>
            <select
              id="model-select"
              value={currentModel}
              onChange={(e) => onModelChange(e.target.value as Model)}
              className="sa-select w-full h-10 pl-3 bg-surface text-ink rounded-xl border border-rule-strong hover:border-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-sm font-medium cursor-pointer transition-colors"
            >
              {MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted mt-2 leading-snug">
              {MODELS.find((m) => m.value === currentModel)?.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-4">
          <div className="sa-label px-2 mb-2">Conversations</div>
          {conversations.length === 0 ? (
            <div className="text-muted text-sm px-2 py-6 text-center">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative px-3 py-2.5 mb-0.5 rounded-xl cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-sidebar-active'
                    : 'hover:bg-sidebar-hover'
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm truncate ${
                        currentConversationId === conv.id ? 'font-semibold text-ink' : 'font-medium text-ink-2'
                      }`}
                    >
                      {conv.title}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {conv.messages.length} messages
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 ml-2 p-1 rounded-md text-muted hover:text-ink hover:bg-paper transition-opacity"
                    title="Delete conversation"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-rule">
        <div className="sa-label text-[10px]">Superlinear Academy</div>
      </div>
    </aside>
  );
}
