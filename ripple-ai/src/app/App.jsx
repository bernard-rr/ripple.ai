import React, { useState, useCallback } from 'react';
import { DiagramEditor } from './components/DiagramEditor';
import { DiagramRenderer } from './components/DiagramRenderer';
import { Header } from './components/Header';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster, toast } from 'sonner';

export default function App() {
  const [diagram, setDiagram] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = useCallback(async (prompt, diagramType) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://f6l4fd-8000.csb.app/api/generate-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, diagram_type: diagramType }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diagram');
      }

      const data = await response.json();
      setDiagram(data.mermaid_syntax);
    } catch (error) {
      toast.error('Error generating diagram');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      <Toaster position="top-right" />
    </div>
  );
}