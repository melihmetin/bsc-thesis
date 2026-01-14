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

  <div class="column fit">
    <div class="col-auto">
      <NavigationBar v-model:activeView="activeView"/>
    </div>
    <div class="col q-px-sm scroll">
      <component v-if="activeView" :is="activeView.component" />
    </div>
  </div>
  
  
  <div>
    <TaskRetrieval />
  </div>
</template>

<script>
import { alertWidget } from "./helpers/alertWidget.js";
import { retrieveDeploymentInformation } from "./helpers/utilities.js";
import TaskRetrieval from "./components/TaskRetrieval.vue";
import NavigationBar from "./components/NavigationBar.vue";
export default {
  name: "app",
  data: () => ({
    hash: import.meta.env.VITE_VERSION,
    repo: import.meta.env.VITE_REPOSITORY_URL,
    branch: import.meta.env.VITE_BRANCH,
    activeView: null
  }),
  components: {
    NavigationBar,
    TaskRetrieval,
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
    // this.$store.dispatch("readAvailableSourcesInTripleStore");
    // this.$store.dispatch("readAvailableTasksInTripleStore");
  },
};
</script>

<style>
  
</style>
