<script>
import { icons } from "../helpers/config.js";

export default {
  name: "LoadSaveInterpretationBanner",
  data: () => ({
    icons: icons,
  }),
  methods: {
    saveInterpretationAsJson() {
      this.$store.dispatch("saveInterpretationAsJson");
    },
    saveInterpretationAsTrig() {
      this.$store.dispatch("saveInterpretationAsTrig");
    },
    saveInterpretationRemotely() {
      this.$store.dispatch("saveInterpretationTriply");
    },
    chooseFile(fileType) {
      switch (fileType) {
        case "json":
          this.$refs.fileUpload.click();
          break;
        case "rdf":
          this.$refs.fileUploadRDF.click();
          break;
      }
    },
    handleFileSelection(evt) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.$store.dispatch("loadInterpretation", evt.target.result);
      };
      reader.readAsText(evt.target.files[0]);
    },
    handleFileSelectionRDF(evt) {
      console.log("rdf");
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.$store.dispatch("loadInterpretationFromRDF", evt.target.result);
      };
      reader.readAsText(evt.target.files[0]);
    },
    loadRemoteInterpretation() {
      this.$store.commit("setTaskOverview", true);
    },
  },
};
</script>

<template>
  <div class="row q-gutter-sm q-ma-sm save-load-button-container">
    <q-btn
      round
      size="sm"
      icon="mdi-file-upload-outline"
      color="white"
      text-color="primary"
    >
      <q-menu fit transition-show="jump-down" transition-hide="jump-up">
        <q-list>
          <q-item class="label" disable>
            <q-item-label>Locally</q-item-label>
          </q-item>
          <q-separator></q-separator>
          <q-item clickable v-close-popup dense @click="chooseFile('json')">
            <q-item-section>JSON</q-item-section>
          </q-item>
          <q-item clickable v-close-popup dense @click="chooseFile('rdf')">
            <q-item-section>RDF</q-item-section>
          </q-item>
          <q-separator></q-separator>
          <q-item class="label" disable>
            <q-item-label>Remotely</q-item-label>
          </q-item>
          <q-separator></q-separator>
          <q-item
            clickable
            v-close-popup
            dense
            @click="loadRemoteInterpretation"
          >
            <q-item-section>Triply</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <q-tooltip class="bg-blue-1 text-grey-10 text-body2">
        <div>Load an interpretation</div>
      </q-tooltip>
    </q-btn>
    <q-btn
      round
      size="sm"
      icon="mdi-content-save"
      color="white"
      text-color="primary"
    >
      <q-menu fit transition-show="jump-down" transition-hide="jump-up">
        <q-list>
          <q-item class="label" disable>
            <q-item-label>Locally</q-item-label>
          </q-item>
          <q-separator></q-separator>
          <q-item
            clickable
            v-close-popup
            dense
            @click="saveInterpretationAsJson"
          >
            <q-item-section>JSON</q-item-section>
          </q-item>
          <q-item
            clickable
            v-close-popup
            dense
            @click="saveInterpretationAsTrig"
          >
            <q-item-section>RDF</q-item-section>
          </q-item>
          <q-separator></q-separator>
          <q-item class="label" disable>
            <q-item-label>Remotely</q-item-label>
          </q-item>
          <q-separator></q-separator>
          <q-item
            clickable
            v-close-popup
            dense
            @click="saveInterpretationRemotely"
          >
            <q-item-section>Triply</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <q-tooltip class="bg-blue-1 text-grey-10 text-body2">
        <div>Save the current interpretation</div>
      </q-tooltip>
    </q-btn>

    <input type="file" @change="handleFileSelection" hidden ref="fileUpload" />
    <input
      type="file"
      @change="handleFileSelectionRDF"
      accept=".trig,application/trig"
      hidden
      ref="fileUploadRDF"
    />
  </div>
</template>

<style scoped lang="css">
.label {
  min-height: 20px;
}

.save-load-button-container {
  /* border-left: 2px solid #1976D2; */
  background-color: #b6d1ec;
  padding: 0px 7px 7px 0px;
  border-radius: 5px;
}
</style>
