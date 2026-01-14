<template>
    <g>
        <circle :r="backgroundRadius" :fill="backgroundColor" />
        <line
            :x1="-size"
            :y1="-size"
            :x2="size"
            :y2="size"
            :stroke="color"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
        />
        <line
            :x1="size"
            :y1="-size"
            :x2="-size"
            :y2="size"
            :stroke="color"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
        />
    </g>
</template>

<script>
export default {
    data: () => ({
        strokeWidth: 3
    }),
    props: {
        size: {
            default: 4,
            type: Number
        },
        color: {
            default: "#000000",
            type: String
        },
        backgroundRadius: {
            default: 10,
            type: Number
        },
        backgroundColor: {
            default: "#ffffff",
            type: String
        }
    }
}
</script>
