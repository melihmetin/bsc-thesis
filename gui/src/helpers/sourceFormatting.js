const fontSizes = [
    14, //level 1
    14, //level 2
    12, //level 3
    12, //level 4
    12  //level 5
]

const defaultFontSize = 11

const fontWeights = [
    "bold", //level 1
    "bold", //level 2
    "bold", //level 3
    "bold", //level 4
    "bold"  //level 5
]

const defaultFontWeight = "normal"

const indentationPerLevel = 10

//sentences with no children are displayed without expand/collapse button. Add some extra
//space to account for this, aligning these sentences with other sentences on the same level
//that do have children (and thus an expand/colapse button)
const extraIdentationForLeafSentences = 24

//font size and weight depends on level in tree, i.e. the depth of the sentence seen from the root
//if a sentence has no children, which means that it is not a header, it will get the default
//formatting, regardless of its level in the tree
//root has level zero. the root is not displayed, it has no content. its children are the headers at the
//first visible level

export function getHeaderStyling(sentence) {
    const level = sentence.level - 1 //root level is not displayed, set first level to 0
    const marginLeft = level * indentationPerLevel + (sentence.children.length == 0 ? extraIdentationForLeafSentences : 0)
    //apply formatting if sentence is header, and within the highest levels
    const fontSize = sentence.isHeader && level < fontSizes.length && sentence.children.length > 0 ? fontSizes[level] : defaultFontSize
    const fontWeight = sentence.isHeader && level < fontWeights.length && sentence.children.length > 0 ? fontWeights[level] : defaultFontWeight
    return {
        marginLeft: `${marginLeft}pt`,
        fontSize: `${fontSize}pt`,
        fontWeight: fontWeight
    }
}