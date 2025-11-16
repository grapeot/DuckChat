# ChatGPT Clone

A ChatGPT-like interface built with Next.js, featuring a two-column layout with conversations sidebar and chat interface. Uses the AI Builder API with Grok-4-fast model.

## Features

- 🗨️ Two-column interface: conversations sidebar (left) and chat interface (right)
- 💬 Multiple conversation management
- 💾 Local storage persistence for conversations
- 🎨 Modern, dark-themed UI
- ⚡ Real-time chat with AI models

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```bash
   AI_BUILDER_TOKEN=your_token_here
   ```
   
   Get your AI Builder token from the AI Builder platform.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Click "New Chat" to start a new conversation
2. Type your message in the input field at the bottom
3. Press Enter or click "Send" to send your message
4. The AI will respond using the Grok-4-fast model
5. Conversations are automatically saved to your browser's local storage

## Model Configuration

The app is configured to use `grok-4-fast` by default. You can modify the model in:
- `app/api/chat/route.ts` - Change the default model parameter
- `app/page.tsx` - Change the model in the API call

Available models through AI Builder API:
- `grok-4-fast` - Grok 4 Fast model (default)
- `deepseek` - Fast and cost-effective
- `secondmind-agent-v1` - Multi-tool agent with web search
- `gemini-2.5-pro` - Google's Gemini model
- `gpt-5` - OpenAI-compatible passthrough

## Project Structure

```
app/
  ├── api/
  │   └── chat/
  │       └── route.ts          # API route for chat completions
  ├── components/
  │   ├── ConversationSidebar.tsx  # Left sidebar with conversations
  │   └── ChatInterface.tsx       # Right side chat interface
  ├── types.ts                    # TypeScript type definitions
  ├── page.tsx                    # Main page component
  └── layout.tsx                  # Root layout
```

## Technologies Used

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- AI Builder API
