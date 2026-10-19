import { problem } from "./helpers.js";

const rowsOut = (call: string) =>
  `auto rows = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::text(row));\n    printJson(out);`;

export const patternProblems = [
  problem({
    slug: "pattern-1",
    title: "Pattern 1",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Row i has i stars separated by single spaces.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["*", "* *"] },
      { input: "n = 3", output: ["*", "* *", "* * *"] },
    ],
    signature: "vector<string> buildPattern1(int n)",
    functionName: "buildPattern1",
    driver: `${rowsOut("sol.buildPattern1((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern1(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "left_stars";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["*", "* *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["*", "* *", "* * *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-2",
    title: "Pattern 2",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Row i has i consecutive stars with no spaces.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["*", "**"] },
      { input: "n = 3", output: ["*", "**", "***"] },
    ],
    signature: "vector<string> buildPattern2(int n)",
    functionName: "buildPattern2",
    driver: `${rowsOut("sol.buildPattern2((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern2(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "left_stars_tight";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["*", "**"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["*", "**", "***"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-3",
    title: "Pattern 3",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Row i is right-aligned with i spaced stars.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["*", " * *"] },
      { input: "n = 3", output: ["*", " * *", "  * * *"] },
    ],
    signature: "vector<string> buildPattern3(int n)",
    functionName: "buildPattern3",
    driver: `${rowsOut("sol.buildPattern3((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern3(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "right_stars";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["*", " * *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["*", " * *", "  * * *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-4",
    title: "Pattern 4",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Inverted spaced-star triangle with n rows.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["* *", "*"] },
      { input: "n = 3", output: ["* * *", "* *", "*"] },
    ],
    signature: "vector<string> buildPattern4(int n)",
    functionName: "buildPattern4",
    driver: `${rowsOut("sol.buildPattern4((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern4(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "inverted_stars";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["* *", "*"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["* * *", "* *", "*"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-5",
    title: "Pattern 5",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "An n by n grid of spaced stars.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["* *", "* *"] },
      { input: "n = 3", output: ["* * *", "* * *", "* * *"] },
    ],
    signature: "vector<string> buildPattern5(int n)",
    functionName: "buildPattern5",
    driver: `${rowsOut("sol.buildPattern5((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern5(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "square_stars";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["* *", "* *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["* * *", "* * *", "* * *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-6",
    title: "Pattern 6",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Row i lists numbers 1 through i separated by spaces.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["1", "1 2"] },
      { input: "n = 3", output: ["1", "1 2", "1 2 3"] },
    ],
    signature: "vector<string> buildPattern6(int n)",
    functionName: "buildPattern6",
    driver: `${rowsOut("sol.buildPattern6((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern6(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "numbers";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["1", "1 2"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["1", "1 2", "1 2 3"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["1"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-7",
    title: "Pattern 7",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Inverted number triangle.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["1 2", "1"] },
      { input: "n = 3", output: ["1 2 3", "1 2", "1"] },
    ],
    signature: "vector<string> buildPattern7(int n)",
    functionName: "buildPattern7",
    driver: `${rowsOut("sol.buildPattern7((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern7(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "inverted_numbers";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["1 2", "1"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["1 2 3", "1 2", "1"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["1"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-8",
    title: "Pattern 8",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Floyd triangle starting at 1.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["1", "2 3"] },
      { input: "n = 3", output: ["1", "2 3", "4 5 6"] },
    ],
    signature: "vector<string> buildPattern8(int n)",
    functionName: "buildPattern8",
    driver: `${rowsOut("sol.buildPattern8((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern8(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "floyd";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["1", "2 3"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["1", "2 3", "4 5 6"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["1"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-9",
    title: "Pattern 9",
    difficulty: "EASY",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Each row alternates bits in a simple pattern.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["1", "0 1"] },
      { input: "n = 3", output: ["1", "0 1", "1 0 1"] },
    ],
    signature: "vector<string> buildPattern9(int n)",
    functionName: "buildPattern9",
    driver: `${rowsOut("sol.buildPattern9((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern9(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "binary_row";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["1", "0 1"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["1", "0 1", "1 0 1"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["1"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-10",
    title: "Pattern 10",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Row i repeats digit i with spaces.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["1", "2 2"] },
      { input: "n = 3", output: ["1", "2 2", "3 3 3"] },
    ],
    signature: "vector<string> buildPattern10(int n)",
    functionName: "buildPattern10",
    driver: `${rowsOut("sol.buildPattern10((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern10(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "digit_row";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["1", "2 2"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["1", "2 2", "3 3 3"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["1"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-11",
    title: "Pattern 11",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Each row starts with its row index then spaced stars.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["1 *", "2 * *"] },
      { input: "n = 3", output: ["1 *", "2 * *", "3 * * *"] },
    ],
    signature: "vector<string> buildPattern11(int n)",
    functionName: "buildPattern11",
    driver: `${rowsOut("sol.buildPattern11((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern11(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "numbered_stars";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["1 *", "2 * *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["1 *", "2 * *", "3 * * *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["1 *"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-12",
    title: "Pattern 12",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Symmetric star rows widening to 2i-1 stars.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["*", "* * *"] },
      { input: "n = 3", output: ["*", "* * *", "* * * * *"] },
    ],
    signature: "vector<string> buildPattern12(int n)",
    functionName: "buildPattern12",
    driver: `${rowsOut("sol.buildPattern12((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern12(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "palindrome_stars";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["*", "* * *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["*", "* * *", "* * * * *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-13",
    title: "Pattern 13",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Decreasing spaced-star triangle from n to 1.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["* *", "*"] },
      { input: "n = 3", output: ["* * *", "* *", "*"] },
    ],
    signature: "vector<string> buildPattern13(int n)",
    functionName: "buildPattern13",
    driver: `${rowsOut("sol.buildPattern13((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern13(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "hourglass_top";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["* *", "*"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["* * *", "* *", "*"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-14",
    title: "Pattern 14",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Increasing spaced-star triangle from 1 to n.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["*", "* *"] },
      { input: "n = 3", output: ["*", "* *", "* * *"] },
    ],
    signature: "vector<string> buildPattern14(int n)",
    functionName: "buildPattern14",
    driver: `${rowsOut("sol.buildPattern14((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern14(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "hourglass_bottom";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["*", "* *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["*", "* *", "* * *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-15",
    title: "Pattern 15",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Upper diamond of centered spaced stars.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: [" *", "* * *"] },
      { input: "n = 3", output: ["  *", " * * *", "* * * * *"] },
    ],
    signature: "vector<string> buildPattern15(int n)",
    functionName: "buildPattern15",
    driver: `${rowsOut("sol.buildPattern15((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern15(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "diamond_top";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: [" *", "* * *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["  *", " * * *", "* * * * *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-16",
    title: "Pattern 16",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Full diamond with n upper and n-1 lower rows.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: [" *", "* * *", " *"] },
      { input: "n = 3", output: ["  *", " * * *", "* * * * *", " * * *", "  *"] },
    ],
    signature: "vector<string> buildPattern16(int n)",
    functionName: "buildPattern16",
    driver: `${rowsOut("sol.buildPattern16((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern16(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "diamond_full";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: [" *", "* * *", " *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["  *", " * * *", "* * * * *", " * * *", "  *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-17",
    title: "Pattern 17",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Centered number pyramid.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: [" 1", "1 2"] },
      { input: "n = 3", output: ["  1", " 1 2", "1 2 3"] },
    ],
    signature: "vector<string> buildPattern17(int n)",
    functionName: "buildPattern17",
    driver: `${rowsOut("sol.buildPattern17((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern17(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "number_pyramid";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: [" 1", "1 2"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["  1", " 1 2", "1 2 3"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["1"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-18",
    title: "Pattern 18",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Row i shows the first i uppercase letters.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["A", "A B"] },
      { input: "n = 3", output: ["A", "A B", "A B C"] },
    ],
    signature: "vector<string> buildPattern18(int n)",
    functionName: "buildPattern18",
    driver: `${rowsOut("sol.buildPattern18((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern18(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "alpha_row";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["A", "A B"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["A", "A B", "A B C"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["A"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-19",
    title: "Pattern 19",
    difficulty: "MEDIUM",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Row i shows i letters counting down from the ith letter.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["A", "B A"] },
      { input: "n = 3", output: ["A", "B A", "C B A"] },
    ],
    signature: "vector<string> buildPattern19(int n)",
    functionName: "buildPattern19",
    driver: `${rowsOut("sol.buildPattern19((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern19(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "alpha_row_rev";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["A", "B A"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["A", "B A", "C B A"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["A"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-20",
    title: "Pattern 20",
    difficulty: "HARD",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Hollow square border of stars.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["* *", "* *"] },
      { input: "n = 3", output: ["* * *", "*   *", "* * *"] },
    ],
    signature: "vector<string> buildPattern20(int n)",
    functionName: "buildPattern20",
    driver: `${rowsOut("sol.buildPattern20((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern20(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "hollow_square";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["* *", "* *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["* * *", "*   *", "* * *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-21",
    title: "Pattern 21",
    difficulty: "HARD",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Hollow rectangle border with height n and width 2n-1.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["* * *", "* * *"] },
      { input: "n = 3", output: ["* * * * *", "*       *", "* * * * *"] },
    ],
    signature: "vector<string> buildPattern21(int n)",
    functionName: "buildPattern21",
    driver: `${rowsOut("sol.buildPattern21((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern21(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "hollow_rect";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["* * *", "* * *"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["* * * * *", "*       *", "* * * * *"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["*"], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "pattern-22",
    title: "Pattern 22",
    difficulty: "HARD",
    topics: ["basics"],
    tags: ["patterns"],
    statement: "Zig-zag numbering in an n by n grid, row strings.",
    constraints: ["1 <= n <= 20"],
    examples: [
      { input: "n = 2", output: ["1 2", "4 3"] },
      { input: "n = 3", output: ["1 2 3", "6 5 4", "7 8 9"] },
    ],
    signature: "vector<string> buildPattern22(int n)",
    functionName: "buildPattern22",
    driver: `${rowsOut("sol.buildPattern22((int)in[\"n\"].asInt())")}`,
    method: `vector<string> buildPattern22(int n) {
    vector<string> rows;
    if (n <= 0) return rows;
    auto starRow = [&](int count, bool spaced) {
        string row;
        for (int i = 0; i < count; i++) {
            if (spaced && i) row += ' ';
            row += '*';
        }
        return row;
    };
    const string kind = "zigzag_numbers";
    if (kind == "left_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "left_stars_tight") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, false));
    } else if (kind == "right_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(string(i - 1, ' ') + starRow(i, true));
    } else if (kind == "inverted_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(n - i + 1, true));
    } else if (kind == "square_stars") {
        for (int i = 0; i < n; i++) rows.push_back(starRow(n, true));
    } else if (kind == "numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "inverted_numbers") {
        for (int i = 1; i <= n; i++) {
            string row;
            int limit = n - i + 1;
            for (int j = 1; j <= limit; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "floyd") {
        int cur = 1;
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += to_string(cur++); }
            rows.push_back(row);
        }
    } else if (kind == "binary_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + ((j % 2) ^ (i % 2))); }
            rows.push_back(row);
        }
    } else if (kind == "digit_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('0' + (i % 10)); }
            rows.push_back(row);
        }
    } else if (kind == "numbered_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(to_string(i) + " " + starRow(i, true));
    } else if (kind == "palindrome_stars") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(2 * i - 1, true));
    } else if (kind == "hourglass_top") {
        for (int i = n; i >= 1; i--) rows.push_back(starRow(i, true));
    } else if (kind == "hourglass_bottom") {
        for (int i = 1; i <= n; i++) rows.push_back(starRow(i, true));
    } else if (kind == "diamond_top") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "diamond_full") {
        for (int i = 1; i <= n; i++) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
        for (int i = n - 1; i >= 1; i--) rows.push_back(string(n - i, ' ') + starRow(2 * i - 1, true));
    } else if (kind == "number_pyramid") {
        for (int i = 1; i <= n; i++) {
            string row = string(n - i, ' ');
            for (int j = 1; j <= i; j++) { if (j > 1) row += ' '; row += to_string(j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + j); }
            rows.push_back(row);
        }
    } else if (kind == "alpha_row_rev") {
        for (int i = 1; i <= n; i++) {
            string row;
            for (int j = 0; j < i; j++) { if (j) row += ' '; row += (char)('A' + (i - 1 - j)); }
            rows.push_back(row);
        }
    } else if (kind == "hollow_square") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == n - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "hollow_rect") {
        int w = max(1, 2 * n - 1);
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < w; c++) {
                if (c) row += ' ';
                row += (r == 0 || r == n - 1 || c == 0 || c == w - 1) ? '*' : ' ';
            }
            rows.push_back(row);
        }
    } else if (kind == "zigzag_numbers") {
        for (int r = 0; r < n; r++) {
            string row;
            for (int c = 0; c < n; c++) {
                if (c) row += ' ';
                int val = (r % 2 == 0) ? (r * n + c + 1) : (r * n + (n - c));
                row += to_string(val);
            }
            rows.push_back(row);
        }
    }
    return rows;
}`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n^2)",
    hints: [
      "Build each row as a string with exact spacing.",
      "Return rows from top to bottom.",
      "Use the sample outputs as the formatting contract.",
    ],
    tests: [
      { input: { n: 2 }, expectedOutput: ["1 2", "4 3"], visibility: "SAMPLE" },
      { input: { n: 3 }, expectedOutput: ["1 2 3", "6 5 4", "7 8 9"], visibility: "SAMPLE" },
      { input: { n: 1 }, expectedOutput: ["1"], visibility: "HIDDEN" },
    ],
  })
];