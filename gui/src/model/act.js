import { v4 as uuid4 } from 'uuid'
import { BooleanConstruct } from './booleanConstruct.js'

class Act {
    constructor() {
        this._id = uuid4() //unique ID
        this._typeId = null
        this._shortName = ""
        this._fullName = ""
        this._activeField = null
        this._action = null
        this._actor = null
        this._object = null
        this._precondition = new BooleanConstruct()
        this._recipient = null
        this._creates = []
        this._terminates = []

        this._comments = []

        this._generateLabelAutomatically = true //by default, label is generated automatically TODO: generate on user request
        this.sourceSentences = []
    }
    get id() { return this._id }
    set id(id) { this._id = id }

    get typeId() { return this._typeId }
    set typeId(typeId) { this._typeId = typeId }

    get shortName() {
        return this._shortName
    }
    set shortName(shortName) { this._shortName = shortName }

    get fullName() {
        return this._fullName
    }
    set fullName(fullName) { this._fullName = fullName }

    get activeField() { return this._activeField }
    set activeField(activeField) { this._activeField = activeField }

    get action() { return this._action }
    set action(action) { this._action = action }

    get actor() { return this._actor }
    set actor(actor) { this._actor = actor }

    get object() { return this._object }
    set object(object) { this._object = object }

    get precondition() { return this._precondition }
    set precondition(precondition) { this._precondition = precondition }

    get recipient() { return this._recipient }
    set recipient(recipient) { this._recipient = recipient }

    get creates() { return this._creates }
    set creates(creates) { this._creates = creates }

    get terminates() { return this._terminates }
    set terminates(terminates) { this._terminates = terminates }

    getSubTypeIdForActiveField() {
        const subTypeIdPerRole = {
            "action": "action",
            "actor": "agent",
            "object": "object",
            "recipient": "agent"
        }
        return this._activeField in subTypeIdPerRole
            ? subTypeIdPerRole[this._activeField]
            : null
    }

    get comments() { return this._comments }
    set comments(comments) { this._comments = comments }

    get generateLabelAutomatically() { return this._generateLabelAutomatically }
    set generateLabelAutomatically(generateLabelAutomatically) { this._generateLabelAutomatically = generateLabelAutomatically }

    //sentences that contain source of this act. either because one of its parts has an annotation in the sentence
    //or because the user explicitly added the sentence from the source
    get sourceSentences() { return this._sourceSentences }
    set sourceSentences(sourceSentences) { this._sourceSentences = sourceSentences }


    addFrame(fact) {
        //todo: replace this code with: this[this._activeField] = fact
        switch (this._activeField) {
            case 'action':
                this._action = fact
                break
            case 'actor':
                this._actor = fact
                break
            case 'object':
                this._object = fact
                break
            case 'recipient':
                this._recipient = fact
                break
            case 'creates':
                this._creates.push(fact)
                break
            case 'terminates':
                this._terminates.push(fact)
                break;
        }
    }

    //check if any of the roles has this frame, if so, remove it
    deleteReferencesToFrame(frame) {
        if (this._action && this._action.id == frame.id) {
            this._action = null
        }
        if (this._actor && this._actor.id == frame.id) {
            this._actor = null
        }
        if (this._object && this._object.id == frame.id) {
            this._object = null
        }
        if (this._recipient && this._recipient.id == frame.id) {
            this._recipient = null
        }
        const indexCreates = this._creates.findIndex(f => f.id == frame.id)
        if (indexCreates != -1) {
            this._creates.splice(indexCreates, 1)
        }
        const indexTerminates = this._creates.findIndex(f => f.id == frame.id)
        if (indexTerminates != -1) {
            this._creates.splice(indexTerminates, 1)
        }
        this._precondition.removeFrame(frame)
    }

    toFlatObject() {
        console.log("toFlatObject act", this)
        return {
            id: this.id,
            typeId: this.typeId, //type is an object {id, class, label}
            label: this.shortName,
            act: this.fullName,
            actionId: this.action?.id, //take frame id instead of frame object
            actorId: this.actor?.id,
            objectId: this.object?.id,
            precondition: this.precondition.toFlatObject(), //boolean construct
            recipientId: this.recipient?.id,
            creates: this.creates.map(f => f.id),
            terminates: this.terminates.map(f => f.id),
            comments: this.comments.map(c => c.toFlatObject()),
            sourceSentences: this.sourceSentences.map(s => ({
                documentId: s.sourceDocument.id,
                sentenceId: s.id
            }))
        }
    }

    fromFlatObject(frameData, allFrames) {
        this._id = frameData.id
        this._shortName = frameData.label
        this._typeId = frameData.typeId
        this._fullName = frameData.act
        this._action = frameData.actionId ? allFrames.find(f => f.id == frameData.actionId) : null
        this._actor = frameData.actorId ? allFrames.find(f => f.id == frameData.actorId) : null
        this._object = frameData.objectId ? allFrames.find(f => f.id == frameData.objectId) : null
        this._precondition = new BooleanConstruct()
        this._precondition.fromFlatObject(frameData.precondition, allFrames)
        this._recipient = frameData.recipientId ? allFrames.find(f => f.id == frameData.recipientId) : null
        this._creates = frameData.creates.map(id => allFrames.find(f => f.id == id)).filter(f => f !== undefined)
        this._terminates = frameData.terminates.map(id => allFrames.find(f => f.id == id)).filter(f => f !== undefined)
        //annotations, sourceSentences and comments are set in parseJsonToInterpretation in importExport.js
        this._generateLabelAutomatically = false
    }

    //construct label [action] [object] [actor] [recipient]
    generateLabel() {
        const actionShortName = this._action ? this._action.shortName : '<action>'
        const objectShortName = this._object ? this._object.shortName : '<obj>'
        const actorShortName = this._actor ? this._actor.shortName : '<actor>'
        const recipientShortName = this._recipient ? this._recipient.shortName : '<rec>'

        this._shortName = `${actionShortName} ${objectShortName} ${actorShortName} ${recipientShortName}`
        this._fullName = `${actionShortName} ${objectShortName} ${actorShortName} ${recipientShortName}`
    }

}

export {
    Act
}