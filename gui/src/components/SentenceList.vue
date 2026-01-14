<template>
  <div class="document">
    <div class="q-mb-sm row no-wrap items-baseline" v-for="sentence in sentences.filter(s => s.visible)">
      <div>
        <q-btn v-if="sentence.children.filter(c => c.text.length > 0).length > 0" round size="sm"
          :icon="sentence.collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" flat text-color="primary"
          @click="sentence.toggleCollapse()"></q-btn>
      </div>
      <div v-if="showSentenceButtons">
        <q-btn
          round size="xs"
          flat
          icon="mdi-chevron-left"
          text-color="primary"
          @click="$emit('sentenceButtonClicked', sentence)"/>
      </div>
      <div :ref="`sentence-${sentence.iri}`" @mouseup="handleSelection" :style="indent ? getStyleForSentence(sentence) : ''">
        <span :style="getStyleForUnderlining(snippet, frameBeingEdited)" v-for="snippet in sentence.snippets"
          :data-snippet-id="snippet.id" :data-sentence-id="sentence.id">
          {{ snippet.text }}
        </span>
      </div>
      <div v-if="showDeleteButtons" class="col-grow float-right">
        <q-btn
          round size="xs"
          flat
          icon="mdi-close"
          text-color="primary"
          @click="$emit('deleteButtonClicked', sentence)"/>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getSelectionAsSnippets,
  splitAndReturnSelectedSnippets,
} from "../helpers/annotating.js";
import {
  getStyleForUnderlining,
  getStyleForLineSpacing,
  setVerticalPositionOfAnnotationLines
} from "../helpers/underlining.js";
import { getHeaderStyling } from "../helpers/sourceFormatting.js"
import { Annotation } from "../model/annotation";

export default {
  props: {
    sentences: Array, //sentences to be displayed in this list
    indent: Boolean, //if true, indentation is applied depending on position in hierarchical structure of the source
    showSentenceButtons: Boolean, //if true, show little icon left of each sentence. pressing it emits an event, e.g. to be used to adapt another view
    showDeleteButtons: Boolean, //if true show a delete button next to each sentence. pressing it emits an event, to delete the sentence from the source of an act/claim-duty
    isSourceOfSelectedFrame: Boolean //if true, this list is in the 'source of selected frame' panel. This influences the options in the pop-up when text is selected
  },
  emits: ['sentenceButtonClicked','deleteButtonClicked'],
  mounted() {
    if (!this.isSourceOfSelectedFrame) {
      this.scrollToSentence()
      }
  },
  computed: {
    annotationBeingEdited() {
      return this.$store.state.annotationBeingEdited;
    },
    frameBeingEdited() {
      return this.$store.state.frameBeingEdited;
    },
    booleanConstructBeingEdited() {
      return this.$store.state.booleanConstructBeingEdited;
    },
    sentenceToScrollTo() {
      return this.$store.state.sentenceToScrollTo
    },
    displayedSourceDocument() {
      return this.$store.state.displayedSourceDocument
    },
    sourceDocuments() {
      return this.$store.state.sourceDocuments
    }
  },
  methods: {
    getStyleForUnderlining, //snippets
    getStyleForSentence(sentence) { //sentences: linespacing and header styling (indentation, font weight, font size)
      return {
        ...getStyleForLineSpacing(sentence),
        ...getHeaderStyling(sentence)
      }
    },
    handleSelection(event) {
      console.log("handleSelection")
      const selection = window.getSelection();
      if (selection.toString().length > 0) {
        //if no annotation is open, create a new one, else use the existing one that is open
        let annotation;
        if (this.annotationBeingEdited) {
          annotation = this.annotationBeingEdited;
        } else {
          annotation = new Annotation();
        }
          //get selection in terms of start/end sentences, snippets, and offsets
        const selectionAsSnippets = getSelectionAsSnippets(
          selection,
          this.sentences,
        );
        //split snippets and return those that correspond with the selection
        const selectedSnippets = splitAndReturnSelectedSnippets(
          selectionAsSnippets,
          this.sentences,
        );
        selectedSnippets.forEach((s) => {
          s.addAnnotation(annotation);
        });
        //set length of annotation in number of snippets. this is used to set the order of the underlining: long annotations
        //will be closer to the text than shorter ones
        annotation.nrSnippets = selectedSnippets.length
        //update underlining of annotations in the source text, for the currently showing document
        setVerticalPositionOfAnnotationLines(this.displayedSourceDocument)

        //if user is creating a frame for a role, create fact immediately, without
        //showing the annotation panel
        if (
          !this.annotationBeingEdited &&
          this.frameBeingEdited &&
          this.frameBeingEdited.typeId != "fact" &&
          this.frameBeingEdited.activeField
        ) {
          //if there is a predefined subtype for the active field, assign it to the fact
          const predefinedSubTypeId = this.frameBeingEdited.getSubTypeIdForActiveField()
          const subTypeId = predefinedSubTypeId ? predefinedSubTypeId : null

          //store reference to the currently being edited frame
          //because frameBeingEdited will be set to the newly created frame
          const relationFrame = this.frameBeingEdited

          this.$store.commit("addNewFrame", {
            frameTypeId: 'fact',
            subTypeId: subTypeId,
            annotation: annotation,
            openInEditor: true,
            initialLabel: selection.toString()
          });

          const newFrame = this.frameBeingEdited
          //add the frame that has just being created to the proper role in the relation (act / claim-duty)
          relationFrame.addFrame(newFrame);
          
          //if active field is one of the roles 'action','actor','object','recipient','duty','claimant','duty holder'
          //add sentences from the newFrame's annotation to the relationFrame (act/claim-duty)
          if (['action','actor','object','recipient','duty','claimant','holder'].includes(relationFrame.activeField)) {
            const sentences = this.sourceDocuments.map(doc => doc.getSentencesForFrame(newFrame)).flat()
              //.filter(sentence => !(relationFrame.sourceSentences.some(s => s.id == sentence.id)))
            relationFrame.sourceSentences = relationFrame.sourceSentences.concat(sentences)
          }
          relationFrame.activeField = null;
        } else {
          //no role is selected, or role is booleanconstruct (that requires annotation panel)
          this.$store.state.annotationBeingEdited = annotation;
        }
        selection.empty()
      } else {
        const clickedSentence = this.sentences.find(
          (s) => s.id == selection.anchorNode.parentNode.dataset.sentenceId,
        );
        const clickedSnippet = clickedSentence.snippets.find(
          (s) => s.id == selection.anchorNode.parentNode.dataset.snippetId,
        );
        this.$store.state.selectedSnippet = clickedSnippet;
      }
      this.$store.state.clickedPosition = [event.clientX, event.clientY];
    },
    //when user pressed 'scroll to source'
    scrollToSentence() {
      if (this.sentenceToScrollTo) {
        const ref = this.$refs[`sentence-${this.sentenceToScrollTo.iri}`]
        if (ref && ref.length > 0 && ref[0]) {
          ref[0].scrollIntoView({ block: "center", behavior: 'smooth' });
          this.$store.state.sentenceToScrollTo = null
        }
      }
    }
  },
  watch: {
    sentenceToScrollTo() {
      if (!this.isSourceOfSelectedFrame) {
        this.scrollToSentence()
      }
    },
    sentences() {
      if (!this.isSourceOfSelectedFrame) {
      this.scrollToSentence()
      }
    }
  },
};
</script>

<style scoped>
.document {
  word-wrap: break-word;
}
</style>
