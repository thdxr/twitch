import { iot, mqtt } from "aws-iot-device-sdk-v2";
import { createEmitter, createEventBus } from "@solid-primitives/event-bus";
import { Events } from "../../../core/src/realtime";

const Config = (() => {
  if (import.meta.env.VITE_STAGE === "production")
    return {
      endpoint: "a2qd0131sa3np9-ats.iot.us-east-1.amazonaws.com",
      authorizer: "production-twitch-authorizer",
    };

  return {
    endpoint: "a38npzxl5ie9zp-ats.iot.us-east-1.amazonaws.com",
    authorizer: `${import.meta.env.VITE_STAGE}-twitch-authorizer`,
  };
})();

const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
  .with_clean_session(true)
  .with_client_id("client_" + Date.now().toString())
  .with_endpoint(Config.endpoint)
  .with_custom_authorizer("", Config.authorizer, "", "")
  .with_keep_alive_seconds(30)
  .build();

const client = new mqtt.MqttClient();
const connection = client.new_connection(config);

export const bus = createEmitter<Events>();

connection.on("connect", console.log);
connection.on("interrupt", console.log);
connection.on("error", console.log);
connection.on("resume", console.log);
connection.on("message", (_topic, payload) => {
  const message = new TextDecoder("utf8").decode(new Uint8Array(payload));
  const parsed = JSON.parse(message);
  bus.emit(parsed.type, parsed.properties);
});
connection.on("disconnect", console.log);

connection.connect();
connection.subscribe(
  `twitch/${import.meta.env.VITE_STAGE}/#`,
  mqtt.QoS.AtLeastOnce
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    connection.disconnect();
  });
}

/*
// @ts-expect-error
import { Client, Message } from "paho-mqtt";

const client = new Client(
  `wss://a38npzxl5ie9zp-ats.iot.us-east-2.amazonaws.com/mqtt?x-amz-customauthorizer-name=thdxr-twitch-authorizer`,
  "client_" + Date.now().toString()
);

client.onMessageDelivered = console.log;
client.onConnectionLost = console.log;
client.connect({
  useSSL: true,
  mqttVersion: 4,
  reconnect: true,
  onSuccess: console.log,
  onFailure: console.log,
});
*/
