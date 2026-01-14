<template>
    <div class="fit scroll q-pa-sm" v-if="frameBeingEdited">
       <div v-if="frameBeingEdited.typeId != 'fact'">
        <span class="text-sm">Show source of</span>
        <q-checkbox v-model="showSourceOfPrecondition" size="xs">precondition</q-checkbox>
        <q-checkbox v-model="showSourceOfPostcondition" size="xs">postcondition</q-checkbox>
       </div>
        <div v-for="sourceDoc in sourceDocuments">
            <div class="text-primary text-bold">{{ sourceDoc.title }}</div>
            <SentenceList
                :sentences="getSentencesForFrameInSourceDoc(sourceDoc)"
                :indent="false"
                :showSentenceButtons="true"
                :showDeleteButtons="frameBeingEdited.typeId != 'fact'"
                :isSourceOfSelectedFrame="true"
                @sentenceButtonClicked="scrollToSource"
                @deleteButtonClicked="removeSentenceFromSource"
            />
            <div v-if="getSentencesForFrameInSourceDoc(sourceDoc).length == 0">-</div>
        </div>
    </div>
</template>
<script>
    import SentenceList from "../../components/SentenceList.vue";
export default {
    data: () => ({
        showSourceOfPrecondition: false,
        showSourceOfPostcondition: false
    }),
    components: {
        SentenceList
    },
    computed: {
        frameBeingEdited() {
            return this.$store.state.frameBeingEdited;
        },
        sourceDocuments() {
            return this.$store.state.sourceDocuments;
        },
    },
    methods: {
        //in source view, scroll to clicked sentence
        scrollToSource(sentence) {
            //show correct source
            this.$store.state.displayedSourceDocument = sentence.sourceDocument
            //scroll to sentence
            this.$store.state.sentenceToScrollTo = sentence
        },
        removeSentenceFromSource(sentence) {
            const index = this.frameBeingEdited.sourceSentences.findIndex(s => s.id == sentence.id)
            this.frameBeingEdited.sourceSentences.splice(index, 1)
        },
        getSentencesForFrameInSourceDoc(doc) {
            let sentences = this.frameBeingEdited.typeId == "fact"
                ? doc.getSentencesForFrame(this.frameBeingEdited)
                : this.frameBeingEdited.sourceSentences.filter(s => s.sourceDocument.id == doc.id)
                    //add sentences for pre and postcondition
                    .concat(this.showSourceOfPrecondition
                        ? this.frameBeingEdited.precondition.allFramesNoSubdivision
                            .map(frame => doc.getSentencesForFrame(frame)).flat()
                        : [])
                    .concat(this.showSourceOfPostcondition
                        ? this.frameBeingEdited.creates.concat(this.frameBeingEdited.terminates)
                            .map(frame => doc.getSentencesForFrame(frame)).flat()
                        : []
                    )
                    .filter((sentence, index, sentences) => sentences.findIndex(s => s.id == sentence.id) === index);
                

            sentences.sort((s1, s2) => s1.id.localeCompare(s2.id))
            return sentences
        }
    },
    watch: {
        frameBeingEdited() {
            //console.log("frameBeingEdited", this.frameBeingEdited)
        }
    }
}
</script>

<style>
.highlighted {
    /* background-color: #eeeeee; */
    text-decoration: underline;
    font-weight: bold;
}

.scrollable {
  overflow-y: auto;
}

.fill-height {
  height: calc(100vh - 180px);
}
</style>