import { createSignal, Show } from "solid-js";
import type { Events } from "../../../core/src/realtime";
import { createQueue } from "../data/queue";
import { bus } from "../data/socket";
import confetti from "js-confetti";
// import "@fontsource/bangers/latin.css";
// import "@fontsource/orbitron/latin.css";
// import "@fontsource/audiowide/latin.css";
// import "@fontsource/nabla/latin.css";
// import "@fontsource/raleway-dots/latin.css";
// import "@fontsource/bungee-inline/latin.css";

let c = new confetti();
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    c.clearCanvas();
    // @ts-expect-error
    c = undefined;
  });
}

import FOLLOW_SOUND from "../assets/annihilate.wav";
import SUBSCRIBE_VIDEO from "../assets/subscribe.mp4";

export function Notifications() {
  const [follower, setFollower] =
    createSignal<Events["twitch.channel.follow"]>();
  const paris = new Audio(FOLLOW_SOUND);
  const queue = createQueue();

  let subscribeVideo!: HTMLVideoElement;

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

  bus.on("twitch.channel.subscribe", async (properties) => {
    queue.add(async () => {
      subscribeVideo.classList.add("opacity-100");
      await subscribeVideo.play();
      await new Promise((r) => setTimeout(r, 4000));
      subscribeVideo.classList.remove("opacity-100");
      await new Promise((r) => setTimeout(r, 4000));
      subscribeVideo.pause();
      subscribeVideo.currentTime = 0;
    });
  });

  return (
    <>
      <div
        classList={{
          "opacity-0": !follower(),
        }}
        class={`transition-all duration-300 fixed inset-0 bg-[rgba(0,0,0,0.8)] items-end flex justify-center p-8`}
      >
        <Show when={follower()}>
          <div class="p-8 bg-black text-6xl text-[white] font-bold">
            new follower {follower()!.user_login}!
          </div>
        </Show>
      </div>
      <video
        ref={subscribeVideo}
        class="fixed inset-0 opacity-0 transition-all duration-300"
        src={SUBSCRIBE_VIDEO}
      />
    </>
  );
}
