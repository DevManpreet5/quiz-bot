let { Client, GatewayIntentBits } = require("discord.js");
const dataJson = require("./question.json");
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/quiz-bot");

const leaderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
  },
});

const Leaderboard = mongoose.model("Leaderboard", leaderSchema);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

let questiondata = dataJson.results;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let count = 0;

client.on("messageCreate", async (message) => {
  let randomnumber = Math.floor(Math.random() * 49);
  let id1 = message.author.id;
  if (!message.author.bot) {
    let score = await Leaderboard.findOne({ id: id1 });
    if (!score) {
      await Leaderboard.create({ id: id1, name: message.author.displayName });
      console.log("New user added to the leaderboard.");
    }
  }

  if (message.content.includes("quiz") && !message.author.bot) {
    message.reply(questiondata[randomnumber].question).then(() => {
      count = 0;
    });
  }

  if (
    message.author.id === id1 &&
    !message.author.bot &&
    count === 0 &&
    (message.content.toLowerCase() === "true" ||
      message.content.toLowerCase() === "false")
  ) {
    count++;
    if (
      questiondata[randomnumber].correct_answer.toLowerCase() ==
      message.content.toLowerCase()
    ) {
      const updatedUser = await Leaderboard.findOneAndUpdate(
        { id: id1 },
        { $inc: { score: 1 } }
      );

      const scoreboard = await Leaderboard.findOne({ id: id1 });
      console.log(questiondata[randomnumber].correct_answer.toLowerCase());
      message.reply(`correct answer :) \n current score:${scoreboard.score}`);
    } else {
      const scoreboard = await Leaderboard.findOne({ id: id1 });
      message.reply(`incorrect answer :( \n current score:${scoreboard.score}`);
    }
  }

  if (message.content.includes("leaderboard") && !message.author.bot) {
    const scorecards = await Leaderboard.find({}).sort({ score: -1 }).limit(10);

    let res = " TOP  Winners are \n";

    scorecards.map((val, ind) => {
      res += `${ind + 1} ${val.name} ${val.score} \n`;
    });

    message.channel.send(res);
  }
});

client.login(
  "MTIxMjQzNjMyOTQ0NzU1NTEzNA.G7Yiq4.1CQBirFy4pIO0pUnOlbANQh6oAgd4eQIyQK52g"
);
