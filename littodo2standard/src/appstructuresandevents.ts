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
