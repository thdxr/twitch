import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
} from "solid-js";
import { title } from "../data/twitch";

export function Intro() {
  const DURATION = 1000 * 60 * 7;
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

  const isCompleted = createMemo(() => diff() === 0);

  createEffect(() => {
    if (!isCompleted()) return;
    setTimeout(() => {
      window.obsstudio.setCurrentScene("Camera");
    }, 1000);
  });

  onCleanup(() => clearInterval(timer));

  return (
    <div class="absolute flex inset-0 bg-[black] justify-center items-center flex-col leading-none">
      <div
        classList={{
          "opacity-0": isCompleted(),
        }}
        class={`flex flex-col gap-16 transition-all duration-1000`}
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
            <div>{title()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
