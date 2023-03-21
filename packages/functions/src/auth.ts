import { AuthHandler, OauthAdapter } from "sst/node/future/auth";
import { Issuer } from "openid-client";
import { Config } from "sst/node/config";
import { Api } from "sst/node/api";
import { StaticAuthProvider, AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

export const handler = AuthHandler({
  async clients() {
    return {
      local: "http://localhost.com",
    };
  },
  onError: async () => ({
    statusCode: 400,
  }),
  onSuccess: async (input) => {
    if (input.provider === "twitch") {
      const twitch = new ApiClient({
        authProvider: new AppTokenAuthProvider(
          Config.TWITCH_CLIENT_ID,
          Config.TWITCH_CLIENT_SECRET
        ),
      });

      const user = "171736472";
      const types: [string, string][] = [
        ["channel.follow", "2"],
        ["channel.channel_points_custom_reward_redemption.add", "1"],
        ["channel.subscribe", "1"],
        ["channel.update", "1"],
      ];
      const existing = await twitch.eventSub.getSubscriptionsForUser(user);
      const callback = Api.api.url + "/hook/twitch";
      console.log("Using callback", callback);
      for (const [type, version] of types) {
        if (
          existing.data.find(
            (sub) =>
              sub._transport.method === "webhook" &&
              sub._transport.callback === callback &&
              sub.type === type
          )
        ) {
          console.log("Subscription for " + type + " already exists");
          continue;
        }
        await twitch.eventSub.createSubscription(
          type,
          version,
          {
            broadcaster_user_id: user,
            moderator_user_id: user,
          },
          {
            secret: "0123456789",
            method: "webhook",
            callback,
          }
        );
        console.log("Created subscription for " + type);
      }
    }

    return {
      type: "public",
      properties: {},
    };
  },
  providers: {
    twitch: OauthAdapter({
      issuer: await Issuer.discover("https://id.twitch.tv/oauth2"),
      clientID: Config.TWITCH_CLIENT_ID,
      clientSecret: Config.TWITCH_CLIENT_SECRET,
      scope:
        "user:read:follows channel:moderate chat:edit chat:read channel:read:redemptions",
    }),
  },
});
