import { createSignal } from "solid-js";
import { createQueue } from "../data/queue";
import { bus } from "../data/socket";
import WOLVES_WAV from "../assets/wolves.wav";
import { scene } from "../data/obs";

const rewards = createQueue();
bus.on(
  "twitch.channel.channel_points_custom_reward_redemption.add",
  (props) => {
    if (props.reward.title === "Zuko Cam") {
      rewards.add(async () => {
        const old = scene();
        if (old === "Waiting") return;
        window.obsstudio.setCurrentScene("Zuko");
        await new Promise((r) => setTimeout(r, 1000 * 10));
        window.obsstudio.setCurrentScene(old!);
        await new Promise((r) => setTimeout(r, 3000));
      });
    }
  }
);

export function Zuko() {
  const [show, setShow] = createSignal(false);
  const wolves = new Audio(WOLVES_WAV);
  // wolves.play();

  setTimeout(() => {
    setShow(true);
  }, 1000);

  return (
    <div
      classList={{
        "opacity-0": show(),
      }}
      class="absolute inset-0 transition-all duration-500 text-white justify-center items-center flex text-[200px] font-extrabold uppercase tracking-[40px]"
    >
      Zuko Cam
    </div>
  );
}
