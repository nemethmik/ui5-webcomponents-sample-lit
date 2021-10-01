import {html, css, LitElement, TemplateResult, CSSResult} from "lit"
import { customElement, state} from "lit/decorators.js"
import {ref,createRef} from "lit/directives/ref.js"
import {TTodoBase,UI5Dialog,dispatchTodoEvent} from "./appstructuresandevents"
import "@ui5/webcomponents/dist/Dialog"
import "@ui5/webcomponents/dist/Label"
import "@ui5/webcomponents/dist/TextArea"
import "@ui5/webcomponents/dist/DatePicker"
import "@ui5/webcomponents/dist/Button"
  
@customElement("todo-edit")
export class TodoEdit extends LitElement {
    //@state is required since when the dialog is opened with a new set of values  
    //@state will trigger re-rendering. This is the declarative reactive way
    @state() todo:TTodoBase = {id: 0,text: "",deadline: ""}
    dateEditInput = createRef<HTMLInputElement>()
    titleEditInput = createRef<HTMLInputElement>()
    editDialog = createRef<UI5Dialog>() 
    public show(todo:TTodoBase):void {
        this.todo = todo
        this.editDialog.value?.show()
        //If todoBeingEditted wasn't decorated with @state, then re-renderig should be requested.
        //This would be an imperative way.
        //this.requestUpdate()
    }
    static override get styles():CSSResult { return css`
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
    `} 
    public close = ():void => {this.editDialog.value?.close()}
    override render():TemplateResult {return html`
        <ui5-dialog header-text="Edit Todo item" ${ref(this.editDialog)}>
          <div class="dialog-content">
            <div class="edit-wrapper">
                <ui5-label>Title:</ui5-label>
                <ui5-textarea class="title-textarea" max-length="24" show-exceeded-text value=${this.todo.text} ${ref(this.titleEditInput)}></ui5-textarea>
            </div>
            <div class="date-edit-fields">
                <ui5-label>Date:</ui5-label>
                <ui5-date-picker format-pattern="dd/MM/yyyy" value=${this.todo.deadline} ${ref(this.dateEditInput)}></ui5-date-picker>
            </div>
          </div>
            <div class="dialog-footer" >
              <ui5-button design="Transparent" @click=${this.close} >Cancel</ui5-button>
              <ui5-button design="Emphasized" @click=${():void => {
                  const edittedText = this.titleEditInput.value?.value as string
                  const edittedDate = this.dateEditInput.value?.value as string
                  dispatchTodoEvent(this,{type:"Save",todo:{
                    id:this.todo.id,
                    deadline:edittedDate,
                    text:edittedText
                  }})
                  this.close()
                }}>Save</ui5-button>
            </div>
        </ui5-dialog>
    `}
}
declare global { interface HTMLElementTagNameMap { "todo-edit": TodoEdit}}