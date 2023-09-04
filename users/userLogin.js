const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

module.exports.userLogin = async (event, context) => {
    console.log(JSON.stringify(event));
    context.callbackWaitsForEmptyEventLoop = false;

    try{
        const {username, password} = JSON.parse(event.body);
        console.log('Username ', username )
        console.log('Password', password);

        const authParams = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: '5065r68fg4i4l1pg3olrfjqac6',
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        };

        const authResult = await cognito.initiateAuth(authParams).promise();

        const accessToken = authResult.AuthenticationResult.AccessToken;

        const params = {
            AccessToken: accessToken,
        };

        try{
            const result = await cognito.getUser(params).promise();
            return{
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                  },
                body: JSON.stringify({status: "success", result})
            }
        } catch (authError) {
            console.log("Authentication error", authError);
            return {
              statusCode: 401,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
              body: JSON.stringify({ error: "Invalid or expired token" }),
            };
    }
} catch (error) {
    console.log("An error happened", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ error: "An error occurred while processing the request" }),
    };
  }
};