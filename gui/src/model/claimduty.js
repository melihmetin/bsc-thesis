import { v4 as uuid4 } from 'uuid'

class Claimduty {
    constructor() {
        this._id = uuid4() //unique ID
        this._typeId = null
        this._shortName = ""
        this._claimduty = ""
        this._activeField = null
        this._duty = null
        this._claimant = null
        this._holder = null
        this._highlight = false
        this._comments = []
        this._generateLabelAutomatically = true //by default, label is generated automatically
        this.sourceSentences = []
    }
    get id() { return this._id }
    set id(id) { this._id = id }

    get typeId() { return this._typeId }
    set typeId(typeId) { this._typeId = typeId }

    get shortName() {
        return this._shortName// && this._label.length > 0
        // ? this._label
        // : this.claimduty.length > 25
        //     ? this.claimduty.substring(0, 25) + "..."
        //     : this.claimduty
    }
    set shortName(shortName) { this._shortName = shortName }

    get fullName() { return this._fullName }
    set fullName(fullName) { this._fullName = fullName }

    get activeField() { return this._activeField }
    set activeField(activeField) { this._activeField = activeField }

    get duty() { return this._duty }
    set duty(duty) { this._duty = duty }

    get claimant() { return this._claimant }
    set claimant(claimant) { this._claimant = claimant }

    get holder() { return this._holder }
    set holder(holder) { this._holder = holder }

    get allFrames() {
        const dutyFrames = this._duty ? this._duty.allFrames : []
        const claimantFrames = this._claimant ? this._claimant.allFrames : []
        const holderFrames = this._holder ? this._holder.allFrames : []
        return [...dutyFrames, ...claimantFrames, ...holderFrames]
    }

    //check if any of the roles has this frame, if so, remove it
    deleteReferencesToFrame(frame) {
        if (this._duty && this._duty.id == frame.id) {
            this._duty = null
        }
        if (this._claimant && this._claimant.id == frame.id) {
            this._claimant = null
        }
        if (this._holder && this._holder.id == frame.id) {
            this._holder = null
        }
    }

    get sentences() {
        const sentences = this.annotations.map(a => a.snippets.map(s => s.sentence)).flat()
        sentences.sort((s1, s2) => {
            return (s1.id < s2.id)
                ? -1
                : s1.id > s2.id
                    ? 1
                    : 0
        })
        return sentences
    }

    getSubTypeIdForActiveField() {
        const subTypeIdPerRole = {
            "duty": "duty",
            "claimant": "agent",
            "holder": "agent"
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
            case 'duty':
                this._duty = fact
                break
            case 'claimant':
                this._claimant = fact
                break
            case 'holder':
                this._holder = fact
                break
        }
    }

    checkFrameExistance(claimduty, element) {
        const duty = claimduty._duty !== null && claimduty._duty._id === element._id ? true : false;
        const claimant = claimduty._claimant !== null && claimduty._claimant._id == element._id
            ? true
            : false;
        const holder = claimduty._holder !== null && claimduty._holder._id == element._id
            ? true
            : false;

        const exist = [
            duty,
            claimant,
            holder
        ];

        if (exist.some((d) => d)) {
            claimduty._highlight = false
        } else {
            claimduty._highlight = true
        }
        return exist.some((d) => d)
    }

    // returns the ids of the containing facts
    //TODO: do we need this? needs updating because precondition is a BooleanConstruct now
    get childrenIds() {
        const facts = [
            this._duty,
            this._claimant,
            this._holder,
        ]

        return facts.filter(f => f).map(f => f._id)
    }

    toFlatObject() {
        return {
            id: this.id,
            typeId: this.typeId,
            label: this.shortName,
            claimduty: this.fullName,
            dutyId: this.duty?.id,
            actorId: this.claimant?.id, // Deprecated, but left in for backwards compatibility
            claimantId: this.claimant?.id,
            holderId: this.holder?.id,
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
        this._subTypeId = null //fullName has no subtype
        this._fullName = frameData.claimduty
        this._duty = frameData.dutyId ? allFrames.find(f => f.id == frameData.dutyId) : null
        this._claimant = frameData.claimantId ? allFrames.find(f => f.id == frameData.claimantId) : frameData.actorId ? allFrames.find(f => f.id == frameData.actorId) : null
        this._holder = frameData.holderId ? allFrames.find(f => f.id == frameData.holderId) : null
        //annotations, sourceSentences and comments are set in parseJsonToInterpretation in importExport.js
        this._generateLabelAutomatically = false
    }

    //construct label [action] [object] [actor] [recipient]
    generateLabel() {
        const dutyShortName = this._duty ? this._duty.shortName : '<duty>'
        const claimantShortName = this._claimant ? this._claimant.shortName : '<claimant>'
        const holderShortName = this._holder ? this._holder.shortName : '<holder>'

        this._shortName = `${dutyShortName} ${claimantShortName} ${holderShortName}`
        this._fullName = `${dutyShortName} ${claimantShortName} ${holderShortName}`
    }
}

export {
    Claimduty
}