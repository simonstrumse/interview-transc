import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Pencil, Type, Heading2 } from "lucide-react";
import PullQuoteSection from "./PullQuoteSection";

export interface ArticleContent {
  title: string;
  leadParagraph: string;
  subheadings: Array<{
    id: string;
    text: string;
    content: string;
  }>;
}

interface ArticleEditorProps {
  content?: ArticleContent;
  onContentChange?: (content: ArticleContent) => void;
  quotes?: Array<{
    id: string;
    text: string;
    speaker: string;
    timestamp: string;
  }>;
  onQuoteEdit?: (id: string, text: string) => void;
  onQuoteDelete?: (id: string) => void;
}

const defaultContent: ArticleContent = {
  title: "The Future of AI in Journalism",
  leadParagraph:
    "As artificial intelligence continues to reshape various industries, its impact on journalism is becoming increasingly significant. This article explores the intersection of AI and traditional reporting methods.",
  subheadings: [
    {
      id: "1",
      text: "The Evolution of News Gathering",
      content:
        "Traditional reporting methods are being augmented by AI-powered tools, enabling journalists to process vast amounts of data quickly and efficiently.",
    },
    {
      id: "2",
      text: "Balancing Technology and Human Insight",
      content:
        "While AI offers powerful capabilities, the human element remains crucial in journalism, providing context, emotion, and ethical judgment that machines cannot replicate.",
    },
  ],
};

const ArticleEditor: React.FC<ArticleEditorProps> = ({
  content = defaultContent,
  onContentChange = () => {},
  quotes = [],
  onQuoteEdit = () => {},
  onQuoteDelete = () => {},
}) => {
  return (
    <div className="w-full min-h-full bg-white p-8 space-y-8 overflow-y-auto">
      <Card className="p-6 space-y-6">
        {/* Title Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Type className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Article Title
            </h2>
          </div>
          <Input
            value={content.title}
            onChange={(e) =>
              onContentChange({
                ...content,
                title: e.target.value,
              })
            }
            className="text-2xl font-bold"
            placeholder="Enter article title..."
          />
        </div>

        {/* Lead Paragraph Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Lead Paragraph
            </h2>
          </div>
          <Textarea
            value={content.leadParagraph}
            onChange={(e) =>
              onContentChange({
                ...content,
                leadParagraph: e.target.value,
              })
            }
            className="min-h-[100px]"
            placeholder="Enter lead paragraph..."
          />
        </div>

        {/* Subheadings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heading2 className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Subheadings</h2>
          </div>
          {content.subheadings.map((subheading) => (
            <Card key={subheading.id} className="p-4 space-y-3">
              <Input
                value={subheading.text}
                onChange={(e) =>
                  onContentChange({
                    ...content,
                    subheadings: content.subheadings.map((sh) =>
                      sh.id === subheading.id
                        ? { ...sh, text: e.target.value }
                        : sh,
                    ),
                  })
                }
                className="font-semibold"
                placeholder="Subheading title..."
              />
              <Textarea
                value={subheading.content}
                onChange={(e) =>
                  onContentChange({
                    ...content,
                    subheadings: content.subheadings.map((sh) =>
                      sh.id === subheading.id
                        ? { ...sh, content: e.target.value }
                        : sh,
                    ),
                  })
                }
                className="min-h-[80px]"
                placeholder="Subheading content..."
              />
            </Card>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              onContentChange({
                ...content,
                subheadings: [
                  ...content.subheadings,
                  {
                    id: String(content.subheadings.length + 1),
                    text: "",
                    content: "",
                  },
                ],
              })
            }
          >
            Add Subheading
          </Button>
        </div>

        {/* Pull Quotes Section */}
        <PullQuoteSection
          quotes={quotes}
          onEdit={onQuoteEdit}
          onDelete={onQuoteDelete}
        />
      </Card>
    </div>
  );
};

export default ArticleEditor;
