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
