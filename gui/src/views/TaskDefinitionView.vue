<template>
  <div id="task-definition-view">
    <q-card flat bordered style="width: 500px; max-width: 600px">
      <q-item class="q-ma-md">
        <q-item-section avatar>
          <q-avatar icon="mdi-head-dots-horizontal-outline" rounded size="xl">
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>Set task</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-avatar>
            <q-icon name="mdi-information-outline" class="cursor-pointer"></q-icon>
            <q-tooltip class="bg-blue-1 text-grey-10 text-body2">
              <div style="max-width: 300px">Define a task.</div>
            </q-tooltip>
          </q-avatar>
        </q-item-section>
      </q-item>
      <q-separator></q-separator>
      <q-card-section v-if="task">
        <q-input filled v-model="task.editor" label="Editor" lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Give the editor of the task']" clearable />
        <q-input filled v-model="task.label" label="Label" lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Give the task label']" clearable />
        <q-input type="textarea" filled v-model="task.description" label="Description" lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Give description of the task']" clearable />
      </q-card-section>
      <q-separator></q-separator>
      <!-- <q-card-actions class="q-pa-md">
        <q-space></q-space>
        <q-btn type="submit" color="primary" @click="this.$emit('updateStepper')" :disable="formIsInvalid">Continue</q-btn>
      </q-card-actions> -->
    </q-card>
  </div>
</template>

<script>
import { Task } from "../model/task.js";
export default {
  name: "TaskDefinitionView",
  computed: {
    formIsInvalid() {
      return this.task && (!this.task.editor || !this.task.label || !this.task.description);
    },
    task() {
      return this.$store.state.task;
    },
  },
  mounted() {
    if (!this.task) {
      this.$store.state.task = new Task()
    }
  }
};
</script>

<style scoped lang="css">
#task-definition-view {
  display: flex;
  flex-direction: row;
  justify-content: center;
  overflow: hidden;
}
</style>
