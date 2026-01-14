import { v4 as uuid4 } from "uuid";

export class Snippet {
  constructor(sentence, characterRange) {
    this._id = uuid4(); //unique ID
    this._sentence = sentence;
    this._characterRange = characterRange;
    this._annotations = [];
    this._checked = true; //needed for step2
  }
  get id() {
    return this._id;
  }
  get text() {
    return this._sentence._text.substring(...this._characterRange)
  }
  get annotations() {
    return this._annotations;
  }
  get sentence() {
    return this._sentence;
  }
  get characterRange() {
    return this._characterRange;
  }

  get checked() {
    return this._checked;
  }

  addAnnotation(annotation) {
    this._annotations = [...this._annotations, annotation];
    //annotation.addSnippet(this)
  }

  deleteAnnotation(annotation) {
    const index = this._annotations.findIndex((a) => a.id == annotation.id);
    if (index != -1) {
      this._annotations.splice(index, 1);
      this._annotations = [...this._annotations];
    }
  }

  toFlatObject() {
    return {
      documentId: this._sentence.sourceDocument.id,
      sentenceId: this._sentence.id,
      sentenceIri: this._sentence.iri,
      characterRange: this._characterRange,
      text: this.text,
    };
  }

  fromFlatObject(data) {
    //the sentence object will be retrieved based on documentId and sentenceId
    //in importExport.js
    this._text = data.text;
  }
}
