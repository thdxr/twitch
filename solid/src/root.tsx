// @refresh reload
import "@fontsource/jetbrains-mono/latin.css";
import { globalStyle } from "@macaron-css/core";
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";

globalStyle("body", {
  margin: 0,
});

globalStyle("a", {
  color: "inherit",
  textDecoration: "none",
});

globalStyle("input, textarea", {
  outline: 0,
});

globalStyle("*", {
  boxSizing: "border-box",
  fontFamily: "JetBrains Mono",
  cursor: "default",
});

globalStyle("*:focus", {
  outline: 0,
});

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>thdxr</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
