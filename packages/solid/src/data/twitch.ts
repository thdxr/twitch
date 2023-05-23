import { createSignal } from "solid-js";
import { bus } from "./socket";

export const [title, setTitle] = createSignal("");

bus.on("twitch.channel.update", (properties) => {
  console.log(properties);
  setTitle(properties.title);
});
