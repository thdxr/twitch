import {
  Component,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { createEventListener } from "@solid-primitives/event-listener";
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
  const [scene, setScene] = createSignal<"Code" | "Camera" | "Waiting">();

  createEventListener(window, "obsSceneChanged", (event) => {
    const evt = event as Event & CustomEvent<OBSSceneInfo>;
    setScene(evt.detail.name as any);
  });

  return (
    <>
      <Switch>
        <Match when={scene() === "Waiting"}>
          <Waiting />
        </Match>
      </Switch>
      <Notifications />
    </>
  );
};

import PARIS_WAV from "./assets/paris.wav";
import { Events } from "../../core/src/realtime";

type QueueCallback = () => Promise<void>;
function createQueue() {
  const queue = new Array<QueueCallback>();

  let pending = false;
  async function trigger() {
    if (pending) return;
    const cb = queue.shift();
    if (!cb) return;
    pending = true;
    await cb();
    pending = false;
    trigger();
  }

  return {
    add: (cb: QueueCallback) => {
      queue.push(cb);
      trigger();
    },
  };
}

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

function Waiting() {
  const DURATION = 1000 * 60 * 17;
  const [diff, setDiff] = createSignal(DURATION);
  const minutes = createMemo(() =>
    Math.floor(diff() / 60000)
      .toString()
      .padStart(2, "0")
  );
  const seconds = createMemo(() =>
    Math.floor((diff() % 60000) / 1000)
      .toString()
      .padStart(2, "0")
  );

  const timer = setInterval(() => {
    setDiff((v) => Math.max(0, v - 1000));
  }, 1000);

  onCleanup(() => clearInterval(timer));

  return (
    <div class="absolute flex inset-0 bg-[black] justify-center items-center flex-col leading-none">
      <div
        class={`flex flex-col gap-16 transition-all duration-1000 ${
          diff() === 0 && "opacity-0"
        }`}
      >
        <div class="text-white flex gap-48 text-[200px] font-extrabold justify-between">
          <div>T</div>
          <div>H</div>
          <div>D</div>
          <div>X</div>
          <div>R</div>
        </div>
        <div class="bg-white text-[black] w-full justify-between leading-none text-[200px] font-extrabold p-16 flex ">
          <div class="flex-1 text-left">{minutes()[0]}</div>
          <div class="flex-1 text-left">{minutes()[1]}</div>
          <div class="flex-grow flex justify-between items-center">
            <For each={Array(7)}>
              {(_, index) => (
                <div
                  style={{
                    "animation-delay": index() * 100 + "ms",
                    "animation-duration": "1000ms",
                  }}
                  class="w-2 animate-bounce h-1/4 bg-[black] rounded-md"
                />
              )}
            </For>
          </div>
          <div class="flex-1 text-right">{seconds()[0]}</div>
          <div class="flex-1 text-right">{seconds()[1]}</div>
        </div>
        <div class="text-white flex font-bold justify-center text-[40px] uppercase tracking-[10px]">
          <div class="flex items-center gap-8">
            <div>building twitch stuff on twitch</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
