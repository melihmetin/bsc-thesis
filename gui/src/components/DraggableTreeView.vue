<script>
import FrameChip from "./FrameChip.vue";
import { BooleanConstruct } from "../model/booleanConstruct.js";

export default {
  name: "DraggableTreeView",
  components: { FrameChip },
  props: {
    booleanConstruct: Object,
    origin: {
      type: String,
      default: "Fact",
    },
  },
  data: () => ({
    // // Create Fact instances
    // const fact2 = new Fact("fact2");
    // const fact3 = new Fact("fact3");
    // const fact5 = new Fact("fact5");
    // const fact6 = new Fact("fact6");
    // const fact7 = new Fact("fact7");
    //
    // // Optionally, add subdivisions or children to facts here
    // // For example, fact2.addSubdivision();
    //
    // // Build the subdivision tree using BooleanConstructs and Facts
    // // Each BooleanConstruct can have children BooleanConstructs or a frame (Fact)
    //
    // // Helper function to create a BooleanConstruct node with a frame
    // function createNodeWithFact(fact) {
    //   const bc = new BooleanConstruct();
    //   bc.frame = fact;
    //   return bc;
    // }
    //
    // // Example structure:
    // // parent1 (BooleanConstruct)
    // //  ├─ parent2 (BooleanConstruct)
    // //  │    ├─ subdivision-parent2-1 (BooleanConstruct with fact2)
    // //  │    └─ subdivision-parent2-2 (BooleanConstruct with fact3)
    // //  ├─ parent3 (BooleanConstruct with children fact5 and fact6)
    // //  └─ parent4 (BooleanConstruct with fact7)
    //
    // // Create BooleanConstruct nodes for parents
    // const parent1 = new BooleanConstruct();
    // parent1.operatorToJoinChildren = "and";
    //
    // const parent2 = new BooleanConstruct();
    // parent2.operatorToJoinChildren = "and";
    //
    // const parent3 = new BooleanConstruct();
    // parent3.operatorToJoinChildren = "and";
    //
    // const parent4 = createNodeWithFact(fact7);
    //
    // // Create subdivision-parent2-1 and subdivision-parent2-2 nodes
    // const subdivisionParent2_1 = createNodeWithFact(fact2);
    // const subdivisionParent2_2 = new BooleanConstruct();
    //
    // // Build parent2 children
    // parent2.addChild(subdivisionParent2_1);
    // parent2.addChild(subdivisionParent2_2);
    //
    // // Create children for parent3
    // const subdivisionParent3_1 = createNodeWithFact(fact5);
    // const subdivisionParent3_2 = createNodeWithFact(fact6);
    //
    // parent3.addChild(subdivisionParent3_1);
    // parent3.addChild(subdivisionParent3_2);
    //
    // // Build parent1 children
    // parent1.addChild(parent2);
    // parent1.addChild(parent3);
    // parent1.addChild(parent4);
    //
    // // Set parents properly (already done in addChild)
    toResult: null,
    draggingId: null,
    dragOverId: null,
    // toggleOptions: [
    //   { label: "Swap order", value: "swapping" },
    //   { label: "Move child", value: "nesting" },
    // ],
    // mode: "nesting",
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
    parentNode() {
      return this.booleanConstruct;
    },
  },
  watch: {
    toResult(val) {
      this.$nextTick(() => {
        const treeRef = this.$refs["tree-structure-draggable"];
        if (!treeRef || typeof treeRef.setExpanded !== "function") {
          console.warn(
            "Tree structure ref or setExpanded() not ready",
            treeRef,
          );
          return;
        }
        if (!val) {
          console.warn("Invalid value for node id", val);
          return;
        }
        console.log("new toResult:", val.id);

        treeRef.setExpanded(val.id, true);
      });
    },
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
        const treeRef = this.$refs["tree-structure-draggable"];
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
  methods: {
    getNodeByKey(key) {
      return this.$refs["tree-structure-draggable"].getNodeByKey(key);
    },
    getNodeParent(elem) {
      let parent = null;
      while (elem.parentNode && !parent) {
        elem = elem.parentNode;
        if (elem.classList.contains("q-tree__node")) parent = elem;
      }
      return parent;
    },
    getNodeByLabel(node, label, currentIndex, parentNode) {
      let array;
      let parent;
      if (!Array.isArray(node)) {
        parent = node;
        if (node.id === label)
          return { node: node, index: currentIndex, parent: parentNode };
        array = node.children;
      } else {
        array = node;
      }
      if (array) {
        let i;
        let result = null;
        for (i = 0; result == null && i < array.length; i++) {
          result = this.getNodeByLabel(array[i], label, i, parent);
        }
        return result;
      }
      return null;
    },
    moveNode(from, to) {
      console.log("moving nodes!");
      if (from === to) return;

      console.log("from id:", from);
      console.log("to id:", to);

      const fromResult = this.getNodeByLabel(this.booleanConstruct, from, -1);
      const toResult =
        to === "root"
          ? null
          : this.getNodeByLabel(this.booleanConstruct, to, -1);

      if (fromResult) {
        console.log("fromResult:", fromResult.node);

        // Return if trying to move a parent node into its own descendants
        if (
          toResult &&
          this.getNodeByLabel(fromResult.node, toResult.node.id, -1)
        ) {
          console.log(
            "trying to move a parent node into a child of the same parent!",
          );
          return;
        }

        // Remove the source node from its current parent's children array or from the root subdivision array
        if (fromResult.parent && fromResult.parent.children) {
          console.log("fromResult.parent && fromResult.parent.children");
          fromResult.parent.children.splice(fromResult.index, 1);
        } else {
          this.booleanConstruct.splice(fromResult.index, 1);
        }

        // insert the source node as a child of the target node
        if (toResult && toResult.node) {
          //TODO: fix case where user drags to root node. It should be added to the top and not create any subdivision.

          console.log("toResult: ", toResult.node);
          // If the target node already has a children array, the source node is inserted at the beginning.
          if (toResult.node.children.length > 0 && toResult.node.frame) {
            console.log("it has children", toResult.node.children);
            console.log("fromResult:", fromResult);
            toResult.node.children.splice(0, 0, fromResult.node);
            console.log("if-after", toResult.node.children);
          }
          // If not, the targeted node is subdivided and the dragged node is added as a child.
          else {
            console.log("create a new subdivision:");
            // fromResult.node.subdivide()
            toResult.node.subdivide();
            toResult.node.children.push(fromResult.node);
          }
          // console.log("toResult.node:", toResult.node);
          // Update toResult to the target node to reflect the change
          this.toResult = toResult.node;
          // this.$refs.tree.setExpanded(toResult.node.id, true);
          // If the target is "root", the source node is appended to the top-level subdivision array.
        } else if (to === "root") {
          this.booleanConstruct.splice(
            this.booleanConstruct.length,
            0,
            fromResult.node,
          );
        }
      }
    },
    swapNodes(fromKey, toKey) {
      console.log("swapping nodes!");
      if (fromKey === toKey) return;

      const fromResult = this.getNodeByLabel(
        this.booleanConstruct,
        fromKey,
        -1,
      );
      const toResult = this.getNodeByLabel(this.booleanConstruct, toKey, -1);

      if (!fromResult || !toResult) return;

      const fromParent = fromResult.parent;
      const toParent = toResult.parent;

      // Helper to find index in parent's children or subdivision root
      const findIndex = (parent, node) => {
        if (!parent) return this.booleanConstruct.indexOf(node);
        return parent.children.indexOf(node);
      };

      const fromIndex = findIndex(fromParent, fromResult.node);
      const toIndex = findIndex(toParent, toResult.node);

      if (fromParent === toParent) {
        // Same parent: swap positions in children array
        if (fromParent) {
          const children = fromParent.children;
          children.splice(fromIndex, 1, toResult.node);
          children.splice(toIndex, 1, fromResult.node);
        } else {
          // Top-level subdivision array
          this.booleanConstruct.splice(fromIndex, 1, toResult.node);
          this.booleanConstruct.splice(toIndex, 1, fromResult.node);
        }
      } else {
        // Different parents: remove nodes from their parents and insert into the other's children
        if (fromParent) fromParent.children.splice(fromIndex, 1);
        else this.booleanConstruct.splice(fromIndex, 1);

        if (toParent) toParent.children.splice(toIndex, 1);
        else this.booleanConstruct.splice(toIndex, 1);

        if (fromParent) {
          fromParent.children.splice(fromIndex, 0, toResult.node);
        } else {
          this.booleanConstruct.splice(fromIndex, 0, toResult.node);
        }

        if (toParent) {
          toParent.children.splice(toIndex, 0, fromResult.node);
        } else {
          this.booleanConstruct.splice(toIndex, 0, fromResult.node);
        }
      }
    },
    dragStart(event, key) {
      console.log("drag started...");
      console.log("drag key:", key);
      this.draggingId = key;
      if (event.target) {
        const target = event.target;
        const parent = this.getNodeParent(target);
        if (parent) parent.classList.add("dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("node-id", key);
        // Use entire row as drag image
        const row = event.target.closest(".my-row");
        if (row) {
          event.dataTransfer.setDragImage(
            row,
            row.offsetWidth / 2,
            row.offsetHeight / 2,
          );
        }
      }
      if (event.dataTransfer && event.target)
        event.dataTransfer.setData("node", key);
    },
    dragStop(event) {
      console.log("drag stop...");
      if (event.target) {
        const target = event.target;
        const parent = this.getNodeParent(target);
        if (parent) parent.classList.remove("dragging");
        this.draggingId = null;
        this.dragOverId = null;
      }
    },
    drop(event, key) {
      event.preventDefault();
      console.log("drop key:", key);
      const target = event.target;
      let nodeKey = "";
      if (event.dataTransfer) nodeKey = event.dataTransfer.getData("node");
      if (target) target.classList.remove("container");
      if (nodeKey) {
        console.log("nodeKey:", nodeKey);

        // this.$refs.tree.setExpanded(this.toResult.node.id, true);
        // console.log(`Move ${nodeKey} to ${key}`);
        // console.log("toResult:", this.toResult);
        // const nodeInfo = this.getNodeByKey(this.toResult.id);
        // nodeInfo.frame = null;
        // console.log("nodeInfo:", nodeInfo);

        // if (this.mode === "swapping") {
        // Swap nodes
        this.swapNodes(nodeKey, key);
        // console.log(`Swapped nodes ${nodeKey} and ${key}`);
        // } else {
        //   move nodes as child
        // this.moveNode(nodeKey, key);
        // console.log(`Moved node ${nodeKey} to ${key}`);
        // }

        this.draggingId = null;
        this.dragOverId = null;
      }
    },
    // drop(event, key) {
    //   event.preventDefault();
    //   console.log("drop key:", key);
    //   const target = event.target;
    //   let nodeKey = "";
    //   if (event.dataTransfer) nodeKey = event.dataTransfer.getData("node");
    //   if (target) target.classList.remove("container");
    //   if (nodeKey) {
    //     console.log("nodeKey:", nodeKey);
    //     this.moveNode(nodeKey, key);
    //
    //     // this.$refs.tree.setExpanded(this.toResult.node.id, true);
    //     console.log(`Move ${nodeKey} to ${key}`);
    //     console.log("toResult:", this.toResult);
    //     const nodeInfo = this.getNodeByKey(this.toResult.id);
    //     nodeInfo.frame = null;
    //     console.log("nodeInfo:", nodeInfo);
    //
    //     if (this.mode === "one") {
    //       // Swap nodes if Shift key is pressed
    //       this.swapNodes(nodeKey, key);
    //       console.log(`Swapped nodes ${nodeKey} and ${key}`);
    //     } else {
    //       // Default behavior: move node as child
    //       this.moveNode(nodeKey, key);
    //       console.log(`Moved node ${nodeKey} to ${key}`);
    //     }
    //
    //     this.draggingId = null;
    //     this.dragOverId = null;
    //   }
    // },
    dragOver(event, id) {
      console.log("dragging...");
      event.preventDefault();
      const target = event.target;
      if (target) target.classList.add("container");
      if (id !== this.dragOverId) this.dragOverId = id;
    },
    dragLeave(event, id) {
      console.log("drag event is over!");
      event.preventDefault();
      const target = event.target;
      if (target) target.classList.remove("container");
      if (this.dragOverId === id) this.dragOverId = null;
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
    subdivide(event, nodeData) {
      console.log("nodeData to subdivide:", nodeData);
      event.stopPropagation();
      nodeData.subdivide();
      console.log("after subdivision: ", nodeData);

      // set the top level of the construct to be expanded
      // this.$refs["tree-structure-draggable"].setExpanded(this.parentNodeId, true);
      // // set the current node to expanded
      // this.$refs["tree-structure-draggable"].setExpanded(nodeData.id, true);
      // // determine margin of parent
      // !nodeData.parent && nodeData.children.length > 0
      //   ? (this.notMargined = false)
      //   : null;
    },
    removeFrame(node) {
      node.beingEdited = false;
      node.frame = null;
      // node.removeFrame(node.frame)
    },
    // removing extra level of hierarchy from a node
    deleteBooleanConstruct(event, nodeData) {
      event.stopPropagation();
      console.log("deleting booleanConstruct");
      nodeData.beingEdited = false;
      //if bc has no parent, do not delete, since that would leave precondition empty
      //instead: clean
      if (nodeData.parent) {
        console.log("nodeData.parent:", nodeData.parent);
        nodeData.delete();
      } else {
        console.log("no parent: ", nodeData.parent);
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
      console.log(
        "handle clicked: node",
        node,
        node.beingEdited,
        this.selectedNode,
      );

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
    parentNodeId(value) {
      this.$nextTick(() => {
        const treeRef = this.$refs["tree-structure-draggable"];
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
    console.log("mounting Draggale:", this.booleanConstruct, this.parentNode);
    this.options = Array.from(this.booleanOptions);
    // it expands the parent node of the hierarchy
    this.$refs["tree-structure-draggable"].setExpanded(this.parentNodeId, true);
    // this.$refs["tree-structure-draggable"].setExpanded(this.parentNodeId, true);
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
    <!--    BooleanConstruct {{ booleanConstruct }}<br />-->
    <!--    NodeBeingEdited: {{ parentNode }}-->
    <div class="q-pa-md q-gutter-sm">
      <!--      <div class="flex flex-start items-baseline">-->
      <!--        <div id="label">Mode:</div>-->
      <!--        <div id="ui-element" class="q-ml-sm">-->
      <!--          <q-btn-toggle-->
      <!--            v-model="mode"-->
      <!--            :options="toggleOptions"-->
      <!--            name="mode-selector"-->
      <!--            size="sm"-->
      <!--            rounded-->
      <!--          ></q-btn-toggle>-->
      <!--        </div>-->
      <!--      </div>-->

      <q-tree
        class="q-mt-sm tree-structure-draggable"
        ref="tree-structure-draggable"
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
          <!--          <span-->
          <!--            v-if="dragOverId === prop.node.id && mode == 'nesting'"-->
          <!--            class="plus-icon"-->
          <!--          >-->
          <!--            <q-icon name="mdi-plus-circle-outline" color="primary" size="sm" />-->
          <!--          </span>-->
          <span v-if="dragOverId === prop.node.id" class="plus-icon">
            <q-icon
              name="mdi-swap-vertical-circle-outline"
              color="primary"
              size="sm"
            />
          </span>
          <div
            v-if="prop.node.children.length > 0"
            class="boolean-menu row items-center my-row tree-structure-draggable-item mt-2 no-wrap"
            :class="{
              'drag-over': dragOverId === prop.node.id,
              dragging: draggingId === prop.node.id,
            }"
            :data-node-id="prop.node.id"
            @dragleave="dragLeave($event, prop.node.id)"
            @drop="drop($event, prop.key)"
            @dragover="dragOver($event, prop.node.id)"
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

            <div v-if="parentNodeId !== prop.node.id">
              <q-icon
                name="mdi-drag"
                draggable="true"
                @mousedown.stop
                @dragstart="dragStart($event, prop.key)"
                @dragend="dragStop"
                class="cursor-pointer drag-handle"
                style="cursor: grab"
              ></q-icon>
            </div>
          </div>
        </template>
        <!-- main body section per node -->
        <template v-slot:default-body="prop">
          <div
            class="panel flex flex-row q-pr-md my-row"
            :class="{
              active: prop.node.beingEdited,
              negated: prop.node.isNegated,
              'drag-over': dragOverId === prop.node.id,
              dragging: draggingId === prop.node.id,
            }"
            @dragleave="dragLeave($event, prop.node.id)"
            @drop="drop($event, prop.key)"
            @dragover="dragOver($event, prop.node.id)"
            @click="handleClick($event, prop.node)"
            v-if="prop.node.children.length === 0 || prop.node.frame"
          >
            <div class="col">
              <template v-if="prop.node.frame">
                <!-- boolean construct is 'atomic': it refers to a frame, and has no children -->
                <div class="row-container">
                  <!-- selected chip -->
                  <FrameChip :frame="prop.node.frame" :disable="false" />

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
              <div>
                <q-icon
                  name="mdi-drag"
                  draggable="true"
                  @mousedown.stop
                  @dragstart="dragStart($event, prop.key)"
                  @dragend="dragStop"
                  class="cursor-pointer drag-handle"
                  style="cursor: grab"
                ></q-icon>
              </div>
            </div>
          </div>
        </template>
      </q-tree>
    </div>
  </div>
</template>

<style scoped>
[draggable="true"] {
  /* To prevent user selecting inside the drag source */
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}

.tree-structure-draggable .q-tree__node-header {
  padding: 0;
}

.tree-structure-draggable .q-tree__node--child > .q-tree__node-header:focus {
  box-shadow: none;
}

.tree-structure-draggable .q-tree__node.dragging {
  background: rgba(51, 63, 82, 0.1); /* #333f52 in RGBA */
  border-radius: 4px;
}

.tree-structure-draggable
  .q-tree__node.dragging
  .q-hoverable:hover
  > .q-focus-helper {
  background: none;
  opacity: 0;
}

.tree-structure-draggable-item {
  border-radius: 4px;
  padding: 8px;
}

.my-row {
  background: #fff;
  border-radius: 4px;
  transition: background 0.15s;
  user-select: none;
  min-height: 36px;
}

.drag-handle {
  font-size: 1.8em;
  opacity: 1;
  margin-left: 3px;
  color: #1a1a1a;
}

.drag-over {
  background: #e0f7fa !important;
}

.dragging {
  opacity: 0.4;
  background: rgba(51, 63, 82, 0.1); /* #333f52 in RGBA */
  border-radius: 4px;
}
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
