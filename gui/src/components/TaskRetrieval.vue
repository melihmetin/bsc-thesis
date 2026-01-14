<script>
import { alertWidget } from "../helpers/alertWidget.js";

export default {
  name: "TaskRetrieval",
  data() {
    return {
      columns: [
        { name: "iri", label: "IRI", field: "iri", align: "center" },
        { name: "title", label: "Title", field: "title", align: "center" },
        { name: "editor", label: "Creator", field: "editor", align: "center" },
        { name: "date", label: "Date", field: "date", align: "center" },
      ],
      selected: [],
      visibleColumns: ["title", "editor", "date"],
    };
  },
  computed: {
    rows() {
      return this.$store.state.availableTasksInTripleStore;
    },
    show() {
      return this.$store.state.showTaskOverview;
    },
  },
  methods: {
    retrieveTask() {
      if (this.selected.length > 0) {
        this.$store.dispatch("addTaskFromTriply", this.selected[0].iri);
        this.$store.commit("setTaskOverview", false);
      } else {
        alertWidget("error", "Please select a task from the table!");
      }
    },
  },
};
</script>

<template>
  <div id="task-overview" class="q-pa-md q-gutter-sm">
    <q-dialog
      v-model="show"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 800px">
        <q-card-section>
          <q-table
            title="Table overview"
            flat
            bordered
            :visible-columns="visibleColumns"
            :rows="rows"
            :columns="columns"
            row-key="iri"
            selection="single"
            v-model:selected="selected"
          />
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn
            flat
            label="Close"
            color="red"
            @click="this.$store.commit('setTaskOverview', false)"
          />
          <q-btn flat label="Retrieve task" @click="retrieveTask" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="css"></style>
