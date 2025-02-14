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
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

        // Prepare the payload
        const payload = {
          prompt: prompt,
          diagram_type: diagramType,
        };

        // Log the payload before sending
        console.log("Sending payload:", {
          url: `${backendUrl}/api/generate-diagram`,
          method: "POST",
          payload: JSON.stringify(payload, null, 2),
        });

        const response = await fetch(`${backendUrl}/api/generate-diagram`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Log the response status and headers
        console.log("Response status:", response.status);
        console.log(
          "Response headers:",
          Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);

          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage =
              errorData?.detail ||
              `Failed to generate diagram: ${response.statusText}`;
          } catch {
            errorMessage = `Failed to generate diagram: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Response data:", data);

        setDiagram(data.mermaid_syntax);
        toast.success("Diagram generated successfully!");
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to generate diagram. Please try again."
        );
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
