import {html,css,CSSResult, TemplateResult,LitElement} from "lit"
import {customElement,property} from "lit/decorators.js"
import "@ui5/webcomponents/dist/List" // These are optional imports
import "@ui5/webcomponents/dist/CustomListItem"
import "@ui5/webcomponents/dist/Checkbox"
import {TTodoItem} from "./main"

@customElement("todo-list")
class TodoList extends LitElement {
    inlineTodoItems = true
    @property({type:Array}) items!:TTodoItem[]
    @property() selectionChange!:(CustomEvent)=>void
    @property() handleDelete!:(number)=>void
    @property() handleEdit!:(number)=>void
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

   .li-content {
     display: flex;
     width: 100%;
     justify-content: space-between;
     align-items: center;
   }

   .li-content-text {
     overflow: hidden;
     text-overflow: ellipsis;
     white-space: nowrap;
   }

   .edit-btn {
     margin-right: 1rem;
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
    override render():TemplateResult { return html`
    <ui5-list mode="MultiSelect" @selectionChange=${(e:Event):void => {this.selectionChange(e)}}>
      ${this.items.map(todo => html`
        ${this.inlineTodoItems ? 
            html`<ui5-li-custom key=${todo.id} ?selected=${todo.done} data-key=${todo.id} class=${this.hidden ? "hidden" : ""} >
                <div class="li-content">
                    <span class="li-content-text">${todo.text} - finish before: ${todo.deadline}</span>
                    <div class="li-content-actions">
                        <ui5-button class="edit-btn" @click=${(e:Event):void => {this.handleEdit(e)}}>Edit</ui5-button>
                        <ui5-button design="Negative" @click=${(e:Event):void => {this.handleDelete(e)}}>Delete</ui5-button>
                    </div>
                </div>
            </ui5-li-custom>` : ``}
        ${this.inlineTodoItems ?
            html`
            <todo-item
                key=${todo.id}
                id=${todo.id}
                text=${todo.text}
                .deadline=${todo.deadline}
                .done=${todo.done}
                .handleDelete=${this.handleDelete}
                .handleEdit=${this.handleEdit}></todo-item>
            ` : ``
        }`
      )}
    </ui5-list>
    `}
}
declare global { interface HTMLElementTagNameMap { "todo-list": TodoList}}

@customElement("todo-item")
class TodoItem extends LitElement {
    @property() id!:string 
    @property({type:Boolean}) done!:boolean
    @property({type:Boolean}) hidden!:boolean 
    @property() text!:string 
    @property() deadline!:string 
    @property() handleDelete!: (number)=>void
    @property() handleEdit!: (number)=>void
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

    .li-content {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
    }

    .li-content-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .edit-btn {
      margin-right: 1rem;
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

    override render():TemplateResult { return html`
        <ui5-li-custom key=${this.id} ?selected=${this.done} data-key=${this.id} class=${this.hidden ? "hidden" : ""}>
            <div class="li-content">
                <span class="li-content-text">${this.text} - finish before: ${this.deadline}</span>
                <div class="li-content-actions">
                    <ui5-button class="edit-btn" @click=${(e:Event):void => {this.handleEdit(e)}}>Edit</ui5-button>
                    <ui5-button design="Negative" @click=${(e:Event):void => {this.handleDelete(e)}}>Delete</ui5-button>
                </div>
            </div>
        </ui5-li-custom>    
    `}
}
declare global { interface HTMLElementTagNameMap { "todo-item": TodoItem}}