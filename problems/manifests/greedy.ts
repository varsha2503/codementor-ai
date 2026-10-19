import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const rowsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

export const greedyProblems = [
  problem({
    slug: "assign-cookies",
    title: "Assign Cookies",
    difficulty: "EASY",
    topics: ["greedy"],
    tags: ["sorting"],
    statement:
      "Each child has a greed factor, and each cookie has a size. A child is content only when the cookie is at least as large as that greed factor. One cookie can go to only one child. Return the largest number of children you can make content.",
    constraints: [
      "0 <= children.length, cookies.length <= 10000",
      "1 <= children[i], cookies[j] <= 1e9",
    ],
    examples: [
      { input: "children = [1, 2, 3], cookies = [1, 1]", output: "1" },
      { input: "children = [1, 2], cookies = [1, 2, 3]", output: "2" },
    ],
    signature: "int assignCookies(vector<int>& children, vector<int>& cookies)",
    functionName: "assignCookies",
    driver: `auto children = in["children"].asIntVector();\n    auto cookies = in["cookies"].asIntVector();\n    printJson(Json::number(sol.assignCookies(children, cookies)));`,
    method: `int assignCookies(vector<int>& children, vector<int>& cookies) {
        sort(children.begin(), children.end());
        sort(cookies.begin(), cookies.end());
        int child = 0, cookie = 0;
        while (child < (int)children.size() && cookie < (int)cookies.size()) {
            if (cookies[cookie] >= children[child]) child++;
            cookie++;
        }
        return child;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(1) extra",
    hints: [
      "A large cookie is wasted on a child who would have been happy with a smaller one.",
      "Sort both lists. Always try the smallest remaining cookie on the least greedy remaining child.",
      "If the cookie is big enough, count that child and move on. If it is too small, throw the cookie away and try the next one.",
      "Two pointers after sorting. The answer is how many children receive a cookie before one of the lists runs out.",
    ],
    tests: [
      { input: { children: [1, 2, 3], cookies: [1, 1] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { children: [1, 2], cookies: [1, 2, 3] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { children: [], cookies: [1] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { children: [1], cookies: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { children: [1, 2, 3], cookies: [1, 1, 1] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "fraction-pack",
    title: "Fractional Knapsack",
    difficulty: "MEDIUM",
    topics: ["greedy"],
    tags: ["sorting"],
    statement:
      "Each item is a pair [value, weight]. You may take any fraction of an item. The knapsack can hold at most capacity units of weight. Return the greatest total value, rounded to the nearest integer. A value halfway between two integers rounds away from zero.",
    constraints: [
      "0 <= items.length <= 1000",
      "1 <= value, weight <= 1e6",
      "0 <= capacity <= 1e9",
    ],
    examples: [
      { input: "items = [[60, 10], [100, 20], [120, 30]], capacity = 50", output: "240" },
      { input: "items = [[1, 2]], capacity = 1", output: "1", explanation: "Half of the item is worth 0.5, which rounds to 1." },
    ],
    signature: "long long fractionPack(vector<vector<int>>& items, int capacity)",
    functionName: "fractionPack",
    driver: `auto items = in["items"].asIntMatrix();\n    printJson(Json::number(sol.fractionPack(items, (int)in["capacity"].asInt())));`,
    method: `long long fractionPack(vector<vector<int>>& items, int capacity) {
        sort(items.begin(), items.end(), [](const auto& a, const auto& b) {
            return (long double)a[0] / a[1] > (long double)b[0] / b[1];
        });
        long double total = 0;
        long long left = capacity;
        for (const auto& item : items) {
            if (left <= 0) break;
            long long take = min((long long)item[1], left);
            total += (long double)item[0] * take / item[1];
            left -= take;
        }
        return llround(total);
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(1) extra",
    hints: [
      "Weight is the scarce resource, so the useful comparison is value per unit of weight.",
      "Sort by value/weight from largest to smallest. Fill the knapsack from the front of that order.",
      "Take an item whole while it fits. When the next item does not fit, take only the fraction that fills the remaining capacity and stop.",
      "A zero capacity or an empty item list is worth 0. Round the accumulated value with half away from zero.",
    ],
    tests: [
      { input: { items: [[60, 10], [100, 20], [120, 30]], capacity: 50 }, expectedOutput: 240, visibility: "SAMPLE" },
      { input: { items: [[1, 2]], capacity: 1 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { items: [[10, 10]], capacity: 5 }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { items: [[5, 1], [10, 2]], capacity: 0 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { items: [[4, 2], [3, 1]], capacity: 3 }, expectedOutput: 7, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lemonade",
    title: "Lemonade Change",
    difficulty: "EASY",
    topics: ["greedy"],
    tags: ["simulation"],
    statement:
      "Lemonade costs 5. Customers pay with a 5, a 10, or a 20, in the order given. You start with no bills. Give exact change immediately, using the bills you already hold. Return whether every customer can be served.",
    constraints: ["0 <= bills.length <= 10000", "Each bill is 5, 10, or 20."],
    examples: [
      { input: "bills = [5, 5, 5, 10, 20]", output: "true" },
      { input: "bills = [5, 5, 10, 10, 20]", output: "false" },
    ],
    signature: "bool lemonade(vector<int>& bills)",
    functionName: "lemonade",
    driver: `auto bills = in["bills"].asIntVector();\n    printJson(Json::boolean(sol.lemonade(bills)));`,
    method: `bool lemonade(vector<int>& bills) {
        int five = 0, ten = 0;
        for (int bill : bills) {
            if (bill == 5) five++;
            else if (bill == 10) {
                if (five == 0) return false;
                five--;
                ten++;
            } else if (ten > 0 && five > 0) {
                ten--;
                five--;
            } else if (five >= 3) five -= 3;
            else return false;
        }
        return true;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A 5 needs no change. A 10 needs one 5. A 20 needs 15 back.",
      "There are only two useful ways to make 15: a 10 plus a 5, or three 5s.",
      "Prefer to spend a 10 when a customer pays with 20. A 10 cannot be used as change for a later 10, but a 5 can.",
      "Keep two counters. If the preferred change is missing, the sale fails immediately. An empty line succeeds.",
    ],
    tests: [
      { input: { bills: [5, 5, 5, 10, 20] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { bills: [5, 5, 10, 10, 20] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { bills: [5, 5, 10] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { bills: [10] }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { bills: [5, 5, 5, 20] }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "star-parens",
    title: "Valid Parenthesis String",
    difficulty: "HARD",
    topics: ["greedy"],
    tags: ["parentheses"],
    statement:
      "The string contains only '(', ')', and '*'. A star may be treated as an opening parenthesis, a closing parenthesis, or an empty character. Return whether some choice for every star makes the string a valid parenthesis sequence.",
    constraints: ["0 <= s.length <= 10000", "s contains only '(', ')', and '*'."],
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "(*)"', output: "true" },
      { input: 's = "(*))"', output: "true" },
    ],
    signature: "bool starParens(string s)",
    functionName: "starParens",
    driver: `printJson(Json::boolean(sol.starParens(in["s"].asString())));`,
    method: `bool starParens(string s) {
        int low = 0, high = 0;
        for (char c : s) {
            if (c == '(') { low++; high++; }
            else if (c == ')') { low--; high--; }
            else { low--; high++; }
            if (high < 0) return false;
            low = max(low, 0);
        }
        return low == 0;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "A star makes the number of unmatched opening parentheses a range, not a single count.",
      "Track the smallest and largest number of unmatched '(' that the prefix can still have.",
      "'(' raises both ends. ')' lowers both. '*' lowers the low end and raises the high end. If the high end drops below zero, a ')' had no match.",
      "Never let the low end stay negative: a star can be empty instead of a close. At the end the low end must be zero, so a fully matched reading still exists.",
    ],
    tests: [
      { input: { s: "()" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { s: "(*)" }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { s: "(*))" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { s: "(((" }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { s: "" }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { s: "(*)(" }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "meeting-room",
    title: "N Meetings in One Room",
    difficulty: "MEDIUM",
    topics: ["greedy"],
    tags: ["intervals"],
    statement:
      "Each meeting is a closed interval [start, end) on one shared room. A meeting that ends at time t frees the room for another meeting that starts at t. Return the maximum number of meetings that can be held.",
    constraints: ["0 <= meetings.length <= 10000", "0 <= start < end <= 1e9"],
    examples: [
      { input: "meetings = [[1, 2], [2, 3], [3, 4]]", output: "3" },
      { input: "meetings = [[1, 3], [2, 4], [3, 5]]", output: "2" },
    ],
    signature: "int meetingRoom(vector<vector<int>>& meetings)",
    functionName: "meetingRoom",
    driver: `auto meetings = in["meetings"].asIntMatrix();\n    printJson(Json::number(sol.meetingRoom(meetings)));`,
    method: `int meetingRoom(vector<vector<int>>& meetings) {
        sort(meetings.begin(), meetings.end(), [](const auto& a, const auto& b) { return a[1] < b[1]; });
        int count = 0, closed = -1;
        for (const auto& meeting : meetings) {
            if (meeting[0] >= closed) {
                count++;
                closed = meeting[1];
            }
        }
        return count;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(1) extra",
    hints: [
      "The meeting that finishes first leaves the room available for the most later meetings.",
      "Sort by ending time. Take a meeting when its start is at least the end of the last meeting you took.",
      "A later meeting that finishes earlier is a better choice than a long meeting that started sooner.",
      "One pass after the sort. An empty list holds zero meetings. Sharing the boundary time is allowed because the end is exclusive.",
    ],
    tests: [
      { input: { meetings: [[1, 2], [2, 3], [3, 4]] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { meetings: [[1, 3], [2, 4], [3, 5]] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { meetings: [[1, 5], [2, 3], [3, 4]] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { meetings: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { meetings: [[5, 7]] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "jump-reach",
    title: "Jump Game",
    difficulty: "EASY",
    topics: ["greedy"],
    tags: ["array"],
    statement:
      "You start at index 0. From index i you may jump to any index in i+1 through i+nums[i], staying inside the array. Return whether the last index can be reached.",
    constraints: ["1 <= nums.length <= 10000", "0 <= nums[i] <= 1e5"],
    examples: [
      { input: "nums = [2, 3, 1, 1, 4]", output: "true" },
      { input: "nums = [3, 2, 1, 0, 4]", output: "false" },
    ],
    signature: "bool jumpReach(vector<int>& nums)",
    functionName: "jumpReach",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::boolean(sol.jumpReach(nums)));`,
    method: `bool jumpReach(vector<int>& nums) {
        int far = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (i > far) return false;
            far = max(far, i + nums[i]);
        }
        return true;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "You do not need the path. You need the farthest index the jumps so far can touch.",
      "Walk left to right. An index beyond the current farthest reach can never be used.",
      "From every reachable index, extend the farthest reach to i + nums[i].",
      "If the scan finishes without getting stuck, the last index was inside the reachable span. A single cell is already there.",
    ],
    tests: [
      { input: { nums: [2, 3, 1, 1, 4] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { nums: [3, 2, 1, 0, 4] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { nums: [0] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { nums: [1, 0] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { nums: [1, 0, 1] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "jump-count",
    title: "Jump Game II",
    difficulty: "MEDIUM",
    topics: ["greedy"],
    tags: ["array"],
    statement:
      "From index i you may jump forward by 1 to nums[i] steps. Return the fewest jumps that land on the last index. Return -1 when the last index cannot be reached. A one-cell array needs zero jumps.",
    constraints: ["1 <= nums.length <= 10000", "0 <= nums[i] <= 1e5"],
    examples: [
      { input: "nums = [2, 3, 1, 1, 4]", output: "2", explanation: "Jump from 0 to 1, then from 1 to the end." },
      { input: "nums = [1, 0, 1]", output: "-1" },
    ],
    signature: "int jumpCount(vector<int>& nums)",
    functionName: "jumpCount",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.jumpCount(nums)));`,
    method: `int jumpCount(vector<int>& nums) {
        int n = (int)nums.size();
        if (n <= 1) return 0;
        int far = 0, end = 0, jumps = 0;
        for (int i = 0; i < n - 1; i++) {
            far = max(far, i + nums[i]);
            if (i == end) {
                if (far == end) return -1;
                jumps++;
                end = far;
            }
        }
        return end >= n - 1 ? jumps : -1;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "Each jump should cover as much new ground as the current window allows.",
      "The current window is the span you can reach with the jumps already counted. Inside it, remember the farthest next landing.",
      "When the index reaches the end of the window, you must take one more jump, and the new window ends at that farthest landing.",
      "If a window cannot extend past itself, return -1. Stop the scan one cell before the end, because landing on the last cell finishes the trip.",
    ],
    tests: [
      { input: { nums: [2, 3, 1, 1, 4] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { nums: [1, 0, 1] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { nums: [2, 1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [1, 1, 1] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { nums: [0] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { nums: [2, 0, 0] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "rail-platforms",
    title: "Minimum Number of Platforms",
    difficulty: "MEDIUM",
    topics: ["greedy"],
    tags: ["sorting"],
    statement:
      "Each train is an arrival time and a departure time, paired by index. A platform stays occupied through the departure minute, so an arrival at that same minute still needs a different platform. Return the minimum number of platforms so that no train waits.",
    constraints: [
      "1 <= arrival.length == departure.length <= 10000",
      "0 <= arrival[i] <= departure[i] <= 1e9",
    ],
    examples: [
      {
        input: "arrival = [900, 940, 950, 1100, 1500, 1800], departure = [910, 1200, 1120, 1130, 1900, 2000]",
        output: "3",
      },
      { input: "arrival = [1, 2], departure = [2, 3]", output: "2" },
    ],
    signature: "int railPlatforms(vector<int>& arrival, vector<int>& departure)",
    functionName: "railPlatforms",
    driver: `auto arrival = in["arrival"].asIntVector();\n    auto departure = in["departure"].asIntVector();\n    printJson(Json::number(sol.railPlatforms(arrival, departure)));`,
    method: `int railPlatforms(vector<int>& arrival, vector<int>& departure) {
        sort(arrival.begin(), arrival.end());
        sort(departure.begin(), departure.end());
        int i = 0, j = 0, cur = 0, best = 0;
        while (i < (int)arrival.size() && j < (int)departure.size()) {
            if (arrival[i] <= departure[j]) {
                cur++;
                best = max(best, cur);
                i++;
            } else {
                cur--;
                j++;
            }
        }
        return best;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(1) extra",
    hints: [
      "Platforms are about how many trains overlap, not about pairing a particular arrival with a particular departure.",
      "Sort arrivals and departures separately. Sweep the earlier of the next arrival and the next departure.",
      "An arrival at or before the next departure occupies one more platform. A departure before the next arrival frees one.",
      "The answer is the high-water mark of the running count. Equal times count as overlap because the platform is free only after the departure minute.",
    ],
    tests: [
      {
        input: { arrival: [900, 940, 950, 1100, 1500, 1800], departure: [910, 1200, 1120, 1130, 1900, 2000] },
        expectedOutput: 3,
        visibility: "SAMPLE",
      },
      { input: { arrival: [1, 2], departure: [2, 3] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { arrival: [1], departure: [5] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { arrival: [1, 1], departure: [2, 2] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { arrival: [1, 3], departure: [2, 4] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "job-order",
    title: "Job Sequencing",
    difficulty: "MEDIUM",
    topics: ["greedy"],
    tags: ["sorting"],
    statement:
      "Each job is a pair [deadline, profit] and takes one unit of time. A job with deadline d must be finished by time d, so it can occupy any free slot from 1 through d. Return [count, profit]: the most jobs you can finish and the maximum profit among schedules that finish that many jobs.",
    constraints: ["1 <= jobs.length <= 1000", "1 <= deadline <= 1000", "1 <= profit <= 100000"],
    examples: [
      { input: "jobs = [[4, 20], [1, 10], [1, 40], [1, 30]]", output: "[2, 60]" },
      { input: "jobs = [[2, 100], [1, 19], [2, 27], [1, 25], [3, 15]]", output: "[3, 142]" },
    ],
    signature: "vector<long long> jobOrder(vector<vector<int>>& jobs)",
    functionName: "jobOrder",
    driver: `auto jobs = in["jobs"].asIntMatrix();\n    ${numbersOut("sol.jobOrder(jobs)")}`,
    method: `vector<long long> jobOrder(vector<vector<int>>& jobs) {
        sort(jobs.begin(), jobs.end(), [](const auto& a, const auto& b) { return a[1] > b[1]; });
        int maxDeadline = 0;
        for (const auto& job : jobs) maxDeadline = max(maxDeadline, job[0]);
        vector<int> taken(maxDeadline + 1, 0);
        long long count = 0, profit = 0;
        for (const auto& job : jobs) {
            int slot = job[0];
            while (slot >= 1 && taken[slot]) slot--;
            if (slot >= 1) {
                taken[slot] = 1;
                count++;
                profit += job[1];
            }
        }
        return {count, profit};
    }`,
    expectedTime: "O(n log n + n * D)",
    expectedSpace: "O(D)",
    hints: [
      "A higher profit is always worth placing if any legal slot is still open.",
      "Sort by profit, largest first. Give each job the latest free slot that is still on or before its deadline.",
      "Using the latest legal slot leaves earlier slots for jobs whose deadlines are tighter.",
      "If no slot from 1 through the deadline is free, skip that job. The two returned numbers are how many jobs were placed and the sum of their profits.",
    ],
    tests: [
      { input: { jobs: [[4, 20], [1, 10], [1, 40], [1, 30]] }, expectedOutput: [2, 60], visibility: "SAMPLE" },
      { input: { jobs: [[2, 100], [1, 19], [2, 27], [1, 25], [3, 15]] }, expectedOutput: [3, 142], visibility: "SAMPLE" },
      { input: { jobs: [[1, 5]] }, expectedOutput: [1, 5], visibility: "HIDDEN" },
      { input: { jobs: [[2, 10], [2, 20]] }, expectedOutput: [2, 30], visibility: "HIDDEN" },
      { input: { jobs: [[1, 10], [1, 20]] }, expectedOutput: [1, 20], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "candy-row",
    title: "Candy",
    difficulty: "HARD",
    topics: ["greedy"],
    tags: ["array"],
    statement:
      "Children stand in a line and each has a rating. Every child gets at least one candy. A child with a strictly higher rating than a neighbor must receive more candies than that neighbor. Return the minimum total number of candies.",
    constraints: ["1 <= ratings.length <= 10000", "0 <= ratings[i] <= 10000"],
    examples: [
      { input: "ratings = [1, 0, 2]", output: "5" },
      { input: "ratings = [1, 2, 2]", output: "4" },
    ],
    signature: "long long candyRow(vector<int>& ratings)",
    functionName: "candyRow",
    driver: `auto ratings = in["ratings"].asIntVector();\n    printJson(Json::number(sol.candyRow(ratings)));`,
    method: `long long candyRow(vector<int>& ratings) {
        int n = (int)ratings.size();
        vector<int> candies(n, 1);
        for (int i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;
        for (int i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) candies[i] = max(candies[i], candies[i + 1] + 1);
        long long total = 0;
        for (int value : candies) total += value;
        return total;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Equal ratings do not force extra candies. Only a strict rise or fall does.",
      "A left-to-right pass fixes every child who is higher than the child on the left.",
      "A right-to-left pass then raises a child who is higher than the child on the right, without lowering what the first pass required.",
      "Start everyone at one. The answer is the sum after both passes. A peak has to satisfy the longer of its two slopes.",
    ],
    tests: [
      { input: { ratings: [1, 0, 2] }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { ratings: [1, 2, 2] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { ratings: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { ratings: [1, 3, 2, 1] }, expectedOutput: 7, visibility: "HIDDEN" },
      { input: { ratings: [1, 2, 3] }, expectedOutput: 6, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "shortest-job",
    title: "Shortest Job First",
    difficulty: "MEDIUM",
    topics: ["greedy"],
    tags: ["sorting"],
    statement:
      "Every process is ready at time 0. burst[i] is how long process i runs, and it cannot be paused once it starts. The scheduler always starts the shortest remaining process. Return the total waiting time: the sum, over every process, of the time from 0 until that process starts.",
    constraints: ["1 <= burst.length <= 10000", "1 <= burst[i] <= 10000"],
    examples: [
      { input: "burst = [4, 3, 7, 1, 2]", output: "20", explanation: "Run order 1, 2, 3, 4, 7. Waiting times 0, 1, 3, 6, 10." },
      { input: "burst = [1]", output: "0" },
    ],
    signature: "long long shortestJob(vector<int>& burst)",
    functionName: "shortestJob",
    driver: `auto burst = in["burst"].asIntVector();\n    printJson(Json::number(sol.shortestJob(burst)));`,
    method: `long long shortestJob(vector<int>& burst) {
        sort(burst.begin(), burst.end());
        long long time = 0, wait = 0;
        for (int value : burst) {
            wait += time;
            time += value;
        }
        return wait;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(1) extra",
    hints: [
      "A long process at the front makes every later process wait. The shortest process should run first.",
      "Sort the burst times. The first process waits 0. Each later process waits the sum of the bursts before it.",
      "You do not need the average. Add the start time of every process.",
      "One running total is enough: add the time so far into the answer, then add the current burst to the time. One process waits 0.",
    ],
    tests: [
      { input: { burst: [4, 3, 7, 1, 2] }, expectedOutput: 20, visibility: "SAMPLE" },
      { input: { burst: [1] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { burst: [5, 5] }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { burst: [2, 1, 3] }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { burst: [8] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "page-faults",
    title: "LRU Page Replacement",
    difficulty: "MEDIUM",
    topics: ["greedy"],
    tags: ["simulation"],
    statement:
      "A memory has capacity frames and starts empty. pages is the sequence of page requests. A page already in a frame is a hit and becomes the most recently used. A missing page is a fault: if every frame is full, evict the least recently used page, then load the requested page. Return the number of faults.",
    constraints: ["1 <= pages.length <= 10000", "0 <= pages[i] <= 1e9", "1 <= capacity <= 1000"],
    examples: [
      { input: "pages = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], capacity = 3", output: "10" },
      { input: "pages = [7, 0, 1, 2, 0, 3, 0, 4], capacity = 3", output: "6" },
    ],
    signature: "int pageFaults(vector<int>& pages, int capacity)",
    functionName: "pageFaults",
    driver: `auto pages = in["pages"].asIntVector();\n    printJson(Json::number(sol.pageFaults(pages, (int)in["capacity"].asInt())));`,
    method: `int pageFaults(vector<int>& pages, int capacity) {
        vector<int> frames;
        int faults = 0;
        for (int page : pages) {
            auto found = find(frames.begin(), frames.end(), page);
            if (found != frames.end()) {
                frames.erase(found);
                frames.push_back(page);
            } else {
                faults++;
                if ((int)frames.size() == capacity) frames.erase(frames.begin());
                frames.push_back(page);
            }
        }
        return faults;
    }`,
    expectedTime: "O(n * capacity)",
    expectedSpace: "O(capacity)",
    hints: [
      "The frames need an order from least recently used to most recently used.",
      "On a hit, move that page to the most-recent end. On a miss, count a fault.",
      "Evict only when the frame list is already at capacity. The victim is the front of the recency order.",
      "The first requests fill empty frames and are all faults. Repeating the same page in a one-frame memory is one fault followed by hits.",
    ],
    tests: [
      { input: { pages: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], capacity: 3 }, expectedOutput: 10, visibility: "SAMPLE" },
      { input: { pages: [7, 0, 1, 2, 0, 3, 0, 4], capacity: 3 }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { pages: [1], capacity: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { pages: [1, 1, 1], capacity: 1 }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { pages: [1, 2, 1], capacity: 1 }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "insert-span",
    title: "Insert Interval",
    difficulty: "MEDIUM",
    topics: ["greedy"],
    tags: ["intervals"],
    statement:
      "intervals is sorted by start and the spans do not touch or overlap. Insert newInterval, written [start, end]. Touching or overlapping spans become one span covering the whole range. Return the merged list, still sorted by start.",
    constraints: [
      "0 <= intervals.length <= 10000",
      "0 <= start <= end <= 1e9",
      "Each existing span ends strictly before the next one starts.",
    ],
    examples: [
      { input: "intervals = [[1, 3], [6, 9]], newInterval = [2, 5]", output: "[[1, 5], [6, 9]]" },
      { input: "intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval = [4, 8]", output: "[[1, 2], [3, 10], [12, 16]]" },
    ],
    signature: "vector<vector<int>> insertSpan(vector<vector<int>>& intervals, vector<int>& fresh)",
    functionName: "insertSpan",
    driver: `auto intervals = in["intervals"].asIntMatrix();\n    auto fresh = in["newInterval"].asIntVector();\n    ${rowsOut("sol.insertSpan(intervals, fresh)")}`,
    method: `vector<vector<int>> insertSpan(vector<vector<int>>& intervals, vector<int>& fresh) {
        vector<vector<int>> out;
        int i = 0, n = (int)intervals.size();
        while (i < n && intervals[i][1] < fresh[0]) out.push_back(intervals[i++]);
        while (i < n && intervals[i][0] <= fresh[1]) {
            fresh[0] = min(fresh[0], intervals[i][0]);
            fresh[1] = max(fresh[1], intervals[i][1]);
            i++;
        }
        out.push_back(fresh);
        while (i < n) out.push_back(intervals[i++]);
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1) extra beyond the result",
    hints: [
      "The list is already sorted, so the new span has a left side, an overlap region, and a right side.",
      "Copy every span that ends strictly before the new start.",
      "While the next span starts on or before the new end, fold it in by widening the new start and end.",
      "Append the widened span, then copy the rest. An empty list returns the new span by itself. Touching endpoints merge.",
    ],
    tests: [
      { input: { intervals: [[1, 3], [6, 9]], newInterval: [2, 5] }, expectedOutput: [[1, 5], [6, 9]], visibility: "SAMPLE" },
      {
        input: { intervals: [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval: [4, 8] },
        expectedOutput: [[1, 2], [3, 10], [12, 16]],
        visibility: "SAMPLE",
      },
      { input: { intervals: [], newInterval: [2, 5] }, expectedOutput: [[2, 5]], visibility: "HIDDEN" },
      { input: { intervals: [[1, 5]], newInterval: [0, 0] }, expectedOutput: [[0, 0], [1, 5]], visibility: "HIDDEN" },
      { input: { intervals: [[1, 5]], newInterval: [6, 8] }, expectedOutput: [[1, 5], [6, 8]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "drop-intervals",
    title: "Non-overlapping Intervals",
    difficulty: "MEDIUM",
    topics: ["greedy"],
    tags: ["intervals"],
    statement:
      "Each interval is [start, end). Sharing an endpoint is allowed, so [1, 2) and [2, 3) do not overlap. Return the minimum number of intervals to remove so the ones that remain do not overlap.",
    constraints: ["0 <= intervals.length <= 10000", "0 <= start <= end <= 1e9"],
    examples: [
      { input: "intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]", output: "1" },
      { input: "intervals = [[1, 2], [1, 2], [1, 2]]", output: "2" },
    ],
    signature: "int dropIntervals(vector<vector<int>>& intervals)",
    functionName: "dropIntervals",
    driver: `auto intervals = in["intervals"].asIntMatrix();\n    printJson(Json::number(sol.dropIntervals(intervals)));`,
    method: `int dropIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](const auto& a, const auto& b) { return a[1] < b[1]; });
        long long closed = LLONG_MIN;
        int keep = 0;
        for (const auto& span : intervals) {
            if (span[0] >= closed) {
                keep++;
                closed = span[1];
            }
        }
        return (int)intervals.size() - keep;
    }`,
    expectedTime: "O(n log n)",
    expectedSpace: "O(1) extra",
    hints: [
      "Removing the fewest intervals is the same as keeping the largest set that does not overlap.",
      "The interval that ends first is the one that leaves the most room for later intervals.",
      "Sort by end time. Keep an interval when its start is at least the end of the last interval you kept.",
      "The answer is the count you did not keep. Endpoints may touch. An empty list removes nothing.",
    ],
    tests: [
      { input: { intervals: [[1, 2], [2, 3], [3, 4], [1, 3]] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { intervals: [[1, 2], [1, 2], [1, 2]] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { intervals: [[1, 2], [2, 3]] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { intervals: [[1, 100], [11, 22], [1, 11], [2, 12]] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { intervals: [] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
];
