# Team Train

Slack app for building relationships at planning center. This train themed application creates an event that anyone who has time and wishes to participate can join the train to get to know their teammates better.

This is a Node.js application that has two main components:

1. a web component using Express for Slack Integration callbacks.
2. a cli component that expose commands for automatic scheduling.

The basic workflow of this project in action:

1. Scheduler prepare's train for departure by posting an all aboard message to the specified channel.
1. Users react using :ticket: to signify their desire to board the train.
1. Scheduler, at specified time, starts the train by creating a DM between two random individuals that reacted to the intial all aboard message.
1. Users are given prompts and one person is selected to being the call.
1. If users need additional conversation prompts, there is an interactive button that will go fetch additional prompts.

## Getting Started

These instructions will get you a copy of this project up and running on your local machine for development and testing. See deployment notes on how to deploy the project on a live system.

### Prerequisits

`yarn` to manage packages and dependencies. Ensure yarn, node, and npm are installed.

### Installing

Review `config/default.json` to ensure the base configuration is correct.

Copy `config/development.json.example` to `config/development.json` and fill out the necessary configurations (see ).

```json
{
  "slack": {
    "teamtrain": {
      "channel": "your-slack-channel",
      "token": "slack-bot-privilege-token",
      "verificationToken": "slack-app-verification-token"
    }
  }
}
```

Install dependencies

```shell
yarn install
```

Start it up and run the CLI components!

```shell
$ yarn run prep-train 1:30pm
🚂 will depart at 5:00pm
$ yarn run start-train
```

For the user requests new prompt Slack interactive component, use [ngrok](https://ngrok.com/) as a tunnel to your local machine.

When ngrok is running, in your Slack App, set the callback url to `https://yourhash.ngrok.io/callback`.

Start the webserver

```shell
yarn start
```

And profit! The interactive Slack buttons will now be functional.

## Deployment

There are a few things to keep in mind:

- Production uses `config/production.json` and `config/custom-environment-variables.json` to set up production environment configurations and environment variables respectively.
- `config/production.json` is required to exist, even if you only environment variables.
- If using ngrok locally, be sure to update your Slack component callback to your deployed environment host.

## Built With

- [yarn](https://yarnpkg.com/) - Dependency Management
- [config](https://www.npmjs.com/package/config) - environment configuration management
- [redis](https://www.npmjs.com/package/redis) - datastore
- [Express](https://www.npmjs.com/package/express) - web framework
- [Slack](https://slack.com) bot integration
- [GoogleSheets](https://developers.google.com/sheets/api/) integration

## License

[ISC](LICENSE.md)

## Contributing

We encourage you to contribute to Team Train! Please check out the [Contributing to Team Train](CONTRIBUTING.md) for guidelines about how to proceed. Join us!

Everyone interacting in Team Train's codebase, issue trackers, chat rooms, and mailing lists is expected to follow the Team Train [code of conduct](CODE_OF_CONDUCT.md).
