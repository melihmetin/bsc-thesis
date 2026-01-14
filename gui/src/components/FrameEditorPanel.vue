<template>

    <div v-if="framesOpenInEditor.length > 0" class="bg-grey-12 q-pa-md q-ma-sm">
      <div class="row">
        <div class="text-bold col">Editing:</div>
        <div v-if="framesOpenInEditor.length > 1" class="col text-italic text-right text-underline cursor-pointer"
          @click="$store.state.framesOpenInEditor = [frameBeingEdited]">Close all but current
        </div>
      </div>
      
      <div class="chips">
        <div class="row" v-for="frame in framesOpenInEditor">
          <div :class="{ dot: frame == frameBeingEdited }" />
          <FrameChip :frame="frame"/>
        </div>
      </div>
      <div>

      </div>
    </div>
    
    <q-card flat bordered v-if="frameBeingEdited" class="my-card q-ma-sm">
      <template v-if="frameBeingEdited.typeId == 'fact'">
        <FactFrameForm />
      </template>
      <template v-else-if="frameBeingEdited.typeId == 'act'">
        <ActFrameForm />
      </template>
      <template v-else-if="frameBeingEdited.typeId == 'claim_duty'">
        <ClaimdutyFrameForm />
      </template>
    </q-card>



</template>

<script>
import ActFrameForm from "./ActFrameForm.vue";
import FactFrameForm from "./FactFrameForm.vue";
import ClaimdutyFrameForm from "./ClaimdutyFrameForm.vue";
import FrameChip from "./FrameChip.vue";
import { icons, colors } from "../helpers/config.js";
import { frameTypes } from "../model/frame";

export default {
  data: () => ({
    icons: icons,
    colors: colors,
    frameTypes: frameTypes
  }),
  components: {
    ActFrameForm,
    FactFrameForm,
    ClaimdutyFrameForm,
    FrameChip
  },
  computed: {
    frameBeingEdited() {
      return this.$store.state.frameBeingEdited;
    },
    framesOpenInEditor() {
      return this.$store.state.framesOpenInEditor
    },
    addingAnnotationToExistingFrame() {
      return this.$store.state.addingAnnotationToExistingFrame;
    },
    booleanConstructBeingEdited() {
      return this.$store.state.booleanConstructBeingEdited;
    },
  },
  methods: {
    frameChipClicked(frame) {
      if (
        this.addingAnnotationToExistingFrame
      ) {
        this.$store.state.annotationToBeAddedToExistingFrame.frame = frame
        this.$store.state.addingAnnotationToExistingFrame = false;
        this.$store.state.annotationToBeAddedToExistingFrame = null;
      } else if (
        this.frameBeingEdited &&
        'activeField' in this.frameBeingEdited &&
        this.frameBeingEdited.activeField
      ) {
        //add frame to field in frame being edited
        console.log("adding frame to", this.frameBeingEdited);
        this.frameBeingEdited.addFrame(frame);
        this.frameBeingEdited.activeField = null
      } else if (this.booleanConstructBeingEdited) {
        this.booleanConstructBeingEdited.frame = frame;
        this.$store.state.booleanConstructBeingEdited = null;
      } else {
        this.$store.state.frameBeingEdited = frame
      }
    },
    getFrameColor(frame) {
      return frame.typeId != "fact" || frame.subTypeIds.length == 0
          ? colors[frame.typeId]
          : frame.subTypeIds.length > 1
            ? colors.multiple
            : colors[frame.subTypeIds[0]]
    }
  }
};
</script>

<style lang="css" scoped>

.chips {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.dot {
  margin-top: 10px;
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #666666;
}
</style>
