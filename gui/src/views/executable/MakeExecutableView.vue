<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-btn color="primary" label="Generate eFLINT" :loading="isGenerating" @click="generateEflint" />
      <q-btn color="primary" outline label="Apply selection" :disable="!eflintBase" @click="applySelection" />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1">Frames</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-btn flat label="Select all shown" class="q-mr-sm" @click="selectAll" />
            <q-btn flat label="Select none" @click="selectNone" />

            <q-list bordered separator class="q-mt-md">
              <q-item v-for="f in framesUnion" :key="f.id" clickable @click="toggle(f.id)">
                <q-item-section avatar>
                  <q-checkbox :model-value="selectedIds.includes(f.id)" @click.stop="toggle(f.id)" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ f.shortName }}</q-item-label>
                  <q-item-label caption>
                    {{ f.typeId === 'fact' ? (f.subTypeIds[0] || f.typeId) : f.typeId }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle2 q-mb-xs">Selection lines</div>
            <q-input
              :model-value="selectionLines.join('\n')"
              type="textarea"
              autogrow
              outlined
              readonly
              input-style="font-family: ui-monospace, Menlo, Monaco, Consolas, 'Courier New', monospace;"
            />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1">eFLINT</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-caption q-mb-xs">Specification</div>
            <q-input
              v-model="eflintBase"
              type="textarea"
              autogrow
              outlined
              readonly
              input-style="font-family: ui-monospace, Menlo, Monaco, Consolas, 'Courier New', monospace;"
            />

            <div class="text-caption q-mt-md q-mb-xs">Scenario</div>
            <q-input
              v-model="eflintFinal"
              type="textarea"
              autogrow
              outlined
              readonly
              input-style="font-family: ui-monospace, Menlo, Monaco, Consolas, 'Courier New', monospace;"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { convertInterpretationToJson } from "../../helpers/importExport.js";

export default {
  name: "MakeExecutableView",

  data() {
    return {
      selectedIds: [],
      eflintBase: "",
      eflintFinal: "",
      isGenerating: false,
    };
  },

  computed: {
    allFrames() {
      return (this.$store.state.frames || [])
        .concat(this.$store.state.framesOpenInEditor || []);
    },

    framesUnion() {
      return this.allFrames.filter(
        (f) =>
          !(
            f.typeId === "fact" &&
            ["action", "duty"].includes((f.subTypeIds && f.subTypeIds[0]) || "")
          )
      );
    },

    selectedFrames() {
      return this.framesUnion.filter((f) => this.selectedIds.includes(f.id));
    },

    selectionLines() {
      return this.selectedFrames.map((f) => `+[${f.shortName}] .`);
    },
  },

  methods: {
    toggle(id) {
      if (this.selectedIds.includes(id)) {
        this.selectedIds = this.selectedIds.filter((x) => x !== id);
      } else {
        this.selectedIds = this.selectedIds.concat(id);
      }
      this.$store.commit("setExecutableFrames", this.selectedIds);
    },

    selectAll() {
      this.selectedIds = this.framesUnion.map((f) => f.id);
      this.$store.commit("setExecutableFrames", this.selectedIds);
    },

    selectNone() {
      this.selectedIds = [];
      this.$store.commit("setExecutableFrames", this.selectedIds);
    },

    applySelection() {
      const selection = this.selectionLines.join("\n");
      this.eflintFinal =
        this.eflintBase + (selection ? "\n\n" + selection + "\n" : "");
    },

    async generateEflint() {
      this.isGenerating = true;
      
      const interpretation = convertInterpretationToJson(
        this.$store.state.task,
        this.allFrames, // <-- changed
        this.$store.state.sourceDocuments || []
      );

      const resp = await fetch("/.netlify/functions/generate-eflint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interpretation }),
      });

      const { eflint } = await resp.json();

      this.eflintBase = eflint;
      this.eflintFinal = eflint;

      this.isGenerating = false;
    },
  },
};
</script>
