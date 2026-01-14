import { Sentence } from "./sentence.js";

export class SourceDocument {
  constructor(jsonLdObject) {
    console.log("sourceDoc", jsonLdObject);
    this._id = jsonLdObject["@context"]["@base"];
    const rootElement = jsonLdObject["@graph"].find(
      (d) => d["@type"] == "src:Source",
    );
    this._title = rootElement.title;

    this._sentenceTree = this.parseElementTree(rootElement, 0); //root is level 0

    //all sentences are collapsed by default. expand the root to show sentences at the highest level
    this._sentenceTree.collapsed = false;
    this._sentenceTree.visible = true;
    this._sentenceTree.selected = true; //this recursively sets all sentences to be selected

    //keep original jsonLd so it can be stored together with the interpretation
    this._jsonLd = jsonLdObject;
  }

  get id() {
    return this._id;
  }
  get title() {
    return this._title;
  }
  get sentenceTree() {
    return this._sentenceTree;
  }

  //sentence tree as list
  get sentences() {
    return this._sentenceTree.sentenceTreeAsList;
  }

  get jsonLd() {
    return this._jsonLd;
  }

  getSnippetsForAnnotation(annotation) {
    //check all snippets to see if they contain given annotation
    return this.sentences
      .map((s) => s.snippets)
      .flat()
      .filter((snippet) =>
        snippet.annotations.some((snippet) => snippet.id == annotation.id),
      );
  }

  getSentencesForAnnotation(annotation) {
    return this.getSnippetsForAnnotation(annotation)
      .map(snippet => snippet.sentence)
      .filter((sentence, index, sentences) => sentences.findIndex(s => s.id == sentence.id) === index)
  }

  getAnnotationsForFrame(frame) {
    const annotations = this.sentences
      .map((s) => s.snippets.map((snippet) => snippet.annotations))
      .flat()
      .flat()
      .filter(
        (annotation, index, array) =>
          array.findIndex((a) => a.id == annotation.id) === index,
      );
    return annotations.filter((a) => a.frame?.id == frame.id);
  }

  deleteAnnotationsForFrame(frame) {
    const annotations = this.getAnnotationsForFrame(frame);
    annotations.forEach((a) => this.deleteAnnotation(a));
  }

  //remove annotation from snippets
  deleteAnnotation(annotation) {
    const snippets = this.sentences.map((s) => s.snippets).flat();
    snippets.forEach((s) => s.deleteAnnotation(annotation));
  }

  //return all sentences that have snippets with annotations for frame in this document
  getSentencesForFrame(frame) {
    const sentences = this.sentences.filter((sentence) =>
      sentence.snippets.some((snippet) =>
        snippet.annotations.some((a) => a.frame && a.frame.id == frame.id),
      ),
    ).filter((sentence, index, sentences) => sentences.findIndex(s => s.id == sentence.id) === index);
    return sentences
  }

  //parse Choppr element into tree of sentences
  parseElementTree(element, level) {
    const sentence = new Sentence(element.id, element.IRI, this);
    sentence.level = level;

    if (element["@type"] == "src:Source") {
      sentence.parent = null;
      element.children.forEach((childElement) => {
        const childSentence = this.parseElementTree(childElement, level + 1);
        sentence.addChild(childSentence);
        childSentence.parent = sentence;
      });
    } else if (element["@type"].includes("src:NonLeafElement")) {
      let headerChildElement = null;
      if ("containsAsHeader" in element) {
        //replace this element by its header element
        headerChildElement = element.children.find(
          (child) => child.IRI == element.containsAsHeader,
        );
        sentence.isHeader = true;
      } else {
        headerChildElement = element.children[0];
        sentence.isHeader = false;
      }
      sentence.content =
        "content" in headerChildElement
          ? headerChildElement.content
          : `${element.typeLabel ? element.typeLabel : ""} ${element.numbering
          }`;
      sentence.id = headerChildElement.id;
      sentence.iri = headerChildElement.IRI;
      //add children, except the one that is the header child element
      element.children.forEach((childElement) => {
        if (childElement != headerChildElement) {
          const childSentence = this.parseElementTree(childElement, level + 1);
          sentence.addChild(childSentence);
          childSentence.parent = sentence;
        }
      });
    } else if (element["@type"].includes("src:LeafElement")) {
      sentence.content = element.content;
    }
    return sentence;
  }
}
