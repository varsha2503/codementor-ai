import { problem } from "./helpers.js";

export const graphProblems = [
  problem({
    slug: "campus-islands",
    title: "Number of Islands",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "A campus map is a grid of characters. '1' is land and '0' is water. An island is a group of land cells connected by edges, not diagonals. Return how many islands the map contains. You may modify the grid.",
    constraints: ["1 <= rows, columns <= 300", "Each cell is '0' or '1'."],
    examples: [
      { input: 'grid = ["11110", "11010", "11000", "00000"]', output: "1" },
      { input: 'grid = ["110", "110", "001"]', output: "2" },
    ],
    signature: "int campusCount(vector<string>& grid)",
    functionName: "campusCount",
    driver: `auto grid = in["grid"].asStrings();\n    printJson(Json::number(sol.campusCount(grid)));`,
    method: `int campusCount(vector<string>& grid) {
        int rows = (int)grid.size();
        if (!rows) return 0;
        int cols = (int)grid[0].size();
        int count = 0;
        function<void(int, int)> sink = [&](int r, int c) {
            if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != '1') return;
            grid[r][c] = '0';
            sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
        };
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '1') { count++; sink(r, c); }
            }
        }
        return count;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(rows * cols)",
    hints: [
      "Once you have counted a land cell, every land cell touching it belongs to the same island and should not start a new count.",
      "A depth-first or breadth-first search can mark land as visited. Writing water over land is a valid visited mark if you are allowed to edit the grid.",
      "Scan every cell. When you find land, add one island and then flood all four-direction neighbors so they will not be counted again.",
      "Each cell is entered a constant number of times, so the work is proportional to the map. The recursion or queue can grow with the size of the largest island. Diagonal neighbors are not connected. A single land cell is one island.",
    ],
    tests: [
      { input: { grid: ["11110", "11010", "11000", "00000"] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { grid: ["110", "110", "001"] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { grid: ["0"] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { grid: ["1"] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { grid: ["101", "010", "101"] }, expectedOutput: 5, visibility: "HIDDEN" },
      { input: { grid: ["10", "01"] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "module-order",
    title: "Course Schedule II",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["topological-sort"],
    statement:
      "A course has count modules, numbered from 0. Each prerequisite pair [a, b] means module b must be taken before module a. Return any valid order. If the prerequisites contain a cycle, return an empty list.\n\nAny order that respects the prerequisites is accepted.",
    constraints: ["1 <= count <= 2000", "0 <= prerequisites.length <= 5000", "Each pair contains two different module indexes."],
    examples: [
      { input: "count = 2, prerequisites = [[1, 0]]", output: "[0, 1]" },
      { input: "count = 2, prerequisites = [[1, 0], [0, 1]]", output: "[]", explanation: "The two modules depend on each other." },
    ],
    signature: "vector<int> moduleOrder(int count, vector<vector<int>>& prerequisites)",
    functionName: "moduleOrder",
    compareMode: "TOPOLOGICAL",
    driver: `int count = (int)in["count"].asInt();\n    auto prerequisites = in["prerequisites"].asIntMatrix();\n    printJson(Json::ints(sol.moduleOrder(count, prerequisites)));`,
    method: `vector<int> moduleOrder(int count, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(count);
        vector<int> indegree(count);
        for (auto& edge : prerequisites) {
            graph[edge[1]].push_back(edge[0]);
            indegree[edge[0]]++;
        }
        queue<int> ready;
        for (int i = 0; i < count; i++) if (indegree[i] == 0) ready.push(i);
        vector<int> order;
        while (!ready.empty()) {
            int node = ready.front();
            ready.pop();
            order.push_back(node);
            for (int next : graph[node]) if (--indegree[next] == 0) ready.push(next);
        }
        if ((int)order.size() != count) return {};
        return order;
    }`,
    expectedTime: "O(count + edges)",
    expectedSpace: "O(count + edges)",
    hints: [
      "A module can be taken when every module it depends on is already taken. Modules with nothing in front of them are the places an order can start.",
      "Build a graph from prerequisite to dependent, and keep an indegree for each module. A queue can hold modules whose indegree has fallen to zero.",
      "Pop a ready module, append it to the order, and decrement the indegree of everything that depended on it. Newly zero indegrees join the queue. If the order never collects every module, there is a cycle.",
      "Kahn's algorithm is a breadth-first topological sort. Several ready modules may be queued at once, so more than one order can be correct. A cycle leaves at least one module with a leftover indegree, and the required result is an empty list.",
    ],
    tests: [
      { input: { count: 2, prerequisites: [[1, 0]] }, expectedOutput: [0, 1], visibility: "SAMPLE" },
      { input: { count: 2, prerequisites: [[1, 0], [0, 1]] }, expectedOutput: [], visibility: "SAMPLE" },
      {
        input: { count: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] },
        expectedOutput: [0, 1, 2, 3],
        visibility: "HIDDEN",
      },
      { input: { count: 1, prerequisites: [] }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { count: 3, prerequisites: [[0, 1], [0, 2], [1, 2]] }, expectedOutput: [2, 1, 0], visibility: "HIDDEN" },
    ],
  }),
];
