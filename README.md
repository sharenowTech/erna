![logo](./assets/logo.gif)


# erna – eat, relax & natter alternately
## slack slash command to match people for having lunch

![standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)
![standard](https://img.shields.io/badge/license-MIT-brightgreen.svg)
![node](https://img.shields.io/badge/node_version->=7-brightgreen.svg)


1. [Introduction](#introduction)
1. [Configuration](#configuration)
1. [Endpoints and Permissions](#endpoints-and-permissions)
1. [Setup Slack App ⇗](docs/slack-setup.md)
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

The basic idea behind erna is to enter a specific command, choose your current location and get your match at 11:30am local time. In case of an odd number of applicants, there's one group of three people; otherwise it is a 1on1. You get even notified in the unfortunate case of no match. But don't be sad – keep trying and tell your coworkers about the app 😉.

It is still work in progress and uses internal storage.  
Feel free to contribute new storage providers or other features.  
Since erna uses internal storage ensure that the app is scaled exactly once at a single datacenter.

## Configuration
The configuration is based on environment variables.

### `LOCATIONS`

Pass in a comma-separated list of available locations.  
Those locations are provided as interactive command, so people can choose their current location on a daily basis.  

Besides the locations it is necessary to define the related [timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) ([map](http://efele.net/maps/tz/)).  
Each timezone is enclosed between `#` and `:`. So the final schema is like:

```sh
[#<Timezone>:<Location>[,<Location>*]]+
```

Example:
```sh
LOCATIONS=#Europe/Berlin:Berlin,Hamburg#America/New_York:NYC
```

If just one location is provided, erna skips the prompt for choosing the location as it is unnecessary. 

### `TOKEN`

The Slack OAuth token is required.  
How to get the token and set the required permissions is explained in section [Slack setup chapter](docs/slack-setup.md).

Example:
```sh
TOKEN=xoxp-12345678-87654321-10011001-3x4mp13
```

### `SECRET`

The Slack app's signing secret is required.  
Slack provides the app's signing secret on the **Base Information** page of your app.

### `[PORT=3000]`

Pass in an integer to use a custom port.  
This variable is optional and its default is `3000`.

Example:
```sh
PORT=8080
```

## Endpoints and Permissions
### Endpoints
- `GET /` – Health Check
- `POST /commands` – Slash Command
- `POST /actions` – Interactive Components

### Permissions
- `chat:write:bot`
- `mpim:write`
- `im:write`
- `commands`

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

