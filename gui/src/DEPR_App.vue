<template>
  <!--
    Copyright 2023 Nederlandse Organisatie voor Toegepast Natuur-
    wetenschappelijk Onderzoek TNO / TNO, Netherlands Organisation for 
    applied scientific research

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
  */
  -->

  <q-stepper
    id="stepper-id"
    v-model="this.$store.state.step"
    ref="stepper"
    color="primary"
    animated
    flat
    header-nav
  >
    <q-step
      :name="1"
      title="Define a task"
      icon="mdi-head-dots-horizontal-outline"
      :done="this.$store.state.step > 1"
      done-color="green"
      caption="Step 1"
      class="row justify-center content-center"
      :header-nav="this.$store.state.step > 1"
    >
      <TaskDefinitionView @update-stepper="updateStepperValue" />
    </q-step>
    <q-step
      :name="2"
      title="Collect sources"
      icon="mdi-bookmark-box-multiple-outline"
      class="row justify-center content-start"
      :done="this.$store.state.step > 2"
      done-color="green"
      caption="Step 2"
      :header-nav="this.$store.state.step > 2"
    >
      <SourceCollectionView
        @update-stepper="updateStepperValue"
        @decrease-stepper="decreaseStepperValue"
      />
    </q-step>

    <q-step
      :name="3"
      title="Interpret sources"
      icon="mdi-thought-bubble-outline"
      :done="this.$store.state.step > 3"
      done-color="green"
      caption="Step 3"
      :header-nav="this.$store.state.step > 3"
    >
      <InterpretationView />
      <!-- <TestView/> -->
    </q-step>
    <q-step
      :name="4"
      title="Validate interpretations"
      icon="mdi-timeline-check-outline"
      :done="this.$store.state.step > 4"
      disable
      caption="Step 4"
    >
    </q-step>
    <q-step
      :name="5"
      title="Perform task"
      icon="mdi-playlist-check"
      :done="this.$store.state.step > 5"
      disable
      caption="Step 5"
    >
    </q-step>
  </q-stepper>
  <div ref="loadSaveButtons">
    <load-save-interpretation-banner />
  </div>
  <div>
    <task-retrieval />
  </div>
</template>

<script>
import TaskDefinitionView from "./views/TaskDefinitionView.vue";
import SourceCollectionView from "./views/SourceCollectionView.vue";
import InterpretationView from "./views/InterpretationView.vue";
import LoadSaveInterpretationBanner from "./components/LoadSaveIntepretationBanner.vue";
import { alertWidget } from "./helpers/alertWidget.js";
import { retrieveDeploymentInformation } from "./helpers/utilities.js";
import TaskRetrieval from "./components/TaskRetrieval.vue";
export default {
  name: "app",
  data: () => ({
    hash: import.meta.env.VITE_VERSION,
    repo: import.meta.env.VITE_REPOSITORY_URL,
    branch: import.meta.env.VITE_BRANCH,
  }),
  components: {
    TaskRetrieval,
    LoadSaveInterpretationBanner,
    InterpretationView,
    SourceCollectionView,
    TaskDefinitionView,
  },

  mounted() {
    // if there is deployment information, show it
    if (this.repo != null) {
      const message = retrieveDeploymentInformation(
        this.repo,
        this.branch,
        this.hash,
      );
      alertWidget("welcome", message);
    }
    // list of action to be dispatched on mount
    this.$store.dispatch("readAvailableSources");
    this.$store.dispatch("readAvailableSourcesInTripleStore");
    this.$store.dispatch("readAvailableTasksInTripleStore");

    //hack to add load and save buttons next to the stepper buttons in the stepper header
    const stepperHeader =
      document.getElementsByClassName("q-stepper__header")[0];
    const loadSaveButtons = this.$refs.loadSaveButtons;
    stepperHeader.appendChild(loadSaveButtons);
  },
  methods: {
    updateStepperValue() {
      this.$refs.stepper.next();
    },
    decreaseStepperValue() {
      this.$refs.stepper.previous();
    },
  },
};
</script>

<style>
.anchorTags {
  color: #ffffff;
}

.anchorTags:hover {
  font-weight: bold;
}
</style>
