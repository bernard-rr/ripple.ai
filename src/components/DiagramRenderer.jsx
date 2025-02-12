import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DiagramRenderer({ diagram }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (diagram && containerRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.render("diagram", diagram).then(({ svg }) => {
        containerRef.current.innerHTML = svg;
      });
    }
  }, [diagram]);

  const handleDownload = async (format) => {
    if (!diagram) return;

    if (format === "svg") {
      const svgBlob = new Blob([containerRef.current.innerHTML], {
        type: "image/svg+xml",
      });
      const url = URL.createObjectURL(svgBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagram.svg";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "png") {
      const svg = containerRef.current.querySelector("svg");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);

        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "diagram.png";
        a.click();
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => handleDownload("svg")}
          disabled={!diagram}
          variant="outline"
          size="sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Download SVG
        </Button>
        <Button
          onClick={() => handleDownload("png")}
          disabled={!diagram}
          variant="outline"
          size="sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Download PNG
        </Button>
      </div>

      <div
        ref={containerRef}
        className="p-4 bg-white rounded-lg shadow min-h-[400px] flex items-center justify-center"
      >
        {!diagram && (
          <div className="text-gray-400">
            Generated diagram will appear here
          </div>
        )}
      </div>
    </div>
  );
}
