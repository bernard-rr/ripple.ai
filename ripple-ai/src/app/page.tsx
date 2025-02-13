"use client";

import { DiagramEditor } from "@/components/DiagramEditor";
import { DiagramRenderer } from "@/components/DiagramRenderer";
import { Header } from "@/components/Header";
import { ErrorBoundary } from "react-error-boundary";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export default function Home() {
  const [diagram, setDiagram] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = useCallback(
    async (prompt: string, diagramType: string) => {
      setIsLoading(true);
      try {
        // Get the current hostname to determine the backend URL
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

        const response = await fetch(`${backendUrl}/api/generate-diagram`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add CORS headers
            Accept: "application/json",
          },
          body: JSON.stringify({ prompt, diagram_type: diagramType }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate diagram: ${response.statusText}`);
        }

        const data = await response.json();
        setDiagram(data.mermaid_syntax);
        toast.success("Diagram generated successfully!");
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to generate diagram. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <div className="grid gap-8 md:grid-cols-2">
            <DiagramEditor onGenerate={handleGenerate} isLoading={isLoading} />
            <DiagramRenderer diagram={diagram} />
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
