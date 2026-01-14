<template>
    <!-- button for adding all nodes to network -->

    <!-- filter -->

    <div class="inline-block">Show frames of type:</div>
    <div class="inline-block q-ml-md" v-for="frameType in Object.values(filter)">
        <label class="text-weight-bold"><input type="checkbox" v-model="frameType.selected"
                @change="updateFilter">
            {{ frameType.label }}
        </label>
        <template v-if="'subTypes' in frameType">
            <div class="inline-block q-ml-sm" v-for="subType in frameType.subTypes">
                <label><input type="checkbox" v-model="subType.selected" @change="updateFilter"
                        :disabled="!frameType.selected">
                    {{ subType.label }}
                </label>
            </div>
        </template>
    </div>
    <div>
        <label>
            <input type="checkbox" v-model="showDependencies"
                        :disabled="'act' in filter && !(filter['act'].selected)">
                    Show dependencies between act frames
        </label>
    </div>
</template>

<script>
import { frameTypes } from "../model/frame.js"
export default {
    data: () => ({
        filter: {},
        showDependencies: false
    }),
    mounted() {
        //if frameFilter is empty, initialize it with all types and subtypes selected
        if (Object.keys(this.frameFilter).length == 0) {
            //filter is empty. Initialize.
            this.filter = { ...frameTypes }
            Object.values(this.filter).forEach(frameType => {
                frameType.selected = true
                if ("subTypes" in frameType) {
                    Object.values(frameType.subTypes).forEach(subType => {
                        subType.selected = true
                    })
                }
            })
            //add entry for anonymous nodes (e.g. boolean constructs and )
            this.filter['anonymous'] = {
                class: 'anonymous',
                label: 'Other',
                selected: true
            }
            this.updateFilter()
        } else {
            //copy current filter to local filter
            this.filter = this.frameFilter
        }
        this.showDependencies = this.showDependenciesBetweenActs
    },
    computed: {
        frameFilter() {
            return this.$store.state.frameFilter
        },
        showDependenciesBetweenActs() {
            return this.$store.state.showDependenciesBetweenActs
        }
    },
    methods: {
        updateFilter() {
            this.$store.state.frameFilter = { ...this.filter }
        },
    },
    watch: {
        showDependencies() {
            this.$store.state.showDependenciesBetweenActs = this.showDependencies
        }
    }

}
</script>
