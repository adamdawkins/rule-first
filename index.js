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
const getStatus = (state, optionId) =>
  isSelected(state, optionId)
    ? "SELECTED"
    : isDisabled(state, optionId)
    ? "DISABLED"
    : "AVAILABLE";

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

const addPackContents = curry((packId, contents, state) => ({
  ...state,
  options: {
    ...state.options,
    [packId]: { ...state.options[packId], contents }
  }
}));

//    createOption :: (String, String, category) -> Object
const createOption = (name, ruleId, category) => ({
  name,
  category,
  rules: [ruleId]
});

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

//    findOrCreateOption :: (State, String, String, String, category) -> Option
const findOrCreateOption = (state, optionId, name, ruleId, category) =>
  state.options[optionId] || createOption(name, ruleId, category);

//    findOrCreateRule :: (State, String, String) -> Rule
const findOrCreateRule = (state, ruleId, type) =>
  state.rules[ruleId] || createRule(ruleId, type);

//    addOption :: [string, string, string, int, string, string] -> State -> State
const addOption = curry((option, state) => {
  const [ruleId, type, optionId, primary, name, category] = option;
  const updatedOption = findOrCreateOption(
    state,
    optionId,
    name,
    ruleId,
    category
  );
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

const NextCategory = state => {
  const newPosition = state.categories.hasNext
    ? state.categories.position + 1
    : state.categories.position;

  return {
    ...state,
    categories: {
      ...state.categories,
      position: newPosition,
      current: state.categories.values[newPosition],
      hasPrevious: true,
      hasNext: newPosition < state.categories.size - 1
    }
  };
};

const SelectOption = (state, optionId) => ({
  ...state,
  selected: state.selected.concat([optionId]),
  activeRules: state.activeRules.concat(state.options[optionId].rules)
});

const ToggleOption = (state, optionId) =>
  contains(state.selected, optionId)
    ? DeSelectOption(state, optionId)
    : SelectOption(state, optionId);

const DeSelectOption = (state, optionId) => ({
  ...state,
  selected: state.selected.filter(id => id !== optionId),
  activeRules: state.activeRules.filter(
    ruleId =>
      !(
        contains(state.options[optionId].rules, ruleId) &&
        numberOfSelectedOptionsForRule(state, state.rules[ruleId]) === 1
      )
  )
});

const getInitialState = () => {
  return pipe(
    addOption(["7060187", "OO", "20844", 0, "Pearl - Arrow Grey", "colour"]),
    addOption(["7060187", "OO", "27128", 0, "Pearl - Misano Red", "colour"]),
    addOption([
      "7060187",
      "OO",
      "93020",
      0,
      "Metallic - Glacier white",
      "colour"
    ]),
    addOption([
      "7060187",
      "OO",
      "104177",
      0,
      "Metallic - Mythos black",
      "colour"
    ]),
    addOption(["7060187", "OO", "105356", 0, "Solid - Shell white", "colour"]),
    addOption([
      "7060187",
      "OO",
      "111413",
      0,
      "Metallic - Manhattan grey",
      "colour"
    ]),
    addOption([
      "7060187",
      "OO",
      "122473",
      0,
      "Metallic - Firmament blue",
      "colour"
    ]),
    addOption([
      "7060187",
      "OO",
      "125093",
      0,
      "Metallic - Python yellow",
      "colour"
    ]),
    addOption([
      "7060187",
      "OO",
      "129827",
      0,
      "Special solid - Tioman green",
      "colour"
    ]),
    addOption([
      "7060188",
      "OO",
      "97650",
      0,
      "16 10 Spoke design alloy wheels",
      "wheels"
    ]),
    addOption([
      "7060188",
      "OO",
      "111416",
      0,
      "17 5 arm star design alloy wheels",
      "wheels"
    ]),
    addOption([
      "7060188",
      "OO",
      "125055",
      "0",
      "16 10 spoke turbine design alloy wheels",
      "wheels"
    ]),
    addOption([
      "7060189",
      "OO",
      "78562",
      "0",
      "3 spoke flat bottomed multi-function leather steering wheel",
      "other"
    ]),
    addOption([
      "7060189",
      "OO",
      "129818",
      "0",
      "3 spoke leather multifunction plus steering wheel",
      "other"
    ]),
    addOption([
      "7060191",
      "OO",
      "125084",
      0,
      "Contrast roof - Manhattan grey",
      "exterior body features"
    ]),
    addOption([
      "7060191",
      "OO",
      "125085",
      0,
      "Contrast roof - Mythos black",
      "exterior body features"
    ]),
    addOption(["7060203", "RO", "20844", 0, "Pearl - Arrow Grey", "colour"]),
    addOption(["7060203", "RO", "27128", 0, "Pearl - Misano Red", "colour"]),
    addOption([
      "7060203",
      "RO",
      "93020",
      0,
      "Metallic - Glacier white",
      "colour"
    ]),
    addOption([
      "7060203",
      "RO",
      "104177",
      0,
      "Metallic - Mythos black",
      "colour"
    ]),
    addOption([
      "7060203",
      "RO",
      "122473",
      0,
      "Metallic - Firmament blue",
      "colour"
    ]),
    addOption([
      "7060203",
      "RO",
      "125084",
      1,
      "Contrast roof - Manhattan grey",
      "exterior body features"
    ]),
    addOption([
      "7060203",
      "RO",
      "125093",
      0,
      "Metallic - Python yellow",
      "colour"
    ]),
    addOption([
      "7060203",
      "RO",
      "129827",
      0,
      "Special solid - Tioman green",
      "colour"
    ]),
    addOption(["7060204", "RO", "20844", 0, "Pearl - Arrow Grey", "colour"]),
    addOption(["7060204", "RO", "27128", 0, "Pearl - Misano Red", "colour"]),
    addOption([
      "7060204",
      "RO",
      "93020",
      0,
      "Metallic - Glacier white",
      "colour"
    ]),
    addOption([
      "7060204",
      "RO",
      "111413",
      0,
      "Metallic - Manhattan grey",
      "colour"
    ]),
    addOption([
      "7060204",
      "RO",
      "122473",
      0,
      "Metallic - Firmament blue",
      "colour"
    ]),
    addOption([
      "7060204",
      "RO",
      "125085",
      1,
      "Contrast roof - Mythos black",
      "exterior body features"
    ]),
    addOption([
      "7060204",
      "RO",
      "125093",
      0,
      "Metallic - Python yellow",
      "colour"
    ]),
    addOption([
      "7060204",
      "RO",
      "129827",
      0,
      "Special solid - Tioman green",
      "colour"
    ]),
    addOption([
      "7060205",
      "OO",
      "135657",
      0,
      "Novum cloth - Granite grey with mint contrast + front sport seats",
      "trim"
    ]),
    addOption([
      "7060205",
      "OO",
      "143138",
      0,
      "Novum cloth - Granite grey  steel grey contrast stitching + front sport seats",
      "trim"
    ]),
    addOption(["7062150", "OO", "1753", 0, "Manual air conditioning", "other"]),
    addOption([
      "7062150",
      "OO",
      "139671",
      0,
      "Plus pack - A1 Sportback",
      "packs"
    ]),
    addOption([
      "7062151",
      "RA",
      "140070",
      1,
      "Space saving spare wheel",
      "other"
    ]),
    addOption(["7062151", "RA", "140071", 0, "Tool kit and Jack", "other"]),
    addOption(["7062153", "OO", "69372", 0, "Tyre repair kit", "other"]),
    addOption([
      "7062153",
      "OO",
      "140070",
      0,
      "Space saving spare wheel",
      "other"
    ]),
    addOption(["7062154", "OO", "2427", 0, "Tool kit", "other"]),
    addOption(["7062154", "OO", "140071", 0, "Tool kit and Jack", "other"]),
    addOption([
      "7062192",
      "NW",
      "125089",
      1,
      "Comfort and sound pack - A1 Sportback",
      "packs"
    ]),
    addOption([
      "7062192",
      "NW",
      "125089",
      1,
      "Comfort and sound pack - A1 Sportback",
      "packs"
    ]),
    addOption([
      "7062192",
      "NW",
      "125089",
      1,
      "Comfort and sound pack - A1 Sportback",
      "packs"
    ]),
    addOption([
      "7062192",
      "NW",
      "125089",
      1,
      "Comfort and sound pack - A1 Sportback",
      "packs"
    ]),
    addOption([
      "7062192",
      "NW",
      "129808",
      0,
      "6 passive loudspeakers",
      "other"
    ]),
    addOption([
      "7062347",
      "RA",
      "140070",
      0,
      "Space saving spare wheel",
      "other"
    ]),
    addOption([
      "7062347",
      "RA",
      "140070",
      0,
      "Space saving spare wheel",
      "other"
    ]),
    addOption(["7062347", "RA", "140071", 1, "Tool kit and Jack", "other"]),
    addPackContents("125089", [
      "Heated front seats",
      "Rear view camera",
      "Bang + Olufsen 3D sound system",
      "Audi parking system plus"
    ]),
    addPackContents("139671", [
      "Front centre armrest",
      "Privacy glass",
      "Dual zone electronic climate control"
    ])
  )({
    rules: {},
    options: {},
    selected: [],
    activeRules: [],
    // A manual hardcoded linked list for now
    categories: {
      values: [
        "colour",
        "trim",
        "exterior body features",
        "wheels",
        "packs",
        "other"
      ],
      current: "colour",
      position: 0,
      size: 6,
      hasPrevious: false,
      hasNext: true
    },
    basePrice: 20330.0
  });
};

//    selectedOptionPrices :: State -> Float
const selectedOptionPrices = state => 0.0;

//    initialPayment :: State -> Float
const initialPayment = state => (monthlyPrice(state) * 9).toFixed(2);

//    monthlyPrice :: State -> Float
const monthlyPrice = state =>
  ((state.basePrice + selectedOptionPrices(state)) / (47 + 9)).toFixed(2);

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
      {option.category === "packs" ? (
        <ul>
          {option.contents.map(content => (
            <li>{content}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
app({
  init: getInitialState(),
  view: state => {
    console.log({ state });
    return (
      <div class="container">
        <ul class="nav">
          {state.categories.values.map(name => (
            <li
              class={`nav-item ${
                name === state.categories.current ? "selected" : ""
              }`}
            >
              {name}
            </li>
          ))}
          <li style={{ marginLeft: "auto", marginRight: "3em" }}>
            <button class="next-button" onclick={NextCategory}>
              Next
            </button>
          </li>
        </ul>
        <div class="options">
          {collection(state.options)
            .filter(({ category }) => category === state.categories.current)
            .map(option => (
              <Option option={option} state={state} />
            ))}
        </div>
        <div class="basket">
          <h2>Your A1 Sportback</h2>
          <h3 class="total">£{monthlyPrice(state)}/mo</h3>
          <span>initial payment: £{initialPayment(state)}</span>
        </div>
      </div>
    );
  },
  node: document.getElementById("app")
});
