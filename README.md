![logo](./assets/logo.gif)


# erna – E*at*, R*elax* & N*atter* A*lternately*
## slack slash command to match people for having lunch

![standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)
![standard](https://img.shields.io/badge/license-MIT-brightgreen.svg)
![node](https://img.shields.io/badge/node_version->=8-brightgreen.svg)


1. [Introduction](#introduction)
1. [Flows](#flows)
1. [Configuration](#configuration)
1. [Deployment](#deployment)
1. [Settings Summary](#settings-summary)
1. [Setup Slack App ⇗](docs/slack-setup.md)
1. [Storage Adapter ⇗](docs/storage-adapter.md)
1. [Development](#development)
1. [Contributing](#contributing)
1. [Other Projects We Are Working On](#other-projects-we-are-working-on)
1. [License](#license)

---

![demo](./assets/demo.gif)

## Introduction
This [Slack](https://slack.com) [slash command](https://api.slack.com/slash-commands) is inspired by car2go's previous platform `luncher2go` which matches coworkers of one location on demand to get to know new colleagues while having lunch, a coffee chat or similar.

The basic idea behind **erna** is to enter a specific command, choose your current location and get your match at the defined time, day and week. In case of an odd number of applicants, there's one larger group. You get even notified in the unfortunate case of no match. But don't be sad – keep trying and tell your coworkers about the app 😉.

While starting, **erna** generates up to 250 scheduled events per timezone which are enough for roughly 1-24 years. Additionally it is possible to schedule custom location-specific events via the subcommand `schedule` and to skip regularly scheduled events via `skip`.

The app is optimized for [zeit now v1](https://zeit.co/now), so that it is possible to deploy the app with a few commands: 

```sh
git clone https://github.com/sharenowTech/erna.git
cd erna
now
```

Feel free to contribute new storage providers or other features.  
Since **erna** is a cronjob-like service ensure that the app is scaled exactly once at a single datacenter.

## Flows
### Sign up for date or update existing date
![interaction flow](./assets/flow.png)


### Schedule a custom event
1. Run the command with the `schedule` subcommand:  
`/<command> schedule <YYYY-MM-DD> <HH:mm> [<title>]`
    1. Get notified in case of an invalid format.
    1. Get asked for the related location.
        1. Get notified about the scheduled event in case of success.
        1. Get notified about an existing event at the same time in the same location.

### Skip a regular event
1. Run the command with the `skip` subcommand:
`/<command> skip <YYYY-MM-DD> <HH:mm>`
  1. Get notified in case of an invalid format.
  1. Get feedback
     1. Get notified about the skip events at that date in case of success.
     2. Get notified about an existing skip at the same date.

### Notify all folks
1. Run the command with the `notify` subcommand:
`/<command> notify [<additional message>]`

## Configuration
The configuration is based on environment variables.

### `LOCATIONS`

Pass in a list of available locations including the related timezone.  
Those locations are provided as interactive command, so people can choose their current location on a daily basis.  

As already said, it is necessary to define the related [timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) ([map](http://efele.net/maps/tz/)).  
Each timezone is enclosed between `#` and `:`:

```sh
[#<Timezone>:<Location>[,<Location>*]]+
```

Example:
```sh
LOCATIONS=#Europe/Berlin:Berlin,Hamburg#America/New_York:NYC
```

If just one location is provided, **erna** skips the prompt for choosing the location as it is unnecessary. 

### `TOKEN`

The Slack Bot User OAuth Access Token is required.  
How to get the token and set the required permissions is explained in the [slack setup chapter](docs/slack-setup.md).

Example:
```sh
TOKEN=xoxp-12345678-87654321-10011001-3x4mp13
```

### `SECRET`

The Slack app its signing secret is required.  
Slack provides the app its signing secret on the **Base Information** page of your app.

Example:
```sh
SECRET=12345abcdef67890
```

### `[DB=undefined]`

Pass in a custom database url containing information like clusters, replica set and further options. 
Default is no external database, so it uses an in-memory state instead.  
Further information about the storage is listed in the [storage adapter chapters](docs/storage-adapter.md).

Example:
```sh
DB=mongodb://one.myinstance.com:27017,two.myinstance.com:27017?ssl=true&replicaSet=myCluster
```

### `[DB_CREDENTIALS=undefined]`

Pass in database credentials in a `username:password` format.

Example:
```sh
DB_CREDENTIALS=username:password
```

### `[DB_NAME=erna]`
Pass in the name of the database.

Example:
```sh
DB_NAME=erna_local
```

### `[BOT_NAME=erna]`
Pass in the username of the Slack bot user.

Example:
```sh
BOT_NAME=chieflunchofficer
```

### `[PORT=3000]`

Pass in an integer to use a custom port.  
This variable is optional and its default is `3000`.

Example:
```sh
PORT=8080
```

### `[MATCH_SIZE=2]`

Pass in an integer as desired match size.  
Actual size may differ because of an odd number of members per location.  
So the possible group size is `2 ≤ [ACTUAL_MATCH_SIZE] ≤ [MATCH_SIZE] + 1 `

Example:
```sh
MATCH_SIZE=4
```

### `[MATCH_TIME=11:30]`

Pass in a simple 24hr format to define the local time of announcing the matches.  
Do not pass `am`/`pm` 12hr formats. This option affects both the Slack messages and the scheduled matches.

Example:
```sh
MATCH_TIME=15:00
```

### `[MATCH_DAY=MON]`

Pass in a single day matching the `/^(MON|TUE|WED|THU|FRI|SAT|SUN)$/` pattern to define the day or range of days for announcing the matches.  
This option affects both the Slack messages and the scheduled matches.

Example:
```sh
MATCH_DAY=TUE
```

### `[MATCH_INTERVAL=1,2,3,4,5]`
Pass in a comma-separated list of week numbers per month matching the pattern `/^[0-5](,[0-5])?$/`.  
It filters the generated events by week numbers. So passing `1,3` excludes all events scheduled in the second, fourth and fifth week of a month. Passing only `0` means that no regular events are scheduled.

Example:
```sh
MATCH_INTERVAL=1,3
```

## Deployment 
To simplify the deployment of **erna** there are a couple of ways to pass the configurations mentioned above.  
Since this service is optimized for [zeit now v1](https://zeit.co/now) the following lines focus on this service. But it is quite easy and straightforward to adapt the principle to other services.

The easiest way to deploy **erna** is to clone the repository, enter the created directory, create a `.env` file and deploy the service. There is an integrated solution which fetches an existing `.env` file, so no further actions are needed. Moreover, it is possible to pass a specific file like `.env.prod` using the `-E` flag. Feel free to replace `now` with your preferred service.

```sh
# .env.prod or .env

LOCATIONS=#Europe/Berlin:Berlin,Hamburg#America/New_York:NYC
TOKEN=xoxp-12345678-87654321-10011001-3x4mp13
SECRET=12345abcdef67890
DB=mongodb://username:password@one.myinstance.com:27017,two.myinstance.com:27017?ssl=true&replicaSet=myCluster
```

```sh
git clone https://github.com/sharenowTech/erna.git
cd erna
now
```

or

```sh
git clone https://github.com/sharenowTech/erna.git
cd erna
now -E .env.erna.prod
```

## Settings Summary
### Endpoints
- `GET /` – Health Check
- `GET /schedule` – Overview over future events (regular & custom ones)
- `POST /commands` – Slash Command
- `POST /actions` – Interactive Components

### Slack App Permissions
- `chat:write:bot`
- `mpim:write`
- `im:write`
- `commands`
- `bot`

### Slack Bot User
- named `erna`

## Development
To simplify the local development and testing, read the [slack tutorial](https://api.slack.com/tutorials/tunneling-with-ngrok) about using tunneling.

Basically it's enough to install [ngrok](https://ngrok.com/), run `npm start` in the repository and tunnel the port `ngrok http 3000`. Use the output temporary URL in the Slack app settings.

### Environment Validation & Configuration
The validator (`./lib/env/validator.js`) is responsible for handling and validating environment variables. The schema listed in `./lib/env/schema.js` defines which variables are required, what are their defaults, which regex pattern is required and how to transform the passed values.

Further details can be found in the [schema definition ⇗](docs/environment-config.md).

## Contributing
Fork this repository and push in your ideas.

Would be awesome if you add corresponding tests.  
For further information read the [contributing guideline](./CONTRIBUTING.md).

## Other Projects We Are Working On
🗞 &nbsp;[Tech Blog](https://medium.com/car2godevs)  
🐦 &nbsp;[@car2godevs](https://twitter.com/car2godevs)  
📚 &nbsp;[Our Tech Stack](https://stackshare.io/car2go)  
💼 &nbsp;[Job Board](https://stackoverflow.com/jobs/companies/car2go)

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

