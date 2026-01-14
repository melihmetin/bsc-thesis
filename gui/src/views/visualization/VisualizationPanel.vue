<!-- shows the actual visualization: the overall node-link graph of acts, and the detailed tree-view of a frame -->
<template>
    <div class="fit relative">
        <NodeLinkDiagram :nodes="network.nodes" :links="network.links"/>
        <div v-if="selectedNode" class="overlay no-pointer-events">
            <FrameDetailsTreePlot :frame="selectedNode.frame"/>
        </div>
    </div>
</template>

<script>
import NodeLinkDiagram from "../../components/NodeLinkDiagram.vue";
import {Network} from "../../model/viz/network.js" // class for storing data on nodes and links
import FrameDetailsTreePlot from "../../components/FrameDetailsTreePlot.vue";

export default {
    data: () => ({
        
    }),
    components: {
        NodeLinkDiagram,
        FrameDetailsTreePlot
    },
    computed: {
        frames() {
            return this.$store.state.frames;
        },
        network() {
            return new Network(this.frames) //if frames changes, maybe not recreate a whole new network?
        },
        selectedNode() {
            return this.$store.state.selectedNode
        }
    }
}
</script>

<style>
.relative {
    position:relative;
}
.overlay {
    position:absolute;
    top:10px;
    bottom:10px;
    right: 10px;
    width: 400px;
}
</style>