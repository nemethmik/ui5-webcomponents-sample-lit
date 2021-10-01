import {html,css,CSSResult, TemplateResult} from "lit"
import {customElement,query} from "lit/decorators.js"
import {MobxLitElement} from "@adobe/lit-mobx"
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
import {appStore, TTodoEvent, TTodoActions} from "./appstructuresandevents"
import "./todo-adder"
import "./todo-list"
import "./todo-edit"
import {TodoEdit} from "./todo-edit"

@customElement("sample-app")
class SampleApp extends MobxLitElement {
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
  //ref could also be used
  @query("todo-edit") editDialog!: TodoEdit
  editTodo(id:number):void {
    const todoObj = appStore.todos.filter(todo => {
      return todo.id === id
    })[0]
    this.editDialog.show({
      id: id,
      text: todoObj.text,
      deadline: todoObj.deadline
    })
  }
  override async connectedCallback():Promise<void> {
    super.connectedCallback()
    this.addEventListener(TTodoEvent,((e:CustomEvent):void => {
      const detail = e.detail as TTodoActions
      switch(detail.type) {
        case "Completed": appStore.todoCompleted(detail.id); break
        case "Undo": appStore.undoTodo(detail.id); break
        case "Delete": appStore.removeTodo(detail.id); break
        case "Edit": this.editTodo(detail.id); break
        case "Save": appStore.saveTodoAfterEdited(detail.todo); break
        case "Add": appStore.addTodo(detail.todo); break
      }
    }) as EventListener)
  }    
  override render():TemplateResult {
    return html`
      <div class="app">
        <ui5-shellbar primary-title="UI5 Web Components Todo App (v3 State)">
          <img slot="logo" src="logo.png"/>
        </ui5-shellbar>
        <section class="app-content">
          <todo-adder></todo-adder>
          <div>
            <todo-list .items=${appStore.todos.filter(todo => !todo.done)}></todo-list>
            <ui5-panel header-text="Completed tasks" ?collapsed=${!appStore.todos.filter(todo => todo.done).length || undefined}>
              <todo-list .items=${appStore.todos.filter(todo => todo.done)}></todo-list>
            </ui5-panel>
          </div>
        </section>
        <todo-edit></todo-edit>
      </div>
    `
  }  
}
declare global { interface HTMLElementTagNameMap { "sample-app": SampleApp}}

