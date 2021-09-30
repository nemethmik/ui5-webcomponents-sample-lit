import {html,css,CSSResult, TemplateResult,LitElement} from "lit"
import {customElement,state,query} from "lit/decorators.js"
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
import {TTodoItem,TTodoBase} from "./appstructuresandevents"
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
    `} 
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
  //ref could also be used
  @query("todo-edit") editDialog!: TodoEdit
  setTodos(newTodos:TTodoItem[]):void {this.todos = newTodos}
  doneCallback = (id:number):void => {
    this.setTodos(this.todos.map(todo => {
      return { ...todo, done: (todo.done || (id === todo.id)) }
    }))
  }
  undoCallback = (id:number):void => {
    this.setTodos(this.todos.map((todo) => {
      return {...todo, done: todo.id === id ? false : todo.done }
    }))
  }
  removeCallback = (id:number):void => {
    this.setTodos(this.todos.filter(todo => todo.id !== id))
  }
  //ref is better for elemnts of which there are many in a template since then you don't need an id
  todoInput = createRef<HTMLInputElement>()
  todoDeadline = createRef<HTMLInputElement>()
  maxId = this.todos.length + 1
  //Since handleAdd is used as an event handler, it can be defined with the traditional method syntax; no need for the fat arrow syntax
  //lit-html automatically binds method functions to event handlers defined with the @ syntax.
  handleAdd():void {
    this.setTodos([
      ...this.todos,
      {
        text: this.todoInput.value?.value as string,
        id: this.maxId++,
        deadline: this.todoDeadline.value?.value as string,
        done: false
      }
    ])
  }
  //Use fat arrow syntax for callbacks, that is when a function is passed as a @property to a component
  editCallback = (id:number):void => {
    const todoObj = this.todos.filter(todo => {
      return todo.id === id
    })[0]
    this.editDialog.show({
      id: id,
      text: todoObj.text,
      deadline: todoObj.deadline
    })
  }
  //Don't use this method format with callback functions, always use the fat arrow format.
  //lit-html automatically binds method functions defined for event handlers marked with the @ syntax,
  //not for callbacks passed over as properties.
  //The web standard way is to use event handlers and not callbacks.
  //Or, even better, don't use callback at all, use Custom Events and/or application logic (store/controller) object.
  //saveCallback(e:TTodoBase):void {
  saveCallback = (e:TTodoBase):void => {
    const edittedText = e.text
    const edittedDate = e.deadline
    this.setTodos(this.todos.map((todo) => {
      if (todo.id === e.id) {
        todo.text = edittedText as string
        todo.deadline = edittedDate as string
      }
      return todo
    }))
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
          <div>
            <todo-list
              .items=${this.todos.filter(todo => !todo.done)}
              .doneUndoCallback=${this.doneCallback}
              .deleteCallback=${this.removeCallback}
              .editCallback=${this.editCallback}
            >
            </todo-list>
            <ui5-panel header-text="Completed tasks" ?collapsed=${!this.todos.filter(todo => todo.done).length || undefined}>
              <todo-list
                .items=${this.todos.filter(todo => todo.done)}
                .doneUndoCallback=${this.undoCallback}
                .deleteCallback=${this.removeCallback}
                .editCallback=${this.editCallback}
              >
              </todo-list>
            </ui5-panel>
          </div>
        </section>
        <todo-edit .saveCallback=${this.saveCallback}></todo-edit>
      </div>
    `
  }  
}
declare global { interface HTMLElementTagNameMap { "sample-app": SampleApp}}

