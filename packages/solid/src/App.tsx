import "./data/socket";
import { Component, Match, Switch } from "solid-js";
import { Notifications } from "./overlay/Notifications";
import { Zuko } from "./scenes/Zuko";
import { Break } from "./scenes/Break";
import { Intro } from "./scenes/Intro";
import { scene } from "./data/obs";
import { Footer } from "./overlay/Footer";

const App: Component = () => {
  return (
    <>
      <Switch>
        <Match when={scene() === "Intro"}>
          <Intro />
        </Match>
        <Match when={scene() === "Break"}>
          <Break />
        </Match>
        <Match when={scene() === "Zuko"}>
          <Zuko />
        </Match>
      </Switch>
      <Notifications />
      <Footer />
    </>
  );
};

export default App;
