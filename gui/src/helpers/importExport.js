import { Task } from "../model/task.js";
import { SourceDocument } from "../model/sourceDocument.js";
import { Fact } from "../model/fact.js";
import { Act } from "../model/act.js";
import { Claimduty } from "../model/claimduty.js";
import { Annotation } from "../model/annotation.js";
import { Snippet } from "../model/snippet.js";
import { Comment } from "../model/comment.js";
import { setVerticalPositionOfAnnotationLines } from "./underlining.js";

function convertInterpretationToJson(task, frames, sourceDocuments) {
    const sourceDocsString = sourceDocuments.map(doc => ({
        jsonLd: doc.jsonLd,
        selectedSentencesIds: doc.sentences.filter(s => s.selected).map(s => s.id),
        collapsedSentencesIds: doc.sentences.filter(s => s.collapsed).map(s => s.id)
    }))
    const framesFlat = frames.map((f) => f.toFlatObject())
    //add annotations per frame
    framesFlat.forEach(frame => {
        let annotations = []
        sourceDocuments.forEach(doc => {
            const annotationsForFrame = doc.getAnnotationsForFrame(frame)
            annotationsForFrame.forEach(a => {
                annotations.push({
                    "snippets": doc.getSnippetsForAnnotation(a)
                        .map(s => s.toFlatObject())
                })
            })
        })
        frame.annotations = annotations
    })
    return {
        id: task.id,
        type: task.type,
        description: task.description,
        label: task.label,
        hasEditor: task.editor,
        sourceDocs: sourceDocsString,
        interpretation: task.interpretation, //iri of interpretation
        frames: framesFlat
    }
}

//parse json to sourcedoc and frames
function parseJsonToInterpretation(jsonText) {
    const parsedInterpretation = JSON.parse(jsonText)
    let task = new Task()
    task.id = parsedInterpretation.id
    task.label = parsedInterpretation.label
    task.description = parsedInterpretation.description
    task.editor = parsedInterpretation.hasEditor
    //for backward compatibility
    if ("interpretation" in parsedInterpretation) {
        task.interpretation = parsedInterpretation.interpretation //iri
    }

    let sourceDocs = [];
    let frames = [];

    //read sourceDocs from loaded interpretation
    parsedInterpretation.sourceDocs.forEach(doc => {
        const sourceDoc = new SourceDocument(doc.jsonLd)
        //set collapse status
        sourceDoc.sentences.forEach(sentence => {
            sentence.selected = doc.selectedSentencesIds.includes(sentence.id)
            sentence.collapsed = doc.collapsedSentencesIds.includes(sentence.id)
        })
        sourceDocs.push(sourceDoc)
    })

  // create an empty frame for each frame in the loaded json
  // each frame gets its id from the json data
  parsedInterpretation.frames.forEach((d) => {
    let frame;
    //create empty frame of correct type
    switch (d.typeId) {
      case "fact":
        frame = new Fact();
        // adds an extra layer of hierarchy for correct rendering of the subdivision
        // in the fact form
        frame.addSubdivision();
        break;
      case "act":
        frame = new Act();
        break;
      case "claim_duty":
        frame = new Claimduty();
        break;
    }
    frame.id = d.id; //overwrite generated id
    frames.push(frame);
  });

    // Go to the loaded json once more, and fill each frame with data
    // while replacing references by ID with references to frame objects
    parsedInterpretation.frames.forEach(parsedFrame => {
        let frame = frames.find(f => f.id === parsedFrame.id)
        frame.fromFlatObject(parsedFrame, frames)

        // Go through the annotations of each frame. Create annotations objects.
        // Go through the snippets of each parsed annotation, and add snippets to the
        // correct sentence in the correct document. Add the annotation to the snippet
        // the annotation object links a frame with a snippet.

        parsedFrame.annotations.forEach(parsedAnnotation => {
            const annotation = new Annotation()
            annotation.frame = frame
            //create snippet for each of the annotation's snippets
            parsedAnnotation.snippets.forEach(parsedSnippet => {
                //ignore snippets of length 0
                if (parsedSnippet.characterRange[1] > parsedSnippet.characterRange[0]) {
                    //find sourceDoc for this snippet
                    const sourceDoc = sourceDocs.find(doc => doc.id == parsedSnippet.documentId)

                    //find sentence for this snippet
                    const sentence = sourceDoc.sentences.find(s => s.id == parsedSnippet.sentenceId)

                    // acts and claim duties do not have annotations, however in older interpretations,
                    // they still may have. In that case, do not add the annotation to a snippet,
                    // but store the sentence in sourceSentences


                    if (parsedFrame.typeId == "fact") {
                        //snippet possibly exists, added by another annotation
                        let snippet = sentence.snippets.find(s => s.characterRange[0] == parsedSnippet.characterRange[0] && s.characterRange[1] == parsedSnippet.characterRange[1])
                        if (!snippet) {
                            snippet = new Snippet(sentence, parsedSnippet.characterRange)
                            //this new snippet overlaps the original snippet that contains the whole sentence,
                            //created when the sentence was created
                            const overlappedSnippetIndex = sentence.snippets.findIndex(s =>
                                snippet.characterRange[0] < s.characterRange[1] &&
                                snippet.characterRange[1] > s.characterRange[0]
                            )
                            const overlappedSnippet = sentence.snippets[overlappedSnippetIndex]
                            //create new snippets, replacing the overlapped snippet
                            if (overlappedSnippet.characterRange[0] < snippet.characterRange[0]) {
                                //create snippet left of new snippet
                                sentence.snippets.push(new Snippet(sentence, [overlappedSnippet.characterRange[0], snippet.characterRange[0]]))
                            }
                            if (overlappedSnippet.characterRange[1] > snippet.characterRange[1]) {
                                //create snippet left of new snippet
                                sentence.snippets.push(new Snippet(sentence, [snippet.characterRange[1], overlappedSnippet.characterRange[1]]))
                            }
                            //remove original overlapped snippet
                            sentence.snippets.splice(overlappedSnippetIndex, 1)
                            //add new snippet
                            sentence.snippets.push(snippet)
                            //sort snippets according to character range start
                            sentence.snippets.sort((s1, s2) => s1.characterRange[0] - s2.characterRange[0])
                        }
                        snippet.annotations.push(annotation)
                    } else {
                        // frame is act or claimDuty (so this is an older interpretation), add sentence to sourceSentences
                        // if it is not there already
                        if (!frame.sourceSentences.some(s => s.id == sentence.id)) {
                            frame.sourceSentences.push(sentence)
                        }
                    }
                }
            })
        })

        // Add comments to the frame <- should we move this to fromFlatObject in the frame model
        frame.comments = parsedFrame.comments.map(parsedComment => {
            let comment = new Comment()
            comment.fromFlatObject(parsedComment)
            return comment
        })

        // Add sourceSentences to acts and claim duties
        // Find the corresponding sentence object for each entry (containing )
        if (parsedFrame.typeId == 'act' || parsedFrame.typeId == 'claim_duty') {
            //older versions have no 'sourceSentences', in that case we derived
            //the sourceSentences from the annotations (see above)
            if ("sourceSentences" in parsedFrame) {
                frame.sourceSentences = parsedFrame.sourceSentences.map(s => {
                    const sourceDoc = sourceDocs.find(doc => doc.id == s.documentId)
                    const sentence = sourceDoc.sentences.find(sentence => sentence.id == s.sentenceId)
                    return sentence
                })
            }
        }
    })

    console.log("frames loaded")

  //update underlining of annotations in the source text. each annotation contains the
  //vertical position of the underline
  sourceDocs.forEach((sourceDoc) => {
    setVerticalPositionOfAnnotationLines(sourceDoc);
  });

  return {
    task: task,
    sourceDocs: sourceDocs,
    frames: frames,
  };
}


export {
    convertInterpretationToJson,
    parseJsonToInterpretation
}