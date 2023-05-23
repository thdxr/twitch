import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Events, Payloads } from "@twitch/core/realtime";
import { Client } from "spotify-api.js";
import { Bucket } from "sst/node/bucket";
import { Config } from "sst/node/config";

export async function handler(evt: Payloads) {
  console.log(evt);
  if (
    evt.type === "twitch.channel.channel_points_custom_reward_redemption.add" &&
    evt.properties.reward.title === "Song Request"
  ) {
    console.log(
      "song request",
      evt.properties.user_input,
      "from",
      evt.properties.user_login
    );
    const splits = evt.properties.user_input.split("/");
    const track = "spotify:track:" + splits[4].split("?")[0];
    const s3 = new S3Client({});
    const result = JSON.parse(
      await s3
        .send(
          new GetObjectCommand({
            Bucket: Bucket.bucket.bucketName,
            Key: "spotify.json",
          })
        )
        .then((x) => x.Body!.transformToString())
    );
    console.log("credentials", result);
    const client = await Client.create({
      refreshToken: true,
      userAuthorizedToken: true,
      onRefresh: () => {
        console.log("token was refreshed");
      },
      token: {
        token: result.access_token,
        refreshToken: result.refresh_token,
        clientID: Config.SPOTIFY_CLIENT_ID,
        clientSecret: Config.SPOTIFY_CLIENT_SECRET,
      },
    });

    const played = await client.user.player.addItem(track);
    await s3.send(
      new PutObjectCommand({
        Bucket: Bucket.bucket.bucketName,
        Key: "spotify.json",
        Body: JSON.stringify({
          access_token: client.token,
          refresh_token: client.refreshMeta?.refreshToken,
        }),
      })
    );
    console.log(played);
  }
}
