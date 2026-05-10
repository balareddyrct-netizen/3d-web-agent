import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const generateShapeTool = new DynamicStructuredTool({
  name: "generate_procedural_shape",
  description: "Generates a basic 3D shape configuration (box, sphere, torus) with specified dimensions and color. Use this to create procedural 3D elements for a scene.",
  schema: z.object({
    type: z.enum(["box", "sphere", "torus"]),
    color: z.string().describe("Hex color code, e.g. #ff0000"),
    scale: z.number().describe("Scale factor for the shape"),
  }),
  func: async ({ type, color, scale }) => {
    // Returns a JSON config for the UI to render via R3F
    const config = {
      id: Math.random().toString(36).substring(7),
      type,
      color,
      scale,
      generatedAt: new Date().toISOString()
    };
    return JSON.stringify(config);
  },
});

export const fetchModelTool = new DynamicStructuredTool({
  name: "fetch_gltf_model",
  description: "Fetches metadata for a free 3D GLTF model based on a search query.",
  schema: z.object({
    query: z.string().describe("Search term for the 3D model, e.g., 'car', 'tree', 'robot'"),
  }),
  func: async ({ query }) => {
    console.log(`[Tool] Searching for free GLTF model: ${query}`);
    return JSON.stringify({
      status: "success",
      query,
      modelUrl: `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf`, // Mocked CC0 model
      license: "CC0",
    });
  },
});

export const scaffoldProjectTool = new DynamicStructuredTool({
  name: "scaffold_r3f_scene",
  description: "Scaffolds a React Three Fiber scene component with given elements.",
  schema: z.object({
    sceneName: z.string().describe("Name of the scene component"),
    elements: z.array(z.string()).describe("List of elements to include, e.g. ['ambientLight', 'OrbitControls', 'Box']"),
  }),
  func: async ({ sceneName, elements }) => {
    const code = `
import React from 'react';
import { Canvas } from '@react-three/fiber';
${elements.includes('OrbitControls') ? "import { OrbitControls } from '@react-three/drei';" : ""}

export const ${sceneName} = () => {
  return (
    <Canvas>
      ${elements.includes('ambientLight') ? '<ambientLight intensity={0.5} />' : ''}
      ${elements.includes('OrbitControls') ? '<OrbitControls />' : ''}
      {/* Auto-generated content */}
    </Canvas>
  );
};
    `.trim();
    
    return `Successfully scaffolded scene component ${sceneName}. Code:\n${code}`;
  },
});

export const aiTools = [generateShapeTool, fetchModelTool, scaffoldProjectTool];
