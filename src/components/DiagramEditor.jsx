import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DiagramEditor({ onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState("");
  const [diagramType, setDiagramType] = useState("flowchart");

  const handleSubmit = (e) => {
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
