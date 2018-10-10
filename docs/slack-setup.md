## Setup Slack App
Create a Slack app ([here](https://api.slack.com/slack-apps)).  
Assign a name and a workspace in the following steps.

![create slack app](../assets/create-slack-app.png)

After setting up the Slack app you have to add features like the slash command, interactive components and permissions.

![add features and functionality](../assets/features.png)

Start with the slash command, enter the root url of the future service and other options like the command name and a hint.

![create slash command](../assets/command.png)

Continue with the interactive components which enables to ask for the current location.  
Extend the root url with the `/folks` path.

![create interactive component](../assets/interactive.png)

Finally grant the required permissions

- `chat:write:bot`
- `commands`

and install the app to workspace.
Note the provided OAuth token to deploy erna.

![grant permissions](../assets/permissions.png)
