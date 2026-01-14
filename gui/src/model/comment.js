import { v4 as uuid4 } from 'uuid'

export class Comment {
    constructor() {
        this._id = uuid4() //unique ID
        this._content = ""; //the actual content (text) of the comment
        this._author = "Guest"; //id of the user that created this comment, for now: 'user'
        this._createdAt = new Date(); //date and time of creation of this comment TODO: init here?
        this._lastEditedAt = null; //date and time of updating of this comment
    }

    get content() { return this._content }
    set content(content) { this._content = content }

    get author() { return this._author }
    set author(author) { this._author = author }

    get createdAt() { return this._createdAt }
    set createdAt(createdAt) { this._createdAt = createdAt }

    get lastEditedAt() { return this._lastEditedAt }
    set lastEditedAt(lastEditedAt) { this._lastEditedAt = lastEditedAt }

    // for the time being, a comment is saved as a flat string (its content), no other fields are stored
    toFlatObject() {
        return {
            content: this._content,
            author: this._author,
            createdAt: this._createdAt.toISOString(),
            lastEditedAt: this._lastEditedAt ? this._lastEditedAt.toISOString() : null
        }
    }

    // a comment is a string, which is the content of the comment. user and timestamp are not yet stored
    fromFlatObject(commentData) {
        //for backwards compatibility: commentData can be an object (new version) or a single string (old version)
        if (typeof commentData === 'object') {
            this._content = commentData.content
            this._author = commentData.author
            this._createdAt = new Date(commentData.createdAt)
            this._lastEditedAt = commentData.lastEditedAt ? new Date(commentData.lastEditedAt) : null
        } else {
            this._content = commentData
        }
    }
}