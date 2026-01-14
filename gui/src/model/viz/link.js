export class Link {
    constructor(sourceNode, targetNode, type, directed) {
        this._source = sourceNode //.id
        this._target = targetNode //.id
        this._type = type
        this._directed = directed // if directed, an arrow will be drawn
    }

    get source() { return this._source }
    set source(source) { this._source = source } //used by forcedir simulation
    get target() { return this._target }
    set target(target) { this._target = target } //used by forcedir simulation
    get directed() { return this._directed }
}