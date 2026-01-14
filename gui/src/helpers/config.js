// icons per frame type
const icons = {
  agent: "mdi-account-switch",
  object: "mdi-account-arrow-left-outline",
  action: "mdi-gesture-tap",
  duty: "mdi-exclamation",
  condition: "mdi-circle-small",
  act: "mdi-autorenew",
  claim_duty: "mdi-square",
  nlp: "mdi-text-recognition",
};

// colors per frame type / frame subtype
const colors = {
  fact: "primary",
  agent: "warning",
  object: "amber-10",
  action: "secondary",
  duty: "info",
  condition: "positive",
  multiple: "blue-grey-6",
  act: "deep-purple-10",
  claim_duty: "pink-14"
};

//used for underlining
const hexColors = {
  fact: "#1976D2",
  agent: "#F2C037",
  object: "#ff6f00",
  action: "#26A69A",
  duty: "#31CCEC",
  condition: "#21BA45",
  multiple: "#1a7d8b",
  act: "#311b92",
  claim_duty: "#c51162",

};

//used for highlighting source text and for node colors in network
const hexColorsLight = {
  fact: "#b3d9ff",
  agent: "#ffdd80",
  object: "#ffc496",
  action: "#80fff3",
  duty: "#80e9ff",
  condition: "#a8ffbd",
  multiple: "#b4cbcf",
  act: "#c0b3ff",
  claim_duty: "#ffadd3",
  list: "#dddddd",
  booleanConstruct: "#dddddd"
};

//used for sizing nodes in network
const nodeSizes = {
  fact: 5,
  act: 10,
  claim_duty: 10,
  anonymous: 3
}

export { icons, colors, hexColors, hexColorsLight, nodeSizes };
