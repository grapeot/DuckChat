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
    <div className="flex flex-col h-screen w-64 bg-gray-900 text-white border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 space-y-3">
        <button
          onClick={onNewConversation}
          className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          + New Chat
        </button>
        {onModelChange && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Model</label>
            <select
              value={currentModel}
              onChange={(e) => onModelChange(e.target.value as Model)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
            >
              {MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {MODELS.find((m) => m.value === currentModel)?.description}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-gray-400 text-sm p-4 text-center">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative p-3 mb-1 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {conv.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {conv.messages.length} messages
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-white transition-opacity"
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
    </div>
  );
}

