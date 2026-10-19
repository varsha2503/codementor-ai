export type Probe = { input: Record<string, unknown>; rationale: string };

type Check = (input: Record<string, unknown>) => string | null;

function isInt(value: unknown, min = -1_000_000_000, max = 1_000_000_000): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

function intList(value: unknown, minLen: number, maxLen: number, min = -1_000_000_000, max = 1_000_000_000): string | null {
  if (!Array.isArray(value)) return "expected an array of integers";
  if (value.length < minLen || value.length > maxLen) return "array length is outside the constraints";
  if (!value.every((item) => isInt(item, min, max))) return "an array value is not an allowed integer";
  return null;
}

function exactKeys(input: Record<string, unknown>, keys: string[]): string | null {
  const actual = Object.keys(input).sort();
  const expected = [...keys].sort();
  if (actual.join() !== expected.join()) return `input must contain only ${keys.join(", ")}`;
  return null;
}

function lower(value: string): boolean {
  return /^[a-z]*$/.test(value);
}

function bounded(value: unknown, minLen: number, maxLen: number, pattern: RegExp, label: string): string | null {
  if (typeof value !== "string") return `${label} must be a string`;
  if (value.length < minLen || value.length > maxLen) return `${label} length is outside the constraints`;
  if (!pattern.test(value)) return `${label} contains a character that is not allowed`;
  return null;
}

function twoLower(
  input: Record<string, unknown>,
  first: string,
  second: string,
  minFirst = 0,
  maxFirst = 10_000,
  minSecond = 0,
  maxSecond = 10_000,
): string | null {
  const keys = exactKeys(input, [first, second]);
  if (keys) return keys;
  return (
    bounded(input[first], minFirst, maxFirst, /^[a-z]*$/, first) ??
    bounded(input[second], minSecond, maxSecond, /^[a-z]*$/, second)
  );
}

function wordList(value: unknown, minCount: number, maxCount: number, minLen: number, maxLen: number): string | null {
  if (!Array.isArray(value) || value.length < minCount || value.length > maxCount) return "word list size is out of range";
  const pattern = minLen === 0 ? /^[a-z]*$/ : /^[a-z]+$/;
  for (const word of value) {
    const check = bounded(word, minLen, maxLen, pattern, "word");
    if (check) return check;
  }
  return null;
}

function digitLabel(value: unknown, label: string): string | null {
  return bounded(value, 1, 200, /^(0|[1-9][0-9]*)$/, label);
}

function versionName(value: unknown, label: string): string | null {
  const check = bounded(value, 1, 100, /^[0-9]+(\.[0-9]+)*$/, label);
  if (check) return check;
  if ((value as string).split(".").some((part) => part.length > 9)) return `${label} has a revision that is too long`;
  return null;
}

function unfoldedLength(code: string): string | null {
  let index = 0;
  const parse = (): number | string => {
    let length = 0;
    while (index < code.length && code[index] !== "]") {
      const ch = code[index];
      if (ch >= "0" && ch <= "9") {
        let count = 0;
        const start = index;
        while (index < code.length && code[index] >= "0" && code[index] <= "9") {
          count = count * 10 + Number(code[index]);
          index += 1;
          if (count > 10_000) return "a repeat count is too large";
        }
        if (code[start] === "0") return "a count cannot have a leading zero";
        if (code[index] !== "[") return "a repeat count must be followed by [";
        index += 1;
        const inner = parse();
        if (typeof inner === "string") return inner;
        if (code[index] !== "]") return "brackets are not balanced";
        index += 1;
        length += count * inner;
        if (length > 10_000) return "the decoded text is too long";
      } else {
        length += 1;
        index += 1;
      }
    }
    return length;
  };
  const result = parse();
  if (typeof result === "string") return result;
  return index === code.length ? null : "brackets are not balanced";
}

function sortValues(input: Record<string, unknown>): string | null {
  return exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, -10_000, 10_000);
}

function onlyInts(key: string, minLen: number, maxLen: number, min = -10_000, max = 10_000): Check {
  return (input) => exactKeys(input, [key]) ?? intList(input[key], minLen, maxLen, min, max);
}

function monotonic(values: number[], strict: boolean): string | null {
  for (let index = 1; index < values.length; index += 1) {
    if (strict ? values[index] <= values[index - 1] : values[index] < values[index - 1]) {
      return strict ? "values must be strictly increasing" : "values must be sorted in nondecreasing order";
    }
  }
  return null;
}

function sortedKey(
  input: Record<string, unknown>,
  key: string,
  minLen: number,
  maxLen: number,
  min: number,
  max: number,
  strict: boolean,
): string | null {
  return exactKeys(input, [key]) ?? intList(input[key], minLen, maxLen, min, max) ?? monotonic(input[key] as number[], strict);
}

function sortedWith(
  input: Record<string, unknown>,
  key: string,
  extra: string,
  minLen: number,
  maxLen: number,
  min: number,
  max: number,
  strict: boolean,
  extraMin: number,
  extraMax: number,
): string | null {
  return (
    exactKeys(input, [key, extra]) ??
    intList(input[key], minLen, maxLen, min, max) ??
    (isInt(input[extra], extraMin, extraMax) ? null : `${extra} is out of range`) ??
    monotonic(input[key] as number[], strict)
  );
}

function readMatrix(value: unknown, maxRows: number, min: number, max: number): number[][] | string {
  if (!Array.isArray(value) || value.length < 1 || value.length > maxRows) return "grid size is out of range";
  const width = Array.isArray(value[0]) ? value[0].length : 0;
  if (width < 1 || width > maxRows) return "grid width is out of range";
  const grid: number[][] = [];
  for (const row of value) {
    if (!Array.isArray(row) || row.length !== width) return "grid rows must be the same length";
    if (!row.every((item) => isInt(item, min, max))) return "grid values are out of range";
    grid.push(row as number[]);
  }
  return grid;
}

function rowsSorted(grid: number[][]): string | null {
  for (const row of grid) {
    const order = monotonic(row, false);
    if (order) return order;
  }
  return null;
}

function intMatrix(value: unknown, maxRows: number, square = false): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > maxRows) return "grid size is out of range";
  const width = Array.isArray(value[0]) ? value[0].length : 0;
  if (width < 1 || width > maxRows) return "grid width is out of range";
  if (square && width !== value.length) return "grid must be square";
  for (const row of value) {
    if (!Array.isArray(row) || row.length !== width) return "grid rows must be the same length";
    if (!row.every((item) => isInt(item, -1000, 1000))) return "grid values are out of range";
  }
  return null;
}

const checks: Record<string, Check> = {
  "selection-sort": sortValues,
  "bubble-sort": sortValues,
  "insertion-sort": sortValues,
  "merge-sort": sortValues,
  "recursive-bubble-sort": sortValues,
  "recursive-insertion-sort": sortValues,
  "quick-sort": sortValues,
  "heaviest-crate": onlyInts("values", 1, 10_000),
  "runner-up-weight": onlyInts("values", 2, 10_000),
  "rising-lane": onlyInts("values", 1, 10_000),
  "compact-badges": onlyInts("values", 1, 10_000),
  "step-forward": onlyInts("values", 1, 10_000),
  "roll-left": (input) =>
    exactKeys(input, ["values", "k"]) ??
    intList(input.values, 1, 10_000) ??
    (isInt(input.k, 0, 100_000) ? null : "k is out of range"),
  "zeros-to-the-back": onlyInts("values", 1, 10_000),
  "locate-bin": (input) =>
    exactKeys(input, ["values", "target"]) ??
    intList(input.values, 1, 10_000) ??
    (isInt(input.target, -10_000, 10_000) ? null : "target is out of range"),
  "merged-catalog": (input) =>
    exactKeys(input, ["left", "right"]) ??
    intList(input.left, 0, 10_000) ??
    intList(input.right, 0, 10_000),
  "skipped-locker": onlyInts("values", 1, 10_000, 0, 10_000),
  "open-streak": onlyInts("values", 1, 10_000, 0, 1),
  "lone-tag": onlyInts("values", 1, 10_001),
  "exact-haul": (input) =>
    exactKeys(input, ["values", "k"]) ??
    intList(input.values, 1, 10_000, 1, 1000) ??
    (isInt(input.k, 1, 1_000_000_000) ? null : "k is out of range"),
  "lane-colors": onlyInts("values", 1, 10_000, 0, 2),
  "majority-vote": onlyInts("values", 1, 10_000),
  "richest-stretch": onlyInts("values", 1, 10_000, -1000, 1000),
  "single-trade": onlyInts("prices", 1, 10_000, 0, 10_000),
  "signed-row": (input) => {
    const list = intList(input.values, 2, 10_000);
    if (exactKeys(input, ["values"]) || list) return exactKeys(input, ["values"]) ?? list;
    const values = input.values as number[];
    if (values.length % 2 !== 0) return "the row length must be even";
    if (values.some((value) => value === 0)) return "zero is not allowed";
    const positives = values.filter((value) => value > 0).length;
    if (positives !== values.length / 2) return "the two signs must be equally common";
    return null;
  },
  "next-roster": onlyInts("values", 1, 1000, -1000, 1000),
  "front-leaders": onlyInts("values", 1, 10_000),
  "consecutive-run": onlyInts("values", 0, 10_000, -100_000, 100_000),
  "ways-to-tally": (input) =>
    exactKeys(input, ["values", "k"]) ??
    intList(input.values, 1, 2000, -1000, 1000) ??
    (isInt(input.k, -1000, 1000) ? null : "k is out of range"),
  "blank-cross": (input) => exactKeys(input, ["grid"]) ?? intMatrix(input.grid, 20),
  "quarter-turn": (input) => exactKeys(input, ["grid"]) ?? intMatrix(input.grid, 20, true),
  "spiral-pickup": (input) => exactKeys(input, ["grid"]) ?? intMatrix(input.grid, 20),
  "triple-sum": onlyInts("values", 3, 300, -1000, 1000),
  "merged-shifts": (input) => {
    if (exactKeys(input, ["shifts"])) return exactKeys(input, ["shifts"]);
    if (!Array.isArray(input.shifts) || input.shifts.length > 1000) return "too many shifts";
    for (const span of input.shifts) {
      if (!Array.isArray(span) || span.length !== 2 || !isInt(span[0], 0, 10_000) || !isInt(span[1], 0, 10_000)) {
        return "each shift must be a start and end in range";
      }
      if (span[0] > span[1]) return "a shift cannot end before it starts";
    }
    return null;
  },
  "gap-and-repeat": (input) => {
    const list = intList(input.values, 2, 10_000, 1, 10_000);
    if (exactKeys(input, ["values"]) || list) return exactKeys(input, ["values"]) ?? list;
    const values = input.values as number[];
    if (values.some((value) => value > values.length)) return "values must lie between 1 and n";
    return null;
  },
  "strongest-product": onlyInts("values", 1, 20, -8, 8),
  "pair-target": (input) =>
    exactKeys(input, ["nums", "target"]) ??
    intList(input.nums, 2, 100_000, -1_000_000_000, 1_000_000_000) ??
    (isInt(input.target) ? null : "target must be an integer"),
  "anagram-spots": (input) => {
    if (exactKeys(input, ["text", "pattern"])) return exactKeys(input, ["text", "pattern"]);
    if (typeof input.text !== "string" || typeof input.pattern !== "string") return "text and pattern must be strings";
    if (!lower(input.text) || !lower(input.pattern)) return "strings must be lowercase";
    if (input.text.length > 20_000 || input.pattern.length > 20_000) return "string is too long";
    return null;
  },
  "unique-stretch": (input) => {
    if (exactKeys(input, ["log"])) return "input must contain log";
    if (typeof input.log !== "string" || input.log.length > 50_000) return "log must be a string up to 50000 characters";
    return null;
  },
  "bracket-check": (input) => {
    if (typeof input.expr !== "string" || input.expr.length > 10_000) return "expr must be a string up to 10000 characters";
    if ([...input.expr].some((ch) => !"()[]{}".includes(ch))) return "expr may only contain brackets";
    return exactKeys(input, ["expr"]);
  },
  "mirror-line": (input) => exactKeys(input, ["line"]) ?? bounded(input.line, 0, 10_000, /^[\s\S]*$/, "line"),
  "same-bag": (input) => twoLower(input, "left", "right"),
  "shared-prefix": (input) => exactKeys(input, ["words"]) ?? wordList(input.words, 1, 200, 0, 200),
  "lone-letter": (input) => exactKeys(input, ["note"]) ?? bounded(input.note, 0, 10_000, /^[a-z]*$/, "note"),
  "needle-mark": (input) => twoLower(input, "hay", "needle"),
  "spin-check": (input) => twoLower(input, "left", "right"),
  "nest-depth": (input) => exactKeys(input, ["expr"]) ?? bounded(input.expr, 0, 10_000, /^[\s\S]*$/, "expr"),
  "echo-trim": (input) => exactKeys(input, ["ribbon"]) ?? bounded(input.ribbon, 0, 10_000, /^[a-z]*$/, "ribbon"),
  "letter-run": (input) => twoLower(input, "text", "pattern"),
  "note-from-scrap": (input) => twoLower(input, "note", "scrap"),
  "run-code": (input) => exactKeys(input, ["ribbon"]) ?? bounded(input.ribbon, 0, 10_000, /^[a-z]*$/, "ribbon"),
  "odd-label": (input) => exactKeys(input, ["label"]) ?? bounded(input.label, 1, 100, /^[0-9]+$/, "label"),
  "word-flip": (input) => exactKeys(input, ["line"]) ?? bounded(input.line, 0, 10_000, /^[a-z ]*$/, "line"),
  "mirror-core": (input) => exactKeys(input, ["ribbon"]) ?? bounded(input.ribbon, 0, 1000, /^[a-z]*$/, "ribbon"),
  "tight-window": (input) => twoLower(input, "text", "need", 0, 10_000, 1, 10_000),
  "paint-run": (input) => {
    const ribbon = bounded(input.ribbon, 0, 10_000, /^[a-z]*$/, "ribbon");
    if (exactKeys(input, ["ribbon", "budget"]) || ribbon) return exactKeys(input, ["ribbon", "budget"]) ?? ribbon;
    const length = (input.ribbon as string).length;
    return isInt(input.budget, 0, length) ? null : "budget must be between 0 and the ribbon length";
  },
  "fold-code": (input) => {
    const code = bounded(input.code, 0, 200, /^[a-z0-9\[\]]*$/, "code");
    if (exactKeys(input, ["code"]) || code) return exactKeys(input, ["code"]) ?? code;
    return unfoldedLength(input.code as string);
  },
  "label-sum": (input) => {
    const keys = exactKeys(input, ["left", "right"]);
    if (keys) return keys;
    return digitLabel(input.left, "left") ?? digitLabel(input.right, "right");
  },
  "release-order": (input) => {
    const keys = exactKeys(input, ["left", "right"]);
    if (keys) return keys;
    return versionName(input.left, "left") ?? versionName(input.right, "right");
  },
  "burst-marks": (input) => {
    const marks = bounded(input.marks, 0, 10_000, /^[a-z]*$/, "marks");
    if (exactKeys(input, ["marks", "limit"]) || marks) return exactKeys(input, ["marks", "limit"]) ?? marks;
    return isInt(input.limit, 1, 10_000) ? null : "limit is out of range";
  },
  "shape-match": (input) => twoLower(input, "left", "right"),
  "desk-pattern": (input) => {
    const keys = exactKeys(input, ["pattern", "phrase"]);
    if (keys) return keys;
    const pattern = bounded(input.pattern, 1, 100, /^[a-z]+$/, "pattern");
    const phrase = bounded(input.phrase, 1, 1000, /^[a-z]+( [a-z]+)*$/, "phrase");
    if (pattern || phrase) return pattern ?? phrase;
    const words = (input.phrase as string).split(" ");
    return words.length === (input.pattern as string).length ? null : "the pattern and the phrase must have the same number of words";
  },
  "few-kinds": (input) => {
    const log = bounded(input.log, 0, 10_000, /^[a-z]*$/, "log");
    if (exactKeys(input, ["log", "kinds"]) || log) return exactKeys(input, ["log", "kinds"]) ?? log;
    return isInt(input.kinds, 0, 26) ? null : "kinds must be between 0 and 26";
  },
  "mirror-count": (input) => exactKeys(input, ["ribbon"]) ?? bounded(input.ribbon, 0, 1000, /^[a-z]*$/, "ribbon"),
  "border-length": (input) => exactKeys(input, ["word"]) ?? bounded(input.word, 0, 10_000, /^[a-z]*$/, "word"),
  "route-words": (input) => {
    const route = bounded(input.route, 0, 200, /^[a-z]*$/, "route");
    if (exactKeys(input, ["route", "words"]) || route) return exactKeys(input, ["route", "words"]) ?? route;
    return wordList(input.words, 0, 100, 1, 20);
  },
  "label-product": (input) => {
    const keys = exactKeys(input, ["left", "right"]);
    if (keys) return keys;
    return digitLabel(input.left, "left") ?? digitLabel(input.right, "right");
  },
  "wild-mask": (input) => {
    const keys = exactKeys(input, ["text", "mask"]);
    if (keys) return keys;
    return bounded(input.text, 0, 200, /^[a-z]*$/, "text") ?? bounded(input.mask, 0, 200, /^[a-z?*]*$/, "mask");
  },
  "front-mirror": (input) => exactKeys(input, ["word"]) ?? bounded(input.word, 0, 1000, /^[a-z]*$/, "word"),
  "shifted-search": (input) =>
    exactKeys(input, ["nums", "target"]) ??
    intList(input.nums, 1, 10_000) ??
    (isInt(input.target) ? null : "target must be an integer"),
  "catalog-spot": (input) => sortedWith(input, "values", "target", 1, 100_000, -1_000_000_000, 1_000_000_000, true, -1_000_000_000, 1_000_000_000),
  "badge-slot": (input) => sortedWith(input, "values", "badge", 1, 100_000, -1_000_000_000, 1_000_000_000, false, -1_000_000_000, 1_000_000_000),
  "ticket-span": (input) => sortedWith(input, "tickets", "ticket", 1, 100_000, -1_000_000_000, 1_000_000_000, false, -1_000_000_000, 1_000_000_000),
  "floor-quote": (input) => sortedWith(input, "prices", "budget", 1, 100_000, 0, 1_000_000_000, false, 0, 1_000_000_000),
  "ceil-quote": (input) => sortedWith(input, "prices", "offer", 1, 100_000, 0, 1_000_000_000, false, 0, 1_000_000_000),
  "courtyard-side": (input) => exactKeys(input, ["area"]) ?? (isInt(input.area, 0, 1_000_000_000) ? null : "area is out of range"),
  "ridge-peak": (input) => {
    const list = sortedKey(input, "heights", 3, 100_000, -1_000_000_000, 1_000_000_000, false);
    if (list && list !== "values must be sorted in nondecreasing order") return list;
    const heights = input.heights as number[];
    if (!Array.isArray(heights)) return list;
    let index = 0;
    while (index + 1 < heights.length && heights[index] < heights[index + 1]) index += 1;
    if (index === 0 || index === heights.length - 1) return "heights must rise and then fall";
    while (index + 1 < heights.length && heights[index] > heights[index + 1]) index += 1;
    return index === heights.length - 1 ? null : "heights must rise and then fall";
  },
  "rotated-low": (input) => {
    const list = exactKeys(input, ["values"]) ?? intList(input.values, 1, 10_000, -1_000_000_000, 1_000_000_000);
    if (list) return list;
    const values = input.values as number[];
    return new Set(values).size === values.length ? null : "values must be distinct";
  },
  "repeat-shift": (input) =>
    exactKeys(input, ["values", "target"]) ??
    intList(input.values, 1, 10_000, -1_000_000_000, 1_000_000_000) ??
    (isInt(input.target, -1_000_000_000, 1_000_000_000) ? null : "target is out of range"),
  "odd-beacon": (input) => {
    const list = exactKeys(input, ["values"]) ?? intList(input.values, 1, 100_001, -1_000_000_000, 1_000_000_000);
    if (list) return list;
    const values = input.values as number[];
    if (values.length % 2 === 0) return "length must be odd";
    const order = monotonic(values, false);
    if (order) return order;
    const counts = new Map<number, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    let singles = 0;
    for (const count of counts.values()) {
      if (count === 1) singles += 1;
      else if (count !== 2) return "every other value must appear twice";
    }
    return singles === 1 ? null : "exactly one value appears once";
  },
  "flat-grid": (input) => {
    if (exactKeys(input, ["grid", "target"])) return exactKeys(input, ["grid", "target"]);
    if (!isInt(input.target, -1000, 1000)) return "target is out of range";
    const grid = readMatrix(input.grid, 100, -1000, 1000);
    if (typeof grid === "string") return grid;
    const order = rowsSorted(grid);
    if (order) return order;
    for (let row = 1; row < grid.length; row += 1) {
      const previous = grid[row - 1];
      if (grid[row][0] <= previous[previous.length - 1]) return "each row must start after the previous row ends";
    }
    return null;
  },
  "busiest-row": (input) => {
    if (exactKeys(input, ["grid"])) return exactKeys(input, ["grid"]);
    const grid = readMatrix(input.grid, 100, 0, 1);
    if (typeof grid === "string") return grid;
    for (const row of grid) {
      let ones = false;
      for (const cell of row) {
        if (cell === 0 && ones) return "each row must be zeros followed by ones";
        if (cell === 1) ones = true;
      }
    }
    return null;
  },
  "missing-token": (input) =>
    sortedWith(input, "values", "k", 1, 10_000, 1, 1_000_000_000, true, 1, 1_000_000_000),
  "snack-pace": (input) => {
    const piles = intList(input.piles, 1, 10_000, 1, 1_000_000_000);
    if (exactKeys(input, ["piles", "hours"]) || piles) return exactKeys(input, ["piles", "hours"]) ?? piles;
    const length = (input.piles as number[]).length;
    return isInt(input.hours, length, 1_000_000_000) ? null : "hours must be at least the number of piles";
  },
  "lane-capacity": (input) => {
    const weights = intList(input.weights, 1, 10_000, 1, 10_000);
    if (exactKeys(input, ["weights", "days"]) || weights) return exactKeys(input, ["weights", "days"]) ?? weights;
    const length = (input.weights as number[]).length;
    return isInt(input.days, 1, length) ? null : "days must be between 1 and the number of packages";
  },
  "stall-gap": (input) => {
    const order = sortedWith(input, "stalls", "markers", 2, 10_000, 0, 1_000_000_000, true, 2, 10_000);
    if (order) return order;
    const length = (input.stalls as number[]).length;
    return isInt(input.markers, 2, length) ? null : "markers must be between 2 and the number of stalls";
  },
  "crew-loads": (input) => {
    const loads = intList(input.loads, 1, 10_000, 1, 10_000);
    if (exactKeys(input, ["loads", "crews"]) || loads) return exactKeys(input, ["loads", "crews"]) ?? loads;
    const length = (input.loads as number[]).length;
    return isInt(input.crews, 1, length) ? null : "crews must be between 1 and the number of loads";
  },
  "relay-day": (input) => {
    const bloom = intList(input.bloom, 1, 10_000, 1, 1_000_000_000);
    if (exactKeys(input, ["bloom", "groups", "width"]) || bloom) return exactKeys(input, ["bloom", "groups", "width"]) ?? bloom;
    if (!isInt(input.groups, 1, 1_000_000_000) || !isInt(input.width, 1, 1_000_000_000)) return "groups and width must be positive";
    return null;
  },
  "split-fee": (input) => {
    const loads = intList(input.loads, 1, 10_000, 1, 1_000_000);
    if (exactKeys(input, ["loads", "limit"]) || loads) return exactKeys(input, ["loads", "limit"]) ?? loads;
    const length = (input.loads as number[]).length;
    return isInt(input.limit, length, 1_000_000_000) ? null : "limit must be at least the number of loads";
  },
  "root-floor": (input) =>
    exactKeys(input, ["degree", "value"]) ??
    (isInt(input.degree, 2, 9) ? null : "degree is out of range") ??
    (isInt(input.value, 0, 1_000_000_000) ? null : "value is out of range"),
  "merged-pick": (input) => {
    const left = intList(input.left, 0, 10_000, -1_000_000_000, 1_000_000_000);
    const right = intList(input.right, 0, 10_000, -1_000_000_000, 1_000_000_000);
    if (exactKeys(input, ["left", "right", "k"]) || left || right) return exactKeys(input, ["left", "right", "k"]) ?? left ?? right;
    const leftValues = input.left as number[];
    const rightValues = input.right as number[];
    const total = leftValues.length + rightValues.length;
    if (total < 1) return "at least one list must contain a value";
    const order = monotonic(leftValues, false) ?? monotonic(rightValues, false);
    if (order) return order;
    return isInt(input.k, 1, total) ? null : "k must be a valid rank";
  },
  "grid-middle": (input) => {
    if (exactKeys(input, ["grid"])) return exactKeys(input, ["grid"]);
    const grid = readMatrix(input.grid, 100, -100_000, 100_000);
    if (typeof grid === "string") return grid;
    const cells = grid.length * grid[0].length;
    if (cells % 2 === 0) return "the grid must contain an odd number of cells";
    return rowsSorted(grid);
  },
  "grid-rank": (input) => {
    if (exactKeys(input, ["grid", "k"])) return exactKeys(input, ["grid", "k"]);
    const grid = readMatrix(input.grid, 100, -100_000, 100_000);
    if (typeof grid === "string") return grid;
    const order = rowsSorted(grid);
    if (order) return order;
    const width = grid[0].length;
    for (let column = 0; column < width; column += 1) {
      for (let row = 1; row < grid.length; row += 1) {
        if (grid[row][column] < grid[row - 1][column]) return "each column must be sorted";
      }
    }
    const cells = grid.length * width;
    return isInt(input.k, 1, cells) ? null : "k must be a valid rank";
  },
  "merge-rosters": (input) =>
    exactKeys(input, ["left", "right"]) ?? intList(input.left, 0, 500, -1000, 1000) ?? intList(input.right, 0, 500, -1000, 1000),
  "loop-in-chain": (input) => {
    const values = intList(input.values, 0, 10_000, -100_000, 100_000);
    const length = Array.isArray(input.values) ? input.values.length : 0;
    return (
      exactKeys(input, ["values", "pos"]) ??
      values ??
      (isInt(input.pos, -1, Math.max(0, length - 1)) ? null : "pos must be -1 or a valid index")
    );
  },
  "head-insert": (input) =>
    exactKeys(input, ["values", "value"]) ?? intList(input.values, 0, 1000, -1000, 1000) ?? (isInt(input.value, -1000, 1000) ? null : "value is out of range"),
  "head-delete": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, -1000, 1000),
  "chain-length": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, -1000, 1000),
  "chain-search": (input) =>
    exactKeys(input, ["values", "key"]) ?? intList(input.values, 0, 1000, -1000, 1000) ?? (isInt(input.key, -1000, 1000) ? null : "key is out of range"),
  "dll-head-insert": (input) =>
    exactKeys(input, ["values", "value"]) ?? intList(input.values, 0, 1000, -1000, 1000) ?? (isInt(input.value, -1000, 1000) ? null : "value is out of range"),
  "dll-head-delete": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, -1000, 1000),
  "dll-reverse": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, -1000, 1000),
  "list-middle": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 1, 1000, -1000, 1000),
  "reverse-chain": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, -1000, 1000),
  "reverse-chain-recursive": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, -1000, 1000),
  "loop-start": (input) => cyclePos(input, true),
  "loop-length": (input) => cyclePos(input, false),
  "chain-palindrome": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, -1000, 1000),
  "odd-even-chain": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, -1000, 1000),
  "drop-from-end": (input) => {
    const values = intList(input.values, 1, 1000, -1000, 1000);
    const length = Array.isArray(input.values) ? input.values.length : 0;
    return exactKeys(input, ["values", "n"]) ?? values ?? (isInt(input.n, 1, length) ? null : "n must name a real node");
  },
  "drop-middle": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 1, 1000, -1000, 1000),
  "sort-chain": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 500, -1000, 1000),
  "color-chain": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 1000, 0, 2),
  "y-meet": (input) =>
    exactKeys(input, ["prefixA", "prefixB", "shared"]) ??
    intList(input.prefixA, 0, 500, -1000, 1000) ??
    intList(input.prefixB, 0, 500, -1000, 1000) ??
    intList(input.shared, 0, 500, -1000, 1000),
  "plus-one-chain": (input) => exactKeys(input, ["values"]) ?? msdDigits(input.values),
  "add-chains": (input) => exactKeys(input, ["left", "right"]) ?? lsdDigits(input.left) ?? lsdDigits(input.right),
  "dll-drop-key": (input) =>
    exactKeys(input, ["values", "key"]) ?? intList(input.values, 0, 1000, -1000, 1000) ?? (isInt(input.key, -1000, 1000) ? null : "key is out of range"),
  "dll-pairs": (input) =>
    exactKeys(input, ["values", "target"]) ??
    sortedChain(input.values) ??
    (isInt(input.target, -1000, 1000) ? null : "target is out of range"),
  "dll-unique": (input) => exactKeys(input, ["values"]) ?? sortedChain(input.values),
  "reverse-groups": (input) => {
    const values = intList(input.values, 1, 500, -1000, 1000);
    const length = Array.isArray(input.values) ? input.values.length : 0;
    return exactKeys(input, ["values", "k"]) ?? values ?? (isInt(input.k, 1, length) ? null : "k must be from 1 to the list length");
  },
  "spin-chain": (input) =>
    exactKeys(input, ["values", "k"]) ??
    intList(input.values, 0, 500, -1000, 1000) ??
    (isInt(input.k, 0, 1_000_000_000) ? null : "k is out of range"),
  "flatten-columns": (input) => exactKeys(input, ["columns"]) ?? columnsOf(input.columns),
  "clone-random": (input) => exactKeys(input, ["nodes"]) ?? randomNodes(input.nodes),
  "shelf-depth": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "identical-layout": (input) =>
    exactKeys(input, ["left", "right"]) ?? levelOrder(input.left) ?? levelOrder(input.right),
  "campus-islands": (input) => gridStrings(input),
  "module-order": (input) => {
    if (!isInt(input.count, 1, 2000)) return "count is out of range";
    if (!Array.isArray(input.prerequisites)) return "prerequisites must be an array";
    if (input.prerequisites.length > 5000) return "too many prerequisites";
    for (const edge of input.prerequisites) {
      if (!Array.isArray(edge) || edge.length !== 2 || !edge.every((item) => isInt(item, 0, (input.count as number) - 1))) {
        return "each prerequisite must be a pair of module indexes";
      }
    }
    return exactKeys(input, ["count", "prerequisites"]);
  },
  "stair-routes": (input) => exactKeys(input, ["steps"]) ?? (isInt(input.steps, 1, 45) ? null : "steps must be from 1 to 45"),
  "house-payout": (input) => exactKeys(input, ["values"]) ?? intList(input.values, 0, 100, 0, 400),
  "coin-picks": (input) =>
    exactKeys(input, ["coins", "amount"]) ??
    intList(input.coins, 1, 12, 1, 200) ??
    (isInt(input.amount, 0, 10_000) ? null : "amount is out of range"),
  "subset-ways": (input) =>
    exactKeys(input, ["nums", "target"]) ??
    intList(input.nums, 0, 20, 1, 1000) ??
    (isInt(input.target, 0, 1000) ? null : "target is out of range"),
  "rising-signal": (input) => exactKeys(input, ["readings"]) ?? intList(input.readings, 0, 2500, -10_000, 10_000),
  "corridor-routes": (input) => {
    if (!Array.isArray(input.grid) || input.grid.length < 1 || input.grid.length > 100) return "grid size is out of range";
    const width = Array.isArray(input.grid[0]) ? input.grid[0].length : 0;
    if (width < 1 || width > 100) return "grid width is out of range";
    for (const row of input.grid) {
      if (!Array.isArray(row) || row.length !== width || !row.every((cell) => cell === 0 || cell === 1)) {
        return "grid cells must be 0 or 1";
      }
    }
    return exactKeys(input, ["grid"]);
  },
  "palindrome-cuts": (input) => {
    if (typeof input.s !== "string" || input.s.length < 1 || input.s.length > 200 || !lower(input.s)) {
      return "s must be 1 to 200 lowercase letters";
    }
    return exactKeys(input, ["s"]);
  },
  "recursive-atoi": (input) => exactKeys(input, ["text"]) ?? atoiText(input.text),
  "integer-power": (input) => {
    if (exactKeys(input, ["x", "n"])) return exactKeys(input, ["x", "n"]);
    if (!isInt(input.x, -100, 100) || !isInt(input.n, -1_000_000_000, 1_000_000_000)) return "x or n is out of range";
    if (input.n < 0 && input.x === 0) return "zero has no negative power";
    return null;
  },
  "good-digits": (input) =>
    exactKeys(input, ["n"]) ?? (isInt(input.n, 1, 1_000_000_000_000_000) ? null : "n is out of range"),
  "sort-stack": (input) => exactKeys(input, ["stack"]) ?? intList(input.stack, 0, 200, -1000, 1000),
  "reverse-stack": (input) => exactKeys(input, ["stack"]) ?? intList(input.stack, 0, 200, -1000, 1000),
  "binary-strings": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, 1, 12) ? null : "n must be from 1 to 12"),
  "pair-parens": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, 1, 8) ? null : "n must be from 1 to 8"),
  "power-set": (input) => exactKeys(input, ["nums"]) ?? distinctInts(input.nums, 0, 10),
  "subset-check": (input) =>
    exactKeys(input, ["nums", "target"]) ??
    intList(input.nums, 0, 16, 1, 100) ??
    (isInt(input.target, 0, 500) ? null : "target is out of range"),
  "combo-sum": (input) =>
    exactKeys(input, ["candidates", "target"]) ??
    distinctPositive(input.candidates) ??
    (isInt(input.target, 1, 30) ? null : "target is out of range"),
  "combo-sum-unique": (input) =>
    exactKeys(input, ["candidates", "target"]) ??
    intList(input.candidates, 1, 12, 1, 30) ??
    (isInt(input.target, 1, 30) ? null : "target is out of range"),
  "all-subsets": (input) => exactKeys(input, ["nums"]) ?? distinctInts(input.nums, 0, 10),
  "unique-subsets": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 0, 10, -1000, 1000),
  "combo-three": (input) =>
    exactKeys(input, ["k", "n"]) ??
    (isInt(input.k, 1, 9) && isInt(input.n, 1, 60) ? null : "k or n is out of range"),
  "digit-letters": (input) => exactKeys(input, ["digits"]) ?? bounded(input.digits, 0, 4, /^[2-9]*$/, "digits"),
  "palindrome-split": (input) => exactKeys(input, ["text"]) ?? bounded(input.text, 1, 12, /^[a-z]+$/, "text"),
  "board-word": (input) => letterBoard(input),
  "queen-grid": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, 1, 8) ? null : "n must be from 1 to 8"),
  "maze-paths": (input) => exactKeys(input, ["maze"]) ?? squareBits(input.maze, 5),
  "color-graph": (input) => colorInput(input),
  "fill-grid": (input) => exactKeys(input, ["grid"]) ?? sudokuGrid(input.grid),
  "operator-ways": (input) =>
    exactKeys(input, ["digits", "target"]) ??
    bounded(input.digits, 1, 10, /^[0-9]+$/, "digits") ??
    (isInt(input.target, -5000, 5000) ? null : "target is out of range"),
  "bit-index": (input) =>
    exactKeys(input, ["n", "i"]) ??
    (isInt(input.n, 0, 1_000_000_000_000) && isInt(input.i, 0, 52) ? null : "n or i is out of range"),
  "odd-check": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, -1_000_000_000, 1_000_000_000) ? null : "n is out of range"),
  "power-two": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, 0, 1_000_000_000_000) ? null : "n is out of range"),
  "popcount": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, 0, 1_000_000_000_000) ? null : "n is out of range"),
  "rightmost-bit": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, 0, 1_000_000_000_000) ? null : "n is out of range"),
  "swap-values": (input) =>
    exactKeys(input, ["a", "b"]) ??
    (isInt(input.a, -1_000_000_000, 1_000_000_000) && isInt(input.b, -1_000_000_000, 1_000_000_000) ? null : "a or b is out of range"),
  "bit-divide": (input) => {
    if (exactKeys(input, ["dividend", "divisor"])) return exactKeys(input, ["dividend", "divisor"]);
    if (!isInt(input.dividend, -2_147_483_648, 2_147_483_647) || !isInt(input.divisor, -2_147_483_648, 2_147_483_647)) {
      return "dividend or divisor is out of range";
    }
    if (input.divisor === 0) return "divisor must not be zero";
    return null;
  },
  "bit-flips": (input) =>
    exactKeys(input, ["start", "goal"]) ??
    (isInt(input.start, 0, 1_000_000_000) && isInt(input.goal, 0, 1_000_000_000) ? null : "start or goal is out of range"),
  "bit-subsets": (input) => exactKeys(input, ["nums"]) ?? distinctBitValues(input.nums),
  "range-xor": (input) => {
    if (exactKeys(input, ["left", "right"])) return exactKeys(input, ["left", "right"]);
    if (!isInt(input.left, 0, 1_000_000_000_000) || !isInt(input.right, 0, 1_000_000_000_000)) return "left or right is out of range";
    if (input.left > input.right) return "left must not exceed right";
    return null;
  },
  "two-singles": (input) => twoSingles(input),
  "prime-factors": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, 1, 1_000_000_000_000) ? null : "n is out of range"),
  "all-divisors": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, 1, 1_000_000_000_000) ? null : "n is out of range"),
  "prime-span": (input) => {
    if (exactKeys(input, ["left", "right"])) return exactKeys(input, ["left", "right"]);
    if (!isInt(input.left, 1, 1_000_000_000_000) || !isInt(input.right, 1, 1_000_000_000_000)) return "left or right is out of range";
    if (input.left > input.right) return "left must not exceed right";
    if (input.right - input.left > 999_999) return "the range is wider than 1000000";
    return null;
  },
  "prime-breakdown": (input) => exactKeys(input, ["n"]) ?? (isInt(input.n, 1, 1_000_000_000_000) ? null : "n is out of range"),
  "array-stack": (input) => fixedBuffer(input, stackCommands),
  "array-queue": (input) => fixedBuffer(input, queueCommands),
  "queue-stack": (input) => exactKeys(input, ["commands"]) ?? stackCommands(input.commands, null),
  "stack-queue": (input) => exactKeys(input, ["commands"]) ?? queueCommands(input.commands, null),
  "list-stack": (input) => exactKeys(input, ["commands"]) ?? stackCommands(input.commands, null),
  "list-queue": (input) => exactKeys(input, ["commands"]) ?? queueCommands(input.commands, null),
  "min-stack": (input) => exactKeys(input, ["commands"]) ?? minCommands(input.commands),
  "infix-postfix": (input) => exactKeys(input, ["expression"]) ?? infixExpression(input.expression),
  "prefix-infix": (input) => exactKeys(input, ["expression"]) ?? prefixExpression(input.expression),
  "prefix-postfix": (input) => exactKeys(input, ["expression"]) ?? prefixExpression(input.expression),
  "postfix-prefix": (input) => exactKeys(input, ["expression"]) ?? postfixExpression(input.expression),
  "postfix-infix": (input) => exactKeys(input, ["expression"]) ?? postfixExpression(input.expression),
  "infix-prefix": (input) => exactKeys(input, ["expression"]) ?? infixExpression(input.expression),
  "next-greater": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 10_000),
  "next-greater-circular": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 10_000),
  "next-smaller": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 10_000),
  "greater-counts": (input) => greaterQueries(input),
  "trap-rain": (input) => exactKeys(input, ["height"]) ?? intList(input.height, 1, 10_000, 0, 100_000),
  "subarray-mins": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 10_000, 0, 1_000_000_000),
  "asteroid-run": (input) => exactKeys(input, ["asteroids"]) ?? asteroidList(input.asteroids),
  "subarray-ranges": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 1000, -1_000_000, 1_000_000),
  "trim-digits": (input) => trimDigits(input),
  "histogram-area": (input) => exactKeys(input, ["heights"]) ?? intList(input.heights, 1, 10_000, 0, 10_000),
  "maximal-rectangle": (input) => exactKeys(input, ["grid"]) ?? binaryGrid(input.grid),
  "window-max": (input) => windowMax(input),
  "stock-span": (input) => exactKeys(input, ["prices"]) ?? intList(input.prices, 1, 10_000, 1, 1_000_000_000),
  "celebrity": (input) => exactKeys(input, ["knows"]) ?? knowsMatrix(input.knows),
  "lru-cache": (input) => cacheCommands(input),
  "lfu-cache": (input) => cacheCommands(input),
  "min-heap": (input) => exactKeys(input, ["commands"]) ?? heapCommands(input.commands),
  "heap-check": (input) => exactKeys(input, ["heap"]) ?? intList(input.heap, 0, 10_000),
  "heap-flip": (input) => exactKeys(input, ["heap"]) ?? minHeapArray(input.heap),
  "kth-largest": (input) => kthPick(input),
  "kth-smallest": (input) => kthPick(input),
  "nearly-sorted": (input) => nearlySorted(input),
  "merge-k-lists": (input) => exactKeys(input, ["lists"]) ?? sortedLists(input.lists),
  "value-ranks": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 10_000),
  "task-gap": (input) =>
    exactKeys(input, ["tasks", "n"]) ??
    bounded(input.tasks, 1, 10_000, /^[A-Z]+$/, "tasks") ??
    (isInt(input.n, 0, 100) ? null : "n is out of range"),
  "straight-hand": (input) => straightHand(input),
  "tweet-feed": (input) => exactKeys(input, ["commands"]) ?? tweetCommands(input.commands),
  "stick-cost": (input) => exactKeys(input, ["sticks"]) ?? intList(input.sticks, 0, 10_000, 1, 10_000),
  "kth-stream": (input) => kthStream(input),
  "pair-sums": (input) => pairSums(input),
  "running-median": (input) => exactKeys(input, ["commands"]) ?? medianCommands(input.commands),
  "frequent-values": (input) => frequentValues(input),
  "assign-cookies": (input) => cookieBags(input),
  "fraction-pack": (input) => fractionItems(input),
  "lemonade": (input) => lemonadeBills(input),
  "star-parens": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 0, 10_000, /^[()*]*$/, "s"),
  "meeting-room": (input) => exactKeys(input, ["meetings"]) ?? spanRows(input.meetings, 0, 10_000, true),
  "jump-reach": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 10_000, 0, 100_000),
  "jump-count": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 10_000, 0, 100_000),
  "rail-platforms": (input) => platformTimes(input),
  "job-order": (input) => exactKeys(input, ["jobs"]) ?? jobRows(input.jobs),
  "candy-row": (input) => exactKeys(input, ["ratings"]) ?? intList(input.ratings, 1, 10_000, 0, 10_000),
  "shortest-job": (input) => exactKeys(input, ["burst"]) ?? intList(input.burst, 1, 10_000, 1, 10_000),
  "page-faults": (input) => pageRefs(input),
  "insert-span": (input) => insertSpans(input),
  "drop-intervals": (input) => exactKeys(input, ["intervals"]) ?? spanRows(input.intervals, 0, 10_000, false),
  "preorder-walk": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "inorder-walk": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "postorder-walk": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "level-walk": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "iter-preorder": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "iter-inorder": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "post-two-stacks": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "post-one-stack": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "triple-order": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "balanced-tree": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "tree-diameter": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "max-path-sum": (input) => exactKeys(input, ["root"]) ?? occupiedTree(input.root),
  "zigzag-levels": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "tree-boundary": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "vertical-order": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "top-view": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "bottom-view": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "right-view": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "left-view": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "symmetric-tree": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "root-paths": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "lowest-ancestor": (input) => ancestorQuery(input),
  "max-width": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "children-sum": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "nodes-at-k": (input) => distanceQuery(input),
  "burn-tree": (input) => targetQuery(input),
  "count-complete": (input) => exactKeys(input, ["root"]) ?? completeLevel(input.root),
  "build-pre-in": (input) => traversalPair(input, "preorder", "inorder"),
  "build-post-in": (input) => traversalPair(input, "postorder", "inorder"),
  "serialize-tree": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "deserialize-tree": (input) => exactKeys(input, ["data"]) ?? serialText(input.data),
  "morris-preorder": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "morris-inorder": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "flatten-tree": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "search-bst": (input) => bstKey(input, 0),
  "bst-minmax": (input) => exactKeys(input, ["root"]) ?? requireBst(input.root, 1),
  "floor-ceil-bst": (input) => bstKey(input, 0),
  "floor-bst": (input) => bstKey(input, 0),
  "insert-bst": (input) => bstKey(input, 0),
  "delete-bst": (input) => bstKey(input, 0),
  "kth-bst": (input) => kthBstInput(input),
  "valid-bst": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "lca-bst": (input) => lcaBstInput(input),
  "bst-preorder": (input) => exactKeys(input, ["preorder"]) ?? preorderBst(input.preorder),
  "pred-succ-bst": (input) => bstKey(input, 0),
  "merge-bsts": (input) => exactKeys(input, ["left", "right"]) ?? requireBst(input.left, 0) ?? requireBst(input.right, 0),
  "two-sum-bst": (input) =>
    exactKeys(input, ["root", "k"]) ?? requireBst(input.root, 0) ?? (isInt(input.k, 0, 20_000) ? null : "k is out of range"),
  "recover-bst": (input) => exactKeys(input, ["root"]) ?? repairedBst(input.root),
  "largest-bst": (input) => exactKeys(input, ["root"]) ?? levelOrder(input.root),
  "component-count": (input) => undirectedGraph(input, 2000, 4000),
  "graph-dfs": (input) => undirectedGraph(input, 2000, 4000),
  "province-count": (input) => exactKeys(input, ["isConnected"]) ?? provinceMatrix(input.isConnected),
  "rotten-oranges": (input) => exactKeys(input, ["grid"]) ?? numberGrid(input.grid, 1, 100, 1, 100, 0, 2),
  "flood-fill": (input) => floodFillInput(input),
  "cycle-bfs": (input) => undirectedGraph(input, 2000, 4000),
  "cycle-undirected": (input) => undirectedGraph(input, 2000, 4000),
  "nearest-one": (input) => exactKeys(input, ["grid"]) ?? zeroOneGrid(input.grid, 100) ?? hasOne(input.grid),
  "surrounded-regions": (input) => exactKeys(input, ["board"]) ?? charGrid(input.board, 100, /^[XO]$/),
  "enclave-count": (input) => exactKeys(input, ["grid"]) ?? zeroOneGrid(input.grid, 100),
  "word-ladder": (input) => wordLadderInput(input, 500, 10),
  "word-ladder-all": (input) => wordLadderInput(input, 30, 5),
  "bipartite-graph": (input) => undirectedGraph(input, 2000, 4000),
  "cycle-directed-dfs": (input) => directedGraph(input, 2000, 4000, false),
  "topo-dfs": (input) => directedGraph(input, 2000, 4000, false),
  "topo-kahn": (input) => directedGraph(input, 2000, 4000, false),
  "cycle-directed": (input) => directedGraph(input, 2000, 4000, false),
  "course-schedule": (input) => coursePlan(input),
  "eventual-safe": (input) => exactKeys(input, ["graph"]) ?? safeGraph(input.graph),
  "alien-order": (input) => exactKeys(input, ["words"]) ?? wordList(input.words, 1, 100, 1, 20),
  "unit-shortest": (input) => undirectedGraph(input, 2000, 4000),
  "dag-shortest": (input) => directedGraph(input, 2000, 4000, true, 1, 1000),
  "dijkstra": (input) => weightedSource(input, 0, 1000),
  "maze-distance": (input) => mazeInput(input),
  "min-effort": (input) => exactKeys(input, ["heights"]) ?? numberGrid(input.heights, 1, 100, 1, 100, 0, 1_000_000),
  "cheapest-flights": (input) => flightsInput(input),
  "network-delay": (input) => delayInput(input),
  "count-paths": (input) => undirectedGraph(input, 200, 4000, "roads", true, 1, 1000),
  "min-multiplications": (input) => multiplicationsInput(input),
  "bellman-ford": (input) => directedGraph(input, 200, 4000, true, -1000, 1000),
  "floyd-warshall": (input) => exactKeys(input, ["matrix"]) ?? floydMatrix(input.matrix),
  "smallest-city": (input) => cityInput(input),
  "prim-mst": (input) => undirectedGraph(input, 2000, 4000, "edges", true, 1, 1000),
  "disjoint-set": (input) => dsuInput(input),
  "kruskal-mst": (input) => undirectedGraph(input, 2000, 4000, "edges", true, 1, 1000),
  "connect-network": (input) => undirectedGraph(input, 2000, 4000, "connections"),
  "remove-stones": (input) => exactKeys(input, ["stones"]) ?? stoneList(input.stones),
  "accounts-merge": (input) => exactKeys(input, ["accounts"]) ?? accountList(input.accounts),
  "islands-online": (input) => islandsInput(input),
  "largest-island": (input) => exactKeys(input, ["grid"]) ?? zeroOneGrid(input.grid, 100),
  "swim-rising": (input) => exactKeys(input, ["grid"]) ?? distinctGrid(input.grid),
  "graph-bridges": (input) => undirectedGraph(input, 2000, 4000),
  "articulation-points": (input) => undirectedGraph(input, 2000, 4000),
  "kosaraju-scc": (input) => directedGraph(input, 2000, 4000, false),
  "frog-jump": (input) => exactKeys(input, ["heights"]) ?? intList(input.heights, 1, 100_000, 0, 10_000),
  "frog-jump-k": (input) =>
    exactKeys(input, ["heights", "k"]) ??
    intList(input.heights, 1, 10_000, 0, 10_000) ??
    (isInt(input.k, 1, 100) ? null : "k is out of range"),
  "ninja-training": (input) => exactKeys(input, ["points"]) ?? meritDays(input.points),
  "unique-paths": (input) =>
    exactKeys(input, ["m", "n"]) ?? (isInt(input.m, 1, 15) && isInt(input.n, 1, 15) ? null : "m or n is out of range"),
  "falling-path": (input) => exactKeys(input, ["grid"]) ?? squareGrid(input.grid, 100, -100, 100),
  "triangle-path": (input) => exactKeys(input, ["triangle"]) ?? triangleRows(input.triangle),
  "ninja-friends": (input) => exactKeys(input, ["grid"]) ?? numberGrid(input.grid, 1, 50, 1, 50, 0, 100),
  "subset-sum": (input) =>
    exactKeys(input, ["nums", "target"]) ??
    intList(input.nums, 1, 100, 1, 1000) ??
    (isInt(input.target, 0, 10_000) ? null : "target is out of range"),
  "equal-partition": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 200, 1, 100),
  "min-partition": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 100, 1, 1000),
  "count-partitions": (input) =>
    exactKeys(input, ["nums", "difference"]) ??
    intList(input.nums, 1, 100, 1, 1000) ??
    (isInt(input.difference, 0, 10_000) ? null : "difference is out of range"),
  "coin-change-ii": (input) =>
    exactKeys(input, ["coins", "amount"]) ??
    uniqueNumbers(input.coins, 1, 100, 1, 200) ??
    (isInt(input.amount, 0, 1000) ? null : "amount is out of range"),
  "target-sum": (input) =>
    exactKeys(input, ["nums", "target"]) ??
    intList(input.nums, 1, 20, 0, 1000) ??
    (isInt(input.target, -1000, 1000) ? null : "target is out of range"),
  "unbounded-knapsack": (input) => knapsackInput(input),
  "rod-cutting": (input) => exactKeys(input, ["price"]) ?? intList(input.price, 1, 1000, 1, 1000),
  "longest-common-subsequence": (input) => twoWords(input, "a", "b", 1, 500),
  "print-lcs": (input) => twoWords(input, "a", "b", 1, 500),
  "longest-common-substring": (input) => twoWords(input, "a", "b", 1, 500),
  "longest-palindromic-subsequence": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 1, 500, /^[a-z]+$/, "s"),
  "min-palindrome-insertions": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 1, 500, /^[a-z]+$/, "s"),
  "string-conversions": (input) => twoWords(input, "source", "target", 1, 500),
  "shortest-supersequence": (input) => twoWords(input, "a", "b", 1, 500),
  "distinct-subsequences": (input) => twoWords(input, "s", "t", 0, 200),
  "edit-distance": (input) => twoWords(input, "source", "target", 0, 500),
  "stock-profit": (input) => exactKeys(input, ["prices"]) ?? intList(input.prices, 1, 100_000, 0, 10_000),
  "stock-profit-ii": (input) => exactKeys(input, ["prices"]) ?? intList(input.prices, 1, 100_000, 0, 10_000),
  "stock-profit-iii": (input) => exactKeys(input, ["prices"]) ?? intList(input.prices, 1, 100_000, 0, 10_000),
  "stock-profit-iv": (input) =>
    exactKeys(input, ["k", "prices"]) ??
    intList(input.prices, 1, 1000, 0, 1000) ??
    (isInt(input.k, 0, 100) ? null : "k is out of range"),
  "stock-cooldown": (input) => exactKeys(input, ["prices"]) ?? intList(input.prices, 1, 5000, 0, 1000),
  "stock-fee": (input) =>
    exactKeys(input, ["prices", "fee"]) ??
    intList(input.prices, 1, 5000, 0, 5000) ??
    (isInt(input.fee, 0, 5000) ? null : "fee is out of range"),
  "print-lis": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 0, 200, -10_000, 10_000),
  "largest-divisible": (input) => exactKeys(input, ["nums"]) ?? uniqueNumbers(input.nums, 1, 200, 1, 100_000),
  "string-chain": (input) => exactKeys(input, ["words"]) ?? chainWords(input.words),
  "bitonic-subsequence": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 1000, 1, 10_000),
  "lis-count": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 0, 500, -10_000, 10_000),
  "matrix-chain": (input) => exactKeys(input, ["dims"]) ?? intList(input.dims, 2, 50, 1, 100),
  "matrix-chain-bottom": (input) => exactKeys(input, ["dims"]) ?? intList(input.dims, 2, 50, 1, 100),
  "stick-cuts": (input) => stickInput(input),
  "burst-balloons": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 100, 0, 100),
  "boolean-ways": (input) => exactKeys(input, ["expression"]) ?? booleanExpr(input.expression),
  "max-sum-partition": (input) => partitionLimit(input),
  "count-squares": (input) => exactKeys(input, ["grid"]) ?? zeroOneGrid(input.grid, 100),
  "trie-ops": (input) => exactKeys(input, ["commands"]) ?? trieCommands(input.commands, /^(insert|search|prefix) [a-z]{1,20}$/, false),
  "trie-advanced": (input) => exactKeys(input, ["commands"]) ?? trieCommands(input.commands, /^(insert|count|start|erase) [a-z]{1,20}$/, true),
  "longest-prefix-word": (input) => exactKeys(input, ["words"]) ?? wordList(input.words, 1, 1000, 1, 20),
  "distinct-substrings": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 1, 200, /^[a-z]+$/, "s"),
  "max-xor-pair": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 2, 1000, 0, 1_000_000_000),
  "max-xor-query": (input) => xorQueries(input),
  "count-digits": (input) => oneInt(input, "n", 0, 1_000_000_000),
  "reverse-number": (input) => oneInt(input, "n", -2_000_000_000, 2_000_000_000),
  "palindrome-number": (input) => oneInt(input, "n", -2_000_000_000, 2_000_000_000),
  "gcd-two": (input) => twoInts(input, "a", "b", 1, 1_000_000_000),
  "armstrong-number": (input) => oneInt(input, "n", 0, 1_000_000_000),
  "prime-check": (input) => oneInt(input, "n", 0, 1_000_000_000),
  "print-1-to-n": (input) => oneInt(input, "n", 1, 1000),
  "print-n-to-1": (input) => oneInt(input, "n", 1, 1000),
  "sum-first-n": (input) => oneInt(input, "n", 1, 100_000),
  "factorial-n": (input) => oneInt(input, "n", 0, 12),
  "reverse-array": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 0, 100_000),
  "fibonacci-number": (input) => oneInt(input, "n", 0, 40),
  "element-frequencies": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 100_000),
  "highest-occurring": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 100_000),
  "sum-k-any": (input) => listAndInt(input, "nums", "k", 1, 100_000, -1_000_000_000, 1_000_000_000, -1_000_000_000, 1_000_000_000),
  "max-sum-subarray": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 100_000),
  "pascal-triangle": (input) => oneInt(input, "n", 1, 30),
  "majority-element-ii": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 100_000),
  "four-sum": (input) => listAndInt(input, "nums", "target", 0, 200, -1_000_000_000, 1_000_000_000, -1_000_000_000, 1_000_000_000),
  "zero-sum-length": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 1, 100_000),
  "subarray-xor-k": (input) => listAndInt(input, "nums", "k", 1, 100_000, 0, 1_000_000_000, 0, 1_000_000_000),
  "merge-sorted-arrays": (input) => twoSortedLists(input, false),
  "count-inversions": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 0, 100_000),
  "reverse-pairs": (input) => exactKeys(input, ["nums"]) ?? intList(input.nums, 0, 100_000),
  "upper-bound": (input) => sortedWith(input, "values", "target", 0, 100_000, -1_000_000_000, 1_000_000_000, false, -1_000_000_000, 1_000_000_000),
  "count-occurrences": (input) => sortedWith(input, "values", "target", 0, 100_000, -1_000_000_000, 1_000_000_000, false, -1_000_000_000, 1_000_000_000),
  "rotation-count": (input) => exactKeys(input, ["values"]) ?? rotatedDistinct(input.values),
  "gas-stations": (input) => gasStations(input),
  "median-two-sorted": (input) => twoSortedLists(input, true),
  "search-matrix-ii": (input) => sortedMatrixQuery(input),
  "peak-element-ii": (input) => exactKeys(input, ["matrix"]) ?? peakGrid(input.matrix),
  "outer-parentheses": (input) => exactKeys(input, ["s"]) ?? validParens(input.s),
  "frequency-sort": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 1, 100_000, /^[a-z]+$/, "s"),
  "roman-integer": (input) => exactKeys(input, ["s"]) ?? romanNumeral(input.s),
  "count-k-substrings": (input) => stringAndInt(input, "s", "k", 1, 100_000, /^[a-z]+$/, 1, 26),
  "beauty-sum": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 1, 400, /^[a-z]+$/, "s"),
  "reverse-each-word": (input) => exactKeys(input, ["line"]) ?? bounded(input.line, 0, 10_000, /^[a-z ]*$/, "line"),
  "bracket-reversals": (input) => exactKeys(input, ["expression"]) ?? bounded(input.expression, 1, 100_000, /^[{}]+$/, "expression"),
  "count-and-say": (input) => oneInt(input, "n", 1, 30),
  "rabin-karp": (input) => twoLower(input, "text", "pattern", 0, 100_000, 1, 100_000),
  "z-function": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 1, 100_000, /^[a-z]+$/, "s"),
  "longest-happy-prefix": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 0, 100_000, /^[a-z]*$/, "s"),
  "palindromic-subsequences": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 1, 400, /^[a-z]+$/, "s"),
  "max-ones-iii": (input) => binaryLimit(input, "k", 0),
  "fruit-baskets": (input) => exactKeys(input, ["fruits"]) ?? intList(input.fruits, 1, 100_000, 0, 1_000_000_000),
  "binary-subarray-sum": (input) => binaryLimit(input, "goal", 0),
  "nice-subarrays": (input) => lengthLimit(input, "nums", "k", 1, 100_000, 0, 1_000_000_000, 0),
  "substrings-with-abc": (input) => exactKeys(input, ["s"]) ?? bounded(input.s, 1, 100_000, /^[abc]+$/, "s"),
  "card-points": (input) => lengthLimit(input, "points", "k", 1, 100_000, 0, 10_000, 0),
  "k-distinct-subarrays": (input) => lengthLimit(input, "nums", "k", 1, 100_000, 0, 1_000_000_000, 1),
  "window-subsequence": (input) => twoLower(input, "source", "target", 0, 5000, 1, 100),
};

function meritDays(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100_000) return "points are out of range";
  for (const day of value) {
    if (!Array.isArray(day) || day.length !== 3 || !day.every((merit) => isInt(merit, 0, 100))) return "each day needs three merits";
  }
  return null;
}

function squareGrid(value: unknown, max: number, min: number, maxValue: number): string | null {
  const grid = numberGrid(value, 1, max, 1, max, min, maxValue);
  if (grid) return grid;
  const rows = value as number[][];
  return rows.length === rows[0]!.length ? null : "grid must be square";
}

function triangleRows(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return "triangle size is out of range";
  for (let row = 0; row < value.length; row += 1) {
    const line = value[row];
    if (!Array.isArray(line) || line.length !== row + 1 || !line.every((cell) => isInt(cell, -1000, 1000))) return "triangle rows are invalid";
  }
  return null;
}

function uniqueNumbers(value: unknown, minLen: number, maxLen: number, min: number, max: number): string | null {
  const list = intList(value, minLen, maxLen, min, max);
  if (list) return list;
  return new Set(value as number[]).size === (value as number[]).length ? null : "values must be distinct";
}

function knapsackInput(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["weights", "values", "capacity"]);
  if (keys) return keys;
  const weights = intList(input.weights, 1, 100, 1, 1000);
  if (weights) return weights;
  const values = intList(input.values, (input.weights as number[]).length, (input.weights as number[]).length, 1, 1000);
  if (values) return "weights and values must be the same length";
  return isInt(input.capacity, 0, 1000) ? null : "capacity is out of range";
}

function twoWords(
  input: Record<string, unknown>,
  first: string,
  second: string,
  minLen: number,
  maxLen: number,
): string | null {
  const keys = exactKeys(input, [first, second]);
  if (keys) return keys;
  const pattern = /^[a-z]*$/;
  return bounded(input[first], minLen, maxLen, pattern, first) ?? bounded(input[second], minLen, maxLen, pattern, second);
}

function chainWords(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return "words are out of range";
  const seen = new Set<string>();
  for (const word of value) {
    const check = bounded(word, 1, 16, /^[a-z]+$/, "word");
    if (check) return check;
    if (seen.has(word)) return "words must be distinct";
    seen.add(word);
  }
  return null;
}

function stickInput(input: Record<string, unknown>): string | null {
  if (!isInt(input.n, 1, 1000)) return "n is out of range";
  const keys = exactKeys(input, ["n", "cuts"]);
  if (keys) return keys;
  const cuts = uniqueNumbers(input.cuts, 0, 100, 1, Math.max(1, input.n - 1));
  if (cuts) return cuts;
  if (input.n === 1 && (input.cuts as number[]).length > 0) return "a stick of length 1 has no cut position";
  return null;
}

function booleanExpr(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 1 || value.length > 100 || value.length % 2 === 0) return "expression length is invalid";
  return /^(T|F)([&|^](T|F))*$/.test(value) ? null : "expression is invalid";
}

function partitionLimit(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["nums", "k"]);
  if (keys) return keys;
  const nums = intList(input.nums, 1, 500, 0, 10_000);
  if (nums) return nums;
  return isInt(input.k, 1, (input.nums as number[]).length) ? null : "k is out of range";
}

function trieCommands(value: unknown, pattern: RegExp, erase: boolean): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 1000) return "commands are out of range";
  const counts = new Map<string, number>();
  for (const command of value) {
    if (typeof command !== "string" || !pattern.test(command)) return "a command is not allowed";
    const space = command.indexOf(" ");
    const kind = command.slice(0, space);
    const word = command.slice(space + 1);
    if (kind === "insert") counts.set(word, (counts.get(word) ?? 0) + 1);
    if (erase && kind === "erase") {
      const have = counts.get(word) ?? 0;
      if (have === 0) return "erase removes a word that is not present";
      counts.set(word, have - 1);
    }
  }
  return null;
}

function xorQueries(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["nums", "queries"]);
  if (keys) return keys;
  const nums = intList(input.nums, 1, 1000, 0, 1_000_000_000);
  if (nums) return nums;
  if (!Array.isArray(input.queries) || input.queries.length < 1 || input.queries.length > 1000) return "queries are out of range";
  for (const query of input.queries) {
    if (!Array.isArray(query) || query.length !== 2 || !query.every((item) => isInt(item, 0, 1_000_000_000))) {
      return "a query must be a pair of allowed integers";
    }
  }
  return null;
}

function oneInt(input: Record<string, unknown>, key: string, min: number, max: number): string | null {
  const keys = exactKeys(input, [key]);
  if (keys) return keys;
  return isInt(input[key], min, max) ? null : `${key} is out of range`;
}

function twoInts(input: Record<string, unknown>, first: string, second: string, min: number, max: number): string | null {
  const keys = exactKeys(input, [first, second]);
  if (keys) return keys;
  if (!isInt(input[first], min, max) || !isInt(input[second], min, max)) return "a number is out of range";
  return null;
}

function listAndInt(
  input: Record<string, unknown>,
  listKey: string,
  intKey: string,
  minLen: number,
  maxLen: number,
  min: number,
  max: number,
  intMin: number,
  intMax: number,
): string | null {
  const keys = exactKeys(input, [listKey, intKey]);
  if (keys) return keys;
  return intList(input[listKey], minLen, maxLen, min, max) ?? (isInt(input[intKey], intMin, intMax) ? null : `${intKey} is out of range`);
}

function lengthLimit(
  input: Record<string, unknown>,
  listKey: string,
  intKey: string,
  minLen: number,
  maxLen: number,
  min: number,
  max: number,
  intMin: number,
): string | null {
  const keys = exactKeys(input, [listKey, intKey]);
  if (keys) return keys;
  const list = intList(input[listKey], minLen, maxLen, min, max);
  if (list) return list;
  return isInt(input[intKey], intMin, (input[listKey] as number[]).length) ? null : `${intKey} is out of range`;
}

function binaryLimit(input: Record<string, unknown>, intKey: string, intMin: number): string | null {
  return lengthLimit(input, "nums", intKey, 1, 100_000, 0, 1, intMin);
}

function twoSortedLists(input: Record<string, unknown>, requireValue: boolean): string | null {
  const keys = exactKeys(input, ["first", "second"]);
  if (keys) return keys;
  const first = intList(input.first, 0, 100_000);
  if (first) return first;
  const second = intList(input.second, 0, 100_000);
  if (second) return second;
  if (requireValue && (input.first as number[]).length + (input.second as number[]).length < 1) return "the arrays cannot both be empty";
  return monotonic(input.first as number[], false) ?? monotonic(input.second as number[], false);
}

function rotatedDistinct(value: unknown): string | null {
  const list = intList(value, 1, 100_000);
  if (list) return list;
  const values = value as number[];
  const seen = new Set<number>();
  for (const item of values) {
    if (seen.has(item)) return "values must be distinct";
    seen.add(item);
  }
  let drops = 0;
  for (let index = 1; index < values.length; index += 1) if (values[index]! < values[index - 1]!) drops += 1;
  if (drops > 1) return "values must be a rotation of a sorted array";
  if (drops === 1 && values[values.length - 1]! > values[0]!) return "values must be a rotation of a sorted array";
  return null;
}

function gasStations(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["stations", "k"]);
  if (keys) return keys;
  const stations = intList(input.stations, 2, 100_000, 0, 1_000_000_000);
  if (stations) return stations;
  if (!isInt(input.k, 0, 1_000_000_000)) return "k is out of range";
  return monotonic(input.stations as number[], true);
}

function sortedMatrixQuery(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["matrix", "target"]);
  if (keys) return keys;
  if (!isInt(input.target)) return "target is out of range";
  const grid = readMatrix(input.matrix, 100, -1_000_000_000, 1_000_000_000);
  if (typeof grid === "string") return grid;
  const rows = rowsSorted(grid);
  if (rows) return rows;
  for (let col = 0; col < grid[0]!.length; col += 1) {
    for (let row = 1; row < grid.length; row += 1) {
      if (grid[row]![col]! < grid[row - 1]![col]!) return "each column must be sorted";
    }
  }
  return null;
}

function peakGrid(value: unknown): string | null {
  const grid = readMatrix(value, 200, -1_000_000_000, 1_000_000_000);
  if (typeof grid === "string") return grid;
  const seen = new Set<number>();
  for (const row of grid) {
    for (const item of row) {
      if (seen.has(item)) return "grid values must be distinct";
      seen.add(item);
    }
  }
  return null;
}

function validParens(value: unknown): string | null {
  const check = bounded(value, 0, 100_000, /^[()]*$/, "s");
  if (check) return check;
  let balance = 0;
  for (const ch of value as string) {
    balance += ch === "(" ? 1 : -1;
    if (balance < 0) return "parentheses are not balanced";
  }
  return balance === 0 ? null : "parentheses are not balanced";
}

function romanNumeral(value: unknown): string | null {
  return bounded(value, 1, 15, /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/, "s");
}

function stringAndInt(
  input: Record<string, unknown>,
  textKey: string,
  intKey: string,
  minLen: number,
  maxLen: number,
  pattern: RegExp,
  intMin: number,
  intMax: number,
): string | null {
  const keys = exactKeys(input, [textKey, intKey]);
  if (keys) return keys;
  return bounded(input[textKey], minLen, maxLen, pattern, textKey) ?? (isInt(input[intKey], intMin, intMax) ? null : `${intKey} is out of range`);
}

function commandList(commands: unknown, pattern: RegExp): string | null {
  if (!Array.isArray(commands) || commands.length > 1000) return "commands are out of range";
  for (const command of commands) {
    if (typeof command !== "string" || !pattern.test(command)) return "a command is not allowed";
  }
  return null;
}

function stackCommands(commands: unknown, capacity: number | null): string | null {
  const shape = commandList(commands, /^(push -?\d+|pop|top|empty)$/);
  if (shape) return shape;
  let size = 0;
  for (const command of commands as string[]) {
    if (command.startsWith("push ")) {
      if (!isInt(Number(command.slice(5)))) return "a pushed value is out of range";
      if (capacity === null || size < capacity) size += 1;
    } else if (command === "pop" || command === "top") {
      if (size === 0) return "pop and top require a non-empty stack";
      if (command === "pop") size -= 1;
    }
  }
  return null;
}

function queueCommands(commands: unknown, capacity: number | null): string | null {
  const shape = commandList(commands, /^(push -?\d+|pop|front|empty)$/);
  if (shape) return shape;
  let size = 0;
  for (const command of commands as string[]) {
    if (command.startsWith("push ")) {
      if (!isInt(Number(command.slice(5)))) return "a pushed value is out of range";
      if (capacity === null || size < capacity) size += 1;
    } else if (command === "pop" || command === "front") {
      if (size === 0) return "pop and front require a non-empty queue";
      if (command === "pop") size -= 1;
    }
  }
  return null;
}

function fixedBuffer(
  input: Record<string, unknown>,
  check: (commands: unknown, capacity: number | null) => string | null,
): string | null {
  if (exactKeys(input, ["capacity", "commands"])) return exactKeys(input, ["capacity", "commands"]);
  if (!isInt(input.capacity, 1, 1000)) return "capacity is out of range";
  return check(input.commands, input.capacity);
}

function minCommands(commands: unknown): string | null {
  const shape = commandList(commands, /^(push -?\d+|pop|top|getMin)$/);
  if (shape) return shape;
  let size = 0;
  for (const command of commands as string[]) {
    if (command.startsWith("push ")) {
      if (!isInt(Number(command.slice(5)))) return "a pushed value is out of range";
      size += 1;
    } else if (command === "pop" || command === "top" || command === "getMin") {
      if (size === 0) return "pop, top, and getMin require a non-empty stack";
      if (command === "pop") size -= 1;
    }
  }
  return null;
}

function infixExpression(value: unknown): string | null {
  const shape = bounded(value, 1, 200, /^[a-z0-9+\-*/^()]+$/, "expression");
  if (shape) return shape;
  let expectOperand = true;
  let balance = 0;
  for (const ch of value as string) {
    if (/[a-z0-9]/.test(ch)) {
      if (!expectOperand) return "the expression is not valid infix";
      expectOperand = false;
    } else if (ch === "(") {
      if (!expectOperand) return "the expression is not valid infix";
      balance += 1;
    } else if (ch === ")") {
      if (expectOperand || balance === 0) return "the expression is not valid infix";
      balance -= 1;
    } else if (expectOperand) return "the expression is not valid infix";
    else expectOperand = true;
  }
  return !expectOperand && balance === 0 ? null : "the expression is not valid infix";
}

function prefixExpression(value: unknown): string | null {
  const shape = bounded(value, 1, 200, /^[a-z0-9+\-*/^]+$/, "expression");
  if (shape) return shape;
  let need = 1;
  for (const ch of value as string) {
    if (need === 0) return "the expression is not valid prefix";
    need += /[a-z0-9]/.test(ch) ? -1 : 1;
  }
  return need === 0 ? null : "the expression is not valid prefix";
}

function postfixExpression(value: unknown): string | null {
  const shape = bounded(value, 1, 200, /^[a-z0-9+\-*/^]+$/, "expression");
  if (shape) return shape;
  let count = 0;
  for (const ch of value as string) {
    if (/[a-z0-9]/.test(ch)) count += 1;
    else if (count < 2) return "the expression is not valid postfix";
    else count -= 1;
  }
  return count === 1 ? null : "the expression is not valid postfix";
}

function greaterQueries(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["nums", "queries"])) return exactKeys(input, ["nums", "queries"]);
  const nums = intList(input.nums, 1, 2000);
  if (nums) return nums;
  return intList(input.queries, 1, 2000, 0, (input.nums as number[]).length - 1);
}

function asteroidList(value: unknown): string | null {
  const list = intList(value, 1, 10_000, -1000, 1000);
  if (list) return list;
  return (value as number[]).some((item) => item === 0) ? "an asteroid size cannot be 0" : null;
}

function trimDigits(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["num", "k"])) return exactKeys(input, ["num", "k"]);
  const num = bounded(input.num, 1, 4000, /^(0|[1-9][0-9]*)$/, "num");
  if (num) return num;
  return isInt(input.k, 0, (input.num as string).length) ? null : "k is out of range";
}

function binaryGrid(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 200) return "grid size is out of range";
  const width = typeof value[0] === "string" ? value[0].length : 0;
  if (width < 1 || width > 200) return "grid width is out of range";
  for (const row of value) {
    if (typeof row !== "string" || row.length !== width || [...row].some((cell) => cell !== "0" && cell !== "1")) {
      return "grid rows must be equal-length strings of 0 and 1";
    }
  }
  return null;
}

function windowMax(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["nums", "k"])) return exactKeys(input, ["nums", "k"]);
  const nums = intList(input.nums, 1, 10_000);
  if (nums) return nums;
  return isInt(input.k, 1, (input.nums as number[]).length) ? null : "k is out of range";
}

function knowsMatrix(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return "the party size is out of range";
  const size = value.length;
  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    const row = value[rowIndex];
    if (!Array.isArray(row) || row.length !== size) return "knows must be a square matrix";
    for (let col = 0; col < size; col += 1) {
      if (row[col] !== 0 && row[col] !== 1) return "knows entries must be 0 or 1";
      if (rowIndex === col && row[col] !== 0) return "nobody is recorded as knowing themselves";
    }
  }
  return null;
}

function cacheCommands(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["capacity", "commands"])) return exactKeys(input, ["capacity", "commands"]);
  if (!isInt(input.capacity, 0, 1000)) return "capacity is out of range";
  const shape = commandList(input.commands, /^(put -?\d+ -?\d+|get -?\d+)$/);
  if (shape) return shape;
  for (const command of input.commands as string[]) {
    const parts = command.split(" ");
    const key = Number(parts[1]);
    if (!isInt(key, 0, 1_000_000_000)) return "a key is out of range";
    if (parts[0] === "put" && !isInt(Number(parts[2]))) return "a value is out of range";
  }
  return null;
}

function heapCommands(commands: unknown): string | null {
  const shape = commandList(commands, /^(insert -?\d+|extract|peek)$/);
  if (shape) return shape;
  let size = 0;
  for (const command of commands as string[]) {
    if (command.startsWith("insert ")) {
      if (!isInt(Number(command.slice(7)))) return "an inserted value is out of range";
      size += 1;
    } else if (size === 0) return "extract and peek require a non-empty heap";
    else if (command === "extract") size -= 1;
  }
  return null;
}

function minHeapArray(value: unknown): string | null {
  const list = intList(value, 0, 10_000);
  if (list) return list;
  const heap = value as number[];
  for (let index = 0; index < heap.length; index += 1) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    if ((left < heap.length && heap[left]! < heap[index]!) || (right < heap.length && heap[right]! < heap[index]!)) {
      return "the array is not a min heap";
    }
  }
  return null;
}

function kthPick(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["nums", "k"])) return exactKeys(input, ["nums", "k"]);
  const nums = intList(input.nums, 1, 10_000);
  if (nums) return nums;
  return isInt(input.k, 1, (input.nums as number[]).length) ? null : "k is out of range";
}

function nearlySorted(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["nums", "k"])) return exactKeys(input, ["nums", "k"]);
  const nums = intList(input.nums, 1, 10_000);
  if (nums) return nums;
  return isInt(input.k, 0, (input.nums as number[]).length) ? null : "k is out of range";
}

function sortedLists(value: unknown): string | null {
  if (!Array.isArray(value) || value.length > 100) return "lists are out of range";
  let total = 0;
  for (const row of value) {
    const list = intList(row, 0, 500, -10_000, 10_000);
    if (list) return list;
    const nums = row as number[];
    total += nums.length;
    for (let index = 1; index < nums.length; index += 1) {
      if (nums[index]! < nums[index - 1]!) return "each list must be sorted";
    }
  }
  return total > 10_000 ? "too many nodes" : null;
}

function straightHand(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["hand", "groupSize"])) return exactKeys(input, ["hand", "groupSize"]);
  const hand = intList(input.hand, 1, 10_000);
  if (hand) return hand;
  return isInt(input.groupSize, 1, (input.hand as number[]).length) ? null : "groupSize is out of range";
}

function tweetCommands(commands: unknown): string | null {
  const shape = commandList(commands, /^(post \d+ \d+|follow \d+ \d+|unfollow \d+ \d+|feed \d+)$/);
  if (shape) return shape;
  for (const command of commands as string[]) {
    const parts = command.split(" ").map(Number);
    if (command.startsWith("post ")) {
      if (!isInt(parts[1], 1, 500) || !isInt(parts[2], 1, 1_000_000_000)) return "a user or tweet id is out of range";
    } else if (command.startsWith("feed ")) {
      if (!isInt(parts[1], 1, 500)) return "a user id is out of range";
    } else if (!isInt(parts[1], 1, 500) || !isInt(parts[2], 1, 500)) return "a user id is out of range";
  }
  return null;
}

function kthStream(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["nums", "k", "adds"])) return exactKeys(input, ["nums", "k", "adds"]);
  const nums = intList(input.nums, 1, 10_000);
  const adds = intList(input.adds, 0, 10_000);
  if (nums || adds) return nums ?? adds;
  return isInt(input.k, 1, (input.nums as number[]).length) ? null : "k is out of range";
}

function pairSums(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["left", "right", "k"])) return exactKeys(input, ["left", "right", "k"]);
  const left = intList(input.left, 1, 1000);
  const right = intList(input.right, 1, 1000);
  if (left || right) return left ?? right;
  if ((input.left as number[]).length !== (input.right as number[]).length) return "the arrays must have the same length";
  return isInt(input.k, 1, (input.left as number[]).length) ? null : "k is out of range";
}

function medianCommands(commands: unknown): string | null {
  if (!Array.isArray(commands) || commands.length < 1 || commands.length > 10_000) return "commands are out of range";
  let size = 0;
  for (const command of commands) {
    if (typeof command !== "string" || !/^(add -?\d+|median)$/.test(command)) return "a command is not allowed";
    if (command.startsWith("add ")) {
      if (!isInt(Number(command.slice(4)))) return "an added value is out of range";
      size += 1;
    } else if (size === 0) return "median requires at least one value";
  }
  return null;
}

function frequentValues(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["nums", "k"])) return exactKeys(input, ["nums", "k"]);
  const nums = intList(input.nums, 1, 10_000);
  if (nums) return nums;
  const distinct = new Set(input.nums as number[]).size;
  return isInt(input.k, 1, distinct) ? null : "k is out of range";
}

function cookieBags(input: Record<string, unknown>): string | null {
  return (
    exactKeys(input, ["children", "cookies"]) ??
    intList(input.children, 0, 10_000, 1, 1_000_000_000) ??
    intList(input.cookies, 0, 10_000, 1, 1_000_000_000)
  );
}

function fractionItems(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["items", "capacity"]);
  if (keys) return keys;
  if (!isInt(input.capacity, 0, 1_000_000_000)) return "capacity is out of range";
  if (!Array.isArray(input.items) || input.items.length > 1000) return "items are out of range";
  for (const row of input.items) {
    if (!Array.isArray(row) || row.length !== 2 || !isInt(row[0], 1, 1_000_000) || !isInt(row[1], 1, 1_000_000)) {
      return "each item must be [value, weight]";
    }
  }
  return null;
}

function lemonadeBills(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["bills"]);
  if (keys) return keys;
  if (!Array.isArray(input.bills) || input.bills.length > 10_000) return "bills are out of range";
  if (!input.bills.every((bill) => bill === 5 || bill === 10 || bill === 20)) return "a bill must be 5, 10, or 20";
  return null;
}

function spanRows(value: unknown, minLen: number, maxLen: number, openEnd: boolean): string | null {
  if (!Array.isArray(value) || value.length < minLen || value.length > maxLen) return "intervals are out of range";
  for (const row of value) {
    if (!Array.isArray(row) || row.length !== 2 || !isInt(row[0], 0, 1_000_000_000) || !isInt(row[1], 0, 1_000_000_000)) {
      return "each interval must be a pair of integers";
    }
    if (openEnd ? row[0] >= row[1] : row[0] > row[1]) return "an interval has an invalid range";
  }
  return null;
}

function platformTimes(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["arrival", "departure"]);
  if (keys) return keys;
  const arrival = intList(input.arrival, 1, 10_000, 0, 1_000_000_000);
  const departure = intList(input.departure, 1, 10_000, 0, 1_000_000_000);
  if (arrival || departure) return arrival ?? departure;
  const arrivals = input.arrival as number[];
  const departures = input.departure as number[];
  if (arrivals.length !== departures.length) return "arrival and departure must have the same length";
  if (arrivals.some((time, index) => time > departures[index]!)) return "a train departs before it arrives";
  return null;
}

function jobRows(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 1000) return "jobs are out of range";
  for (const row of value) {
    if (!Array.isArray(row) || row.length !== 2 || !isInt(row[0], 1, 1000) || !isInt(row[1], 1, 100_000)) {
      return "each job must be [deadline, profit]";
    }
  }
  return null;
}

function pageRefs(input: Record<string, unknown>): string | null {
  return (
    exactKeys(input, ["pages", "capacity"]) ??
    intList(input.pages, 1, 10_000, 0, 1_000_000_000) ??
    (isInt(input.capacity, 1, 1000) ? null : "capacity is out of range")
  );
}

function insertSpans(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["intervals", "newInterval"]);
  if (keys) return keys;
  const spans = spanRows(input.intervals, 0, 10_000, false);
  if (spans) return spans;
  if (!Array.isArray(input.newInterval) || input.newInterval.length !== 2) return "newInterval must be a pair";
  const [start, end] = input.newInterval;
  if (!isInt(start, 0, 1_000_000_000) || !isInt(end, 0, 1_000_000_000) || start > end) return "newInterval is out of range";
  let previous = -1;
  for (const row of input.intervals as number[][]) {
    if (row[0]! <= previous) return "intervals must be sorted and strictly disjoint";
    previous = row[1]!;
  }
  return null;
}

function occupiedTree(value: unknown): string | null {
  const message = levelOrder(value);
  if (message) return message;
  if (!Array.isArray(value) || value.length === 0 || value[0] === null) return "the tree must contain a node";
  return null;
}

function treeValues(value: unknown): number[] | string {
  const message = levelOrder(value);
  if (message) return message;
  const nums = (value as (number | null)[]).filter((item): item is number => item !== null);
  if (new Set(nums).size !== nums.length) return "node values must be unique";
  if (nums.length === 0) return "the tree must contain a node";
  return nums;
}

function ancestorQuery(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["root", "p", "q"]);
  if (keys) return keys;
  const values = treeValues(input.root);
  if (typeof values === "string") return values;
  if (!isInt(input.p, -10_000, 10_000) || !isInt(input.q, -10_000, 10_000)) return "targets are out of range";
  if (!values.includes(input.p) || !values.includes(input.q)) return "both targets must exist";
  return null;
}

function targetQuery(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["root", "target"]);
  if (keys) return keys;
  const values = treeValues(input.root);
  if (typeof values === "string") return values;
  if (!isInt(input.target, -10_000, 10_000) || !values.includes(input.target)) return "target must be a node value";
  return null;
}

function distanceQuery(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["root", "target", "k"]);
  if (keys) return keys;
  const values = treeValues(input.root);
  if (typeof values === "string") return values;
  if (!isInt(input.target, -10_000, 10_000) || !values.includes(input.target)) return "target must be a node value";
  return isInt(input.k, 0, 2000) ? null : "k is out of range";
}

function completeLevel(value: unknown): string | null {
  const message = levelOrder(value);
  if (message) return message;
  const nodes = value as (number | null)[];
  if (nodes.length === 0 || nodes[0] === null) return nodes.every((item) => item === null) ? null : "a complete tree cannot start with null";
  let gap = false;
  let child = 1;
  for (let parent = 0; child < nodes.length; parent++) {
    if (nodes[parent] === null) return "a null node cannot have children in the encoding";
    for (let side = 0; side < 2 && child < nodes.length; side++) {
      if (nodes[child] === null) gap = true;
      else if (gap) return "the tree is not complete";
      child++;
    }
  }
  return null;
}

function traversalPair(input: Record<string, unknown>, leftKey: string, rightKey: string): string | null {
  const keys = exactKeys(input, [leftKey, rightKey]);
  if (keys) return keys;
  const left = intList(input[leftKey], 0, 2000, -10_000, 10_000);
  const right = intList(input[rightKey], 0, 2000, -10_000, 10_000);
  if (left || right) return left ?? right;
  const a = input[leftKey] as number[];
  const b = input[rightKey] as number[];
  if (a.length !== b.length) return "the traversals must have the same length";
  if (new Set(a).size !== a.length) return "values must be unique";
  const sortKey = (values: number[]) => [...values].sort((x, y) => x - y).join(",");
  return sortKey(a) === sortKey(b) ? null : "the traversals must contain the same values";
}

function serialText(value: unknown): string | null {
  if (typeof value !== "string") return "data must be a string";
  if (value.length > 20_000) return "data is too long";
  if (value === "") return null;
  if (!/^(?:-?\d+|null)(?:,(?:-?\d+|null))*$/.test(value)) return "data is not a level-order encoding";
  const parts = value.split(",");
  if (parts.length > 2000) return "tree is too large";
  if (parts[0] === "null") return "the root cannot be null unless the tree is empty";
  if (parts.some((part) => part !== "null" && !isInt(Number(part), -10_000, 10_000))) return "a node value is out of range";
  return null;
}

type BstShape = { val: number; left: BstShape | null; right: BstShape | null };

function bstShape(nodes: (number | null)[]): BstShape | null {
  if (nodes.length === 0 || nodes[0] === null) return null;
  const root: BstShape = { val: nodes[0], left: null, right: null };
  const queue: BstShape[] = [root];
  let index = 1;
  while (queue.length > 0 && index < nodes.length) {
    const node = queue.shift()!;
    if (index < nodes.length && nodes[index] !== null) {
      node.left = { val: nodes[index] as number, left: null, right: null };
      queue.push(node.left);
    }
    index += 1;
    if (index < nodes.length && nodes[index] !== null) {
      node.right = { val: nodes[index] as number, left: null, right: null };
      queue.push(node.right);
    }
    index += 1;
  }
  return root;
}

function bstBounds(node: BstShape | null, low: number, high: number): boolean {
  if (!node) return true;
  if (node.val <= low || node.val >= high) return false;
  return bstBounds(node.left, low, node.val) && bstBounds(node.right, node.val, high);
}

function requireBst(value: unknown, minNodes: number): string | null {
  const message = levelOrder(value);
  if (message) return message;
  const nodes = value as (number | null)[];
  if (nodes.some((item) => item !== null && (item < 0 || item > 10_000))) return "a node value is out of range";
  const count = nodes.filter((item) => item !== null).length;
  if (count < minNodes) return "the tree must contain a node";
  return bstBounds(bstShape(nodes), -1, 10_001) ? null : "the tree is not a binary search tree";
}

function bstKey(input: Record<string, unknown>, minNodes: number): string | null {
  return exactKeys(input, ["root", "key"]) ?? requireBst(input.root, minNodes) ?? (isInt(input.key, 0, 10_000) ? null : "key is out of range");
}

function kthBstInput(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["root", "k"]);
  if (keys) return keys;
  const tree = requireBst(input.root, 1);
  if (tree) return tree;
  const count = (input.root as (number | null)[]).filter((item) => item !== null).length;
  return isInt(input.k, 1, count) ? null : "k must be from 1 to the number of nodes";
}

function lcaBstInput(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["root", "p", "q"]);
  if (keys) return keys;
  const tree = requireBst(input.root, 1);
  if (tree) return tree;
  if (!isInt(input.p, 0, 10_000) || !isInt(input.q, 0, 10_000)) return "targets are out of range";
  const values = (input.root as (number | null)[]).filter((item): item is number => item !== null);
  return values.includes(input.p) && values.includes(input.q) ? null : "both targets must exist";
}

function preorderBst(value: unknown): string | null {
  const message = intList(value, 0, 2000, 0, 10_000);
  if (message) return message;
  const nums = value as number[];
  if (new Set(nums).size !== nums.length) return "values must be unique";
  let index = 0;
  const walk = (low: number, high: number) => {
    if (index >= nums.length || nums[index]! <= low || nums[index]! >= high) return;
    const current = nums[index]!;
    index += 1;
    walk(low, current);
    walk(current, high);
  };
  walk(-1, 10_001);
  return index === nums.length ? null : "preorder is not a binary search tree";
}

function bstInorder(node: BstShape | null, out: number[]) {
  if (!node) return;
  bstInorder(node.left, out);
  out.push(node.val);
  bstInorder(node.right, out);
}

function repairedBst(value: unknown): string | null {
  const message = levelOrder(value);
  if (message) return message;
  const nodes = value as (number | null)[];
  if (nodes.filter((item) => item !== null).length < 2) return "the tree must contain two nodes";
  const order: number[] = [];
  bstInorder(bstShape(nodes), order);
  if (new Set(order).size !== order.length) return "node values must be unique";
  let first: number | null = null;
  let second: number | null = null;
  let previous: number | null = null;
  for (const current of order) {
    if (previous !== null && current < previous) {
      if (first === null) first = previous;
      second = current;
    }
    previous = current;
  }
  if (first === null || second === null) return "the tree must have exactly two swapped values";
  const fixed = order.map((item) => (item === first ? second : item === second ? first : item));
  for (let index = 1; index < fixed.length; index += 1) {
    if (fixed[index]! <= fixed[index - 1]!) return "swapping two values does not repair the tree";
  }
  return null;
}

function numberGrid(
  value: unknown,
  minRows: number,
  maxRows: number,
  minCols: number,
  maxCols: number,
  min: number,
  max: number,
): string | null {
  if (!Array.isArray(value) || value.length < minRows || value.length > maxRows) return "grid size is out of range";
  const width = Array.isArray(value[0]) ? value[0].length : 0;
  if (width < minCols || width > maxCols) return "grid width is out of range";
  for (const row of value) {
    if (!Array.isArray(row) || row.length !== width || !row.every((cell) => isInt(cell, min, max))) return "grid values are out of range";
  }
  return null;
}

function zeroOneGrid(value: unknown, max: number): string | null {
  return numberGrid(value, 1, max, 1, max, 0, 1);
}

function hasOne(value: unknown): string | null {
  return (value as number[][]).some((row) => row.includes(1)) ? null : "the grid must contain a 1";
}

function charGrid(value: unknown, max: number, pattern: RegExp): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > max) return "grid size is out of range";
  const width = typeof value[0] === "string" ? value[0].length : 0;
  if (width < 1 || width > max) return "grid width is out of range";
  for (const row of value) {
    if (typeof row !== "string" || row.length !== width || ![...row].every((ch) => pattern.test(ch))) return "grid characters are not allowed";
  }
  return null;
}

function edgeBook(
  value: unknown,
  n: number,
  maxEdges: number,
  directed: boolean,
  weighted: boolean,
  minW: number,
  maxW: number,
): string | null {
  if (!Array.isArray(value) || value.length > maxEdges) return "too many edges";
  const seen = new Set<string>();
  for (const edge of value) {
    if (!Array.isArray(edge) || edge.length !== (weighted ? 3 : 2)) return "an edge has the wrong shape";
    const u = edge[0];
    const v = edge[1];
    if (!isInt(u, 0, n - 1) || !isInt(v, 0, n - 1) || u === v) return "an edge endpoint is invalid";
    if (weighted && !isInt(edge[2], minW, maxW)) return "an edge weight is out of range";
    const key = directed ? `${u},${v}` : `${Math.min(u, v)},${Math.max(u, v)}`;
    if (seen.has(key)) return "edges must be unique";
    seen.add(key);
  }
  return null;
}

function undirectedGraph(
  input: Record<string, unknown>,
  maxN: number,
  maxEdges: number,
  key = "edges",
  weighted = false,
  minW = 1,
  maxW = 1000,
): string | null {
  if (!isInt(input.n, 1, maxN)) return "n is out of range";
  return exactKeys(input, ["n", key]) ?? edgeBook(input[key], input.n, maxEdges, false, weighted, minW, maxW);
}

function directedGraph(
  input: Record<string, unknown>,
  maxN: number,
  maxEdges: number,
  weighted: boolean,
  minW = 1,
  maxW = 1000,
): string | null {
  if (!isInt(input.n, 1, maxN)) return "n is out of range";
  return exactKeys(input, ["n", "edges"]) ?? edgeBook(input.edges, input.n, maxEdges, true, weighted, minW, maxW);
}

function provinceMatrix(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 300) return "province matrix size is out of range";
  const n = value.length;
  for (let row = 0; row < n; row += 1) {
    const line = value[row];
    if (!Array.isArray(line) || line.length !== n) return "province matrix must be square";
    for (let col = 0; col < n; col += 1) {
      if (line[col] !== 0 && line[col] !== 1) return "province links must be 0 or 1";
      if (row === col && line[col] !== 1) return "a city must connect to itself";
      const other = value[col];
      if (!Array.isArray(other) || other[row] !== line[col]) return "province links must be symmetric";
    }
  }
  return null;
}

function floodFillInput(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["image", "sr", "sc", "color"]);
  if (keys) return keys;
  const grid = numberGrid(input.image, 1, 50, 1, 50, 0, 9);
  if (grid) return grid;
  const image = input.image as number[][];
  if (!isInt(input.color, 0, 9)) return "color is out of range";
  if (!isInt(input.sr, 0, image.length - 1) || !isInt(input.sc, 0, image[0]!.length - 1)) return "the start cell is outside the image";
  return null;
}

function wordLadderInput(input: Record<string, unknown>, maxWords: number, maxLen: number): string | null {
  const keys = exactKeys(input, ["beginWord", "endWord", "wordList"]);
  if (keys) return keys;
  const begin = bounded(input.beginWord, 1, maxLen, /^[a-z]+$/, "beginWord");
  if (begin) return begin;
  const end = bounded(input.endWord, 1, maxLen, /^[a-z]+$/, "endWord");
  if (end) return end;
  if ((input.beginWord as string).length !== (input.endWord as string).length) return "the words must be the same length";
  if (!Array.isArray(input.wordList) || input.wordList.length < 1 || input.wordList.length > maxWords) return "word list size is out of range";
  const length = (input.beginWord as string).length;
  const seen = new Set<string>();
  for (const word of input.wordList) {
    const check = bounded(word, length, length, /^[a-z]+$/, "word");
    if (check) return check;
    if (seen.has(word)) return "word list entries must be unique";
    seen.add(word);
  }
  return null;
}

function coursePlan(input: Record<string, unknown>): string | null {
  if (!isInt(input.numCourses, 1, 2000)) return "numCourses is out of range";
  return exactKeys(input, ["numCourses", "prerequisites"]) ?? edgeBook(input.prerequisites, input.numCourses, 4000, true, false, 0, 0);
}

function safeGraph(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 1000) return "graph size is out of range";
  const n = value.length;
  for (const row of value) {
    if (!Array.isArray(row)) return "each node needs an adjacency list";
    const seen = new Set<number>();
    for (const next of row) {
      if (!isInt(next, 0, n - 1)) return "an outgoing node is out of range";
      if (seen.has(next)) return "outgoing edges must be unique";
      seen.add(next);
    }
  }
  return null;
}

function weightedSource(input: Record<string, unknown>, minW: number, maxW: number): string | null {
  if (!isInt(input.n, 1, 2000)) return "n is out of range";
  if (!isInt(input.source, 0, input.n - 1)) return "source is out of range";
  return exactKeys(input, ["n", "edges", "source"]) ?? edgeBook(input.edges, input.n, 4000, true, true, minW, maxW);
}

function pointIn(value: unknown, grid: number[][], label: string): string | null {
  if (!Array.isArray(value) || value.length !== 2 || !isInt(value[0], 0, grid.length - 1) || !isInt(value[1], 0, grid[0]!.length - 1)) {
    return `${label} is outside the grid`;
  }
  return null;
}

function mazeInput(input: Record<string, unknown>): string | null {
  const keys = exactKeys(input, ["grid", "start", "end"]);
  if (keys) return keys;
  const grid = zeroOneGrid(input.grid, 100);
  if (grid) return grid;
  const cells = input.grid as number[][];
  return pointIn(input.start, cells, "start") ?? pointIn(input.end, cells, "end");
}

function flightsInput(input: Record<string, unknown>): string | null {
  if (!isInt(input.n, 1, 100)) return "n is out of range";
  if (!isInt(input.src, 0, input.n - 1) || !isInt(input.dst, 0, input.n - 1) || input.src === input.dst) return "src and dst must be different cities";
  if (!isInt(input.k, 0, input.n - 1)) return "k is out of range";
  return exactKeys(input, ["n", "flights", "src", "dst", "k"]) ?? edgeBook(input.flights, input.n, 1000, true, true, 1, 10_000);
}

function delayInput(input: Record<string, unknown>): string | null {
  if (!isInt(input.n, 1, 100)) return "n is out of range";
  if (!isInt(input.k, 1, input.n)) return "k is out of range";
  const keys = exactKeys(input, ["times", "n", "k"]);
  if (keys) return keys;
  if (!Array.isArray(input.times) || input.times.length > 2000) return "too many signals";
  const seen = new Set<string>();
  for (const edge of input.times) {
    if (!Array.isArray(edge) || edge.length !== 3) return "a signal has the wrong shape";
    const u = edge[0];
    const v = edge[1];
    if (!isInt(u, 1, input.n) || !isInt(v, 1, input.n) || u === v) return "a signal endpoint is invalid";
    if (!isInt(edge[2], 1, 100)) return "a signal time is out of range";
    const key = `${u},${v}`;
    if (seen.has(key)) return "signals must be unique";
    seen.add(key);
  }
  return null;
}

function multiplicationsInput(input: Record<string, unknown>): string | null {
  return (
    exactKeys(input, ["start", "end", "arr"]) ??
    (isInt(input.start, 0, 99_999) && isInt(input.end, 0, 99_999) ? null : "start or end is out of range") ??
    intList(input.arr, 1, 20, 1, 10_000)
  );
}

function floydMatrix(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) return "matrix size is out of range";
  const n = value.length;
  for (let row = 0; row < n; row += 1) {
    const line = value[row];
    if (!Array.isArray(line) || line.length !== n) return "matrix must be square";
    for (let col = 0; col < n; col += 1) {
      const cell = line[col];
      if (row === col) {
        if (cell !== 0) return "the diagonal must be 0";
      } else if (cell !== -1 && !isInt(cell, 0, 1000)) return "a matrix weight is out of range";
    }
  }
  return null;
}

function cityInput(input: Record<string, unknown>): string | null {
  if (!isInt(input.n, 1, 50)) return "n is out of range";
  if (!isInt(input.distanceThreshold, 1, 10_000)) return "distanceThreshold is out of range";
  return exactKeys(input, ["n", "edges", "distanceThreshold"]) ?? edgeBook(input.edges, input.n, 1000, false, true, 1, 10_000);
}

function dsuInput(input: Record<string, unknown>): string | null {
  if (!isInt(input.n, 1, 1000)) return "n is out of range";
  const keys = exactKeys(input, ["n", "commands"]);
  if (keys) return keys;
  if (!Array.isArray(input.commands) || input.commands.length < 1 || input.commands.length > 1000) return "commands are out of range";
  for (const command of input.commands) {
    if (typeof command !== "string") return "a command is not allowed";
    const union = /^union (\d+) (\d+)$/.exec(command);
    const find = /^find (\d+)$/.exec(command);
    const indexes = union ? [Number(union[1]), Number(union[2])] : find ? [Number(find[1])] : null;
    if (!indexes || indexes.some((index) => !isInt(index, 0, input.n - 1))) return "a command index is out of range";
  }
  return null;
}

function stoneList(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 1000) return "stones are out of range";
  const seen = new Set<string>();
  for (const stone of value) {
    if (!Array.isArray(stone) || stone.length !== 2 || !isInt(stone[0], 0, 10_000) || !isInt(stone[1], 0, 10_000)) return "a stone cell is invalid";
    const key = `${stone[0]},${stone[1]}`;
    if (seen.has(key)) return "stone cells must be unique";
    seen.add(key);
  }
  return null;
}

function accountList(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) return "accounts are out of range";
  const names = new Map<string, string>();
  for (const account of value) {
    if (!Array.isArray(account) || account.length < 2) return "an account needs a name and an email";
    const name = account[0];
    if (typeof name !== "string" || !/^[A-Z][a-z]+$/.test(name)) return "an account name is invalid";
    const emails = new Set<string>();
    for (const email of account.slice(1)) {
      if (typeof email !== "string" || !/^[a-z0-9]+@[a-z0-9.]+$/.test(email)) return "an email is invalid";
      if (emails.has(email)) return "an account repeats an email";
      emails.add(email);
      const owner = names.get(email);
      if (owner && owner !== name) return "an email belongs to two names";
      names.set(email, name);
    }
  }
  return null;
}

function islandsInput(input: Record<string, unknown>): string | null {
  if (!isInt(input.m, 1, 50) || !isInt(input.n, 1, 50)) return "sea size is out of range";
  const keys = exactKeys(input, ["m", "n", "positions"]);
  if (keys) return keys;
  if (!Array.isArray(input.positions) || input.positions.length < 1 || input.positions.length > 200) return "positions are out of range";
  for (const cell of input.positions) {
    if (!Array.isArray(cell) || cell.length !== 2 || !isInt(cell[0], 0, input.m - 1) || !isInt(cell[1], 0, input.n - 1)) {
      return "a position is outside the sea";
    }
  }
  return null;
}

function distinctGrid(value: unknown): string | null {
  const grid = numberGrid(value, 1, 50, 1, 50, 0, 2500);
  if (grid) return grid;
  const seen = new Set<number>();
  for (const row of value as number[][]) {
    for (const cell of row) {
      if (seen.has(cell)) return "grid values must be distinct";
      seen.add(cell);
    }
  }
  return null;
}

function cyclePos(input: Record<string, unknown>, uniqueStart: boolean): string | null {
  const values = uniqueStart ? intList(input.values, 0, 1000, 0, 100_000) : intList(input.values, 0, 1000, -1000, 1000);
  const length = Array.isArray(input.values) ? input.values.length : 0;
  if (exactKeys(input, ["values", "pos"]) || values) return exactKeys(input, ["values", "pos"]) ?? values;
  if (uniqueStart && new Set(input.values as number[]).size !== length) return "values must be unique";
  return isInt(input.pos, -1, Math.max(0, length - 1)) ? null : "pos must be -1 or a valid index";
}

function sortedChain(value: unknown): string | null {
  return intList(value, 0, 1000, -1000, 1000) ?? monotonic(value as number[], false);
}

function msdDigits(value: unknown): string | null {
  const list = intList(value, 1, 100, 0, 9);
  if (list) return list;
  const digits = value as number[];
  if (digits.length > 1 && digits[0] === 0) return "the number cannot have a leading zero";
  return null;
}

function lsdDigits(value: unknown): string | null {
  const list = intList(value, 1, 100, 0, 9);
  if (list) return list;
  const digits = value as number[];
  if (digits.length > 1 && digits[digits.length - 1] === 0) return "the highest digit cannot be zero";
  return null;
}

function columnsOf(value: unknown): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) return "columns are out of range";
  for (const row of value) {
    const list = intList(row, 1, 50, -1000, 1000);
    if (list) return list;
    if (monotonic(row as number[], false)) return "each column must be sorted";
  }
  return null;
}

function randomNodes(value: unknown): string | null {
  if (!Array.isArray(value) || value.length > 500) return "node list is out of range";
  for (const item of value) {
    if (!Array.isArray(item) || item.length !== 2 || !isInt(item[0], -1000, 1000)) return "each node is a value and a random index";
    if (!isInt(item[1], -1, Math.max(0, value.length - 1))) return "random index is out of range";
  }
  return null;
}

function atoiText(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 200) return "text length is out of range";
  if (![...value].every((ch) => ch === " " || ch === "+" || ch === "-" || /[0-9A-Za-z]/.test(ch))) {
    return "text contains a character that is not allowed";
  }
  return null;
}

function distinctInts(value: unknown, minLen: number, maxLen: number): string | null {
  const list = intList(value, minLen, maxLen, -1000, 1000);
  if (list) return list;
  if (new Set(value as number[]).size !== (value as number[]).length) return "values must be distinct";
  return null;
}

function distinctPositive(value: unknown): string | null {
  const list = intList(value, 1, 10, 1, 30);
  if (list) return list;
  if (new Set(value as number[]).size !== (value as number[]).length) return "candidates must be distinct";
  return null;
}

function letterBoard(input: Record<string, unknown>): string | null {
  if (exactKeys(input, ["board", "word"])) return exactKeys(input, ["board", "word"]);
  const word = bounded(input.word, 1, 12, /^[A-Z]+$/, "word");
  if (word) return word;
  if (!Array.isArray(input.board) || input.board.length < 1 || input.board.length > 6) return "board size is out of range";
  const width = typeof input.board[0] === "string" ? input.board[0].length : 0;
  if (width < 1 || width > 6) return "board width is out of range";
  for (const row of input.board) {
    if (typeof row !== "string" || row.length !== width || !/^[A-Z]+$/.test(row)) return "board cells must be uppercase letters";
  }
  return null;
}

function squareBits(value: unknown, maxSize: number): string | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > maxSize) return "maze size is out of range";
  for (const row of value) {
    if (!Array.isArray(row) || row.length !== value.length || !row.every((cell) => cell === 0 || cell === 1)) {
      return "maze cells must be 0 or 1 and the maze must be square";
    }
  }
  return null;
}

function colorInput(input: Record<string, unknown>): string | null {
  if (!isInt(input.count, 1, 10) || !isInt(input.m, 1, 10)) return "count or m is out of range";
  if (!Array.isArray(input.edges) || input.edges.length > 40) return "edges are out of range";
  for (const edge of input.edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every((node) => isInt(node, 0, (input.count as number) - 1))) {
      return "each edge must join two nodes";
    }
    if (edge[0] === edge[1]) return "an edge cannot join a node to itself";
  }
  return exactKeys(input, ["count", "edges", "m"]);
}

function sudokuGrid(value: unknown): string | null {
  if (!Array.isArray(value) || value.length !== 9) return "a sudoku grid is 9 by 9";
  const grid = value as unknown[];
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== 9 || !row.every((cell) => isInt(cell, 0, 9))) return "sudoku cells must be digits from 0 to 9";
  }
  const rows = grid as number[][];
  const seen = (cells: number[]) => {
    const filled = cells.filter((cell) => cell !== 0);
    return new Set(filled).size === filled.length;
  };
  for (let index = 0; index < 9; index += 1) {
    if (!seen(rows[index] ?? [])) return "a row repeats a digit";
    if (!seen(rows.map((row) => row[index] ?? 0))) return "a column repeats a digit";
  }
  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const cells: number[] = [];
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) cells.push(rows[boxRow + row]?.[boxCol + col] ?? 0);
      }
      if (!seen(cells)) return "a box repeats a digit";
    }
  }
  return null;
}

function distinctBitValues(value: unknown): string | null {
  const list = intList(value, 0, 16, -1000, 1000);
  if (list) return list;
  if (new Set(value as number[]).size !== (value as number[]).length) return "values must be distinct";
  return null;
}

function twoSingles(input: Record<string, unknown>): string | null {
  const values = intList(input.values, 2, 10_000, -1_000_000_000, 1_000_000_000);
  if (exactKeys(input, ["values"]) || values) return exactKeys(input, ["values"]) ?? values;
  const counts = new Map<number, number>();
  for (const value of input.values as number[]) counts.set(value, (counts.get(value) ?? 0) + 1);
  let singles = 0;
  for (const count of counts.values()) {
    if (count === 1) singles += 1;
    else if (count !== 2) return "every other value must appear twice";
  }
  return singles === 2 ? null : "exactly two values must appear once";
}

function levelOrder(value: unknown): string | null {
  if (!Array.isArray(value)) return "a tree must be a level-order array";
  if (value.length > 2000) return "tree is too large";
  if (!value.every((item) => item === null || isInt(item, -10_000, 10_000))) return "tree values must be integers or null";
  return null;
}

function gridStrings(input: Record<string, unknown>): string | null {
  if (!Array.isArray(input.grid) || input.grid.length < 1 || input.grid.length > 300) return "grid size is out of range";
  const width = typeof input.grid[0] === "string" ? input.grid[0].length : 0;
  if (width < 1 || width > 300) return "grid width is out of range";
  for (const row of input.grid) {
    if (typeof row !== "string" || row.length !== width || [...row].some((ch) => ch !== "0" && ch !== "1")) {
      return "grid rows must be equal-length strings of 0 and 1";
    }
  }
  return exactKeys(input, ["grid"]);
}

export function constraintError(slug: string, input: Record<string, unknown>): string | null {
  const check = checks[slug];
  if (!check) return "This problem has no constraint checker yet.";
  return check(input);
}

export function knownSlugs(): string[] {
  return Object.keys(checks);
}
