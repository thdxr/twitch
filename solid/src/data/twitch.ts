import TwitchApi from "node-twitch";
import { Config } from "sst/node/config";

export const Twitch = new TwitchApi({
  client_id: Config.TWITCH_CLIENT_ID,
  client_secret: Config.TWITCH_CLIENT_SECRET,
});
