import * as dotenv from 'dotenv';
dotenv.config()

let todos: string[] = []

async function listTodo() {
    try {
        return todos.join()
    } catch (error) {
        console.error("Failed")
    }
}

async function clearList() {
  try {
      todos = []
      return todos
  } catch (error) {
      console.error("Failed")
  }
}

async function addTodo(item: string) {
    try {
        todos.push(item)
        return todos
    } catch (error) {
        console.error("Failed")
    }
}

export { listTodo, addTodo, clearList };