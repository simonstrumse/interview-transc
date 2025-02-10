import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Quote, Edit2, Trash2 } from "lucide-react";

export interface PullQuote {
  id: string;
  text: string;
  speaker: string;
  timestamp: string;
}

interface PullQuoteSectionProps {
  quotes?: PullQuote[];
  onEdit?: (id: string, newText: string) => void;
  onDelete?: (id: string) => void;
}

const defaultQuotes: PullQuote[] = [
  {
    id: "1",
    text: "The future of journalism is increasingly digital and AI-assisted",
    speaker: "Interviewee",
    timestamp: "2:15",
  },
  {
    id: "2",
    text: "We need to maintain editorial integrity while embracing new technologies",
    speaker: "Interviewee",
    timestamp: "5:30",
  },
];

const PullQuoteSection: React.FC<PullQuoteSectionProps> = ({
  quotes = defaultQuotes,
  onEdit = () => {},
  onDelete = () => {},
}) => {
  return (
    <div className="w-full bg-white space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Quote className="h-5 w-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Notable Quotes</h2>
      </div>

      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card
            key={quote.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col space-y-2">
              <blockquote className="text-lg italic text-gray-700 border-l-4 border-gray-300 pl-4">
                {quote.text}
              </blockquote>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{quote.speaker}</span>
                  <span>at {quote.timestamp}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(quote.id, quote.text)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(quote.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PullQuoteSection;
