import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Canvas } from '@react-three/fiber';
import { useAgentStore } from '@3d-ai-agent/state';

const BACKEND_URL = 'http://127.0.0.1:8000'; // Python backend URLs

function Scene() {
  const messages = useAgentStore((state) => state.messages);
  
  const shapes = messages
    .filter((m) => m.role === 'agent' && m.content.includes('"type":'))
    .map((m) => {
      try {
        return JSON.parse(m.content);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {shapes.length === 0 && (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#4f46e5" />
        </mesh>
      )}

      {shapes.map((shape: any, idx: number) => {
        const position: [number, number, number] = [idx * 2, 0, 0];
        if (shape.type === 'box') {
          return (
            <mesh key={shape.id || idx} position={position} scale={shape.scale || 1}>
              <boxGeometry />
              <meshStandardMaterial color={shape.color || '#ffffff'} />
            </mesh>
          );
        }
        if (shape.type === 'sphere') {
          return (
            <mesh key={shape.id || idx} position={position} scale={shape.scale || 1}>
              <sphereGeometry />
              <meshStandardMaterial color={shape.color || '#ffffff'} />
            </mesh>
          );
        }
        if (shape.type === 'torus') {
          return (
            <mesh key={shape.id || idx} position={position} scale={shape.scale || 1}>
              <torusGeometry />
              <meshStandardMaterial color={shape.color || '#ffffff'} />
            </mesh>
          );
        }
        return null;
      })}
    </>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const { messages, addMessage, isThinking, setThinking } = useAgentStore();

  const handleSend = async () => {
    if (!prompt.trim() || isThinking) return;
    
    addMessage({ role: 'user', content: prompt });
    setPrompt('');
    setThinking(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      addMessage({ role: 'agent', content: data.response });
    } catch (error) {
      addMessage({ role: 'agent', content: `Error: ${error}` });
    } finally {
      setThinking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI 3D Agent Brain</Text>
      </View>
      
      <View style={styles.canvasContainer}>
        <Canvas>
          <Scene />
        </Canvas>
      </View>

      <ScrollView style={styles.chatArea}>
        {messages.map((msg, idx) => (
          <View key={idx} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.agentBubble]}>
            <Text style={styles.messageRole}>{msg.role.toUpperCase()}</Text>
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
        {isThinking && <Text style={styles.thinkingText}>Thinking...</Text>}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Ask agent..." 
          placeholderTextColor="#94a3b8"
          value={prompt}
          onChangeText={setPrompt}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isThinking}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  canvasContainer: {
    height: 300,
    backgroundColor: '#1e293b',
  },
  chatArea: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
  },
  agentBubble: {
    backgroundColor: '#334155',
    alignSelf: 'flex-start',
  },
  messageRole: {
    color: '#cbd5e1',
    fontSize: 10,
    marginBottom: 4,
  },
  messageText: {
    color: '#f8fafc',
    fontSize: 14,
  },
  thinkingText: {
    color: '#94a3b8',
    fontStyle: 'italic',
    padding: 8,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1e293b',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    height: 40,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
    height: 40,
  },
  sendButtonText: {
    color: '#f8fafc',
    fontWeight: 'bold',
  },
});
