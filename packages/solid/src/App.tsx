import {
  Component,
  createSignal,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
} from "solid-js";
import "./data/socket";
import { bus } from "./data/socket";
import confetti from "js-confetti";

let c = new confetti();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    c.clearCanvas();
    // @ts-expect-error
    c = undefined;
  });
}

const App: Component = () => {
  return (
    <>
      <Switch>
        <Match when={scene() === "Waiting"}>
          <Waiting />
        </Match>
        <Match when={scene() === "Zuko"}>
          <Zuko />
        </Match>
      </Switch>
      <Notifications />
    </>
  );
};

import PARIS_WAV from "./assets/paris.wav";
import { Events } from "../../core/src/realtime";
import { Waiting } from "./scenes/Waiting";
import { Zuko } from "./scenes/Zuko";
import { scene } from "./data/obs";
import { createQueue } from "./data/queue";

function Notifications() {
  const [follower, setFollower] =
    createSignal<Events["twitch.channel.follow"]>();

  const paris = new Audio(PARIS_WAV);

  const queue = createQueue();

  bus.on("twitch.channel.follow", async (properties) => {
    queue.add(async () => {
      paris.play();
      setFollower(properties);
      await c.addConfetti({
        confettiRadius: 6,
        confettiColors: ["white"],
        confettiNumber: 100,
      });
      c.clearCanvas();
      await new Promise((r) => setTimeout(r, 1000));
      setFollower();
    });
  });

  onMount(() => {});
  onCleanup(() => {});

  return (
    <div
      classList={{
        "opacity-0": !follower(),
      }}
      class={`transition-all duration-300 fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center p-8`}
    >
      <Show when={follower()}>
        <div class="p-8 bg-black text-5xl text-[white] font-bold">
          New follower {follower()!.user_login}!
        </div>
      </Show>
    </div>
  );
}

export default App;
