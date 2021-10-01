import {html,css,CSSResult, TemplateResult,LitElement} from "lit"
import {customElement,state,query} from "lit/decorators.js"
import "@ui5/webcomponents/dist/Title"
import "@ui5/webcomponents/dist/Button"
import "@ui5/webcomponents/dist/Input"
import "@ui5/webcomponents/dist/DatePicker"
import "@ui5/webcomponents/dist/List"
import "@ui5/webcomponents/dist/CustomListItem"
import "@ui5/webcomponents/dist/Panel"
import "@ui5/webcomponents/dist/Dialog"
import "@ui5/webcomponents/dist/Label"
import "@ui5/webcomponents/dist/TextArea"
import "@ui5/webcomponents-fiori/dist/ShellBar"
import "@ui5/webcomponents-icons/dist/AllIcons.js"
import {TTodoItem,TTodoBase,TTodoEvent, TTodoActions} from "./appstructuresandevents"
import "./todo-adder"
import "./todo-list"
import "./todo-edit"
import {TodoEdit} from "./todo-edit"

@customElement("sample-app")
class SampleApp extends LitElement {
  static override get styles():CSSResult { return css`
      .app {
        height: 100%;
      }
      .header-toolbar {
        position:sticky;
        z-index: 42;
        background-color: rgba(255, 255, 255, 0.6);
        box-shadow: 0 4px 5px -5px #0a6ed1;
      }
      .ui5-logo {
        height: 2rem;
        margin-left: 2rem;
      }
      .app-title {
        margin-left: 1rem;
      }
      .app-content {
        height: calc(100% - 3rem);
        padding: 0 1rem;
        width: calc(100% - 2rem);
      }
    `} 
  @state() todos:TTodoItem[] = [
    {
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
  ]
  //ref could also be used
  @query("todo-edit") editDialog!: TodoEdit
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
  editTodo(id:number):void {
    const todoObj = this.todos.filter(todo => {
      return todo.id === id
    })[0]
    this.editDialog.show({
      id: id,
      text: todoObj.text,
      deadline: todoObj.deadline
    })
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
  override connectedCallback():void {
    super.connectedCallback()
    this.addEventListener(TTodoEvent,((e:CustomEvent):void => {
      const detail = e.detail as TTodoActions
      switch(detail.type) {
        case "Completed": this.todoCompleted(detail.id); break
        case "Undo": this.undoTodo(detail.id); break
        case "Delete": this.removeTodo(detail.id); break
        case "Edit": this.editTodo(detail.id); break
        case "Save": this.saveTodoAfterEdited(detail.todo); break
        case "Add": this.addTodo(detail.todo); break
      }
    }) as EventListener)
  }    
  override render():TemplateResult {
    return html`
      <div class="app">
        <ui5-shellbar primary-title="UI5 Web Components Todo App (v2 Standard)">
          <img slot="logo" src="logo.png"/>
        </ui5-shellbar>
        <section class="app-content">
          <todo-adder></todo-adder>
          <div>
            <todo-list .items=${this.todos.filter(todo => !todo.done)}></todo-list>
            <ui5-panel header-text="Completed tasks" ?collapsed=${!this.todos.filter(todo => todo.done).length || undefined}>
              <todo-list .items=${this.todos.filter(todo => todo.done)}></todo-list>
            </ui5-panel>
          </div>
        </section>
        <todo-edit .saveCallback=${this.saveTodoAfterEdited}></todo-edit>
      </div>
    `
  }  
}
declare global { interface HTMLElementTagNameMap { "sample-app": SampleApp}}

