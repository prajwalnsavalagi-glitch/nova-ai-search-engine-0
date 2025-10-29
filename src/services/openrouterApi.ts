// API key should be provided from settings, not hardcoded
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  isFree: boolean;
  contextLength: number;
}

export const AVAILABLE_MODELS: OpenRouterModel[] = [
  {
    id: 'deepseek/deepseek-chat-v3.1:free',
    name: 'DeepSeek R1',
    description: 'Fast and capable reasoning model (Free)',
    isFree: true,
    contextLength: 64000,
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash',
    description: 'Google\'s fast multimodal model (Free)',
    isFree: true,
    contextLength: 1000000,
  },
  {
    id: 'google/gemini-2.5-flash-image-preview:free',
    name: 'Nano Banana (Image Gen)',
    description: 'Creates images from text prompts (Free)',
    isFree: true,
    contextLength: 32000,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    description: 'Meta\'s open source powerhouse',
    isFree: false,
    contextLength: 128000,
  },
  {
    id: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4',
    description: 'Most intelligent Claude model',
    isFree: false,
    contextLength: 200000,
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Balanced intelligence and speed',
    isFree: false,
    contextLength: 200000,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI\'s flagship model',
    isFree: false,
    contextLength: 128000,
  },
];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChatOptions {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  onChunk: (text: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export async function streamChatCompletion({
  messages,
  model,
  temperature = 0.7,
  maxTokens = 2048,
  onChunk,
  onComplete,
  onError,
  apiKey,
}: StreamChatOptions & { apiKey?: string }) {
  if (!apiKey) {
    onError(new Error('OpenRouter API key is required'));
    return;
  }
  
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'NOVA AI',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
        
        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.slice(6);
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content;
            
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Skip malformed JSON chunks
            console.warn('Failed to parse chunk:', e);
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}

export function getAvailableModels(): OpenRouterModel[] {
  return AVAILABLE_MODELS;
}

export function getModelById(id: string): OpenRouterModel | undefined {
  return AVAILABLE_MODELS.find(model => model.id === id);
}
