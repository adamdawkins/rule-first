const contains = (list, item) => list.indexOf(item) > -1;

let TheState = {
  rules: {
    7060187: {
      type: "OO",
      parentOption: null,
      childOptions: [
        "20844",
        "27128",
        "93020",
        "104177",
        "105356",
        "111413",
        "122473",
        "125093",
        "129827"
      ]
    }
  },
  options: {
    20844: { rules: ["7060187"], name: "Pearl - Arrow Grey" },
    27128: { rules: ["7060187"], name: "Pearl - Misano Red" },
    93020: { rules: ["7060187"], name: "Metallic - Glacier white" },
    104177: { rules: ["7060187"], name: "Metallic - Mythos black" },
    105356: { rules: ["7060187"], name: "Solid - Shell white" },
    111413: { rules: ["7060187"], name: "Metallic - Manhattan grey" },
    122473: { rules: ["7060187"], name: "Metallic - Firmament blue" },
    125093: { rules: ["7060187"], name: "Metallic - Python yellow" },
    129827: { rules: ["7060187"], name: "Special solid - Tioman green" }
  },
  selected: [],
  activeRules: []
};

//    selectOption :: (State, String) -> State
const selectOption = (state, option) => ({
  ...state,
  selected: state.selected.concat([option]),
  activeRules: state.selected.concat(state.options[option].rules)
});

const getStatus = (state, optionId) => {
  if (isSelected(state, optionId)) {
    return "SELECTED";
  }

  if (isDisabled(state, optionId)) {
    return "DISABLED";
  }

  return "AVAILABLE";
};

//    isSelected :: (State, String) -> Boolean
const isSelected = (state, optionId) => contains(state.selected, optionId);

//    isDisabled :: (State, String) -> Boolean
const isDisabled = (state, optionId) => {
  let disabled = false;
  const option = state.options[optionId];

  state.activeRules.map(ruleId => {
    const rule = state.rules[ruleId];

    if (contains(option.rules, ruleId)) {
      if (rule.type === "OO") {
        rule.childOptions.map(option => {
          if (contains(state.selected, option)) disabled = true;
        });
      }
    }
  });

  return disabled;
};

const print = currentState => {
  console.log(currentState);
  Object.entries(currentState.options).map(([id, props]) => {
    let status = getStatus(currentState, id);
    console.log(`${props.name}: ${status}`);
  });
};

print(TheState);
TheState = selectOption(TheState, "20844");
print(TheState);
