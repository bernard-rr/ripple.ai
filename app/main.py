from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import BaseOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="ripple.ai")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiagramRequest(BaseModel):
    prompt: str = Field(
        ..., 
        description="Description of the diagram to generate",
        example="A customer places an order through a website. The system checks inventory. If available, process payment."
    )
    diagram_type: Optional[str] = Field(
        default="flowchart",
        description="Type of diagram (flowchart, sequenceDiagram, classDiagram, stateDiagram)",
        example="flowchart"
    )

class DiagramResponse(BaseModel):
    mermaid_syntax: str = Field(
        ...,
        description="Generated Mermaid diagram syntax",
        example="flowchart TD\n  A[Start] --> B[Process]\n  B --> C[End]"
    )

class MermaidOutputParser(BaseOutputParser):
    def parse(self, text: str) -> str:
        # Remove markdown and quotes from output syntax only
        text = text.replace("```mermaid", "").replace("```", "").strip()
        text = text.replace('"', '').replace("'", '')
        
        valid_starts = ["graph", "flowchart", "sequenceDiagram", "classDiagram", "stateDiagram"]
        if not any(text.strip().startswith(start) for start in valid_starts):
            raise ValueError("Output must be valid Mermaid syntax")
        return text

system_prompt = """You are an expert at generating Mermaid diagram syntax. Always respond ONLY with valid Mermaid syntax.
For flowcharts, use TD (top-down) direction and include clear node descriptions.
Use appropriate shapes for different node types:
- [] for process steps
- {{}} for decision points
- () for start/end points
Never include any explanations or markdown, only the Mermaid syntax."""

human_prompt = """Generate a {diagram_type} diagram for the following description: {prompt}"""

mermaid_prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", human_prompt)
])

@app.post("/api/generate-diagram", response_model=DiagramResponse, 
    summary="Generate Mermaid Diagram",
    description="Generates a Mermaid diagram based on the provided text description")
async def generate_diagram(request: DiagramRequest):
    """
    Generate a Mermaid diagram based on the provided description.
    
    - **prompt**: Text description of what you want to diagram
    - **diagram_type**: Type of diagram to generate (default: flowchart)
    
    Returns the generated Mermaid diagram syntax.
    """
    try:
        # Initialize the LLM chain
        llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,
            max_tokens=2000,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Create the chain with Mermaid output
        mermaid_chain = mermaid_prompt | llm | MermaidOutputParser()
        
        # Generate the diagram
        result = mermaid_chain.invoke({
            "prompt": request.prompt,
            "diagram_type": request.diagram_type
        })
        
        return DiagramResponse(mermaid_syntax=result)
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Check the health status of the API"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)