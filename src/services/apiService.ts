// src/services/apiService.ts
import { StudyPart, PredicationType, AppSettings, GeneratedStudy } from '../types'; // Import GeneratedStudy type
import { ContentOptions } from '../components/ContentInclusion';

export const callGenerateContentApi = async (
  type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION' | 'DISCOURS' | 'DISCOURS_THEME',
  input: string | string[],
  part: StudyPart = 'tout',
  settings: AppSettings,
  isInitialSearchForPreview: boolean = false,
  preachingType: PredicationType | undefined,
  contentOptions?: ContentOptions,
  extraParams?: Record<string, any>,
  onStream?: (text: string) => void
): Promise<{ text: string; title: string; theme?: string; rawSources?: GeneratedStudy['rawSources']; aiExplanation?: string }> => {

  const controller = new AbortController();

  const response = await fetch('/api/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
    body: JSON.stringify({
      type,
      input,
      part,
      settings,
      isInitialSearchForPreview,
      preachingType,
      contentOptions,
      articleReferences: contentOptions?.articleLinks,
      ...extraParams 
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("QUOTA_EXCEEDED: Quota d'IA épuisé. Veuillez patienter quelques minutes.");
    }
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Server Error: ${response.status}`);
    }
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  // Handle Streaming Response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  if (reader) {
    let done = false;
    while (!done) {
      const { done: streamDone, value } = await reader.read();
      done = streamDone;
      
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        
        if (onStream) {
          onStream(fullText);
        }
      }
    }
  } else {
    // Fallback for non-streaming response (e.g. cached JSON)
    const data = await response.json();
    fullText = data.text || "";
    if (onStream) onStream(fullText);
    
    if (type === 'DISCOURS_THEME') {
      return data;
    }
    
    return { 
      text: fullText, 
      title: data.title || "Generated Content",
      theme: data.theme,
      rawSources: data.rawSources,
      aiExplanation: data.aiExplanation || fullText
    };
  }

  if (type === 'DISCOURS_THEME') {
    return { text: fullText, title: fullText, theme: fullText };
  }

  let extractedTitle = "Generated Content";
  const titleMatch = fullText.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    extractedTitle = titleMatch[1].trim();
  } else {
    // Fallback: try to find any first line that looks like a title
    const lines = fullText.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 0) {
      extractedTitle = lines[0].replace(/^#+\s*/, '').trim();
    }
  }

  return { 
    text: fullText, 
    title: extractedTitle,
    aiExplanation: fullText
  };
};
