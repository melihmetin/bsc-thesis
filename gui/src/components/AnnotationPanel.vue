<template>
  <div id="annotationPanel" ref="annotationPanel" v-if="annotation" :style="{
    left: coordX + 50 + 'px',
    top: coordY - 100 + 'px',
  }">
    <q-card bordered>
      <q-card-section>
        <div>
          <span v-for="snippet in snippetsForThisAnnotation">
            {{ snippet.text }}
          </span>
        </div>
      </q-card-section>
      <q-card-section>

        <div class="label">Create new frame</div>

        <div>
          <q-btn v-for="(frameType, frameTypeId) in frameTypes" class="q-mr-sm" :label="frameType.label"
            :color="colors[frameTypeId]" @click="frameTypeButtonClicked(frameTypeId)" />
        </div>
      </q-card-section>
      <q-card-actions v-if="frameBeingEdited">
        <div class="label">Or</div>
        <q-btn flat @click="addingToOpenFrame" color="primary">
          Add to {{ frameBeingEdited.typeId }}
        </q-btn>
        <div>{{ frameBeingEdited.shortName }}</div>
      </q-card-actions>
      <q-card-actions v-if="frames.length > 0">
        <div class="label">Or</div>
        <q-btn flat @click="addingToExistingFrame" color="primary">
          Add to other frame
        </q-btn>
      </q-card-actions>
      <q-card-actions>
        <q-btn color="negative" flat @click="cancelAnnotation">Cancel</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { colors } from "../helpers/config.js";
import { frameTypes } from "../model/frame";
export default {
  data: () => ({
    colors: colors,
    coordX: 0,
    coordY: 0,
    frameTypes: frameTypes
  }),
  computed: {
    frameBeingEdited() {
        return this.$store.state.frameBeingEdited
    },
    annotation() {
      return this.$store.state.annotationBeingEdited;
    },
    frames() {
      return this.$store.state.frames;
    },
    clickedPosition() {
      return this.$store.state.clickedPosition;
    },
    snippetsForThisAnnotation() {
      return this.$store.state.sourceDocuments
        .map((sourceDoc) => sourceDoc.getSnippetsForAnnotation(this.annotation))
        .flat();
    },
  },
  // update component lifecycle hook
  updated() {
    if (this.annotation) {
      this.coordY = this.determineCoordY(
        this.$refs.annotationPanel.clientHeight,
      );
      this.coordX = this.determineCoordX();
    }
  },
  methods: {
    frameTypeButtonClicked(frameTypeId) {
      //create new frame, set annotation's frame to this new frame
      //or, if the frame is an act or claimduty, add the sentences of the annotation
      //to the sourceSentences of the act / claimduty
      this.$store.commit("addNewFrame", {
        frameTypeId: frameTypeId,
        subTypeId: null,
        annotation: this.annotation,
        openInEditor: true,
        initialLabel: this.snippetsForThisAnnotation.map(s => s.text).join("")
      });
      this.$store.state.annotationBeingEdited = null
    },
    cancelAnnotation() {
      this.$store.commit("deleteAnnotation", this.annotation) // == annotationBeingEdited
      this.$store.state.annotationBeingEdited = null
    },
    addingToOpenFrame() {
      if (this.frameBeingEdited.typeId == "fact") {
        this.annotation.frame = this.frameBeingEdited
      } else {
        //get sentences for this annotation
        const sentences = this.snippetsForThisAnnotation
          .map(snippet => snippet.sentence)
          .filter((sentence, index, sentences) => sentences.findIndex(s => s.id == sentence.id) === index)
          .filter(sentence => !(this.frameBeingEdited.sourceSentences.some(s => s.id == sentence.id)))
        this.frameBeingEdited.sourceSentences = this.frameBeingEdited.sourceSentences.concat(sentences)
        this.$store.commit("deleteAnnotation", this.annotation)
      }
      this.$store.state.annotationBeingEdited = null
    },
    addingToExistingFrame() {
      this.$store.state.annotationToBeAddedToExistingFrame = this.annotation;
      this.$store.state.addingAnnotationToExistingFrame = true;
      this.$store.state.annotationBeingEdited = null;
    },
    determineCoordX() {
      return window.innerWidth - this.clickedPosition[0] > 440
        ? this.clickedPosition[0]
        : this.clickedPosition[0] - 440;
    },
    determineCoordY(componentsHeight) {
      if (window.innerHeight - this.clickedPosition[1] < componentsHeight) {
        return this.clickedPosition[1] - componentsHeight;
      } else {
        return this.clickedPosition[1];
      }
    },
  },
};
</script>

<style lang="css" scoped>
#annotationPanel {
  position: absolute;
  width: 440px;
}

.message {
  font-weight: bold;
}

.label {
  margin-right: 10px;
}

.label.bold {
  font-weight: bold;
}
</style>
