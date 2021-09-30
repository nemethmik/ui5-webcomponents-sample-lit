import {html,css,CSSResult, TemplateResult,LitElement} from "lit"
import {customElement,state} from "lit/decorators.js"
import {ref,createRef} from "lit/directives/ref.js"
import "@ui5/webcomponents/dist/Title"
import "@ui5/webcomponents/dist/Button"
import "@ui5/webcomponents/dist/Title"
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
import "./todo-list"

export type TTodoBeingEditted = {
  id: number,
  text: string,
  deadline: string,
}
export type TTodoItem = TTodoBeingEditted & {
  done: boolean,
}
interface UI5Dialog extends HTMLElement {
  show():void,
  close():void,
}

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

      .create-todo-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 0.5rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #b3b3b3;
        box-sizing: border-box;
      }

      .add-todo-element-width {
        width: auto;
      }

      #add-input {
        flex: auto;
      }

      #date-picker {
        margin: 0 0.5rem 0 0.5rem;
      }

      .dialog-content {
        max-width: 320px;
        padding: 2rem 2rem;
      }

      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        padding: 0.25rem 0.25rem 0 0.25rem;
        border-top: 1px solid #d9d9d9;
      }

      .title-textarea {
        height: 100px;
        display: inline-block;
        width: 100%;
      }

      .date-edit-fields {
        margin-top: 1rem;
      }

      @media(max-width: 600px) {
        .create-todo-wrapper {
          flex-direction: column;
        }

        .add-todo-element-width  {
          width: 100%;
        }

        #date-picker {
          margin: 0.5rem 0 0.5rem 0;
        }
      }
    `
  } 
  @state() todos:TTodoItem[] = [
    {
      text: "Get some carrots",
      id: 1,
      deadline: "27/7/2018",
      done: false
    },
    {
      text: "Do some magic",
      id: 2,
      deadline: "22/7/2018",
      done: false
    },
    {
      text: "Go to the gym",
      id: 3,
      deadline: "24/7/2018",
      done: true
    },
    {
      text: "Buy milk",
      id: 4,
      deadline: "30/7/2018",
      done: false
    },
    {
      text: "Eat some fruits",
      id: 5,
      deadline: "29/7/2018",
      done: false
    }
  ]
  setTodos(newTodos:TTodoItem[]):void {this.todos = newTodos}
  @state() todoBeingEditted:TTodoBeingEditted = {id: 0,text: "",deadline: ""}
  setTodoBeingEditted(e:TTodoBeingEditted):void {this.todoBeingEditted = e}
  handleDone = (id:number):void => {
    this.setTodos(this.todos.map(todo => {
      return { ...todo, done: (todo.done || (id === todo.id)) }
    }))
  }
  handleUnDone = (id:number):void => {
    this.setTodos(this.todos.map((todo) => {
      return {...todo, done: todo.id === id ? false : todo.done }
    }))
  }
  handleRemove = (id:number):void => {
    this.setTodos(this.todos.filter(todo => todo.id !== id))
  }
  handleEdit = (id:number):void => {
    const todoObj = this.todos.filter(todo => {
      return todo.id === id
    })[0]
    this.setTodoBeingEditted({
      id: id,
      text: todoObj.text,
      deadline: todoObj.deadline
    })
    this.editDialog.value?.show()
  }
  handleCancel = ():void => {this.editDialog.value?.close()}
  handleSave = ():void => {
    const edittedText = this.titleEditInput.value?.value
    const edittedDate = this.dateEditInput.value?.value
    this.setTodos(this.todos.map((todo) => {
      if (todo.id === this.todoBeingEditted.id) {
        todo.text = edittedText as string
        todo.deadline = edittedDate as string
      }
      return todo
    }))
    this.editDialog.value?.close()
  }
  dateEditInput = createRef<HTMLInputElement>()
  titleEditInput = createRef<HTMLInputElement>()
  editDialog = createRef<UI5Dialog>() 
  todoInput = createRef<HTMLInputElement>()
  todoDeadline = createRef<HTMLInputElement>()
  handleAdd = ():void => {
    this.setTodos([
      ...this.todos,
      {
        text: this.todoInput.value?.value as string,
        id: this.todos.length + 1,
        deadline: this.todoDeadline.value?.value as string,
        done: false
      }
    ])
  }
  override render():TemplateResult {
    return html`
      <div class="app">
        <ui5-shellbar primary-title="UI5 Web Components Sample Application">
          <img slot="logo" src="logo.png"/>
        </ui5-shellbar>
        <section class="app-content">
          <div class="create-todo-wrapper">
            <ui5-input placeholder="My Todo ..." ${ref(this.todoInput)} class="add-todo-element-width" id="add-input"></ui5-input>
            <ui5-date-picker format-pattern="dd/MM/yyyy" class="add-todo-element-width" ${ref(this.todoDeadline)} id="date-picker"></ui5-date-picker>
            <ui5-button class="add-todo-element-width" @click=${this.handleAdd} design="Emphasized">Add Todo</ui5-button>
          </div>
          <div class="list-todos-wrapper">
            <todo-list
              .items=${this.todos.filter(todo => !todo.done)}
              .selectionChange=${this.handleDone}
              .handleDelete=${this.handleRemove}
              .handleEdit=${this.handleEdit}
            >
            </todo-list>
            <ui5-panel header-text="Completed tasks" ?collapsed=${!this.todos.filter(todo => todo.done).length || undefined}>
              <todo-list
                .items=${this.todos.filter(todo => todo.done)}
                .selectionChange=${this.handleUnDone}
                .handleDelete=${this.handleRemove}
                .handleEdit=${this.handleEdit}
              >
              </todo-list>
            </ui5-panel>
          </div>
        </section>
        <ui5-dialog header-text="Edit Todo item" ${ref(this.editDialog)}>
          <div class="dialog-content">
            <div class="edit-wrapper">
                <ui5-label>Title:</ui5-label>
                <ui5-textarea class="title-textarea" max-length="24" show-exceeded-text value=${this.todoBeingEditted.text} ${ref(this.titleEditInput)}></ui5-textarea>
            </div>
            <div class="edit-wrapper date-edit-fields">
                <ui5-label>Date:</ui5-label>
                <ui5-date-picker format-pattern="dd/MM/yyyy" value=${this.todoBeingEditted.deadline} ${ref(this.dateEditInput)}></ui5-date-picker>
            </div>
          </div>
            <div class="dialog-footer" >
              <ui5-button design="Transparent" @click=${this.handleCancel} >Cancel</ui5-button>
              <ui5-button design="Emphasized" @click=${this.handleSave}>Save</ui5-button>
            </div>
        </ui5-dialog>
      </div>
    `
  }  
}
declare global { interface HTMLElementTagNameMap { "sample-app": SampleApp}}

