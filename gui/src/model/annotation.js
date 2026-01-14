import { v4 as uuid4 } from "uuid";

class Annotation {
  constructor() {
    this._id = uuid4() //unique ID
    this._frame = null; //fact, act, or duty that is annotation is the source of
    this._addingToExistingFrame = false; //true if user wants to add this annotation to an existing frame
    this._nrSnippets = 0 //length of annotation, used for displaying underlining in source for this annotation
    this._verticalPosition = 0 //used for displaying underlining in source for this annotation
  }

  get id() {
    return this._id
  }

  get frame() {
    return this._frame;
  }
  set frame(frame) {
    this._frame = frame;
  }

  get addingToExistingFrame() {
    return this._addingToExistingFrame;
  }
  set addingToExistingFrame(addingToExistingFrame) {
    this._addingToExistingFrame = addingToExistingFrame;
  }

  get nrSnippets() {
    return this._nrSnippets
  }

  set nrSnippets(nrSnippets) {
    this._nrSnippets = nrSnippets
  }

  get verticalPosition() {
    return this._verticalPosition
  }
  set verticalPosition(verticalPosition) {
    this._verticalPosition = verticalPosition
  }
}


export { Annotation };
