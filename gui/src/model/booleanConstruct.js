import { v4 as uuid4 } from 'uuid'

export class BooleanConstruct {
    constructor() {
        this._id = uuid4() //unique ID, used to create anonymous frames in the network visualization needed by the only
        // used for the hierarchical view, too
        this._frame = null // if _frame has a value, this BC is 'atomic', it has no children. Its value is a frame.
        this._isNegated = false
        this._children = [] // list of BooleanConstructs if _frame is null
        this._operatorToJoinChildren = null //"and" // or "or"
        this._parent = null
    }

    get id() { return this._id }
    set id(id) { this._id = id }

    get isNegated() { return this._isNegated }
    set isNegated(isNegated) { this._isNegated = isNegated }

    get parent() { return this._parent }
    set parent(parent) { this._parent = parent }

    get operatorToJoinChildren() { return this._operatorToJoinChildren; }
    set operatorToJoinChildren(operator) { this._operatorToJoinChildren = operator; }

    get children() { return this._children; }
    set children(children) { this._children = children; }

    get level() { return this._parent ? this._parent.level + 1 : 0; }

    get frame() { return this._frame }
    set frame(frame) { this._frame = frame }

    //get all frames in this expression, on all levels
    get allFrames() {
        return this._frame
            ? this._frame.allFrames //returns this.frame and all frames in its subdivision (if any)
            : this._children.map(booleanConstruct => booleanConstruct.allFrames)
                .flat()
    }

    //get all frames in this expression, but do not consider subdivisions of frames
    //we use this to show sentences of the precondition in the sourceview of an act
    get allFramesNoSubdivision() {
        let frames = []
        if (this._frame) {
            frames = [this._frame]
        } else {
            this._children.forEach(booleanConstruct => {
                frames = frames.concat(booleanConstruct.allFramesNoSubdivision)
            })
        }
        return frames
    }

    //true if there is no frame down the tree
    get isEmpty() { return (this._frame == null) && (!this._children.some(child => !child.isEmpty)) }

    addChild(child) {
        this._children.push(child);
        child.parent = this;
    }

    addEmptyChild() {
        let child = new BooleanConstruct();
        this.addChild(child);
        return child; //boolean construct being edited is set to newly created child
    }

    removeChild(child) {
        const index = this._children.indexOf(child);
        if (index != -1) {
            this._children.splice(index, 1);
        }
    }

    addParent() {
        let newParent = new BooleanConstruct();
        const oldParent = this.parent;
        //replace child of existing parent by new parent
        if (this.parent) {
            const index = this.parent.children.indexOf(this);
            oldParent.children[index] = newParent;
            newParent.parent = oldParent;
        }

        newParent.addChild(this);
        this.parent = newParent;
    }

    subdivide() {
        //create copy of current
        let bcCopy = new BooleanConstruct();
        bcCopy.frame = this.frame;
        bcCopy.children = [...this.children];
        bcCopy.isNegated = this.isNegated;
        bcCopy.operatorToJoinChildren = this.operatorToJoinChildren;
        //clean current
        this.clean();
        this.addChild(bcCopy);
        // the default function should be AND
        this.operatorToJoinChildren = 'and'
        //this.addEmptyChild()
    }

    delete() {
        const index = this.parent.children.indexOf(this);
        console.log("index", index);
        this.parent.children.splice(index, 1);
    }

    clean() {
        this.frame = null
        this.children = []
        this.isNegated = false
        this.operatorToJoinChildren = null
    }

    removeFrame(frame) {
        if (this._frame?.id == frame.id) {
            this._frame = null
            console.log("set frame to null in boolean construct")
            //remove itself from the children of the parent, unless
            //the parent is the top of the tree, and this is its last child
            if (this._parent) {
                if (this._parent.parent || this._parent.children.length > 1) {
                    const childIndex = this._parent.children.indexOf(this)
                    this._parent.children.splice(childIndex, 1)
                }
                if (this._parent.children.length <= 1) {
                    this._parent.operatorToJoinChildren = null
                }
            }
        } else {
            this._children.forEach(c => {
                c.removeFrame(frame)
            })
        }
    }

    //returns object with references to other frames by id
    toFlatObject() {
        return {
            frame: this.frame?.id,
            isNegated: this.isNegated,
            children: this._children
                .filter((c) => c.frame || c.children.length > 0)
                .map((c) => c.toFlatObject()),
            operatorToJoinChildren: this._operatorToJoinChildren,
        };
    }

    //populate the attributes of this object with the given data
    fromFlatObject(bcData, allFrames) {
        this._frame = bcData.frame ? allFrames.find(f => f.id == bcData.frame) : null
        this._isNegated = bcData.isNegated
        this._operatorToJoinChildren = bcData.operatorToJoinChildren
        this._children = bcData.children.map(cData => {
            let child = new BooleanConstruct()
            //populate child with data
            child.fromFlatObject(cData, allFrames)
            child._parent = this
            return child
        })
    }

    //return human-readable string representing this boolean construct
    toString() {
        let s = "\t-"
        if (this.frame) {
            return this.frame.label
        } else if (this.children.length > 0) {
            s = this.operatorToJoinChildren
            s += this.children.map(child =>
                "\t" + child.toString()
            ).join("\n")
        }
        return s
    }
}
