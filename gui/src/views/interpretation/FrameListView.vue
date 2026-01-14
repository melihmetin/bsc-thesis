<template>
  <q-card flat bordered>

    <div class="q-pa-sm">
      <div class="height-content row q-pa-sm items-center q-gutter-md">
        <div class="col">
          <q-input bottom-slots v-model="searchTerm" label="Filter frames on label" dense>
            <template v-slot:prepend>
              <q-icon name="mdi-magnify" />
            </template>
            <template v-slot:append>
              <q-icon size="xs" name="mdi-close" @click="searchTerm = ''" class="cursor-pointer" />
            </template>
          </q-input>
        </div>
        <div class="col-1">
          <q-avatar class="float-right" size="lg">
            <q-icon name="mdi-information-outline" class="cursor-pointer"></q-icon>
            <q-tooltip class="bg-blue-1 text-grey-10 text-body2">
              <div style="max-width: 300px">
                This view lists the frames in the interpretation, grouped by type and, if applicable, subtype. Click a
                frame to edit it or view its details.
              </div>
            </q-tooltip>
          </q-avatar>
        </div>
      </div>

      <div class="fill-height scrollable">
        <FramesList :searchTerm="searchTerm" />
      </div>
          
    </div>

  </q-card>
</template>

<script>
import FramesList from "../../components/FramesList.vue";
import FrameEditorPanel from "../../components/FrameEditorPanel.vue";

export default {
  data: () => ({
    searchTerm: "",
  }),
  computed: {
    sourceViewIsCollapsed() {
      return this.$store.state.sourceViewIsCollapsed;
    },
    frames() {
      return this.$store.state.frames;
    },
    frameBeingEdited() {
      return this.$store.state.frameBeingEdited;
    },
    annotationBeingEdited() {
      return this.$store.state.annotationBeingEdited;
    },
    booleanConstructBeingEdited() {
      return this.$store.state.booleanConstructBeingEdited;
    },
    allowedSubTypes() {
      console.log("frameBeingEdited", this.frameBeingEdited);
      return this.$store.state.frameBeingEdited &&
        ["act", "claim_duty"].includes(this.frameBeingEdited.typeId)
        ? this.frameBeingEdited.allowedSubClassesForActiveField
        : [];
    },
  },

  components: {
    FramesList,
    FrameEditorPanel,
  },
};
</script>

<style lang="css" scoped>
.container-column {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 193px);
  height: auto;
}

.container-row {
  display: flex;
  flex-direction: row;
  min-height: calc(100vh - 193px);
  height: auto;
}

.height-content {
  flex: 0 0 auto;
  /* Take only the needed height */
}

.fill-height {
  height: calc(100vh - 185px);
}

.scrollable {
  overflow-y: auto;
}

.frame-editor-panel {
  min-width: 50%;
}
</style>
