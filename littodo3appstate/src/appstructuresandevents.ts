import {makeAutoObservable} from "mobx"

export type TTodoBase = {
    id: number,
    text: string,
    deadline: string,
  }
export type TTodoItem = TTodoBase & {
    done: boolean,
}
export interface UI5Dialog extends HTMLElement {
  show():void,
  close():void,
}
export const TTodoEvent = "TodoEvent"
//This is a discriminated union type definition for a reducer-like function 
//with type as the common field followed by the payload type
export type TTodoActions = 
    {type: "Save", todo: TTodoBase} //Save the data after being edited 
  | {type: "Edit", id: number} //Open a dialog box for the user to modify the data
  | {type: "Completed", id: number} //Mark the todo completed
  | {type: "Undo", id: number}
  | {type: "Delete", id: number}
  | {type: "Add", todo: TTodoBase} 
export function dispatchTodoEvent(el:HTMLElement,detail:TTodoActions):void {
  el.dispatchEvent(new CustomEvent(TTodoEvent,{detail,composed:true}))
}

class AppStore {
  todos:TTodoItem[] = []
  private _initialized = false
  constructor(){
    makeAutoObservable(this)
    this._initAsync()
  }
  private async _initAsync():Promise<void> {
    if(!this._initialized) {
      //To simulate some async initialization
      await new Promise((r) => setTimeout(r, 0))
      this.setTodos([{
          text: "Get some carrots",
          id: 1,
          deadline: "27/7/2022",
          done: false
        },
        {
          text: "Do some magic",
          id: 2,
          deadline: "22/7/2022",
          done: false
        },
        {
          text: "Go to the gym",
          id: 3,
          deadline: "24/7/2022",
          done: true
        },
        {
          text: "Buy milk",
          id: 4,
          deadline: "30/7/2022",
          done: false
        },
        {
          text: "Eat some fruits",
          id: 5,
          deadline: "29/7/2022",
          done: false
        }
      ])
      this._initialized = true
    }
  }
  setTodos(newTodos:TTodoItem[]):void {this.todos = newTodos}
  todoCompleted(id:number):void {
    this.setTodos(this.todos.map(todo => {
      return { ...todo, done: (todo.done || (id === todo.id)) }
    }))
  }
  undoTodo(id:number):void {
    this.setTodos(this.todos.map((todo) => {
      return {...todo, done: todo.id === id ? false : todo.done }
    }))
  }
  removeTodo(id:number):void {
    this.setTodos(this.todos.filter(todo => todo.id !== id))
  }
  maxId = this.todos.length + 1
  addTodo(todo:TTodoBase):void {
    this.setTodos([
      ...this.todos,
      {
        text: todo.text,
        id: this.maxId++,
        deadline: todo.deadline,
        done: false
      }
    ])
  }
  saveTodoAfterEdited(e:TTodoBase):void {
    const editedText = e.text
    const editedDate = e.deadline
    this.setTodos(this.todos.map((todo) => {
      if (todo.id === e.id) {
        todo.text = editedText as string
        todo.deadline = editedDate as string
      }
      return todo
    }))
  }
}
export const appStore = new AppStore()