<script>
import FrameChip from "./FrameChip.vue";
import { BooleanConstruct } from "../model/booleanConstruct.js";
export default {
  name: "TreeviewBooleanConstruct",
  components: {
    FrameChip,
  },
  props: {
    booleanConstruct: Object,
    origin: {
      type: String,
      default: "Fact",
    },
  },
  data: () => ({
    booleanOptions: [
      { label: "AND", value: "and", description: "AND (boolean)" },
      { label: "OR", value: "or", description: "OR (boolean)" },
      { label: "PLUS", value: "plus", description: "Plus (arithmetic)" },
      { label: "MINUS", value: "minus", description: "Minus (arithmetic)" },
      { label: "NOT", value: "not", description: "Negation" },
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
    selectModel: [],
    options: null,
    selectedNode: null,
    notMargined: false,
    expanded: [],
  }),
  computed: {
    frameBeingEdited() {
      return this.$store.state.frameBeingEdited;
    },
    booleanConstructBeingEdited() {
      return this.$store.state.booleanConstructBeingEdited;
    },
    booleanConstructBeingEditedId() {
      return this.$store.state.booleanConstructBeingEdited?.id;
    },
    isBeingEdited() {
      return (
        this.selectedNode &&
        this.selectedNode == this.booleanConstructBeingEditedId
      );
    },
    parentNodeId() {
      return this.booleanConstruct.id;
    },
  },
  watch: {
    selectedNode: function (newV, oldV) {
      console.log("newV:", newV, "oldV:", oldV);
      const selectionOld = this.getNodeByKey(oldV);
      selectionOld && oldV ? (selectionOld.beingEdited = false) : null;

      const selectionNew = this.getNodeByKey(newV);
      selectionNew ? (selectionNew.beingEdited = true) : null;
      // set the focus to the new node
      this.$store.state.booleanConstructBeingEdited = selectionNew;
    },
    booleanConstructBeingEdited: {
      handler(n, o) {
        console.log("n,o", n, o);
        if (!this.booleanConstructBeingEdited) {
          this.selectedNode = null;
        }
        if (o?.frame) {
          o.beingEdited = false;
          this.selectedNode = null;
        }
      },
      once: true,
    },
    parentNodeId(value) {
      this.$nextTick(() => {
        const treeRef = this.$refs["tree-structure"];
        if (!treeRef || typeof treeRef.setExpanded !== "function") {
          console.warn(
            "Tree structure ref or setExpanded() not ready",
            treeRef,
          );
          return;
        }
        if (!value) {
          console.warn("Invalid value for node id", value);
          return;
        }
        treeRef.setExpanded(value, true);
      });
    },
  },
  mounted() {
    console.log("mounting Treeviewboolean:", this.booleanConstruct);
    this.options = Array.from(this.booleanOptions);
    // it expands the parent node of the hierarchy
    this.$refs["tree-structure"].setExpanded(this.parentNodeId, true);
  },
  methods: {
    getNodeByKey(key) {
      console.log(
        "nodes.data in the tree:",
        this.$refs["tree-structure"].getNodeByKey(key),
      );
      return this.$refs["tree-structure"].getNodeByKey(key);
    },
    selectValue(val, node) {
      node.operatorToJoinChildren = val.value;
      // temporary fix: if the selected function is not, update the corresponding property
      val.value === "not" ? (node.isNegated = true) : (node.isNegated = false);
    },
    // filters the lists of operators in the select panel
    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.options = this.booleanOptions.filter(
          (v) => v.value.toLowerCase().indexOf(needle) > -1,
        );
      });
    },
    // adds children to the selected node.
    addChild(nodeData) {
      console.log("adding child to booleanConstruct", "nodeData", nodeData);
      // if no frame has been assigned to the children, do not allow the creation of new children before filling in the
      // previous ones
      // if (
      //   !nodeData.children.every((c) => c.frame) &&
      //   !nodeData.children.every((c) => c.children.length > 0)
      // ) {
      //   // if (!nodeData.children.every((c) => c.frame))
      //   console.log(
      //     "Please add frames to the previous children before creating a new one!",
      //   );
      //   alertWidget(
      //     "error",
      //     "Please fill in frames for the existing elements before adding new ones.",
      //     4000,
      //   );
      //
      //   return;
      // }
      const newChild = new BooleanConstruct();
      nodeData.children.push(newChild);
      newChild.parent = nodeData;
      console.log("newCHild: ", newChild);
      this.selectedNode = newChild.id;
    },
    // adds an extra level of hierarchy to the selected node
    subdivide(event, nodeData) {
      console.log("nodeData to subdivide:", nodeData);
      event.stopPropagation();
      nodeData.subdivide();
      // set the top level of the construct to be expanded
      this.$refs["tree-structure"].setExpanded(this.parentNodeId, true);
      // set the current node to expanded
      this.$refs["tree-structure"].setExpanded(nodeData.id, true);
      // determine margin of parent
      !nodeData.parent && nodeData.children.length > 0
        ? (this.notMargined = false)
        : null;
    },
    toggleNegation(nodeId) {
      const selectedData = this.getNodeByKey(nodeId);
      selectedData.isNegated = !selectedData.isNegated;
    },
    removeFrame(node) {
      node.beingEdited = false;
      node.frame = null;
      // node.removeFrame(node.frame)
    },
    // removing extra level of hierarchy from a node
    deleteBooleanConstruct(event, nodeData) {
      event.stopPropagation();
      nodeData.beingEdited = false;
      //if bc has no parent, do not delete, since that would leave precondition empty
      //instead: clean
      if (nodeData.parent) {
        nodeData.delete();
      } else {
        nodeData.clean();
      }
      // set the initial margin to negative for styling purposes
      !nodeData.parent.parent && nodeData.parent.children.length == 0
        ? (this.notMargined = true)
        : null;
      this.selectedNode = null;
    },
    //  while clicking the body of each node in the treeview
    handleClick(event, node) {
      //prevent propagation to underlying panels
      event.stopPropagation();
      console.log("node", node, node.beingEdited, this.selectedNode);

      //
      if (this.selectedNode == node.id && !node.frame) {
        console.log("selected!");
        this.selectedNode = null;
        return;
      }
      if (this.selectedNode == node.id && node.frame) {
        console.log("selected with frame!");
        this.selectedNode = null;
        return;
      }

      //if empty leaf node, select for adding frame
      if (!node.frame && node.children.length == 0) {
        //   // this.$store.state.booleanConstructBeingEdited =  node;
        this.selectedNode = node.id;
        //
        //   //de-select any other properties of the active frame, if it is a relation
      }
      if ("activeField" in this.frameBeingEdited) {
        this.frameBeingEdited.activeField = null;
      }
    },
  },
};
</script>

<template>
  <div
    id="treeview"
    :class="{
      notMargined: notMargined,
    }"
  >
    <q-tree
      class="q-mt-sm"
      ref="tree-structure"
      :nodes="[booleanConstruct]"
      node-key="id"
      v-model:selected="selectedNode"
      v-model:expanded="expanded"
      selected-color="black"
      selectable="false"
      dense
      default-expand-all
    >
      <!-- header section per node -->
      <template v-slot:default-header="prop">
        <div v-if="prop.node.children.length > 0">
          <div
            class="boolean-menu row items-center mt-2 no-wrap"
            v-on:click.stop
          >
            <!-- dropdown menu with provided functions -->
            <div class="select-element">
              <q-select
                dense
                hide-selected
                filled
                use-input
                fill-input
                hint="Pick a function"
                hide-hint
                hide-bottom-space
                input-debounce="0"
                :options="options"
                style="width: 150px; margin: 5px 10px"
                v-model="prop.node.operatorToJoinChildren"
                @update:model-value="
                  (value) => {
                    selectValue(value, prop.node);
                  }
                "
                @filter="filterFn"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-italic text-grey">
                      No relevant options.
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <!-- child button. Adds additional operand to the same hierarchy level -->
            <div class="add-child">
              <q-btn
                size="sm"
                dense
                outline
                class="q-ml-sm add-child-btn"
                label="Add child"
                @click.stop="addChild(prop.node)"
              >
                <q-tooltip class="text-subtitle2">
                  Add another child at this level of the hierarchy.
                </q-tooltip>
              </q-btn>
            </div>
            <!-- subdivision button. Adds extra level of hierarchy-->
            <!--            <div>-->
            <!--              <q-btn-->
            <!--                size="sm"-->
            <!--                dense-->
            <!--                flat-->
            <!--                icon="mdi-format-list-bulleted-square"-->
            <!--                @click="subdivide($event, prop.node)"-->
            <!--              >-->
            <!--                <q-tooltip class="text-subtitle2">-->
            <!--                  <div>Add a new layer of complexity at this level.</div>-->
            <!--                </q-tooltip>-->
            <!--              </q-btn>-->
            <!--            </div>-->
          </div>
        </div>
      </template>
      <!-- main body section per node -->
      <template v-slot:default-body="prop">
        <div
          class="panel flex flex-row q-pr-md"
          :class="{
            active: prop.node.beingEdited,
            negated: prop.node.isNegated,
          }"
          @click="handleClick($event, prop.node)"
          v-if="prop.node.children.length == 0 || prop.node.frame"
        >
          <div class="col">
            <template v-if="prop.node.frame">
              <!-- boolean construct is 'atomic': it refers to a frame, and has no children -->
              <div class="row-container">
                <!-- selected chip -->
                <FrameChip :frame="prop.node.frame" />
                <!-- remove chip button -->
                <q-btn
                  round
                  size="xs"
                  flat
                  color="negative"
                  icon="mdi-close"
                  @click="removeFrame(prop.node)"
                >
                  <q-tooltip class="text-subtitle2">
                    <div>Remove this frame.</div>
                  </q-tooltip>
                </q-btn>
              </div>
            </template>
            <div
              v-if="prop.node.beingEdited && !prop.node.frame"
              class="button-label"
            >
              Select frame or create new frame from source
            </div>
          </div>
          <!--  list of buttons on the right  -->
          <div class="col-1 buttons-container">
            <div>
              <q-btn
                size="sm"
                class="button-label"
                dense
                flat
                icon="mdi-format-list-bulleted-square"
                @click="subdivide($event, prop.node)"
              >
                <q-tooltip class="text-subtitle2">
                  <div>Add a new layer of complexity at this level.</div>
                </q-tooltip>
              </q-btn>
            </div>
            <div v-if="prop.node.parent">
              <q-btn
                class="button-label"
                size="sm"
                dense
                flat
                icon="mdi-close"
                :disable="
                  origin === 'Fact' &&
                  !prop.node.parent.parent &&
                  prop.node.parent.children.length === 1
                "
                @click="deleteBooleanConstruct($event, prop.node)"
              >
                <q-tooltip class="text-subtitle2">
                  <div
                    v-if="
                      origin === 'Fact' &&
                      !prop.node.parent.parent &&
                      prop.node.parent.children.length === 1
                    "
                  >
                    Can not remove the only child in the hierarchy.
                  </div>
                  <div v-else>Remove this child.</div>
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <!--              <div v-if="prop.node.label">-->
          <!--                <span class="text-weight-bold">This node has a story</span>:-->
          <!--                {{ prop.node.label }}-->
          <!--              </div>-->
          <!--              <span v-else class="text-weight-light text-black"-->
          <!--              <span v-else class="text-weight-light text-black"-->
          <!--                >This is some default content.</span>-->
        </div>
        <!--        <div v-else class="panel">-->
        <!--          <p>additional options</p>-->
        <!--        </div>-->
      </template>
    </q-tree>
  </div>
</template>

<style scoped lang="css">
.panel {
  margin-top: 8px;
  margin-bottom: 8px;
  padding: 10px 4px;
  border-radius: 5px;
  margin-left: 2px;
  box-shadow: 0px 0px 2px #aaaaaa;
  background-color: #ffffff;
  border: solid 1px #dddddd;
  width: 270px;
}

.panel.active {
  border: solid 2px rgb(25, 118, 210);
}

.panel.negated {
  /* border: dotted 2px hsl(17, 79%, 46%); */
  background-color: rgb(255, 231, 222);
}

.button-label {
  display: inline-block;
  font-style: italic;
  margin-left: 5px;
  color: #1a1a1a !important;
}

.row-container {
  display: flex;
  flex-direction: row;
}

.notMargined {
  margin-left: -17px !important;
}

:deep(.q-tree__node-header)::before {
  padding-top: 25px;
}
#treeview {
  overflow-y: auto;
  margin-right: 10px !important;
}
.add-child-btn {
  min-width: 60px !important;
}
</style>
