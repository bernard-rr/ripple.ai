from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import BaseOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import json
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
    prompt: str
    diagram_type: Optional[str] = "flowchart"

    @validator('prompt')
    def validate_prompt(cls, v):
        # Remove any null bytes or other control characters
        v = ''.join(char for char in v if ord(char) >= 32)
        return v

    class Config:
        json_encoders = {
            str: lambda v: json.dumps(v)[1:-1]  # Remove the surrounding quotes from json.dumps result
        }

class MermaidOutputParser(BaseOutputParser):
    def parse(self, text: str) -> str:
        text = text.replace("```mermaid", "").replace("```", "").strip()
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

@app.post("/api/generate-diagram")
async def generate_diagram(request: Request):
    try:
        # Log the raw request
        body = await request.body()
        body_str = body.decode()
        logger.debug(f"Received raw request body: {body_str}")

        # Parse JSON
        try:
            raw_data = json.loads(body_str)
            logger.debug(f"Parsed JSON data: {raw_data}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid JSON in request body: {str(e)}"
            )

        # Validate with Pydantic model
        diagram_request = DiagramRequest(**raw_data)
        logger.debug(f"Validated request data: {diagram_request.dict()}")
        
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
            "prompt": diagram_request.prompt,
            "diagram_type": diagram_request.diagram_type
        })
        
        return {"mermaid_syntax": result}
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)