class PlayerComponent extends HTMLElement {
    constructor(...props) {
        super();
        this.__isCustomeElementValid = this.__customeElementValid();
        this.__componentShadowRoot = null;
        this.__componentBody = null;
    }




    __customeElementValid() {
        return !!window.customElements;
    }
}