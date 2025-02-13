from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import BaseOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

load_dotenv()

app = FastAPI(title="ripple.ai")

# Configure CORS - update with your CodeSandbox frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiagramRequest(BaseModel):
    prompt: str
    diagram_type: Optional[str] = "flowchart"

class MermaidOutputParser(BaseOutputParser):
    def parse(self, text: str) -> str:
        # Remove any markdown code block syntax if present
        text = text.replace("```mermaid", "").replace("```", "").strip()
        
        # Validate that output is valid Mermaid syntax
        valid_starts = ["graph", "flowchart", "sequenceDiagram", "classDiagram", "stateDiagram"]
        if not any(text.strip().startswith(start) for start in valid_starts):
            raise ValueError("Output must be valid Mermaid syntax")
        return text

@app.get("/")
async def root():
    return {"message": "Welcome to ripple.ai API"}

@app.post("/api/generate-diagram")
async def generate_diagram(request: DiagramRequest):
    try:
        # Initialize the LLM chain
        llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Create prompt template for Mermaid generation
        mermaid_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at generating Mermaid diagram syntax. Always respond ONLY with valid Mermaid syntax.
            For flowcharts, use TD (top-down) direction and include clear node descriptions.
            Use appropriate shapes for different node types:
            - [] for process steps
            - {} for decision points
            - () for start/end points
            Never include any explanations or markdown, only the Mermaid syntax."""),
            ("human", "Generate a {diagram_type} diagram for the following description: {prompt}")
        ])
        
        # Create the chain with strict Mermaid output
        mermaid_chain = mermaid_prompt | llm | MermaidOutputParser()
        
        # Generate the diagram
        result = mermaid_chain.invoke({
            "prompt": request.prompt,
            "diagram_type": request.diagram_type
        })
        
        return {"mermaid_syntax": result}
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)