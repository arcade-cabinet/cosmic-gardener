import React from "react";
import { createRoot } from "react-dom/client";
import "@/theme/global.css";
import "@/theme/tw.css";
import { AudioProvider } from "@/audio/useAudio";
import Game from "@/ui/Game";

const mountNode = document.getElementById("root");
if (!mountNode) {
  throw new Error("Missing #root element — check index.html");
}

createRoot(mountNode).render(
  <React.StrictMode>
    <AudioProvider>
      <Game />
    </AudioProvider>
  </React.StrictMode>
);
