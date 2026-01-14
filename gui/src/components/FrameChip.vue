<template>
  <div>
    <div
      class="text-white frame-label ellipsis non-selectable"
      style="max-width: 400px"
      :class="disabled ? 'bg-grey no-pointer-events cursor-not-allowed' : `bg-${frameColor} cursor-pointer`"
      @click="handleClick"
    >
      {{
        frame.shortName?.length > 0 ? frame.shortName : frame.typeId
      }}
    </div>
    <q-tooltip class="bg-blue-1 text-grey-10 text-body2">
      <div style="max-width: 300px">
        {{ frame.fullName != "" ? frame.fullName : "- no full name given yet -" }}
      </div>
    </q-tooltip>
  </div>
</template>

<script>
import { icons, colors } from "../helpers/config.js";
import { frameTypes } from "../model/frame";
export default {
  data: () => ({
    icons: icons,
    colors: colors,
    frameTypes: frameTypes,
  }),
  props: {
    frame: Object
  },
  computed: {
    frameBeingEdited() {
      return this.$store.state.frameBeingEdited
    },
    booleanConstructBeingEdited() {
      return this.$store.state.booleanConstructBeingEdited
    },
    annotationToBeAddedToExistingFrame() {
        return this.$store.state.annotationToBeAddedToExistingFrame
    },
    addingAnnotationToExistingFrame() {
        return this.$store.state.addingAnnotationToExistingFrame
    },
    framesOpenInEditor() {
        return this.$store.state.framesOpenInEditor
    },
    frameColor() {
      return this.frame.typeId != "fact" || this.frame.subTypeIds.length == 0
          ? colors[this.frame.typeId] 
          : this.frame.subTypeIds.length > 1
            ? colors.multiple
            : colors[this.frame.subTypeIds[0]]
    },
    //prevent non-fact frames from being selected as a role of an Act or ClaimDuty
    //or as part of a boolean construct
    //prevent a frame from being part of itselfs
    disabled() {
      return this.frameBeingEdited != null &&
      ((['act', 'claim-duty'].includes(this.frameBeingEdited.typeId) &&
            this.frameBeingEdited.activeField != null) || (this.booleanConstructBeingEdited != null))
            && (this.frame.typeId == 'act' || this.frame.id == this.frameBeingEdited.id)
    },
    sourceDocuments() {
      return this.$store.state.sourceDocuments
    }
  },
  methods: {
    handleClick() {
        if (
            this.addingAnnotationToExistingFrame
        ) {
            //add annotation to this frame if the frame is a fact. else add sentences to the frames sourceSentences
            if (this.frame.typeId == "fact") {
              this.$store.state.annotationToBeAddedToExistingFrame.frame = this.frame
            } else {
              //get sentences for this annotation
              const sentences = this.sourceDocuments
                .map(doc => doc.getSentencesForAnnotation(this.$store.state.annotationToBeAddedToExistingFrame))
                .flat()
                .filter(sentence => !(this.frame.sourceSentences.some(s => s.id == sentence.id)))
              this.frame.sourceSentences = this.frame.sourceSentences.concat(sentences)
              this.$store.commit("deleteAnnotation", this.$store.state.annotationToBeAddedToExistingFrame)
            }
            this.$store.state.addingAnnotationToExistingFrame = false;
            this.$store.state.annotationToBeAddedToExistingFrame = null;
        } else if (
            this.frameBeingEdited &&
            this.frameBeingEdited.typeId != "fact" &&
            this.frameBeingEdited.activeField
        ) {
            //add frame to field in frame being edited (which is an act or claimduty)
            this.frameBeingEdited.addFrame(this.frame);
            const predefinedSubTypeId = this.frameBeingEdited.getSubTypeIdForActiveField()
            if (predefinedSubTypeId && !this.frame.subTypeIds.includes(predefinedSubTypeId)) {
              this.frame.subTypeIds.push(predefinedSubTypeId)
            }
            
            //get sentences of the frame that is added as a role to the act or claimduty
            //(only roles 'action','actor','object','recipient', not: precondition or postcondition creates/terminates)
            //add sentences to sourceSentences of the act / claimduty
            if (['action','actor','object','recipient','duty','claimant','holder'].includes(this.frameBeingEdited.activeField)) {
            const sentences = this.sourceDocuments.map(doc => doc.getSentencesForFrame(this.frame)).flat()
              .filter(sentence => !(this.frameBeingEdited.sourceSentences.some(s => s.id == sentence.id)))
            this.frameBeingEdited.sourceSentences = this.frameBeingEdited.sourceSentences.concat(sentences)
            }
            this.frameBeingEdited.activeField = null
            
        } else if (this.booleanConstructBeingEdited) {
            this.booleanConstructBeingEdited.frame = this.frame;
            this.$store.state.booleanConstructBeingEdited = null;
        } else {
            //open this frame in edit panel
            this.$store.state.frameBeingEdited = this.frame
            //if the frame is not yet in the list of edited frames, add it
            if (!(this.framesOpenInEditor.some(f => f.id == this.frame.id))) {
                this.$store.state.framesOpenInEditor = [...this.$store.state.framesOpenInEditor, this.frame]
            }
        }
    },

  }
};
</script>

<style lang="css" scoped>


.frame-label {
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 10pt;
  line-height: 1rem;
  margin: 2px;
}
</style>
