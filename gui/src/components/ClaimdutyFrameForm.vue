<template>
  <q-card flat bordered v-if="frame">
    <q-card-section>
      <div class="row items-center">
        <div class="col-2">CLAIM-DUTY</div>
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

      <div class="q-pa-md">
        <RoleSelector :frame="frame" attribute="duty" label="Duty" :multipleFramesAllowed="false" />
        <RoleSelector :frame="frame" attribute="claimant" label="Claimant" :multipleFramesAllowed="false" />
        <RoleSelector :frame="frame" attribute="holder" label="Duty holder" :multipleFramesAllowed="false" />
      </div>
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
import RoleSelector from "./RoleSelector.vue";
import CommentsList from "./CommentsList.vue";
import BooleanConstructPanel from "./BooleanConstructPanel.vue";
import { setVerticalPositionOfAnnotationLines } from "../helpers/underlining.js"

export default {
  emits: ["closed"],
  data: () => ({
    showSource: false,
    showComments: false,
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
  },
  mounted() {
    this.updateLabel();
  },
  methods: {
    closeFrame() {
      this.frame.activeField = null
      this.$store.commit("removeFrameFromEditList", this.frame)
    },
    deleteFrame() {
      this.frameIsBeingDeleted = null
      this.$store.commit("removeFrame", this.frame)
      setVerticalPositionOfAnnotationLines(this.displayedSourceDocument)
    },
    copyIdToClipboard() {
      navigator.clipboard.writeText(this.frame.id);
      this.idIsCopiedToClipboard = true
    },
    userChangedLabel() {
      //when clearing, label is null, set it to "" instead
      if (this.frame.shortName == null) {
        this.frame.shortName = "";
      }
      //stop generating label automatically when user types their own label
      //when user deletes label, set auto generating to true
      this.frame.generateLabelAutomatically = this.frame.shortName.length === 0;
    },
    updateLabel() {
      //somehow, updateLabel is triggered from 'watch' when panel is closed and frame is null
      //therefore: check for frame equals null
      if (this.frame && this.frame.generateLabelAutomatically) {
        this.frame.generateLabel();
      }
    },
  },
  watch: {
    "frame.duty"() {
      this.updateLabel();
    },
    "frame.claimant"() {
      this.updateLabel();
    },
    "frame.holder"() {
      this.updateLabel();
    },
  },
  components: {
    RoleSelector,
    CommentsList,
    BooleanConstructPanel,
  },
};
</script>
