<template>
  <q-dialog
    :model-value="showComments"
    @update:model-value="$emit('update:show-comments', $event)"
    @hide="closeClicked"
  >
    <q-card style="width: 500px">
      <q-card-section class="flex flex-row items-baseline q-pb-none">
        <div class="text-h6">Comments</div>
        <q-space />
        <q-btn icon="mdi-close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div v-for="comment in fact.comments">
          <template v-if="commentBeingEdited == comment">
            <q-input
              v-model="commentBeingEdited.content"
              filled
              type="textarea"
            />
            <q-btn
              class="q-mt-sm q-mr-sm"
              color="negative"
              @click="
                commentBeingDeleted = comment;
                commentBeingEdited = null;
              "
              >Delete</q-btn
            >
            <q-btn class="q-mt-sm" color="primary" @click="saveChanges"
              >Save</q-btn
            >
          </template>
          <template v-else-if="commentBeingDeleted == comment">
            <div class="q-my-sm">{{ comment.content }}</div>
            <div>Are you sure to delete this comment?</div>
            <q-btn
              class="q-mt-sm q-mr-sm"
              color="negative"
              @click="deleteComment"
              >Yes</q-btn
            >
            <q-btn
              class="q-mt-sm"
              color="primary"
              @click="commentBeingDeleted = null"
              >No</q-btn
            >
          </template>
          <template v-else>
            <div class="q-my-sm">
              <div class="flex flex-row">
                <div class="col text-sm text-bold">{{ comment.author }}</div>
                <div class="col text-right">
                  <template v-if="comment.lastEditedAt">
                    <span class="text-italic">edited at </span>
                    <span class="text-sm">{{
                      formatDate(comment.lastEditedAt)
                    }}</span>
                  </template>
                  <template v-else>
                    <div>{{ formatDate(comment.createdAt) }}</div>
                  </template>
                </div>
              </div>
              <div class="flex flex-row q-mt-sm">
                <div class="col text-sm">
                  {{ comment.content }}
                </div>
                <div class="col-1 border-left">
                  <q-btn
                    size="sm"
                    round
                    flat
                    color="primary"
                    icon="mdi-pencil"
                    @click="commentBeingEdited = comment"
                  >
                    <q-tooltip class="text-subtitle2">
                      Edit or delete comment
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </template>
          <hr />
        </div>
        <!-- hide new comment panel if another comment is being edited -->
        <div v-if="!commentBeingEdited && !commentBeingDeleted">
          <q-input
            v-model="newComment.content"
            filled
            type="textarea"
            label="New comment"
          />
          <q-btn class="q-mt-sm" color="primary" @click="addComment">Add</q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { Comment } from "../model/comment.js";
export default {
  data: () => ({
    commentBeingEdited: null,
    commentBeingDeleted: null,
    newComment: null,
  }),
  mounted() {
    this.newComment = new Comment();
  },
  props: {
    showComments: Boolean,
    fact: Object,
  },
  computed: {
    editingExistingComment() {
      return this.fact.comments.some((c) => c.id == commentBeingEdited?.id);
    },
  },
  methods: {
    closeClicked() {
      this.$emit("closed");
    },
    addComment() {
      this.fact.comments.push(this.newComment);
      this.newComment = new Comment();
    },
    deleteComment() {
      const index = this.fact.comments.findIndex(
        (c) => c.id == this.commentBeingDeleted.id,
      );
      this.fact.comments.splice(index, 1);
      this.commentBeingDeleted = null;
    },
    saveChanges() {
      this.commentBeingEdited.lastEditedAt = new Date();
      this.commentBeingEdited = null;
    },
    formatDate(date) {
      return `${date.toLocaleDateString()} ${date
        .toLocaleTimeString()
        .substr(0, 5)} `;
    },
  },
};
</script>

<style>
.border-left {
  border-left: 1px solid rgb(25, 118, 210);
  margin-left: 10px;
}
</style>
