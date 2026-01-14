<template>
  <div id="frame-type-buttons" class="row inline justify-start items-baseline no-wrap q-mt-sm">
    <div>Add:</div>
    <div>
      <q-btn v-for="(frameType, frameTypeId) in frameTypes" class="q-ml-xs" size="sm" :color="colors[frameTypeId]"
        :label="frameType.label" @click="createFrame(frameTypeId)">
        <q-tooltip class="text-subtitle2">
          Add frame of type {{ frameType.label }}
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import { icons, colors } from "../helpers/config.js";
import { frameTypes } from "../model/frame.js";

export default {
  data: () => ({
    icons: icons,
    colors: colors,
    frameTypes: frameTypes,
  }),
  methods: {
    createFrame(frameTypeId) {
      //add frame with empty annotation
      const newFrame = this.$store.commit("addNewFrame", {
        frameTypeId: frameTypeId,
        annotation: null,
        subTypeId: null,
        openInEditor: true
      });
    },
    saveInterpretationClicked() {
      this.$store.dispatch("saveInterpretation");
    },
    chooseFile() {
      //document.getElementById("fileUpload").click()
      this.$refs.fileUpload.click();
    },
    handleFileSelection(evt) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.$store.dispatch("loadInterpretation", evt.target.result);
      };
      reader.readAsText(evt.target.files[0]);
    },
    closeActiveFrame() {
      this.$store.commit("setFrameBeingEdited", null);
    },
  },
};
</script>

<style lang="css" scoped>
#menu-card {
  width: 100%;
}
</style>
