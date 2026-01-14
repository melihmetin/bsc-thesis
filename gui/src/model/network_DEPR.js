//class for storing nodes and links, used for visualization of an interpretation
import { v4 as uuid4 } from 'uuid'

export class Network {
    constructor() {
        this._nodes = []
        this._links = []
    }

    get nodes() { return this._nodes }
    get links() { return this._links }

    //create all nodes and links for the interpretation
    //each node corresponds to a frame. Links are derived from
    //relations between frames (roles, subdivision, operand).
    //In addition we add links between acts, indicating that an act
    //has to finish before another can start.
    createNetwork(frames) {
        frames.forEach(frame => {
            this.addTreeForFrame(frame)
        })
    }

    addTreeForFrame(frame) {
        let node = null
        switch (frame.typeId) {
            case "act":
                node = this.addTreeForAct(frame)
                break;
            case "claim_duty":
                node = this.addTreeForClaimDuty(frame)
                break;
            default:
                node = this.addTreeForFact(frame)
        }
        return node
    }

    addTreeForAct(act) {
        const { node: actNode } = this.getNode(act)
        //add nodes and links for roles with one frame
        const rolesWithOneFrame = ["action", "actor", "object", "recipient"]
        rolesWithOneFrame.forEach(roleAttribute => {
            if (act[roleAttribute]) {
                //if act has this role filled in, get corresponding nodeTree.
                //the fact for this role can be subdivided, so in general this
                //is a node tree
                const roleNode = this.addTreeForFrame(act[roleAttribute])
                if (roleNode) {
                    this.addLink(actNode, roleNode, "role", roleAttribute)
                }
            }
        })
        //add nodes and links for roles with multiple frames
        const rolesWithMultipleFrames = ["creates", "terminates"]
        rolesWithMultipleFrames.forEach(roleAttribute => {
            //get node trees for this attribute,
            const roleRootNodes = act[roleAttribute].map(frame => this.addTreeForFrame(frame))
            if (roleRootNodes.length == 1) {
                //only one frame in this property: create node and connect with act
                this.addLink(actNode, roleRootNodes[0], "role", roleAttribute)
            } else if (roleRootNodes.length > 1) {
                //multiple nodes for this property: add anonymous node
                const anonymousNode = this.createAnonymousNode("list", "list") //label, subType
                this.addLink(actNode, anonymousNode, "role", roleAttribute) //source, target, linktype, label
                roleRootNodes.forEach(roleNode => {
                    this.addLink(anonymousNode, roleNode, "list", "") //source, target, linktype, label
                })
            }
        })
        //add nodes and links for boolean construct (precondition role)
        //precondition is never null, it always contains a booleanconstruct, but the booleanconstruct
        //can be empty (i.e. no frame and no children). In that case, an empty node is returned.
        const booleanConstructRootNode = this.addTreeForBooleanConstruct(act.precondition)
        if (booleanConstructRootNode) {
            this.addLink(booleanConstructRootNode, actNode, "role", "precondition") //source, target, linktype, label
        }
        return actNode
    }

    addTreeForClaimDuty(claimDuty) {
        const { node: claimDutyNode } = this.getNode(claimDuty)
        //add nodes and links for roles with one frame
        const rolesWithOneFrame = ["duty", "claimant", "holder"]
        rolesWithOneFrame.forEach(roleAttribute => {
            if (claimDuty[roleAttribute]) {
                //if claimDuty has this role filled in, get corresponding nodeTree.
                //the fact for this role can be subdivided, so in general this
                //is a node tree
                const roleNode = this.addTreeForFrame(claimDuty[roleAttribute])
                if (roleNode) {
                    this.addLink(claimDutyNode, roleNode, "role", roleAttribute)
                }
            }
        })
        return claimDutyNode
    }

    addTreeForFact(fact) {
        const { node: factNode, isNew: isNewNode } = this.getNode(fact)
        //if fact node already exists, we don't want to have another link to its subdivision
        if (isNewNode) {
            const subdivisionRoot = this.addTreeForBooleanConstruct(fact.subdivision)
            if (subdivisionRoot) {
                this.addLink(factNode, subdivisionRoot, "subdivision", "subdivision")
            }
        }
        return factNode
    }

    addTreeForBooleanConstruct(booleanConstruct) {
        //if BC has a frame, create corresponding nodeTree, else create an anonymous node
        let bcRoot = null
        if (booleanConstruct.frame) {
            bcRoot = this.addTreeForFrame(booleanConstruct.frame)
        } else {
            //create nodes for children. If there are more than zero: create
            //anonymous node to connect them
            const childrenNodes = booleanConstruct.children
                .map(child => this.addTreeForBooleanConstruct(child))
                .filter(node => node)
            if (childrenNodes.length > 0) {
                const anonymousNode = this.createAnonymousNode(booleanConstruct.operatorToJoinChildren, "booleanConstruct")
                childrenNodes.forEach(node => {
                    this.addLink(anonymousNode, node, "booleanConstruct", "")
                })
                bcRoot = anonymousNode
            }
            //if childrenNodes.length == 0, bcRoot stays null. That means that the 
        }
        //if this bc is negated and not empty, add an extra anonymous node representing 'NOT'
        if (bcRoot && booleanConstruct.isNegated) {
            const notNode = this.createAnonymousNode("not", "booleanConstruct") //label, subtype
            this.addLink(notNode, bcRoot, "booleanConstruct", "") //type, label
            return notNode
        } else {
            return bcRoot
        }

    }

    //return nodes that are in the subtree of the node
    //are considered only in the direction from source to target.
    //returned list does not include node itself
    //we need to keep track of foundDescendants to prevent getting stuck in a loops
    getDescendants(node, foundDescendantsIds) {
        let nodeList = []
        const childNodes = this._links.filter(l => l.source.id == node.id).map(l => l.target)
        childNodes.forEach(childNode => {
            if (!(foundDescendantsIds.includes(childNode.id))) {
                nodeList.push(childNode)
                foundDescendantsIds.push(childNode.id)
                nodeList = nodeList.concat(this.getDescendants(childNode, foundDescendantsIds))
            }
        })
        return nodeList
    }

    //get nodes that are linked to the given node, regardless of the direction of the link
    getDirectlyLinkedNodes(node) {
        const descendingNodes = this._links.filter(l => l.source.id == node.id).map(l => l.target)
        const ascendingNodes = this._links.filter(l => l.target.id == node.id).map(l => l.source)
        return descendingNodes
            .concat(ascendingNodes)
            .filter((frame, index, array) => array.findIndex(f => f.id == frame.id) === index)
    }

    addLink(sourceNode, targetNode, linkType, label) {
        //TODO: do we need to check if link is already there?
        this._links.push({
            source: sourceNode,
            target: targetNode,
            type: linkType, //TODO: needed?
            label: label
        })
    }

    //get node for frame. if there is not already a node for this frame,
    //create a new one.
    getNode(frame) {
        let node = this._nodes.find(n => n.id == frame.id)
        let isNew = false
        if (!node) {
            node = {
                id: frame.id,
                label: frame.shortName,
                type: frame.typeId,
                subType: frame.subTypeId,
                sequenceIndex: null, //index of act nodes in chain of dependency
                preferredPosition: null
            }
            this._nodes.push(node)
            isNew = true
        }
        return { node, isNew }
    }

    createAnonymousNode(label, subType) {
        const node = {
            id: uuid4(),
            label: label,
            type: "anonymous",
            subType: subType,
            sequenceIndex: null,
            preferredPosition: null
        }
        this._nodes.push(node)
        return node
    }

    addLink(sourceNode, targetNode, linkType, label) {
        //TODO: do we need to check if link is already there?
        this._links.push({
            source: sourceNode,
            target: targetNode,
            type: linkType, //TODO: needed?
            label: label
        })
    }

    //compare each act node with all other act nodes to see if there is a dependency.
    //this is the case when one act creates a frame that is part of the precondition
    //of the other act
    //we assume (for now) that there are no dependency links where source act == target act,
    //i.e. an act is not dependent on itself
    //(which actually does happen in the Participatiewet, this could be a modeling error)
    addDependencyLinksBetweenActNodes() {
        const actNodes = this._nodes.filter(n => n.type == "act")
        actNodes.forEach(sourceActNode => {
            const createdRoleNode = this.findRelatedNode(sourceActNode, "creates")
            if (createdRoleNode) {
                const factNodesCreatedBySourceAct = [createdRoleNode].concat(this.getDescendants(createdRoleNode, [createdRoleNode.id]))
                actNodes.forEach(targetActNode => {
                    //exclude self-loops
                    if (targetActNode.id != sourceActNode.id) {
                        const preconditionNode = this.findRelatedNode(targetActNode, "precondition")
                        if (preconditionNode) {
                            const factNodesInPreconditionOfTargetAct = [preconditionNode].concat(this.getDescendants(preconditionNode, [preconditionNode.id]))
                            //if there is a fact present in both factNodesCreatedBySource and factNodesInPreconditionOfTargetAct
                            //then target act is dependent of source act
                            if (factNodesCreatedBySourceAct.some(sourceNode => factNodesInPreconditionOfTargetAct.some(targetNode => sourceNode.id == targetNode.id))) {
                                this.addLink(sourceActNode, targetActNode, "dependency", "before") //source, target, type, label
                            }
                        }
                    }
                })
            }
        })
    }

    //assign sequence index to each act node, indicating how far in the sequence of dependencies this
    //act is. we use this to position act nodes in the network, laying out chains of dependent acts
    //from left to right.
    setSequenceOfActnodes() {
        const actNodes = this._nodes.filter(n => n.type == "act")
        const dependencyLinks = this._links.filter(l => l.type == "dependency")
        //start with act nodes that are at the beginning of a sequence
        const actNodesAtBeginning = actNodes.filter(act => !(dependencyLinks.some(link => link.target.id == act.id)))
        //set all sequence index values to null
        actNodes.forEach(actNode => { actNode.sequenceIndex = null })
        actNodesAtBeginning.forEach(actNode => {
            setSequenceIndexOfAct(actNode, 0, dependencyLinks, actNodes)
        })
    }

    //returns node that is related to the given node by a relation
    //with the given relationType, regardless of the direction of the relation
    //TODO return list of nodes?
    findRelatedNode(node, linkLabel) {
        const link = this._links.find(l => (l.source.id == node.id || l.target.id == node.id) && l.label == linkLabel)
        return link
            ? link.source.id == node.id
                ? link.target
                : link.source
            : null
    }


    printInConsole() {
        console.log("=== NODES ===")
        this._nodes.forEach(n => {
            console.log(n.label, n.type, n.subType, n.id)
        })
        console.log("=== LINKS ===")
        this._links.forEach(l => {
            console.log(l.label, l.type, l.source.id, l.target.id)
        })
    }

    //return node with given id (which equals the id of the corresponding frame)
    getNodeById(id) {
        return this._nodes.find(n => n.id == id)
    }
}

function setSequenceIndexOfAct(actNode, newIndex, links, nodes) {
    //an act may be reached via different paths
    //set index to max of current index (if any) and newIndex
    if ((!(actNode.sequenceIndex)) || actNode.sequenceIndex < newIndex) {
        actNode.sequenceIndex = newIndex
        //follow outgoing relations only
        const outgoingLinks = links.filter(l => l.source.id == actNode.id)
        outgoingLinks.forEach(link => {
            const nextActNode = nodes.find(n => n.id == link.target.id)
            setSequenceIndexOfAct(nextActNode, newIndex + 1, links, nodes)
        })
    }
}
