import { problem } from "./helpers.js";

const pairOut = (call: string) => `printJson(Json::ints(${call}));`;

export const searchCoreProblems = [
  problem({
    slug: "catalog-spot",
    title: "Binary Search",
    difficulty: "EASY",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "A parts catalog is sorted by strictly increasing part number. Return the index of target, or -1 when that part is not stocked. The hidden catalogs are too long for a scan.",
    constraints: ["1 <= values.length <= 100000", "values is strictly increasing", "-1e9 <= values[i], target <= 1e9"],
    examples: [
      { input: "values = [1, 3, 5, 7], target = 5", output: "2" },
      { input: "values = [1, 3, 5, 7], target = 2", output: "-1" },
    ],
    signature: "int catalogSpot(vector<int>& values, int target)",
    functionName: "catalogSpot",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.catalogSpot(values, (int)in["target"].asInt())));`,
    method: `int catalogSpot(vector<int>& values, int target) {
        int lo = 0, hi = (int)values.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (values[mid] == target) return mid;
            if (values[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "The catalog is fully ordered. Once you look at the middle part, one side cannot contain the target.",
      "Keep a closed window of indexes that might still hold the part.",
      "If the middle part is too small, move the left edge to the next index. If it is too large, move the right edge to the previous index. Equal means you found it.",
      "This is ordinary binary search. Include mid in the comparison, then drop it from the window so the loop cannot stall. When the window collapses, the part is absent. Time is logarithmic and extra memory is constant.",
    ],
    tests: [
      { input: { values: [1, 3, 5, 7], target: 5 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { values: [1, 3, 5, 7], target: 2 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { values: [4], target: 4 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [4], target: 5 }, expectedOutput: -1, visibility: "HIDDEN" },
      { input: { values: [-3, -1, 0, 8], target: -1 }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "badge-slot",
    title: "Lower Bound",
    difficulty: "EASY",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Badges hang on a rack in nondecreasing order. Return the index where a new badge should be inserted so the rack stays sorted. If that number is already present, return the first index that holds it.",
    constraints: ["1 <= values.length <= 100000", "values is nondecreasing", "-1e9 <= values[i], badge <= 1e9"],
    examples: [
      { input: "values = [1, 3, 5, 6], badge = 5", output: "2" },
      { input: "values = [1, 3, 5, 6], badge = 7", output: "4" },
      { input: "values = [1, 3, 5, 6], badge = 0", output: "0" },
    ],
    signature: "int badgeSlot(vector<int>& values, int badge)",
    functionName: "badgeSlot",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.badgeSlot(values, (int)in["badge"].asInt())));`,
    method: `int badgeSlot(vector<int>& values, int badge) {
        int lo = 0, hi = (int)values.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (values[mid] < badge) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "You are not asked whether the badge exists. You are asked for the first index whose current badge is not smaller than the new one.",
      "Search a half-open window. The right edge can sit one past the last badge, which is the answer when the new badge is the largest.",
      "When the middle badge is smaller, the slot is strictly to its right. Otherwise the slot is at mid or to its left, so pull the right edge onto mid.",
      "This is a lower-bound search. The loop ends when the two edges meet, and that index is the insertion slot. It may equal the length of the rack. Time is logarithmic.",
    ],
    tests: [
      { input: { values: [1, 3, 5, 6], badge: 5 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { values: [1, 3, 5, 6], badge: 7 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { values: [1, 3, 5, 6], badge: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [1, 1, 1], badge: 1 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [1, 3, 5, 6], badge: 2 }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "ticket-span",
    title: "First and Last Occurrence",
    difficulty: "EASY",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "A ticket log is sorted in nondecreasing order. Return the first and last indexes of ticket. When it never appears, return [-1, -1].",
    constraints: ["1 <= tickets.length <= 100000", "tickets is nondecreasing", "-1e9 <= tickets[i], ticket <= 1e9"],
    examples: [
      { input: "tickets = [5, 7, 7, 8, 8, 10], ticket = 8", output: "[3, 4]" },
      { input: "tickets = [5, 7, 7, 8, 8, 10], ticket = 6", output: "[-1, -1]" },
    ],
    signature: "vector<int> ticketSpan(vector<int>& tickets, int ticket)",
    functionName: "ticketSpan",
    driver: `auto tickets = in["tickets"].asIntVector();\n    ${pairOut('sol.ticketSpan(tickets, (int)in["ticket"].asInt())')}`,
    method: `vector<int> ticketSpan(vector<int>& tickets, int ticket) {
        int left = 0, right = (int)tickets.size() - 1, first = -1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (tickets[mid] >= ticket) { if (tickets[mid] == ticket) first = mid; right = mid - 1; }
            else left = mid + 1;
        }
        if (first == -1) return {-1, -1};
        left = first; right = (int)tickets.size() - 1; int last = first;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (tickets[mid] <= ticket) { last = mid; left = mid + 1; }
            else right = mid - 1;
        }
        return {first, last};
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "A matching ticket, if it exists, occupies one contiguous block. You need both ends of that block.",
      "Two binary searches are enough: one for the leftmost match and one for the rightmost match.",
      "For the left end, a match is still a reason to keep looking further left. For the right end, a match is a reason to keep looking further right.",
      "If the left search never sees the ticket, both ends are -1. Otherwise the right search starts at the first match and walks toward higher indexes. Each search is logarithmic.",
    ],
    tests: [
      { input: { tickets: [5, 7, 7, 8, 8, 10], ticket: 8 }, expectedOutput: [3, 4], visibility: "SAMPLE" },
      { input: { tickets: [5, 7, 7, 8, 8, 10], ticket: 6 }, expectedOutput: [-1, -1], visibility: "SAMPLE" },
      { input: { tickets: [1], ticket: 1 }, expectedOutput: [0, 0], visibility: "HIDDEN" },
      { input: { tickets: [2, 2, 2], ticket: 2 }, expectedOutput: [0, 2], visibility: "HIDDEN" },
      { input: { tickets: [1, 2, 3], ticket: 3 }, expectedOutput: [2, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "floor-quote",
    title: "Floor in a Sorted Array",
    difficulty: "EASY",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Quoted prices are sorted in nondecreasing order and are never negative. Return the largest price that does not exceed budget. If every price is over budget, return -1.",
    constraints: ["1 <= prices.length <= 100000", "prices is nondecreasing", "0 <= prices[i], budget <= 1e9"],
    examples: [
      { input: "prices = [2, 3, 5, 9], budget = 6", output: "5" },
      { input: "prices = [2, 3, 5, 9], budget = 1", output: "-1" },
    ],
    signature: "int floorQuote(vector<int>& prices, int budget)",
    functionName: "floorQuote",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::number(sol.floorQuote(prices, (int)in["budget"].asInt())));`,
    method: `int floorQuote(vector<int>& prices, int budget) {
        int lo = 0, hi = (int)prices.size() - 1, ans = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (prices[mid] <= budget) { ans = prices[mid]; lo = mid + 1; }
            else hi = mid - 1;
        }
        return ans;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "Among the prices you can afford, you want the greatest one. The sorted order tells you which side can still beat the current candidate.",
      "Remember the best affordable price seen so far, and keep searching to its right.",
      "When the middle price fits the budget, save it and move left to mid + 1. When it is too expensive, the answer can only be to the left.",
      "A price of zero is a real quote, so -1 means none of the quotes fit, not that the quote itself is zero. The search is logarithmic.",
    ],
    tests: [
      { input: { prices: [2, 3, 5, 9], budget: 6 }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { prices: [2, 3, 5, 9], budget: 1 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { prices: [2, 3, 5, 9], budget: 9 }, expectedOutput: 9, visibility: "HIDDEN" },
      { input: { prices: [0, 0, 4], budget: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { prices: [2, 3, 5, 9], budget: 100 }, expectedOutput: 9, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "ceil-quote",
    title: "Ceil in a Sorted Array",
    difficulty: "EASY",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Quoted prices are sorted in nondecreasing order and are never negative. Return the smallest price that is at least offer. If every price is below the offer, return -1.",
    constraints: ["1 <= prices.length <= 100000", "prices is nondecreasing", "0 <= prices[i], offer <= 1e9"],
    examples: [
      { input: "prices = [2, 3, 5, 9], offer = 6", output: "9" },
      { input: "prices = [2, 3, 5, 9], offer = 10", output: "-1" },
    ],
    signature: "int ceilQuote(vector<int>& prices, int offer)",
    functionName: "ceilQuote",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::number(sol.ceilQuote(prices, (int)in["offer"].asInt())));`,
    method: `int ceilQuote(vector<int>& prices, int offer) {
        int lo = 0, hi = (int)prices.size() - 1, ans = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (prices[mid] >= offer) { ans = prices[mid]; hi = mid - 1; }
            else lo = mid + 1;
        }
        return ans;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "You want the cheapest quote that still meets the offer. Everything left of a too-cheap price can be ignored.",
      "Save a price when it meets the offer, then look left for a cheaper one that also meets it.",
      "When the middle price is below the offer, move the left edge to mid + 1. Otherwise remember it and move the right edge to mid - 1.",
      "This is an upper-side search for the first sufficient price. If the window empties without a save, no quote is high enough and the answer is -1.",
    ],
    tests: [
      { input: { prices: [2, 3, 5, 9], offer: 6 }, expectedOutput: 9, visibility: "SAMPLE" },
      { input: { prices: [2, 3, 5, 9], offer: 10 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { prices: [2, 3, 5, 9], offer: 2 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { prices: [2, 3, 5, 9], offer: 0 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { prices: [0], offer: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "courtyard-side",
    title: "Square Root",
    difficulty: "EASY",
    topics: ["binary-search"],
    tags: ["binary-search"],
    statement:
      "A square courtyard has integer area. Return the greatest integer side length whose square does not exceed area. Area zero has side zero.",
    constraints: ["0 <= area <= 1000000000"],
    examples: [
      { input: "area = 8", output: "2" },
      { input: "area = 9", output: "3" },
      { input: "area = 0", output: "0" },
    ],
    signature: "int courtyardSide(int area)",
    functionName: "courtyardSide",
    driver: `printJson(Json::number(sol.courtyardSide((int)in["area"].asInt())));`,
    method: `int courtyardSide(int area) {
        long long lo = 0, hi = area;
        while (lo < hi) {
            long long mid = lo + (hi - lo + 1) / 2;
            if (mid * mid <= area) lo = mid;
            else hi = mid - 1;
        }
        return (int)lo;
    }`,
    expectedTime: "O(log area)",
    expectedSpace: "O(1)",
    hints: [
      "The allowed side lengths form a range from zero up to area. You want the largest side that is still legal.",
      "Binary search the side, not the area. A side is legal when its square is at most the area.",
      "Because you are maximizing, probe the upper half of the current window. If that side fits, keep it and try larger. If it does not, every larger side fails too.",
      "Multiply the candidate in a 64-bit integer. The square of a value near one billion does not fit in a 32-bit int. The answer for zero is zero, and the search is logarithmic in the area.",
    ],
    tests: [
      { input: { area: 8 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { area: 9 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { area: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { area: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { area: 1000000000 }, expectedOutput: 31622, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "ridge-peak",
    title: "Find Peak Element",
    difficulty: "EASY",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "A ridge rises strictly and then falls strictly, so it has one peak. Return the index of that peak. The ridge has at least three heights.",
    constraints: ["3 <= heights.length <= 100000", "heights rises strictly, then falls strictly", "-1e9 <= heights[i] <= 1e9"],
    examples: [
      { input: "heights = [1, 3, 5, 4, 2]", output: "2" },
      { input: "heights = [0, 10, 5]", output: "1" },
    ],
    signature: "int ridgePeak(vector<int>& heights)",
    functionName: "ridgePeak",
    driver: `auto heights = in["heights"].asIntVector();\n    printJson(Json::number(sol.ridgePeak(heights)));`,
    method: `int ridgePeak(vector<int>& heights) {
        int lo = 0, hi = (int)heights.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (heights[mid] < heights[mid + 1]) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "From any step you can tell which way the peak is. If the next height is higher, the peak is still ahead.",
      "Compare two neighbors and discard the side that is still climbing away from the peak.",
      "When heights[mid] < heights[mid + 1], move the left edge to mid + 1. Otherwise the peak is at mid or to its left, so move the right edge onto mid.",
      "The window stays on the rising side or on the peak. It shrinks until both edges name the same index. That index is the peak, and the walk is logarithmic.",
    ],
    tests: [
      { input: { heights: [1, 3, 5, 4, 2] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { heights: [0, 10, 5] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { heights: [1, 2, 3, 1] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { heights: [1, 5, 4, 3, 2, 1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { heights: [1, 2, 3, 4, 1] }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "rotated-low",
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "A sorted list of distinct integers was rotated some unknown number of places, possibly zero. Return the smallest value. A full scan is too slow for the hidden lists.",
    constraints: ["1 <= values.length <= 10000", "All values are distinct.", "-1e9 <= values[i] <= 1e9"],
    examples: [
      { input: "values = [3, 4, 5, 1, 2]", output: "1" },
      { input: "values = [11, 13, 15, 17]", output: "11" },
    ],
    signature: "int rotatedLow(vector<int>& values)",
    functionName: "rotatedLow",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.rotatedLow(values)));`,
    method: `int rotatedLow(vector<int>& values) {
        int lo = 0, hi = (int)values.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (values[mid] > values[hi]) lo = mid + 1;
            else hi = mid;
        }
        return values[lo];
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "Rotation leaves one cliff, where a large value is followed by a smaller one. The minimum sits at the bottom of that cliff, or at the front when there was no rotation.",
      "Compare the middle value with the right edge of the window. That comparison tells you which side still contains the cliff.",
      "If the middle value is greater than the right edge, the minimum is strictly to the right of mid. Otherwise the minimum is at mid or to its left, so the right edge can move onto mid.",
      "Do not drop mid when it might be the minimum. A list that was never rotated returns its first value. The search is logarithmic because the values are distinct.",
    ],
    tests: [
      { input: { values: [3, 4, 5, 1, 2] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { values: [11, 13, 15, 17] }, expectedOutput: 11, visibility: "SAMPLE" },
      { input: { values: [4, 5, 6, 7, 0, 1, 2] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { values: [2, 1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "repeat-shift",
    title: "Search in Rotated Sorted Array II",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "A sorted list was rotated, and duplicate values are allowed. Return whether target appears. Worst-case duplicates can force a slower walk, but a binary search still handles the usual cases.",
    constraints: ["1 <= values.length <= 10000", "-1e9 <= values[i], target <= 1e9"],
    examples: [
      { input: "values = [2, 5, 6, 0, 0, 1, 2], target = 0", output: "true" },
      { input: "values = [2, 5, 6, 0, 0, 1, 2], target = 3", output: "false" },
    ],
    signature: "bool repeatShift(vector<int>& values, int target)",
    functionName: "repeatShift",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::boolean(sol.repeatShift(values, (int)in["target"].asInt())));`,
    method: `bool repeatShift(vector<int>& values, int target) {
        int lo = 0, hi = (int)values.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (values[mid] == target) return true;
            if (values[lo] == values[mid] && values[mid] == values[hi]) { lo++; hi--; }
            else if (values[lo] <= values[mid]) {
                if (values[lo] <= target && target < values[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else if (values[mid] < target && target <= values[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }`,
    expectedTime: "O(log n) average, O(n) worst",
    expectedSpace: "O(1)",
    hints: [
      "Duplicates can make both ends of the window look like the middle, so you cannot always tell which half is sorted.",
      "When the left edge, the middle, and the right edge are equal and none is the target, shrink both edges by one and try again.",
      "Otherwise the usual rotated search applies: the half that is ordered can be tested as a range, and the other half is searched when the target is outside that range.",
      "Equal ends are the only extra case. Skipping them one step at a time is what makes the worst case linear. Every other step still discards half of the remaining window.",
    ],
    tests: [
      { input: { values: [2, 5, 6, 0, 0, 1, 2], target: 0 }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { values: [2, 5, 6, 0, 0, 1, 2], target: 3 }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { values: [1, 0, 1, 1, 1], target: 0 }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { values: [1, 1, 1, 1], target: 2 }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { values: [1], target: 1 }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "odd-beacon",
    title: "Single Element in a Sorted Array",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "A sorted signal lists every code twice, except one beacon that appears once. Return that beacon. The list length is odd, and a linear count is too slow for the hidden signals.",
    constraints: ["1 <= values.length <= 100001", "values.length is odd", "values is sorted", "Every value except one appears twice.", "-1e9 <= values[i] <= 1e9"],
    examples: [
      { input: "values = [1, 1, 2, 3, 3, 4, 4, 8, 8]", output: "2" },
      { input: "values = [3, 3, 7, 7, 10, 11, 11]", output: "10" },
    ],
    signature: "int oddBeacon(vector<int>& values)",
    functionName: "oddBeacon",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.oddBeacon(values)));`,
    method: `int oddBeacon(vector<int>& values) {
        int lo = 0, hi = (int)values.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (mid % 2 == 1) mid--;
            if (values[mid] == values[mid + 1]) lo = mid + 2;
            else hi = mid;
        }
        return values[lo];
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "Before the single beacon, pairs occupy even-then-odd indexes. After it, that pairing is shifted.",
      "Inspect an even index and the index just after it. If they match, the beacon is still to the right.",
      "Force mid onto an even index. When values[mid] equals values[mid + 1], move the left edge to mid + 2. Otherwise the beacon is at mid or to its left.",
      "The window always starts on a possible beacon. It ends on the only index whose partner does not match. That value is the answer, found in logarithmic time.",
    ],
    tests: [
      { input: { values: [1, 1, 2, 3, 3, 4, 4, 8, 8] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { values: [3, 3, 7, 7, 10, 11, 11] }, expectedOutput: 10, visibility: "SAMPLE" },
      { input: { values: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [1, 1, 2] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { values: [1, 2, 2] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "flat-grid",
    title: "Search a 2D Matrix",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Each row of a grid is sorted, and the first value of every row is strictly greater than the last value of the row above it. Return the row and column of target, or [-1, -1] when it is absent.",
    constraints: ["1 <= rows, columns <= 100", "The grid reads as one increasing sequence from left to right, top to bottom.", "-1000 <= grid[r][c], target <= 1000"],
    examples: [
      { input: "grid = [[1, 3, 5], [7, 9, 11]], target = 9", output: "[1, 1]" },
      { input: "grid = [[1, 3, 5], [7, 9, 11]], target = 2", output: "[-1, -1]" },
    ],
    signature: "vector<int> flatGrid(vector<vector<int>>& grid, int target)",
    functionName: "flatGrid",
    driver: `auto grid = in["grid"].asIntMatrix();\n    ${pairOut('sol.flatGrid(grid, (int)in["target"].asInt())')}`,
    method: `vector<int> flatGrid(vector<vector<int>>& grid, int target) {
        int rows = (int)grid.size(), cols = (int)grid[0].size();
        int lo = 0, hi = rows * cols - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int value = grid[mid / cols][mid % cols];
            if (value == target) return {mid / cols, mid % cols};
            if (value < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return {-1, -1};
    }`,
    expectedTime: "O(log (rows * columns))",
    expectedSpace: "O(1)",
    hints: [
      "The grid is already one sorted sequence if you read it row by row. You do not need a search per row.",
      "Binary search an index in the range 0 through rows * columns - 1, then convert that index into a row and column.",
      "Row is index divided by the column count, and column is the remainder. Compare the cell at that position with the target and move the window as in an ordinary search.",
      "A hit returns that row and column. An empty window returns [-1, -1]. The search is logarithmic in the number of cells.",
    ],
    tests: [
      { input: { grid: [[1, 3, 5], [7, 9, 11]], target: 9 }, expectedOutput: [1, 1], visibility: "SAMPLE" },
      { input: { grid: [[1, 3, 5], [7, 9, 11]], target: 2 }, expectedOutput: [-1, -1], visibility: "SAMPLE" },
      { input: { grid: [[1]], target: 1 }, expectedOutput: [0, 0], visibility: "HIDDEN" },
      { input: { grid: [[1, 2], [3, 4]], target: 4 }, expectedOutput: [1, 1], visibility: "HIDDEN" },
      { input: { grid: [[1, 4, 7], [10, 12, 15]], target: 7 }, expectedOutput: [0, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "busiest-row",
    title: "Row with Maximum Ones",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Each row of a sign-in sheet is zeros followed by ones. Return the smallest row index that contains the most ones. If every row is all zeros, return -1.",
    constraints: ["1 <= rows, columns <= 100", "Each row is zeros followed by ones."],
    examples: [
      { input: "grid = [[0, 0, 1, 1], [0, 1, 1, 1], [0, 0, 0, 1]]", output: "1" },
      { input: "grid = [[0, 0], [0, 0]]", output: "-1" },
    ],
    signature: "int busiestRow(vector<vector<int>>& grid)",
    functionName: "busiestRow",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.busiestRow(grid)));`,
    method: `int busiestRow(vector<vector<int>>& grid) {
        int best = -1, most = 0;
        for (int row = 0; row < (int)grid.size(); row++) {
            int lo = 0, hi = (int)grid[row].size();
            while (lo < hi) {
                int mid = lo + (hi - lo) / 2;
                if (grid[row][mid] == 0) lo = mid + 1;
                else hi = mid;
            }
            int ones = (int)grid[row].size() - lo;
            if (ones > most) { most = ones; best = row; }
        }
        return best;
    }`,
    expectedTime: "O(rows * log columns)",
    expectedSpace: "O(1)",
    hints: [
      "You do not need to count the ones one by one. Each row changes from zero to one at a single index.",
      "Binary search the first one in the row. The number of ones is the width minus that index.",
      "Keep the best count and the smallest row that achieved it. Update only when the new count is strictly larger, so an earlier tie stays in front.",
      "A row of all zeros contributes nothing. If no row has a one, the answer stays -1. Each row costs a logarithmic search.",
    ],
    tests: [
      { input: { grid: [[0, 0, 1, 1], [0, 1, 1, 1], [0, 0, 0, 1]] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { grid: [[0, 0], [0, 0]] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { grid: [[1, 1], [1, 1]] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { grid: [[0, 1], [1, 1]] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { grid: [[0, 0, 0], [0, 0, 1], [0, 0, 1]] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "missing-token",
    title: "Kth Missing Positive Number",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Tokens already issued form a strictly increasing list of positive integers. Return the kth positive integer that is not in the list.",
    constraints: ["1 <= values.length <= 10000", "1 <= values[i] <= 1e9", "values is strictly increasing", "1 <= k <= 1e9"],
    examples: [
      { input: "values = [2, 3, 4, 7, 11], k = 5", output: "9" },
      { input: "values = [1, 2, 3, 4], k = 2", output: "6" },
    ],
    signature: "int missingToken(vector<int>& values, int k)",
    functionName: "missingToken",
    driver: `auto values = in["values"].asIntVector();\n    printJson(Json::number(sol.missingToken(values, (int)in["k"].asInt())));`,
    method: `int missingToken(vector<int>& values, int k) {
        int lo = 0, hi = (int)values.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            int missing = values[mid] - mid - 1;
            if (missing < k) lo = mid + 1;
            else hi = mid;
        }
        return lo + k;
    }`,
    expectedTime: "O(log n)",
    expectedSpace: "O(1)",
    hints: [
      "At index i, the value values[i] would be i + 1 if nothing were missing. The difference is how many positive integers are missing up to that point.",
      "Binary search the first index where the number of missing positives is at least k.",
      "The missing count at mid is values[mid] - mid - 1. If that is still below k, the answer is to the right. Otherwise it is at mid or to the left.",
      "When the search stops at index lo, the kth missing value is lo + k. If the whole list is missing fewer than k positives, lo is the length and the same formula still holds.",
    ],
    tests: [
      { input: { values: [2, 3, 4, 7, 11], k: 5 }, expectedOutput: 9, visibility: "SAMPLE" },
      { input: { values: [1, 2, 3, 4], k: 2 }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { values: [2], k: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { values: [1, 2, 4], k: 1 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { values: [5, 6, 7], k: 4 }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "snack-pace",
    title: "Koko Eating Bananas",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Each pile holds some snacks. In one minute you eat pace snacks from a single pile, or finish that pile if fewer remain. You may switch piles only when the minute ends. Return the smallest pace that finishes every pile within hours minutes. hours is at least the number of piles.",
    constraints: ["1 <= piles.length <= 10000", "1 <= piles[i] <= 1e9", "piles.length <= hours <= 1e9"],
    examples: [
      { input: "piles = [3, 6, 7, 11], hours = 8", output: "4" },
      { input: "piles = [30, 11, 23, 4, 20], hours = 5", output: "30" },
    ],
    signature: "int snackPace(vector<int>& piles, int hours)",
    functionName: "snackPace",
    driver: `auto piles = in["piles"].asIntVector();\n    printJson(Json::number(sol.snackPace(piles, (int)in["hours"].asInt())));`,
    method: `int snackPace(vector<int>& piles, int hours) {
        int lo = 1, hi = *max_element(piles.begin(), piles.end());
        auto fits = [&](int pace) {
            long long need = 0;
            for (int pile : piles) need += (pile + pace - 1LL) / pace;
            return need <= hours;
        };
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (fits(mid)) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }`,
    expectedTime: "O(n log maxPile)",
    expectedSpace: "O(1)",
    hints: [
      "A faster pace always finishes in the same number of minutes or fewer. Search the pace, not the piles.",
      "The slowest pace worth trying is 1. The fastest you might need is the largest pile, which finishes that pile in one minute.",
      "For a candidate pace, the minutes for a pile are ceil(pile / pace). Sum those minutes in a 64-bit integer and ask whether the sum is within hours.",
      "Keep the smallest pace that fits. If the middle pace finishes in time, try a slower one. The answer exists because hours is at least the number of piles.",
    ],
    tests: [
      { input: { piles: [3, 6, 7, 11], hours: 8 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { piles: [30, 11, 23, 4, 20], hours: 5 }, expectedOutput: 30, visibility: "SAMPLE" },
      { input: { piles: [30, 11, 23, 4, 20], hours: 6 }, expectedOutput: 23, visibility: "HIDDEN" },
      { input: { piles: [1], hours: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { piles: [5, 5], hours: 4 }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lane-capacity",
    title: "Capacity to Ship Packages Within D Days",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Packages must ship in the order given. One lane sails each day and may carry any prefix of the remaining packages whose weights sum to at most its capacity. Return the smallest capacity that delivers every package within days days.",
    constraints: ["1 <= weights.length <= 10000", "1 <= weights[i] <= 10000", "1 <= days <= weights.length"],
    examples: [
      { input: "weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5", output: "15" },
      { input: "weights = [3, 2, 2, 4, 1, 4], days = 3", output: "6" },
    ],
    signature: "int laneCapacity(vector<int>& weights, int days)",
    functionName: "laneCapacity",
    driver: `auto weights = in["weights"].asIntVector();\n    printJson(Json::number(sol.laneCapacity(weights, (int)in["days"].asInt())));`,
    method: `int laneCapacity(vector<int>& weights, int days) {
        long long lo = 0, hi = 0;
        for (int weight : weights) { lo = max(lo, (long long)weight); hi += weight; }
        auto fits = [&](long long cap) {
            int used = 1; long long run = 0;
            for (int weight : weights) {
                if (run + weight > cap) { used++; run = 0; }
                run += weight;
            }
            return used <= days;
        };
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2;
            if (fits(mid)) hi = mid;
            else lo = mid + 1;
        }
        return (int)lo;
    }`,
    expectedTime: "O(n log sum)",
    expectedSpace: "O(1)",
    hints: [
      "If a capacity can finish the route, every larger capacity can too. Binary search the capacity.",
      "The lowest possible capacity is the heaviest single package. The highest you need is the sum of every package, which sails in one day.",
      "To test a capacity, walk the packages in order and start a new day whenever the next package would overflow. Count the days.",
      "Choose the smallest capacity whose day count is within the limit. A package is never split across days, so the capacity cannot be below the heaviest package.",
    ],
    tests: [
      { input: { weights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days: 5 }, expectedOutput: 15, visibility: "SAMPLE" },
      { input: { weights: [3, 2, 2, 4, 1, 4], days: 3 }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { weights: [1, 2, 3, 1, 1], days: 4 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { weights: [10], days: 1 }, expectedOutput: 10, visibility: "HIDDEN" },
      { input: { weights: [1, 2, 3, 4], days: 4 }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stall-gap",
    title: "Aggressive Cows",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Stall positions sit on a line and are strictly increasing. Place markers of them, using the stalls as they are. Return the largest minimum distance you can guarantee between two chosen stalls.",
    constraints: ["2 <= stalls.length <= 10000", "2 <= markers <= stalls.length", "0 <= stalls[i] <= 1e9", "stalls is strictly increasing"],
    examples: [
      { input: "stalls = [1, 2, 4, 8, 9], markers = 3", output: "3" },
      { input: "stalls = [1, 2, 3], markers = 2", output: "2" },
    ],
    signature: "int stallGap(vector<int>& stalls, int markers)",
    functionName: "stallGap",
    driver: `auto stalls = in["stalls"].asIntVector();\n    printJson(Json::number(sol.stallGap(stalls, (int)in["markers"].asInt())));`,
    method: `int stallGap(vector<int>& stalls, int markers) {
        int lo = 0, hi = stalls.back() - stalls.front();
        auto fits = [&](int gap) {
            int used = 1, last = stalls[0];
            for (int i = 1; i < (int)stalls.size(); i++) {
                if (stalls[i] - last >= gap) { used++; last = stalls[i]; }
            }
            return used >= markers;
        };
        while (lo < hi) {
            int mid = lo + (hi - lo + 1) / 2;
            if (fits(mid)) lo = mid;
            else hi = mid - 1;
        }
        return lo;
    }`,
    expectedTime: "O(n log span)",
    expectedSpace: "O(1)",
    hints: [
      "A wider required gap is harder to satisfy. If a gap works, every smaller gap works too, so you can binary search the gap.",
      "Place the first marker in the leftmost stall. Then take the next stall that is at least the candidate gap away, and repeat.",
      "You are maximizing, so when the middle gap fits, keep it and try a larger one. When it does not, every larger gap fails.",
      "The search window is from zero through the distance between the first and last stall. Greedy placement is enough to test a gap because taking the earliest legal stall never hurts a later one.",
    ],
    tests: [
      { input: { stalls: [1, 2, 4, 8, 9], markers: 3 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { stalls: [1, 2, 3], markers: 2 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { stalls: [0, 10], markers: 2 }, expectedOutput: 10, visibility: "HIDDEN" },
      { input: { stalls: [1, 2, 4, 8, 9], markers: 2 }, expectedOutput: 8, visibility: "HIDDEN" },
      { input: { stalls: [1, 3, 5, 7], markers: 4 }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "crew-loads",
    title: "Split Array Largest Sum",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Loads must stay in order and be split into crews non-empty contiguous blocks. Return the smallest possible value of the heaviest block sum.",
    constraints: ["1 <= loads.length <= 10000", "1 <= loads[i] <= 10000", "1 <= crews <= loads.length"],
    examples: [
      { input: "loads = [7, 2, 5, 10, 8], crews = 2", output: "18" },
      { input: "loads = [1, 2, 3, 4], crews = 3", output: "4" },
    ],
    signature: "int crewLoads(vector<int>& loads, int crews)",
    functionName: "crewLoads",
    driver: `auto loads = in["loads"].asIntVector();\n    printJson(Json::number(sol.crewLoads(loads, (int)in["crews"].asInt())));`,
    method: `int crewLoads(vector<int>& loads, int crews) {
        long long lo = 0, hi = 0;
        for (int load : loads) { lo = max(lo, (long long)load); hi += load; }
        auto fits = [&](long long cap) {
            int used = 1; long long run = 0;
            for (int load : loads) {
                if (run + load > cap) { used++; run = 0; }
                run += load;
            }
            return used <= crews;
        };
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2;
            if (fits(mid)) hi = mid;
            else lo = mid + 1;
        }
        return (int)lo;
    }`,
    expectedTime: "O(n log sum)",
    expectedSpace: "O(1)",
    hints: [
      "If the heaviest block is allowed to weigh cap, you can check whether crews blocks are enough. A larger cap only makes that easier.",
      "The smallest candidate is the heaviest single load. The largest candidate is the sum of every load.",
      "Walk left to right. Start a new block when the current load would push the open block over cap. The cap works when the number of blocks is at most crews.",
      "Using fewer than crews blocks cannot reduce the heaviest sum, so 'at most crews' is the same limit as 'exactly crews'. Return the smallest cap that passes.",
    ],
    tests: [
      { input: { loads: [7, 2, 5, 10, 8], crews: 2 }, expectedOutput: 18, visibility: "SAMPLE" },
      { input: { loads: [1, 2, 3, 4], crews: 3 }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { loads: [1, 4, 4], crews: 3 }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { loads: [8, 1, 1], crews: 1 }, expectedOutput: 10, visibility: "HIDDEN" },
      { input: { loads: [5, 5, 5], crews: 2 }, expectedOutput: 10, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "relay-day",
    title: "Minimum Days to Make M Bouquets",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Plots along a path become ready on the day given by bloom. On day d, a plot is ready when bloom[i] is at most d. A relay needs groups non-overlapping runs of width adjacent ready plots. Return the earliest day a relay can be built, or -1 when it is impossible.",
    constraints: ["1 <= bloom.length <= 10000", "1 <= bloom[i] <= 1e9", "1 <= groups, width"],
    examples: [
      { input: "bloom = [1, 10, 3, 10, 2], groups = 3, width = 1", output: "3" },
      { input: "bloom = [1, 10, 3, 10, 2], groups = 3, width = 2", output: "-1" },
    ],
    signature: "int relayDay(vector<int>& bloom, int groups, int width)",
    functionName: "relayDay",
    driver: `auto bloom = in["bloom"].asIntVector();\n    printJson(Json::number(sol.relayDay(bloom, (int)in["groups"].asInt(), (int)in["width"].asInt())));`,
    method: `int relayDay(vector<int>& bloom, int groups, int width) {
        if (1LL * groups * width > (long long)bloom.size()) return -1;
        int lo = 1, hi = *max_element(bloom.begin(), bloom.end());
        auto fits = [&](int day) {
            int made = 0, run = 0;
            for (int value : bloom) {
                if (value <= day) {
                    if (++run == width) { made++; run = 0; }
                } else run = 0;
            }
            return made >= groups;
        };
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (fits(mid)) hi = mid;
            else lo = mid + 1;
        }
        return fits(lo) ? lo : -1;
    }`,
    expectedTime: "O(n log maxDay)",
    expectedSpace: "O(1)",
    hints: [
      "Waiting longer only adds ready plots. If a day works, every later day works, so binary search the day.",
      "If groups times width is greater than the number of plots, return -1 before searching.",
      "On a candidate day, walk the path. Count a finished run of width ready plots, then reset that run so the next group does not reuse those plots. A plot that is not ready breaks the run.",
      "The search runs from day 1 through the latest bloom day. Return the smallest day that builds enough groups. If even the latest day fails, the answer is -1.",
    ],
    tests: [
      { input: { bloom: [1, 10, 3, 10, 2], groups: 3, width: 1 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { bloom: [1, 10, 3, 10, 2], groups: 3, width: 2 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { bloom: [7, 7, 7, 7, 12, 7, 7], groups: 2, width: 3 }, expectedOutput: 12, visibility: "HIDDEN" },
      { input: { bloom: [1, 2, 3], groups: 1, width: 3 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { bloom: [5], groups: 1, width: 1 }, expectedOutput: 5, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "split-fee",
    title: "Smallest Divisor Given a Threshold",
    difficulty: "MEDIUM",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Each load is divided by a positive integer fee. The charge for a load is the ceiling of load / fee. Return the smallest fee whose charges sum to at most limit. limit is at least the number of loads, so a fee always exists.",
    constraints: ["1 <= loads.length <= 10000", "1 <= loads[i] <= 1000000", "loads.length <= limit <= 1e9"],
    examples: [
      { input: "loads = [1, 2, 5, 9], limit = 6", output: "5" },
      { input: "loads = [1, 2, 3], limit = 6", output: "1" },
    ],
    signature: "int splitFee(vector<int>& loads, int limit)",
    functionName: "splitFee",
    driver: `auto loads = in["loads"].asIntVector();\n    printJson(Json::number(sol.splitFee(loads, (int)in["limit"].asInt())));`,
    method: `int splitFee(vector<int>& loads, int limit) {
        int lo = 1, hi = *max_element(loads.begin(), loads.end());
        auto fits = [&](int fee) {
            long long sum = 0;
            for (int load : loads) sum += (load + fee - 1LL) / fee;
            return sum <= limit;
        };
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (fits(mid)) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }`,
    expectedTime: "O(n log maxLoad)",
    expectedSpace: "O(1)",
    hints: [
      "A larger fee never increases a charge. Search the fee from 1 through the heaviest load.",
      "The charge for one load is the ceiling of load divided by the fee. Add those charges in a 64-bit integer.",
      "If the middle fee stays within the limit, try a smaller fee. Otherwise every smaller fee is worse, so move the left edge up.",
      "The heaviest load is always enough, because each charge is then 1 and the limit is at least the number of loads. Return the smallest fee that passes.",
    ],
    tests: [
      { input: { loads: [1, 2, 5, 9], limit: 6 }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { loads: [1, 2, 3], limit: 6 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { loads: [1, 2, 3], limit: 3 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { loads: [8], limit: 1 }, expectedOutput: 8, visibility: "HIDDEN" },
      { input: { loads: [9, 9], limit: 4 }, expectedOutput: 5, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "root-floor",
    title: "Nth Root of a Number",
    difficulty: "MEDIUM",
    topics: ["binary-search"],
    tags: ["binary-search"],
    statement:
      "Return the greatest integer x such that x raised to degree is at most value. degree is at least 2. When value is zero, the answer is zero.",
    constraints: ["2 <= degree <= 9", "0 <= value <= 1000000000"],
    examples: [
      { input: "degree = 3, value = 27", output: "3" },
      { input: "degree = 3, value = 26", output: "2" },
      { input: "degree = 2, value = 0", output: "0" },
    ],
    signature: "int rootFloor(int degree, int value)",
    functionName: "rootFloor",
    driver: `printJson(Json::number(sol.rootFloor((int)in["degree"].asInt(), (int)in["value"].asInt())));`,
    method: `int rootFloor(int degree, int value) {
        if (value == 0) return 0;
        int lo = 1, hi = value;
        auto fits = [&](int x) {
            long long acc = 1;
            for (int i = 0; i < degree; i++) {
                if (acc > value / x) return false;
                acc *= x;
            }
            return true;
        };
        while (lo < hi) {
            int mid = lo + (hi - lo + 1) / 2;
            if (fits(mid)) lo = mid;
            else hi = mid - 1;
        }
        return lo;
    }`,
    expectedTime: "O(degree * log value)",
    expectedSpace: "O(1)",
    hints: [
      "Larger bases only make the power larger. Binary search the base.",
      "A base of 1 always fits when value is at least 1. You never need a base larger than value.",
      "Multiply the base by itself degree times. Before each multiply, check whether the accumulator is already greater than value / base, which means the power would pass value.",
      "Search the upper half of the window because you want the greatest legal base. Stop multiplying as soon as the power would overflow the limit. Zero is a special case that returns zero.",
    ],
    tests: [
      { input: { degree: 3, value: 27 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { degree: 3, value: 26 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { degree: 2, value: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { degree: 9, value: 512 }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { degree: 4, value: 100 }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "merged-pick",
    title: "Kth Element of Two Sorted Arrays",
    difficulty: "HARD",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Two lists are each sorted in nondecreasing order. Return the kth smallest value in their multiset merge, counting from 1. One list may be empty. k is always a valid rank.",
    constraints: ["0 <= left.length, right.length <= 10000", "1 <= left.length + right.length", "1 <= k <= left.length + right.length", "-1e9 <= values <= 1e9"],
    examples: [
      { input: "left = [1, 3], right = [2], k = 2", output: "2" },
      { input: "left = [], right = [1, 2, 3], k = 2", output: "2" },
    ],
    signature: "int mergedPick(vector<int>& left, vector<int>& right, int k)",
    functionName: "mergedPick",
    driver: `auto left = in["left"].asIntVector();\n    auto right = in["right"].asIntVector();\n    printJson(Json::number(sol.mergedPick(left, right, (int)in["k"].asInt())));`,
    method: `int mergedPick(vector<int>& left, vector<int>& right, int k) {
        if (left.size() > right.size()) return mergedPick(right, left, k);
        int n = (int)left.size(), m = (int)right.size();
        int lo = max(0, k - m), hi = min(k, n);
        while (lo <= hi) {
            int takeLeft = lo + (hi - lo) / 2;
            int takeRight = k - takeLeft;
            int leftEnd = takeLeft == 0 ? INT_MIN : left[takeLeft - 1];
            int rightEnd = takeRight == 0 ? INT_MIN : right[takeRight - 1];
            int leftNext = takeLeft == n ? INT_MAX : left[takeLeft];
            int rightNext = takeRight == m ? INT_MAX : right[takeRight];
            if (leftEnd <= rightNext && rightEnd <= leftNext) return max(leftEnd, rightEnd);
            if (leftEnd > rightNext) hi = takeLeft - 1;
            else lo = takeLeft + 1;
        }
        return -1;
    }`,
    expectedTime: "O(log min(n, m))",
    expectedSpace: "O(1)",
    hints: [
      "Merging both lists would be linear. You only need one rank, so decide how many values to take from the shorter list.",
      "If you take takeLeft values from the shorter list, you must take k - takeLeft from the other. Keep that second count inside the other list.",
      "The cut is correct when the last taken value on each side is no larger than the next untaken value on the other side. The answer is the larger of the two last taken values.",
      "If the shorter list's last taken value is too big, take fewer from it. Use the extreme int limits only as sentinels for an empty side of a cut. The search is logarithmic in the shorter length.",
    ],
    tests: [
      { input: { left: [1, 3], right: [2], k: 2 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { left: [], right: [1, 2, 3], k: 2 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { left: [1, 2], right: [3, 4], k: 3 }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { left: [1, 1], right: [1, 1], k: 3 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { left: [2, 7], right: [3, 6, 8], k: 4 }, expectedOutput: 7, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "grid-middle",
    title: "Median in a Row-wise Sorted Matrix",
    difficulty: "HARD",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Every row of a grid is sorted in nondecreasing order, and the grid contains an odd number of cells. Return the median of all cells, the middle value once every cell is ordered.",
    constraints: ["1 <= rows, columns <= 100", "rows * columns is odd", "each row is nondecreasing", "-100000 <= grid[r][c] <= 100000"],
    examples: [
      { input: "grid = [[1, 3, 5], [2, 6, 9], [3, 6, 9]]", output: "5" },
      { input: "grid = [[1], [2], [3]]", output: "2" },
    ],
    signature: "int gridMiddle(vector<vector<int>>& grid)",
    functionName: "gridMiddle",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.gridMiddle(grid)));`,
    method: `int gridMiddle(vector<vector<int>>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size();
        int lo = grid[0][0], hi = grid[0][cols - 1];
        for (auto& row : grid) { lo = min(lo, row.front()); hi = max(hi, row.back()); }
        int need = rows * cols / 2 + 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            int count = 0;
            for (auto& row : grid) count += upper_bound(row.begin(), row.end(), mid) - row.begin();
            if (count >= need) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }`,
    expectedTime: "O(rows * log columns * log valueRange)",
    expectedSpace: "O(1)",
    hints: [
      "Flattening the grid would sort every cell. The median is the smallest value that has at least half the cells, rounded up, less than or equal to it.",
      "Binary search the value, from the smallest row-start to the largest row-end.",
      "For a candidate, count how many cells are less than or equal to it. Each row is sorted, so that count is an upper-bound search per row.",
      "Need is cells / 2 + 1 because the cell count is odd. If the candidate already has that many cells at or below it, try a smaller value. The smallest such value is the median.",
    ],
    tests: [
      { input: { grid: [[1, 3, 5], [2, 6, 9], [3, 6, 9]] }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { grid: [[1], [2], [3]] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { grid: [[1, 2, 3]] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { grid: [[2, 2, 2], [2, 2, 2], [2, 2, 2]] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { grid: [[1, 2, 4], [3, 5, 6], [7, 8, 9]] }, expectedOutput: 5, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "grid-rank",
    title: "Kth Smallest Element in a Sorted Matrix",
    difficulty: "HARD",
    topics: ["binary-search", "arrays"],
    tags: ["binary-search"],
    statement:
      "Every row and every column of a grid is sorted in nondecreasing order. Return the kth smallest cell, counting from 1. Equal cells are counted separately.",
    constraints: ["1 <= rows, columns <= 100", "1 <= k <= rows * columns", "rows and columns are nondecreasing", "-100000 <= grid[r][c] <= 100000"],
    examples: [
      { input: "grid = [[1, 5, 9], [10, 11, 13], [12, 13, 15]], k = 8", output: "13" },
      { input: "grid = [[-5]], k = 1", output: "-5" },
    ],
    signature: "int gridRank(vector<vector<int>>& grid, int k)",
    functionName: "gridRank",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.gridRank(grid, (int)in["k"].asInt())));`,
    method: `int gridRank(vector<vector<int>>& grid, int k) {
        int lo = grid[0][0], hi = grid[0].back();
        for (auto& row : grid) { lo = min(lo, row.front()); hi = max(hi, row.back()); }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            int count = 0;
            for (auto& row : grid) count += upper_bound(row.begin(), row.end(), mid) - row.begin();
            if (count >= k) hi = mid;
            else lo = mid + 1;
        }
        return lo;
    }`,
    expectedTime: "O(rows * log columns * log valueRange)",
    expectedSpace: "O(1)",
    hints: [
      "The kth smallest value is the smallest number that has at least k cells less than or equal to it.",
      "Binary search that number between the smallest and largest cells.",
      "Count cells at or below the candidate with an upper-bound walk on each sorted row. The column order is what makes a faster count possible, but a per-row count is already correct.",
      "If the count is at least k, the answer is this candidate or smaller. Otherwise it is larger. Duplicates are included in the count, so two equal cells can occupy neighboring ranks.",
    ],
    tests: [
      { input: { grid: [[1, 5, 9], [10, 11, 13], [12, 13, 15]], k: 8 }, expectedOutput: 13, visibility: "SAMPLE" },
      { input: { grid: [[-5]], k: 1 }, expectedOutput: -5, visibility: "SAMPLE" },
      { input: { grid: [[1, 2], [1, 3]], k: 2 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { grid: [[1, 3, 5], [2, 4, 6], [7, 8, 9]], k: 5 }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { grid: [[1, 2], [1, 3]], k: 4 }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
];
