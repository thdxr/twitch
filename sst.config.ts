import { SSTConfig } from "sst";
import { Api, Function, StaticSite } from "sst/constructs";
import { CfnAuthorizer } from "aws-cdk-lib/aws-iot";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";

export default {
  config(_input) {
    return {
      name: "twitch",
      region: "us-east-1",
      profile: "ironbay-dev",
    };
  },
  stacks(app) {
    app.stack(function App(ctx) {
      const api = new Api(ctx.stack, "api", {
        routes: {
          "GET /": "packages/functions/src/lambda.handler",
          "POST /hook/twitch": "packages/functions/src/twitch.handler",
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
        environment: {
          VITE_STAGE: ctx.app.stage,
        },
      });

      ctx.stack.addOutputs({
        API_URL: api.url,
        SITE_URL: solid.url || "",
      });
    });
  },
} satisfies SSTConfig;
