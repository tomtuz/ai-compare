import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./assets/styles/base.css";
import { AppProvider } from "./context/AppContext.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "Failed to find the root element. Please check your HTML file for an element with id 'root'.",
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
