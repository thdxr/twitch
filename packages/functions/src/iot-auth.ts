export async function handler() {
  const policy = {
    isAuthenticated: true, //A Boolean that determines whether client can connect.
    principalId: Date.now().toString(), //A string that identifies the connection in logs.
    disconnectAfterInSeconds: 86400,
    refreshAfterInSeconds: 300,
    policyDocuments: [
      {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "iot:Publish",
            Effect: "Allow",
            Resource: "*",
          },
          {
            Action: "iot:Connect",
            Effect: "Allow",
            Resource: "*",
          },
          {
            Action: "iot:Receive",
            Effect: "Allow",
            Resource: `arn:aws:iot:us-east-1:${process.env.ACCOUNT_ID}:topic/*`,
          },
          {
            Action: "iot:Subscribe",
            Effect: "Allow",
            Resource: `arn:aws:iot:us-east-1:${process.env.ACCOUNT_ID}:topicfilter/*`,
          },
        ],
      },
    ],
  };
  console.log("Policy", JSON.stringify(policy, null, 2));
  return policy;
}
