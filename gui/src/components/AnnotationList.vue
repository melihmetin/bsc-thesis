<template>
    <!-- show panel if snippet is selected and contains annotations -->
    <div id="annotation-list" ref="annotationListPanel" v-if="selectedSnippet && selectedSnippet.annotations.length > 0"
        :style="{
            left: coordX + 50 + 'px',
            top: coordY - 150 + 'px',
        }">
        <q-card bordered>
            <template v-if="annotationBeingDeleted">
                <q-card-section>

                    <div class="ellipsis" style="max-width: 200px;">
                        {{ getAnnotationSource(annotationBeingDeleted) }}
                        <q-tooltip class="bg-blue-1 text-grey-10 text-body2">
                            <div style="max-width: 300px">
                                {{ getAnnotationSource(annotationBeingDeleted) }}
                            </div>
                        </q-tooltip>
                    </div>
                </q-card-section>
                <q-card-actions>
                    <div class="q-mr-sm">Are you sure you want to delete this annotation?</div>
                    <q-btn color="negative" @click="deleteAnnotation(annotationBeingDeleted)">Yes</q-btn>
                    <q-btn color="primary" @click="annotationBeingDeleted = null">No</q-btn>
                </q-card-actions>
            </template>
            <template v-else>
                <q-card-section>
                    <!-- list all annotations associated with this snippet -->
                    <div class="annotation-row" v-for="annotation in selectedAnnotations">
                        <div class="ellipsis" style="max-width: 200px;">
                            {{ getAnnotationSource(annotation) }}
                            <q-tooltip class="bg-blue-1 text-grey-10 text-body2">
                                <div style="max-width: 300px">
                                    {{ getAnnotationSource(annotation) }}
                                </div>
                            </q-tooltip>
                        </div>
                        
                        <template v-if="annotation.frame && (!frameBeingEdited || frameBeingEdited.id != annotation.frame.id)">
                            <q-btn flat @click="openFrameOfAnnotation(annotation)">Open frame</q-btn>
                        </template>
                        <template v-if="!annotation.frame">
                            <q-btn flat @click="addAnnotationToExistingFrame(annotation)">Add to frame</q-btn>
                        </template>
                        <q-btn color="negative" flat @click="annotationBeingDeleted = annotation">Delete</q-btn>
                    </div>
                </q-card-section>
                <q-card-actions>
                    <q-btn flat @click="closePanel">Close</q-btn>
                </q-card-actions>
            </template>

        </q-card>
    </div>
</template>

<script>
import { setVerticalPositionOfAnnotationLines } from "../helpers/underlining.js"
export default {
    data: () => ({
        coordX: 0,
        coordY: 0,
        annotationBeingDeleted: null
    }),
    // update component lifecycle hook
    updated() {
        if (this.selectedSnippet && this.selectedSnippet.annotations.length > 0) {
            this.coordY = this.determineCoordY(
                this.$refs.annotationListPanel.clientHeight
            );
            // console.log("this.$refs.annotationListPanel", this.$refs.annotationListPanel)
            // this.coordY = this.clickedPosition[1];
            this.coordX = this.determineCoordX();
        }
    },
    computed: {
        selectedSnippet() {
            return this.$store.state.selectedSnippet
        },
        selectedAnnotations() {
            return this.selectedSnippet
                ? this.selectedSnippet.annotations
                : []
        },
        displayedSourceDocument() {
            return this.$store.state.displayedSourceDocument
        },
        clickedPosition() {
            return this.$store.state.clickedPosition
        },
        framesOpenInEditor() {
            return this.$store.state.framesOpenInEditor
        },
        sourceDocuments() {
            return this.$store.state.sourceDocuments
        },
        frameBeingEdited() {
            return this.$store.state.frameBeingEdited
        }

    },
    methods: {
        closePanel() {
            this.$store.state.selectedSnippet = null
        },
        deleteAnnotation(annotation) {
            //remove the annotaiton from the frame, and from the snippets, possibly in multiple source documents
            this.$store.commit("deleteAnnotation", annotation)
            if (this.selectedAnnotations.length == 0) {
                this.$store.state.selectedSnippet = null
            }
            this.annotationBeingDeleted = null
            //redraw the annotation lines
            setVerticalPositionOfAnnotationLines(this.displayedSourceDocument)
        },
        getAnnotationSource(annotation) {
            let annotationSource = ""
            this.sourceDocuments.forEach((sourceDoc, i) => {
                const annotationSourceInDoc = sourceDoc
                    .getSnippetsForAnnotation(annotation)
                    .map(s => s.text)
                    .join("")
                if (i > 0) {
                    annotationSource += "\n" //separate source from different documents by newline
                }
                annotationSource += annotationSourceInDoc
            })
            return annotationSource
        },
        openFrameOfAnnotation(annotation) {
            //if annotation's frame is not yet in the list of frames being edited, add it
            if (!(this.framesOpenInEditor.some(f => f.id == annotation.frame.id))) {
                this.$store.state.framesOpenInEditor = [...this.$store.state.framesOpenInEditor, annotation.frame]
            }
            this.$store.state.frameBeingEdited = annotation.frame
            //close annotation list panel
            this.$store.state.selectedSnippet = null
        },
        addAnnotationToExistingFrame(annotation) {
            this.$store.state.annotationToBeAddedToExistingFrame = annotation
            this.$store.state.addingAnnotationToExistingFrame = true
            //close annotation list panel
            this.$store.state.selectedSnippet = null
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
}
</script>

<style lang="css" scoped>
#annotation-list {
    position: absolute;
    width: 440px;
    min-height: 50px;
}

.annotation-row {
    display: grid;
    grid-template-columns: auto max-content max-content;
    column-gap: 5px;
    align-items: center;
}
</style>