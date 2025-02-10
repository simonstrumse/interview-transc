import { create } from "zustand";
import { ArticleContent } from "@/components/ArticleEditor";
import { FactBox } from "@/components/FactBoxSidebar";
import { PullQuote } from "@/components/PullQuoteSection";

interface AudioState {
  audioBlob: Blob | null;
  transcription: string;
  isRecording: boolean;
  isProcessing: boolean;
  recordingTime: number;
  articleContent: ArticleContent | null;
  facts: FactBox[];
  quotes: PullQuote[];
  setAudioBlob: (blob: Blob | null) => void;
  setTranscription: (text: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setRecordingTime: (time: number) => void;
  setArticleContent: (content: ArticleContent) => void;
  setFacts: (facts: FactBox[]) => void;
  setQuotes: (quotes: PullQuote[]) => void;
  updateFact: (id: string, fact: Partial<FactBox>) => void;
  deleteFact: (id: string) => void;
  updateQuote: (id: string, quote: Partial<PullQuote>) => void;
  deleteQuote: (id: string) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  audioBlob: null,
  transcription: "",
  isRecording: false,
  isProcessing: false,
  recordingTime: 0,
  articleContent: null,
  facts: [],
  quotes: [],
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  setTranscription: (text) => set({ transcription: text }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setRecordingTime: (time) => set({ recordingTime: time }),
  setArticleContent: (content) => set({ articleContent: content }),
  setFacts: (facts) => set({ facts }),
  setQuotes: (quotes) => set({ quotes }),
  updateFact: (id, fact) =>
    set((state) => ({
      facts: state.facts.map((f) => (f.id === id ? { ...f, ...fact } : f)),
    })),
  deleteFact: (id) =>
    set((state) => ({
      facts: state.facts.filter((f) => f.id !== id),
    })),
  updateQuote: (id, quote) =>
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === id ? { ...q, ...quote } : q)),
    })),
  deleteQuote: (id) =>
    set((state) => ({
      quotes: state.quotes.filter((q) => q.id !== id),
    })),
}));
