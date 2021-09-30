import {html,css,CSSResult, TemplateResult,LitElement} from "lit"
import {customElement} from "lit/decorators.js"
import {ref,createRef} from "lit/directives/ref.js"
import "@ui5/webcomponents/dist/List" // These are optional imports
import "@ui5/webcomponents/dist/CustomListItem"
import {dispatchTodoEvent} from "./appstructuresandevents"

@customElement("todo-adder")
class TodoAdder extends LitElement {
    static override get styles():CSSResult { return css`
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
    //ref is better for elemnts of which there are many in a template since then you don't need an id
    todoInput = createRef<HTMLInputElement>()
    todoDeadline = createRef<HTMLInputElement>()
    override render():TemplateResult { return html`
        <div class="create-todo-wrapper">
        <ui5-input placeholder="My Todo ..." ${ref(this.todoInput)} class="add-todo-element-width" id="add-input"></ui5-input>
        <ui5-date-picker format-pattern="dd/MM/yyyy" class="add-todo-element-width" ${ref(this.todoDeadline)} id="date-picker"></ui5-date-picker>
        <ui5-button class="add-todo-element-width" @click=${():void => {
            dispatchTodoEvent(this,{type:"Add",todo:{
                id:0, // It will be replaced with a proper ID
                text: this.todoInput.value?.value as string,
                deadline: this.todoDeadline.value?.value as string,
            }})
        }} design="Emphasized">Add Todo</ui5-button>
        </div>
    `}
}
declare global { interface HTMLElementTagNameMap { "todo-adder": TodoAdder}}
