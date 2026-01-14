<!-- panel that pops up when user is adding an annotation to an existing frame -->
<template>
    <div id="adding-annotation-panel" ref="addingAnnotationPanel" v-if="addingAnnotationToExistingFrame" :style="{
       left: coordX + 50 + 'px',
      top: coordY - 150 + 'px',
    }">
        <q-card bordered>
            <q-card-section>
                <div class="message">Click frame to add annotation</div>
            </q-card-section>
            <q-card-actions>
                <q-btn flat @click="cancelAdding">Cancel</q-btn>
            </q-card-actions>
        </q-card>
    </div>
</template>

<script>
export default {
  data: () => ({
      coordX: 0,
      coordY: 0,
    }),
  // update component lifecycle hook
  updated() {
    if (this.annotation) {
      this.coordY = this.determineCoordY(
          this.$refs.addingAnnotationPanel.clientHeight
      );
      this.coordX = this.determineCoordX();

    }
  },
    computed: {
        addingAnnotationToExistingFrame() {
            return this.$store.state.addingAnnotationToExistingFrame
        },
        annotation(){
          return this.$store.state.annotationToBeAddedToExistingFrame
        },
        clickedPosition() {
            return this.$store.state.clickedPosition
        },
    },
    methods: {
        cancelAdding() {
            this.$store.state.addingAnnotationToExistingFrame = false
            this.$store.state.annotationToBeAddedToExistingFrame = null
        },
        determineCoordX() {
          return window.innerWidth - this.clickedPosition[0] > 240
              ? this.clickedPosition[0]
              : this.clickedPosition[0] - 240;
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
#adding-annotation-panel {
    position: absolute;
    width: 240px;
}
</style>