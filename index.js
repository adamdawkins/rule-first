const { curry, pipe } = require("ramda");
const contains = (list, item) => list.indexOf(item) > -1;

//    selectOption :: String -> State -> State
const selectOption = curry((optionId, state) => {
  console.log(`\nSelecting option: ${optionId}\n`);
  return {
    ...state,
    selected: state.selected.concat([optionId]),
    activeRules: state.activeRules.concat(state.options[optionId].rules)
  };
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
      if (rule.type === "NW") {
        rule.childOptions
          .concat([rule.parentOption])
          .filter(id => id !== optionId)
          .map(option => {
            if (contains(state.selected, option)) disabled = true;
          });
      }
    }
  });

  return disabled;
};

const createOption = (name, ruleId) => ({ name, rules: [ruleId] });
const createRule = (ruleId, type) => ({
  type,
  parentOption: null,
  childOptions: []
});

const addOptionToRule = (optionId, isPrimary, rule) => ({
  ...rule,
  parentOption: isPrimary ? optionId : rule.primary,
  childOptions: isPrimary
    ? rule.childOptions
    : rule.childOptions.concat([optionId])
});

const findOrCreateOption = (state, optionId, name, ruleId) =>
  state.options[optionId] || createOption(name, ruleId);
const findOrCreateRule = (state, ruleId, type) =>
  state.rules[ruleId] || createRule(ruleId, type);

const addOption = curry((option, state) => {
  const [ruleId, type, optionId, primary, name] = option;
  const updatedOption = findOrCreateOption(state, optionId, name, ruleId);
  updatedOption.rules.push(ruleId);

  const updatedRule = addOptionToRule(
    optionId,
    primary === 1,
    findOrCreateRule(state, ruleId, type)
  );

  return {
    ...state,
    options: {
      ...state.options,
      [optionId]: updatedOption
    },
    rules: {
      ...state.rules,
      [ruleId]: updatedRule
    }
  };
});

const print = state => {
  console.log(state.selected, state.activeRules);
  Object.entries(state.options).map(([id, props]) => {
    let status = getStatus(state, id);
    console.log(`[${id}]: ${props.name}: ${status}`);
  });

  return state;
};

let TheState = pipe(
  addOption(["7060187", "OO", "20844", 0, "Pearl - Arrow Grey"]),
  addOption(["7060187", "OO", "27128", 0, "Pearl - Misano Red"]),
  addOption(["7060187", "OO", "93020", 0, "Metallic - Glacier white"]),
  addOption(["7060187", "OO", "104177", 0, "Metallic - Mythos black"]),
  addOption(["7060187", "OO", "105356", 0, "Solid - Shell white"]),
  addOption(["7060187", "OO", "111413", 0, "Metallic - Manhattan grey"]),
  addOption(["7060187", "OO", "122473", 0, "Metallic - Firmament blue"]),
  addOption(["7060187", "OO", "125093", 0, "Metallic - Python yellow"]),
  addOption(["7060187", "OO", "129827", 0, "Special solid - Tioman green"]),
  addOption(["7060188", "OO", "97650", 0, "16 10 Spoke design alloy wheels"]),
  addOption([
    "7060188",
    "OO",
    "111416",
    0,
    "17 5 arm star design alloy wheels"
  ]),
  addOption([
    "7060188",
    "OO",
    "125055",
    "0",
    "16 10 spoke turbine design alloy wheels"
  ]),
  addOption([
    "7060189",
    "OO",
    "78562",
    "0",
    "3 spoke flat bottomed multi-function leather steering wheel"
  ]),
  addOption([
    "7060189",
    "OO",
    "129818",
    "0",
    "3 spoke leather multifunction plus steering wheel"
  ]),
  addOption(["7060191", "OO", "125084", 0, "Contrast roof - Manhattan grey"]),
  addOption(["7060191", "OO", "125085", 0, "Contrast roof - Mythos black"]),
  addOption(["7060203", "RO", "20844", 0, "Pearl - Arrow Grey"]),
  addOption(["7060203", "RO", "27128", 0, "Pearl - Misano Red"]),
  addOption(["7060203", "RO", "93020", 0, "Metallic - Glacier white"]),
  addOption(["7060203", "RO", "104177", 0, "Metallic - Mythos black"]),
  addOption(["7060203", "RO", "122473", 0, "Metallic - Firmament blue"]),
  addOption(["7060203", "RO", "125084", 1, "Contrast roof - Manhattan grey"]),
  addOption(["7060203", "RO", "125093", 0, "Metallic - Python yellow"]),
  addOption(["7060203", "RO", "129827", 0, "Special solid - Tioman green"]),
  addOption(["7060204", "RO", "20844", 0, "Pearl - Arrow Grey"]),
  addOption(["7060204", "RO", "27128", 0, "Pearl - Misano Red"]),
  addOption(["7060204", "RO", "93020", 0, "Metallic - Glacier white"]),
  addOption(["7060204", "RO", "111413", 0, "Metallic - Manhattan grey"]),
  addOption(["7060204", "RO", "122473", 0, "Metallic - Firmament blue"]),
  addOption(["7060204", "RO", "125085", 1, "Contrast roof - Mythos black"]),
  addOption(["7060204", "RO", "125093", 0, "Metallic - Python yellow"]),
  addOption(["7060204", "RO", "129827", 0, "Special solid - Tioman green"]),
  addOption([
    "7060205",
    "OO",
    "135657",
    0,
    "Novum cloth - Granite grey with mint contrast + front sport seats"
  ]),
  addOption([
    "7060205",
    "OO",
    "143138",
    0,
    "Novum cloth - Granite grey  steel grey contrast stitching + front sport seats"
  ]),
  addOption(["7062150", "OO", "1753", 0, "Manual air conditioning"]),
  addOption(["7062150", "OO", "139671", 0, "Plus pack - A1 Sportback"]),
  addOption(["7062150", "OO", "139671", 0, "Plus pack - A1 Sportback"]),
  addOption(["7062150", "OO", "139671", 0, "Plus pack - A1 Sportback"]),
  addOption(["7062151", "RA", "140070", 1, "Space saving spare wheel"]),
  addOption(["7062151", "RA", "140071", 0, "Tool kit and Jack"]),
  addOption(["7062153", "OO", "69372", 0, "Tyre repair kit"]),
  addOption(["7062153", "OO", "140070", 0, "Space saving spare wheel"]),
  addOption(["7062154", "OO", "2427", 0, "Tool kit"]),
  addOption(["7062154", "OO", "140071", 0, "Tool kit and Jack"]),
  addOption([
    "7062192",
    "NW",
    "125089",
    1,
    "Comfort and sound pack - A1 Sportback"
  ]),
  addOption([
    "7062192",
    "NW",
    "125089",
    "1",
    "Comfort and sound pack - A1 Sportback"
  ]),
  addOption([
    "7062192",
    "NW",
    "125089",
    "1",
    "Comfort and sound pack - A1 Sportback"
  ]),
  addOption([
    "7062192",
    "NW",
    "125089",
    "1",
    "Comfort and sound pack - A1 Sportback"
  ]),
  addOption(["7062192", "NW", "129808", 0, "6 passive loudspeakers"]),
  addOption(["7062347", "RA", "140070", 0, "Space saving spare wheel"]),
  addOption(["7062347", "RA", "140070", 0, "Space saving spare wheel"]),
  addOption(["7062347", "RA", "140071", 1, "Tool kit and Jack"]),
  selectOption("20844"),
  print,
  selectOption("111416"),
  selectOption("125089")
)({
  rules: {},
  options: {},
  selected: [],
  activeRules: []
});
print(TheState);
