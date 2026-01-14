<template>
  <q-card flat bordered>
    <div class="col overflow-hidden">
      <div class="height-content q-pa-sm">
          <NewFrameMenu />
      </div>
      <div v-if="frameBeingEdited" class="fill-height scrollable">
        <FrameEditorPanel />
      </div>
    </div>
  </q-card>
</template>

<script>
import NewFrameMenu from "../../components/NewFrameMenu.vue";
import FramesList from "../../components/FramesList.vue";
import FrameEditorPanel from "../../components/FrameEditorPanel.vue";
import { icons, colors } from "../../helpers/config";

export default {
  data: () => ({
    icons: icons,
    colors: colors,
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
    message() {
      return this.frameBeingEdited &&
        ["act", "claim_duty"].includes(this.frameBeingEdited.typeId)
        ? "Add to frame"
        : "";
    },
  },

  components: {
    FramesList,
    NewFrameMenu,
    FrameEditorPanel,
  },

  watch: {
    sourceViewIsCollapsed() {
      console.log("sourceViewIsCollapsed", this.sourceViewIsCollapsed);
    },
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
  height: calc(100vh - 145px);
}

.scrollable {
  overflow-y: auto;
}

</style>
