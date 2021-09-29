import {html,css,TemplateResult,LitElement} from "lit"
import {customElement,property,query,state} from "lit/decorators.js"
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