// src/services/searchApiService.ts
import { AppSettings, GeneratedStudy } from '../types';
import { ContentOptions } from '../components/ContentInclusion';

export const callSearchContentApi = async (
  questionOrSubject: string,
  settings: AppSettings,
  confirmMode: boolean, 
  contentOptions?: ContentOptions,
  onStream?: (text: string) => void,
  part?: string
): Promise<{ 
    text: string; 
    title: string; 
    theme?: string; 
    rawSources?: GeneratedStudy['rawSources']; 
    aiExplanation?: string;
    previewTitle?: string;
    previewSummary?: string;
    previewImage?: string;
    previewInfos?: string;
    url?: string;
}> => {

  const response = await fetch('/api/search-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionOrSubject,
      settings,
      confirmMode, 
      contentOptions,
      part,
      articleReferences: contentOptions?.articleLinks
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

  // If confirmMode, it's JSON
  if (confirmMode) {
    return response.json();
  }

  // If not confirmMode, it's a stream
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

  return { text: fullText, title: questionOrSubject };
};
