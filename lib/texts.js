const signup = (frequency, matchTime) => [
  `Hi, I'm *Erna*. I organise lunch dates ${frequency} at ${matchTime} and I will find one for you.`,
  `Hiya, it's me, *Erna*.\nI'm responsible for setting up lunch dates ${frequency} at ${matchTime}.`,
  `I'm glad to hear from you.\nI am *Erna* and organize lunch dates ${frequency} at ${matchTime}.`
]

const signupNewbie = (frequency, matchTime) => [
  `Hi newbie, nice to meet you!👋🏼\n\nMy name is *Erna* and I assist with your personal lunch date🙋🏼‍♀️.\nJust choose the location you wanna join and ${frequency} at ${matchTime} I'll set up a private conversation with your match right here in Slack.\n\nSome more hints:\n1) no worries, nobody sees our current conversation 🤫\n2) enter \`\\erna\` again to update or delete your registration\n3) The signup is just valid for the next event`
]

module.exports = {
  signup,
  signupNewbie
}
