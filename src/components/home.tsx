import React from "react";
import AudioUploader from "./AudioUploader";
import ArticleEditor from "./ArticleEditor";
import FactBoxSidebar from "./FactBoxSidebar";
import { useAudioStore } from "@/lib/store";

const Home = () => {
  const {
    articleContent,
    facts,
    quotes,
    updateFact,
    deleteFact,
    updateQuote,
    deleteQuote,
  } = useAudioStore();

  console.log("Facts in Home:", facts);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI Interview Transcription & Article Generator
        </h1>

        <div className="mb-8">
          <AudioUploader />
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <ArticleEditor
              content={articleContent || undefined}
              quotes={quotes}
              onQuoteEdit={(id, text) => updateQuote(id, { text })}
              onQuoteDelete={deleteQuote}
            />
          </div>
          <FactBoxSidebar
            facts={facts}
            onEdit={(id) => {
              const fact = facts.find((f) => f.id === id);
              if (fact) {
                const newContent = prompt("Edit fact content:", fact.content);
                if (newContent) {
                  updateFact(id, { content: newContent });
                }
              }
            }}
            onDelete={deleteFact}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
