import React from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Info, Edit2, Trash2 } from "lucide-react";

export interface FactBox {
  id: string;
  title: string;
  content: string;
  source: string;
}

interface FactBoxSidebarProps {
  facts?: FactBox[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const defaultFacts: FactBox[] = [
  {
    id: "1",
    title: "Key Statistics",
    content:
      "87% of journalists believe AI will play a significant role in future newsrooms",
    source: "Industry Survey 2023",
  },
  {
    id: "2",
    title: "Historical Context",
    content:
      "First AI-assisted article was published in 2014 by Associated Press",
    source: "Journalism Archives",
  },
  {
    id: "3",
    title: "Market Impact",
    content:
      "AI in journalism market expected to grow by 25% annually through 2025",
    source: "Market Research Report",
  },
];

const FactBoxSidebar: React.FC<FactBoxSidebarProps> = ({
  facts = defaultFacts,
  onEdit = () => {},
  onDelete = () => {},
}) => {
  return (
    <div className="w-[400px] h-full bg-gray-50 border-l border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Fact Box</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-100px)]">
        <div className="space-y-4 pr-4">
          {facts.map((fact) => (
            <Card key={fact.id} className="p-4 bg-white">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{fact.title}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(fact.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(fact.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-600">{fact.content}</p>

                <div className="text-xs text-gray-400 italic">
                  Source: {fact.source}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FactBoxSidebar;
