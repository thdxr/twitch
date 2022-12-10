import { createPolled } from "@solid-primitives/timer";
import { refetchRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { Twitch } from "./twitch";

export function useStream() {
  const stream = createServerData$(async () => {
    const [streams, videos] = await Promise.all([
      Twitch.getStreams({
        channel: "171736472",
      }),
      Twitch.getVideos({
        user_id: "171736472",
      }),
    ]);
    return {
      title: streams.data[0]?.title || videos.data[0]?.title,
      duration: streams.data[0]?.started_at || videos.data[0]?.published_at,
    };
  });

  createPolled(() => {
    refetchRouteData();
  }, 10000);
  return stream;
}
