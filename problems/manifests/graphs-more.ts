import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const rowsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

const stringRows = (call: string) => `{
    auto rows = ${call};
    Json out; out.type = Json::ARR;
    for (const auto& row : rows) {
        Json line; line.type = Json::ARR;
        for (const auto& word : row) line.a.push_back(Json::text(word));
        out.a.push_back(std::move(line));
    }
    printJson(out);
}`;

export const graphMoreProblems = [
  problem({
    slug: "bipartite-graph",
    title: "Bipartite Graph",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "An undirected graph has n nodes numbered from 0. Return whether its nodes can be colored with two colors so that every edge joins different colors.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated undirected edges."],
    examples: [
      { input: "n = 4, edges = [[0, 1], [1, 2], [2, 3]]", output: "true" },
      { input: "n = 3, edges = [[0, 1], [1, 2], [2, 0]]", output: "false" },
    ],
    signature: "bool bipartiteGraph(int n, vector<vector<int>>& edges)",
    functionName: "bipartiteGraph",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::boolean(sol.bipartiteGraph((int)in["n"].asInt(), edges)));`,
    method: `bool bipartiteGraph(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
        vector<int> color(n, -1);
        function<bool(int, int)> paint = [&](int node, int shade) -> bool {
            color[node] = shade;
            for (int next : graph[node]) {
                if (color[next] == -1) { if (!paint(next, 1 - shade)) return false; }
                else if (color[next] == shade) return false;
            }
            return true;
        };
        for (int node = 0; node < n; node++) if (color[node] == -1 && !paint(node, 0)) return false;
        return true;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "Two colors are enough exactly when the graph has no odd cycle.",
      "Assign a color as you walk. The next node must take the other color.",
      "A neighbor that already has your color is a conflict.",
      "Color each component separately. A single node and a path are bipartite. A triangle is not.",
    ],
    tests: [
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3], [3, 0]] }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "cycle-directed-dfs",
    title: "Detect Cycle in a Directed Graph using DFS",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "A directed graph has n nodes numbered from 0. An edge [u, v] runs from u to v. Return whether the graph contains a directed cycle.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated directed edges."],
    examples: [
      { input: "n = 3, edges = [[0, 1], [1, 2], [2, 0]]", output: "true" },
      { input: "n = 3, edges = [[0, 1], [1, 2]]", output: "false" },
    ],
    signature: "bool cycleDirectedDfs(int n, vector<vector<int>>& edges)",
    functionName: "cycleDirectedDfs",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::boolean(sol.cycleDirectedDfs((int)in["n"].asInt(), edges)));`,
    method: `bool cycleDirectedDfs(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) graph[edge[0]].push_back(edge[1]);
        vector<int> state(n);
        function<bool(int)> walk = [&](int node) -> bool {
            state[node] = 1;
            for (int next : graph[node]) {
                if (state[next] == 1 || (state[next] == 0 && walk(next))) return true;
            }
            state[node] = 2;
            return false;
        };
        for (int node = 0; node < n; node++) if (state[node] == 0 && walk(node)) return true;
        return false;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "A directed cycle is a node reached again while its own search is still unfinished.",
      "Use three states: unseen, on the current path, and finished.",
      "An edge into a node that is still on the path is a back edge.",
      "An edge into a finished node is a cross edge and is allowed. Check every unvisited start.",
    ],
    tests: [
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1], [1, 2]] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 2, edges: [[0, 1], [1, 0]] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { n: 1, edges: [] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "topo-dfs",
    title: "Topological Sort",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "A directed graph has n nodes numbered from 0. An edge [u, v] means u comes before v. Return a topological order produced by depth-first search: visit outgoing neighbors from the smallest index to the largest, and place a node after its descendants. If the graph has a cycle, return an empty list. When several components exist, start at the smallest unused node.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated directed edges."],
    examples: [
      { input: "n = 4, edges = [[0, 1], [0, 2], [1, 3], [2, 3]]", output: "[0, 2, 1, 3]" },
      { input: "n = 2, edges = [[0, 1], [1, 0]]", output: "[]" },
    ],
    signature: "vector<int> topoDfs(int n, vector<vector<int>>& edges)",
    functionName: "topoDfs",
    driver: `auto edges = in["edges"].asIntMatrix();\n    ${numbersOut('sol.topoDfs((int)in["n"].asInt(), edges)')}`,
    method: `vector<int> topoDfs(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) graph[edge[0]].push_back(edge[1]);
        for (auto& next : graph) sort(next.begin(), next.end());
        vector<int> state(n), order;
        bool cycle = false;
        function<void(int)> walk = [&](int node) {
            state[node] = 1;
            for (int next : graph[node]) {
                if (state[next] == 1) cycle = true;
                else if (state[next] == 0) walk(next);
            }
            state[node] = 2;
            order.push_back(node);
        };
        for (int node = 0; node < n; node++) if (state[node] == 0) walk(node);
        if (cycle) return {};
        reverse(order.begin(), order.end());
        return order;
    }`,
    expectedTime: "O(n + edges log edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "A node is safe to emit after every node it points to has been emitted.",
      "Sort the outgoing edges so the walk is unique, then record a node when its recursion returns.",
      "Reversing that finishing order puts sources before the nodes that depend on them.",
      "A node seen again while it is still on the stack means a cycle, and the result is empty.",
    ],
    tests: [
      { input: { n: 4, edges: [[0, 1], [0, 2], [1, 3], [2, 3]] }, expectedOutput: [0, 2, 1, 3], visibility: "SAMPLE" },
      { input: { n: 2, edges: [[0, 1], [1, 0]] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { n: 3, edges: [[0, 1]] }, expectedOutput: [2, 0, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "topo-kahn",
    title: "Kahn's Algorithm",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "A directed graph has n nodes numbered from 0. An edge [u, v] means u comes before v. Return the topological order from Kahn's algorithm when the smallest ready node is always taken next. If a cycle makes that impossible, return an empty list.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated directed edges."],
    examples: [
      { input: "n = 4, edges = [[0, 1], [0, 2], [1, 3], [2, 3]]", output: "[0, 1, 2, 3]" },
      { input: "n = 2, edges = [[0, 1], [1, 0]]", output: "[]" },
    ],
    signature: "vector<int> topoKahn(int n, vector<vector<int>>& edges)",
    functionName: "topoKahn",
    driver: `auto edges = in["edges"].asIntMatrix();\n    ${numbersOut('sol.topoKahn((int)in["n"].asInt(), edges)')}`,
    method: `vector<int> topoKahn(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        vector<int> indegree(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); indegree[edge[1]]++; }
        priority_queue<int, vector<int>, greater<int>> ready;
        for (int node = 0; node < n; node++) if (indegree[node] == 0) ready.push(node);
        vector<int> order;
        while (!ready.empty()) {
            int node = ready.top(); ready.pop();
            order.push_back(node);
            for (int next : graph[node]) if (--indegree[next] == 0) ready.push(next);
        }
        if ((int)order.size() != n) return {};
        return order;
    }`,
    expectedTime: "O((n + edges) log n)",
    expectedSpace: "O(n + edges)",
    hints: [
      "A node is ready when nothing that must precede it is still waiting.",
      "Count incoming edges. Nodes with a count of zero can start the order.",
      "Always pop the smallest ready node, then decrease the count of everything it points to.",
      "If the order never collects every node, some leftover count belongs to a cycle.",
    ],
    tests: [
      { input: { n: 4, edges: [[0, 1], [0, 2], [1, 3], [2, 3]] }, expectedOutput: [0, 1, 2, 3], visibility: "SAMPLE" },
      { input: { n: 2, edges: [[0, 1], [1, 0]] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { n: 3, edges: [[0, 1]] }, expectedOutput: [0, 1, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "cycle-directed",
    title: "Detect Cycle in a Directed Graph",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "A directed graph has n nodes numbered from 0. An edge [u, v] runs from u to v. Return whether the graph contains a directed cycle.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated directed edges."],
    examples: [
      { input: "n = 3, edges = [[0, 1], [1, 2], [2, 0]]", output: "true" },
      { input: "n = 3, edges = [[0, 1], [1, 2]]", output: "false" },
    ],
    signature: "bool cycleDirected(int n, vector<vector<int>>& edges)",
    functionName: "cycleDirected",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::boolean(sol.cycleDirected((int)in["n"].asInt(), edges)));`,
    method: `bool cycleDirected(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        vector<int> indegree(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); indegree[edge[1]]++; }
        queue<int> ready;
        for (int node = 0; node < n; node++) if (indegree[node] == 0) ready.push(node);
        int seen = 0;
        while (!ready.empty()) {
            int node = ready.front(); ready.pop(); seen++;
            for (int next : graph[node]) if (--indegree[next] == 0) ready.push(next);
        }
        return seen != n;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "If every node can be ordered so each edge points forward, there is no cycle.",
      "Kahn's algorithm removes nodes whose incoming count is zero.",
      "A cycle keeps at least one node with a leftover incoming count.",
      "The graph has a cycle exactly when the removal process stops before every node is removed.",
    ],
    tests: [
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1], [1, 2]] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 2, edges: [[0, 1], [1, 0]] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { n: 1, edges: [] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "course-schedule",
    title: "Course Schedule",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["graph"],
    statement:
      "There are numCourses courses numbered from 0. A pair [a, b] in prerequisites means course b must be finished before course a. Return whether every course can be finished.",
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 4000", "Each pair contains two different course indexes."],
    examples: [
      { input: "numCourses = 2, prerequisites = [[1, 0]]", output: "true" },
      { input: "numCourses = 2, prerequisites = [[1, 0], [0, 1]]", output: "false" },
    ],
    signature: "bool courseSchedule(int numCourses, vector<vector<int>>& prerequisites)",
    functionName: "courseSchedule",
    driver: `auto prerequisites = in["prerequisites"].asIntMatrix();\n    printJson(Json::boolean(sol.courseSchedule((int)in["numCourses"].asInt(), prerequisites)));`,
    method: `bool courseSchedule(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);
        vector<int> indegree(numCourses);
        for (auto& edge : prerequisites) { graph[edge[1]].push_back(edge[0]); indegree[edge[0]]++; }
        queue<int> ready;
        for (int course = 0; course < numCourses; course++) if (indegree[course] == 0) ready.push(course);
        int seen = 0;
        while (!ready.empty()) {
            int course = ready.front(); ready.pop(); seen++;
            for (int next : graph[course]) if (--indegree[next] == 0) ready.push(next);
        }
        return seen == numCourses;
    }`,
    expectedTime: "O(courses + prerequisites)",
    expectedSpace: "O(courses + prerequisites)",
    hints: [
      "A course is available when every course it depends on is already finished.",
      "Draw an edge from the prerequisite to the course that waits for it.",
      "Removing available courses is the same cycle test used on a directed graph.",
      "You can finish the plan exactly when every course is removed. A mutual dependency cannot be finished.",
    ],
    tests: [
      { input: { numCourses: 2, prerequisites: [[1, 0]] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { numCourses: 1, prerequisites: [] }, expectedOutput: true, visibility: "HIDDEN" },
      { input: { numCourses: 3, prerequisites: [[1, 0], [2, 1]] }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "eventual-safe",
    title: "Find Eventual Safe States",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "graph[i] lists the nodes that node i points to. A node is eventually safe when every path that starts there ends at a terminal node. A terminal node has no outgoing edges. Return the safe nodes in increasing order.",
    constraints: ["1 <= graph.length <= 1000", "0 <= graph[i][j] < graph.length", "A node does not list the same outgoing node twice."],
    examples: [
      { input: "graph = [[1, 2], [2, 3], [5], [0], [5], [], []]", output: "[2, 4, 5, 6]" },
      { input: "graph = [[]]", output: "[0]" },
    ],
    signature: "vector<int> eventualSafe(vector<vector<int>>& graph)",
    functionName: "eventualSafe",
    driver: `auto graph = in["graph"].asIntMatrix();\n    ${numbersOut("sol.eventualSafe(graph)")}`,
    method: `vector<int> eventualSafe(vector<vector<int>>& graph) {
        int n = (int)graph.size();
        vector<int> state(n), safe;
        function<bool(int)> walk = [&](int node) -> bool {
            if (state[node]) return state[node] == 2;
            state[node] = 1;
            for (int next : graph[node]) if (!walk(next)) return false;
            state[node] = 2;
            return true;
        };
        for (int node = 0; node < n; node++) if (walk(node)) safe.push_back(node);
        return safe;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n)",
    hints: [
      "A node on a cycle is never safe, and neither is a node that can reach a cycle.",
      "A node is safe when every outgoing neighbor is safe.",
      "Mark a node while you are still exploring it. Reaching that mark means a cycle.",
      "A node with no outgoing edges is safe. Emit the safe nodes from smallest index to largest.",
    ],
    tests: [
      { input: { graph: [[1, 2], [2, 3], [5], [0], [5], [], []] }, expectedOutput: [2, 4, 5, 6], visibility: "SAMPLE" },
      { input: { graph: [[]] }, expectedOutput: [0], visibility: "SAMPLE" },
      { input: { graph: [[1], [0]] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { graph: [[1], []] }, expectedOutput: [0, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "alien-order",
    title: "Alien Dictionary",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["graph"],
    statement:
      "words is sorted in an alien alphabet of lowercase letters. Return the smallest lexicographical order of the distinct letters that is consistent with that dictionary. Return an empty string when the words contradict each other or a longer word is listed immediately before one of its prefixes.",
    constraints: ["1 <= words.length <= 100", "1 <= words[i].length <= 20", "Words use lowercase letters."],
    examples: [
      { input: 'words = ["wrt", "wrf", "er", "ett", "rftt"]', output: '"wertf"' },
      { input: 'words = ["z", "x"]', output: '"zx"' },
    ],
    signature: "string alienOrder(vector<string>& words)",
    functionName: "alienOrder",
    driver: `auto words = in["words"].asStrings();\n    printJson(Json::text(sol.alienOrder(words)));`,
    method: `string alienOrder(vector<string>& words) {
        set<char> letters;
        for (const auto& word : words) for (char ch : word) letters.insert(ch);
        unordered_map<char, vector<char>> graph;
        unordered_map<char, int> indegree;
        for (char ch : letters) indegree[ch] = 0;
        for (int i = 0; i + 1 < (int)words.size(); i++) {
            const string& a = words[i];
            const string& b = words[i + 1];
            if (a.size() > b.size() && a.compare(0, b.size(), b) == 0) return "";
            for (int j = 0; j < (int)min(a.size(), b.size()); j++) if (a[j] != b[j]) {
                graph[a[j]].push_back(b[j]);
                indegree[b[j]]++;
                break;
            }
        }
        priority_queue<char, vector<char>, greater<char>> ready;
        for (char ch : letters) if (indegree[ch] == 0) ready.push(ch);
        string order;
        while (!ready.empty()) {
            char ch = ready.top(); ready.pop();
            order.push_back(ch);
            for (char next : graph[ch]) if (--indegree[next] == 0) ready.push(next);
        }
        return order.size() == letters.size() ? order : "";
    }`,
    expectedTime: "O(total letters + alphabet log alphabet)",
    expectedSpace: "O(alphabet)",
    hints: [
      "The first position where two neighboring words differ gives one letter order: the earlier word's letter comes first.",
      "Those comparisons are directed edges. A topological order is an alphabet.",
      "Always take the smallest ready letter so the alphabet is the lexicographically smallest one.",
      "A cycle means the dictionary contradicts itself. A longer word placed before its own prefix is also invalid.",
    ],
    tests: [
      { input: { words: ["wrt", "wrf", "er", "ett", "rftt"] }, expectedOutput: "wertf", visibility: "SAMPLE" },
      { input: { words: ["z", "x"] }, expectedOutput: "zx", visibility: "SAMPLE" },
      { input: { words: ["abc", "ab"] }, expectedOutput: "", visibility: "HIDDEN" },
      { input: { words: ["a", "b", "a"] }, expectedOutput: "", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "unit-shortest",
    title: "Shortest Path in an Undirected Graph",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "An undirected graph has n nodes numbered from 0 and every edge has length 1. Return the distance from node 0 to every node. Use -1 when a node cannot be reached.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000"],
    examples: [
      { input: "n = 4, edges = [[0, 1], [0, 2], [1, 3], [2, 3]]", output: "[0, 1, 1, 2]" },
      { input: "n = 3, edges = [[0, 1]]", output: "[0, 1, -1]" },
    ],
    signature: "vector<int> unitShortest(int n, vector<vector<int>>& edges)",
    functionName: "unitShortest",
    driver: `auto edges = in["edges"].asIntMatrix();\n    ${numbersOut('sol.unitShortest((int)in["n"].asInt(), edges)')}`,
    method: `vector<int> unitShortest(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
        vector<int> dist(n, -1);
        queue<int> pending;
        dist[0] = 0; pending.push(0);
        while (!pending.empty()) {
            int node = pending.front(); pending.pop();
            for (int next : graph[node]) if (dist[next] == -1) { dist[next] = dist[node] + 1; pending.push(next); }
        }
        return dist;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "Equal edge lengths make breadth-first search produce shortest paths.",
      "Start the queue at node 0 with distance 0.",
      "The first time you reach a node, that distance is final.",
      "Nodes the search never touches stay at -1.",
    ],
    tests: [
      { input: { n: 4, edges: [[0, 1], [0, 2], [1, 3], [2, 3]] }, expectedOutput: [0, 1, 1, 2], visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1]] }, expectedOutput: [0, 1, -1], visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { n: 2, edges: [] }, expectedOutput: [0, -1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "dag-shortest",
    title: "Shortest Path in a DAG",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["graph"],
    statement:
      "A directed acyclic graph has n nodes numbered from 0. Each edge is [u, v, w], a link from u to v of positive weight w. Return the shortest distance from node 0 to every node. An unreachable node has distance 1000000000.",
    constraints: ["1 <= n <= 2000", "The graph has no directed cycle.", "1 <= w <= 1000"],
    examples: [
      { input: "n = 4, edges = [[0, 1, 2], [0, 2, 4], [1, 3, 1], [2, 3, 3]]", output: "[0, 2, 4, 3]" },
      { input: "n = 2, edges = []", output: "[0, 1000000000]" },
    ],
    signature: "vector<int> dagShortest(int n, vector<vector<int>>& edges)",
    functionName: "dagShortest",
    driver: `auto edges = in["edges"].asIntMatrix();\n    ${numbersOut('sol.dagShortest((int)in["n"].asInt(), edges)')}`,
    method: `vector<int> dagShortest(int n, vector<vector<int>>& edges) {
        vector<vector<pair<int, int>>> graph(n);
        vector<int> indegree(n);
        for (auto& edge : edges) { graph[edge[0]].push_back({edge[1], edge[2]}); indegree[edge[1]]++; }
        queue<int> ready;
        for (int node = 0; node < n; node++) if (indegree[node] == 0) ready.push(node);
        vector<int> order;
        while (!ready.empty()) {
            int node = ready.front(); ready.pop();
            order.push_back(node);
            for (auto [next, weight] : graph[node]) if (--indegree[next] == 0) ready.push(next);
        }
        const int INF = 1000000000;
        vector<int> dist(n, INF);
        dist[0] = 0;
        for (int node : order) if (dist[node] < INF) for (auto [next, weight] : graph[node]) dist[next] = min(dist[next], dist[node] + weight);
        return dist;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "In a directed acyclic graph, a topological order lets you relax every edge exactly once.",
      "Process nodes only after the nodes that can reach them.",
      "Relax an edge by replacing the target distance when the path through the current node is shorter.",
      "Start node 0 at distance 0. Anything never relaxed stays at 1000000000.",
    ],
    tests: [
      { input: { n: 4, edges: [[0, 1, 2], [0, 2, 4], [1, 3, 1], [2, 3, 3]] }, expectedOutput: [0, 2, 4, 3], visibility: "SAMPLE" },
      { input: { n: 2, edges: [] }, expectedOutput: [0, 1000000000], visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { n: 3, edges: [[0, 1, 5], [1, 2, 5]] }, expectedOutput: [0, 5, 10], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "dijkstra",
    title: "Dijkstra's Algorithm",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["shortest-path"],
    statement:
      "A directed graph has n nodes numbered from 0. Each edge is [u, v, w], from u to v, with weight w at least 0. Return the shortest distance from source to every node. Use -1 when a node cannot be reached.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "0 <= w <= 1000", "0 <= source < n"],
    examples: [
      { input: "n = 5, edges = [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 7], [2, 4, 3], [3, 4, 1]], source = 0", output: "[0, 2, 3, 9, 6]" },
      { input: "n = 3, edges = [[0, 1, 5]], source = 2", output: "[-1, -1, 0]" },
    ],
    signature: "vector<int> dijkstra(int n, vector<vector<int>>& edges, int source)",
    functionName: "dijkstra",
    driver: `auto edges = in["edges"].asIntMatrix();\n    ${numbersOut('sol.dijkstra((int)in["n"].asInt(), edges, (int)in["source"].asInt())')}`,
    method: `vector<int> dijkstra(int n, vector<vector<int>>& edges, int source) {
        vector<vector<pair<int, int>>> graph(n);
        for (auto& edge : edges) graph[edge[0]].push_back({edge[1], edge[2]});
        vector<int> dist(n, -1);
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pending;
        dist[source] = 0; pending.push({0, source});
        while (!pending.empty()) {
            auto [cost, node] = pending.top(); pending.pop();
            if (cost != dist[node]) continue;
            for (auto [next, weight] : graph[node]) if (dist[next] == -1 || cost + weight < dist[next]) {
                dist[next] = cost + weight;
                pending.push({dist[next], next});
            }
        }
        return dist;
    }`,
    expectedTime: "O((n + edges) log n)",
    expectedSpace: "O(n + edges)",
    hints: [
      "With non-negative weights, the closest unsettled node has a final distance.",
      "A priority queue ordered by distance gives you that node.",
      "Relax each outgoing edge, and ignore a queue entry whose distance is already worse than the best known distance.",
      "The source starts at 0. Nodes that never leave the queue stay at -1.",
    ],
    tests: [
      { input: { n: 5, edges: [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 7], [2, 4, 3], [3, 4, 1]], source: 0 }, expectedOutput: [0, 2, 3, 9, 6], visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1, 5]], source: 2 }, expectedOutput: [-1, -1, 0], visibility: "SAMPLE" },
      { input: { n: 1, edges: [], source: 0 }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { n: 3, edges: [[0, 1, 2], [1, 2, 3]], source: 0 }, expectedOutput: [0, 2, 5], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "maze-distance",
    title: "Shortest Path in a Binary Maze",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "grid uses 1 for an open cell and 0 for a blocked cell. start and end are [row, column]. You may step to an open four-direction neighbor. Return the number of steps from start to end. Return -1 when the end cannot be reached. A start cell that is already the end takes 0 steps.",
    constraints: ["1 <= rows, columns <= 100", "Each cell is 0 or 1.", "start and end are inside the grid."],
    examples: [
      { input: "grid = [[1, 0, 1], [1, 1, 1], [0, 1, 1]], start = [0, 0], end = [2, 2]", output: "4" },
      { input: "grid = [[1, 0], [0, 1]], start = [0, 0], end = [1, 1]", output: "-1" },
    ],
    signature: "int mazeDistance(vector<vector<int>>& grid, vector<int>& start, vector<int>& end)",
    functionName: "mazeDistance",
    driver: `auto grid = in["grid"].asIntMatrix();\n    auto start = in["start"].asIntVector();\n    auto goal = in["end"].asIntVector();\n    printJson(Json::number(sol.mazeDistance(grid, start, goal)));`,
    method: `int mazeDistance(vector<vector<int>>& grid, vector<int>& start, vector<int>& end) {
        int rows = (int)grid.size(), cols = (int)grid[0].size();
        if (grid[start[0]][start[1]] == 0 || grid[end[0]][end[1]] == 0) return -1;
        queue<array<int, 3>> pending;
        vector<vector<int>> seen(rows, vector<int>(cols));
        pending.push({start[0], start[1], 0});
        seen[start[0]][start[1]] = 1;
        int dir[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pending.empty()) {
            auto [r, c, dist] = pending.front(); pending.pop();
            if (r == end[0] && c == end[1]) return dist;
            for (auto& step : dir) {
                int nr = r + step[0], nc = c + step[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen[nr][nc] || grid[nr][nc] == 0) continue;
                seen[nr][nc] = 1;
                pending.push({nr, nc, dist + 1});
            }
        }
        return -1;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(rows * cols)",
    hints: [
      "Every open step has the same cost, so the first time you reach the end is the shortest path.",
      "Breadth-first search from the start, skipping blocked cells and cells you have already queued.",
      "The distance increases by one with every step.",
      "If the start or the end is blocked, or the search finishes without the end, return -1.",
    ],
    tests: [
      { input: { grid: [[1, 0, 1], [1, 1, 1], [0, 1, 1]], start: [0, 0], end: [2, 2] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { grid: [[1, 0], [0, 1]], start: [0, 0], end: [1, 1] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { grid: [[1]], start: [0, 0], end: [0, 0] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { grid: [[0]], start: [0, 0], end: [0, 0] }, expectedOutput: -1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "min-effort",
    title: "Path With Minimum Effort",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["shortest-path"],
    statement:
      "heights gives the elevation of each cell. A move goes to a four-direction neighbor. The effort of a path is the largest absolute elevation change on any one move of that path. Return the smallest effort of any path from the top-left cell to the bottom-right cell.",
    constraints: ["1 <= rows, columns <= 100", "0 <= heights[r][c] <= 1000000"],
    examples: [
      { input: "heights = [[1, 2, 2], [3, 8, 2], [5, 3, 5]]", output: "2" },
      { input: "heights = [[1, 2, 3], [3, 8, 4], [5, 3, 5]]", output: "1" },
    ],
    signature: "int minEffort(vector<vector<int>>& heights)",
    functionName: "minEffort",
    driver: `auto heights = in["heights"].asIntMatrix();\n    printJson(Json::number(sol.minEffort(heights)));`,
    method: `int minEffort(vector<vector<int>>& heights) {
        int rows = (int)heights.size(), cols = (int)heights[0].size();
        const int INF = 1000000000;
        vector<vector<int>> best(rows, vector<int>(cols, INF));
        priority_queue<array<int, 3>, vector<array<int, 3>>, greater<array<int, 3>>> pending;
        best[0][0] = 0; pending.push({0, 0, 0});
        int dir[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pending.empty()) {
            auto [effort, r, c] = pending.top(); pending.pop();
            if (effort != best[r][c]) continue;
            if (r == rows - 1 && c == cols - 1) return effort;
            for (auto& step : dir) {
                int nr = r + step[0], nc = c + step[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
                int next = max(effort, abs(heights[nr][nc] - heights[r][c]));
                if (next < best[nr][nc]) { best[nr][nc] = next; pending.push({next, nr, nc}); }
            }
        }
        return best[rows - 1][cols - 1];
    }`,
    expectedTime: "O(rows * cols * log(rows * cols))",
    expectedSpace: "O(rows * cols)",
    hints: [
      "The cost of reaching a cell is not a sum. It is the largest climb you have already accepted.",
      "Dijkstra still works if the priority is that running maximum.",
      "A move updates the effort to the larger of the path effort so far and the absolute height difference.",
      "The first time the bottom-right cell is popped, its effort is the minimum possible.",
    ],
    tests: [
      { input: { heights: [[1, 2, 2], [3, 8, 2], [5, 3, 5]] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { heights: [[1, 2, 3], [3, 8, 4], [5, 3, 5]] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { heights: [[1]] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { heights: [[1, 10], [100, 12]] }, expectedOutput: 9, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "cheapest-flights",
    title: "Cheapest Flights Within K Stops",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["shortest-path"],
    statement:
      "There are n cities numbered from 0. Each flight is [from, to, price]. A path may use at most k stops, so it contains at most k + 1 flights. Return the cheapest price from src to dst. Return -1 when no such route exists.",
    constraints: ["1 <= n <= 100", "0 <= flights.length <= 1000", "0 <= k < n", "1 <= price <= 10000", "src and dst are different cities."],
    examples: [
      { input: "n = 4, flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src = 0, dst = 3, k = 1", output: "700" },
      { input: "n = 3, flights = [[0, 1, 100]], src = 0, dst = 2, k = 1", output: "-1" },
    ],
    signature: "int cheapestFlights(int n, vector<vector<int>>& flights, int src, int dst, int k)",
    functionName: "cheapestFlights",
    driver: `auto flights = in["flights"].asIntMatrix();\n    printJson(Json::number(sol.cheapestFlights((int)in["n"].asInt(), flights, (int)in["src"].asInt(), (int)in["dst"].asInt(), (int)in["k"].asInt())));`,
    method: `int cheapestFlights(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        const int INF = 1000000000;
        vector<int> dist(n, INF);
        dist[src] = 0;
        for (int stop = 0; stop <= k; stop++) {
            vector<int> next = dist;
            for (auto& flight : flights) if (dist[flight[0]] < INF && dist[flight[0]] + flight[2] < next[flight[1]]) next[flight[1]] = dist[flight[0]] + flight[2];
            dist.swap(next);
        }
        return dist[dst] >= INF ? -1 : dist[dst];
    }`,
    expectedTime: "O(k * flights)",
    expectedSpace: "O(n)",
    hints: [
      "A stop limit means you may relax the flight list only k + 1 times.",
      "Keep a copy of the distances from the previous round so one round cannot chain extra flights.",
      "Each round represents using one more flight.",
      "If the destination is still untouched after k + 1 rounds, return -1.",
    ],
    tests: [
      { input: { n: 4, flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src: 0, dst: 3, k: 1 }, expectedOutput: 700, visibility: "SAMPLE" },
      { input: { n: 3, flights: [[0, 1, 100]], src: 0, dst: 2, k: 1 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { n: 3, flights: [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src: 0, dst: 2, k: 1 }, expectedOutput: 200, visibility: "HIDDEN" },
      { input: { n: 2, flights: [[0, 1, 10]], src: 0, dst: 1, k: 0 }, expectedOutput: 10, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "network-delay",
    title: "Network Delay Time",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["shortest-path"],
    statement:
      "There are n nodes numbered from 1 to n. times lists directed signals [u, v, w], meaning a signal sent from u reaches v after w units. The signal starts at node k at time 0. Return the time when every node has received it. Return -1 when some node never receives it.",
    constraints: ["1 <= n <= 100", "0 <= times.length <= 2000", "1 <= w <= 100", "1 <= k <= n"],
    examples: [
      { input: "times = [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n = 4, k = 2", output: "2" },
      { input: "times = [[1, 2, 1]], n = 2, k = 2", output: "-1" },
    ],
    signature: "int networkDelay(vector<vector<int>>& times, int n, int k)",
    functionName: "networkDelay",
    driver: `auto times = in["times"].asIntMatrix();\n    printJson(Json::number(sol.networkDelay(times, (int)in["n"].asInt(), (int)in["k"].asInt())));`,
    method: `int networkDelay(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int, int>>> graph(n + 1);
        for (auto& edge : times) graph[edge[0]].push_back({edge[1], edge[2]});
        const int INF = 1000000000;
        vector<int> dist(n + 1, INF);
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pending;
        dist[k] = 0; pending.push({0, k});
        while (!pending.empty()) {
            auto [cost, node] = pending.top(); pending.pop();
            if (cost != dist[node]) continue;
            for (auto [next, weight] : graph[node]) if (cost + weight < dist[next]) {
                dist[next] = cost + weight;
                pending.push({dist[next], next});
            }
        }
        int answer = 0;
        for (int node = 1; node <= n; node++) answer = max(answer, dist[node]);
        return answer >= INF ? -1 : answer;
    }`,
    expectedTime: "O((n + edges) log n)",
    expectedSpace: "O(n + edges)",
    hints: [
      "The time for the whole network is the farthest shortest path from the source.",
      "Dijkstra applies because every travel time is positive.",
      "After the distances are final, take the maximum among nodes 1 through n.",
      "If any of those distances was never set, some node is unreachable and the answer is -1.",
    ],
    tests: [
      { input: { times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n: 4, k: 2 }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { times: [[1, 2, 1]], n: 2, k: 2 }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { times: [], n: 1, k: 1 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { times: [[1, 2, 1], [2, 3, 2]], n: 3, k: 1 }, expectedOutput: 3, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "count-paths",
    title: "Number of Ways to Arrive at Destination",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["shortest-path"],
    statement:
      "An undirected weighted graph has n nodes numbered from 0. You start at 0 and want node n - 1. roads lists [u, v, time]. Return how many different shortest routes reach the destination, modulo 1000000007. The destination is reachable.",
    constraints: ["1 <= n <= 200", "0 <= roads.length <= 4000", "1 <= time <= 1000"],
    examples: [
      { input: "n = 4, roads = [[0, 1, 1], [0, 2, 2], [1, 3, 1], [2, 3, 1]]", output: "1" },
      { input: "n = 4, roads = [[0, 1, 1], [0, 2, 1], [1, 3, 1], [2, 3, 1]]", output: "2" },
    ],
    signature: "int countPaths(int n, vector<vector<int>>& roads)",
    functionName: "countPaths",
    driver: `auto roads = in["roads"].asIntMatrix();\n    printJson(Json::number(sol.countPaths((int)in["n"].asInt(), roads)));`,
    method: `int countPaths(int n, vector<vector<int>>& roads) {
        vector<vector<pair<int, int>>> graph(n);
        for (auto& road : roads) { graph[road[0]].push_back({road[1], road[2]}); graph[road[1]].push_back({road[0], road[2]}); }
        const long long INF = 4e18;
        const int MOD = 1000000007;
        vector<long long> dist(n, INF), ways(n);
        dist[0] = 0; ways[0] = 1;
        priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> pending;
        pending.push({0, 0});
        while (!pending.empty()) {
            auto [cost, node] = pending.top(); pending.pop();
            if (cost != dist[node]) continue;
            for (auto [next, time] : graph[node]) {
                if (cost + time < dist[next]) { dist[next] = cost + time; ways[next] = ways[node]; pending.push({dist[next], next}); }
                else if (cost + time == dist[next]) ways[next] = (ways[next] + ways[node]) % MOD;
            }
        }
        return (int)ways[n - 1];
    }`,
    expectedTime: "O((n + roads) log n)",
    expectedSpace: "O(n + roads)",
    hints: [
      "Count only the routes whose total time equals the shortest time.",
      "Dijkstra can carry both the best time and the number of ways to achieve it.",
      "A strictly shorter arrival replaces the way count. An equal arrival adds the ways.",
      "Take the way count modulo 1000000007 when you add. The answer for the destination is that count.",
    ],
    tests: [
      { input: { n: 4, roads: [[0, 1, 1], [0, 2, 2], [1, 3, 1], [2, 3, 1]] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { n: 4, roads: [[0, 1, 1], [0, 2, 1], [1, 3, 1], [2, 3, 1]] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { n: 2, roads: [[0, 1, 3]] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { n: 1, roads: [] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "min-multiplications",
    title: "Minimum Multiplications to Reach End",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "Start with start. One step multiplies the current value by one entry of arr and then reduces it modulo 100000. Return the fewest steps that produce end. Return -1 when end cannot be produced. If start already equals end, return 0.",
    constraints: ["0 <= start, end < 100000", "1 <= arr.length <= 20", "1 <= arr[i] <= 10000"],
    examples: [
      { input: "start = 3, end = 30, arr = [2, 5, 7]", output: "2" },
      { input: "start = 2, end = 7, arr = [3, 5, 7]", output: "-1" },
    ],
    signature: "int minMultiplications(int start, int end, vector<int>& arr)",
    functionName: "minMultiplications",
    driver: `auto arr = in["arr"].asIntVector();\n    printJson(Json::number(sol.minMultiplications((int)in["start"].asInt(), (int)in["end"].asInt(), arr)));`,
    method: `int minMultiplications(int start, int end, vector<int>& arr) {
        if (start == end) return 0;
        const int MOD = 100000;
        queue<pair<int, int>> pending;
        vector<int> seen(MOD);
        pending.push({start, 0});
        seen[start] = 1;
        while (!pending.empty()) {
            auto [value, steps] = pending.front(); pending.pop();
            for (int factor : arr) {
                int next = (int)((1LL * value * factor) % MOD);
                if (seen[next]) continue;
                if (next == end) return steps + 1;
                seen[next] = 1;
                pending.push({next, steps + 1});
            }
        }
        return -1;
    }`,
    expectedTime: "O(100000 * arr.length)",
    expectedSpace: "O(100000)",
    hints: [
      "Every reachable residue modulo 100000 is a node, and each multiplier is an edge.",
      "Breadth-first search gives the fewest multiplications.",
      "Mark a residue the first time you create it so the search stays finite.",
      "If the queue empties without seeing end, return -1. Equal start and end need no multiplication.",
    ],
    tests: [
      { input: { start: 3, end: 30, arr: [2, 5, 7] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { start: 2, end: 7, arr: [3, 5, 7] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { start: 3, end: 3, arr: [2] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { start: 7, end: 21, arr: [3] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "bellman-ford",
    title: "Bellman-Ford Algorithm",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["shortest-path"],
    statement:
      "A directed graph has n nodes numbered from 0. Each edge is [u, v, w] and w may be negative. Return the shortest distance from node 0 to every node. An unreachable node has distance 1000000000. If a negative cycle can be reached from node 0, return an empty list.",
    constraints: ["1 <= n <= 200", "0 <= edges.length <= 4000", "-1000 <= w <= 1000"],
    examples: [
      { input: "n = 5, edges = [[0, 1, -1], [0, 2, 4], [1, 2, 3], [1, 3, 2], [1, 4, 2], [3, 2, 5], [3, 1, 1], [4, 3, -3]]", output: "[0, -1, 2, -2, 1]" },
      { input: "n = 3, edges = [[0, 1, 1], [1, 2, -1], [2, 1, -1]]", output: "[]" },
    ],
    signature: "vector<int> bellmanFord(int n, vector<vector<int>>& edges)",
    functionName: "bellmanFord",
    driver: `auto edges = in["edges"].asIntMatrix();\n    ${numbersOut('sol.bellmanFord((int)in["n"].asInt(), edges)')}`,
    method: `vector<int> bellmanFord(int n, vector<vector<int>>& edges) {
        const int INF = 1000000000;
        vector<int> dist(n, INF);
        dist[0] = 0;
        for (int round = 0; round < n - 1; round++) for (auto& edge : edges) if (dist[edge[0]] < INF && dist[edge[0]] + edge[2] < dist[edge[1]]) dist[edge[1]] = dist[edge[0]] + edge[2];
        for (auto& edge : edges) if (dist[edge[0]] < INF && dist[edge[0]] + edge[2] < dist[edge[1]]) return {};
        return dist;
    }`,
    expectedTime: "O(n * edges)",
    expectedSpace: "O(n)",
    hints: [
      "Relaxing every edge n - 1 times is enough when there is no negative cycle.",
      "An edge relaxes when the path through its source is shorter than the target's current distance.",
      "Only relax from a source that has actually been reached from node 0.",
      "One extra pass that still improves a reached node means a negative cycle is reachable. Return an empty list in that case.",
    ],
    tests: [
      { input: { n: 5, edges: [[0, 1, -1], [0, 2, 4], [1, 2, 3], [1, 3, 2], [1, 4, 2], [3, 2, 5], [3, 1, 1], [4, 3, -3]] }, expectedOutput: [0, -1, 2, -2, 1], visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1, 1], [1, 2, -1], [2, 1, -1]] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { n: 3, edges: [[1, 2, -5]] }, expectedOutput: [0, 1000000000, 1000000000], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "floyd-warshall",
    title: "Floyd Warshall Algorithm",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["shortest-path"],
    statement:
      "matrix is an n by n directed distance table. matrix[i][i] is 0. matrix[i][j] is -1 when there is no direct edge, and otherwise it is the non-negative weight of the edge from i to j. Return the shortest-distance table. Use -1 when two nodes have no path. There is no negative cycle.",
    constraints: ["1 <= n <= 50", "Diagonal entries are 0.", "Off-diagonal entries are -1 or from 0 to 1000."],
    examples: [
      { input: "matrix = [[0, 3, -1], [2, 0, -1], [-1, 7, 0]]", output: "[[0, 3, -1], [2, 0, -1], [9, 7, 0]]" },
      { input: "matrix = [[0, -1], [-1, 0]]", output: "[[0, -1], [-1, 0]]" },
    ],
    signature: "vector<vector<int>> floydWarshall(vector<vector<int>>& matrix)",
    functionName: "floydWarshall",
    driver: `auto matrix = in["matrix"].asIntMatrix();\n    ${rowsOut("sol.floydWarshall(matrix)")}`,
    method: `vector<vector<int>> floydWarshall(vector<vector<int>>& matrix) {
        int n = (int)matrix.size();
        const int INF = 1000000000;
        vector<vector<int>> dist = matrix;
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (i != j && dist[i][j] == -1) dist[i][j] = INF;
        for (int mid = 0; mid < n; mid++) for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (dist[i][mid] < INF && dist[mid][j] < INF) dist[i][j] = min(dist[i][j], dist[i][mid] + dist[mid][j]);
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (dist[i][j] >= INF) dist[i][j] = -1;
        return dist;
    }`,
    expectedTime: "O(n^3)",
    expectedSpace: "O(n^2)",
    hints: [
      "Allowing one extra intermediate node can only shorten or preserve a path.",
      "Replace a missing edge with a huge sentinel before the updates, and turn leftovers back into -1 at the end.",
      "For every midpoint, try every pair and keep the smaller of the old distance and the path through the midpoint.",
      "The diagonal stays 0. A pair that never becomes finite has no path.",
    ],
    tests: [
      { input: { matrix: [[0, 3, -1], [2, 0, -1], [-1, 7, 0]] }, expectedOutput: [[0, 3, -1], [2, 0, -1], [9, 7, 0]], visibility: "SAMPLE" },
      { input: { matrix: [[0, -1], [-1, 0]] }, expectedOutput: [[0, -1], [-1, 0]], visibility: "SAMPLE" },
      { input: { matrix: [[0]] }, expectedOutput: [[0]], visibility: "HIDDEN" },
      { input: { matrix: [[0, 1], [1, 0]] }, expectedOutput: [[0, 1], [1, 0]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "smallest-city",
    title: "Find the City With the Smallest Number of Neighbors",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["shortest-path"],
    statement:
      "n cities are numbered from 0. Each undirected edge is [u, v, weight]. A city can reach another city when the shortest-path distance is at most distanceThreshold. Return the city that can reach the fewest other cities. If several cities tie, return the greatest index.",
    constraints: ["1 <= n <= 50", "0 <= edges.length <= 1000", "1 <= weight, distanceThreshold <= 10000"],
    examples: [
      { input: "n = 4, edges = [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], distanceThreshold = 4", output: "3" },
      { input: "n = 2, edges = [[0, 1, 1]], distanceThreshold = 1", output: "1" },
    ],
    signature: "int smallestCity(int n, vector<vector<int>>& edges, int distanceThreshold)",
    functionName: "smallestCity",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::number(sol.smallestCity((int)in["n"].asInt(), edges, (int)in["distanceThreshold"].asInt())));`,
    method: `int smallestCity(int n, vector<vector<int>>& edges, int distanceThreshold) {
        const int INF = 1000000000;
        vector<vector<int>> dist(n, vector<int>(n, INF));
        for (int i = 0; i < n; i++) dist[i][i] = 0;
        for (auto& edge : edges) { dist[edge[0]][edge[1]] = min(dist[edge[0]][edge[1]], edge[2]); dist[edge[1]][edge[0]] = min(dist[edge[1]][edge[0]], edge[2]); }
        for (int mid = 0; mid < n; mid++) for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) dist[i][j] = min(dist[i][j], dist[i][mid] + dist[mid][j]);
        int best = n, answer = -1;
        for (int city = 0; city < n; city++) {
            int count = 0;
            for (int other = 0; other < n; other++) if (other != city && dist[city][other] <= distanceThreshold) count++;
            if (count <= best) { best = count; answer = city; }
        }
        return answer;
    }`,
    expectedTime: "O(n^3)",
    expectedSpace: "O(n^2)",
    hints: [
      "The neighbor count depends on shortest paths, not only on direct roads.",
      "Floyd-Warshall fills every pairwise distance on a small city graph.",
      "Count other cities whose distance is within the threshold.",
      "Walk the cities from small index to large and replace the answer on a tie, so the greatest index wins.",
    ],
    tests: [
      { input: { n: 4, edges: [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], distanceThreshold: 4 }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { n: 2, edges: [[0, 1, 1]], distanceThreshold: 1 }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { n: 1, edges: [], distanceThreshold: 1 }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { n: 3, edges: [[0, 1, 2]], distanceThreshold: 1 }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "prim-mst",
    title: "Prim's Algorithm",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["mst"],
    statement:
      "An undirected weighted graph has n nodes numbered from 0. Each edge is [u, v, w]. Return the total weight of a minimum spanning tree grown by Prim's algorithm from node 0. Return -1 when the graph is disconnected. A single node has weight 0.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "1 <= w <= 1000", "There are no self-loops."],
    examples: [
      { input: "n = 3, edges = [[0, 1, 1], [1, 2, 2], [0, 2, 3]]", output: "3" },
      { input: "n = 3, edges = [[0, 1, 1]]", output: "-1" },
    ],
    signature: "int primMst(int n, vector<vector<int>>& edges)",
    functionName: "primMst",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::number(sol.primMst((int)in["n"].asInt(), edges)));`,
    method: `int primMst(int n, vector<vector<int>>& edges) {
        vector<vector<pair<int, int>>> graph(n);
        for (auto& edge : edges) { graph[edge[0]].push_back({edge[1], edge[2]}); graph[edge[1]].push_back({edge[0], edge[2]}); }
        vector<int> seen(n);
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pending;
        pending.push({0, 0});
        int weight = 0, taken = 0;
        while (!pending.empty()) {
            auto [cost, node] = pending.top(); pending.pop();
            if (seen[node]) continue;
            seen[node] = 1; weight += cost; taken++;
            for (auto [next, edgeWeight] : graph[node]) if (!seen[next]) pending.push({edgeWeight, next});
        }
        return taken == n ? weight : -1;
    }`,
    expectedTime: "O((n + edges) log n)",
    expectedSpace: "O(n + edges)",
    hints: [
      "Prim's algorithm grows one tree. The next edge is the cheapest edge that leaves the grown set.",
      "A priority queue of edge weights, starting from node 0 with cost 0, supplies that edge.",
      "Skip a node that is already in the tree, then add the weight of the edge that first reaches a new node.",
      "If the tree never absorbs every node, the graph is disconnected and the answer is -1.",
    ],
    tests: [
      { input: { n: 3, edges: [[0, 1, 1], [1, 2, 2], [0, 2, 3]] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1, 1]] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { n: 4, edges: [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]] }, expectedOutput: 6, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "disjoint-set",
    title: "Disjoint Set Union",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dsu"],
    statement:
      "n elements are numbered from 0, each in its own set. commands are union a b and find a. union joins the sets of a and b. find returns the representative of a. Join by rank. When the ranks are equal, the smaller index becomes the parent and its rank grows by one. Compress paths during find. Return the results of the find commands in order.",
    constraints: ["1 <= n <= 1000", "1 <= commands.length <= 1000", "Indexes in a command are from 0 to n - 1."],
    examples: [
      { input: 'n = 5, commands = ["union 1 2", "find 2", "union 2 3", "find 1", "find 4", "union 4 3", "find 4"]', output: "[1, 1, 4, 1]" },
      { input: 'n = 1, commands = ["find 0"]', output: "[0]" },
    ],
    signature: "vector<int> disjointSet(int n, vector<string>& commands)",
    functionName: "disjointSet",
    driver: `auto commands = in["commands"].asStrings();\n    ${numbersOut('sol.disjointSet((int)in["n"].asInt(), commands)')}`,
    method: `vector<int> disjointSet(int n, vector<string>& commands) {
        vector<int> parent(n), rank(n);
        iota(parent.begin(), parent.end(), 0);
        function<int(int)> find = [&](int node) -> int {
            if (parent[node] != node) parent[node] = find(parent[node]);
            return parent[node];
        };
        auto unite = [&](int a, int b) {
            a = find(a); b = find(b);
            if (a == b) return;
            if (rank[a] < rank[b] || (rank[a] == rank[b] && a > b)) swap(a, b);
            parent[b] = a;
            if (rank[a] == rank[b]) rank[a]++;
        };
        vector<int> out;
        for (const auto& command : commands) {
            stringstream ss(command);
            string kind; int a, b;
            ss >> kind >> a;
            if (kind == "union") { ss >> b; unite(a, b); }
            else out.push_back(find(a));
        }
        return out;
    }`,
    expectedTime: "O(commands * inverse Ackermann)",
    expectedSpace: "O(n)",
    hints: [
      "Each set remembers a parent. The representative is the node that points at itself.",
      "Path compression makes a found node point directly at the representative.",
      "Union by rank attaches the shorter tree under the taller one.",
      "On a rank tie, keep the smaller index as the parent and increase its rank. find reports that parent.",
    ],
    tests: [
      { input: { n: 5, commands: ["union 1 2", "find 2", "union 2 3", "find 1", "find 4", "union 4 3", "find 4"] }, expectedOutput: [1, 1, 4, 1], visibility: "SAMPLE" },
      { input: { n: 1, commands: ["find 0"] }, expectedOutput: [0], visibility: "SAMPLE" },
      { input: { n: 3, commands: ["union 2 0", "find 2", "find 1"] }, expectedOutput: [0, 1], visibility: "HIDDEN" },
      { input: { n: 2, commands: ["union 0 1", "union 1 0", "find 1"] }, expectedOutput: [0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "kruskal-mst",
    title: "Minimum Spanning Tree Weight",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["mst"],
    statement:
      "An undirected weighted graph has n nodes numbered from 0. Each edge is [u, v, w]. Return the total weight of a minimum spanning tree. Return -1 when the graph is disconnected. A single node has weight 0.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "1 <= w <= 1000", "There are no self-loops."],
    examples: [
      { input: "n = 3, edges = [[0, 1, 1], [1, 2, 2], [0, 2, 3]]", output: "3" },
      { input: "n = 3, edges = [[0, 1, 1]]", output: "-1" },
    ],
    signature: "int kruskalMst(int n, vector<vector<int>>& edges)",
    functionName: "kruskalMst",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::number(sol.kruskalMst((int)in["n"].asInt(), edges)));`,
    method: `int kruskalMst(int n, vector<vector<int>>& edges) {
        sort(edges.begin(), edges.end(), [](const auto& a, const auto& b) {
            if (a[2] != b[2]) return a[2] < b[2];
            if (a[0] != b[0]) return a[0] < b[0];
            return a[1] < b[1];
        });
        vector<int> parent(n), rank(n);
        iota(parent.begin(), parent.end(), 0);
        function<int(int)> find = [&](int node) -> int {
            if (parent[node] != node) parent[node] = find(parent[node]);
            return parent[node];
        };
        int weight = 0, used = 0;
        for (auto& edge : edges) {
            int a = find(edge[0]), b = find(edge[1]);
            if (a == b) continue;
            if (rank[a] < rank[b] || (rank[a] == rank[b] && a > b)) swap(a, b);
            parent[b] = a;
            if (rank[a] == rank[b]) rank[a]++;
            weight += edge[2]; used++;
        }
        return used == n - 1 ? weight : -1;
    }`,
    expectedTime: "O(edges log edges)",
    expectedSpace: "O(n)",
    hints: [
      "Kruskal's algorithm adds the cheapest edge that does not close a cycle.",
      "Sort the edges by weight. A disjoint-set structure tells you whether the endpoints are already connected.",
      "Add the edge only when the endpoints are in different sets, and add its weight.",
      "A spanning tree of n nodes has n - 1 edges. Fewer accepted edges means the graph is disconnected.",
    ],
    tests: [
      { input: { n: 3, edges: [[0, 1, 1], [1, 2, 2], [0, 2, 3]] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1, 1]] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { n: 4, edges: [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 10]] }, expectedOutput: 6, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "connect-network",
    title: "Number of Operations to Make Network Connected",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dsu"],
    statement:
      "n computers are numbered from 0. connections lists undirected cables already in place. You may remove a cable that is redundant and plug it between two components. Return the fewest such moves that make the whole network connected. Return -1 when there are not enough cables. A network of one computer needs 0 moves.",
    constraints: ["1 <= n <= 2000", "0 <= connections.length <= 4000"],
    examples: [
      { input: "n = 4, connections = [[0, 1], [0, 2], [1, 2]]", output: "1" },
      { input: "n = 6, connections = [[0, 1]]", output: "-1" },
    ],
    signature: "int connectNetwork(int n, vector<vector<int>>& connections)",
    functionName: "connectNetwork",
    driver: `auto connections = in["connections"].asIntMatrix();\n    printJson(Json::number(sol.connectNetwork((int)in["n"].asInt(), connections)));`,
    method: `int connectNetwork(int n, vector<vector<int>>& connections) {
        vector<int> parent(n);
        iota(parent.begin(), parent.end(), 0);
        function<int(int)> find = [&](int node) -> int {
            if (parent[node] != node) parent[node] = find(parent[node]);
            return parent[node];
        };
        int extra = 0;
        for (auto& edge : connections) {
            int a = find(edge[0]), b = find(edge[1]);
            if (a == b) extra++;
            else parent[b] = a;
        }
        int components = 0;
        for (int node = 0; node < n; node++) if (find(node) == node) components++;
        int need = components - 1;
        return extra >= need ? need : -1;
    }`,
    expectedTime: "O(n + connections)",
    expectedSpace: "O(n)",
    hints: [
      "Connecting c components takes c - 1 cables.",
      "A cable whose ends are already in the same component is spare and can be moved.",
      "Count the components and the spare cables with a disjoint-set structure.",
      "If the spare cables are fewer than the gaps between components, return -1.",
    ],
    tests: [
      { input: { n: 4, connections: [[0, 1], [0, 2], [1, 2]] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { n: 6, connections: [[0, 1]] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { n: 6, connections: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3]] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { n: 1, connections: [] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "remove-stones",
    title: "Most Stones Removed with Same Row or Column",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["dsu"],
    statement:
      "stones lists distinct cells [row, column]. A move removes a stone that shares a row or a column with another stone that is still present. Return the largest number of stones you can remove.",
    constraints: ["1 <= stones.length <= 1000", "0 <= row, column <= 10000", "The cells are distinct."],
    examples: [
      { input: "stones = [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1], [2, 2]]", output: "5" },
      { input: "stones = [[0, 0]]", output: "0" },
    ],
    signature: "int removeStones(vector<vector<int>>& stones)",
    functionName: "removeStones",
    driver: `auto stones = in["stones"].asIntMatrix();\n    printJson(Json::number(sol.removeStones(stones)));`,
    method: `int removeStones(vector<vector<int>>& stones) {
        int n = (int)stones.size();
        vector<int> parent(n);
        iota(parent.begin(), parent.end(), 0);
        function<int(int)> find = [&](int node) -> int {
            if (parent[node] != node) parent[node] = find(parent[node]);
            return parent[node];
        };
        unordered_map<int, int> row, col;
        for (int i = 0; i < n; i++) {
            int r = stones[i][0], c = stones[i][1];
            if (row.count(r)) parent[find(i)] = find(row[r]);
            else row[r] = i;
            if (col.count(c)) parent[find(i)] = find(col[c]);
            else col[c] = i;
        }
        int components = 0;
        for (int i = 0; i < n; i++) if (find(i) == i) components++;
        return n - components;
    }`,
    expectedTime: "O(stones)",
    expectedSpace: "O(stones)",
    hints: [
      "Stones that share a row or column, directly or through other stones, belong to one group.",
      "In one group you can keep removing until a single stone remains.",
      "Join stones that share a row or a column in a disjoint-set structure.",
      "The number you can remove is the number of stones minus the number of groups. One stone removes nothing.",
    ],
    tests: [
      { input: { stones: [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1], [2, 2]] }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { stones: [[0, 0]] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { stones: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]] }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { stones: [[0, 0], [1, 1]] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "accounts-merge",
    title: "Accounts Merge",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dsu"],
    statement:
      "Each account starts with a name and then lists that person's email addresses. If two accounts share an email, they are the same person. Merge those accounts. In each result, put the name first and then the emails in sorted order. Sort the accounts by name, and break ties by the first email.",
    constraints: ["1 <= accounts.length <= 50", "Each account has a name and at least one email.", "An email belongs to only one name."],
    examples: [
      {
        input: 'accounts = [["John", "a@mail.com", "b@mail.com"], ["John", "b@mail.com", "c@mail.com"], ["Mary", "m@mail.com"]]',
        output: '[["John", "a@mail.com", "b@mail.com", "c@mail.com"], ["Mary", "m@mail.com"]]',
      },
      { input: 'accounts = [["Gabe", "g@mail.com"], ["Gabe", "g2@mail.com"]]', output: '[["Gabe", "g2@mail.com"], ["Gabe", "g@mail.com"]]' },
    ],
    signature: "vector<vector<string>> accountsMerge(vector<vector<string>>& accounts)",
    functionName: "accountsMerge",
    driver: `vector<vector<string>> accounts;\n    for (const auto& row : in["accounts"].a) { vector<string> account; for (const auto& cell : row.a) account.push_back(cell.asString()); accounts.push_back(account); }\n    ${stringRows("sol.accountsMerge(accounts)")}`,
    method: `vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {
        unordered_map<string, string> parent, owner;
        function<string(string)> find = [&](string email) -> string {
            if (!parent.count(email)) parent[email] = email;
            if (parent[email] != email) parent[email] = find(parent[email]);
            return parent[email];
        };
        for (auto& account : accounts) for (int i = 1; i < (int)account.size(); i++) {
            owner[account[i]] = account[0];
            string a = find(account[1]), b = find(account[i]);
            if (a != b) parent[b] = a;
        }
        unordered_map<string, vector<string>> groups;
        for (auto& entry : owner) groups[find(entry.first)].push_back(entry.first);
        vector<vector<string>> out;
        for (auto& entry : groups) {
            auto emails = entry.second;
            sort(emails.begin(), emails.end());
            emails.insert(emails.begin(), owner[entry.first]);
            out.push_back(emails);
        }
        sort(out.begin(), out.end());
        return out;
    }`,
    expectedTime: "O(emails log emails)",
    expectedSpace: "O(emails)",
    hints: [
      "Treat emails as nodes. Emails listed on the same account belong in one set.",
      "A disjoint-set join on the emails merges accounts that share any address.",
      "Remember which name owns each email. After merging, sort the emails in each set.",
      "Sort the finished accounts by name and then by the first email. Two Gabe accounts with no shared email stay separate.",
    ],
    tests: [
      {
        input: { accounts: [["John", "a@mail.com", "b@mail.com"], ["John", "b@mail.com", "c@mail.com"], ["Mary", "m@mail.com"]] },
        expectedOutput: [["John", "a@mail.com", "b@mail.com", "c@mail.com"], ["Mary", "m@mail.com"]],
        visibility: "SAMPLE",
      },
      {
        input: { accounts: [["Gabe", "g@mail.com"], ["Gabe", "g2@mail.com"]] },
        expectedOutput: [["Gabe", "g2@mail.com"], ["Gabe", "g@mail.com"]],
        visibility: "SAMPLE",
      },
      { input: { accounts: [["Ada", "ada@mail.com"]] }, expectedOutput: [["Ada", "ada@mail.com"]], visibility: "HIDDEN" },
      {
        input: { accounts: [["Alex", "a@mail.com", "b@mail.com"], ["Alex", "c@mail.com"], ["Alex", "b@mail.com", "c@mail.com"]] },
        expectedOutput: [["Alex", "a@mail.com", "b@mail.com", "c@mail.com"]],
        visibility: "HIDDEN",
      },
    ],
  }),
  problem({
    slug: "islands-online",
    title: "Number of Islands II",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dsu"],
    statement:
      "A sea has m rows and n columns and starts with no land. positions lists cells that become land, in order. Adding a cell that is already land does not change the map. Land cells join when they share an edge. Return the number of islands after each addition.",
    constraints: ["1 <= m, n <= 50", "1 <= positions.length <= 200", "Each position is inside the sea."],
    examples: [
      { input: "m = 3, n = 3, positions = [[0, 0], [0, 1], [1, 2], [2, 1]]", output: "[1, 1, 2, 3]" },
      { input: "m = 1, n = 1, positions = [[0, 0], [0, 0]]", output: "[1, 1]" },
    ],
    signature: "vector<int> islandsOnline(int m, int n, vector<vector<int>>& positions)",
    functionName: "islandsOnline",
    driver: `auto positions = in["positions"].asIntMatrix();\n    ${numbersOut('sol.islandsOnline((int)in["m"].asInt(), (int)in["n"].asInt(), positions)')}`,
    method: `vector<int> islandsOnline(int m, int n, vector<vector<int>>& positions) {
        vector<int> parent(m * n, -1), rank(m * n), out;
        int count = 0;
        function<int(int)> find = [&](int node) -> int {
            if (parent[node] != node) parent[node] = find(parent[node]);
            return parent[node];
        };
        auto unite = [&](int a, int b) {
            a = find(a); b = find(b);
            if (a == b) return;
            if (rank[a] < rank[b] || (rank[a] == rank[b] && a > b)) swap(a, b);
            parent[b] = a;
            if (rank[a] == rank[b]) rank[a]++;
            count--;
        };
        int dir[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (auto& cell : positions) {
            int id = cell[0] * n + cell[1];
            if (parent[id] == -1) {
                parent[id] = id; count++;
                for (auto& step : dir) {
                    int nr = cell[0] + step[0], nc = cell[1] + step[1];
                    if (nr < 0 || nc < 0 || nr >= m || nc >= n || parent[nr * n + nc] == -1) continue;
                    unite(id, nr * n + nc);
                }
            }
            out.push_back(count);
        }
        return out;
    }`,
    expectedTime: "O(positions * inverse Ackermann)",
    expectedSpace: "O(m * n)",
    hints: [
      "Each new land cell starts as its own island, then merges with land neighbors.",
      "A disjoint-set slot per cell can stay empty until that cell is added.",
      "Union with each existing four-direction neighbor and decrease the island count once per real merge.",
      "Adding a cell that is already land reports the current count again.",
    ],
    tests: [
      { input: { m: 3, n: 3, positions: [[0, 0], [0, 1], [1, 2], [2, 1]] }, expectedOutput: [1, 1, 2, 3], visibility: "SAMPLE" },
      { input: { m: 1, n: 1, positions: [[0, 0], [0, 0]] }, expectedOutput: [1, 1], visibility: "SAMPLE" },
      { input: { m: 2, n: 2, positions: [[0, 0], [1, 1]] }, expectedOutput: [1, 2], visibility: "HIDDEN" },
      { input: { m: 1, n: 2, positions: [[0, 0], [0, 1]] }, expectedOutput: [1, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "largest-island",
    title: "Making A Large Island",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dsu"],
    statement:
      "grid uses 1 for land and 0 for water. You may change at most one 0 into 1. Return the size of the largest 4-connected island you can form. A grid that is already all land does not need a change.",
    constraints: ["1 <= rows, columns <= 100", "Each cell is 0 or 1."],
    examples: [
      { input: "grid = [[1, 0], [0, 1]]", output: "3" },
      { input: "grid = [[1, 1], [1, 1]]", output: "4" },
    ],
    signature: "int largestIsland(vector<vector<int>>& grid)",
    functionName: "largestIsland",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.largestIsland(grid)));`,
    method: `int largestIsland(vector<vector<int>>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size(), tag = 1, best = 0;
        vector<vector<int>> id(rows, vector<int>(cols));
        unordered_map<int, int> size;
        int dir[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        function<int(int, int, int)> paint = [&](int r, int c, int mark) -> int {
            if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != 1 || id[r][c]) return 0;
            id[r][c] = mark;
            return 1 + paint(r + 1, c, mark) + paint(r - 1, c, mark) + paint(r, c + 1, mark) + paint(r, c - 1, mark);
        };
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) if (grid[r][c] == 1 && !id[r][c]) {
            size[tag] = paint(r, c, tag); best = max(best, size[tag]); tag++;
        }
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) if (grid[r][c] == 0) {
            unordered_set<int> seen; int total = 1;
            for (auto& step : dir) {
                int nr = r + step[0], nc = c + step[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || !id[nr][nc] || seen.count(id[nr][nc])) continue;
                seen.insert(id[nr][nc]); total += size[id[nr][nc]];
            }
            best = max(best, total);
        }
        return best;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(rows * cols)",
    hints: [
      "Label each existing island and remember its size.",
      "Changing a water cell joins the distinct islands that touch it, plus the new cell.",
      "The same island can touch the water cell on more than one side, so count each island once.",
      "If there is no water, the answer is the whole grid. If there is no land, changing one cell makes an island of size 1.",
    ],
    tests: [
      { input: { grid: [[1, 0], [0, 1]] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { grid: [[1, 1], [1, 1]] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { grid: [[1, 1], [1, 0]] }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { grid: [[0]] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "swim-rising",
    title: "Swim in Rising Water",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["shortest-path"],
    statement:
      "grid[r][c] is the water level at which that cell becomes swimmable. At time t you may swim through any cell whose value is at most t, moving in the four directions. You start at the top-left cell. Return the earliest time at which you can reach the bottom-right cell.",
    constraints: ["1 <= rows, columns <= 50", "0 <= grid[r][c] <= 2500", "The values in the grid are distinct."],
    examples: [
      { input: "grid = [[0, 2], [1, 3]]", output: "3" },
      { input: "grid = [[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]", output: "16" },
    ],
    signature: "int swimRising(vector<vector<int>>& grid)",
    functionName: "swimRising",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.swimRising(grid)));`,
    method: `int swimRising(vector<vector<int>>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size();
        const int INF = 1000000000;
        vector<vector<int>> best(rows, vector<int>(cols, INF));
        priority_queue<array<int, 3>, vector<array<int, 3>>, greater<array<int, 3>>> pending;
        best[0][0] = grid[0][0]; pending.push({grid[0][0], 0, 0});
        int dir[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pending.empty()) {
            auto [time, r, c] = pending.top(); pending.pop();
            if (time != best[r][c]) continue;
            if (r == rows - 1 && c == cols - 1) return time;
            for (auto& step : dir) {
                int nr = r + step[0], nc = c + step[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
                int next = max(time, grid[nr][nc]);
                if (next < best[nr][nc]) { best[nr][nc] = next; pending.push({next, nr, nc}); }
            }
        }
        return best[rows - 1][cols - 1];
    }`,
    expectedTime: "O(rows * cols * log(rows * cols))",
    expectedSpace: "O(rows * cols)",
    hints: [
      "The time required for a path is the highest cell on that path, including the start.",
      "You want the path whose highest cell is as low as possible.",
      "Dijkstra with the running maximum as the priority finds that path.",
      "The first time you pop the bottom-right cell, its time is the answer. A one-cell grid answers with that cell's value.",
    ],
    tests: [
      { input: { grid: [[0, 2], [1, 3]] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { grid: [[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]] }, expectedOutput: 16, visibility: "SAMPLE" },
      { input: { grid: [[7]] }, expectedOutput: 7, visibility: "HIDDEN" },
      { input: { grid: [[0, 3], [2, 1]] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "graph-bridges",
    title: "Bridges in Graph",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["graph"],
    statement:
      "An undirected graph has n nodes numbered from 0. A bridge is an edge whose removal increases the number of connected components. Return every bridge as [u, v] with u < v, sorted by u and then by v.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated undirected edges."],
    examples: [
      { input: "n = 5, edges = [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]]", output: "[[1, 3], [3, 4]]" },
      { input: "n = 4, edges = [[0, 1], [1, 2], [2, 3]]", output: "[[0, 1], [1, 2], [2, 3]]" },
    ],
    signature: "vector<vector<int>> graphBridges(int n, vector<vector<int>>& edges)",
    functionName: "graphBridges",
    driver: `auto edges = in["edges"].asIntMatrix();\n    ${rowsOut('sol.graphBridges((int)in["n"].asInt(), edges)')}`,
    method: `vector<vector<int>> graphBridges(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
        vector<int> tin(n, -1), low(n);
        vector<vector<int>> out;
        int timer = 0;
        function<void(int, int)> walk = [&](int node, int parent) {
            tin[node] = low[node] = timer++;
            for (int next : graph[node]) {
                if (next == parent) continue;
                if (tin[next] == -1) {
                    walk(next, node);
                    low[node] = min(low[node], low[next]);
                    if (low[next] > tin[node]) out.push_back({min(node, next), max(node, next)});
                } else low[node] = min(low[node], tin[next]);
            }
        };
        for (int node = 0; node < n; node++) if (tin[node] == -1) walk(node, -1);
        sort(out.begin(), out.end());
        return out;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "A bridge is a tree edge in the depth-first search forest that no back edge jumps over.",
      "Record the entry time of each node and the smallest entry time reachable from its subtree.",
      "The edge to a child is a bridge when that child's low value is strictly greater than the parent's entry time.",
      "Ignore the parent edge. Write each bridge with the smaller endpoint first and sort the list.",
    ],
    tests: [
      { input: { n: 5, edges: [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]] }, expectedOutput: [[1, 3], [3, 4]], visibility: "SAMPLE" },
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]] }, expectedOutput: [[0, 1], [1, 2], [2, 3]], visibility: "SAMPLE" },
      { input: { n: 2, edges: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "articulation-points",
    title: "Articulation Points",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["graph"],
    statement:
      "An undirected graph has n nodes numbered from 0. An articulation point is a node whose removal increases the number of connected components. Return those nodes in increasing order.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated undirected edges."],
    examples: [
      { input: "n = 5, edges = [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]]", output: "[1, 3]" },
      { input: "n = 3, edges = [[0, 1], [1, 2], [2, 0]]", output: "[]" },
    ],
    signature: "vector<int> articulationPoints(int n, vector<vector<int>>& edges)",
    functionName: "articulationPoints",
    driver: `auto edges = in["edges"].asIntMatrix();\n    ${numbersOut('sol.articulationPoints((int)in["n"].asInt(), edges)')}`,
    method: `vector<int> articulationPoints(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
        vector<int> tin(n, -1), low(n);
        set<int> points;
        int timer = 0;
        function<void(int, int)> walk = [&](int node, int parent) {
            tin[node] = low[node] = timer++;
            int children = 0;
            for (int next : graph[node]) {
                if (next == parent) continue;
                if (tin[next] == -1) {
                    walk(next, node); children++;
                    low[node] = min(low[node], low[next]);
                    if (parent != -1 && low[next] >= tin[node]) points.insert(node);
                } else low[node] = min(low[node], tin[next]);
            }
            if (parent == -1 && children > 1) points.insert(node);
        };
        for (int node = 0; node < n; node++) if (tin[node] == -1) walk(node, -1);
        return vector<int>(points.begin(), points.end());
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "The discovery times and low values used for bridges also find cut vertices.",
      "A non-root node is a cut vertex when some child cannot reach anything above that node.",
      "That test is low[child] greater than or equal to the node's entry time.",
      "The root is a cut vertex only when the search branches into two or more children. Return the nodes in sorted order.",
    ],
    tests: [
      { input: { n: 5, edges: [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]] }, expectedOutput: [1, 3], visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]] }, expectedOutput: [1, 2], visibility: "HIDDEN" },
      { input: { n: 1, edges: [] }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "kosaraju-scc",
    title: "Kosaraju's Algorithm",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["graph"],
    statement:
      "A directed graph has n nodes numbered from 0. An edge [u, v] runs from u to v. Return how many strongly connected components the graph has. Two nodes are in the same component when each can reach the other.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated directed edges."],
    examples: [
      { input: "n = 5, edges = [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]]", output: "3" },
      { input: "n = 2, edges = [[0, 1], [1, 0]]", output: "1" },
    ],
    signature: "int kosarajuScc(int n, vector<vector<int>>& edges)",
    functionName: "kosarajuScc",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::number(sol.kosarajuScc((int)in["n"].asInt(), edges)));`,
    method: `int kosarajuScc(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n), reverse(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); reverse[edge[1]].push_back(edge[0]); }
        vector<int> order, seen(n);
        function<void(int)> stamp = [&](int node) {
            seen[node] = 1;
            for (int next : graph[node]) if (!seen[next]) stamp(next);
            order.push_back(node);
        };
        for (int node = 0; node < n; node++) if (!seen[node]) stamp(node);
        fill(seen.begin(), seen.end(), 0);
        function<void(int)> collect = [&](int node) {
            seen[node] = 1;
            for (int next : reverse[node]) if (!seen[next]) collect(next);
        };
        int count = 0;
        for (int i = n - 1; i >= 0; i--) if (!seen[order[i]]) { count++; collect(order[i]); }
        return count;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "Kosaraju's algorithm uses the finishing order of a search, then searches the reversed edges.",
      "Record nodes as their first search finishes.",
      "Process that list from the end. Each new search on the reversed graph is one component.",
      "A single node is one component. Two nodes with edges both ways are one component.",
    ],
    tests: [
      { input: { n: 5, edges: [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4]] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { n: 2, edges: [[0, 1], [1, 0]] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]] }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { n: 1, edges: [] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
];
