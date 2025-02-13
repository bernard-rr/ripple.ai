"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface DiagramEditorProps {
  onGenerate: (prompt: string, diagramType: string) => Promise<void>;
  isLoading: boolean;
}

export function DiagramEditor({ onGenerate, isLoading }: DiagramEditorProps) {
  const [prompt, setPrompt] = useState("");
  const [diagramType, setDiagramType] = useState("flowchart");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt, diagramType);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select value={diagramType} onValueChange={setDiagramType}>
          <SelectTrigger>
            <SelectValue placeholder="Select diagram type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flowchart">Flowchart</SelectItem>
            <SelectItem value="sequenceDiagram">Sequence Diagram</SelectItem>
            <SelectItem value="stateDiagram">State Diagram</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your diagram flow..."
          className="min-h-[200px]"
        />

        <Button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? "Generating..." : "Generate Diagram"}
        </Button>
      </form>
    </div>
  );
}
