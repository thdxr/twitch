import { makeEventListener } from "@solid-primitives/event-listener";
import { createSignal } from "solid-js";

export const [scene, setScene] = createSignal<
  "Code" | "Camera" | "Waiting" | "Zuko"
>("Waiting");

if (window.obsstudio)
  window.obsstudio.getCurrentScene((scene) => {
    setScene(scene.name as any);
  });

makeEventListener(window, "obsSceneChanged", (event) => {
  const evt = event as Event & CustomEvent<OBSSceneInfo>;
  setScene(evt.detail.name as any);
});
