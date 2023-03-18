import { ApiHandler } from "sst/node/api";
import { Time } from "@twitch/core/time";

export const handler = ApiHandler(async (evt) => {
  console.log(evt);
  return {
    statusCode: 200,
    body: `Hello world. The time is ${Time.now()}`,
  };
});
