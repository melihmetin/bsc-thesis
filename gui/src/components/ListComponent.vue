<template>

<div class="document">
    <div class="q-mb-md row no-wrap items-baseline" v-for="sentence in sourceDocument.sentences.filter(s => s.visible)">
      <div><q-checkbox v-model="sentence.selected" size="xs"></q-checkbox></div>
      <div>
        <q-btn v-if="sentence.children.filter(c => c.text.length > 0).length > 0" round size="sm"
          :icon="sentence.collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" flat text-color="primary"
          @click="sentence.toggleCollapse()"></q-btn>
      </div>

      <div :style="getHeaderStyling(sentence)">
        <span v-for="snippet in sentence.snippets">
          {{ snippet.text }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { getHeaderStyling } from "../helpers/sourceFormatting.js"
export default {
  props: {
    sourceDocument: Object
  },
  methods: {
    getHeaderStyling(sentence) {
      return getHeaderStyling(sentence)
    }
  }
}
</script>

<style scoped>
.document {
  word-wrap: break-word;
}
</style>
