import { DeckShell } from "./components/DeckShell";
import { ExperienceShell } from "./components/experience/ExperienceShell";
import "./components/deck.css";

function useLegacyView(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("view") === "legacy") return true;
  // Constrained / forced static path for QA.
  if (params.get("view") === "static") return true;
  return false;
}

export default function App() {
  const legacy = useLegacyView();
  return legacy ? <DeckShell /> : <ExperienceShell />;
}
