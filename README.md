# UI5 Web Components Sample To-Do Application with Vite and Lit

A clean, no-framework implementation of the sample application using state of the art tooling for web component development with Vite, Lit and TypeScript.
ESLint is used for linting TyeScript.

This is a multiproject repository, the actual projects can be found in the subfolders. You may also find a number of branches as the project implementation went ahead.

The projects here are based on the samples [ui5-webcomponents-sample-react](https://github.com/SAP-samples/ui5-webcomponents-sample-react)

## littodo3appstate
This is the 3rd and last iteration of the todo application series; this version is enhanced to use MobX state management tool.
The Marcus Hellberg video [LitElement state management with MobX](https://youtu.be/MNxnZ8pzSBo) is an excellent intro.
- The first step doesn't even require MobX at all: I created a singleton *AppStore* class along with a global variable *appStore* and I relocated the todo array and its relevant manipulators from the *SampleApp* (main.ts) class.
    - I created an `async initAsync()` to load demo data into the todo array simulating a remote service call. *initAsync* is automatically called from the *AppStore* *constructor*, but it could also be called from any components that want the data upon their *connectedCallback*; *initAsync* is executed only once actually since it uses a private *_initialized* field.
- It was a brilliant idea to centralize all state change notification machinery and paths with the introduction of *CustomEvent* and tthe **discriminated union type** as a payload for the *detail* field.
In my example all state change triggering events are handled in a single event listener, which calls the appropriate functions of the *appStore*; afterwards, it requests a rerendering with `this.requestUpdate()`, and that's all: awesome.
```ts
  override async connectedCallback():Promise<void> {
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
      this.requestUpdate()
    }) as EventListener)
    await appStore.initAsync()
    super.connectedCallback()
  }    
```
Since my *SampleApp* depends on loading the todos automatically when it is connected to the DOM, the appStore.initAsync should be called explicitly. And only after the initialization the super.connectedCallback is to be called, because super.connectedCallback will trigger the rendering machinery.
This is not perfect since then we cannot display a loading spinner/indicator on the screen.
    - This solution worked so great, that I made a branch *littodo3appstate1nomobx* for that.

### Adding MobX to Make a State Managed Application

- **npm i modx @adobe/lit-mobx** 
- It is amazingly surprising that the only thing to do is to call [makeAutoObservable](https://mobx.js.org/observable-state.html#makeautoobservable) in the constructor of the *AppStore* class.
    ```ts
    class AppStore {
    todos:TTodoItem[] = []
    constructor(){
        makeAutoObservable(this)
        this._initAsync()
    }
    private async _initAsync():Promise<void> {
        //To simulate some async initialization
        await new Promise((r) => setTimeout(r, 0))
    }
    setTodos(newTodos:TTodoItem[]):void {this.todos = newTodos}
    todoCompleted(id:number):void {
        this.setTodos(this.todos.map(todo => {
        return { ...todo, done: (todo.done || (id === todo.id)) }
        }))
    }
    ...
    }
    ```
    - The [Creating Application Stores](https://vaadin.com/docs/latest/fusion/tutorials/in-depth-course/application-state-management-with-mobx/#creating-the-crm-application-state-stores) tutorial shows an example how to fine tune the annotations by *makeAutoObservable*, private cannot be added to the overrides parameter object.
        ```ts
        import { makeAutoObservable, observable, runInAction } from 'mobx';
        export class CrmStore {
            contacts: Contact[] = [];
            companies: Company[] = [];
            statuses: Status[] = [];
            constructor() {
                makeAutoObservable(
                    this,
                    {
                        initFromServer: false,
                        contacts: observable.shallow,
                        companies: observable.shallow,
                        statuses: observable.shallow,
                    },
                    { autoBind: true }
                );
                this.initFromServer();
            }
            ...
        }
        ```
- Using the store is dead easy, too:
    ```ts
    @customElement("sample-app")
    class SampleApp extends MobxLitElement {
        editTodo(id:number):void {
            const todoObj = appStore.todos.filter(todo => {...})
            ...
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
            ...
            <todo-list .items=${appStore.tobedoneTodos}></todo-list>
            <ui5-panel header-text="Completed tasks" 
                ?collapsed=${appStore.numberOfcompletedTodos == 0}>
                <todo-list .items=${appStore.completedTodos}></todo-list>
            `
        }  
    }
    ```
    Since in my case only the *SampleApp* class uses the *appStore* only it has to be derived from *MobxLitElement*. All the subcomponents will receive their data directly from the parent:
    - `todo-list` is used twice and it receices a subset of the todo array elements; so, it would be totally meaningless to directly connect *todo-list* to the app store.
    - `todo-adder` has no input properties at all
    - `todo-edit` receives its input via the *show* function call.
    - Check out how [MobX computed](https://mobx.js.org/computeds.html#deriving-information-with-computeds) getters are used.
- The custom events: Completed, Undo, Delete, Save and Add all could be removed, since the components sending these messages could call directly the corresponding MobX store action function, but since the event listener acts like a centralized state *reducer*, it would be a lot less clean solution; it's not necessarily the responsibility/concern of the visual subcomponents to interact directly with the application store.
Even if it was, *Edit* event cannot be avoided, since it first gets the data from the store and then opens a UI component passing the selected todo data to it.

## littodo2standard
Is the cleanest solution using standard web browser tools: custom elements, of course and custom events. No callbacks are needed at all, they should be replaced with custom elements. The event handler defined on the application class level behaves like a central state reducer. 
The heart of this solution is *TTodoActions* **discriminated union type** definition, which is a brilliant TypeScript feature specifically applied for modeling the payload of reducers. React useReducer and Redux uses this construct extensively.
```ts
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
```
There is only a single event, *TodoEvent* the actual action is the type and the payload can be totally different for each action. Visual Studio Code is brilliantly smart with this unique feature of TypeScript. This is an important pillar that makes the application robust and maintainable.
*dispatchTodoEvent* is a terribly useful function to dispatch properly; it automatically sets the *detail* and *composed* fields in the CustomEvent object.

## littodo1simple
This is the simplest implemantation using just the basic toolset: Vite, Lit, TypeScript and UI5 Web Components, of course.

### Project Setup
- *npm init vite* Add project name *littodo1simple* and select *vanilla-ts*
    - Navigate into the folder and run *npm install*
- IMPORTANT: Open **tsconfig.json** and change **target** to **ES2021** and **useDefineForClassFields** to **false** 
THIS IS TERRIBLY IMPORTANT, OTHERWISE Lit Element won't work.
    The other options are up to your TypeScript programming preferences:
    ```json
    "target": "ES2021",
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ESNext", "DOM"],
    "moduleResolution": "Node",
    "strict": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "noEmit": true,
    // "noUnusedLocals": true,
    // "noUnusedParameters": true,
    "noImplicitReturns": true,
    "experimentalDecorators": true, 
    "inlineSourceMap": true, 
    "noImplicitAny": false,    
    "strictNullChecks": true,  
    "strictFunctionTypes": true, 
    "noImplicitThis": true, 
    ```
- Optionally, *npm i -D eslint*
    - Then run *npx eslint --init* to create *.eslintrc.json*
    - Add these rules to *.eslintrc.json* Adjust them to your liking.
    ```json
        "@typescript-eslint/no-non-null-assertion":"off",
        "@typescript-eslint/explicit-function-return-type": "error", 
        "@typescript-eslint/explicit-module-boundary-types": ["warn", {"allowArgumentsExplicitlyTypedAsAny":true}], 
        "@typescript-eslint/no-explicit-any":"warn", 
        "quotes": ["error","double",{ "allowTemplateLiterals": true}], 
        "@typescript-eslint/semi": ["error", "never"], 
        "@typescript-eslint/ban-ts-comment": ["warn"]      
    ```
    - Optionally, add *"fix": "eslint src --fix"* to fix linting issues, when copying sources from other projects.
- Optionally add *"servor": "npx servor dist index.html 8080 --browse --reload",* to package.json to test the production build before deployment.
- **npm install lit @ui5/webcomponents @ui5/webcomponents-fiori** to install the runtime libraries, that's all you need. 

## Getting Started with Lit Projects
- Simply add `<sample-app></sample-app>` to your *index.html* replacing `<div id="app"></div>` No need for it in the world of web components.
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>UI5 Sample App with Lit and Vite</title>
    </head>
    <body>
        <!--div id="app"></div-->
        <sample-app></sample-app>
        <script type="module" src="/src/main.ts"></script>
    </body>
    </html>
    ```
- In the *main.ts* add this code, this is a minimal startup:
    ```ts
    import {html,css,TemplateResult,LitElement} from "lit"
    import {customElement,property,query,state} from "lit/decorators"
    import "@ui5/webcomponents/dist/Title"
    @customElement("sample-app")
    class SampleApp extends LitElement {
    override render():TemplateResult {
        return html`
        <ui5-title>Hello UI5 Web Components!</ui5-title>
        <a href="https://sap.github.io/ui5-webcomponents/" target="_blank">Documentation</a>
        `
    }  
    }
    declare global { interface HTMLElementTagNameMap { "sample-app": SampleApp}}
    ```
    - Remember to add `declare global { interface HTMLElementTagNameMap { "my-customelement": MyCustomElement}}` at for your web componnet class definitions. This is completely optional, but a good practice.
- *npm run dev* **Congratulations!** You've just made your UI5 Web Component application with Vite, Lit and TypeScript.
    - You can build your application with *npm run build*
    - You can test the build with *npm run servor* (Yes, servor)
    - Now you are ready to deploy.
- Now you can Inititialize the folder for Git, commit and publish on GitHub or Azure DevOps, all with the built in Git tools of Visual Studio Code
- At this stage I have created a (free) Azure Static Web App (littodo1simple) defining */littodo1simple* as the root and *dist* as the build folder when the Azure Static Web Apps extension plugin asked.
    - https://orange-field-01bd0ee03.azurestaticapps.net/

## Implementing the Todo App 
- I started with copying [JSX block ftom the React App.js](https://github.com/SAP-samples/ui5-webcomponents-sample-react/blob/main/src/App.js) and I tailored it to the Lit syntax.
