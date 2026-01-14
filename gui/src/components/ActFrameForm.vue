<template>
  <q-card flat bordered v-if="frame">
    <q-card-section>
      <div class="row items-center">
        <div class="col-2">ACT</div>
        <div class="col">
          <div class="row items-center">
            <template v-if="frame.sourceSentences.length > 0">
              <q-btn
                size="sm"
                round
                flat
                color="primary"
                class="q-mt-sm"
                icon="mdi-text-recognition"
                :loading="nlpIsBusy"
                @click.stop="applyNlpToSource"
                @mouseup.stop
              >
                <q-tooltip anchor="bottom middle" class="text-subtitle2">
                  <span
                    >Detect roles of an act frame.<br/>This feature is still
                    experimental, so use it with caution.</span
                  >
                </q-tooltip>
                <template v-slot:loading>
                  <q-spinner-gears />
                </template>
              </q-btn>
            </template>
            <template v-else>
              <div class="text-italic">No source added yet</div>
            </template>
          </div>
        </div>
        <div class="col-1">
          <q-btn
            size="sm"
            round
            flat
            color="primary"
            icon="mdi-comment-text-outline"
            @click="showComments = !showComments"
          >
            <q-badge
              v-if="frame.comments.length > 0"
              color="primary"
              floating
              >{{ frame.comments.length }}</q-badge
            >
            <q-tooltip class="text-subtitle2">Comments</q-tooltip>
          </q-btn>
        </div>
      </div>

      <q-input
        v-model="frame.shortName"
        label="Short name"
        input-style="font-size: 12pt; font-weight:bold"
        @update:model-value="userChangedLabel"
        @blur="updateLabel"
        clearable
      />
      <q-input v-model="frame.fullName" label="Full name" autogrow />

      <div class="q-pa-md">
        <RoleSelector
          :frame="frame"
          attribute="action"
          label="Action"
          :multipleFramesAllowed="false"
        />
        <RoleSelector
          :frame="frame"
          attribute="actor"
          label="Actor"
          :multipleFramesAllowed="false"
        />
        <RoleSelector
          :frame="frame"
          attribute="object"
          label="Object"
          :multipleFramesAllowed="false"
        />
        <RoleSelector
          :frame="frame"
          attribute="recipient"
          label="Recipient"
          :multipleFramesAllowed="false"
        />

        <div class="label">Precondition</div>
        <draggable-tree-view
          :boolean-construct="frame.precondition"
          origin="Act"
        ></draggable-tree-view>

        <div class="label">Postcondition</div>
        <RoleSelector
          :frame="frame"
          attribute="creates"
          label="Creates"
          :multipleFramesAllowed="true"
        />
        <RoleSelector
          :frame="frame"
          attribute="terminates"
          label="Terminates"
          :multipleFramesAllowed="true"
        />
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <template v-if="frameIsBeingDeleted">
        <div class="q-mr-sm">Are you sure you want to delete this frame?</div>
        <q-btn color="negative" @click="deleteFrame"
          >Yes
          <q-tooltip class="text-subtitle2"> Delete this frame </q-tooltip>
        </q-btn>
        <q-btn color="primary" @click="frameIsBeingDeleted = false">No</q-btn>
      </template>
      <template v-else>
        <q-btn color="negative" @click="frameIsBeingDeleted = true"
          >Delete</q-btn
        >
        <q-btn color="primary" @click="closeFrame"
          >Close
          <q-tooltip class="text-subtitle2">
            Any changes have been saved
          </q-tooltip>
        </q-btn>
      </template>
    </q-card-actions>
    <div class="flex flex-row items-center">
      <div class="frame-id">Frame id: {{ frame.id }}</div>
      <div class="col">
        <q-btn
          size="sm"
          round
          flat
          color="primary"
          :icon="
            idIsCopiedToClipboard
              ? 'mdi-clipboard-check-outline'
              : 'mdi-clipboard-arrow-left-outline'
          "
          @click="copyIdToClipboard"
        >
          <q-tooltip class="text-subtitle2">
            {{ idIsCopiedToClipboard ? "Copied" : "Copy to clipboard" }}
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
import { setVerticalPositionOfAnnotationLines } from "../helpers/underlining.js";
import { fetchNlpPrediction } from "../services/ApiServices.js";
import {
  getSelectedRangeAsSnippets,
  splitAndReturnSelectedSnippets,
} from "../helpers/annotating.js";
import { Annotation } from "../model/annotation";
import TreeviewBooleanConstruct from "./TreeviewBooleanConstruct.vue";
import DraggableTreeView from "./DraggableTreeView.vue";
export default {
  emits: ["closed"],
  data: () => ({
    showSource: false,
    showComments: false,
    frameIsBeingDeleted: false, //true when user clicked delete button
    nlpRoleToSubtype: {
      Actor: "agent",
      Recipient: "agent",
      Action: "action",
      Object: "object",
      Duty: "duty",
    },
    idIsCopiedToClipboard: false,
  }),
  mounted() {
    this.updateLabel();
  },
  computed: {
    sourceDocuments() {
      return this.$store.state.sourceDocuments;
    },
    displayedSourceDocument() {
      return this.$store.state.displayedSourceDocument;
    },
    frame() {
      return this.$store.state.frameBeingEdited;
    },
    annotationBeingEdited() {
      return this.$store.state.annotationBeingEdited;
    },
    booleanConstructBeingEdited() {
      return this.$store.state.booleanConstructBeingEdited;
    },
    nlpIsBusy() {
      //if nlp is not ready for one or more of this act's sentences, return true
      return this.frame.sourceSentences.some((s) => s.loading);
    },
  },
  methods: {
    closeFrame() {
      this.frame.activeField = null;
      this.$store.state.booleanConstructBeingEdited = null;
      this.$store.commit("removeFrameFromEditList", this.frame);
    },
    deleteFrame() {
      this.frameIsBeingDeleted = null;
      this.$store.commit("removeFrame", this.frame);
      setVerticalPositionOfAnnotationLines(this.displayedSourceDocument);
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
    async sendDataToNlp(sentence) {
      sentence.loading = true;
      const response = await fetchNlpPrediction(sentence.text);
      //filter out entries with no role
      let entities = response.predicted_entities; //.filter(([_, role]) => role != "None")

      sentence.loading = false;
      console.log("entities", entities);
      //ignore entities that have special tokens like '[CLS]'.
      entities = entities.filter(
        ([token, _]) => sentence.text.indexOf(token) != -1,
      );

      //current character range of subsequent tokens with equal roles
      let characterRangeStart = 0;
      let characterRangeEnd = 0;
      entities.forEach(([token, role], index) => {
        //get start and end index of token in sentence
        const tokenRange = this.getRange(
          sentence.text,
          token,
          characterRangeEnd,
        );

        characterRangeEnd = tokenRange[1];

        if (
          (index < entities.length - 1 && role != entities[index + 1][1]) ||
          index == entities.length - 1
        ) {
          //next token has different role, or this is last token
          //create annotation for current sequence of tokens with same role
          //unless the role is None
          if (role != "None") {
            const annotation = new Annotation();
            //create fact for this annotation, use the role suggested by NLP to set the correct subtype
            const subTypeId = this.nlpRoleToSubtype[role];
            this.$store.commit("addNewFrame", {
              frameTypeId: "fact",
              subTypeId: subTypeId,
              annotation: annotation,
              openInEditor: false,
            });
            //get snippets that are covered by the character range
            const selectionAsSnippets = getSelectedRangeAsSnippets(sentence, [
              characterRangeStart,
              characterRangeEnd,
            ]);
            //split snippets, and return those that fit the character range
            const selectedSnippets = splitAndReturnSelectedSnippets(
              selectionAsSnippets,
              this.frame.sourceSentences,
            );
            selectedSnippets.forEach((s) => {
              console.log("adding", annotation, "to snippet", s);
              s.addAnnotation(annotation);
            });
            //set length of annotation in number of snippets. this is used to set the order of the underlining: long annotations
            //will be closer to the text than shorter ones
            annotation.nrSnippets = selectedSnippets.length;
            //update underlining of annotations in the source text, for the currently showing document
            setVerticalPositionOfAnnotationLines(this.displayedSourceDocument);
          }
          //start new sequence of tokens
          characterRangeStart = tokenRange[0];
        }
      });
    },
    getRange(string, token, lastIndex) {
      // how about a potential second occurrence of the same token?
      const index = string.indexOf(token, lastIndex);
      if (index !== -1) {
        const endIndex = index + token.length;
        return [index, endIndex];
      } else {
        return null;
      }
    },
    applyNlpToSource() {
      console.log("nlp");
      this.frame.sourceSentences.forEach((sentence) => {
        this.sendDataToNlp(sentence);
      });
    },
    copyIdToClipboard() {
      navigator.clipboard.writeText(this.frame.id);
      this.idIsCopiedToClipboard = true;
    },
  },
  watch: {
    "frame.action"() {
      this.updateLabel();
    },
    "frame.object"() {
      this.updateLabel();
    },
    "frame.actor"() {
      this.updateLabel();
    },
    "frame.recipient"() {
      this.updateLabel();
    },
  },
  components: {
    TreeviewBooleanConstruct,
    DraggableTreeView,
    RoleSelector,
    CommentsList,
    BooleanConstructPanel,
  },
};
</script>
