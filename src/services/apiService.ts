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

  const response = await fetch('/api/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Server Error: ${response.status}`);
    }
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  if (type === 'DISCOURS_THEME') {
    return response.json();
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  let fullText = "";
  const decoder = new TextDecoder();

  let done = false;
  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) {
      done = true;
      break;
    }
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;
    if (onStream) onStream(fullText);
  }

  return { text: fullText, title: "Generated Content" };
};
