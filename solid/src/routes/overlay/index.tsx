import { styled } from "@macaron-css/solid";
import { createPolled } from "@solid-primitives/timer";
import { createMemo } from "solid-js";
import { useStream } from "~/data/stream";

const Root = styled("div", {
  base: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "end",
  },
});

const Bar = styled("div", {
  base: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    width: "100%",
    background: "hsl(0, 0%, 0%)",
    display: "flex",
    alignItems: "center",
    color: "white",
    padding: "0 40px",
    gap: 60,
  },
});

const Time = styled("div", {
  base: {
    fontSize: 22,
    fontWeight: 600,
  },
});

const Title = styled("div", {
  base: {
    fontSize: 18,
    fontWeight: 600,
  },
});

export default function Overlay() {
  const stream = useStream();

  const time = createPolled(
    () => Date.now() - new Date(stream()?.duration || 0).getTime(),
    500
  );
  const format = createMemo(() => {
    const hours = Math.floor(time() / 1000 / 60 / 60);
    const minutes = Math.floor(time() / 1000 / 60) % 60;
    const seconds = Math.floor(time() / 1000) % 60;
    return [hours, minutes, seconds]
      .filter(Boolean)
      .map((x) => x.toString().padStart(2, "0"))
      .join(":");
  });

  return (
    <Root>
      <Bar>
        <Time>{format()}</Time>
        <Title>{stream()?.title}</Title>
      </Bar>
    </Root>
  );
}
