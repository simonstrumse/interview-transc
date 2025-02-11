import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    m4a: "audio/m4a",
    mp3: "audio/mpeg",
    mp4: "audio/mp4",
    mpeg: "audio/mpeg",
    mpga: "audio/mpeg",
    oga: "audio/ogg",
    ogg: "audio/ogg",
    wav: "audio/wav",
    webm: "audio/webm",
    flac: "audio/flac",
  };

  return mimeTypes[extension] || "audio/mpeg";
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    let file: File;

    if (audioBlob instanceof File) {
      // For uploaded files, ensure proper MIME type
      const extension = audioBlob.name.split(".").pop()?.toLowerCase() || "mp3";
      const mimeType = getMimeType(extension);

      // Create new file with correct MIME type
      file = new File([audioBlob], audioBlob.name, {
        type: mimeType,
      });
    } else {
      // For recorded blobs
      file = new File([audioBlob], "audio.mp3", {
        type: audioBlob.type || "audio/mp3",
      });
    }

    // Validate file type
    const validTypes = [
      "flac",
      "m4a",
      "mp3",
      "mp4",
      "mpeg",
      "mpga",
      "oga",
      "ogg",
      "wav",
      "webm",
    ];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !validTypes.includes(fileExtension)) {
      throw new Error(
        `Invalid file format. Supported formats: ${validTypes.join(", ")}`,
      );
    }

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    return response.text;
  } catch (error: any) {
    console.error("Transcription error:", error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

export async function generateArticleContent(transcription: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional journalist who specializes in creating well-structured articles from interview transcripts. You MUST follow the exact markdown structure: # for title, lead paragraph (no heading), ## for subheadings, ### Notable Quotes for quotes section (numbered list), ### Key Facts for facts section (numbered list). Extract key information, quotes, and facts to create an engaging article. IMPORTANT: Always write the article in the same language as the transcript provided.",
      },
      {
        role: "user",
        content: `Please analyze this interview transcript and create an article with the following EXACT structure:

        # Title
        Lead paragraph
        
        ## First Subheading
        Content
        
        ## Second Subheading
        Content
        
        ## Third Subheading (optional)
        Content
        
        ### Notable Quotes
        1. "First quote"
        2. "Second quote"
        3. "Third quote"
        
        ### Key Facts
        1. First fact
        2. Second fact
        3. Third fact

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
  const sections = content.split("\n").filter((line) => line.trim());

  let title = "";
  let leadParagraph = "";
  let subheadings: Array<{ id: string; text: string; content: string }> = [];
  let quotes: Array<{
    id: string;
    text: string;
    speaker: string;
    timestamp: string;
  }> = [];
  let facts: Array<{
    id: string;
    title: string;
    content: string;
    source: string;
  }> = [];

  let currentSection = "";
  let currentContent = "";

  for (let i = 0; i < sections.length; i++) {
    const line = sections[i];

    // Handle title (starts with single #)
    if (line.startsWith("# ")) {
      title = line.replace("# ", "").trim();
      continue;
    }

    // Handle subheadings (starts with ##)
    if (line.startsWith("## ")) {
      if (currentSection === "" && !leadParagraph) {
        // The text between title and first subheading is lead paragraph
        leadParagraph = currentContent.trim();
      } else if (currentSection.startsWith("## ")) {
        // Save previous subheading
        subheadings.push({
          id: String(subheadings.length + 1),
          text: currentSection.replace("## ", "").trim(),
          content: currentContent.trim(),
        });
      }
      currentSection = line;
      currentContent = "";
      continue;
    }

    // Handle quotes section
    if (
      line.startsWith("### Notable Quotes") ||
      line.startsWith("### Quotes")
    ) {
      if (currentSection.startsWith("## ")) {
        // Save last subheading
        subheadings.push({
          id: String(subheadings.length + 1),
          text: currentSection.replace("## ", "").trim(),
          content: currentContent.trim(),
        });
      }
      currentSection = "quotes";
      continue;
    }

    // Handle facts section
    if (line.startsWith("### Key Facts") || line.startsWith("### Facts")) {
      currentSection = "facts";
      continue;
    }

    // Handle content based on current section
    if (currentSection === "quotes" && line.match(/^\d+\./)) {
      const quoteText = line
        .replace(/^\d+\.\s*/, "")
        .replace(/^"|"$/g, "")
        .trim();
      quotes.push({
        id: String(quotes.length + 1),
        text: quoteText,
        speaker: "Interviewee",
        timestamp: "00:00",
      });
    } else if (currentSection === "facts" && line.match(/^\d+\./)) {
      const factContent = line.replace(/^\d+\.\s*/, "").trim();
      facts.push({
        id: String(facts.length + 1),
        title: `Key Fact ${facts.length + 1}`,
        content: factContent,
        source: "Interview Transcript",
      });
    } else if (currentSection.startsWith("## ")) {
      currentContent += line + "\n";
    } else if (!currentSection && !leadParagraph) {
      currentContent += line + "\n";
    }
  }

  // Handle the last section if it's a subheading
  if (currentSection.startsWith("## ")) {
    subheadings.push({
      id: String(subheadings.length + 1),
      text: currentSection.replace("## ", "").trim(),
      content: currentContent.trim(),
    });
  }

  return {
    title,
    leadParagraph: leadParagraph || currentContent.trim(),
    subheadings,
    quotes,
    facts,
  };
}
