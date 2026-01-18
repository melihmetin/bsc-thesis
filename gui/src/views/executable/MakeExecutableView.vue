<template>
  <div class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-btn
        color="primary"
        label="Generate eFLINT"
        :loading="isGenerating"
        @click="generateEflint"
      />
      <q-btn
        color="primary"
        outline
        label="Apply selection"
        :disable="!eflintBase"
        @click="applySelection"
      />
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
              <q-item v-for="f in framesUnion" :key="f.id">
                <q-item-section avatar>
                  <q-checkbox
                    :model-value="selectedIds.includes(f.id)"
                    @click.stop="toggle(f.id)"
                  />
                </q-item-section>

                <q-item-section class="cursor-pointer" @click="toggle(f.id)">
                  <q-item-label>{{ f.shortName }}</q-item-label>
                  <q-item-label caption>
                    {{ f.typeId === 'fact' ? (f.subTypeIds?.[0] || f.typeId) : f.typeId }}
                  </q-item-label>

                  <div v-if="isAgentFact(f) && selectedIds.includes(f.id)" @click.stop>
                    <q-input
                      dense
                      outlined
                      placeholder="instance name"
                      v-model="agentInstanceNames[f.id]"
                      class="q-mt-xs"
                    />
                  </div>
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
              input-style="font-family: monospace;"
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
              input-style="font-family: monospace;"
            />

            <div class="text-caption q-mt-md q-mb-xs">Scenario</div>
            <q-input
              v-model="eflintFinal"
              type="textarea"
              autogrow
              outlined
              readonly
              input-style="font-family: monospace;"
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
      isGenerating: false,
    };
  },

  computed: {
    selectedIds: {
      get() {
        return this.$store.state.executableSelectedIds || [];
      },
      set(v) {
        this.$store.state.executableSelectedIds = v;
      },
    },

    agentInstanceNames: {
      get() {
        return this.$store.state.executableAgentInstanceNames || {};
      },
      set(v) {
        this.$store.state.executableAgentInstanceNames = v;
      },
    },

    eflintBase: {
      get() {
        return this.$store.state.executableEflintBase || "";
      },
      set(v) {
        this.$store.state.executableEflintBase = v;
      },
    },

    eflintFinal: {
      get() {
        return this.$store.state.executableEflintFinal || "";
      },
      set(v) {
        this.$store.state.executableEflintFinal = v;
      },
    },

    allFrames() {
      return (this.$store.state.frames || [])
        .concat(this.$store.state.framesOpenInEditor || []);
    },

    framesUnion() {
      return this.allFrames.filter(
        (f) =>
          !(f.typeId === "fact" && ["action", "duty"].includes(f.subTypeIds?.[0]))
      );
    },

    selectedFrames() {
      return this.framesUnion.filter((f) => this.selectedIds.includes(f.id));
    },

    selectionLines() {
      return this.selectedFrames.map((f) =>
        this.isAgentFact(f)
          ? `+[${f.shortName}]("${this.escape(this.agentInstanceNames[f.id] || "")}") .`
          : `+[${f.shortName}] .`
      );
    },
  },

  methods: {
    isAgentFact(f) {
      return f.typeId === "fact" && f.subTypeIds?.[0] === "agent";
    },

    escape(s) {
      return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    },

    toggle(id) {
      if (this.selectedIds.includes(id)) {
        this.selectedIds = this.selectedIds.filter((x) => x !== id);
      } else {
        this.selectedIds = [...this.selectedIds, id];
        if (this.agentInstanceNames[id] === undefined) {
          this.agentInstanceNames = { ...this.agentInstanceNames, [id]: "" };
        }
      }
    },

    selectAll() {
      this.selectedIds = this.framesUnion.map((f) => f.id);
      const names = { ...this.agentInstanceNames };
      this.framesUnion.forEach((f) => {
        if (this.isAgentFact(f) && names[f.id] === undefined) {
          names[f.id] = "";
        }
      });
      this.agentInstanceNames = names;
    },

    selectNone() {
      this.selectedIds = [];
    },

    applySelection() {
      this.eflintFinal =
        this.eflintBase + "\n\n" + this.selectionLines.join("\n") + "\n";
    },

    async generateEflint() {
      this.isGenerating = true;

      const interpretation = convertInterpretationToJson(
        this.$store.state.task,
        this.allFrames,
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
