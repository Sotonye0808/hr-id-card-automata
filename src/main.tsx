import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const savedTheme =
  typeof window !== "undefined"
    ? localStorage.getItem("hr-id-card-automata.theme")
    : null;

if (savedTheme === "dark") {
  document.documentElement.dataset.theme = "dark";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
