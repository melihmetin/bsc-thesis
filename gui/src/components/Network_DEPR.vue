<template>
    <NetworkMenu />
    <ForceDirectedGraph :nodesAndLinks="visibleNetwork" @node-clicked="toggleCollapse" />
</template>

<script>
import { Network } from "../model/network.js"
import NetworkMenu from "./NetworkMenu.vue"
import { hexColorsLight, nodeSizes } from "../helpers/config.js"
import ForceDirectedGraph from "./ForceDirectedGraph.vue";
import { max } from "d3-array"

export default {
    data: () => ({
        colors: hexColorsLight,
        //when laying out sequence of acts, aim for this distance between them
        horizontalDistanceBetweenActs: 100,
        idsOfNodesInNetwork: []
    }),
    components: {
        ForceDirectedGraph,
        NetworkMenu
    },
    mounted() {
        //check if a frame is selected, if so, set this as starting point for the network
        //else show all nodes
        if (this.frameBeingEdited) {
            this.idsOfNodesInNetwork = [this.frameBeingEdited.id]
        } else {
            this.idsOfNodesInNetwork = this.network.nodes.map(n => n.id)
        }
    },
    computed: {
        frames() {
            return this.$store.state.frames;
        },
        frameBeingEdited() {
            return this.$store.state.frameBeingEdited
        },
        framesOpenInEditor() {
            return this.$store.state.framesOpenInEditor
        },
        frameFilter() {
            return this.$store.state.frameFilter
        },
        showDependenciesBetweenActs() {
            return this.$store.state.showDependenciesBetweenActs
        },
        idsOfActsOpenInEditor() {
            return this.framesOpenInEditor.filter(f => f.typeId == "act").map(act => act.id)
        },
        //get the complete network, with all nodes and links based on the interpretation
        network() {
            const network = new Network()
            network.createNetwork(this.frames)
            //add styling: color and size
            network.nodes.forEach(node => {
                node.color = node.subType ? hexColorsLight[node.subType] : hexColorsLight[node.type]
                node.radius = nodeSizes[node.type]
                node.isInVisualization = false
                node.isCollapsed = true //don't show children
            })
            //add styling: color and arrow
            network.links.forEach(link => {
                link.color = link.type == "dependency" ? hexColorsLight["act"] : "#999999"
            })
            //add preferred positions for act nodes if they have a sequence index set
            const actNodesWithSequenceIndex = network.nodes.filter(n => n.type == "act" && n.sequenceIndex)
            //get largest sequence index
            const largestSequenceNumber = max(actNodesWithSequenceIndex.map(n => n.sequenceIndex))
            actNodesWithSequenceIndex.forEach(actNode => {
                actNode.preferredPosition = {
                    x: (actNode.sequenceIndex - largestSequenceNumber / 2) * this.horizontalDistanceBetweenActs,
                    strength: 0.3
                }
            })
            return network
        },
        visibleNetwork() {
            //get the nodes and links that comply with 'idsOfNodesInNetwork' and the filter
            const visibleNodes = this.network.nodes.filter(n => this.idsOfNodesInNetwork.includes(n.id) && this.nodeFitsFilter(n, this.frameFilter))
            console.log("visibleNodes", visibleNodes)
            const visibleNodeIds = visibleNodes.map(n => n.id)
            const visibleLinks = this.network.links
                .filter(l => visibleNodeIds.includes(l.source.id)
                && visibleNodeIds.includes(l.target.id))
                .filter(l => this.showDependenciesBetweenActs || l.type != "dependency")
            console.log("visible links", visibleLinks)
            return { nodes: visibleNodes, links: visibleLinks } //this triggers redrawing the network
        }
    },
    methods: {
        toggleCollapse(node) {
            const relatedNodes = this.network.getDirectlyLinkedNodes(node)
            if (node.isCollapsed) {
                //show immediate children
                node.isCollapsed = false
                relatedNodes.forEach(relatedNode => {
                    if (!(this.idsOfNodesInNetwork.includes(relatedNode.id))) {
                        this.idsOfNodesInNetwork.push(relatedNode.id)
                    }
                })
            } else {
                //TODO: what should happen if you click an expanded node?
                // node.isCollapsed = true
                // relatedNodes.forEach(relatedNode => {
                //     const nodeIndex = this.idsOfNodesInNetwork.indexOf(relatedNode.id)
                //     this.idsOfNodesInNetwork.splice(nodeIndex, 1)
                //     relatedNode.isCollapsed = true
                // })
            }
            this.idsOfNodesInNetwork = [...this.idsOfNodesInNetwork]
        },
        nodeFitsFilter(node, filter) {
            return Object.keys(filter).length == 0
                || (filter[node.type].selected && (
                    !("subTypes" in filter[node.type]) ||
                    !(node.subType) ||
                    filter[node.type].subTypes[node.subType].selected)
                )
        }
    }
}

</script>

<style>
.height-fill-available {
    width: 100%;
    height: 100%;
    flex: 1;
    /* Fill available height */
    overflow-y: auto;
    /* Enable vertical scrolling */
}
</style>