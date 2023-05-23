import { AuthHandler, OauthAdapter } from "sst/node/future/auth";
import { Issuer } from "openid-client";
import { Config } from "sst/node/config";
import { Api } from "sst/node/api";
import { StaticAuthProvider, AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";

const s3 = new S3Client({});

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

    if (input.provider === "spotify") {
      console.log(input.tokenset.refresh_token);
      await s3.send(
        new PutObjectCommand({
          Bucket: Bucket.bucket.bucketName,
          Key: "spotify.json",
          Body: JSON.stringify({
            access_token: input.tokenset.access_token,
            refresh_token: input.tokenset.refresh_token,
          }),
        })
      );
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
    spotify: OauthAdapter({
      clientID: Config.SPOTIFY_CLIENT_ID,
      clientSecret: Config.SPOTIFY_CLIENT_SECRET,
      scope: "user-modify-playback-state",
      issuer: new Issuer({
        issuer: "https://accounts.spotify.com",
        authorization_endpoint: "https://accounts.spotify.com/authorize",
        token_endpoint: "https://accounts.spotify.com/api/token",
      }),
    }),
  },
});
