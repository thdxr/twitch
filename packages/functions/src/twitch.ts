import { ApiHandler, useHeader, useJsonBody } from "sst/node/api";
import { Realtime } from "@twitch/core/realtime";

export const handler = ApiHandler(async () => {
  const type = useHeader("twitch-eventsub-message-type");
  const body = useJsonBody();
  switch (type) {
    case "webhook_callback_verification":
      return {
        statusCode: 200,
        body: body.challenge,
      };
    case "notification":
      await Realtime.publish(
        `twitch.${body.subscription.type}` as any,
        body.event
      );
  }
  return {
    statusCode: 200,
    body: `ok`,
  };
});
