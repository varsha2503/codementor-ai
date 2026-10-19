import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const rowsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;

const stringsOut = (call: string) => `{
    auto rows = ${call};
    Json out; out.type = Json::ARR;
    for (const auto& row : rows) out.a.push_back(Json::text(row));
    printJson(out);
}`;

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

export const graphCoreProblems = [
  problem({
    slug: "component-count",
    title: "Connected Components",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["graph"],
    statement:
      "An undirected graph has n nodes numbered from 0. edges lists the links, and there are no self-loops or repeated links. Return how many connected components the graph has, counting isolated nodes.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "Each edge joins two different nodes."],
    examples: [
      { input: "n = 5, edges = [[0, 1], [1, 2], [3, 4]]", output: "2" },
      { input: "n = 5, edges = [[0, 1]]", output: "4" },
    ],
    signature: "int componentCount(int n, vector<vector<int>>& edges)",
    functionName: "componentCount",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::number(sol.componentCount((int)in["n"].asInt(), edges)));`,
    method: `int componentCount(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
        vector<int> seen(n);
        int count = 0;
        function<void(int)> walk = [&](int node) {
            seen[node] = 1;
            for (int next : graph[node]) if (!seen[next]) walk(next);
        };
        for (int node = 0; node < n; node++) if (!seen[node]) { count++; walk(node); }
        return count;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "A component is everything you can reach from one unvisited node.",
      "Scan nodes from 0 upward. Each time you find an unvisited node, start a new component.",
      "A depth-first or breadth-first walk marks the whole component before the scan continues.",
      "Isolated nodes are components of size one. A single node with no edges has one component.",
    ],
    tests: [
      { input: { n: 5, edges: [[0, 1], [1, 2], [3, 4]] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { n: 5, edges: [[0, 1]] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { n: 3, edges: [[0, 1], [1, 2]] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { n: 4, edges: [] }, expectedOutput: 4, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "graph-dfs",
    title: "DFS Traversal",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "An undirected graph has n nodes numbered from 0. Walk it with depth-first search. Visit neighbors from the smallest index to the largest. When a component ends, start the next walk at the smallest unvisited node. Return the order of first visits.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000"],
    examples: [
      { input: "n = 5, edges = [[0, 1], [0, 2], [1, 3], [2, 4]]", output: "[0, 1, 3, 2, 4]" },
      { input: "n = 4, edges = [[0, 1], [2, 3]]", output: "[0, 1, 2, 3]" },
    ],
    signature: "vector<int> graphDfs(int n, vector<vector<int>>& edges)",
    functionName: "graphDfs",
    driver: `auto edges = in["edges"].asIntMatrix();\n    ${numbersOut("sol.graphDfs((int)in[\"n\"].asInt(), edges)")}`,
    method: `vector<int> graphDfs(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
        for (auto& next : graph) sort(next.begin(), next.end());
        vector<int> seen(n), order;
        function<void(int)> walk = [&](int node) {
            seen[node] = 1;
            order.push_back(node);
            for (int next : graph[node]) if (!seen[next]) walk(next);
        };
        for (int node = 0; node < n; node++) if (!seen[node]) walk(node);
        return order;
    }`,
    expectedTime: "O(n + edges log edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "Depth-first search finishes a branch before it tries the next neighbor.",
      "Sort each adjacency list so the smaller neighbor is always tried first.",
      "Record a node when you first enter it, not when you leave it.",
      "After one component is exhausted, the outer scan starts at the next unused node. A lone node appears by itself.",
    ],
    tests: [
      { input: { n: 5, edges: [[0, 1], [0, 2], [1, 3], [2, 4]] }, expectedOutput: [0, 1, 3, 2, 4], visibility: "SAMPLE" },
      { input: { n: 4, edges: [[0, 1], [2, 3]] }, expectedOutput: [0, 1, 2, 3], visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { n: 3, edges: [[2, 1]] }, expectedOutput: [0, 1, 2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "province-count",
    title: "Number of Provinces",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["graph"],
    statement:
      "isConnected is an n by n matrix. isConnected[a][b] is 1 when city a is directly connected to city b, including a city with itself. Connections run both ways. A province is a maximal set of cities joined by those links. Return how many provinces there are.",
    constraints: ["1 <= n <= 300", "The matrix is symmetric.", "isConnected[i][i] is 1."],
    examples: [
      { input: "isConnected = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]", output: "2" },
      { input: "isConnected = [[1, 0], [0, 1]]", output: "2" },
    ],
    signature: "int provinceCount(vector<vector<int>>& isConnected)",
    functionName: "provinceCount",
    driver: `auto isConnected = in["isConnected"].asIntMatrix();\n    printJson(Json::number(sol.provinceCount(isConnected)));`,
    method: `int provinceCount(vector<vector<int>>& isConnected) {
        int n = (int)isConnected.size();
        vector<int> seen(n);
        function<void(int)> walk = [&](int city) {
            seen[city] = 1;
            for (int other = 0; other < n; other++) if (isConnected[city][other] && !seen[other]) walk(other);
        };
        int count = 0;
        for (int city = 0; city < n; city++) if (!seen[city]) { count++; walk(city); }
        return count;
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "The matrix is already the adjacency list, written as a square of flags.",
      "Each unvisited city starts a province.",
      "From a city, walk to every other city whose flag is 1, and mark them visited.",
      "The diagonal does not create an extra province. Two cities with no path between them are separate provinces.",
    ],
    tests: [
      { input: { isConnected: [[1, 1, 0], [1, 1, 0], [0, 0, 1]] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { isConnected: [[1, 0], [0, 1]] }, expectedOutput: 2, visibility: "SAMPLE" },
      { input: { isConnected: [[1]] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { isConnected: [[1, 1], [1, 1]] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "rotten-oranges",
    title: "Rotten Oranges",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "grid uses 0 for an empty cell, 1 for a fresh orange, and 2 for a rotten orange. Every minute, a rotten orange rots its fresh four-direction neighbors. Return how many minutes pass until no fresh orange remains. Return -1 when some fresh orange can never rot. Return 0 when there is no fresh orange.",
    constraints: ["1 <= rows, columns <= 100", "Each cell is 0, 1, or 2."],
    examples: [
      { input: "grid = [[2, 1, 1], [1, 1, 0], [0, 1, 1]]", output: "4" },
      { input: "grid = [[2, 1, 1], [0, 1, 1], [1, 0, 1]]", output: "-1" },
    ],
    signature: "int rottenOranges(vector<vector<int>>& grid)",
    functionName: "rottenOranges",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.rottenOranges(grid)));`,
    method: `int rottenOranges(vector<vector<int>>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size(), fresh = 0;
        queue<array<int, 3>> pending;
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) pending.push({r, c, 0});
            else if (grid[r][c] == 1) fresh++;
        }
        int minutes = 0;
        int dir[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pending.empty()) {
            auto [r, c, time] = pending.front(); pending.pop();
            minutes = max(minutes, time);
            for (auto& step : dir) {
                int nr = r + step[0], nc = c + step[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2; fresh--; pending.push({nr, nc, time + 1});
            }
        }
        return fresh ? -1 : minutes;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(rows * cols)",
    hints: [
      "Every rotten orange starts spreading at minute 0. Fresh oranges that touch one of them rot together.",
      "A queue of positions and the minute they rotted is a multi-source breadth-first search.",
      "Count the fresh oranges first. Each time one rots, decrease that count.",
      "If the queue ends while fresh oranges remain, they were sealed off by empty cells. No fresh orange means the answer is 0.",
    ],
    tests: [
      { input: { grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { grid: [[0, 2]] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { grid: [[1, 2]] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "flood-fill",
    title: "Flood Fill",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "image is a grid of colors. Starting at row sr and column sc, recolor the connected region of the starting color with color. Cells connect by edges, not diagonals. Return the recolored image. If the starting color already equals color, the image stays as it is.",
    constraints: ["1 <= rows, columns <= 50", "0 <= image[r][c], color <= 9", "sr and sc are inside the image."],
    examples: [
      { input: "image = [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr = 1, sc = 1, color = 2", output: "[[2, 2, 2], [2, 2, 0], [2, 0, 1]]" },
      { input: "image = [[1]], sr = 0, sc = 0, color = 1", output: "[[1]]" },
    ],
    signature: "vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color)",
    functionName: "floodFill",
    driver: `auto image = in["image"].asIntMatrix();\n    ${rowsOut('sol.floodFill(image, (int)in["sr"].asInt(), (int)in["sc"].asInt(), (int)in["color"].asInt())')}`,
    method: `vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        int rows = (int)image.size(), cols = (int)image[0].size(), start = image[sr][sc];
        if (start == color) return image;
        queue<pair<int, int>> pending;
        pending.push({sr, sc});
        image[sr][sc] = color;
        int dir[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pending.empty()) {
            auto [r, c] = pending.front(); pending.pop();
            for (auto& step : dir) {
                int nr = r + step[0], nc = c + step[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || image[nr][nc] != start) continue;
                image[nr][nc] = color;
                pending.push({nr, nc});
            }
        }
        return image;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(rows * cols)",
    hints: [
      "Only cells that share the original color, and touch the start through that color, should change.",
      "Remember the starting color before you paint, or you will not know where the region ends.",
      "A search that paints as it goes will not revisit a cell.",
      "If the new color equals the old color, painting would loop unless you return immediately.",
    ],
    tests: [
      { input: { image: [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr: 1, sc: 1, color: 2 }, expectedOutput: [[2, 2, 2], [2, 2, 0], [2, 0, 1]], visibility: "SAMPLE" },
      { input: { image: [[1]], sr: 0, sc: 0, color: 1 }, expectedOutput: [[1]], visibility: "SAMPLE" },
      { input: { image: [[0, 0], [0, 0]], sr: 0, sc: 1, color: 1 }, expectedOutput: [[1, 1], [1, 1]], visibility: "HIDDEN" },
      { input: { image: [[1, 2], [2, 1]], sr: 0, sc: 0, color: 9 }, expectedOutput: [[9, 2], [2, 1]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "cycle-bfs",
    title: "Detect Cycle in an Undirected Graph using BFS",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "An undirected graph has n nodes numbered from 0. Return whether it contains a cycle. A later visit to a node is a cycle only when that node is not the parent that just led you there.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated undirected edges."],
    examples: [
      { input: "n = 4, edges = [[0, 1], [1, 2], [2, 3]]", output: "false" },
      { input: "n = 3, edges = [[0, 1], [1, 2], [2, 0]]", output: "true" },
    ],
    signature: "bool cycleBfs(int n, vector<vector<int>>& edges)",
    functionName: "cycleBfs",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::boolean(sol.cycleBfs((int)in["n"].asInt(), edges)));`,
    method: `bool cycleBfs(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
        vector<int> seen(n);
        for (int start = 0; start < n; start++) {
            if (seen[start]) continue;
            queue<pair<int, int>> pending;
            pending.push({start, -1});
            seen[start] = 1;
            while (!pending.empty()) {
                auto [node, parent] = pending.front(); pending.pop();
                for (int next : graph[node]) {
                    if (!seen[next]) { seen[next] = 1; pending.push({next, node}); }
                    else if (next != parent) return true;
                }
            }
        }
        return false;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "In an undirected graph the edge you just walked is not a cycle. The node you came from must be ignored.",
      "Breadth-first search can carry the parent beside the node.",
      "Seeing a visited neighbor that is not the parent closes a cycle.",
      "A forest has several components, so repeat the search from every unvisited node. A single node has no cycle.",
    ],
    tests: [
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { n: 4, edges: [[0, 1], [2, 3], [3, 0], [0, 2]] }, expectedOutput: true, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "cycle-undirected",
    title: "Detect Cycle in an Undirected Graph",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "An undirected graph has n nodes numbered from 0. Return whether any component contains a cycle. The neighbor that the search just came from is not a back edge.",
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 4000", "There are no self-loops or repeated undirected edges."],
    examples: [
      { input: "n = 4, edges = [[0, 1], [1, 2], [2, 3]]", output: "false" },
      { input: "n = 3, edges = [[0, 1], [1, 2], [2, 0]]", output: "true" },
    ],
    signature: "bool cycleUndirected(int n, vector<vector<int>>& edges)",
    functionName: "cycleUndirected",
    driver: `auto edges = in["edges"].asIntMatrix();\n    printJson(Json::boolean(sol.cycleUndirected((int)in["n"].asInt(), edges)));`,
    method: `bool cycleUndirected(int n, vector<vector<int>>& edges) {
        vector<vector<int>> graph(n);
        for (auto& edge : edges) { graph[edge[0]].push_back(edge[1]); graph[edge[1]].push_back(edge[0]); }
        vector<int> seen(n);
        function<bool(int, int)> walk = [&](int node, int parent) -> bool {
            seen[node] = 1;
            for (int next : graph[node]) {
                if (!seen[next]) { if (walk(next, node)) return true; }
                else if (next != parent) return true;
            }
            return false;
        };
        for (int node = 0; node < n; node++) if (!seen[node] && walk(node, -1)) return true;
        return false;
    }`,
    expectedTime: "O(n + edges)",
    expectedSpace: "O(n + edges)",
    hints: [
      "Depth-first search can detect a cycle by noticing a visited node that is not its parent.",
      "Pass the parent into the recursive call.",
      "A back edge to any other visited node means the nodes on the current path plus that edge form a cycle.",
      "Restart from every unvisited node so a cycle in a later component is not missed.",
    ],
    tests: [
      { input: { n: 4, edges: [[0, 1], [1, 2], [2, 3]] }, expectedOutput: false, visibility: "SAMPLE" },
      { input: { n: 3, edges: [[0, 1], [1, 2], [2, 0]] }, expectedOutput: true, visibility: "SAMPLE" },
      { input: { n: 1, edges: [] }, expectedOutput: false, visibility: "HIDDEN" },
      { input: { n: 5, edges: [[0, 1], [1, 2], [3, 4]] }, expectedOutput: false, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "nearest-one",
    title: "Distance of the Nearest 1",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "grid contains only 0 and 1. For every cell, return the distance to the nearest cell that holds 1. Distance is the number of four-direction steps. A cell that already holds 1 has distance 0. At least one 1 is present.",
    constraints: ["1 <= rows, columns <= 100", "Each cell is 0 or 1.", "The grid contains at least one 1."],
    examples: [
      { input: "grid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]", output: "[[2, 1, 2], [1, 0, 1], [2, 1, 2]]" },
      { input: "grid = [[1, 0], [0, 0]]", output: "[[0, 1], [1, 2]]" },
    ],
    signature: "vector<vector<int>> nearestOne(vector<vector<int>>& grid)",
    functionName: "nearestOne",
    driver: `auto grid = in["grid"].asIntMatrix();\n    ${rowsOut("sol.nearestOne(grid)")}`,
    method: `vector<vector<int>> nearestOne(vector<vector<int>>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size();
        vector<vector<int>> dist(rows, vector<int>(cols, -1));
        queue<pair<int, int>> pending;
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) if (grid[r][c] == 1) {
            dist[r][c] = 0; pending.push({r, c});
        }
        int dir[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pending.empty()) {
            auto [r, c] = pending.front(); pending.pop();
            for (auto& step : dir) {
                int nr = r + step[0], nc = c + step[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || dist[nr][nc] != -1) continue;
                dist[nr][nc] = dist[r][c] + 1;
                pending.push({nr, nc});
            }
        }
        return dist;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(rows * cols)",
    hints: [
      "Searching outward from every 0 repeats the same ground. Search outward from every 1 instead.",
      "Put all cells that hold 1 into the queue at distance 0.",
      "The first time a cell is reached, that distance is the nearest 1, because breadth-first search expands one step at a time.",
      "Do not enqueue a cell twice. Every 0 is reachable because a 1 exists somewhere on a finite grid.",
    ],
    tests: [
      { input: { grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] }, expectedOutput: [[2, 1, 2], [1, 0, 1], [2, 1, 2]], visibility: "SAMPLE" },
      { input: { grid: [[1, 0], [0, 0]] }, expectedOutput: [[0, 1], [1, 2]], visibility: "SAMPLE" },
      { input: { grid: [[1]] }, expectedOutput: [[0]], visibility: "HIDDEN" },
      { input: { grid: [[1, 1], [0, 0]] }, expectedOutput: [[0, 0], [1, 1]], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "surrounded-regions",
    title: "Surrounded Regions",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "board contains only the characters X and O. A region of O cells is surrounded when none of those cells touch the border. Replace every surrounded O with X. O cells connected to the border, by four-direction steps, stay O. Return the board.",
    constraints: ["1 <= rows, columns <= 100", "Each cell is X or O."],
    examples: [
      {
        input: 'board = ["XXXX", "XOOX", "XXOX", "XOXX"]',
        output: '["XXXX", "XXXX", "XXXX", "XOXX"]',
      },
      { input: 'board = ["O"]', output: '["O"]' },
    ],
    signature: "vector<string> surroundedRegions(vector<string>& board)",
    functionName: "surroundedRegions",
    driver: `auto board = in["board"].asStrings();\n    ${stringsOut("sol.surroundedRegions(board)")}`,
    method: `vector<string> surroundedRegions(vector<string>& board) {
        int rows = (int)board.size(), cols = (int)board[0].size();
        function<void(int, int)> mark = [&](int r, int c) {
            if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] != 'O') return;
            board[r][c] = '#';
            mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1);
        };
        for (int r = 0; r < rows; r++) { mark(r, 0); mark(r, cols - 1); }
        for (int c = 0; c < cols; c++) { mark(0, c); mark(rows - 1, c); }
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
            if (board[r][c] == 'O') board[r][c] = 'X';
            else if (board[r][c] == '#') board[r][c] = 'O';
        }
        return board;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(rows * cols)",
    hints: [
      "The O cells that survive are exactly the ones that can reach the border.",
      "Start a search from every border O and mark that whole region with a temporary character.",
      "After those regions are marked, every remaining O is surrounded and becomes X.",
      "Turn the temporary marks back into O. A board of one O touches the border, so it stays O.",
    ],
    tests: [
      { input: { board: ["XXXX", "XOOX", "XXOX", "XOXX"] }, expectedOutput: ["XXXX", "XXXX", "XXXX", "XOXX"], visibility: "SAMPLE" },
      { input: { board: ["O"] }, expectedOutput: ["O"], visibility: "SAMPLE" },
      { input: { board: ["X"] }, expectedOutput: ["X"], visibility: "HIDDEN" },
      { input: { board: ["OO", "OO"] }, expectedOutput: ["OO", "OO"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "enclave-count",
    title: "Number of Enclaves",
    difficulty: "MEDIUM",
    topics: ["graphs"],
    tags: ["dfs"],
    statement:
      "grid uses 0 for sea and 1 for land. You can walk from land to land in the four directions. Return how many land cells cannot reach the border.",
    constraints: ["1 <= rows, columns <= 100", "Each cell is 0 or 1."],
    examples: [
      { input: "grid = [[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]", output: "3" },
      { input: "grid = [[0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]]", output: "0" },
    ],
    signature: "int enclaveCount(vector<vector<int>>& grid)",
    functionName: "enclaveCount",
    driver: `auto grid = in["grid"].asIntMatrix();\n    printJson(Json::number(sol.enclaveCount(grid)));`,
    method: `int enclaveCount(vector<vector<int>>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size();
        vector<vector<int>> seen(rows, vector<int>(cols));
        function<void(int, int)> walk = [&](int r, int c) {
            if (r < 0 || c < 0 || r >= rows || c >= cols || seen[r][c] || grid[r][c] == 0) return;
            seen[r][c] = 1;
            walk(r + 1, c); walk(r - 1, c); walk(r, c + 1); walk(r, c - 1);
        };
        for (int r = 0; r < rows; r++) { walk(r, 0); walk(r, cols - 1); }
        for (int c = 0; c < cols; c++) { walk(0, c); walk(rows - 1, c); }
        int trapped = 0;
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) if (grid[r][c] == 1 && !seen[r][c]) trapped++;
        return trapped;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(rows * cols)",
    hints: [
      "A land cell is not an enclave when a walk from it can reach the border.",
      "It is easier to start at the border and mark every land cell that can escape.",
      "After that walk, count the land cells that are still unmarked.",
      "Sea cells block the walk. Land on the border itself is never an enclave.",
    ],
    tests: [
      { input: { grid: [[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]] }, expectedOutput: 3, visibility: "SAMPLE" },
      { input: { grid: [[0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { grid: [[0]] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "word-ladder",
    title: "Word Ladder",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "beginWord and endWord have the same length and use lowercase letters. wordList holds the words you may step to. One step changes exactly one character, and the result must be in wordList. Return the number of words in the shortest sequence from beginWord to endWord, counting both ends. Return 0 when no sequence exists. beginWord does not have to be in wordList, but endWord does.",
    constraints: ["1 <= wordList.length <= 500", "1 <= word length <= 10", "Words are lowercase and the same length."],
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log", "cog"]', output: "5" },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log"]', output: "0" },
    ],
    signature: "int wordLadder(string beginWord, string endWord, vector<string>& wordList)",
    functionName: "wordLadder",
    driver: `auto wordList = in["wordList"].asStrings();\n    printJson(Json::number(sol.wordLadder(in["beginWord"].asString(), in["endWord"].asString(), wordList)));`,
    method: `int wordLadder(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        if (!words.count(endWord)) return 0;
        queue<pair<string, int>> pending;
        pending.push({beginWord, 1});
        unordered_set<string> seen{beginWord};
        while (!pending.empty()) {
            auto [word, dist] = pending.front(); pending.pop();
            if (word == endWord) return dist;
            string cur = word;
            for (int i = 0; i < (int)cur.size(); i++) {
                char saved = cur[i];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    cur[i] = ch;
                    if (words.count(cur) && !seen.count(cur)) { seen.insert(cur); pending.push({cur, dist + 1}); }
                }
                cur[i] = saved;
            }
        }
        return 0;
    }`,
    expectedTime: "O(words * length * 26)",
    expectedSpace: "O(words * length)",
    hints: [
      "Each word is a node. An edge exists when two words differ by one character.",
      "The shortest sequence is a breadth-first search, and the distance counts words rather than gaps.",
      "Trying all 26 letters in each position is enough. You do not need to compare every pair of words.",
      "If endWord is missing from the list, the answer is 0. Mark words visited when you first reach them.",
    ],
    tests: [
      { input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "dog", "lot", "log", "cog"] }, expectedOutput: 5, visibility: "SAMPLE" },
      { input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "dog", "lot", "log"] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { beginWord: "a", endWord: "c", wordList: ["a", "b", "c"] }, expectedOutput: 2, visibility: "HIDDEN" },
      { input: { beginWord: "hot", endWord: "dog", wordList: ["hot", "dog"] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "word-ladder-all",
    title: "Word Ladder II",
    difficulty: "HARD",
    topics: ["graphs"],
    tags: ["bfs"],
    statement:
      "Use the same one-letter steps as a word ladder. Return every shortest sequence from beginWord to endWord. Each sequence includes both ends. Sort the sequences in lexicographical order. Return an empty list when endWord is not reachable or is absent from wordList.",
    constraints: ["1 <= wordList.length <= 30", "1 <= word length <= 5", "Words are lowercase and the same length."],
    examples: [
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log", "cog"]',
        output: '[["hit", "hot", "dot", "dog", "cog"], ["hit", "hot", "lot", "log", "cog"]]',
      },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log"]', output: "[]" },
    ],
    signature: "vector<vector<string>> wordLadderAll(string beginWord, string endWord, vector<string>& wordList)",
    functionName: "wordLadderAll",
    driver: `auto wordList = in["wordList"].asStrings();\n    ${stringRows('sol.wordLadderAll(in["beginWord"].asString(), in["endWord"].asString(), wordList)')}`,
    method: `vector<vector<string>> wordLadderAll(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        vector<vector<string>> paths;
        if (!words.count(endWord)) return paths;
        unordered_map<string, vector<string>> parents;
        unordered_map<string, int> dist;
        dist[beginWord] = 0;
        queue<string> pending;
        pending.push(beginWord);
        bool found = false;
        while (!pending.empty() && !found) {
            int size = (int)pending.size();
            unordered_set<string> layer;
            while (size--) {
                string word = pending.front(); pending.pop();
                string cur = word;
                for (int i = 0; i < (int)cur.size(); i++) {
                    char saved = cur[i];
                    for (char ch = 'a'; ch <= 'z'; ch++) {
                        cur[i] = ch;
                        if (!words.count(cur)) continue;
                        if (!dist.count(cur)) {
                            dist[cur] = dist[word] + 1;
                            parents[cur].push_back(word);
                            layer.insert(cur);
                            if (cur == endWord) found = true;
                        } else if (dist[cur] == dist[word] + 1) parents[cur].push_back(word);
                    }
                    cur[i] = saved;
                }
            }
            for (const auto& word : layer) pending.push(word);
        }
        vector<string> path;
        function<void(const string&)> build = [&](const string& word) {
            path.push_back(word);
            if (word == beginWord) paths.push_back(vector<string>(path.rbegin(), path.rend()));
            else for (const auto& parent : parents[word]) build(parent);
            path.pop_back();
        };
        if (dist.count(endWord)) build(endWord);
        sort(paths.begin(), paths.end());
        return paths;
    }`,
    expectedTime: "O(words * length * 26 + paths)",
    expectedSpace: "O(words * length)",
    hints: [
      "First find the shortest distance. Only edges that move one step closer belong in a shortest sequence.",
      "A breadth-first search can record every parent that reaches a word at the best distance.",
      "Stop expanding once the end word has been found on a layer, then walk the parent links backward.",
      "Reverse each recovered path and sort the list of paths. A missing end word returns nothing.",
    ],
    tests: [
      {
        input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "dog", "lot", "log", "cog"] },
        expectedOutput: [["hit", "hot", "dot", "dog", "cog"], ["hit", "hot", "lot", "log", "cog"]],
        visibility: "SAMPLE",
      },
      { input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "dog", "lot", "log"] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { beginWord: "a", endWord: "c", wordList: ["b", "c"] }, expectedOutput: [["a", "c"]], visibility: "HIDDEN" },
      { input: { beginWord: "red", endWord: "tax", wordList: ["ted", "tex", "red", "tax", "tad", "den", "rex", "pee"] }, expectedOutput: [["red", "rex", "tex", "tax"], ["red", "ted", "tad", "tax"], ["red", "ted", "tex", "tax"]], visibility: "HIDDEN" },
    ],
  }),
];
