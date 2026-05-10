import json
import uuid
import os
from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import PromptTemplate

# Tools

class GenerateShapeInput(BaseModel):
    type: str = Field(description="One of ['box', 'sphere', 'torus']")
    color: str = Field(description="Hex color code, e.g. #ff0000")
    scale: float = Field(description="Scale factor for the shape")

@tool("generate_procedural_shape", args_schema=GenerateShapeInput)
def generate_procedural_shape(type: str, color: str, scale: float) -> str:
    """Generates a basic 3D shape configuration (box, sphere, torus) with specified dimensions and color. Use this to create procedural 3D elements for a scene."""
    config = {
        "id": uuid.uuid4().hex[:7],
        "type": type,
        "color": color,
        "scale": scale,
        "generatedAt": datetime.utcnow().isoformat()
    }
    return json.dumps(config)

class FetchModelInput(BaseModel):
    query: str = Field(description="Search term for the 3D model, e.g., 'car', 'tree', 'robot'")

@tool("fetch_gltf_model", args_schema=FetchModelInput)
def fetch_gltf_model(query: str) -> str:
    """Fetches metadata for a free 3D GLTF model based on a search query."""
    print(f"[Tool] Searching for free GLTF model: {query}")
    return json.dumps({
        "status": "success",
        "query": query,
        "modelUrl": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf", # Mocked CC0 model
        "license": "CC0",
    })

class ScaffoldProjectInput(BaseModel):
    sceneName: str = Field(description="Name of the scene component")
    elements: List[str] = Field(description="List of elements to include, e.g. ['ambientLight', 'OrbitControls', 'Box']")

@tool("scaffold_r3f_scene", args_schema=ScaffoldProjectInput)
def scaffold_r3f_scene(sceneName: str, elements: List[str]) -> str:
    """Scaffolds a React Three Fiber scene component with given elements."""
    orbit_import = "import { OrbitControls } from '@react-three/drei';" if "OrbitControls" in elements else ""
    ambient_light = "<ambientLight intensity={0.5} />" if "ambientLight" in elements else ""
    orbit_controls = "<OrbitControls />" if "OrbitControls" in elements else ""
    
    code = f"""
import React from 'react';
import {{ Canvas }} from '@react-three/fiber';
{orbit_import}

export const {sceneName} = () => {{
  return (
    <Canvas>
      {ambient_light}
      {orbit_controls}
      {{/* Auto-generated content */}}
    </Canvas>
  );
}};
    """.strip()
    
    return f"Successfully scaffolded scene component {sceneName}. Code:\n{code}"

ai_tools = [generate_procedural_shape, fetch_gltf_model, scaffold_r3f_scene]

class CodeAgent:
    def __init__(self, api_key: str = None):
        self.executor = None
        key = api_key or os.getenv("GEMINI_API_KEY")
        
        if not key:
            print("No API key provided. Agent will run in mock mode.")
            return

        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=key,
        )

        template = """Answer the following questions as best you can. You are an expert 3D coding assistant. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}"""

        prompt = PromptTemplate.from_template(template)

        agent = create_react_agent(llm, ai_tools, prompt)
        
        self.executor = AgentExecutor(
            agent=agent, 
            tools=ai_tools, 
            verbose=True,
            handle_parsing_errors=True
        )

    def run(self, input_text: str) -> str:
        if not self.executor:
            print(f"[Mock Agent] reasoning about: {input_text}")
            if "scaffold" in input_text.lower():
                return scaffold_r3f_scene.invoke({"sceneName": "MyScene", "elements": ["ambientLight", "OrbitControls"]})
            return "Agent is running in mock mode. Please provide a Gemini API key via the GEMINI_API_KEY environment variable."

        print(f"[Agent] reasoning about: {input_text}")
        result = self.executor.invoke({"input": input_text})
        return result["output"]
