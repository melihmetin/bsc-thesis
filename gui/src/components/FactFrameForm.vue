<template>
  <q-card flat bordered class="my-card">
    <q-card-section>
      <div class="row items-center">
        <div class="col-2">FACT {{ frame.subTypeId ? "of sub-type " + frameTypes.fact.subTypes[frame.subTypeId].label :
          "" }}
        </div>
        <div class="col q-gutter-sm">
          <q-btn size="sm" round v-for="(subType, subTypeId) in frameTypes.fact.subTypes"
            :color="frame.subTypeIds.includes(subTypeId) ? colors[subTypeId] : 'grey-6'" :icon="icons[subTypeId]"
            @click="setSubType(subTypeId)">
            <q-tooltip class="text-subtitle2">
              <div v-if="frame.subTypeIds.includes(subTypeId)">
                Remove subtype {{ subType.label }} from fact
              </div>
              <div v-else>
                Add subtype {{ subType.label }} to fact
              </div>
            </q-tooltip>
          </q-btn>
        </div>
        <div class="col">
          <template v-if="sentences?.length == 0">
            <div class="text-italic">No source added yet</div>
          </template>
        </div>
        <div class="col-1">
          <q-btn size="sm" round flat color="primary" icon="mdi-comment-text-outline"
            @click="showComments = !showComments">
            <q-badge v-if="frame.comments.length > 0" color="primary" floating>{{ frame.comments.length }}</q-badge>
            <q-tooltip class="text-subtitle2">
              Comments
            </q-tooltip>
          </q-btn>
        </div>
      </div>
      <q-input v-model="frame.shortName" label="Short name" input-style="font-size: 12pt; font-weight:bold" />
      <q-input v-model="frame.fullName" label="Full name" autogrow />
    </q-card-section>
    <q-card-section>
      <div class="label">Subdivision</div>
      <draggable-tree-view
        :boolean-construct="frame.subdivision"
        origin="Fact"
      ></draggable-tree-view>
      <!--      <TreeviewBooleanConstruct-->
      <!--        :boolean-construct="frame.subdivision"-->
      <!--        origin="Fact"-->
      <!--      ></TreeviewBooleanConstruct>-->
    </q-card-section>

    <q-card-actions align="right">
      <template v-if="frameIsBeingDeleted">
        <div class="q-mr-sm">Are you sure you want to delete this frame?</div>
        <q-btn color="negative" @click="deleteFrame">Yes
          <q-tooltip class="text-subtitle2">
            Delete this frame
          </q-tooltip>
        </q-btn>
        <q-btn color="primary" @click="frameIsBeingDeleted = false">No</q-btn>
      </template>
      <template v-else>
        <q-btn color="negative" @click="frameIsBeingDeleted = true">Delete</q-btn>
        <q-btn color="primary" @click="closeFrame">Close
          <q-tooltip class="text-subtitle2">
            Any changes have been saved
          </q-tooltip>
        </q-btn>
      </template>
    </q-card-actions>
    <div class="flex flex-row items-center">
      <div class="frame-id">Frame id: {{ frame.id }}</div>
      <div class="col">
        <q-btn size="sm" round flat color="primary"
          :icon="idIsCopiedToClipboard ? 'mdi-clipboard-check-outline' : 'mdi-clipboard-arrow-left-outline'"
          @click="copyIdToClipboard">
          <q-tooltip class="text-subtitle2">
            {{ idIsCopiedToClipboard ? 'Copied' : 'Copy to clipboard' }}
          </q-tooltip>
        </q-btn>
      </div>
    </div>
  </q-card>

  <CommentsList
    :fact="frame"
    :show-comments="showComments"
    @update:show-comments="showComments = $event"
    @closed="showComments = false"
  />
</template>

<script>
import { icons, colors } from "../helpers/config.js";
import CommentsList from "./CommentsList.vue";
import SentenceList from "./SentenceList.vue";
import BooleanConstructPanel from "./BooleanConstructPanel.vue";
import { BooleanConstruct } from "../model/booleanConstruct.js";
import { frameTypes } from "../model/frame";
import { setVerticalPositionOfAnnotationLines } from "../helpers/underlining.js";
import TreeviewBooleanConstruct from "./TreeviewBooleanConstruct.vue";
import DraggableTreeView from "./DraggableTreeView.vue";

export default {
  emits: ["closed"],
  data: () => ({
    icons: icons,
    colors: colors,
    subdivided: false,
    showSource: false,
    showComments: false,
    frameTypes: frameTypes,
    frameIsBeingDeleted: false, //true when user clicked delete button
    idIsCopiedToClipboard: false
  }),
  computed: {
    sourceDocuments() {
      return this.$store.state.sourceDocuments
    },
    displayedSourceDocument() {
      return this.$store.state.displayedSourceDocument
    },
    frame() {
      return this.$store.state.frameBeingEdited;
    },
    sentences() {
      return this.sourceDocuments.map(doc => doc.getSentencesForFrame(this.frame)).flat()
    }
  },
  methods: {
    closeFrame() {
      this.$store.state.booleanConstructBeingEdited = null
      this.$store.commit("removeFrameFromEditList", this.frame)
    },
    deleteFrame() {
      this.frameIsBeingDeleted = null
      this.$store.commit("removeFrame", this.frame)
      setVerticalPositionOfAnnotationLines(this.displayedSourceDocument)
    },
    toggleSubdivision() {
      if (this.subdivided) {
        if (!this.frame.booleanConstruct) {
          this.frame.booleanConstruct = new BooleanConstruct()
          this.frame.booleanConstruct.addEmptyChild()
        }
      } else {
        this.frame.booleanConstruct = null
      }
    },
    setSubType(subTypeId) {
      const index = this.frame.subTypeIds.indexOf(subTypeId)
      if (index == -1) {
        this.frame.subTypeIds.push(subTypeId)
      } else {
        this.frame.subTypeIds.splice(index, 1)
      }
    },
    copyIdToClipboard() {
      navigator.clipboard.writeText(this.frame.id);
      this.idIsCopiedToClipboard = true
    }
  },
  components: {
    DraggableTreeView,
    TreeviewBooleanConstruct,
    BooleanConstructPanel,
    CommentsList,
  },
};
</script>

<style>
.frame-id {
  font-size: 9pt;
  margin-left: 6px;
}
</style>