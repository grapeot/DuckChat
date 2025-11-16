'use client';

import { useState, useEffect } from 'react';
import ConversationSidebar from './components/ConversationSidebar';
import ChatInterface from './components/ChatInterface';
import { Conversation, Message, Model } from './types';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('conversations');
    if (saved) {
      const parsed = JSON.parse(saved).map((conv: any) => ({
        ...conv,
        model: conv.model || 'grok-4-fast', // Default for old conversations
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setConversations(parsed);
      if (parsed.length > 0) {
        setCurrentConversationId(parsed[0].id);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  const createNewConversation = () => {
    const currentModel = currentConversation?.model || 'grok-4-fast';
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      model: currentModel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations([newConv, ...conversations]);
    setCurrentConversationId(newConv.id);
  };

  const changeModel = (model: Model) => {
    if (!currentConversationId) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, model, updatedAt: new Date() }
          : conv
      )
    );
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (currentConversationId === id) {
      setCurrentConversationId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const generateConversationTitle = async (firstMessage: string): Promise<string> => {
    try {
      const conv = conversations.find((c) => c.id === currentConversationId);
      const model = conv?.model || 'grok-4-fast';
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Not Chat',
            },
            {
              role: 'user',
              content: `Generate a short, descriptive title (3-5 words max) for this conversation starter: "${firstMessage}"`,
            },
          ],
          model,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const title = data.choices[0]?.message?.content?.trim() || firstMessage.slice(0, 50);
        // Clean up the title - remove quotes if present, limit length
        return title.replace(/^["']|["']$/g, '').slice(0, 50);
      }
    } catch (error) {
      console.error('Error generating title:', error);
    }
    // Fallback to truncated first message
    return firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
  };

  const updateConversationTitle = async (id: string, firstMessage: string) => {
    // Generate title using AI
    const title = await generateConversationTitle(firstMessage);
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv
      )
    );
  };

  const editMessage = async (messageId: string, newContent: string) => {
    const convId = currentConversationId;
    if (!convId) return;

    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    // Find the message index
    const messageIndex = conv.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Update the message and remove all messages after it
    const updatedMessages = [
      ...conv.messages.slice(0, messageIndex),
      {
        ...conv.messages[messageIndex],
        content: newContent,
      },
    ];

    // Update conversation with edited message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: updatedMessages,
              updatedAt: new Date(),
            }
          : c
      )
    );

    // Regenerate response
    setIsLoading(true);

    try {
      // Prepare messages for API - add "Not Chat" system message if not already present
      const hasSystemMessage = updatedMessages.some(msg => msg.role === 'system');
      
      const apiMessages = [
        ...(hasSystemMessage ? [] : [{
          role: 'system' as const,
          content: 'Not Chat',
        }]),
        ...updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      const convForModel = conversations.find((c) => c.id === convId);
      const model = convForModel?.model || 'grok-4-fast';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'No response',
        timestamp: new Date(),
      };

      // Add assistant message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...updatedMessages, assistantMessage],
                updatedAt: new Date(),
              }
            : c
        )
      );
    } catch (error) {
      console.error('Error regenerating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...updatedMessages, errorMessage],
                updatedAt: new Date(),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentConversationId) {
      createNewConversation();
      // Wait a bit for the conversation to be created
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const convId = currentConversationId || conversations[0]?.id;
    if (!convId) return;

    // Get the conversation and model before updating
    const conv = conversations.find((c) => c.id === convId);
    const model = conv?.model || 'grok-4-fast';

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add user message immediately
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              updatedAt: new Date(),
            }
          : c
      )
    );

    // Update title if this is the first message
    if (conv && conv.messages.length === 0) {
      updateConversationTitle(convId, content);
    }

    setIsLoading(true);

    try {
      // Prepare messages for API - add "Not Chat" system message if not already present
      const conversationMessages = conv?.messages || [];
      const hasSystemMessage = conversationMessages.some(msg => msg.role === 'system');
      
      const apiMessages = [
        ...(hasSystemMessage ? [] : [{
          role: 'system' as const,
          content: 'Not Chat',
        }]),
        ...conversationMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: userMessage.content,
        },
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'No response',
        timestamp: new Date(),
      };

      // Add assistant message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === convId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: new Date(),
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === convId
            ? {
                ...conv,
                messages: [...conv.messages, errorMessage],
                updatedAt: new Date(),
              }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        currentModel={currentConversation?.model || 'grok-4-fast'}
        onModelChange={changeModel}
      />
      <div className="flex-1">
        {currentConversation ? (
          <ChatInterface
            messages={currentConversation.messages}
            onSendMessage={sendMessage}
            onEditMessage={editMessage}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">No conversation selected</h2>
              <p className="text-sm">Create a new chat to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
