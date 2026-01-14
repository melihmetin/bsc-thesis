<template>
    <!-- component that allows for assigning a frame to a role -->
    <div class="field-container">
        <div class="row items-center">
            <q-btn class="button" round :color="active ? 'primary' : 'grey-6'" size="xs" icon="mdi-pencil"
                @click="toggleRoleSelection" />
            <div>{{ label }}</div>

        </div>

        <div class="chips">
            <div class="chip" v-for="frameInRole in frames">
                <FrameChip :frame="frameInRole"/>
                <q-btn round size="xs" flat color="negative" icon="mdi-close"
                    @click="removeFrameFromRole(frameInRole)" />
            </div>
            <div v-if="active && frames.length == 0" class="button-label">Select existing frame or create frame from
                source
            </div>
        </div>
    </div>
</template>

<script>
import FrameChip from './FrameChip.vue';
export default {
    components: {
        FrameChip
    },
    props: {
        frame: Object, //frame for which roles are assigned
        label: String, //name of role
        attribute: String, //attribute name of role in frame
        multipleFramesAllowed: Boolean //indicates whether role can hold more than one frame
    },
    computed: {
        frames() {
            return this.frame[this.attribute] ?
                this.multipleFramesAllowed
                    ? this.frame[this.attribute] //attribute is an array
                    : [this.frame[this.attribute]] //attribute is a singleton, put it in an array
                : []
        },
        active() {
            return this.frame.activeField === this.attribute
        }
    },
    methods: {
        toggleRoleSelection() {
            this.frame.activeField = this.frame.activeField == this.attribute ? null : this.attribute
            this.$store.state.booleanConstructBeingEdited = null
        },
        removeFrameFromRole(frameInRole) {
            if (this.multipleFramesAllowed) {
                const index = this.frame[this.attribute].findIndex(f => f.id == frameInRole.id)
                this.frame[this.attribute].splice(index, 1)
            } else {
                this.frame[this.attribute] = null
            }
        }
    }
}
</script>

<style lang="css" scoped>
.button {
    margin-right: 5px;
}

.field-container {
    margin: 3px 0px;
    display: grid;
    grid-template-columns: 130px auto;
}

.button-label {
    display: inline-block;
    font-style: italic;
    margin-left: 5px;
}

.chips {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.chip {
    display: flex;
    flex-direction: row;
}
</style>
