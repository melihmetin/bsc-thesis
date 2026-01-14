<template>
  <div class="panel flex flex-row" :class="{ active: isBeingEdited, negated: booleanConstruct.isNegated }"
    @click="handleClick">
    <div class="col">
      <!-- negation label -->
      <div v-if="booleanConstruct.isNegated" class="negation-label">NOT</div>
      <template v-if="booleanConstruct.frame">
        <!-- boolean construct is 'atomic': it refers to a frame, and has no children -->
        <div class="row-container">
          <!-- selected chip -->
          <FrameChip :frame="booleanConstruct.frame" :disable="false" />
          <!-- remove chip button -->
          <q-btn round size="xs" flat color="negative" icon="mdi-close" @click="removeFrame" />
        </div>
      </template>

      <div v-for="(child, i) in booleanConstruct.children">
        <BooleanConstructPanel :booleanConstruct="child" />

        <!-- buttons for changing operator and adding another child -->
        <!-- show options for boolean operator -->
        <!-- TODO:
         Step 1: consider switching to alternative visual representations for deeply nested levels. A searchable select element or a q-btn with dropdown might be good alternatives
         Step 2: set a min-width to the panel
         Step 3: set an information dialog with a message
         -->
        <q-btn-group class="q-ml-md q-my-xs" flat v-if="i !== booleanConstruct.children.length - 1">
          <q-btn v-for="option in booleanOptions" size="sm" padding="xs md" :color="booleanConstruct.operatorToJoinChildren == option.value
    ? 'primary'
    : 'grey'
    " dense @click="() => {
    //set operator to clicked value
    booleanConstruct.operatorToJoinChildren = option.value;
  }
    " :label="option.label">
            <q-tooltip class="text-subtitle2">
              {{ option.description }}
            </q-tooltip>
          </q-btn>
        </q-btn-group>
        <!-- add a new operand -->
        <q-btn v-else class="q-my-sm q-ml-md" round dense color="primary" size="sm" icon="mdi-plus" @click="addChild">
          <q-tooltip class="text-subtitle2">Add new operand</q-tooltip>
        </q-btn>
      </div>
      <div v-if="isBeingEdited" class="button-label">
        Select frame or create new frame from source
      </div>
    </div>
    <div class="col-1 buttons-container">
      <div>
        <q-btn size="sm" color="#d42d19" dense flat icon="mdi-minus-circle-outline" @click="toggleNegation" />
      </div>
      <div>
        <q-btn size="sm" color="#007bc7" dense flat icon="mdi-format-list-bulleted-square" @click="subdivide" />
      </div>
      <div v-if="booleanConstruct.parent">
        <q-btn size="sm" color="#007bc7" dense flat icon="mdi-close" @click="deleteBooleanConstruct" />
      </div>
    </div>
  </div>
</template>

<script>
import FrameChip from "./FrameChip.vue";
export default {
  name: "booleanConstructPanel",
  data: () => ({
    textSnippet: "",
    tags: [
      { label: "Agent", value: "agent" },
      { label: "Action", value: "action" },
      { label: "Object", value: "object" },
      { label: "Conditions", value: "conditions" },
    ],
    booleanOptions: [
      { label: "AND", value: "and", description: "AND (boolean)" },
      { label: "OR", value: "or", description: "OR (boolean)" },
      { label: "PLUS", value: "plus", description: "Plus (arithmetic)" },
      { label: "MINUS", value: "minus", description: "Minus (arithmetic)" },
      {
        label: ">",
        value: "greaterThan",
        description: "Greater than (comparison)",
      },
      { label: "<", value: "lessThan", description: "Less than (comparison)" },
      {
        label: "≥",
        value: "greaterThanOrEqualTo",
        description: "Greater than or Equal to (comparison)",
      },
      {
        label: "≤",
        value: "lessThanOrEqualTo",
        description: "Less than or Equal to (comparison)",
      },
      { label: "=", value: "assign", description: "Assignment" },
      { label: "==", value: "equals", description: "Equals (comparison)" },
      { label: "IF", value: "if", description: "If function" },
    ],
  }),
  props: {
    booleanConstruct: Object,
  },
  computed: {
    frameBeingEdited() {
      return this.$store.state.frameBeingEdited;
    },
    booleanConstructBeingEdited() {
      return this.$store.state.booleanConstructBeingEdited;
    },
    isBeingEdited() {
      return this.booleanConstruct == this.booleanConstructBeingEdited;
    },
  },
  components: {
    FrameChip,
  },
  methods: {
    addParent(event) {
      event.stopPropagation();
      this.booleanConstruct.addParent();
    },
    subdivide(event) {
      event.stopPropagation();
      this.booleanConstruct.subdivide();
    },
    addChild() {
      console.log("booleanConstruct adding child");
      const newChild = this.booleanConstruct.addEmptyChild();
      //set focus to new child
      this.$store.state.booleanConstructBeingEdited = newChild;
    },
    handleClick(event) {
      console.log("handleClick")
      //prevent propagation to underlying panels
      event.stopPropagation();
      //if empty leaf node, select for adding frame
      if (
        !this.booleanConstruct.frame &&
        this.booleanConstruct.children.length == 0
      ) {
        this.$store.state.booleanConstructBeingEdited = this.isBeingEdited
          ? null
          : this.booleanConstruct;
        //de-select any other properties of the active frame, if it is a relation (act or claim-duty)
        if ('activeField' in this.frameBeingEdited) {
          this.frameBeingEdited.activeField = null
        }
      }
    },
    toggleNegation() {
      this.booleanConstruct.isNegated = !this.booleanConstruct.isNegated;
    },
    removeFrame() {
      this.booleanConstruct.removeFrame(this.booleanConstruct.frame);
    },
    deleteBooleanConstruct(event) {
      event.stopPropagation();
      //if bc has no parent, do not delete, since that would leave precondition empty
      //instead: clean
      if (this.booleanConstruct.parent) {
        this.booleanConstruct.delete();
      } else {
        this.booleanConstruct.clean();
      }
    },
  },
};
</script>

<style>
.panel {
  padding: 10px 4px;
  border-radius: 5px;
  margin-left: 2px;
  box-shadow: 0px 0px 4px #aaaaaa;
  background-color: #ffffff;
  border: solid 2px #ffffff;
}


.panel.active {
  border: solid 2px rgb(25, 118, 210);

}

.panel.negated {
  /* border: dotted 2px hsl(17, 79%, 46%); */
  background-color: rgb(255, 231, 222);
}

.bordered-panel {
  border-left: 2px solid #007bc6;
  padding-left: 14px;
}

.operator-label {
  color: #007bc6;
  text-transform: uppercase;
}

.button-label {
  display: inline-block;
  font-style: italic;
  margin-left: 5px;
}

.negation-label {
  font-weight: bold;
  font-size: 9pt;
  margin-bottom: 2px;
  color: #d42d19;
}

.row-container {
  display: flex;
  flex-direction: row;
}

.button-container {
  display: flex;
  flex-direction: column;
}
</style>