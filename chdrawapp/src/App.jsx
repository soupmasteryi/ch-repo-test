import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import Whiteboard from "./components/Whiteboard/Whiteboard";

const COLORS = [
  "#000000",
  "#ffffff",
  "#e63946",
  "#f4a261",
  "#f9c74f",
  "#2a9d8f",
  "#1d7be3",
  "#7b2ff7",
];

export default function App() {
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState(COLORS[0]);

  return (
    <div className="app">
      <Sidebar
        tool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        colors={COLORS}
      />
      <Whiteboard tool={tool} color={color} />
    </div>
  );
}
