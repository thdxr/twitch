import { SSTConfig } from "sst";
import { Bucket, Api, Config, Function, StaticSite } from "sst/constructs";
import { Auth } from "sst/constructs/future";
import { CfnAuthorizer, CfnTopicRule } from "aws-cdk-lib/aws-iot";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";

export default {
  config(input) {
    const PROFILE: Record<string, string> = {
      staging: "ironbay-staging",
      production: "ironbay-production",
      default: "ironbay-dev",
    };
    return {
      name: "twitch",
      region: "us-east-1",
      profile: PROFILE[input.stage as keyof typeof PROFILE] || PROFILE.default,
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      permissions: ["iot"],
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
      nodejs: {
        sourcemap: true,
      },
    });
    app.stack(function App(ctx) {
      const zone =
        ctx.app.stage === "production" ? "thdxr.com" : "dev.thdxr.com";

      const secrets = Config.Secret.create(
        ctx.stack,
        "TWITCH_CLIENT_ID",
        "TWITCH_CLIENT_SECRET",
        "SPOTIFY_CLIENT_ID",
        "SPOTIFY_CLIENT_SECRET"
      );

      const bucket = new Bucket(ctx.stack, "bucket");

      const api = new Api(ctx.stack, "api", {
        routes: {
          "GET /": "packages/functions/src/lambda.handler",
          "POST /hook/twitch": "packages/functions/src/twitch.handler",
        },
        customDomain: {
          hostedZone: zone,
          domainName: "api.twitch." + zone,
        },
      });

      const auth = new Auth(ctx.stack, "auth", {
        authenticator: {
          handler: "packages/functions/src/auth.handler",
          bind: [
            secrets.TWITCH_CLIENT_ID,
            secrets.TWITCH_CLIENT_SECRET,
            secrets.SPOTIFY_CLIENT_ID,
            secrets.SPOTIFY_CLIENT_SECRET,
            api,
            bucket,
          ],
          nodejs: {
            install: ["@twurple/auth", "@twurple/api"],
          },
        },
        customDomain: {
          hostedZone: zone,
          domainName: "auth.twitch." + zone,
        },
      });

      const authorizerFn = new Function(ctx.stack, "authorizer-fn", {
        handler: "packages/functions/src/iot-auth.handler",
        environment: {
          ACCOUNT_ID: ctx.app.account,
        },
        permissions: ["iot"],
      });

      const authorizer = new CfnAuthorizer(ctx.stack, "authorizer", {
        status: "ACTIVE",
        authorizerName: ctx.app.logicalPrefixedName("authorizer"),
        authorizerFunctionArn: authorizerFn.functionArn,
        signingDisabled: true,
      });

      authorizerFn.addPermission("IOTPermission", {
        principal: new ServicePrincipal("iot.amazonaws.com"),
        sourceArn: authorizer.attrArn,
        action: "lambda:InvokeFunction",
      });

      const solid = new StaticSite(ctx.stack, "solid", {
        path: "packages/solid",
        buildOutput: "./dist",
        buildCommand: "pnpm build",
        customDomain: {
          hostedZone: zone,
          domainName: "twitch." + zone,
        },
        environment: {
          VITE_STAGE: ctx.app.stage,
        },
      });

      const eventHandler = new Function(ctx.stack, "event-handler", {
        handler: "./packages/functions/src/iot-event.handler",
        bind: [
          secrets.SPOTIFY_CLIENT_ID,
          secrets.SPOTIFY_CLIENT_SECRET,
          bucket,
        ],
      });
      eventHandler.grantInvoke(new ServicePrincipal("iot.amazonaws.com"));

      new CfnTopicRule(ctx.stack, "rule", {
        topicRulePayload: {
          sql: `SELECT * FROM '${ctx.app.name}/${ctx.app.stage}/#'`,
          actions: [
            {
              lambda: {
                functionArn: eventHandler.functionArn,
              },
            },
          ],
        },
      });
    });
  },
} satisfies SSTConfig;
