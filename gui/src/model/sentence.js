import { Snippet } from "./snippet.js";

export class Sentence {
  constructor(id, iri, sourceDocument) {
    this._id = id;
    this._iri = iri;
    this._sourceDocument = sourceDocument;
    this._loading = false;
    this._snippets = [];
    this._text = "";
    this._parent = null;
    this._checked = true;
    this._children = [];
    this._level = null;
    this._visible = false; //show or hide sentence
    this._collapsed = false; //collapse or expand this node to hide/show its children
    this._selected = false; //selected by the user to be included in the interpretation
    this._isHeader = false; //corresponding element in source has a 'containsAsHeader' attribute
  }

  //set text and create snippet
  set content(content) {
    this._text = content.trim();
    this._snippets = [
      new Snippet(this, [0, this._text.length]), //sentence, character range
    ];
  }

  set id(id) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  set iri(iri) {
    this._iri = iri;
  }

  get iri() {
    return this._iri;
  }

  get parent() {
    return this._parent;
  }

  set parent(parent) {
    this._parent = parent;
  }

  get snippets() {
    return this._snippets;
  }

  get text() {
    return this._text;
  }

  get sourceDocument() {
    return this._sourceDocument;
  }

  get checked() {
    return this._checked;
  }

  set checked(checked) {
    this._checked = checked;
  }

  get children() {
    return this._children;
  }

  addChild(child) {
    this._children.push(child);
  }

  //return sentence tree as list, do not include empty sentences
  get sentenceTreeAsList() {
    let list = this._text.length == 0 ? [] : [this];
    this._children.forEach((child) => {
      list = list.concat(child.sentenceTreeAsList);
    });
    return list;
  }
  //level in sentence hierarchy
  set level(level) {
    this._level = level;
  }
  get level() {
    return this._level;
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  set collapsed(collapsed) {
    this._collapsed = collapsed;
    this.updateVisibilityOfChildren();
  }
  get collapsed() {
    return this._collapsed;
  }

  set selected(selected) {
    this._selected = selected;
    //propagate this down the tree. if this sentence is selected, set all its children to
    //selected as well, if this sentence is de-selected, set all its children to not-selected too
    this._children.forEach((child) => {
      child.selected = selected;
    });
  }
  get selected() {
    return this._selected;
  }

  set visible(visible) {
    this._visible = visible;
    this.updateVisibilityOfChildren();
  }

  get visible() {
    return this._visible;
  }

  //visibility depends on the collapse status of the sentences
  updateVisibilityOfChildren() {
    this._children.forEach((child) => {
      child.visible = !this._collapsed && this._visible;
    });
  }

  get isHeader() {
    return this._isHeader;
  }
  set isHeader(isHeader) {
    this._isHeader = isHeader;
  }
}
