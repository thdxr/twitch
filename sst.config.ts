import { SSTConfig } from "sst";
import { Api, Config, Function, StaticSite } from "sst/constructs";
import { Auth } from "sst/constructs/future";
import { CfnAuthorizer } from "aws-cdk-lib/aws-iot";
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

      const twitch = Config.Secret.create(
        ctx.stack,
        "TWITCH_CLIENT_ID",
        "TWITCH_CLIENT_SECRET"
      );

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
          bind: [twitch.TWITCH_CLIENT_ID, twitch.TWITCH_CLIENT_SECRET, api],
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
    });
  },
} satisfies SSTConfig;
