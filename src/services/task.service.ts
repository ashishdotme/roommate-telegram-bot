import * as dotenv from 'dotenv'
import { Client } from '@notionhq/client'
dotenv.config()
import dayjs from 'dayjs'
const notion = new Client({ auth: process.env.NOTION })

export const currentTasks = async () => {
  try {
    const items: any = await notion.blocks.retrieve({
      block_id: '3c2d4397bb914af78aea12ddefc5af29',
    })
    return JSON.parse(items.paragraph.text[0].text.content)
  } catch (e) {
    console.log(e)
  }
}

export const getPastTasks = async () => {
  try {
    const items = await notion.databases.query({
        database_id: 'eddb092acc4044b5a92747a60fcf246e',
        page_size: 10,
    })
    return items.results.map((list: any)=>{
        const properties = JSON.parse(JSON.stringify(list.properties))
        return `${properties.name.title[0].text.content} - ${properties.person.rich_text[0].text.content} - Completed on ${dayjs(properties.date.date.start).format('DD/MMM/YYYY')}`
    }).reduce((prev: any, curr: any)=> `${prev}\n${curr}`)
  } catch (e) {
    console.log(e)
  }
}

export const updateCurrentTasks = async (currentList: any) => {
  try {
    await notion.blocks.update({
      block_id: '3c2d4397bb914af78aea12ddefc5af29',
      paragraph: {
        text: [
          {
            type: "text",
            text: {
              content: JSON.stringify(currentList),
            },
          },
        ],
      },
    })
  } catch (e) {
    console.log(e)
  }
}
