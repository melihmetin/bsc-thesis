import { createStore } from "vuex";
import { Fact } from "../model/fact.js";
import { Act } from "../model/act.js";
import { Claimduty } from "../model/claimduty.js";
import { saveAs } from "file-saver";
import {
  convertInterpretationToJson,
  parseJsonToInterpretation,
} from "../helpers/importExport.js";
import { json, text } from "d3-fetch";
import { SourceDocument } from "../model/sourceDocument.js";
import { v4 as uuid4 } from "uuid";
import {
  convertToRDF,
  convertRDFToJSON,
  getTasksFromTriply,
  getTaskFromTriply,
  saveTaskAtTriply,
} from "../services/ApiServices.js";
import { getSourceList, getSourceFromTriply } from "../services/ApiServices";
import { alertWidget } from "../helpers/alertWidget.js";
import { QSpinnerGears } from "quasar";
import { Task } from "../model/task.js";
// Create a new store instance.
const store = createStore({
  state() {
    return {
      step: 1, //step in the process
      frames: [], //list of frames in interpretation
      frameBeingEdited: null, //frame for which editor-pane is opened
      framesOpenInEditor: [], //list of frames in edit mode. any new frames are not saved to the frames list.
      booleanConstructBeingEdited: null, //boolean-field being edited, so we can add clicked frame to it
      sourceDocuments: [], // documents that are used in the current interpretation
      sentenceToScrollTo: null, // sentence that should be visible in source panel, because 'scroll to source' is clicked in frame editor
      displayedSourceDocument: null, //document that is currently showing in the source view
      annotationBeingEdited: null, //annotation for which source text has been selected / is being selected
      annotationToBeAddedToExistingFrame: null, //annotation selected to be added to an existing frame
      addingAnnotationToExistingFrame: false, //true if user is in the process of selecting a frame to add the annotationBeingEdited to
      selectedSnippet: null, // selected snippet in the source text
      clickedPosition: null,
      availableSources: [], //list of sources available in repo
      availableSourcesInTripleStore: [], //list of sources available in triple store
      task: null,
      sourceViewIsCollapsed: false, //whether or not the panel showing the source is collapsed
      frameFilter: {}, //for each frame type and sub types: whether or not the user selected the frame type (for filtering in network view)
      showDependenciesBetweenActs: false, //whether or not to show dependeny relations 'Before' between acts
      availableTasksInTripleStore: [], // list of tasks available at TriplyDB
      showTaskOverview: false,
      selectedNode: null, //node that is selected in the network visualization
      executableFrameIds: [], // ids of frames selected in "Make interpretations executable"
      executableSelectionDirty: false,
    };
  },
  mutations: {
    //add new frame to list of frames being edited. does not permanently store
    //the frame to the frames list yet. storing permanently is done when the save
    //button in the frame editor is clicked.
    addNewFrame(
      state,
      { frameTypeId, subTypeId, annotation, openInEditor, initialLabel },
    ) {
      let frame;
      switch (frameTypeId) {
        case "fact":
          frame = new Fact(initialLabel);
          break;
        case "act":
          frame = new Act();
          break;
        case "claim_duty":
          frame = new Claimduty();
          break;
      }
      frame.typeId = frameTypeId;
      if (subTypeId && !frame.subTypeIds.includes(subTypeId)) {
        frame.subTypeIds.push(subTypeId);
      }

      //add annotation to frame, if frame is type fact.
      //else add annotation's sentences to sourceSentences of act / claim-duty
      if (annotation) {
        if (frameTypeId == "fact") {
          annotation.frame = frame;
        } else {
          //get sentences for this annotation
          frame.sourceSentences = state.sourceDocuments
            .map(doc => doc.getSnippetsForAnnotation(annotation))
            .flat()
            .map(snippet => snippet.sentence)
            .filter((sentence, index, sentences) => sentences.findIndex(s => s.id == sentence.id) === index);
          //delete annotation (since it is not assigned to any frame)
          state.sourceDocuments.forEach((doc) => {
            doc.deleteAnnotation(annotation);
          });
        }
      }

      state.frames = [...state.frames, frame];

      if (state.booleanConstructBeingEdited) {
        state.booleanConstructBeingEdited.frame = frame;
        state.booleanConstructBeingEdited = null;
      }

      if (openInEditor) {
        this.commit("setFrameBeingEdited", frame);
      }
    },
    setFrameBeingEdited(state, frame) {
      state.frameBeingEdited = frame;
      if (!state.framesOpenInEditor.some((f) => f.id == frame.id)) {
        state.framesOpenInEditor.push(frame);
      }
    },
    removeFrameFromEditList(state, frame) {
      //remove the frame from the list of frames that are open in the editor
      const index = state.framesOpenInEditor.findIndex((f) => f.id == frame.id);
      state.framesOpenInEditor.splice(index, 1);
      //if there are any frames left open in the editor, set frameBeingEdited to
      //the last of those. else set frameBeingEdited to null.s
      state.frameBeingEdited =
        state.framesOpenInEditor.length > 0
          ? state.framesOpenInEditor[state.framesOpenInEditor.length - 1]
          : null;
    },
    createNewFrameViaNlp(state, { frameType, annotation, subType, role }) {
      let frame = new Fact();
      if (annotation) {
        annotation.frame = frame;
      }
      frame.type = frameType;
      //frame.label = frame.fact.substring(0, 20);

      subType === "Agent"
        ? frame.comments.push(`Recommended role by the NLP model: ${role}`)
        : null;

      frame.subType = frameType.subTypes.filter(
        (d) => d.id == subType.toLowerCase(),
      )[0];
      frame["id"] = uuid4();
      state.frames = [...state.frames, frame];
    },
    removeFrame(state, frame) {
      //check if frame in editing list
      const openFrameIndex = state.framesOpenInEditor.findIndex(
        (f) => f.id == frame.id,
      );
      if (openFrameIndex != -1) {
        state.framesOpenInEditor.splice(openFrameIndex, 1);
      }
      if (state.frameBeingEdited.id == frame.id) {
        const nrFramesOpen = state.framesOpenInEditor.length;
        //if frame is the one being edited, assign other frame
        //to be open in editor, if there are any other frames being edited
        state.frameBeingEdited =
          nrFramesOpen > 0 ? state.framesOpenInEditor[nrFramesOpen - 1] : null;
        state.booleanConstructBeingEdited = null;
      }
      //remove frame from frames list
      const frameIndex = state.frames.findIndex((f) => f.id == frame.id);
      if (frameIndex != -1) {
        state.frames.splice(frameIndex, 1);
      }

      //remove frame from any attribute of frames of type 'relation' and from
      //any boolean construct in a frame
      state.frames.forEach((f) => f.deleteReferencesToFrame(frame));

      //remove annotations that have this frame as their frame, in all source documents
      state.sourceDocuments.forEach((doc) =>
        doc.deleteAnnotationsForFrame(frame),
      );
    },
    deleteAnnotation(state, annotation) {
      //go through all snippets and remove annotation from them, if they contain the annotation
      state.sourceDocuments.forEach((doc) => {
        doc.deleteAnnotation(annotation);
      });
    },
    setTaskOverview(state, status) {
      state.showTaskOverview = status;
    },
    setExecutableFrames(state, ids) {
      // store as unique strings
      const unique = Array.from(new Set((ids || []).map(String)));
      state.executableFrameIds = unique;
      state.executableSelectionDirty = true;
    },

    loadExecutableFramesFromStorage(state, { storageKey }) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
          state.executableFrameIds = [];
          state.executableSelectionDirty = false;
          return;
        }
        const parsed = JSON.parse(raw);
        state.executableFrameIds = Array.isArray(parsed)
          ? Array.from(new Set(parsed.map(String)))
          : [];
        state.executableSelectionDirty = false;
      } catch {
        state.executableFrameIds = [];
        state.executableSelectionDirty = false;
      }
    },

    persistExecutableFramesToStorage(state, { storageKey }) {
      localStorage.setItem(storageKey, JSON.stringify(state.executableFrameIds));
      state.executableSelectionDirty = false;
    },
  },
  getters: {
    // union frames + framesOpenInEditor (same logic used by save/export) :contentReference[oaicite:1]{index=1}
    allFramesForCurrentInterpretation(state) {
      return state.frames
        .concat(state.framesOpenInEditor)
        .filter(
          (frame, index, array) =>
            array.findIndex((f) => f.id === frame.id) === index,
        );
    },

    executableFrames(state, getters) {
      const idSet = new Set((state.executableFrameIds || []).map(String));
      return getters.allFramesForCurrentInterpretation.filter((f) =>
        idSet.has(String(f.id)),
      );
    },
  },
  actions: {
    loadInterpretationForDebugging(context) {
      json(`./sources.json`).then((data) => {
        context.state.availableSources = data;
        text("./interpretation_DEBUG/interpretation.json").then((data) => {
          context.dispatch("loadInterpretation", data);
        });
      });
    },
    //read sources that are available on server
    //depricated as soon as these sources are available in triple store
    readAvailableSources(context) {
      json(`./sources.json`).then((data) => {
        context.state.availableSources = data;
      });
    },
    async readAvailableSourcesInTripleStore(context) {
      context.state.availableSourcesInTripleStore = await getSourceList();
      // console.log(
      //   "context.state.availableSourcesInTripleStore:",
      //   context.state.availableSourcesInTripleStore,
      // );
    },
    //reads source
    async addSource(context, sourceDescription) {
      // retrieving sourcefile
      await json(sourceDescription.fileName).then((jsonLdObject) => {
        context.dispatch("createSourceDocFromJsonLD", jsonLdObject);
      });
    },
    async addSourceFromTriply(context, sourceDescription) {
      // showing notification dialog
      const notification = alertWidget("loading", "retrieving source...");
      // getting interpretation
      const jsonLdObject = await getSourceFromTriply(sourceDescription.iri);
      await context.dispatch("createSourceDocFromJsonLD", jsonLdObject);
      // updating the notification
      if (jsonLdObject) {
        notification({
          message: "The source has been retrieved successfully!",
          color: "teal",
          icon: "mdi-check-circle-outline",
          position: "top",
          spinner: false,
          timeout: 0,
          actions: [
            {
              label: "Dismiss",
              color: "white",
            },
          ],
        });
      }
    },
    // load interpretation/task from Triply
    async addTaskFromTriply(context, taskIri) {
      // show loading indication
      const notification = alertWidget("loading", "Retrieving task...");

      const taskInTurtle = await getTaskFromTriply(taskIri);
      // convert the graph to JSONLD via the unwrap-api
      const interpretation = await convertRDFToJSON(taskInTurtle.task, false);
      // show result
      context.dispatch("loadInterpretation", interpretation);
      if (interpretation) {
        //update notification widget
        notification({
          message: "The task has been loaded successfully!",
          color: "teal",
          icon: "mdi-check-circle-outline",
          position: "top",
          spinner: false,
          timeout: 0,
          actions: [
            {
              label: "Dismiss",
              color: "white",
            },
          ],
        });
      }
    },
    async readAvailableTasksInTripleStore(context) {
      context.state.availableTasksInTripleStore = await getTasksFromTriply();
      // console.log(
      //   "availableTasksInTripleStore",
      //   context.state.availableTasksInTripleStore,
      // );
    },
    async createSourceDocFromJsonLD(context, jsonLdObject) {
      const sourceDoc = new SourceDocument(jsonLdObject);
      //todo: check if sourceDoc is already in list
      context.state.sourceDocuments = [
        ...context.state.sourceDocuments,
        sourceDoc,
      ];
      //sort alphabetically on title
      context.state.sourceDocuments.sort((d1, d2) =>
        d1.title.localeCompare(d2.title),
      );
      context.state.sourceDocuments;
    },
    createAct(context) {
      context.state.frameBeingEdited = new Act();
    },
    saveInterpretationAsJson(context) {
      //combine frames that are saved with frames open in editor
      //keep unique list of frames
      const allFrames = context.state.frames
        .concat(context.state.framesOpenInEditor)
        .filter(
          (frame, index, array) =>
            array.findIndex((f) => f.id == frame.id) === index,
        );

      console.log("allFrames:", allFrames);

      //ones and open in the editor
      const jsonString = JSON.stringify(
        convertInterpretationToJson(
          context.state.task,
          allFrames,
          context.state.sourceDocuments,
        ),
      );
      const blob = new Blob([jsonString], {
        type: "text/plain;charset=utf-8",
      });
      const dateString = new Date().toISOString().substring(0, 19);
      saveAs(blob, `${dateString}_interpretation.json`);
    },
    async saveInterpretationAsTrig(context) {
      //set loading indication
      const notification = alertWidget("loading", "saving...");

      //combine frames that are saved with frames open in editor
      //keep unique list of frames
      const allFrames = context.state.frames
        .concat(context.state.framesOpenInEditor)
        .filter(
          (frame, index, array) =>
            array.findIndex((f) => f.id == frame.id) === index,
        );

      //ones and open in the editor
      const jsonString = JSON.stringify(
        convertInterpretationToJson(
          context.state.task,
          allFrames,
          context.state.sourceDocuments,
        ),
      );
      const response = await convertToRDF(jsonString, false);
      // dismiss notification
      notification();
      response
        ? alertWidget(
          "success",
          "The task has been converted to RDF successfully! You can now save it locally.",
        )
        : alertWidget(
          "error",
          "An error occurred while saving the task to rdf!",
        );
      const blob = new Blob([response], {
        type: "application/trig;charset=utf-8",
      });
      const dateString = new Date().toISOString().substring(0, 10);
      saveAs(blob, `${dateString}_interpretation.trig`);
    },
    loadInterpretation(context, jsonText) {
      const interpretation = parseJsonToInterpretation(jsonText);
      context.state.task = interpretation.task;
      context.state.sourceDocuments = interpretation.sourceDocs;
      context.state.frames = interpretation.frames;
      //reset selection
      context.state.frameBeingEdited = null;
      context.state.framesOpenInEditor = [];
      context.state.booleanConstructBeingEdited = null;
      //show the interpretation view
      context.state.step = 3;
    },
    async loadInterpretationFromRDF(context, rdfText) {
      //set loading indication
      const notification = alertWidget("loading", "loading task...");
      const jsonString = await convertRDFToJSON(rdfText, false);
      context.dispatch("loadInterpretation", jsonString);
      //dismiss notification
      notification();
      jsonString
        ? alertWidget("success", "The task has been loaded successfully!")
        : alertWidget(
          "error",
          "An error occurred while loading the interpretation to rdf!",
        );
    },
    async saveInterpretationTriply(context) {
      // show loading indication
      const notification = alertWidget("loading", "processing...");

      // first convert the interpretation to triples
      //combine frames that are saved with frames open in editor
      //keep unique list of frames
      const allFrames = context.state.frames
        .concat(context.state.framesOpenInEditor)
        .filter(
          (frame, index, array) =>
            array.findIndex((f) => f.id == frame.id) === index,
        );
      console.log("allFrames: ", allFrames);
      const intInJson = convertInterpretationToJson(
        context.state.task,
        allFrames,
        context.state.sourceDocuments,
      );
      console.log("intInJson:", intInJson.id, intInJson.interpretation);
      const nTask = new Task();
      console.log("nTask:", nTask.id, nTask.interpretation);
      intInJson.id = nTask.id;
      intInJson.interpretation = nTask.interpretation;
      console.log("new intInJson:", intInJson.id, intInJson.interpretation);

      //ones and open in the editor
      const jsonString = JSON.stringify(intInJson);

      // console.log("jsonString:", jsonString);
      const taskInRDF = await convertToRDF(jsonString, false);
      console.log("taskInRDF:", taskInRDF);

      //execute remote function ...
      const resp = await saveTaskAtTriply(taskInRDF);
      if (resp.status === 200) {
        //update notification widget
        notification();
        // retrieve the updated list of tasks
        context.dispatch("readAvailableTasksInTripleStore");
      } else {
        //dismiss notification
        notification();
      }
    },
    loadExecutableSelection(context, { storageKey = "rule-editor.executableFrames.v1" } = {}) {
      context.commit("loadExecutableFramesFromStorage", { storageKey });
    },
    persistExecutableSelection(context, { storageKey = "rule-editor.executableFrames.v1" } = {}) {
      context.commit("persistExecutableFramesToStorage", { storageKey });
    },
  },
});

export { store };
