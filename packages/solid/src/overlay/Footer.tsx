import { Match, Show } from "solid-js";
import { scene } from "../data/obs";

export function Footer() {
  return (
    <Show when={["Code", "Camera"].includes(scene()) || true}>
      <div class="fixed h-20 bg-[#161618] text-lg text-[#ededef] bottom-0 left-0 right-0 flex items-center px-10 justify-between">
        <div>weekend bs</div>
        <div class="flex gap-4 items-center">
          <div>
            <div class="font-bold">Cocoon</div>
            <div class="text-sm">070 Shake</div>
          </div>
          <div class="bg-white border-l-4 border-l-primary ">
            <div
              class="w-[60px] aspect-square bg-cover"
              style={{
                "background-image": `url(https://i1.sndcdn.com/artworks-MjbtFtfpNfsi-0-t500x500.jpg)`,
              }}
            />
          </div>
        </div>
      </div>
    </Show>
  );
}
