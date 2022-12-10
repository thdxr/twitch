import { App, Function, SolidStartSite, StackContext } from "sst/constructs";
import { Secret } from "sst/constructs/Secret.js";

export default function (app: App) {
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
  });
  app.stack(Stack);
}

export function Stack({ stack }: StackContext) {
  const site = new SolidStartSite(stack, "site", {
    path: "solid",
    waitForInvalidation: false,
  });

  // Temporary, we'll expose this properly soon
  (site.cdk.function as Function).bind([
    new Secret(stack, "TWITCH_CLIENT_ID"),
    new Secret(stack, "TWITCH_CLIENT_SECRET"),
  ]);

  stack.addOutputs({
    SITE_URL: site.url,
  });
}
