import { curry, pipe } from "ramda";
import { app, h } from "hyperapp";
// @jsx h

// UTILS

//    contains :: [a] -> a -> Boolean
const contains = curry((list, item) => list.indexOf(item) > -1);

//    collection :: {k: v} -> [{k:v}]
const collection = obj =>
  Object.entries(obj).map(([id, props]) => ({ ...props, id }));
// HELPERS

//    getStatus :: (State, String) -> String
const getStatus = (state, optionId) => {
  if (isSelected(state, optionId)) {
    return "SELECTED";
  }

  if (isDisabled(state, optionId)) {
    return "DISABLED";
  }

  return "AVAILABLE";
};

//    isSelected :: State -> String -> Boolean
const isSelected = curry((state, optionId) =>
  contains(state.selected, optionId)
);

const allOptions = rule => rule.childOptions.concat([rule.parentOption]);

const numberOfSelectedOptionsForRule = (state, rule) =>
  state.selected.filter(optionId => contains(allOptions(rule), optionId))
    .length;

//    isDisabled :: (State, String) -> Boolean
const isDisabled = (state, optionId) => {
  let disabled = false;
  const option = state.options[optionId];

  option.rules.some(ruleId => {
    const rule = state.rules[ruleId];

    if (rule.type === "RA" && rule.parentOption === optionId) {
      disabled = !rule.childOptions.every(isSelected(state));
      if (disabled) return true;
    }

    if (rule.type === "RO" && rule.parentOption === optionId) {
      disabled = !rule.childOptions.some(isSelected(state));
      if (disabled) return true;
    }
    if (rule.type === "OO" && contains(state.activeRules, ruleId)) {
      rule.childOptions.some(option => {
        if (contains(state.selected, option)) {
          disabled = true;
          return true;
        }
      });

      if (disabled) return true;
    }

    if (rule.type === "NW" && contains(state.activeRules, ruleId)) {
      rule.childOptions
        .concat([rule.parentOption])
        .filter(id => id !== optionId)
        .map(option => {
          if (contains(state.selected, option)) {
            disabled = true;
            return true;
          }
        });
      if (disabled) return true;
    }
  });

  return disabled;
};

//    createOption :: (String, String) -> Object
const createOption = (name, ruleId) => ({ name, rules: [ruleId] });

//    createRule :: (String, String) -> Object
const createRule = (ruleId, type) => ({
  type,
  parentOption: null,
  childOptions: []
});

//    addOptionToRule :: (String, Boolean, Rule) -> Rule
const addOptionToRule = (optionId, isPrimary, rule) => ({
  ...rule,
  parentOption: isPrimary ? optionId : rule.parentOption,
  childOptions: isPrimary
    ? rule.childOptions
    : rule.childOptions.concat([optionId])
});

//    findOrCreateOption :: (State, String, String, String) -> Option
const findOrCreateOption = (state, optionId, name, ruleId) =>
  state.options[optionId] || createOption(name, ruleId);

//    findOrCreateRule :: (State, String, String) -> Rule
const findOrCreateRule = (state, ruleId, type) =>
  state.rules[ruleId] || createRule(ruleId, type);

//    addOption :: [string, string, string, int, string] -> State -> State
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

//    print :: State -> [IO] -> State
const print = state => {
  console.log(state.selected, state.activeRules);
  Object.entries(state.options).map(([id, props]) => {
    let status = getStatus(state, id);
    console.log(`[${id}]: ${props.name}: ${status}`);
  });

  return state;
};

// ACTIONS

const SelectOption = (state, optionId) => {
  return {
    ...state,
    selected: state.selected.concat([optionId]),
    activeRules: state.activeRules.concat(state.options[optionId].rules)
  };
};

const ToggleOption = (state, optionId) => {
  return contains(state.selected, optionId)
    ? DeSelectOption(state, optionId)
    : SelectOption(state, optionId);
};

const DeSelectOption = (state, optionId) => {
  return {
    ...state,
    selected: state.selected.filter(id => id !== optionId),
    activeRules: state.activeRules.filter(
      ruleId =>
        !(
          contains(state.options[optionId].rules, ruleId) &&
          numberOfSelectedOptionsForRule(state, state.rules[ruleId]) === 1
        )
    )
  };
};

const getInitialState = () =>
  pipe(
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
      1,
      "Comfort and sound pack - A1 Sportback"
    ]),
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
      1,
      "Comfort and sound pack - A1 Sportback"
    ]),
    addOption(["7062192", "NW", "129808", 0, "6 passive loudspeakers"]),
    addOption(["7062347", "RA", "140070", 0, "Space saving spare wheel"]),
    addOption(["7062347", "RA", "140070", 0, "Space saving spare wheel"]),
    addOption(["7062347", "RA", "140071", 1, "Tool kit and Jack"])
  )({
    rules: {},
    options: {},
    selected: [],
    activeRules: []
  });

// VIEWS
const Option = ({ option, state }) => {
  const status = getStatus(state, option.id);
  return (
    <div class={` option ${status.toLowerCase()}`}>
      <label>
        <input
          type="checkbox"
          disabled={status === "DISABLED"}
          checked={status === "SELECTED"}
          onchange={[ToggleOption, option.id]}
        />
        {option.name}
      </label>
    </div>
  );
};
app({
  init: getInitialState(),
  view: state => (
    <div>
      {collection(state.options).map(option => (
        <Option option={option} state={state} />
      ))}
    </div>
  ),
  node: document.getElementById("app")
});
