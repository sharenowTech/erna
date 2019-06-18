require('dotenv').config()

const { App } = require('@slack/bolt')
const env = require('./lib/env')
const blocks = require('./lib/blocks')

const app = new App({
  token: env.token,
  signingSecret: env.secret
})

app.command('/erna', async ({ ack, say }) => {
  ack()
  say({
    blocks: blocks.signup(true)
  })
})

app.action('signup', ({ ack, say }) => {
  ack()

  say('hi')
});

(async () => {
  await app.start(env.port)
  console.log(`⚡️ Bolt app is running on port ${env.port}.`)
})()
