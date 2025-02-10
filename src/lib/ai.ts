import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Convert Blob to File
  const file = new File([audioBlob], "audio.webm", { type: audioBlob.type });

  const response = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
  });

  return response.text;
}

export async function generateArticleContent(transcription: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are a professional journalist who specializes in creating well-structured articles from interview transcripts. Extract key information, quotes, and facts to create an engaging article. IMPORTANT: Always write the article in the same language as the transcript provided.",
      },
      {
        role: "user",
        content: `Please analyze this interview transcript and create an article with the following structure:
        1. A compelling title
        2. A lead paragraph that hooks the reader
        3. 2-3 subheadings with content
        4. 2-3 notable quotes from the interview
        5. 3 key facts or statistics mentioned

        Transcript: ${transcription}`,
      },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  console.log("AI Response:", content);
  return parseAIResponse(content);
}

function parseAIResponse(content: string) {
  const sections = content.split("\n\n");
  console.log("Parsed sections:", sections);

  // Find the Key Facts section - handle multiple possible headers
  const keyFactsSection = sections.find(
    (s) =>
      s.startsWith("Key Facts:") ||
      s.startsWith("Key Facts and Statistics:") ||
      s.toLowerCase().includes("key facts"),
  );
  const keyFacts = keyFactsSection
    ? keyFactsSection
        .split("\n")
        .slice(1) // Skip the header
        .filter((line) => line.trim()) // Remove empty lines
        .map((f, i) => ({
          id: String(i + 1),
          title: `Key Fact ${i + 1}`,
          content: f.replace(/^\d+\.\s*/, "").trim(),
          source: "Interview Transcript",
        }))
    : [];

  // Find the Quotes section (handle both "Quotes:" and "Notable Quotes:")
  const quotesSection = sections.find(
    (s) => s.startsWith("Notable Quotes:") || s.startsWith("Quotes:"),
  );
  const quotes = quotesSection
    ? quotesSection
        .split("\n")
        .slice(1) // Skip the header
        .filter((line) => line.trim()) // Remove empty lines
        .map((q, i) => ({
          id: String(i + 1),
          text: q
            .replace(/^\d+\.\s*/, "")
            .replace(/^"/g, "")
            .replace(/"$/g, "")
            .trim(),
          speaker: "Interviewee",
          timestamp: "00:00",
        }))
    : [];

  return {
    title: sections[0].replace("Title: ", "").replace(/^"|"$/g, ""),
    leadParagraph: sections[1].replace("Lead Paragraph:\n", ""),
    subheadings: sections
      .filter((s) => s.startsWith("Subheading"))
      .map((s, i) => ({
        id: String(i + 1),
        text: s.split(":")[1].split("\n")[0].trim(),
        content: s.split("\n")[1].trim(),
      })),
    quotes,
    facts: keyFacts,
  };
}
