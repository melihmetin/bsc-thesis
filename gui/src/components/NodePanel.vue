<template>
    <g>
        <circle
            :fill="selectedNode && node.id != selectedNode.id
                ? grayedOutColor
                : getColor(node.frame)"
            :r="node.frame.typeId == 'act' ? 12 : 8">
            </circle>
         <!-- add circles for roles -->
        <g v-for="role,i in roles" :transform="`translate(-20,${-9 + i*10})`">
            <circle
                :fill="node.frame[role]
                    ? (this.selectedNode && node.id != this.selectedNode.id ? this.grayedOutColor : roleColors[role])
                    : 'None'"
                :stroke="this.selectedNode && node.id != this.selectedNode.id ? this.grayedOutColor : roleColors[role]"
                r="4"
            />
            
        </g>
        <text
                font-size="12"
                dx="16"
                dy="5"
                fill="#111111">{{node.frame.shortName}}</text
            >
    </g>
</template>

<script>
    const typeColors = {
        act: "#311b92",
        fact: "#1976D2",
        claim_duty: "#c51162",
    };
    const subTypeColors = {
        agent: "#F2C037",
        object: "#9C27B0",
        duty: "#c51162",
    };
    const roleColors = {
        "actor":subTypeColors.agent,
        "object":subTypeColors.object,
        "recipient":subTypeColors.agent,
        "duty":subTypeColors.duty,
        "claimant":subTypeColors.agent,
        "holder":subTypeColors.agent,
    }
    export default {
        data: () => ({
            roleColors: {
                "actor":subTypeColors.agent,
                "object":subTypeColors.object,
                "recipient":subTypeColors.agent,
                "duty":subTypeColors.duty,
                "claimant":subTypeColors.agent,
                "holder":subTypeColors.agent,
            },
            grayedOutColor: "#dddddd"
        }),
        props: {
            node: Object
        },
        computed: {
            roles() {
                return this.node.frame.typeId == "act"
                    ? ["actor", "object", "recipient"]
                    : ["duty", "claimant", "holder"];
            },
            selectedNode() {
                return this.$store.state.selectedNode
            }
        },
        mounted() {
            console.log("node", this.node)
        },
        methods: {
            getColor(frame) {
                if (frame.typeId == "fact" && frame.subTypeIds.length > 0) {
                    return subTypeColors[frame.subTypeIds[0]];
                } else {
                    return typeColors[frame.typeId];
                }
            }
        }
    }
</script>

