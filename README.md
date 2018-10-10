![logo](./assets/logo.gif)


# erna – eat, relax & natter alternately
## slack slash command to match people for having lunch

![standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)
![standard](https://img.shields.io/badge/license-MIT-brightgreen.svg)
![node](https://img.shields.io/badge/node_version->=7-brightgreen.svg)


1. [Introduction](#introduction)
1. [Configuration](#configuration)
1. [Setup](#setup)
1. [Development](#development)
1. [Contributing](#contributing)
1. [License](#license)

---

![demo](./assets/demo.gif)

## Introduction
This [Slack](https://slack.com) [slash command](https://api.slack.com/slash-commands) is inspired by car2go's previous platform `luncher2go` which matches coworkers of one location on demand to get to know new colleagues while having lunch.

The app is optimized for [zeit now](https://zeit.co/now), so that it is possible to deploy the app with a single command: 

```sh
now car2go/erna
```

The basic idea behind erna is to enter a specific command, choose your current location and get your match at 11:30am Europe/Berlin. In case of an odd number of applicants, there's one group of three people. Otherwise it is a 1on1. You get even notified in the unfortunate case of no match. But don't be sad – keep trying and tell your coworkers about the app 😉.

It is still work in progress and uses internal storage.  
Feel free to contribute new storage providers or other features.

## Configuration
> The configuration is based on environment variables.

- `LOCATIONS`

The list of locations is required.  
Pass in a comma-separated list of available locations.  
Those locations are provided as interactive command, so people can choose there current location on a daily basis.

Example:
```sh
LOCATIONS=Berlin,Stuttgart,Hamburg,Ulm
```

If just one location is provided, erna skips the prompt for choosing the location as it is unnecessary. 

- `TOKEN`

The Slack OAuth token is required.  
How to get the token and set the required permissions is explained in section [setup](#setup).

Example:
```sh
TOKEN=xoxp-12345678-87654321-10011001-3x4mp13
```

- `PORT`

Pass in an integer to use a custom port.  
The default port is `3000`.

Example:
```sh
PORT=8080
```

## Setup
### Slack App
Create a Slack app ([here](https://api.slack.com/slack-apps)).  
Assign a name and a workspace in the following steps.

![create slack app](./assets/create-slack-app.png)

After setting up the Slack app you have to add features like the slash command, interactive components and permissions.

![add features and functionality](./assets/features.png)

Start with the slash command, enter the root url of the future service and other options like the command name and a hint.

![create slash command](./assets/command.png)

Continue with the interactive components which enables to ask for the current location.  
Extend the root url with the `/folks` path.

![create interactive component](./assets/interactive.png)

Finally grant the required permissions

- `chat:write:bot`
- `commands`

and install the app to workspace.
Note the provided OAuth token to deploy erna.

![grant permissions](./assets/permissions.png)

### Deploy *erna*
To deploy erna as microservice, use zeit now

```sh
now -e LOCATIONS=SF,NYC car2go/erna
```

or any other preferred way.  


## Development
To simplify the local development and testing, read the [slack tutorial](https://api.slack.com/tutorials/tunneling-with-ngrok) about using tunneling.

Basically it's enough to install [ngrok](https://ngrok.com/), run `npm start` in the repository and tunnel the port `ngrok http 3000`. Use the output temporary URL in the Slack app settings.

## Contributing
Fork this repository and push in your ideas.

Would be awesome if you add corresponding tests.  
For further information read the [contributing guideline](./CONTRIBUTING.md).

## License
The MIT License

Copyright (c) 2018 car2go Group GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

