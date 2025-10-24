import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Improved model routing based on prompt analysis
function detectPromptIntent(query: string, attachments: any[]): { 
  intent: 'image_gen' | 'vision' | 'text' | 'file_analysis' | 'coding' | 'reasoning',
  suggestedLovableModel: string,
  suggestedOpenRouterModel: string
} {
  const lowerQuery = query.toLowerCase();
  const hasImages = attachments.some(att => att?.type?.startsWith('image/'));
  const hasFiles = attachments.some(att => att?.contentText || att?.type?.includes('pdf') || att?.type?.includes('document'));
  
  // Image generation - more comprehensive keywords
  const imageGenKeywords = [
    'generate image', 'create image', 'make image', 'draw', 'make a picture', 
    'design', 'illustrate', 'visualize', 'picture of', 'image of',
    'generate a photo', 'create a photo', 'show me a picture', 'draw me'
  ];
  if (imageGenKeywords.some(kw => lowerQuery.includes(kw))) {
    return { 
      intent: 'image_gen', 
      suggestedLovableModel: 'google/gemini-2.5-flash-image-preview',
      suggestedOpenRouterModel: 'google/gemini-2.5-flash-image-preview'
    };
  }
  
  // Vision analysis (has images attached)
  if (hasImages) {
    return { 
      intent: 'vision', 
      suggestedLovableModel: 'google/gemini-2.5-pro',
      suggestedOpenRouterModel: 'google/gemini-2.0-flash-exp:free'
    };
  }
  
  // File analysis
  if (hasFiles) {
    return { 
      intent: 'file_analysis', 
      suggestedLovableModel: 'google/gemini-2.5-pro',
      suggestedOpenRouterModel: 'anthropic/claude-3.5-sonnet'
    };
  }
  
  // Coding tasks
  const codingKeywords = ['code', 'program', 'function', 'debug', 'algorithm', 'javascript', 'python', 'typescript'];
  if (codingKeywords.some(kw => lowerQuery.includes(kw))) {
    return { 
      intent: 'coding', 
      suggestedLovableModel: 'openai/gpt-5',
      suggestedOpenRouterModel: 'deepseek/deepseek-chat-v3.1:free'
    };
  }
  
  // Complex reasoning
  const reasoningKeywords = ['analyze', 'explain', 'compare', 'why', 'how', 'reasoning', 'logic'];
  if (reasoningKeywords.some(kw => lowerQuery.includes(kw))) {
    return { 
      intent: 'reasoning', 
      suggestedLovableModel: 'openai/gpt-5',
      suggestedOpenRouterModel: 'anthropic/claude-3.5-sonnet'
    };
  }
  
  // Default to best text model
  return { 
    intent: 'text', 
    suggestedLovableModel: 'google/gemini-2.5-flash',
    suggestedOpenRouterModel: 'meta-llama/llama-3.3-70b-instruct:free'
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestSchema = z.object({
      query: z.string().min(1).max(5000),
      model: z.string().optional(),
      maxTokens: z.number().min(100).max(32768).optional(),
      temperature: z.number().min(0).max(2).optional(),
      systemPrompt: z.string().max(10000).optional(),
      attachments: z.array(z.object({
        name: z.string().max(255),
        type: z.string().max(100),
        contentText: z.string().max(100000).optional(),
        dataUrl: z.string().max(10000000).optional()
      })).max(10).optional(),
      apiKeys: z.object({
        openrouter: z.string().max(500).optional(),
        tavily: z.string().max(500).optional()
      }).optional()
    });

    const body = await req.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { query, model, maxTokens, temperature, systemPrompt, attachments, apiKeys } = validationResult.data;

    // Smart routing if model is 'auto-lovable' or 'auto-openrouter'
    let selectedModel = model || "google/gemini-2.5-flash";
    let isAutoMode = false;
    if (selectedModel === 'auto-lovable' || selectedModel === 'auto-openrouter') {
      const detection = detectPromptIntent(query, attachments || []);
      selectedModel = selectedModel === 'auto-lovable' 
        ? detection.suggestedLovableModel 
        : detection.suggestedOpenRouterModel;
      isAutoMode = true;
      console.log(`🧠 Auto mode (${model}) detected: ${detection.intent} -> ${selectedModel}`);
    }

    // Optimized token budgeting for faster responses
    const userMax = maxTokens || 4096;
    const primaryMaxTokens = Math.min(userMax, 4096);
    const targetWords = 500;

    let fallbackUsed = false;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TAVILY_API_KEY = apiKeys?.tavily || Deno.env.get("TAVILY_API_KEY");
    const OPENROUTER_API_KEY = apiKeys?.openrouter || Deno.env.get("OPENROUTER_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build messages with attachments
    let userContent = query;
    const imageDataUrls: string[] = [];
    let fileContents = "";
    
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        // Handle images
        if (att?.type?.startsWith('image/') && att?.dataUrl) {
          imageDataUrls.push(att.dataUrl);
        }
        // Handle text files
        if (att?.contentText) {
          fileContents += `\n\n📄 File: ${att.name}\n${att.contentText.slice(0, 50000)}`;
        }
      }
      
      if (fileContents) {
        userContent += fileContents;
      }
      if (imageDataUrls.length > 0 && !userContent.toLowerCase().includes('image')) {
        userContent += "\n\n[Images attached for analysis]";
      }
    }

    const hasImages = imageDataUrls.length > 0;
    const isImageGenModel = selectedModel.includes('image-preview');

    // Determine if using OpenRouter
    const isOpenRouterModel = selectedModel && (
      selectedModel.includes('deepseek') ||
      selectedModel.includes('llama') ||
      selectedModel.includes('phi') ||
      selectedModel.includes('qwen') ||
      selectedModel.includes('anthropic') ||
      selectedModel.includes('openai/gpt-4') ||
      selectedModel.includes('mistralai') ||
      selectedModel.includes(':free')
    );
    
    console.log("Model selected:", selectedModel);
    console.log("Has images:", hasImages);
    console.log("Is image gen:", isImageGenModel);
    console.log("Max tokens:", primaryMaxTokens);

    let tavilyData: any = null;
    
    // Fetch Tavily search results for text queries (optimized with lower depth)
    if (TAVILY_API_KEY && !isImageGenModel) {
      try {
        const tavilyResponse = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: TAVILY_API_KEY,
            query: query,
            search_depth: "basic",
            include_images: true,
            include_answer: false,
            max_results: 3,
          }),
        });

        if (tavilyResponse.ok) {
          tavilyData = await tavilyResponse.json();
        }
      } catch (error) {
        console.error("Tavily API error:", error);
      }
    }

    // Force multimodal-capable models for images
    if (hasImages && !isImageGenModel) {
      selectedModel = "google/gemini-2.5-pro";
    }

    const LOVABLE_ALLOWED_MODELS = new Set([
      "openai/gpt-4o-mini",
      "openai/gpt-4o",
      "openai/gpt-5",
      "openai/gpt-5-mini",
      "google/gemini-2.5-pro",
      "google/gemini-2.5-flash",
      "google/gemini-2.5-flash-lite",
      "google/gemini-2.5-flash-image-preview",
    ]);

    if ((!isOpenRouterModel || !OPENROUTER_API_KEY || hasImages) && !LOVABLE_ALLOWED_MODELS.has(selectedModel)) {
      fallbackUsed = true;
      selectedModel = hasImages ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";
    }

    // For image generation model
    if (isImageGenModel) {
      console.log("Using image generation model");
      const imageGenResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "user", content: query }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!imageGenResponse.ok) {
        const errorText = await imageGenResponse.text();
        console.error("Image gen error:", imageGenResponse.status, errorText);
        throw new Error(`Image generation failed: ${errorText}`);
      }

      const imageData = await imageGenResponse.json();
      const generatedImages = imageData.choices?.[0]?.message?.images || [];
      const textResponse = imageData.choices?.[0]?.message?.content || "Here's your generated image! 🎨";
      
      const imageUrls = generatedImages.map((img: any) => img.image_url?.url).filter(Boolean);

      return new Response(
        JSON.stringify({
          summary: textResponse,
          query,
          images: imageUrls,
          meta: { model: selectedModel, fallbackUsed, isAutoMode, generatedImages: true },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemMessage = {
      role: "system",
      content: systemPrompt || `You are NOVA, a helpful search assistant created by Prajwal Savalagi. Provide comprehensive, well-researched answers with clear structure. 

IMPORTANT: You are currently using the ${selectedModel} model. If asked which model you are, respond with "${selectedModel}".

IMPORTANT: Your response should be concise and well-structured. ALWAYS complete your final sentence - never cut off mid-sentence.

${fileContents ? '\n⚠️ FILE ANALYSIS: The user has attached files for you to analyze. Read them carefully and provide insights based on the content.' : ''}

${hasImages ? '\n🖼️ VISION MODE: Analyze the attached images in detail. Describe what you see and answer any questions about them.' : ''}

MATHEMATICAL FORMATTING:
- Use LaTeX formatting: $x = 5$ for inline, $$\\frac{a}{b} = c$$ for display

Use emojis occasionally to make it engaging 🌟`
    };

    // Build user message
    const userMessage: any = hasImages
      ? {
          role: "user",
          content: [
            { type: "text", text: userContent },
            ...imageDataUrls.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        }
      : { role: "user", content: userContent };

    const buildRequestBody = (maxTok: number, messagesArr: any[]) => {
      const body: any = {
        model: selectedModel,
        messages: messagesArr,
        max_tokens: maxTok,
      };
      if (typeof temperature === "number") body.temperature = temperature;
      body.frequency_penalty = 0.6;
      body.presence_penalty = 0.1;
      return body;
    };

    let aiResponse;
    
    if (isOpenRouterModel && OPENROUTER_API_KEY && !hasImages) {
      console.log("Using OpenRouter");
      aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nova-ai.lovable.app",
          "X-Title": "NOVA AI",
        },
        body: JSON.stringify(buildRequestBody(primaryMaxTokens, [systemMessage, userMessage])),
      });
    } else {
      console.log("Using Lovable AI");
      aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildRequestBody(primaryMaxTokens, [systemMessage, userMessage])),
      });
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      const errorMessages: Record<number, string> = {
        429: "Rate limit exceeded. Please try again later.",
        402: "Payment required. Please add credits to continue.",
        401: "Invalid API key. Please check your OpenRouter API key in settings.",
        400: `Bad request: ${errorText || 'Invalid model or parameters'}`,
      };

      if (aiResponse.status === 404 && errorText.includes("Free model publication")) {
        return new Response(
          JSON.stringify({ 
            error: "OpenRouter privacy settings need configuration. Go to https://openrouter.ai/settings/privacy and enable 'Free model publication'." 
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorMsg = errorMessages[aiResponse.status] || `AI gateway error: ${errorText}`;
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: aiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    let summary = aiData.choices?.[0]?.message?.content || "Unable to generate response";

    // Remove special tokens that sometimes appear in responses
    summary = summary
      .replace(/<\|begin▁of▁sentence\|>/g, '')
      .replace(/<\|end▁of▁sentence\|>/g, '')
      .replace(/<\|begin_of_text\|>/g, '')
      .replace(/<\|end_of_text\|>/g, '')
      .replace(/<｜begin▁of▁sentence｜>/g, '')
      .replace(/<｜end▁of▁sentence｜>/g, '')
      .trim();

    // Simplified de-duplication
    summary = summary.replace(/(.{50,}?)\1+/g, '$1').trim();

    const response: any = {
      summary,
      query,
      meta: { model: selectedModel, fallbackUsed, isAutoMode },
    };

    if (tavilyData) {
      response.sources = tavilyData.results?.map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.content,
        domain: new URL(result.url).hostname,
      })) || [];
      response.images = tavilyData.images || [];
    }
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
