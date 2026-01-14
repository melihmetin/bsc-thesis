<script>
//icons from https://pictogrammers.com/library/mdi/
import SourceView from "./SourceView.vue";
import SourceOfSelectedFrameView from "./SourceOfSelectedFrameView.vue"
import FrameListView from "./FrameListView.vue";
import FrameEditView from "./FrameEditView.vue"

import AnnotationPanel from "../../components/AnnotationPanel.vue";
import AnnotationList from "../../components/AnnotationList.vue"
import AddingAnnotationToFramePanel from "../../components/AddingAnnotationToFramePanel.vue"

import { markRaw } from 'vue' //to prevent components from becoming reactive

export default {
  name: "InterpretationView",
  components: {
    FrameListView,
    FrameEditView,
    SourceView,
    SourceOfSelectedFrameView,
    AnnotationPanel,
    AnnotationList,
    AddingAnnotationToFramePanel,
  },
  //icons from https://pictogrammers.com/library/mdi/
  data: () => ({
    panels: [
      {
        label: "Source",
        component: markRaw(SourceView),
        expanded: true,
        icon: 'mdi-file-document-outline'
      },
      {
        label: "Source of selected frame",
        component: markRaw(SourceOfSelectedFrameView),
        expanded: false,
        icon: 'mdi-file-document-edit-outline'
      },
      {
        label: "Frames",
        component: markRaw(FrameListView),
        expanded: true,
        icon: 'mdi-application-outline'
      },
      {
        label: "Edit",
        component: markRaw(FrameEditView),
        expanded: true,
        icon: 'mdi-pencil'
      },
    ]
  }),
};
</script>

<template>
   <div class="row fit">
    <template v-for="panel in panels">
      <template v-if="panel.expanded">
        <div class="col column fit q-mr-xs">
          <div class="col-auto">
            <div class="row items-center q-px-xs bg-primary">
              <q-btn round flat text-color="white" size="sm" :icon="panel.icon" @click="panel.expanded = false"></q-btn>
              <div class="col text-white">{{ panel.label }}</div>
              <q-btn round flat text-color="white" size="xs" icon="mdi-arrow-collapse-left"
                @click="panel.expanded = false"></q-btn>
            </div>
          </div>
          <!-- this part scrolls -->
          <div class="col fit scroll">
            <component :is="panel.component" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="q-mr-xs">
          <q-btn round color="primary" size="sm" :icon="panel.icon" @click="panel.expanded = true"></q-btn>
        </div>
      </template>
    </template>
  </div>
  <!-- panel that appears when a new annotation is made by selecting source text -->
  <AnnotationPanel />
  <!-- panel that appears when existing annotation(s) have been clicked in the source text -->
  <AnnotationList />
  <!-- panel that appears when user is adding an annotation to a frame -->
  <AddingAnnotationToFramePanel />
</template>

