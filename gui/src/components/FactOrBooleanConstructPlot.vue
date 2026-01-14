<template>
    <div class="overflow-auto">
        <svg :width="width" :height="height">
            <g :transform="`translate(${margin.left},${margin.top})`">
                <template v-for="node in visibleNodes.filter((node) => !node.collapsed && node.outgoingLinks.length > 0)">
                    <template v-if="node.outgoingLinks.length == 1">
                        <path
                            :d="`M${node.outgoingLinks[0].source.position[0]},
                            ${node.outgoingLinks[0].source.position[1]}
                            L${node.outgoingLinks[0].target.position[0]},
                            ${node.outgoingLinks[0].target.position[1]}`"
                            fill="none"
                            :stroke="dotsAndLinesColor"
                            stroke-width="1.5"
                        />
                    </template>
                    <template v-else>
                        <path
                            :d="`M${node.position[0]},${node.position[1]}
                            L${node.position[0] + 0.5 * nodeSpacing.hor},${node.position[1]}
                            L${node.position[0] + 0.5 * nodeSpacing.hor},
                            ${node.outgoingLinks[node.outgoingLinks.length - 1].target
                                .position[1] + 1.5}`"
                            fill="none"
                            :stroke="dotsAndLinesColor"
                            stroke-width="3"
                        />
                        <line v-for="link,i in node.outgoingLinks"
                            :x1="node.position[0] + 0.5 * nodeSpacing.hor"
                            :x2="link.target.position[0]"
                            :y1="link.target.position[1]"
                            :y2="link.target.position[1]"
                            :stroke="dotsAndLinesColor"
                            stroke-width="0.5"
                        />
                    </template>
                </template>
                <template v-for="node in visibleNodes">
                    <g
                        :transform="`translate(${node.position[0]},${node.position[1]})`"
                        :class="node.outgoingLinks.length > 0
                            ? node.collapsed
                                ? 'cursor-expand'
                                : 'cursor-collapse'
                            : ''"
                        @click="() => {
                            node.collapsed = !node.collapsed;
                            updateNodePositions();
                        }"
                    >
                        <template v-if="node.negated">
                                <Cross :color="dotsAndLinesColor" />
                        </template>
                        <template v-else>
                            <circle
                                :r="node.outgoingLinks.length > 0 ? 6 : 2"
                                :fill="dotsAndLinesColor"
                            />
                        </template>
                        <template v-if="node.outgoingLinks.length > 1">
                            <template v-if="node.collapsed">
                                <text
                                    font-size="10"
                                    font-weight="bold"
                                    dx="8"
                                    dy="4"
                                    :fill="dotsAndLinesColor">
                                    {{node.operator in operatorSymbols
                                        ? operatorSymbols[node.operator]
                                        : node.operator}}
                                </text>
                            </template>
                            <template v-else>
                                <text
                                    font-size="12"
                                    font-weight="bold"
                                    dx="10"
                                    dy="18"
                                    text-anchor="end"
                                    :fill="dotsAndLinesColor">
                                    {{node.operator in operatorSymbols
                                        ? operatorSymbols[node.operator]
                                        : node.operator}}
                                </text>
                            </template>
                        </template>
                        <template v-else>
                            <text
                                class="cursor-pointer"
                                font-size="12"
                                :dx="node.outgoingLinks.length == 0 && !node.negated
                                    ? 5
                                    : 8"
                                dy="4"
                                @mouseover="() => {
                                    $hoveredNode = node;
                                }"
                                @mouseout="() => {
                                    $hoveredNode = null;
                                }">
                                {{node.frame.shortName}}
                            </text>
                        </template>
                    </g>
                </template>
            </g>
        </svg>
    </div>
</template>

<script>
import { Tree } from "../model/viz/tree.js";
import { max } from "d3-array"
import Cross from "./Cross.vue"


export default {
    data: () => ({
        margin: { left: 20, right: 700, top: 16, bottom: 16 },
        nodeSpacing: {
            hor: 30,
            vert: 30,
            onlyChildVertShift: 30,
        },
        operatorSymbols: {
            greaterThan: ">",
            lessThan: "<",
            lessThanOrEqualTo: "≤",
            greaterThanOrEqualTo: "≥",
            equals: "==",
            assign: "=",
            plus: "+",
            minus: "-",
        },
        dotsAndLinesColor: "#555555",
        tree: null,
        visibleNodes: []
    }),
    props: {
        factOrBooleanConstruct: Object
    },
    components: {
        Cross
    },
    mounted() {
        this.tree = new Tree(this.factOrBooleanConstruct);
        console.log("tree for", this.factOrBooleanConstruct, ":", this.tree)
        //only top node visible, or (if top node is a boolean operator) the top 2 layers
        if (this.tree.root.outgoingLinks.length == 1) {
            this.tree.root.collapsed = true;
        } else {
            this.tree.root.collapsed = false;
            this.tree.root.outgoingLinks.forEach((link) => {
                link.target.collapsed = true;
            });
        }
        this.updateNodePositions();
    },
    computed: {
        width() {
            const maxNodeX = this.visibleNodes.length > 0 ? max(this.visibleNodes.map((n) => n.position[0])) : 0
            return this.margin.left + maxNodeX + this.margin.right;
        },
        height() {
            const maxNodeY = this.visibleNodes.length > 0 ? max(this.visibleNodes.map((n) => n.position[1])) : 0
            return this.margin.top + maxNodeY + this.margin.top;
        }
    },
    methods: {
        getAllNodes(node) {
            return [node].concat(
                node.outgoingLinks.map((link) => this.getAllNodes(link.target)).flat()
            );
        },
        getVisibleLeafNodes(node) {
            return node.outgoingLinks.length == 0 || node.collapsed
                ? [node]
                : node.outgoingLinks
                    .map((link) => this.getVisibleLeafNodes(link.target))
                    .flat();
        },
        setNodePositions(node) {
            //set x position
            if (node.incomingLinks.length == 0) {
                node.position[0] = 0;
            } else {
                const parentNode = node.incomingLinks[0].source;
                node.position[0] = parentNode.position[0] + this.nodeSpacing.hor;
            }
            //set y position. y position of leafs have been set in updateNodePositions
            if (!node.collapsed && node.outgoingLinks.length > 0) {
                //first set position of children, then
                //take y pos of first child
                const children = node.outgoingLinks.map((link) => link.target);
                children.forEach((child) => {
                    this.setNodePositions(child);
                });
                node.position[1] = children[0].position[1];
            }
        },
        updateNodePositions() {
            const allNodes = this.getAllNodes(this.tree.root);
            allNodes.forEach((node) => {
                node.position = []; //empty array means node is invisible
            });
            //set y-pos of visible leaf nodes
            this.getVisibleLeafNodes(this.tree.root).forEach((leaf, i) => {
                leaf.position[1] = i * this.nodeSpacing.vert;
            });
            //tree is null when bc is empty (no frame, no children)
            this.setNodePositions(this.tree.root);
            this.shiftDownSingleChildNodes(this.tree.root);
            this.visibleNodes = allNodes.filter((node) => node.position.length > 0);
        },
        shiftDownSingleChildNodes(node, dy = 0) {
            //apply shift of ancestor(s)
            let shift = dy;
            node.position[1] += shift;
            if (!node.collapsed) {
                if (node.outgoingLinks.length == 1) {
                    shift += this.nodeSpacing.onlyChildVertShift;
                    shift = this.shiftDownSingleChildNodes(
                        node.outgoingLinks[0].target,
                        shift,
                    );
                } else {
                    node.outgoingLinks.forEach((link) => {
                        shift = this.shiftDownSingleChildNodes(link.target, shift);
                    });
                }
            }
            return shift;
        }
    },
    watch: {
        width() {
            console.log("width", this.width)
        },
        height() {
            console.log("height", this.height)
        },
        visibleNodes() {
            console.log("visible nodes", this.visibleNodes)
        }
    }
}
</script>

<style>
    .cursor-expand {
        cursor:s-resize
    }
    .cursor-collapse {
        cursor:n-resize
    }
</style>