import { DeckShell } from "./components/DeckShell";
import { ExperienceShell } from "./components/experience/ExperienceShell";
import { Hero3dPreview } from "./components/Hero3dPreview";
import "./components/deck.css";

type AppView = "legacy" | "hero3d" | "experience";

function useAppView(): AppView {
  if (typeof window === "undefined") return "experience";
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (view === "legacy" || view === "static") return "legacy";
  if (view === "hero3d") return "hero3d";
  return "experience";
}

export default function App() {
  const view = useAppView();
  if (view === "legacy") return <DeckShell />;
  if (view === "hero3d") return <Hero3dPreview />;
  return <ExperienceShell />;
}
