<template>
  <q-card flat bordered>
    <div class="row items-center q-pa-sm">
      <div class="col">
        <q-btn class="q-mx-sm" v-for="doc in sourceDocuments" size="md" flat
          :color="doc.id == displayedSourceDocument?.id ? 'primary' : 'grey-5'" icon="mdi-book-search"
          @click="setDisplayedSourceDocument(doc)">
          {{ doc.title }}
        </q-btn>
      </div>
    </div>
    <q-separator />

    <q-card-section>
      <template v-if="displayedSourceDocument && displayedSourceDocument.sentences.length > 0">
        <!-- show selected sentences in document -->
        <div class="fill-height scrollable">
          <SentenceList
            :sentences="displayedSourceDocument.sentences.filter((s) => s.selected)"
            :indent="true"
            :showSentenceButtons="false"
            :isSourceOfSelectedFrame="false"
            :key="displayedSourceDocument.id"
          />
        </div>
      </template>
      <template v-else>
        <div>
          <p>
            No sentences selected. Select sentences in 'Collect sources'.
          </p>
        </div>
      </template>
    </q-card-section>
  </q-card>
</template>

<script>
import SentenceList from "../../components/SentenceList.vue";
export default {
  components: {
    SentenceList,
  },
  mounted() {
    //show by default the first document in the list of source documents
    this.$store.state.displayedSourceDocument =
      this.sourceDocuments.length > 0 ? this.sourceDocuments[0] : null;
  },
  computed: {
    sourceDocuments() {
      return this.$store.state.sourceDocuments;
    },
    displayedSourceDocument() {
      return this.$store.state.displayedSourceDocument;
    },
  },
  methods: {
    setDisplayedSourceDocument(document) {
      this.$store.state.displayedSourceDocument = document
    },
  },
  watch: {
    sourceDocuments() {
      this.$store.state.displayedSourceDocument = this.sourceDocuments.length > 0 ? this.sourceDocuments[0] : null
    }
  }
};
</script>

<style lang="css" scoped>
.scrollable {
  overflow-y: auto;
}

.fill-height {
  height: calc(100vh - 18px);
}

.snippet {
  display: inline;
}
</style>
