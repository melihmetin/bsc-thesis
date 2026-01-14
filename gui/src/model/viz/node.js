import { v4 as uuid4 } from 'uuid'

export class Node {
    constructor() {
        this._id = uuid4()
        this._frame = null
        this._incomingLinks = []
        this._outgoingLinks = []
        this._collapsed = false
        //used in bc-treeview, not used in network. there x and y is added by forcedirected.
        this._position = [] //position [x,y] of node. If empty, then node is invisible
        this._operator = "" //in case this is a node representing a boolean function (like AND, OR, etc)
        this._negated = false //in case the node is subject of a negation function in a boolean construct
    }

    get frame() { return this._frame }
    set frame(frame) { this._frame = frame }

    get id() { return this._id }

    get incomingLinks() { return this._incomingLinks }
    set incomingLinks(incomingLinks) { this._incomingLinks = incomingLinks }

    get outgoingLinks() { return this._outgoingLinks }
    set outgoingLinks(outgoingLinks) { this._outgoingLinks = outgoingLinks }

    get collapsed() { return this._collapsed }
    set collapsed(collapsed) { this._collapsed = collapsed }

    get position() { return this._position }
    set position(position) { this._position = position }

    get operator() { return this._operator }
    set operator(operator) { this._operator = operator }

    get negated() { return this._negated }
    set negated(negated) { this._negated = negated }

}