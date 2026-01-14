import { v4 as uuid4 } from 'uuid'
import { BooleanConstruct } from './booleanConstruct.js'

export class Fact {
    constructor(initialLabel) {
        this._id = uuid4() //unique ID
        this._shortName = initialLabel //label as visible in the chip
        this._fullName = initialLabel //longer description of the fact
        this._typeId = null //type id
        this._subTypeIds = [] //subtype ids, a fact can have multiple subtypes
        this._comments = [] //comments from interpretor about this fact
        this._subdivision = new BooleanConstruct()
        this.addSubdivision()
        this._isComplex = true
        this._parents = [] //keep track of relation frames that this fact has a role in. later: also subdivision, booleanconstruct, etc
    }


    /*
     It adds an extra level of hierarchy, since a fact can not be without function. It should be used when a user
     adds an extra level of hierarchy, since a fact can not be without function.
   */
    addSubdivision() {
        this._subdivision.subdivide();
    }

    get id() { return this._id }
    set id(id) { this._id = id }

    get typeId() { return this._typeId }
    set typeId(typeId) { this._typeId = typeId }

    get subTypeIds() { return this._subTypeIds }
    set subTypeIds(subTypeIds) { this._subTypeIds = subTypeIds }

    get isComplex() { return this._isComplex }
    set isComplex(isComplex) { this._isComplex = isComplex }

    get shortName() { return this._shortName }
    set shortName(shortName) { this._shortName = shortName }

    get fullName() { return this._fullName }
    set fullName(fullName) { this._fullName = fullName }

    get subdivision() { return this._subdivision }
    set subdivision(subdivision) { this._subdivision = subdivision }

    get comments() { return this._comments }
    set comments(comments) { this._comments = comments }

    //returns this frame and all its subframes, as a list
    get allFrames() {
        return [this, ...this._subdivision.allFrames]
    }

    get parents() { return this._parents }
    set parents(parents) { this._parents = parents }

    deleteReferencesToFrame(frame) {
        this._subdivision.removeFrame(frame)
    }

    //based on sentenceId and documentId from each snippet, retrieve the sentence object from the source
    getSentences(sourceDocs) {
        const snippets = this._annotations.map(a => a.snippets).flat()
        //group snippets according to document
        const snippetsPerDoc = Object.groupBy(snippets, s => s.documentId)
        console.log("snippetsPerDoc", snippetsPerDoc)
        return []
    }
    toFlatObject() {
        return {
            id: this.id,
            label: this.shortName,
            fact: this.fullName,
            typeId: this.typeId,
            subTypeIds: this.subTypeIds,
            comments: this.comments.map(c => c.toFlatObject()),
            isComplex: this.isComplex,
            subdivision: this.subdivision.toFlatObject()
        }
    }

    //fiil frame with data
    fromFlatObject(data, allFrames) {
        this.shortName = data.label
        this.fullName = data.fact
        this.typeId = data.typeId
        //backwards compatible with reading facts that have single subtype:
        this.subTypeIds = "subTypeIds" in data ? data.subTypeIds : data.subTypeId ? [data.subTypeId] : []
        this.isComplex = data.isComplex
        this.subdivision = new BooleanConstruct()
        this.subdivision.fromFlatObject(data.subdivision, allFrames)
        //annotations and comments are set in parseJsonToInterpretation in importExport.js
    }
}

