import { createSignal, Show } from "solid-js";
import PARIS_WAV from "../assets/paris.wav";
import type { Events } from "../../../core/src/realtime";
import { createQueue } from "../data/queue";
import { bus } from "../data/socket";
import confetti from "js-confetti";

let c = new confetti();
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    c.clearCanvas();
    // @ts-expect-error
    c = undefined;
  });
}

export function Notifications() {
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
