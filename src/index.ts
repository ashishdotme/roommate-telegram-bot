import TelegramBot from 'node-telegram-bot-api'
import * as dotenv from 'dotenv'
import { addTodo, listTodo, clearList } from './services/todo.service'
import { currentTasks, updateCurrentTasks, getPastTasks } from './services/task.service'
import { tasks, res, ids } from './utils/tasks'
import * as _ from 'lodash'
import { format, compareAsc, startOfTomorrow, nextSaturday } from 'date-fns'
import dayjs from 'dayjs'
import { id } from 'date-fns/locale'
const { Client } = require('@notionhq/client')
dotenv.config()
const notion = new Client({
  auth: process.env.NOTION,
})
const token = process.env.TOKEN

if (!token) {
  console.log('Add bot token in .env file')
  process.exit(1)
}

const bot: TelegramBot = new TelegramBot(token, { polling: true })

type Tasks = {
  [key: string]: string
}

bot.onText(/\/add (.+)/, (msg, match) => {
  const resp = match![1]
  addTodo(resp)
  bot.sendMessage(msg.chat.id, 'Added to list.')
})

bot.onText(/\/clear/, async (msg, match) => {
  await clearList()
  bot.sendMessage(msg.chat.id, 'Cleared list')
})

bot.onText(/\/todos/, async (msg, match) => {
  const mes = await listTodo()
  bot.sendMessage(msg.chat.id, mes ? mes : 'List is empty')
})

bot.onText(/\/list/, async (msg, match) => {
  let mes = 'Current Turn \n'
  mes += '----------------\n\n'
  let list = await currentTasks()
  let count = 1
  for (let [key, value] of Object.entries(list)) {
    mes += `${count}. ${res[key]}  -  ${_.capitalize(value as any)} \n\n`
    count += 1
  }
  mes += '\n-------------\n'
  mes += 'Previous turns \n'
  mes += '---------------\n\n'
  mes += await getPastTasks()
  bot.sendMessage(msg.chat.id, mes)
})

bot.onText(/\/seq (.+)/, async (msg, match) => {
  const resp: string = match![1]
  let mes = `${res[resp]} Cleaning Sequence \n\n`
  try {
    tasks[resp].forEach((x: any, i: any) => {
      mes += `${i + 1}. ${_.capitalize(x)}\n`
    })
  } catch (e) {
    console.log('Failed')
  }
  bot.sendMessage(msg.chat.id, mes)
})

bot.onText(/\/done (.+) (.+)/, async (msg, match) => {
  let currentList = await currentTasks()
  const taskNum: string = match![1]
  const name: string = match![2].toLowerCase()
  try {
    if (!ids[name]) {
      bot.sendMessage(msg.chat.id, 'No user found')
      return
    }
    let currentIndex = tasks[taskNum].findIndex((x) => x == name)
    if (currentIndex == 3) {
      currentIndex = 0
    } else {
      currentIndex += 1
    }
    const task = tasks[taskNum]
    const currentPerson = currentList[taskNum]
      if (name == currentPerson) {
        currentList[taskNum] = task[currentIndex]
        bot.sendMessage(
          msg.chat.id,
          `${_.capitalize(name)} completed ${res[taskNum]}. Next turn is of ${_.capitalize(
            task[currentIndex],
          )}`,
          { parse_mode: 'Markdown' },
        )
        const taskName = res[taskNum]
        await updateCurrentTasks(currentList)
        await notion.pages.create({
          parent: { database_id: process.env.DATABASE },
          properties: {
            name: {
              title: [{ text: { content: `${taskName[0].split(' ').slice(0, 3).join(' ')}` } }],
            },
            date: { date: { start: dayjs().format() } },
            person: { rich_text: [{ text: { content: `${_.capitalize(name)}` } }] },
          },
        })
      } else {
        bot.sendMessage(msg.chat.id, `${_.capitalize(name)} it's not your turn for ${res[taskNum]}`)
      }
  } catch (e) {
    bot.sendMessage(msg.chat.id, 'Wrong input')
  }
})

bot.onText(/\/tasks/, async (msg, match) => {
  let mes = 'Responsibilities \n\n'
  mes += '1. Fridge\n'
  mes += '2. Utensils arrangement\n'
  mes += '3. Kitchen Top cleaning\n'
  mes += '4. Hall and passage vaccum\n'
  mes += '5. Hall and passage mop\n'
  mes += '6. Hall table cleaning\n'
  mes += '7. Throw trash can\n'
  bot.sendMessage(msg.chat.id, mes)
})

bot.onText(/\/help/, async (msg, match) => {
  let mes = `
  Help

  /add - Add to shopping list
  /todos - View shopping list
  /clear - Clear shoppinh list
  /tasks - Show all tasks
  /list - Show current turn
  /seq [tasknum] - Show sequence
  /done [tasknum] [name] - Complete task

  https://ashishpatel.notion.site/Roommate-Home-91c255efa8eb48ca8f76843faf77c8c8
  `
  bot.sendMessage(msg.chat.id, mes)
})
