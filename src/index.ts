import TelegramBot from "node-telegram-bot-api";
import * as dotenv from 'dotenv';
import { addTodo, listTodo, clearList } from "./todo/todo.service";
dotenv.config()

const token = process.env.TOKEN;

if (!token) {
    console.log("Add bot token in .env file")
    process.exit(1);
}

const bot: TelegramBot = new TelegramBot(token, { polling: true });

bot.onText(/\/add (.+)/, (msg, match) => {
    const resp = match![1];
    addTodo(resp);
    bot.sendMessage(msg.chat.id, "Added to list.");
});

bot.onText(/\/clear/, async (msg, match) => {
  await clearList();
  bot.sendMessage(msg.chat.id, "Cleared list");
});

bot.onText(/\/list/, async (msg, match) => {
    const res = await listTodo()
    bot.sendMessage(msg.chat.id, res? res: "List is empty");
})

bot.onText(/\/sequence/, async (msg, match) => {
  let res = "Cleaning Sequence \n\n"
  res += "1. Ashish Patel\n"
  res += "2. Jai\n"
  res += "3. Parag\n"
  res += "4. Shounak\n"
  res += "5. Shubham\n"
  bot.sendMessage(msg.chat.id, res);
})
