<template>
    <div class="height-fill-available" ref="container" @mousemove="handleMouseMove($event)"
    @mouseup="handleMouseUp($event)">
        <svg :width="width" :height="height" ref="svg" >
        
            <defs>
                <!-- A marker to be used as an arrowhead -->
                <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6"
                    orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#c0b3ff" />
                </marker>
                <marker id="arrowGrey" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6"
                    orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#999999" />
                </marker>
            </defs>
            <rect :width="width" :height="height" fill="#eeeeee"
            
            />
            <g ref="network" >
                <g :transform="`translate(${width / 2},${height / 2})`">

                    <g id="links">
                        <line v-for="link in linksInSimulation" :x1="link.source.x" :y1="link.source.y"
                            :x2="getArrowEndpointX(link)" :y2="getArrowEndpointY(link)" :stroke="link.color"
                            :marker-end="link.type == 'dependency' ? 'url(#arrow)' : 'url(#arrowGrey)'" />
                    </g>
                    <g id="nodes">
                        <circle v-for="node in nodesInSimulation" :cx="node.x" :cy="node.y" :r="node.radius"
                            :fill="node.color" :stroke="node.stroke" stroke-width="2"
                            @mousedown="handleMouseDown($event, node)"/>
                    </g>
                    
                    <g id="edge-labels">
                        <g v-for="link in linksInSimulation" :transform="getTransformForLinkLabel(link)">
                            <text dy="-2" text-anchor="middle" :fill="link.color" font-size="7">{{ link.label }}</text>
                        </g>
                    </g>
                    <g id="node-labels">
                        <text v-for="node in nodesInSimulation" :x="node.x" :y="node.y" dy="2" text-anchor="middle"
                            fill="#333333" font-size="9">{{ node.label }}</text>
                    </g>
                </g>
            </g>
        </svg>
    </div>
</template>
<!-- @click="$emit('node-clicked', node)" @mouseover="printNode(node)" -->

<script>
import { forceSimulation, forceX, forceY, forceManyBody, forceLink } from "d3-force"
import { select } from "d3-selection"
import { zoom } from "d3-zoom"
export default {
    data: () => ({
        simulation: null,
        nodesInSimulation: [],
        linksInSimulation: [],
        width: 800,
        height: 600,
        draggedNode: null,
        mouseDownPos: null, //to see if node is just clicked or also dragged
        currentZoomLevel: 1
    }),
    props: {
        nodesAndLinks: Object
    },
    emits: ['node-clicked'],
    mounted() {
        this.initZoom()
        this.initSimulation()
        this.restartSimulation()
    },
    computed: {
        frames() {
            return this.$store.frames
        }
    },
    methods: {
        initZoom() {
            select(this.$refs.svg).call(zoom().on("zoom",
                (e) => {
                    this.currentZoomLevel = e.transform.k;
                    select(this.$refs.network).attr("transform", e.transform)
                }
            ))
        },
        initSimulation() {
            //const fX = forceX(0).strength(0.1);
            const fX = forceX((node) => { return node.preferredPosition ? node.preferredPosition.x : 0 })
                .strength((node) => { return node.preferredPosition ? node.preferredPosition.strength : 0.1 })
            const fY = forceY(0).strength(0.1);
            this.simulation = forceSimulation(this.nodesInSimulation)
                .force("x", fX)
                .force("y", fY)
                .force("charge", forceManyBody().strength(-500))
                .force("link", forceLink(this.linksInSimulation).strength(.4))
                // .force(
                //     "collide",
                //     forceCollide()
                //         .radius((n) => 120)
                //         .iterations(3)
                // )
                .on("tick", () => this.tick())
                // .alphaDecay(0.0228)
                .alphaDecay(0.01)

        },
        tick() {
            this.nodesInSimulation = [...this.nodesInSimulation]
            this.linksInSimulation = [...this.linksInSimulation]
        },
        restartSimulation() {
            //todo keep location if node already exists, so that network
            //updates are more smoothly
            //store location of each node in simulation
            let locations = {}
            this.nodesInSimulation.forEach(node => {
                if ("x" in node && "y" in node) {
                    locations[node.id] = [node.x, node.y]
                }
            })
            this.nodesInSimulation = [...this.nodesAndLinks.nodes]
            this.linksInSimulation = [...this.nodesAndLinks.links]
            //re-assign locations
            this.nodesInSimulation.forEach(node => {
                if (node.id in locations) {
                    [node.x, node.y] = locations[node.id]
                }
            })
            if (this.simulation) {
                this.simulation.stop();
                this.simulation.nodes(this.nodesInSimulation);
                this.simulation
                    .force("link")
                    .links(this.linksInSimulation)
                this.simulation.alpha(1).restart();
            }
        },
        setSize() {
            const bbox = this.$refs.container.getBoundingClientRect()
            this.width = bbox.width
            this.height = bbox.height
        },
        //assumption: there are no links where source == target
        getLength(link) {
            const deltaX = link.target.x - link.source.x
            const deltaY = link.target.y - link.source.y
            return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        },
        //+2: make line a little shorter, so end of line is not extending underneath arrow's triangle
        getArrowEndpointX(link) {
            return link.target.x - (link.target.radius + 2) * (link.target.x - link.source.x) / this.getLength(link)
        },
        getArrowEndpointY(link) {
            return link.target.y - (link.target.radius + 2) * (link.target.y - link.source.y) / this.getLength(link)
        },
        printNode(node) {
            console.log("node", node)
        },
        getTransformForLinkLabel(link) {
            let rightPoint
            let leftPoint
            if (link.source.x > link.target.x) {
                rightPoint = link.source
                leftPoint = link.target
            } else {
                rightPoint = link.target
                leftPoint = link.source
            }
            const rotationRad = Math.atan2(rightPoint.y - leftPoint.y, rightPoint.x - leftPoint.x)
            const rotationDegrees = 360 * rotationRad / (2 * Math.PI)
            return `translate(${(link.source.x + link.target.x) / 2},${(link.source.y + link.target.y) / 2}) rotate(${rotationDegrees})`
        },
        handleMouseDown(e, node) {
            e.stopPropagation();
            this.draggedNode = node;
            this.mouseDownPos = [e.clientX, e.clientY]
        },
        handleMouseMove(e) {
            if (this.draggedNode) {
                this.draggedNode.fx = this.draggedNode.x
                this.draggedNode.fy = this.draggedNode.y
                this.draggedNode.fx += e.movementX / this.currentZoomLevel;
                this.draggedNode.fy += e.movementY / this.currentZoomLevel;
                this.nodesInSimulation = [...this.nodesInSimulation]
                this.linksInSimulation = [...this.linksInSimulation]   
                this.restartSimulation() 
            }
        },
        handleMouseUp(e) {
            //e.stopPropagation();
            const dragHasHappened = this.mouseDownPos &&
                Math.abs(e.clientX - this.mouseDownPos[0]) + Math.abs(e.clientY - this.mouseDownPos[1]) > 5;
            console.log(dragHasHappened)
            // if (!this.dragHasHappened) {
            //     console.log("selection")
            //     //     //toggle node selection
            //     //     $selectedNode =
            //     //         $selectedNode && $selectedNode.id == draggedNode.id
            //     //             ? null
            //     //             : draggedNode;
            //     // }
            // }
            this.draggedNode = null
            this.mouseDownPos = null;
        }
    },
    watch: {
        nodesAndLinks: function (newNetwork, oldNetwork) {
            this.restartSimulation()
        }
    }
}


</script>

<style>
svg text {
    pointer-events: none;
}

svg circle {
    cursor: pointer;
}
</style>