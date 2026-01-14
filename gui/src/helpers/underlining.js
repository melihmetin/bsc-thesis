//functions that return style for underlining pieces of text (snippets and sentences)
import { hexColors, hexColorsLight } from "./config.js";
import { max } from "d3-array"
const lineThickness = 3
const charHeight = 14
const spaceBetweenCharsAndLines = 1
const firstLineStartPosition = charHeight + spaceBetweenCharsAndLines
const white = "#ffffff"
const grey = "#666666"

export function getStyleForUnderlining(snippet, activeFrame) {
    //check if snippet has annotation with a frame that is currently being edited (activeFrame),
    //if so, highlight the snippet
    const highlight = activeFrame && snippet.annotations.some(annotation => annotation.frame?.id == activeFrame.id)

    let backgroundStyle = "linear-gradient(180deg"

    if (highlight) {
        const highlightColor = activeFrame.typeId != "fact" || activeFrame.subTypeIds.length == 0
            ? hexColorsLight[activeFrame.typeId]
            : activeFrame.subTypeIds.length > 1
                ? hexColorsLight.multiple
                : hexColorsLight[activeFrame.subTypeIds[0]]
        backgroundStyle +=
            `, ${highlightColor} 0px`
            + `, ${highlightColor} ${charHeight}px`
            + `, ${white} ${charHeight}px`
    } else {
        backgroundStyle += `, ${white} 0px`
            + `, ${white} ${charHeight}px`
    }

    //sort annotations for this snippet according to vertical position.
    //loop through all annotations for this snippet and build the backgroundStyle.
    //keep track of the lowest position of any line, to calculate the backgroundSize
    let backgroundSize = charHeight
    let annotations = snippet.annotations
    annotations.sort((a1, a2) => a1.verticalPosition - a2.verticalPosition)
    annotations.forEach((annotation) => {
        let lineColor
        if (annotation.frame) {
            lineColor = annotation.frame.typeId != "fact" || annotation.frame.subTypeIds.length == 0
                ? hexColors[annotation.frame.typeId]
                : annotation.frame.subTypeIds.length > 1
                    ? hexColors.multiple
                    : hexColors[annotation.frame.subTypeIds[0]]
        } else {
            lineColor = grey
        }
        const lineStartYPos = firstLineStartPosition + annotation.verticalPosition * 2 * lineThickness
        const lineEndYpos = lineStartYPos + lineThickness
        backgroundStyle +=
            `, ${white} ${lineStartYPos}px`
            + `, ${lineColor} ${lineStartYPos}px`
            + `, ${lineColor} ${lineEndYpos}px`
            + `, ${white} ${lineEndYpos}px`
        backgroundSize = Math.max(backgroundSize, lineEndYpos)
    })
    backgroundStyle += ")"

    // const backgroundSize = annotationsInSentence.length == 0
    //     ? charHeight
    //     : firstLineStartPosition + (2 * annotationsInSentence.length) * lineThickness

    //if snippet has annotation that is being edited: highlight text background
    //disabled for now: highlighting covers line beneath as well
    // const backgroundColor = annotationBeingEdited && snippet.annotations.some(a => a.id == annotationBeingEdited.id)
    //     ? highlightColor
    //     : "none"


    //backgroundStyle = "linear-gradient(180deg, #00ff00 2px, #ffffff 2px, #ffffff 4px, #ffff00 4px, #ffff00 6px, #ffffff 6px, #ffffff 8px, #ff00ff 8px, #ff00ff 10px, #ffffff 10px)"

    return {
        paddingBottom: `${backgroundSize - charHeight}px`, //determines how far upper line is from text
        background: backgroundStyle,
        backgroundSize: `100% ${backgroundSize}px`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0px",
        lineHeight: "21px"
        //backgroundColor: backgroundColor
    }

}

export function getStyleForLineSpacing(sentence) {
    //line spacing is determined by the snippet with the lowest annotation line
    const annotationsInSentence = sentence.snippets.map(s => s.annotations)
        .flat()
        .filter((value, index, array) => array.indexOf(value) === index);

    const maxVerticalPosition = max(annotationsInSentence.map(a => a.verticalPosition))
    const lowestYPos = firstLineStartPosition + (maxVerticalPosition * 2 + 1) * lineThickness

    return {
        lineHeight: `${lowestYPos}px`
    }
}

export function setVerticalPositionOfAnnotationLines(sourceDoc) {
    const snippetsWithAnnotation = sourceDoc.sentences
        .map(sentence => sentence.snippets.filter(snippet => snippet.annotations.length > 0))
        .flat()
    //for each snippet that contains annotations: sort annotations according to length, so that
    //long annotations appear closer to the source text, and shorter ones further down
    //push annotations for Acts and ClaimDuty all the way down, they are not displayed
    snippetsWithAnnotation.forEach(snippet => {
        snippet.annotations.sort((a1, a2) => a2.nrSnippets - a1.nrSnippets)
    })

    //determine vertical position of the line for each annotation.
    //to determine at what position the line should be drawn, we check the highest index
    //of the annotation in all of its snippets. This will be the vertical position
    //of the line for this annotation
    const annotations = snippetsWithAnnotation.map(snippet => snippet.annotations).flat()
        .filter((annotation, index, snippetAnnotations) => snippetAnnotations.findIndex(a => a.id == annotation.id) === index);
    annotations.forEach(annotation => {
        annotation.verticalPosition = max(snippetsWithAnnotation
            .filter(snippet => snippet.annotations.some(a => a.id == annotation.id))
            .map(snippet => snippet.annotations.findIndex(a => a.id == annotation.id)))
    })
}