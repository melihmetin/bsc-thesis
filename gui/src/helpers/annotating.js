//helper functions for selecting text when annotating
//these manage splitting a sentence into snippets, to allow
//nested annotations, and corresponding underlining of text

import { Snippet } from "../model/snippet"
import { Annotation } from "../model/annotation.js"

// This function returns sentences and snippets that cover the selected text,
// and it returns the offsets within the snippets of the selected text.
// It takes into account that selection can be done from right to left as
// well as from left to right
export function getSelectionAsSnippets(selection, sentences) {
    let startSentence //sentence that contains leftmost position of selection
    let endSentence //sentence that contains rightmost position of selection
    let startSnippet //snippet that contains leftmost position of 
    let endSnippet
    let startOffset //within snippet
    let endOffset //within snippet
    //divs have data-sentence-id and data-snippet-id
    //div is the parent-node of selection (which is a text node)
    //sentence of start of selection
    const anchorSentence = sentences.find(s => s.id == selection.anchorNode.parentNode.dataset.sentenceId)
    const focusSentence = sentences.find(s => s.id == selection.focusNode.parentNode.dataset.sentenceId)
    //selection started in this snippet (anchorNode)
    const anchorSnippet = anchorSentence.snippets.find(s => s.id == selection.anchorNode.parentNode.dataset.snippetId)
    //selection ended in this snippet (focusNode)
    const focusSnippet = focusSentence.snippets.find(s => s.id == selection.focusNode.parentNode.dataset.snippetId)
    const anchorSentenceIndex = sentences.findIndex(s => s.id == anchorSentence.id)
    const focusSentenceIndex = sentences.findIndex(s => s.id == focusSentence.id)

    if (anchorSentenceIndex > focusSentenceIndex) { //user selected from right to left
        startSnippet = focusSnippet //first snippet in selection
        endSnippet = anchorSnippet //last snippet in selection
        startOffset = selection.focusOffset //character offset in start snippet
        endOffset = selection.anchorOffset //character offset in end snippet
        startSentence = focusSentence
        endSentence = anchorSentence
    } else if (anchorSentenceIndex == focusSentenceIndex) {
        //anchor and focussnippet are in the same sentence. Check the order of the snippets
        //using the index of both within the sentence
        const anchorSnippetIndex = sentences[anchorSentenceIndex].snippets.findIndex(s => s.id == anchorSnippet.id)
        const focusSnippetIndex = sentences[focusSentenceIndex].snippets.findIndex(s => s.id == focusSnippet.id)
        startSentence = focusSentence //same as anchorsentence
        endSentence = anchorSentence
        if (anchorSnippetIndex > focusSnippetIndex) { //user selected from right to left
            startSnippet = focusSnippet //first snippet in selection
            endSnippet = anchorSnippet //last snippet in selection
            startOffset = selection.focusOffset
            endOffset = selection.anchorOffset
        } else if (anchorSnippetIndex == focusSnippetIndex) {
            startSnippet = anchorSnippet //start and end snippet are the same
            endSnippet = focusSnippet //start and end snippet are the same
            //within this snippet, check if user selected from right to left, or left to right
            if (selection.anchorOffset > selection.focusOffset) { //user selected from right to left
                startOffset = selection.focusOffset
                endOffset = selection.anchorOffset
            } else { //user selected from left to right
                startOffset = selection.anchorOffset
                endOffset = selection.focusOffset
            }
        } else { //user selected from left to right
            startSnippet = anchorSnippet //first snippet in selection
            endSnippet = focusSnippet //last snippet in selection
            startOffset = selection.anchorOffset
            endOffset = selection.focusOffset
        }
    } else { //anchorSentenceIndex < focusSentenceIndex, user selected from left to right
        startSnippet = anchorSnippet //first snippet in selection
        endSnippet = focusSnippet //last snippet in selection
        startOffset = selection.anchorOffset
        endOffset = selection.focusOffset
        startSentence = anchorSentence
        endSentence = focusSentence
    }
    return {
        startSentence: startSentence,
        endSentence: endSentence,
        startSnippet: startSnippet,
        endSnippet: endSnippet,
        startOffset: startOffset,
        endOffset: endOffset
    }
}

//this function is used to get snippets and offsets within these snippets
//that cover the given character range
export function getSelectedRangeAsSnippets(sentence, selectedCharacterRange) {
    //start- and end-sentence are the same
    //find start and end snippet within the sentence
    //find snippet that includes start of selectedCharacterRange
    const startSnippet = sentence.snippets.find(s => (
        selectedCharacterRange[0] >= s.characterRange[0] &&
        selectedCharacterRange[0] < s.characterRange[1]
    ))
    //offset in snippet of start of selectedCharacterRange
    const startOffset = selectedCharacterRange[0] - startSnippet.characterRange[0]
    //find snippet that includes end of selectedCharacterRange
    const endSnippet = sentence.snippets.find(s => (
        selectedCharacterRange[1] > s.characterRange[0] &&
        selectedCharacterRange[1] <= s.characterRange[1]
    ))
    //offset in snippet of end of selectedCharacterRange
    const endOffset = selectedCharacterRange[1] - endSnippet.characterRange[0]
    return {
        startSentence: sentence,
        endSentence: sentence,
        startSnippet: startSnippet,
        endSnippet: endSnippet,
        startOffset: startOffset,
        endOffset: endOffset
    }
}

export function splitAndReturnSelectedSnippets(
    selectionAsSnippets,
    sentences) {
    //destructure
    const {
        startSentence,
        endSentence,
        startSnippet,
        endSnippet,
        startOffset,
        endOffset
    } = selectionAsSnippets

    //split start snippet and replace it in the sentence by the two new snippets
    const startSubSnippets = splitSnippet(startSnippet, startOffset, startSentence)
    let endSubSnippets
    //if startsnippet and endsnippet are the same, split the rightmost startSubSnippet
    //else split the endsnippet
    if (startSnippet == endSnippet) {
        endSubSnippets = splitSnippet(
            startSubSnippets[startSubSnippets.length - 1],
            endOffset - startOffset,
            endSentence
        )
    } else {
        endSubSnippets = splitSnippet(endSnippet, endOffset, endSentence)
    }
    //collect all snippets covered by the selection
    let selectionSnippets = []
    const startSnippetIndexInSentence = startSentence.snippets.findIndex(s => s.id == startSubSnippets[startSubSnippets.length - 1].id)
    const endSnippetIndexInSentence = endSentence.snippets.findIndex(s => s.id == endSubSnippets[0].id)
    if (startSentence.id == endSentence.id) {
        //same sentence
        if (startSnippet == endSnippet) {
            //same snippet
            selectionSnippets = [endSubSnippets[0]]
        } else {
            //different snippets
            selectionSnippets = startSentence.snippets.slice(startSnippetIndexInSentence, endSnippetIndexInSentence + 1)
        }
    } else {
        const startSentenceIndex = sentences.findIndex(sentence => sentence.id == startSentence.id)
        const endSentenceIndex = sentences.findIndex(sentence => sentence.id == endSentence.id)
        selectionSnippets = startSentence.snippets.slice(startSnippetIndexInSentence) //copy start snippet plus rest of sentence
        for (let sentenceNr = startSentenceIndex + 1; sentenceNr < endSentenceIndex; sentenceNr++) {
            //add all snippets of intermediate sentences
            selectionSnippets = selectionSnippets.concat(sentences[sentenceNr].snippets)
        }
        //add all up and including end snippet
        selectionSnippets = selectionSnippets.concat(endSentence.snippets.slice(0, endSnippetIndexInSentence + 1))
    }
    return selectionSnippets
}

function splitSnippet(snippet, charIndex, sentence) {
    //If charIndex == 0 or charIndex == snippet.text.length-1 then snippet is not split, return the
    //original snippet
    if (charIndex == 0 || charIndex == snippet.text.length) {
        return [snippet]
    } else {
        const leftSnippet = new Snippet(sentence, [snippet.characterRange[0], snippet.characterRange[0] + charIndex])
        const rightSnippet = new Snippet(sentence, [snippet.characterRange[0] + charIndex, snippet.characterRange[1]])
        snippet.annotations.forEach(a => {
            leftSnippet.addAnnotation(a)
            rightSnippet.addAnnotation(a)
        })

        //replace original snippet in sentence with the two new ones
        const snippetIndexInSentence = sentence.snippets.findIndex(s => s.id == snippet.id)
        sentence.snippets.splice(snippetIndexInSentence, 1, leftSnippet, rightSnippet)

        return [leftSnippet, rightSnippet]
    }
}


