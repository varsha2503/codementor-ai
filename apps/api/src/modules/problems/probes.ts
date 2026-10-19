export type Probe = { input: Record<string, unknown>; rationale: string };

export function builtinProbes(slug: string): Probe[] {
  const sortProbe = [
    { input: { values: [] }, rationale: "empty row" },
    { input: { values: [2, 2, 1] }, rationale: "duplicates" },
  ];
  const probes: Record<string, Probe[]> = {
    "selection-sort": sortProbe,
    "bubble-sort": sortProbe,
    "insertion-sort": sortProbe,
    "merge-sort": sortProbe,
    "recursive-bubble-sort": sortProbe,
    "recursive-insertion-sort": sortProbe,
    "quick-sort": sortProbe,
    "heaviest-crate": [
      { input: { values: [-4, -4, -1] }, rationale: "negative weights" },
      { input: { values: [8] }, rationale: "single crate" },
    ],
    "exact-haul": [
      { input: { values: [1, 1, 1], k: 2 }, rationale: "several windows of the same sum" },
      { input: { values: [4], k: 4 }, rationale: "one load matches" },
    ],
    "triple-sum": [
      { input: { values: [0, 0, 0] }, rationale: "one zero triple" },
      { input: { values: [-2, 0, 0, 2] }, rationale: "zeros around a pair" },
    ],
    "merged-shifts": [
      { input: { shifts: [] }, rationale: "no shifts" },
      { input: { shifts: [[1, 1]] }, rationale: "a single instant" },
    ],
    "pair-target": [
      { input: { nums: [0, 0], target: 0 }, rationale: "duplicate zeros" },
      { input: { nums: [1_000_000_000, -1_000_000_000], target: 0 }, rationale: "integer limits" },
    ],
    "anagram-spots": [
      { input: { text: "", pattern: "" }, rationale: "empty strings" },
      { input: { text: "zzzz", pattern: "z" }, rationale: "repeated character" },
    ],
    "unique-stretch": [
      { input: { log: " " }, rationale: "single non-letter" },
      { input: { log: "abcade" }, rationale: "repeat after a gap" },
    ],
    "bracket-check": [
      { input: { expr: "" }, rationale: "empty expression" },
      { input: { expr: "([{}])" }, rationale: "nested mixed brackets" },
    ],
    "mirror-line": [
      { input: { line: "" }, rationale: "empty line" },
      { input: { line: "AbBa" }, rationale: "case and no punctuation" },
    ],
    "tight-window": [
      { input: { text: "a", need: "a" }, rationale: "one required letter" },
      { input: { text: "abc", need: "c" }, rationale: "window at the end" },
    ],
    "fold-code": [
      { input: { code: "abc" }, rationale: "no repeats" },
      { input: { code: "2[a]" }, rationale: "one group" },
    ],
    "front-mirror": [
      { input: { word: "a" }, rationale: "already a palindrome" },
      { input: { word: "abb" }, rationale: "letters added in front" },
    ],
    "shifted-search": [
      { input: { nums: [2, 1], target: 2 }, rationale: "pivot at the last element" },
      { input: { nums: [1, 2, 3], target: 2 }, rationale: "already sorted" },
    ],
    "catalog-spot": [
      { input: { values: [1], target: 1 }, rationale: "single part" },
      { input: { values: [-5, -1, 4], target: 4 }, rationale: "target at the end" },
    ],
    "courtyard-side": [
      { input: { area: 2 }, rationale: "side between 1 and 2" },
      { input: { area: 15 }, rationale: "just below a square" },
    ],
    "merged-pick": [
      { input: { left: [1], right: [], k: 1 }, rationale: "only the left list" },
      { input: { left: [1, 4], right: [2, 3], k: 1 }, rationale: "first of the merge" },
    ],
    "merge-rosters": [
      { input: { left: [], right: [] }, rationale: "both empty" },
      { input: { left: [1, 1], right: [1, 1] }, rationale: "duplicates across lists" },
    ],
    "loop-in-chain": [
      { input: { values: [], pos: -1 }, rationale: "empty chain" },
      { input: { values: [1, 2], pos: 0 }, rationale: "cycle back to the head" },
    ],
    "head-insert": [
      { input: { values: [], value: 0 }, rationale: "insert into an empty list" },
      { input: { values: [1], value: -1 }, rationale: "negative value in front" },
    ],
    "head-delete": [
      { input: { values: [] }, rationale: "empty list" },
      { input: { values: [1, 2] }, rationale: "remove the first of two" },
    ],
    "chain-length": [
      { input: { values: [] }, rationale: "empty list" },
      { input: { values: [1, 1, 1] }, rationale: "duplicate values still count" },
    ],
    "chain-search": [
      { input: { values: [], key: 1 }, rationale: "search an empty list" },
      { input: { values: [2, 2], key: 2 }, rationale: "key at the head" },
    ],
    "dll-head-insert": [
      { input: { values: [], value: 1 }, rationale: "first node of a doubly list" },
      { input: { values: [2, 3], value: 1 }, rationale: "old head must point backward" },
    ],
    "dll-head-delete": [
      { input: { values: [] }, rationale: "empty doubly list" },
      { input: { values: [1] }, rationale: "delete the only node" },
    ],
    "dll-reverse": [
      { input: { values: [] }, rationale: "empty doubly list" },
      { input: { values: [1, 2] }, rationale: "two nodes swap directions" },
    ],
    "list-middle": [
      { input: { values: [1] }, rationale: "single node" },
      { input: { values: [1, 2] }, rationale: "even length uses the later middle" },
    ],
    "reverse-chain": [
      { input: { values: [] }, rationale: "empty list" },
      { input: { values: [1] }, rationale: "single node" },
    ],
    "reverse-chain-recursive": [
      { input: { values: [] }, rationale: "empty list" },
      { input: { values: [1, 2, 3] }, rationale: "three-node recursion" },
    ],
    "loop-start": [
      { input: { values: [], pos: -1 }, rationale: "empty list" },
      { input: { values: [1, 2], pos: 0 }, rationale: "loop begins at the head" },
    ],
    "loop-length": [
      { input: { values: [4], pos: 0 }, rationale: "one-node loop" },
      { input: { values: [4], pos: -1 }, rationale: "one node and no loop" },
    ],
    "chain-palindrome": [
      { input: { values: [] }, rationale: "empty list" },
      { input: { values: [1, 2, 2, 1] }, rationale: "even-length palindrome" },
    ],
    "odd-even-chain": [
      { input: { values: [] }, rationale: "empty list" },
      { input: { values: [2, 1] }, rationale: "even value before an odd value" },
    ],
    "drop-from-end": [
      { input: { values: [1], n: 1 }, rationale: "remove the only node" },
      { input: { values: [1, 2, 3], n: 1 }, rationale: "remove the tail" },
    ],
    "drop-middle": [
      { input: { values: [1] }, rationale: "delete the only node" },
      { input: { values: [1, 2] }, rationale: "even length deletes the later middle" },
    ],
    "sort-chain": [
      { input: { values: [] }, rationale: "empty list" },
      { input: { values: [3, 1, 2] }, rationale: "three unsorted nodes" },
    ],
    "color-chain": [
      { input: { values: [] }, rationale: "empty list" },
      { input: { values: [2, 1, 0] }, rationale: "one of each color" },
    ],
    "y-meet": [
      { input: { prefixA: [], prefixB: [], shared: [] }, rationale: "two empty lists" },
      { input: { prefixA: [1], prefixB: [], shared: [2] }, rationale: "one list is only the shared tail" },
    ],
    "plus-one-chain": [
      { input: { values: [0] }, rationale: "zero becomes one" },
      { input: { values: [1, 9] }, rationale: "carry through the last digit" },
    ],
    "add-chains": [
      { input: { left: [0], right: [0] }, rationale: "zero plus zero" },
      { input: { left: [9], right: [9] }, rationale: "carry creates a new highest digit" },
    ],
    "dll-drop-key": [
      { input: { values: [], key: 1 }, rationale: "empty list" },
      { input: { values: [1, 2, 1], key: 1 }, rationale: "matches at both ends" },
    ],
    "dll-pairs": [
      { input: { values: [], target: 0 }, rationale: "empty list" },
      { input: { values: [1, 2, 3], target: 3 }, rationale: "ends add up, the middle is unused" },
    ],
    "dll-unique": [
      { input: { values: [] }, rationale: "empty list" },
      { input: { values: [1, 1, 1, 2] }, rationale: "a long run at the head" },
    ],
    "reverse-groups": [
      { input: { values: [1, 2, 3], k: 1 }, rationale: "groups of one" },
      { input: { values: [1, 2, 3, 4], k: 4 }, rationale: "one group covering the list" },
    ],
    "spin-chain": [
      { input: { values: [], k: 0 }, rationale: "empty list" },
      { input: { values: [1, 2, 3], k: 3 }, rationale: "rotation by the length" },
    ],
    "flatten-columns": [
      { input: { columns: [[1]] }, rationale: "one cell" },
      { input: { columns: [[1, 3], [2]] }, rationale: "two sorted columns" },
    ],
    "clone-random": [
      { input: { nodes: [] }, rationale: "empty list" },
      { input: { nodes: [[1, 0], [2, 0]] }, rationale: "both random pointers aim at the head" },
    ],
    "shelf-depth": [
      { input: { root: [] }, rationale: "empty tree" },
      { input: { root: [1, null, 2, null, 3] }, rationale: "right-skewed tree" },
    ],
    "identical-layout": [
      { input: { left: [], right: [] }, rationale: "two empty trees" },
      { input: { left: [1, 2, null], right: [1, null, 2] }, rationale: "same values, different shape" },
    ],
    "campus-islands": [
      { input: { grid: ["0"] }, rationale: "single water cell" },
      { input: { grid: ["10", "01"] }, rationale: "diagonal cells are separate" },
    ],
    "module-order": [
      { input: { count: 1, prerequisites: [] }, rationale: "one module" },
      { input: { count: 3, prerequisites: [[1, 0], [2, 1]] }, rationale: "a single chain" },
    ],
    "stair-routes": [
      { input: { steps: 1 }, rationale: "minimum staircase" },
      { input: { steps: 44 }, rationale: "near the upper bound, separates exponential recursion" },
    ],
    "house-payout": [
      { input: { values: [] }, rationale: "no houses" },
      { input: { values: [0, 0, 0] }, rationale: "zero payouts" },
    ],
    "coin-picks": [
      { input: { coins: [2], amount: 0 }, rationale: "zero amount" },
      { input: { coins: [2, 5, 7], amount: 3 }, rationale: "impossible amount" },
    ],
    "subset-ways": [
      { input: { nums: [], target: 0 }, rationale: "one empty subset" },
      { input: { nums: [2, 2, 2], target: 4 }, rationale: "duplicate values" },
    ],
    "rising-signal": [
      { input: { readings: [] }, rationale: "no readings" },
      { input: { readings: [5, 4, 3, 2, 1] }, rationale: "strictly decreasing" },
    ],
    "corridor-routes": [
      { input: { grid: [[0]] }, rationale: "single open cell" },
      { input: { grid: [[0, 0], [1, 0]] }, rationale: "blocked cell on the first column" },
    ],
    "palindrome-cuts": [
      { input: { s: "a" }, rationale: "single letter" },
      { input: { s: "aaa" }, rationale: "already a palindrome" },
    ],
    "recursive-atoi": [
      { input: { text: "  +0" }, rationale: "sign and zeros" },
      { input: { text: "  +  1" }, rationale: "space after the sign stops the read" },
    ],
    "integer-power": [
      { input: { x: -2, n: 0 }, rationale: "any number to the power 0" },
      { input: { x: 3, n: 5 }, rationale: "odd exponent" },
    ],
    "good-digits": [
      { input: { n: 3 }, rationale: "one extra even index" },
      { input: { n: 10 }, rationale: "still small enough to count by hand" },
    ],
    "sort-stack": [
      { input: { stack: [] }, rationale: "empty stack" },
      { input: { stack: [4, 4, 1] }, rationale: "duplicate values" },
    ],
    "reverse-stack": [
      { input: { stack: [] }, rationale: "empty stack" },
      { input: { stack: [1, 2] }, rationale: "two values swap" },
    ],
    "binary-strings": [
      { input: { n: 4 }, rationale: "one more bit" },
      { input: { n: 12 }, rationale: "upper length" },
    ],
    "pair-parens": [
      { input: { n: 4 }, rationale: "four pairs" },
      { input: { n: 8 }, rationale: "upper bound" },
    ],
    "power-set": [
      { input: { nums: [] }, rationale: "one empty subset" },
      { input: { nums: [-1, 0] }, rationale: "negative and zero" },
    ],
    "subset-check": [
      { input: { nums: [2, 4, 6], target: 0 }, rationale: "empty subsequence" },
      { input: { nums: [9], target: 9 }, rationale: "the only element" },
    ],
    "combo-sum": [
      { input: { candidates: [1], target: 3 }, rationale: "one candidate reused" },
      { input: { candidates: [8, 9], target: 7 }, rationale: "nothing fits" },
    ],
    "combo-sum-unique": [
      { input: { candidates: [1, 1, 1], target: 2 }, rationale: "repeated ones" },
      { input: { candidates: [5, 5], target: 5 }, rationale: "one copy is enough" },
    ],
    "all-subsets": [
      { input: { nums: [] }, rationale: "empty input" },
      { input: { nums: [0, -2] }, rationale: "order inside a subset follows the input" },
    ],
    "unique-subsets": [
      { input: { nums: [1, 1, 1] }, rationale: "one value repeated" },
      { input: { nums: [] }, rationale: "empty input" },
    ],
    "combo-three": [
      { input: { k: 9, n: 45 }, rationale: "every digit once" },
      { input: { k: 2, n: 3 }, rationale: "only 1 and 2" },
    ],
    "digit-letters": [
      { input: { digits: "" }, rationale: "no digits" },
      { input: { digits: "7" }, rationale: "a digit with four letters" },
    ],
    "palindrome-split": [
      { input: { text: "aa" }, rationale: "two cuts of a repeated letter" },
      { input: { text: "abc" }, rationale: "no multi-letter palindrome" },
    ],
    "board-word": [
      { input: { board: ["A"], word: "B" }, rationale: "single cell mismatch" },
      { input: { board: ["ABC", "DEF"], word: "ABF" }, rationale: "turn a corner" },
    ],
    "queen-grid": [
      { input: { n: 5 }, rationale: "five queens" },
      { input: { n: 8 }, rationale: "full classic board" },
    ],
    "maze-paths": [
      { input: { maze: [[1]] }, rationale: "already at the exit" },
      { input: { maze: [[1, 0], [1, 1]] }, rationale: "one open corridor" },
    ],
    "color-graph": [
      { input: { count: 3, edges: [], m: 1 }, rationale: "no edges" },
      { input: { count: 3, edges: [[0, 1], [1, 2]], m: 2 }, rationale: "a path of three nodes" },
    ],
    "fill-grid": [
      {
        input: {
          grid: [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9],
          ],
        },
        rationale: "already solved",
      },
    ],
    "operator-ways": [
      { input: { digits: "12", target: 12 }, rationale: "no operator" },
      { input: { digits: "10", target: 1 }, rationale: "multiplication by zero is not the only cut" },
    ],
    "bit-index": [
      { input: { n: 1, i: 0 }, rationale: "the ones bit" },
      { input: { n: 5, i: 2 }, rationale: "a higher set bit" },
    ],
    "odd-check": [
      { input: { n: -1 }, rationale: "negative odd number" },
      { input: { n: 2 }, rationale: "even number" },
    ],
    "power-two": [
      { input: { n: 2 }, rationale: "the smallest power above 1" },
      { input: { n: 6 }, rationale: "two set bits" },
    ],
    "popcount": [
      { input: { n: 1 }, rationale: "a single bit" },
      { input: { n: 255 }, rationale: "eight set bits" },
    ],
    "rightmost-bit": [
      { input: { n: 1 }, rationale: "only the ones bit is set" },
      { input: { n: 2 }, rationale: "the twos bit is the lowest set bit" },
    ],
    "swap-values": [
      { input: { a: -1, b: 1 }, rationale: "opposite signs" },
      { input: { a: 0, b: 0 }, rationale: "both zero" },
    ],
    "bit-divide": [
      { input: { dividend: -10, divisor: -3 }, rationale: "both negative, truncate toward zero" },
      { input: { dividend: 0, divisor: 5 }, rationale: "zero dividend" },
    ],
    "bit-flips": [
      { input: { start: 0, goal: 8 }, rationale: "one bit turns on" },
      { input: { start: 7, goal: 1 }, rationale: "two high bits turn off" },
    ],
    "bit-subsets": [
      { input: { nums: [] }, rationale: "one empty subset" },
      { input: { nums: [0, -1] }, rationale: "zero and a negative" },
    ],
    "range-xor": [
      { input: { left: 0, right: 3 }, rationale: "a complete group of four" },
      { input: { left: 8, right: 8 }, rationale: "a single number" },
    ],
    "two-singles": [
      { input: { values: [6, 6, 1, 2] }, rationale: "the pair is not at the ends" },
      { input: { values: [-2, 3, -2, 4] }, rationale: "a negative paired value" },
    ],
    "prime-factors": [
      { input: { n: 2 }, rationale: "the smallest prime" },
      { input: { n: 9 }, rationale: "a square of a prime" },
    ],
    "all-divisors": [
      { input: { n: 9 }, rationale: "a square includes the root once" },
      { input: { n: 2 }, rationale: "a prime" },
    ],
    "prime-span": [
      { input: { left: 14, right: 16 }, rationale: "no primes" },
      { input: { left: 1, right: 2 }, rationale: "only 2" },
    ],
    "prime-breakdown": [
      { input: { n: 8 }, rationale: "a power of two" },
      { input: { n: 30 }, rationale: "three distinct primes" },
    ],
    "array-stack": [
      { input: { capacity: 1, commands: ["empty"] }, rationale: "an empty fixed stack" },
      { input: { capacity: 2, commands: ["push 1", "push 2", "push 3", "top"] }, rationale: "a push that does not fit" },
    ],
    "array-queue": [
      { input: { capacity: 1, commands: ["push 1", "pop", "empty"] }, rationale: "one slot reused" },
      { input: { capacity: 2, commands: ["push 1", "push 2", "front"] }, rationale: "the front is the older value" },
    ],
    "queue-stack": [
      { input: { commands: ["push 1", "top"] }, rationale: "the only value is the top" },
      { input: { commands: ["empty"] }, rationale: "nothing has been pushed" },
    ],
    "stack-queue": [
      { input: { commands: ["push 1", "push 2", "front"] }, rationale: "the front stays the first push" },
      { input: { commands: ["empty"] }, rationale: "nothing has been pushed" },
    ],
    "list-stack": [
      { input: { commands: ["push 7", "pop", "empty"] }, rationale: "a single node comes and goes" },
      { input: { commands: ["empty"] }, rationale: "a null head" },
    ],
    "list-queue": [
      { input: { commands: ["push 7", "push 8", "pop"] }, rationale: "the head leaves first" },
      { input: { commands: ["empty"] }, rationale: "a null head" },
    ],
    "min-stack": [
      { input: { commands: ["push 2", "push 2", "getMin", "pop", "getMin"] }, rationale: "a repeated minimum" },
      { input: { commands: ["push -5", "top"] }, rationale: "one negative value" },
    ],
    "infix-postfix": [
      { input: { expression: "a" }, rationale: "a single operand" },
      { input: { expression: "a*b+c" }, rationale: "multiplication binds first" },
    ],
    "prefix-infix": [
      { input: { expression: "+ab" }, rationale: "one operator" },
      { input: { expression: "z" }, rationale: "a single operand" },
    ],
    "prefix-postfix": [
      { input: { expression: "-ab" }, rationale: "subtraction keeps order" },
      { input: { expression: "9" }, rationale: "a digit operand" },
    ],
    "postfix-prefix": [
      { input: { expression: "ab-" }, rationale: "the operator moves to the front" },
      { input: { expression: "4" }, rationale: "a digit operand" },
    ],
    "postfix-infix": [
      { input: { expression: "ab/" }, rationale: "division is parenthesized" },
      { input: { expression: "m" }, rationale: "a single operand" },
    ],
    "infix-prefix": [
      { input: { expression: "a-b-c" }, rationale: "left-associative subtraction" },
      { input: { expression: "(a)" }, rationale: "parentheses around one operand" },
    ],
    "next-greater": [
      { input: { nums: [4, 5] }, rationale: "the later value answers the first" },
      { input: { nums: [3] }, rationale: "a single value" },
    ],
    "next-greater-circular": [
      { input: { nums: [2, 1] }, rationale: "the search wraps" },
      { input: { nums: [4, 4] }, rationale: "equals are not greater" },
    ],
    "next-smaller": [
      { input: { nums: [2, 1] }, rationale: "the later value is smaller" },
      { input: { nums: [1, 1] }, rationale: "equals are not smaller" },
    ],
    "greater-counts": [
      { input: { nums: [1], queries: [0] }, rationale: "the last index has an empty suffix" },
      { input: { nums: [1, 3, 2], queries: [0, 1] }, rationale: "two suffixes" },
    ],
    "trap-rain": [
      { input: { height: [1, 0, 1] }, rationale: "one unit between equal walls" },
      { input: { height: [3, 3] }, rationale: "no valley" },
    ],
    "subarray-mins": [
      { input: { nums: [2, 2] }, rationale: "the pair is owned by one index" },
      { input: { nums: [0] }, rationale: "a zero minimum" },
    ],
    "asteroid-run": [
      { input: { asteroids: [-5, -2] }, rationale: "both move left" },
      { input: { asteroids: [3, -3] }, rationale: "equal sizes destroy both" },
    ],
    "subarray-ranges": [
      { input: { nums: [1] }, rationale: "a single element has range 0" },
      { input: { nums: [-2, 2] }, rationale: "a negative and a positive" },
    ],
    "trim-digits": [
      { input: { num: "9", k: 0 }, rationale: "nothing is removed" },
      { input: { num: "100", k: 1 }, rationale: "the remaining digits are zeros" },
    ],
    "histogram-area": [
      { input: { heights: [0] }, rationale: "a bar of height zero" },
      { input: { heights: [3, 3, 3] }, rationale: "the full width is the rectangle" },
    ],
    "maximal-rectangle": [
      { input: { grid: ["1"] }, rationale: "one cell" },
      { input: { grid: ["00", "00"] }, rationale: "no ones" },
    ],
    "window-max": [
      { input: { nums: [2, 1], k: 2 }, rationale: "one window" },
      { input: { nums: [5, 4, 3], k: 1 }, rationale: "every value is its own window" },
    ],
    "stock-span": [
      { input: { prices: [1] }, rationale: "the first day" },
      { input: { prices: [2, 1, 2] }, rationale: "an equal price later" },
    ],
    celebrity: [
      { input: { knows: [[0]] }, rationale: "a party of one" },
      { input: { knows: [[0, 0], [0, 0]] }, rationale: "nobody is known by the other person" },
    ],
    "lru-cache": [
      { input: { capacity: 1, commands: ["put 1 1", "get 1"] }, rationale: "one stored key" },
      { input: { capacity: 0, commands: ["put 1 1"] }, rationale: "nothing can be stored" },
    ],
    "lfu-cache": [
      { input: { capacity: 1, commands: ["put 1 1", "get 1", "put 2 2", "get 2"] }, rationale: "the only key is replaced" },
      { input: { capacity: 2, commands: ["put 1 1", "get 1"] }, rationale: "a use raises frequency" },
    ],
    "min-heap": [
      { input: { commands: ["insert 1", "peek"] }, rationale: "one value is the minimum" },
      { input: { commands: [] }, rationale: "no commands" },
    ],
    "heap-check": [
      { input: { heap: [1, 2, 3] }, rationale: "parents are no larger than their children" },
      { input: { heap: [2, 1] }, rationale: "the child is smaller than the parent" },
    ],
    "heap-flip": [
      { input: { heap: [1] }, rationale: "a single node" },
      { input: { heap: [1, 2, 3] }, rationale: "a three-node min heap" },
    ],
    "kth-largest": [
      { input: { nums: [4, 2], k: 1 }, rationale: "the largest value" },
      { input: { nums: [1], k: 1 }, rationale: "one value" },
    ],
    "kth-smallest": [
      { input: { nums: [4, 2], k: 1 }, rationale: "the smallest value" },
      { input: { nums: [5, 5], k: 2 }, rationale: "duplicates count separately" },
    ],
    "nearly-sorted": [
      { input: { nums: [2, 1], k: 1 }, rationale: "each value moves one place" },
      { input: { nums: [1, 2, 3], k: 0 }, rationale: "already sorted" },
    ],
    "merge-k-lists": [
      { input: { lists: [[]] }, rationale: "one empty list" },
      { input: { lists: [[1], [2]] }, rationale: "two single-node lists" },
    ],
    "value-ranks": [
      { input: { nums: [2, 2] }, rationale: "equal values share a rank" },
      { input: { nums: [1] }, rationale: "the only rank is 1" },
    ],
    "task-gap": [
      { input: { tasks: "A", n: 0 }, rationale: "one task and no cooldown" },
      { input: { tasks: "AB", n: 1 }, rationale: "different tasks fill the gap" },
    ],
    "straight-hand": [
      { input: { hand: [1], groupSize: 1 }, rationale: "a group of one" },
      { input: { hand: [1, 2, 3], groupSize: 1 }, rationale: "every card is its own group" },
    ],
    "tweet-feed": [
      { input: { commands: ["feed 1"] }, rationale: "a user with no posts" },
      { input: { commands: ["post 1 1", "feed 1"] }, rationale: "one own tweet" },
    ],
    "stick-cost": [
      { input: { sticks: [1] }, rationale: "nothing to connect" },
      { input: { sticks: [1, 2] }, rationale: "one connection" },
    ],
    "kth-stream": [
      { input: { nums: [1], k: 1, adds: [2] }, rationale: "the new maximum" },
      { input: { nums: [3, 1], k: 2, adds: [] }, rationale: "no new values" },
    ],
    "pair-sums": [
      { input: { left: [1], right: [2], k: 1 }, rationale: "the only pair" },
      { input: { left: [1, 2], right: [3, 0], k: 1 }, rationale: "the largest pair only" },
    ],
    "running-median": [
      { input: { commands: ["add 1", "median"] }, rationale: "one value" },
      { input: { commands: ["add -3", "add 4", "median"] }, rationale: "the smaller of two middles" },
    ],
    "frequent-values": [
      { input: { nums: [1], k: 1 }, rationale: "one value" },
      { input: { nums: [2, 2, 1], k: 1 }, rationale: "the more frequent value" },
    ],
    "assign-cookies": [
      { input: { children: [1], cookies: [1] }, rationale: "one child and a large enough cookie" },
      { input: { children: [], cookies: [] }, rationale: "no children" },
    ],
    "fraction-pack": [
      { input: { items: [[10, 10]], capacity: 5 }, rationale: "half of one item" },
      { input: { items: [], capacity: 0 }, rationale: "nothing to pack" },
    ],
    "lemonade": [
      { input: { bills: [5, 5, 10] }, rationale: "change for a ten" },
      { input: { bills: [] }, rationale: "no customers" },
    ],
    "star-parens": [
      { input: { s: "(*)" }, rationale: "a star between a pair" },
      { input: { s: "" }, rationale: "an empty string" },
    ],
    "meeting-room": [
      { input: { meetings: [[1, 2], [2, 3]] }, rationale: "back to back meetings" },
      { input: { meetings: [] }, rationale: "no meetings" },
    ],
    "jump-reach": [
      { input: { nums: [2, 3, 1, 1, 4] }, rationale: "a reachable last index" },
      { input: { nums: [0] }, rationale: "already at the last index" },
    ],
    "jump-count": [
      { input: { nums: [2, 3, 1, 1, 4] }, rationale: "two jumps" },
      { input: { nums: [0] }, rationale: "zero jumps" },
    ],
    "rail-platforms": [
      { input: { arrival: [1], departure: [2] }, rationale: "one train" },
      { input: { arrival: [1, 2], departure: [2, 3] }, rationale: "an arrival on a departure minute" },
    ],
    "job-order": [
      { input: { jobs: [[1, 5]] }, rationale: "one job" },
      { input: { jobs: [[2, 100], [1, 19]] }, rationale: "two deadlines" },
    ],
    "candy-row": [
      { input: { ratings: [1, 0, 2] }, rationale: "a valley" },
      { input: { ratings: [1] }, rationale: "one child" },
    ],
    "shortest-job": [
      { input: { burst: [4, 3, 7, 1, 2] }, rationale: "several burst times" },
      { input: { burst: [1] }, rationale: "one process" },
    ],
    "page-faults": [
      { input: { pages: [1, 2, 1], capacity: 1 }, rationale: "a one-frame memory" },
      { input: { pages: [7], capacity: 1 }, rationale: "a single request" },
    ],
    "insert-span": [
      { input: { intervals: [[1, 3], [6, 9]], newInterval: [2, 5] }, rationale: "overlap on the left span" },
      { input: { intervals: [], newInterval: [1, 2] }, rationale: "insert into an empty list" },
    ],
    "drop-intervals": [
      { input: { intervals: [[1, 2], [2, 3]] }, rationale: "touching endpoints" },
      { input: { intervals: [] }, rationale: "no intervals" },
    ],
    "preorder-walk": [
      { input: { root: [1, null, 2] }, rationale: "a right child" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "inorder-walk": [
      { input: { root: [1, 2, 3] }, rationale: "two children" },
      { input: { root: [1] }, rationale: "a single node" },
    ],
    "postorder-walk": [
      { input: { root: [1, 2, 3] }, rationale: "two children" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "level-walk": [
      { input: { root: [1, 2, 3] }, rationale: "two levels" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "iter-preorder": [
      { input: { root: [1, 2, 3] }, rationale: "a full first level" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "iter-inorder": [
      { input: { root: [1, null, 2] }, rationale: "only a right child" },
      { input: { root: [1] }, rationale: "a single node" },
    ],
    "post-two-stacks": [
      { input: { root: [1, 2, 3] }, rationale: "two children" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "post-one-stack": [
      { input: { root: [1, 2] }, rationale: "a left child" },
      { input: { root: [1] }, rationale: "a single node" },
    ],
    "triple-order": [
      { input: { root: [1, 2, 3] }, rationale: "all three orders" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "balanced-tree": [
      { input: { root: [1, 2, 3] }, rationale: "a balanced root" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "tree-diameter": [
      { input: { root: [1, 2, 3] }, rationale: "a path through the root" },
      { input: { root: [1] }, rationale: "no edges" },
    ],
    "max-path-sum": [
      { input: { root: [1, 2, 3] }, rationale: "a positive path" },
      { input: { root: [-3] }, rationale: "one negative node" },
    ],
    "zigzag-levels": [
      { input: { root: [1, 2, 3] }, rationale: "a reversed second level" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "tree-boundary": [
      { input: { root: [1, 2, 3] }, rationale: "root and two leaves" },
      { input: { root: [1] }, rationale: "a single node" },
    ],
    "vertical-order": [
      { input: { root: [1, 2, 3] }, rationale: "three columns" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "top-view": [
      { input: { root: [1, 2, 3] }, rationale: "three visible columns" },
      { input: { root: [1] }, rationale: "one column" },
    ],
    "bottom-view": [
      { input: { root: [1, 2, 3] }, rationale: "three columns" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "right-view": [
      { input: { root: [1, 2, 3] }, rationale: "the right edge" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "left-view": [
      { input: { root: [1, 2, 3] }, rationale: "the left edge" },
      { input: { root: [1] }, rationale: "a single node" },
    ],
    "symmetric-tree": [
      { input: { root: [1, 2, 2] }, rationale: "a mirror pair" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "root-paths": [
      { input: { root: [1, 2, 3] }, rationale: "two leaves" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "lowest-ancestor": [
      { input: { root: [1, 2, 3], p: 2, q: 3 }, rationale: "targets in different subtrees" },
      { input: { root: [1], p: 1, q: 1 }, rationale: "one node" },
    ],
    "max-width": [
      { input: { root: [1, 2, 3] }, rationale: "a full level" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "children-sum": [
      { input: { root: [10, 4] }, rationale: "a parent larger than its child" },
      { input: { root: [1] }, rationale: "a leaf" },
    ],
    "nodes-at-k": [
      { input: { root: [1, 2, 3], target: 1, k: 1 }, rationale: "both children" },
      { input: { root: [1], target: 1, k: 0 }, rationale: "the target itself" },
    ],
    "burn-tree": [
      { input: { root: [1, 2, 3], target: 1 }, rationale: "fire at the root" },
      { input: { root: [1], target: 1 }, rationale: "a single node" },
    ],
    "count-complete": [
      { input: { root: [1, 2, 3, 4] }, rationale: "a complete tree" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "build-pre-in": [
      { input: { preorder: [1, 2], inorder: [2, 1] }, rationale: "a left child" },
      { input: { preorder: [], inorder: [] }, rationale: "an empty tree" },
    ],
    "build-post-in": [
      { input: { postorder: [2, 1], inorder: [2, 1] }, rationale: "a left child" },
      { input: { postorder: [1], inorder: [1] }, rationale: "a single node" },
    ],
    "serialize-tree": [
      { input: { root: [1, null, 2] }, rationale: "a missing left child" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "deserialize-tree": [
      { input: { data: "1,null,2" }, rationale: "a missing left child" },
      { input: { data: "" }, rationale: "an empty tree" },
    ],
    "morris-preorder": [
      { input: { root: [1, 2, 3] }, rationale: "two children" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "morris-inorder": [
      { input: { root: [1, 2, 3] }, rationale: "two children" },
      { input: { root: [1] }, rationale: "a single node" },
    ],
    "flatten-tree": [
      { input: { root: [1, 2, 3] }, rationale: "two children" },
      { input: { root: [] }, rationale: "an empty tree" },
    ],
    "search-bst": [
      { input: { root: [4, 2, 7, 1, 3], key: 2 }, rationale: "a present key" },
      { input: { root: [], key: 1 }, rationale: "an empty tree" },
    ],
    "bst-minmax": [
      { input: { root: [2, 1, 3] }, rationale: "both children" },
      { input: { root: [1] }, rationale: "a single node" },
    ],
    "floor-ceil-bst": [
      { input: { root: [4, 2, 7], key: 3 }, rationale: "a key between two nodes" },
      { input: { root: [], key: 1 }, rationale: "an empty tree" },
    ],
    "floor-bst": [
      { input: { root: [4, 2, 7], key: 3 }, rationale: "a key between two nodes" },
      { input: { root: [4, 2, 7], key: 1 }, rationale: "a key below every node" },
    ],
    "insert-bst": [
      { input: { root: [], key: 1 }, rationale: "insert into an empty tree" },
      { input: { root: [2, 1, 3], key: 4 }, rationale: "a new right leaf" },
    ],
    "delete-bst": [
      { input: { root: [2, 1, 3], key: 1 }, rationale: "delete a leaf" },
      { input: { root: [1], key: 1 }, rationale: "delete the only node" },
    ],
    "kth-bst": [
      { input: { root: [2, 1, 3], k: 1 }, rationale: "the smallest and the largest" },
      { input: { root: [1], k: 1 }, rationale: "a single node" },
    ],
    "valid-bst": [
      { input: { root: [2, 1, 3] }, rationale: "a valid search tree" },
      { input: { root: [1, 2, 3] }, rationale: "a left child that is too large" },
    ],
    "lca-bst": [
      { input: { root: [6, 2, 8], p: 2, q: 8 }, rationale: "targets on opposite sides" },
      { input: { root: [2, 1, 3], p: 1, q: 1 }, rationale: "the same target twice" },
    ],
    "bst-preorder": [
      { input: { preorder: [4, 2, 1, 3, 7] }, rationale: "a valid preorder" },
      { input: { preorder: [] }, rationale: "an empty tree" },
    ],
    "pred-succ-bst": [
      { input: { root: [2, 1, 3], key: 2 }, rationale: "neighbors of the root" },
      { input: { root: [1], key: 1 }, rationale: "no neighbors" },
    ],
    "merge-bsts": [
      { input: { left: [2, 1, 3], right: [4] }, rationale: "two sorted trees" },
      { input: { left: [], right: [] }, rationale: "two empty trees" },
    ],
    "two-sum-bst": [
      { input: { root: [2, 1, 3], k: 4 }, rationale: "the two leaves" },
      { input: { root: [1], k: 2 }, rationale: "one node cannot make a pair" },
    ],
    "recover-bst": [
      { input: { root: [2, 3, 1] }, rationale: "two swapped children" },
      { input: { root: [1, 2, 3] }, rationale: "the root swapped with its left child" },
    ],
    "largest-bst": [
      { input: { root: [10, 5, 15, 1, 8, null, 7] }, rationale: "a valid subtree inside a larger tree" },
      { input: { root: [1] }, rationale: "a single node" },
    ],
    "component-count": [
      { input: { n: 5, edges: [[0, 1], [1, 2], [3, 4]] }, rationale: "two components" },
      { input: { n: 1, edges: [] }, rationale: "a single node" },
    ],
    "graph-dfs": [
      { input: { n: 5, edges: [[0, 1], [0, 2], [1, 3], [2, 4]] }, rationale: "one connected graph" },
      { input: { n: 4, edges: [[0, 1], [2, 3]] }, rationale: "two components" },
    ],
    "province-count": [
      { input: { isConnected: [[1, 1, 0], [1, 1, 0], [0, 0, 1]] }, rationale: "two provinces" },
      { input: { isConnected: [[1]] }, rationale: "one city" },
    ],
    "rotten-oranges": [
      { input: { grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]] }, rationale: "rot spreads in four minutes" },
      { input: { grid: [[0, 2]] }, rationale: "no fresh orange" },
    ],
    "flood-fill": [
      { input: { image: [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr: 1, sc: 1, color: 2 }, rationale: "recolor a connected region" },
      { input: { image: [[1]], sr: 0, sc: 0, color: 1 }, rationale: "the color is already the same" },
    ],
    "cycle-bfs": [
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]] }, rationale: "a path" },
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, rationale: "a triangle" },
    ],
    "cycle-undirected": [
      { input: { n: 1, edges: [] }, rationale: "one node" },
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, rationale: "a triangle" },
    ],
    "nearest-one": [
      { input: { grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] }, rationale: "one source in the middle" },
      { input: { grid: [[1]] }, rationale: "a single one" },
    ],
    "surrounded-regions": [
      { input: { board: ["XXXX", "XOOX", "XXOX", "XOXX"] }, rationale: "one border O survives" },
      { input: { board: ["O"] }, rationale: "a border cell" },
    ],
    "enclave-count": [
      { input: { grid: [[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]] }, rationale: "three trapped land cells" },
      { input: { grid: [[0]] }, rationale: "open sea" },
    ],
    "word-ladder": [
      { input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "dog", "lot", "log", "cog"] }, rationale: "a ladder of length five" },
      { input: { beginWord: "a", endWord: "c", wordList: ["a", "b", "c"] }, rationale: "one letter change" },
    ],
    "word-ladder-all": [
      { input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "dog", "lot", "log"] }, rationale: "the end word is missing" },
      { input: { beginWord: "a", endWord: "c", wordList: ["b", "c"] }, rationale: "one shortest ladder" },
    ],
    "bipartite-graph": [
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]] }, rationale: "a path is bipartite" },
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, rationale: "a triangle is not" },
    ],
    "cycle-directed-dfs": [
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, rationale: "a directed cycle" },
      { input: { n: 3, edges: [[0, 1], [1, 2]] }, rationale: "a directed path" },
    ],
    "topo-dfs": [
      { input: { n: 4, edges: [[0, 1], [0, 2], [1, 3], [2, 3]] }, rationale: "a small dag" },
      { input: { n: 2, edges: [[0, 1], [1, 0]] }, rationale: "a cycle" },
    ],
    "topo-kahn": [
      { input: { n: 4, edges: [[0, 1], [0, 2], [1, 3], [2, 3]] }, rationale: "smallest ready node first" },
      { input: { n: 1, edges: [] }, rationale: "one node" },
    ],
    "cycle-directed": [
      { input: { n: 2, edges: [[0, 1], [1, 0]] }, rationale: "a two-node cycle" },
      { input: { n: 1, edges: [] }, rationale: "one node" },
    ],
    "course-schedule": [
      { input: { numCourses: 2, prerequisites: [[1, 0]] }, rationale: "one prerequisite" },
      { input: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] }, rationale: "a mutual dependency" },
    ],
    "eventual-safe": [
      { input: { graph: [[1, 2], [2, 3], [5], [0], [5], [], []] }, rationale: "some nodes reach a cycle" },
      { input: { graph: [[]] }, rationale: "a terminal node" },
    ],
    "alien-order": [
      { input: { words: ["wrt", "wrf", "er", "ett", "rftt"] }, rationale: "several letter constraints" },
      { input: { words: ["abc", "ab"] }, rationale: "a prefix placed after a longer word" },
    ],
    "unit-shortest": [
      { input: { n: 4, edges: [[0, 1], [0, 2], [1, 3], [2, 3]] }, rationale: "two ways to the last node" },
      { input: { n: 3, edges: [[0, 1]] }, rationale: "an unreachable node" },
    ],
    "dag-shortest": [
      { input: { n: 4, edges: [[0, 1, 2], [0, 2, 4], [1, 3, 1], [2, 3, 3]] }, rationale: "two weighted routes" },
      { input: { n: 2, edges: [] }, rationale: "an unreachable node" },
    ],
    "dijkstra": [
      { input: { n: 5, edges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 7], [2, 4, 3], [3, 4, 1]], source: 0 }, rationale: "a small directed network" },
      { input: { n: 1, edges: [], source: 0 }, rationale: "the source alone" },
    ],
    "maze-distance": [
      { input: { grid: [[1, 0, 1], [1, 1, 1], [0, 1, 1]], start: [0, 0], end: [2, 2] }, rationale: "an open route" },
      { input: { grid: [[1]], start: [0, 0], end: [0, 0] }, rationale: "already there" },
    ],
    "min-effort": [
      { input: { heights: [[1, 2, 2], [3, 8, 2], [5, 3, 5]] }, rationale: "a path whose largest step is 2" },
      { input: { heights: [[1]] }, rationale: "one cell" },
    ],
    "cheapest-flights": [
      { input: { n: 4, flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src: 0, dst: 3, k: 1 }, rationale: "one stop is cheaper than a direct flight" },
      { input: { n: 2, flights: [[0, 1, 10]], src: 0, dst: 1, k: 0 }, rationale: "a direct flight" },
    ],
    "network-delay": [
      { input: { times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n: 4, k: 2 }, rationale: "the farthest node takes two units" },
      { input: { times: [], n: 1, k: 1 }, rationale: "one node is already reached" },
    ],
    "count-paths": [
      { input: { n: 4, roads: [[0, 1, 1], [0, 2, 1], [1, 3, 1], [2, 3, 1]] }, rationale: "two equal shortest routes" },
      { input: { n: 1, roads: [] }, rationale: "already at the destination" },
    ],
    "min-multiplications": [
      { input: { start: 3, end: 30, arr: [2, 5, 7] }, rationale: "two multiplications" },
      { input: { start: 3, end: 3, arr: [2] }, rationale: "already there" },
    ],
    "bellman-ford": [
      { input: { n: 5, edges: [[0, 1, -1], [0, 2, 4], [1, 2, 3], [1, 3, 2], [1, 4, 2], [3, 2, 5], [3, 1, 1], [4, 3, -3]] }, rationale: "negative edges without a cycle" },
      { input: { n: 3, edges: [[1, 2, -5]] }, rationale: "a negative edge the source cannot reach" },
    ],
    "floyd-warshall": [
      { input: { matrix: [[0, 3, -1], [2, 0, -1], [-1, 7, 0]] }, rationale: "one path uses an intermediate node" },
      { input: { matrix: [[0]] }, rationale: "one node" },
    ],
    "smallest-city": [
      { input: { n: 4, edges: [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], distanceThreshold: 4 }, rationale: "a tie goes to the greatest index" },
      { input: { n: 1, edges: [], distanceThreshold: 1 }, rationale: "one city" },
    ],
    "prim-mst": [
      { input: { n: 3, edges: [[0, 1, 1], [1, 2, 2], [0, 2, 3]] }, rationale: "a connected triangle" },
      { input: { n: 1, edges: [] }, rationale: "one node" },
    ],
    "disjoint-set": [
      { input: { n: 5, commands: ["union 1 2", "find 2", "union 2 3", "find 1", "find 4", "union 4 3", "find 4"] }, rationale: "unions and finds" },
      { input: { n: 1, commands: ["find 0"] }, rationale: "one element" },
    ],
    "kruskal-mst": [
      { input: { n: 3, edges: [[0, 1, 1], [1, 2, 2], [0, 2, 3]] }, rationale: "the two lightest edges" },
      { input: { n: 3, edges: [[0, 1, 1]] }, rationale: "a disconnected graph" },
    ],
    "connect-network": [
      { input: { n: 4, connections: [[0, 1], [0, 2], [1, 2]] }, rationale: "one spare cable" },
      { input: { n: 1, connections: [] }, rationale: "one computer" },
    ],
    "remove-stones": [
      { input: { stones: [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1], [2, 2]] }, rationale: "one connected group" },
      { input: { stones: [[0, 0]] }, rationale: "one stone" },
    ],
    "accounts-merge": [
      { input: { accounts: [["John", "a@mail.com", "b@mail.com"], ["John", "b@mail.com", "c@mail.com"], ["Mary", "m@mail.com"]] }, rationale: "two accounts share an email" },
      { input: { accounts: [["Ada", "ada@mail.com"]] }, rationale: "one account" },
    ],
    "islands-online": [
      { input: { m: 3, n: 3, positions: [[0, 0], [0, 1], [1, 2], [2, 1]] }, rationale: "land appears one cell at a time" },
      { input: { m: 1, n: 1, positions: [[0, 0], [0, 0]] }, rationale: "the same cell twice" },
    ],
    "largest-island": [
      { input: { grid: [[1, 0], [0, 1]] }, rationale: "one flip joins two islands" },
      { input: { grid: [[0]] }, rationale: "one water cell" },
    ],
    "swim-rising": [
      { input: { grid: [[0, 2], [1, 3]] }, rationale: "the path waits for the last cell" },
      { input: { grid: [[7]] }, rationale: "one cell" },
    ],
    "graph-bridges": [
      { input: { n: 5, edges: [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]] }, rationale: "two bridges leave the triangle" },
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, rationale: "a cycle has no bridge" },
    ],
    "articulation-points": [
      { input: { n: 5, edges: [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]] }, rationale: "two cut vertices" },
      { input: { n: 1, edges: [] }, rationale: "one node" },
    ],
    "kosaraju-scc": [
      { input: { n: 5, edges: [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]] }, rationale: "one cycle and two later nodes" },
      { input: { n: 2, edges: [[0, 1], [1, 0]] }, rationale: "one component" },
    ],
    "frog-jump": [
      { input: { heights: [10, 20, 30, 10] }, rationale: "jumps of one and two" },
      { input: { heights: [10] }, rationale: "one stone" },
    ],
    "frog-jump-k": [
      { input: { heights: [10, 30, 40, 50, 20], k: 3 }, rationale: "jumps up to three stones" },
      { input: { heights: [10], k: 1 }, rationale: "one stone" },
    ],
    "ninja-training": [
      { input: { points: [[10, 40, 70], [20, 50, 80], [30, 60, 90]] }, rationale: "three days" },
      { input: { points: [[7, 4, 1]] }, rationale: "one day" },
    ],
    "unique-paths": [
      { input: { m: 3, n: 7 }, rationale: "a wide grid" },
      { input: { m: 1, n: 1 }, rationale: "one cell" },
    ],
    "falling-path": [
      { input: { grid: [[2, 1, 3], [6, 5, 4], [7, 8, 9]] }, rationale: "three falling choices" },
      { input: { grid: [[5]] }, rationale: "one cell" },
    ],
    "triangle-path": [
      { input: { triangle: [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]] }, rationale: "a four-row triangle" },
      { input: { triangle: [[-10]] }, rationale: "one cell" },
    ],
    "ninja-friends": [
      { input: { grid: [[3, 1, 1], [2, 5, 1], [1, 5, 5], [2, 1, 1]] }, rationale: "two friends crossing a grid" },
      { input: { grid: [[8]] }, rationale: "one cell" },
    ],
    "subset-sum": [
      { input: { nums: [1, 2, 3], target: 5 }, rationale: "a reachable sum" },
      { input: { nums: [1], target: 0 }, rationale: "the empty subset" },
    ],
    "equal-partition": [
      { input: { nums: [1, 5, 11, 5] }, rationale: "two equal groups" },
      { input: { nums: [1] }, rationale: "one element" },
    ],
    "min-partition": [
      { input: { nums: [1, 6, 11, 5] }, rationale: "a difference of one" },
      { input: { nums: [1, 2, 3] }, rationale: "an even split" },
    ],
    "count-partitions": [
      { input: { nums: [5, 2, 6, 4], difference: 3 }, rationale: "one subset with the larger sum" },
      { input: { nums: [1], difference: 0 }, rationale: "an odd total cannot split evenly" },
    ],
    "coin-change-ii": [
      { input: { coins: [1, 2, 5], amount: 5 }, rationale: "four combinations" },
      { input: { coins: [1], amount: 0 }, rationale: "one empty combination" },
    ],
    "target-sum": [
      { input: { nums: [1, 1, 1, 1, 1], target: 3 }, rationale: "five sign patterns" },
      { input: { nums: [0, 0], target: 0 }, rationale: "zeros have two signs" },
    ],
    "unbounded-knapsack": [
      { input: { weights: [2, 4, 6], values: [5, 11, 13], capacity: 10 }, rationale: "items may repeat" },
      { input: { weights: [1], values: [1], capacity: 0 }, rationale: "no capacity" },
    ],
    "rod-cutting": [
      { input: { price: [1, 5, 8, 9, 10, 17, 17, 20] }, rationale: "several useful cuts" },
      { input: { price: [3] }, rationale: "a rod that cannot be cut" },
    ],
    "longest-common-subsequence": [
      { input: { a: "abcde", b: "ace" }, rationale: "three shared letters" },
      { input: { a: "abc", b: "def" }, rationale: "no shared letter" },
    ],
    "print-lcs": [
      { input: { a: "abcde", b: "ace" }, rationale: "one longest subsequence" },
      { input: { a: "abac", b: "cab" }, rationale: "the smaller of two subsequences" },
    ],
    "longest-common-substring": [
      { input: { a: "abcde", b: "abfce" }, rationale: "a block of length two" },
      { input: { a: "z", b: "z" }, rationale: "one shared letter" },
    ],
    "longest-palindromic-subsequence": [
      { input: { s: "bbbab" }, rationale: "four letters form a palindrome" },
      { input: { s: "a" }, rationale: "one letter" },
    ],
    "min-palindrome-insertions": [
      { input: { s: "mbadm" }, rationale: "two insertions" },
      { input: { s: "a" }, rationale: "already a palindrome" },
    ],
    "string-conversions": [
      { input: { source: "sea", target: "eat" }, rationale: "one deletion and one insertion" },
      { input: { source: "a", target: "a" }, rationale: "identical strings" },
    ],
    "shortest-supersequence": [
      { input: { a: "abac", b: "cab" }, rationale: "a shared subsequence written once" },
      { input: { a: "aaaaaaaa", b: "aaaaaaaa" }, rationale: "identical strings" },
    ],
    "distinct-subsequences": [
      { input: { s: "rabbbit", t: "rabbit" }, rationale: "three ways to pick the letters" },
      { input: { s: "abc", t: "" }, rationale: "an empty target" },
    ],
    "edit-distance": [
      { input: { source: "horse", target: "ros" }, rationale: "three edits" },
      { input: { source: "", target: "" }, rationale: "two empty strings" },
    ],
    "stock-profit": [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, rationale: "one buy and one sale" },
      { input: { prices: [1] }, rationale: "one day" },
    ],
    "stock-profit-ii": [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, rationale: "every rise" },
      { input: { prices: [7, 6, 4, 3, 1] }, rationale: "a falling list" },
    ],
    "stock-profit-iii": [
      { input: { prices: [3, 3, 5, 0, 0, 3, 1, 4] }, rationale: "at most two trades" },
      { input: { prices: [7, 6, 4, 3, 1] }, rationale: "a falling list" },
    ],
    "stock-profit-iv": [
      { input: { k: 2, prices: [1, 2, 3, 4, 5] }, rationale: "two trades on a rise" },
      { input: { k: 0, prices: [1, 2] }, rationale: "no trades allowed" },
    ],
    "stock-cooldown": [
      { input: { prices: [1, 2, 3, 0, 2] }, rationale: "a required rest day" },
      { input: { prices: [1] }, rationale: "one day" },
    ],
    "stock-fee": [
      { input: { prices: [1, 3, 2, 8, 4, 9], fee: 2 }, rationale: "a fee on each sale" },
      { input: { prices: [1], fee: 2 }, rationale: "one day" },
    ],
    "print-lis": [
      { input: { nums: [10, 9, 2, 5, 3, 7, 101, 18] }, rationale: "the smaller longest sequence" },
      { input: { nums: [] }, rationale: "an empty list" },
    ],
    "largest-divisible": [
      { input: { nums: [1, 2, 3] }, rationale: "two subsets of size two" },
      { input: { nums: [5] }, rationale: "one value" },
    ],
    "string-chain": [
      { input: { words: ["a", "b", "ba", "bca", "bda", "bdca"] }, rationale: "a chain of four words" },
      { input: { words: ["a"] }, rationale: "one word" },
    ],
    "bitonic-subsequence": [
      { input: { nums: [1, 11, 2, 10, 4, 5, 2, 1] }, rationale: "a rise and a fall" },
      { input: { nums: [10, 9, 8] }, rationale: "a decreasing list" },
    ],
    "lis-count": [
      { input: { nums: [1, 3, 5, 4, 7] }, rationale: "two longest sequences" },
      { input: { nums: [] }, rationale: "an empty list" },
    ],
    "matrix-chain": [
      { input: { dims: [40, 20, 30, 10, 30] }, rationale: "four matrices" },
      { input: { dims: [10, 20] }, rationale: "one matrix" },
    ],
    "matrix-chain-bottom": [
      { input: { dims: [10, 20, 30] }, rationale: "two matrices" },
      { input: { dims: [10, 20] }, rationale: "one matrix" },
    ],
    "stick-cuts": [
      { input: { n: 7, cuts: [1, 3, 4, 5] }, rationale: "four required cuts" },
      { input: { n: 4, cuts: [] }, rationale: "no cuts" },
    ],
    "burst-balloons": [
      { input: { nums: [3, 1, 5, 8] }, rationale: "four balloons" },
      { input: { nums: [1] }, rationale: "one balloon" },
    ],
    "boolean-ways": [
      { input: { expression: "T|T&F^T" }, rationale: "several parenthesizations" },
      { input: { expression: "F" }, rationale: "a lone false operand" },
    ],
    "max-sum-partition": [
      { input: { nums: [1, 15, 7, 9, 2, 5, 10], k: 3 }, rationale: "groups of at most three" },
      { input: { nums: [1], k: 1 }, rationale: "one value" },
    ],
    "count-squares": [
      { input: { grid: [[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]] }, rationale: "squares of several sizes" },
      { input: { grid: [[0]] }, rationale: "no ones" },
    ],
    "trie-ops": [
      { input: { commands: ["insert apple", "search apple", "prefix app"] }, rationale: "a stored word and one of its prefixes" },
      { input: { commands: ["search a"] }, rationale: "an empty trie" },
    ],
    "trie-advanced": [
      { input: { commands: ["insert apple", "insert apple", "count apple", "erase apple", "count apple"] }, rationale: "two copies and one removal" },
      { input: { commands: ["count z"] }, rationale: "a missing word" },
    ],
    "longest-prefix-word": [
      { input: { words: ["n", "ni", "nin", "ninj", "ninja", "ninga"] }, rationale: "one complete chain" },
      { input: { words: ["abc"] }, rationale: "prefixes are missing" },
    ],
    "distinct-substrings": [
      { input: { s: "abab" }, rationale: "repeated blocks" },
      { input: { s: "abc" }, rationale: "every block is different" },
    ],
    "max-xor-pair": [
      { input: { nums: [3, 10, 5, 25, 2, 8] }, rationale: "several candidates" },
      { input: { nums: [1, 1] }, rationale: "equal values" },
    ],
    "max-xor-query": [
      { input: { nums: [0, 1, 2, 3, 4], queries: [[3, 1], [1, 3], [5, 6]] }, rationale: "limits that grow" },
      { input: { nums: [1], queries: [[2, 0]] }, rationale: "nothing is small enough" },
    ],
    "count-digits": [
      { input: { n: 12345 }, rationale: "several digits" },
      { input: { n: 0 }, rationale: "zero" },
    ],
    "reverse-number": [
      { input: { n: 120 }, rationale: "a trailing zero" },
      { input: { n: -123 }, rationale: "a negative value" },
    ],
    "palindrome-number": [
      { input: { n: 121 }, rationale: "a palindrome" },
      { input: { n: 10 }, rationale: "a trailing zero" },
    ],
    "gcd-two": [
      { input: { a: 48, b: 18 }, rationale: "a shared divisor" },
      { input: { a: 7, b: 13 }, rationale: "coprime values" },
    ],
    "armstrong-number": [
      { input: { n: 153 }, rationale: "a three-digit match" },
      { input: { n: 123 }, rationale: "not a match" },
    ],
    "prime-check": [
      { input: { n: 17 }, rationale: "a prime" },
      { input: { n: 1 }, rationale: "one is not prime" },
    ],
    "print-1-to-n": [
      { input: { n: 5 }, rationale: "a short ascent" },
      { input: { n: 1 }, rationale: "a single number" },
    ],
    "print-n-to-1": [
      { input: { n: 5 }, rationale: "a short descent" },
      { input: { n: 1 }, rationale: "a single number" },
    ],
    "sum-first-n": [
      { input: { n: 5 }, rationale: "a small sum" },
      { input: { n: 100000 }, rationale: "a sum past 32 bits" },
    ],
    "factorial-n": [
      { input: { n: 5 }, rationale: "a small product" },
      { input: { n: 0 }, rationale: "the empty product" },
    ],
    "reverse-array": [
      { input: { nums: [1, 2, 3] }, rationale: "three values" },
      { input: { nums: [] }, rationale: "an empty list" },
    ],
    "fibonacci-number": [
      { input: { n: 5 }, rationale: "a small index" },
      { input: { n: 0 }, rationale: "the zero term" },
    ],
    "element-frequencies": [
      { input: { nums: [1, 2, 1, 3, 2] }, rationale: "repeated values" },
      { input: { nums: [4] }, rationale: "one value" },
    ],
    "highest-occurring": [
      { input: { nums: [1, 2, 2, 3, 1] }, rationale: "a tie" },
      { input: { nums: [4] }, rationale: "one value" },
    ],
    "sum-k-any": [
      { input: { nums: [1, -1, 5, -2, 3], k: 3 }, rationale: "negatives inside the window" },
      { input: { nums: [1], k: 2 }, rationale: "no matching subarray" },
    ],
    "max-sum-subarray": [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, rationale: "a mixed sequence" },
      { input: { nums: [-2, -1] }, rationale: "all negative" },
    ],
    "pascal-triangle": [
      { input: { n: 5 }, rationale: "five rows" },
      { input: { n: 1 }, rationale: "the first row" },
    ],
    "majority-element-ii": [
      { input: { nums: [3, 2, 3] }, rationale: "one frequent value" },
      { input: { nums: [1, 2] }, rationale: "both values qualify" },
    ],
    "four-sum": [
      { input: { nums: [1, 0, -1, 0, -2, 2], target: 0 }, rationale: "several quadruplets" },
      { input: { nums: [1, 2, 3], target: 6 }, rationale: "too few values" },
    ],
    "zero-sum-length": [
      { input: { nums: [15, -2, 2, -8, 1, 7, 10, 23] }, rationale: "a zero-sum span" },
      { input: { nums: [1, 2, 3] }, rationale: "no zero sum" },
    ],
    "subarray-xor-k": [
      { input: { nums: [4, 2, 2, 6, 4], k: 6 }, rationale: "several windows" },
      { input: { nums: [0], k: 0 }, rationale: "a single zero" },
    ],
    "merge-sorted-arrays": [
      { input: { first: [1, 3, 5, 7], second: [0, 2, 6, 8, 9] }, rationale: "two nonempty sides" },
      { input: { first: [], second: [1, 2] }, rationale: "an empty side" },
    ],
    "count-inversions": [
      { input: { nums: [2, 4, 1, 3, 5] }, rationale: "a few inversions" },
      { input: { nums: [1] }, rationale: "one value" },
    ],
    "reverse-pairs": [
      { input: { nums: [1, 3, 2, 3, 1] }, rationale: "pairs beyond twice" },
      { input: { nums: [1, 1] }, rationale: "equals do not count" },
    ],
    "upper-bound": [
      { input: { values: [1, 2, 2, 3], target: 2 }, rationale: "duplicates of the target" },
      { input: { values: [1, 2, 2, 3], target: 4 }, rationale: "past the end" },
    ],
    "count-occurrences": [
      { input: { values: [1, 1, 2, 2, 2, 3], target: 2 }, rationale: "a repeated target" },
      { input: { values: [1, 1, 2, 2, 2, 3], target: 4 }, rationale: "a missing target" },
    ],
    "rotation-count": [
      { input: { values: [3, 4, 5, 1, 2] }, rationale: "rotated three places" },
      { input: { values: [1, 2, 3] }, rationale: "not rotated" },
    ],
    "gas-stations": [
      { input: { stations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k: 9 }, rationale: "one station per gap" },
      { input: { stations: [1, 2], k: 0 }, rationale: "no new stations" },
    ],
    "median-two-sorted": [
      { input: { first: [1, 3], second: [2] }, rationale: "an odd combined length" },
      { input: { first: [1, 2], second: [3, 4] }, rationale: "an even combined length" },
    ],
    "search-matrix-ii": [
      { input: { matrix: [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target: 5 }, rationale: "a present target" },
      { input: { matrix: [[1, 4, 7], [2, 5, 8], [3, 6, 9]], target: 10 }, rationale: "a missing target" },
    ],
    "peak-element-ii": [
      { input: { matrix: [[1, 4], [3, 2]] }, rationale: "a two-by-two grid" },
      { input: { matrix: [[7]] }, rationale: "one cell" },
    ],
    "outer-parentheses": [
      { input: { s: "(()())(())" }, rationale: "two primitive pieces" },
      { input: { s: "()()" }, rationale: "only outer pairs" },
    ],
    "frequency-sort": [
      { input: { s: "tree" }, rationale: "one letter is repeated" },
      { input: { s: "cccaaa" }, rationale: "a frequency tie" },
    ],
    "roman-integer": [
      { input: { s: "III" }, rationale: "repeated addition" },
      { input: { s: "MCMXCIV" }, rationale: "subtractive pairs" },
    ],
    "count-k-substrings": [
      { input: { s: "aba", k: 2 }, rationale: "exactly two letters" },
      { input: { s: "abc", k: 3 }, rationale: "the whole string" },
    ],
    "beauty-sum": [
      { input: { s: "aabcb" }, rationale: "several substrings" },
      { input: { s: "a" }, rationale: "one letter" },
    ],
    "reverse-each-word": [
      { input: { line: "hello world" }, rationale: "two words" },
      { input: { line: "ab  cd" }, rationale: "a repeated space" },
    ],
    "bracket-reversals": [
      { input: { expression: "}{" }, rationale: "two reversals" },
      { input: { expression: "{" }, rationale: "an odd length" },
    ],
    "count-and-say": [
      { input: { n: 1 }, rationale: "the first term" },
      { input: { n: 4 }, rationale: "a later term" },
    ],
    "rabin-karp": [
      { input: { text: "aabaacaadaabaaba", pattern: "aaba" }, rationale: "several matches" },
      { input: { text: "abc", pattern: "d" }, rationale: "no match" },
    ],
    "z-function": [
      { input: { s: "aabaab" }, rationale: "a repeated prefix" },
      { input: { s: "abc" }, rationale: "no repeated prefix" },
    ],
    "longest-happy-prefix": [
      { input: { s: "ababab" }, rationale: "a long border" },
      { input: { s: "abc" }, rationale: "no border" },
    ],
    "palindromic-subsequences": [
      { input: { s: "aba" }, rationale: "a short palindrome" },
      { input: { s: "abcd" }, rationale: "only single letters" },
    ],
    "max-ones-iii": [
      { input: { nums: [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k: 2 }, rationale: "two flips" },
      { input: { nums: [0], k: 0 }, rationale: "no flips allowed" },
    ],
    "fruit-baskets": [
      { input: { fruits: [1, 2, 1] }, rationale: "two types" },
      { input: { fruits: [0, 1, 2, 2] }, rationale: "a third type" },
    ],
    "binary-subarray-sum": [
      { input: { nums: [1, 0, 1, 0, 1], goal: 2 }, rationale: "sum two" },
      { input: { nums: [0, 0, 0, 0, 0], goal: 0 }, rationale: "every window sums to zero" },
    ],
    "nice-subarrays": [
      { input: { nums: [1, 1, 2, 1, 1], k: 3 }, rationale: "three odds" },
      { input: { nums: [2, 4, 6], k: 1 }, rationale: "no odds" },
    ],
    "substrings-with-abc": [
      { input: { s: "abcabc" }, rationale: "all three letters repeat" },
      { input: { s: "ab" }, rationale: "a letter is missing" },
    ],
    "card-points": [
      { input: { points: [1, 2, 3, 4, 5, 6, 1], k: 3 }, rationale: "three cards from the ends" },
      { input: { points: [5], k: 0 }, rationale: "take nothing" },
    ],
    "k-distinct-subarrays": [
      { input: { nums: [1, 2, 1, 2, 3], k: 2 }, rationale: "exactly two values" },
      { input: { nums: [1], k: 1 }, rationale: "one value" },
    ],
    "window-subsequence": [
      { input: { source: "abcdebdde", target: "bde" }, rationale: "a subsequence window" },
      { input: { source: "abc", target: "d" }, rationale: "target is absent" },
    ],
  };
  return probes[slug] ?? [];
}
