import { styled } from "@macaron-css/solid";
import { createMemo, Suspense } from "solid-js";
import { refetchRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { createPolled } from "@solid-primitives/timer";
import { Twitch } from "~/data/twitch";

import VIDEO from "./output.webm";
import { globalStyle } from "@macaron-css/core";

const Root = styled("div", {
  base: {
    position: "fixed",
    inset: 0,
    background: "black",
    padding: "8rem",
  },
  variants: {
    hidden: {
      true: {},
    },
  },
});

const TRANSITION_TIME = 500;

const VideoContainer = styled("div", {
  base: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: -100,
    transition: `${TRANSITION_TIME}ms all`,
  },
});

globalStyle(`${Root.selector({ hidden: true })} ${VideoContainer.toString()}`, {
  opacity: 0,
});

const Video = styled("video", {
  base: {
    opacity: 0.6,
    width: "100%",
    height: "auto",
  },
});
const Title = styled("div", {
  base: {
    fontSize: "5rem",
    color: "white",
    maxWidth: "70%",
    fontWeight: 600,
    transition: `${TRANSITION_TIME}ms all`,
  },
});

const Subtitle = styled("div", {
  base: {
    fontSize: "3rem",
    opacity: 0.8,
    color: "white",
    marginTop: "1rem",
    transition: `${TRANSITION_TIME}ms all`,
  },
});

globalStyle(
  `${Root.selector({ hidden: true })} ${Title}, ${Root.selector({
    hidden: true,
  })} ${Subtitle}`,
  {
    transform: "translateY(-30px)",
    opacity: 0,
  }
);

const Starting = styled("div", {
  base: {
    fontSize: "5rem",
    fontWeight: 600,
    position: "fixed",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    color: "white",
    opacity: 0,
    transform: "translateY(30px)",
  },
});

globalStyle(`${Root.selector({ hidden: true })} ${Starting}`, {
  transition: `${TRANSITION_TIME}ms all`,
  transform: "initial",
  opacity: 1,
});

export default function Intro() {
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
    };
  });

  createPolled(() => {
    refetchRouteData();
  }, 10000);

  const total = 1000 * 60 * 5;
  const start = Date.now() + total;

  const time = createPolled(() => start - Date.now(), 500);
  const minutes = createMemo(() => Math.floor(time() / 60 / 1000));
  const seconds = createMemo(() => Math.floor(time() / 1000) % 60);
  const ready = createMemo(() => {
    return minutes() <= 0 && seconds() <= 0;
  });

  return (
    <Root hidden={ready()}>
      <VideoContainer>
        <Video src={VIDEO} autoplay loop muted />
      </VideoContainer>
      <Suspense>
        <Title>{stream()?.title}</Title>
        <Subtitle>
          Starting in {minutes()}:{seconds().toString().padStart(2, "0")}
        </Subtitle>
      </Suspense>
      <Starting>Starting Now!</Starting>
    </Root>
  );
}
