import {html,css,CSSResult, TemplateResult,LitElement} from "lit"
import {customElement,property} from "lit/decorators.js"
import "@ui5/webcomponents/dist/List" // These are optional imports
import "@ui5/webcomponents/dist/CustomListItem"
import {TTodoItem} from "./main"

@customElement("todo-list")
class TodoList extends LitElement {
    @property({type:Array}) items!:TTodoItem[]
    @property() selectionChange!:(number)=>void
    @property() handleDelete!:(number)=>void
    @property() handleEdit!:(number)=>void
    static override get styles():CSSResult { return css`
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
      `
    } 
    override render():TemplateResult { return html`
        <ui5-list>
        ${this.items.map(todo => html`
            <ui5-li-custom key=${todo.id}>
                <div class="li-content">
                    <span class="li-content-text">${todo.id} ${todo.text} - finish before: ${todo.deadline}</span>
                    <div>
                        <ui5-button icon=${todo.done ? "undo" : "accept"} @click=${():void => {this.selectionChange(todo.id)}}></ui5-button>
                        ${todo.done ? html`` : html`
                          <ui5-button icon=edit @click=${():void => {this.handleEdit(todo.id)}}></ui5-button>
                        `}
                        <ui5-button icon=cancel design="Negative" @click=${():void => {this.handleDelete(todo.id)}}></ui5-button>
                    </div>
                </div>
            </ui5-li-custom>
            `)}
        </ui5-list>
    `}
}
declare global { interface HTMLElementTagNameMap { "todo-list": TodoList}}
