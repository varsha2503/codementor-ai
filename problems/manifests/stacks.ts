import { problem } from "./helpers.js";

const numbersOut = (call: string) =>
  `auto values = ${call};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;

const commandOut = (call: string) => `auto commands = in["commands"].asStrings();\n    ${numbersOut(call)}`;

export const stackProblems = [
  problem({
    slug: "array-stack",
    title: "Implement Stack using Arrays",
    difficulty: "EASY",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "Run a stack that stores its values in a fixed array of the given capacity. It starts empty. push x adds x when there is a free slot and does nothing when the array is full. pop removes and returns the most recently pushed value. top returns that value without removing it. empty returns 1 when the stack has no values and 0 otherwise. pop and top are only requested while the stack is not empty. Return the results of pop, top, and empty in the order those commands appear.",
    constraints: ["1 <= capacity <= 1000", "0 <= commands.length <= 1000", "Pushed values are integers from -1e9 to 1e9."],
    examples: [
      { input: 'capacity = 2, commands = ["push 4", "push 9", "top", "pop", "empty"]', output: "[9, 9, 0]" },
      { input: 'capacity = 1, commands = ["push 4", "push 9", "top"]', output: "[4]", explanation: "The second push does not fit." },
    ],
    signature: "vector<long long> arrayStack(int capacity, vector<string>& commands)",
    functionName: "arrayStack",
    driver: commandOut("sol.arrayStack((int)in[\"capacity\"].asInt(), commands)"),
    method: `vector<long long> arrayStack(int capacity, vector<string>& commands) {
        vector<long long> slots(capacity);
        int size = 0;
        vector<long long> out;
        for (const string& command : commands) {
            if (command.rfind("push ", 0) == 0) {
                if (size < capacity) slots[size++] = stoll(command.substr(5));
            } else if (command == "pop") out.push_back(slots[--size]);
            else if (command == "top") out.push_back(slots[size - 1]);
            else out.push_back(size == 0 ? 1 : 0);
        }
        return out;
    }`,
    expectedTime: "O(commands)",
    expectedSpace: "O(capacity)",
    hints: [
      "A stack only needs the most recent value. An array plus an integer that tracks how many slots are occupied is enough.",
      "Keep an index just past the last occupied slot. push writes there and moves the index forward, but only while the index is below capacity.",
      "pop and top read the slot immediately before the index. pop then moves the index backward. empty is true exactly when the index is 0.",
      "A full stack ignores the extra push, so the previous top stays. Each command touches a constant amount of memory beyond the array itself.",
    ],
    tests: [
      { input: { capacity: 2, commands: ["push 4", "push 9", "top", "pop", "empty"] }, expectedOutput: [9, 9, 0], visibility: "SAMPLE" },
      { input: { capacity: 1, commands: ["push 4", "push 9", "top"] }, expectedOutput: [4], visibility: "SAMPLE" },
      { input: { capacity: 1, commands: ["empty", "push 5", "empty", "pop", "empty"] }, expectedOutput: [1, 0, 5, 1], visibility: "HIDDEN" },
      { input: { capacity: 3, commands: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { capacity: 2, commands: ["push -3", "push 0", "pop", "top"] }, expectedOutput: [0, -3], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "array-queue",
    title: "Implement Queue using Arrays",
    difficulty: "EASY",
    topics: ["stacks-queues"],
    tags: ["queue"],
    statement:
      "Run a queue stored in a fixed array of the given capacity. It starts empty. push x joins the back when a slot is free and does nothing when the array is full. pop removes and returns the value at the front. front returns that value without removing it. empty returns 1 when the queue has no values and 0 otherwise. pop and front are only requested while the queue is not empty. Reuse slots from the front so the queue can wrap around the array. Return the results of pop, front, and empty in order.",
    constraints: ["1 <= capacity <= 1000", "0 <= commands.length <= 1000", "Pushed values are integers from -1e9 to 1e9."],
    examples: [
      { input: 'capacity = 2, commands = ["push 1", "push 2", "push 3", "pop", "push 4", "front", "pop", "pop"]', output: "[1, 2, 2, 4]" },
      { input: 'capacity = 1, commands = ["empty", "push 8", "front"]', output: "[1, 8]" },
    ],
    signature: "vector<long long> arrayQueue(int capacity, vector<string>& commands)",
    functionName: "arrayQueue",
    driver: commandOut("sol.arrayQueue((int)in[\"capacity\"].asInt(), commands)"),
    method: `vector<long long> arrayQueue(int capacity, vector<string>& commands) {
        vector<long long> slots(capacity);
        int head = 0, size = 0;
        vector<long long> out;
        for (const string& command : commands) {
            if (command.rfind("push ", 0) == 0) {
                if (size < capacity) {
                    slots[(head + size) % capacity] = stoll(command.substr(5));
                    ++size;
                }
            } else if (command == "pop") {
                out.push_back(slots[head]);
                head = (head + 1) % capacity;
                --size;
            } else if (command == "front") out.push_back(slots[head]);
            else out.push_back(size == 0 ? 1 : 0);
        }
        return out;
    }`,
    expectedTime: "O(commands)",
    expectedSpace: "O(capacity)",
    hints: [
      "The oldest value is not always in slot 0 once values have been removed. Remember where the front is, and where the next free back slot is.",
      "A head index and a size describe a circular range. The back slot is (head + size) modulo capacity.",
      "push writes the back slot and increases size, unless size is already capacity. pop reads the head, then advances head by one modulo capacity.",
      "Wrapping is what lets a later push reuse a slot that pop already freed. empty is size equal to 0.",
    ],
    tests: [
      { input: { capacity: 2, commands: ["push 1", "push 2", "push 3", "pop", "push 4", "front", "pop", "pop"] }, expectedOutput: [1, 2, 2, 4], visibility: "SAMPLE" },
      { input: { capacity: 1, commands: ["empty", "push 8", "front"] }, expectedOutput: [1, 8], visibility: "SAMPLE" },
      { input: { capacity: 2, commands: ["push 4", "push 9", "front", "pop", "empty", "pop"] }, expectedOutput: [4, 4, 0, 9], visibility: "HIDDEN" },
      { input: { capacity: 1, commands: [] }, expectedOutput: [], visibility: "HIDDEN" },
      { input: { capacity: 3, commands: ["push -1", "pop", "empty"] }, expectedOutput: [-1, 1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "queue-stack",
    title: "Implement Stack using Queue",
    difficulty: "EASY",
    topics: ["stacks-queues"],
    tags: ["stack", "queue"],
    statement:
      "Run a stack whose only storage is a queue. It starts empty and has no fixed capacity. push x adds x. pop removes and returns the most recently pushed value. top returns that value without removing it. empty returns 1 when nothing is stored and 0 otherwise. pop and top are only requested while the stack is not empty. Return the results of pop, top, and empty in order.",
    constraints: ["0 <= commands.length <= 1000", "Pushed values are integers from -1e9 to 1e9."],
    examples: [
      { input: 'commands = ["push 4", "push 9", "top", "pop", "empty"]', output: "[9, 9, 0]" },
      { input: 'commands = ["empty", "push -2", "pop"]', output: "[1, -2]" },
    ],
    signature: "vector<long long> queueStack(vector<string>& commands)",
    functionName: "queueStack",
    driver: commandOut("sol.queueStack(commands)"),
    method: `vector<long long> queueStack(vector<string>& commands) {
        queue<long long> values;
        vector<long long> out;
        for (const string& command : commands) {
            if (command.rfind("push ", 0) == 0) {
                values.push(stoll(command.substr(5)));
                for (int turn = (int)values.size() - 1; turn > 0; --turn) {
                    values.push(values.front());
                    values.pop();
                }
            } else if (command == "pop") {
                out.push_back(values.front());
                values.pop();
            } else if (command == "top") out.push_back(values.front());
            else out.push_back(values.empty() ? 1 : 0);
        }
        return out;
    }`,
    expectedTime: "O(commands^2)",
    expectedSpace: "O(commands)",
    hints: [
      "A queue hands back its oldest value first. After a push, the new value has to become the one a later pop sees first.",
      "Use one queue. After pushing, rotate every older value from the front to the back. The new value is then the front.",
      "pop and top both read the front. pop also removes it. empty asks whether the queue is empty.",
      "Two queues also work: pour the old queue into the second one behind the new value, then swap their roles. Either way a push moves every stored value.",
    ],
    tests: [
      { input: { commands: ["push 4", "push 9", "top", "pop", "empty"] }, expectedOutput: [9, 9, 0], visibility: "SAMPLE" },
      { input: { commands: ["empty", "push -2", "pop"] }, expectedOutput: [1, -2], visibility: "SAMPLE" },
      { input: { commands: ["push 1", "push 2", "push 3", "pop", "top", "pop", "pop", "empty"] }, expectedOutput: [3, 2, 2, 1, 1], visibility: "HIDDEN" },
      { input: { commands: [] }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stack-queue",
    title: "Implement Queue using Stack",
    difficulty: "EASY",
    topics: ["stacks-queues"],
    tags: ["stack", "queue"],
    statement:
      "Run a queue whose only storage is a stack. It starts empty and has no fixed capacity. push x joins the back. pop removes and returns the value at the front. front returns that value without removing it. empty returns 1 when nothing is stored and 0 otherwise. pop and front are only requested while the queue is not empty. Return the results of pop, front, and empty in order.",
    constraints: ["0 <= commands.length <= 1000", "Pushed values are integers from -1e9 to 1e9."],
    examples: [
      { input: 'commands = ["push 4", "push 9", "front", "pop", "empty", "pop"]', output: "[4, 4, 0, 9]" },
      { input: 'commands = ["empty", "push 1", "pop"]', output: "[1, 1]" },
    ],
    signature: "vector<long long> stackQueue(vector<string>& commands)",
    functionName: "stackQueue",
    driver: commandOut("sol.stackQueue(commands)"),
    method: `vector<long long> stackQueue(vector<string>& commands) {
        stack<long long> incoming, outgoing;
        auto pour = [&]() {
            if (outgoing.empty()) {
                while (!incoming.empty()) {
                    outgoing.push(incoming.top());
                    incoming.pop();
                }
            }
        };
        vector<long long> out;
        for (const string& command : commands) {
            if (command.rfind("push ", 0) == 0) incoming.push(stoll(command.substr(5)));
            else if (command == "pop") {
                pour();
                out.push_back(outgoing.top());
                outgoing.pop();
            } else if (command == "front") {
                pour();
                out.push_back(outgoing.top());
            } else out.push_back(incoming.empty() && outgoing.empty() ? 1 : 0);
        }
        return out;
    }`,
    expectedTime: "O(commands)",
    expectedSpace: "O(commands)",
    hints: [
      "One stack reverses order. A queue needs the oldest value, which is the deepest value in a single stack of pushes.",
      "Keep an input stack and an output stack. push always goes to the input stack.",
      "Before pop or front, if the output stack is empty, pour the whole input stack onto it. The oldest value is then on top. Do not pour when the output stack still has values.",
      "Each value moves from input to output at most once, so the whole command list is linear. empty is true only when both stacks are empty.",
    ],
    tests: [
      { input: { commands: ["push 4", "push 9", "front", "pop", "empty", "pop"] }, expectedOutput: [4, 4, 0, 9], visibility: "SAMPLE" },
      { input: { commands: ["empty", "push 1", "pop"] }, expectedOutput: [1, 1], visibility: "SAMPLE" },
      { input: { commands: ["push 1", "pop", "push 2", "push 3", "front", "pop", "front"] }, expectedOutput: [1, 2, 2, 3], visibility: "HIDDEN" },
      { input: { commands: [] }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "list-stack",
    title: "Implement Stack using Linked List",
    difficulty: "EASY",
    topics: ["stacks-queues"],
    tags: ["stack", "linked-list"],
    statement:
      "Run a stack backed by a linked list. It starts empty and grows with each push. push x adds x at the head. pop removes and returns the head. top returns the head without removing it. empty returns 1 when the list has no nodes and 0 otherwise. pop and top are only requested while the stack is not empty. Return the results of pop, top, and empty in order.",
    constraints: ["0 <= commands.length <= 1000", "Pushed values are integers from -1e9 to 1e9."],
    examples: [
      { input: 'commands = ["push 4", "push 9", "top", "pop", "pop", "empty"]', output: "[9, 9, 4, 1]" },
      { input: 'commands = ["empty"]', output: "[1]" },
    ],
    signature: "vector<long long> listStack(vector<string>& commands)",
    functionName: "listStack",
    driver: commandOut("sol.listStack(commands)"),
    method: `vector<long long> listStack(vector<string>& commands) {
        vector<long long> values;
        vector<long long> out;
        for (const string& command : commands) {
            if (command.rfind("push ", 0) == 0) values.push_back(stoll(command.substr(5)));
            else if (command == "pop") {
                out.push_back(values.back());
                values.pop_back();
            } else if (command == "top") out.push_back(values.back());
            else out.push_back(values.empty() ? 1 : 0);
        }
        return out;
    }`,
    expectedTime: "O(commands)",
    expectedSpace: "O(commands)",
    hints: [
      "The head of a linked list is the only node you can reach in constant time. That matches the end of a stack you are allowed to touch.",
      "Each node stores a value and a pointer to the previous head. push allocates a node, points it at the old head, and makes it the new head.",
      "top reads the head value. pop keeps that value, moves the head pointer to the next node, and releases the old head. empty is a null head.",
      "There is no capacity to check. Every push succeeds, and the nodes still in the list are exactly the values that have been pushed and not popped.",
    ],
    tests: [
      { input: { commands: ["push 4", "push 9", "top", "pop", "pop", "empty"] }, expectedOutput: [9, 9, 4, 1], visibility: "SAMPLE" },
      { input: { commands: ["empty"] }, expectedOutput: [1], visibility: "SAMPLE" },
      { input: { commands: ["push -8", "push 0", "pop", "top"] }, expectedOutput: [0, -8], visibility: "HIDDEN" },
      { input: { commands: [] }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "list-queue",
    title: "Implement Queue using Linked List",
    difficulty: "EASY",
    topics: ["stacks-queues"],
    tags: ["queue", "linked-list"],
    statement:
      "Run a queue backed by a linked list. It starts empty. push x adds a node at the tail. pop removes and returns the head. front returns the head without removing it. empty returns 1 when the list has no nodes and 0 otherwise. pop and front are only requested while the queue is not empty. Return the results of pop, front, and empty in order.",
    constraints: ["0 <= commands.length <= 1000", "Pushed values are integers from -1e9 to 1e9."],
    examples: [
      { input: 'commands = ["push 4", "push 9", "front", "pop", "empty", "pop"]', output: "[4, 4, 0, 9]" },
      { input: 'commands = ["push 3", "pop", "empty"]', output: "[3, 1]" },
    ],
    signature: "vector<long long> listQueue(vector<string>& commands)",
    functionName: "listQueue",
    driver: commandOut("sol.listQueue(commands)"),
    method: `vector<long long> listQueue(vector<string>& commands) {
        deque<long long> values;
        vector<long long> out;
        for (const string& command : commands) {
            if (command.rfind("push ", 0) == 0) values.push_back(stoll(command.substr(5)));
            else if (command == "pop") {
                out.push_back(values.front());
                values.pop_front();
            } else if (command == "front") out.push_back(values.front());
            else out.push_back(values.empty() ? 1 : 0);
        }
        return out;
    }`,
    expectedTime: "O(commands)",
    expectedSpace: "O(commands)",
    hints: [
      "A queue touches both ends. If you only keep the head, every push walks the whole list.",
      "Keep a head pointer and a tail pointer. push creates a node, links the current tail to it, and moves the tail forward.",
      "front and pop read the head. After pop, if the list is empty, clear the tail too so the next push does not follow a stale pointer.",
      "The first node pushed is the first node popped. empty is a null head.",
    ],
    tests: [
      { input: { commands: ["push 4", "push 9", "front", "pop", "empty", "pop"] }, expectedOutput: [4, 4, 0, 9], visibility: "SAMPLE" },
      { input: { commands: ["push 3", "pop", "empty"] }, expectedOutput: [3, 1], visibility: "SAMPLE" },
      { input: { commands: ["push 1", "pop", "push 2", "push 3", "front"] }, expectedOutput: [1, 2], visibility: "HIDDEN" },
      { input: { commands: [] }, expectedOutput: [], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "min-stack",
    title: "Min Stack",
    difficulty: "HARD",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "Run a stack that can also report the smallest value it currently holds. It starts empty. push x adds x. pop removes the most recently pushed value. top returns that value without removing it. getMin returns the smallest value still on the stack. pop, top, and getMin are only requested while the stack is not empty. Return the results of top and getMin in order. Each of those queries should be answered without scanning the whole stack.",
    constraints: ["0 <= commands.length <= 1000", "Pushed values are integers from -1e9 to 1e9."],
    examples: [
      { input: 'commands = ["push -2", "push 0", "push -3", "getMin", "pop", "top", "getMin"]', output: "[-3, 0, -2]" },
      { input: 'commands = ["push 1", "push 1", "getMin", "pop", "getMin"]', output: "[1, 1]" },
    ],
    signature: "vector<long long> minStack(vector<string>& commands)",
    functionName: "minStack",
    driver: commandOut("sol.minStack(commands)"),
    method: `vector<long long> minStack(vector<string>& commands) {
        vector<long long> values, lows;
        vector<long long> out;
        for (const string& command : commands) {
            if (command.rfind("push ", 0) == 0) {
                long long value = stoll(command.substr(5));
                values.push_back(value);
                lows.push_back(lows.empty() ? value : min(lows.back(), value));
            } else if (command == "pop") {
                values.pop_back();
                lows.pop_back();
            } else if (command == "top") out.push_back(values.back());
            else if (command == "getMin") out.push_back(lows.back());
        }
        return out;
    }`,
    expectedTime: "O(commands)",
    expectedSpace: "O(commands)",
    hints: [
      "The minimum can change only when you push or pop. Scanning every value on each getMin is more work than the limit allows.",
      "Pair the value stack with a second stack of running minima. The top of that second stack is the answer to getMin.",
      "On push, the new minimum is the smaller of the new value and the previous minimum. On pop, pop both stacks. Equal minima must both be recorded so a later pop restores the older minimum.",
      "top still reads the value stack. One extra integer per push keeps every query constant time.",
    ],
    tests: [
      { input: { commands: ["push -2", "push 0", "push -3", "getMin", "pop", "top", "getMin"] }, expectedOutput: [-3, 0, -2], visibility: "SAMPLE" },
      { input: { commands: ["push 1", "push 1", "getMin", "pop", "getMin"] }, expectedOutput: [1, 1], visibility: "SAMPLE" },
      { input: { commands: ["push 5", "getMin", "push -1", "getMin", "pop", "getMin"] }, expectedOutput: [5, -1, 5], visibility: "HIDDEN" },
      { input: { commands: ["push 0", "top", "getMin"] }, expectedOutput: [0, 0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "infix-postfix",
    title: "Infix to Postfix",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "Convert an infix expression to postfix. Operands are single letters or digits. The operators are + - * / and ^, and parentheses may group a subexpression. There are no spaces. ^ is right-associative and binds tightest, then * and /, then + and -. * / + and - are left-associative. Return the postfix expression with the same single-character operands and no spaces.",
    constraints: ["The expression is a valid infix expression of 1 to 200 characters."],
    examples: [
      { input: 'expression = "a+b*c"', output: '"abc*+"' },
      { input: 'expression = "(a+b)*c"', output: '"ab+c*"' },
      { input: 'expression = "a^b^c"', output: '"abc^^"' },
    ],
    signature: "string infixToPostfix(string expression)",
    functionName: "infixToPostfix",
    driver: `printJson(Json::text(sol.infixToPostfix(in["expression"].asString())));`,
    method: `string infixToPostfix(string expression) {
        auto rank = [](char op) { return op == '+' || op == '-' ? 1 : op == '*' || op == '/' ? 2 : 3; };
        string out;
        vector<char> ops;
        for (char ch : expression) {
            if (isalnum(static_cast<unsigned char>(ch))) out.push_back(ch);
            else if (ch == '(') ops.push_back(ch);
            else if (ch == ')') {
                while (ops.back() != '(') { out.push_back(ops.back()); ops.pop_back(); }
                ops.pop_back();
            } else {
                while (!ops.empty() && ops.back() != '(' && (rank(ops.back()) > rank(ch) || (rank(ops.back()) == rank(ch) && ch != '^'))) {
                    out.push_back(ops.back());
                    ops.pop_back();
                }
                ops.push_back(ch);
            }
        }
        while (!ops.empty()) { out.push_back(ops.back()); ops.pop_back(); }
        return out;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "An operand can be written immediately. An operator has to wait until both of its operands, and any tighter operator between them, are already in the output.",
      "Keep operators on a stack. An operand goes straight to the output.",
      "Before pushing an operator, pop any stack operator that binds more tightly, or equally tightly when the new operator is left-associative. ^ stays while another ^ is pushed. A closing parenthesis pops until the matching opening parenthesis.",
      "Finish by popping the remaining operators. Parentheses themselves are never written to the output.",
    ],
    tests: [
      { input: { expression: "a+b*c" }, expectedOutput: "abc*+", visibility: "SAMPLE" },
      { input: { expression: "(a+b)*c" }, expectedOutput: "ab+c*", visibility: "SAMPLE" },
      { input: { expression: "a^b^c" }, expectedOutput: "abc^^", visibility: "SAMPLE" },
      { input: { expression: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { expression: "(a+b)*(c-d)" }, expectedOutput: "ab+cd-*", visibility: "HIDDEN" },
      { input: { expression: "k+l-m*n+o/p^q" }, expectedOutput: "kl+mn*-opq^/+", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "prefix-infix",
    title: "Prefix to Infix",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "Convert a prefix expression to infix. Operands are single letters or digits, and the operators are + - * / and ^. There are no parentheses or spaces in the input. Return a fully parenthesized infix expression, so every operator is wrapped with its two operands.",
    constraints: ["The expression is a valid prefix expression of 1 to 200 characters."],
    examples: [
      { input: 'expression = "+a*bc"', output: '"(a+(b*c))"' },
      { input: 'expression = "a"', output: '"a"' },
    ],
    signature: "string prefixToInfix(string expression)",
    functionName: "prefixToInfix",
    driver: `printJson(Json::text(sol.prefixToInfix(in["expression"].asString())));`,
    method: `string prefixToInfix(string expression) {
        vector<string> stack;
        for (int index = (int)expression.size() - 1; index >= 0; --index) {
            char ch = expression[index];
            if (isalnum(static_cast<unsigned char>(ch))) stack.push_back(string(1, ch));
            else {
                string left = stack.back(); stack.pop_back();
                string right = stack.back(); stack.pop_back();
                stack.push_back("(" + left + string(1, ch) + right + ")");
            }
        }
        return stack.back();
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "A prefix operator appears before the two expressions it combines. Reading from the right lets you finish those expressions first.",
      "Scan from the right and keep strings on a stack. An operand is pushed as a one-character string.",
      "An operator pops the left expression, then the right expression, and pushes them back as (left operator right).",
      "A single operand is already infix. The final stack holds one fully parenthesized string.",
    ],
    tests: [
      { input: { expression: "+a*bc" }, expectedOutput: "(a+(b*c))", visibility: "SAMPLE" },
      { input: { expression: "a" }, expectedOutput: "a", visibility: "SAMPLE" },
      { input: { expression: "*+abc" }, expectedOutput: "((a+b)*c)", visibility: "HIDDEN" },
      { input: { expression: "^a^bc" }, expectedOutput: "(a^(b^c))", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "prefix-postfix",
    title: "Prefix to Postfix",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "Convert a prefix expression to postfix. Operands are single letters or digits, and the operators are + - * / and ^. There are no parentheses or spaces. Return the postfix expression with no spaces.",
    constraints: ["The expression is a valid prefix expression of 1 to 200 characters."],
    examples: [
      { input: 'expression = "*+abc"', output: '"ab+c*"' },
      { input: 'expression = "+a*bc"', output: '"abc*+"' },
    ],
    signature: "string prefixToPostfix(string expression)",
    functionName: "prefixToPostfix",
    driver: `printJson(Json::text(sol.prefixToPostfix(in["expression"].asString())));`,
    method: `string prefixToPostfix(string expression) {
        vector<string> stack;
        for (int index = (int)expression.size() - 1; index >= 0; --index) {
            char ch = expression[index];
            if (isalnum(static_cast<unsigned char>(ch))) stack.push_back(string(1, ch));
            else {
                string left = stack.back(); stack.pop_back();
                string right = stack.back(); stack.pop_back();
                stack.push_back(left + right + ch);
            }
        }
        return stack.back();
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "The operator in prefix belongs after both of its operands in postfix.",
      "Scan from the right. Push operands onto a stack of strings.",
      "An operator pops the left piece, then the right piece, and pushes left, right, and the operator concatenated.",
      "The last remaining string is the postfix form. A lone operand does not change.",
    ],
    tests: [
      { input: { expression: "*+abc" }, expectedOutput: "ab+c*", visibility: "SAMPLE" },
      { input: { expression: "+a*bc" }, expectedOutput: "abc*+", visibility: "SAMPLE" },
      { input: { expression: "x" }, expectedOutput: "x", visibility: "HIDDEN" },
      { input: { expression: "^a^bc" }, expectedOutput: "abc^^", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "postfix-prefix",
    title: "Postfix to Prefix",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "Convert a postfix expression to prefix. Operands are single letters or digits, and the operators are + - * / and ^. There are no parentheses or spaces. Return the prefix expression with no spaces.",
    constraints: ["The expression is a valid postfix expression of 1 to 200 characters."],
    examples: [
      { input: 'expression = "ab+c*"', output: '"*+abc"' },
      { input: 'expression = "abc*+"', output: '"+a*bc"' },
    ],
    signature: "string postfixToPrefix(string expression)",
    functionName: "postfixToPrefix",
    driver: `printJson(Json::text(sol.postfixToPrefix(in["expression"].asString())));`,
    method: `string postfixToPrefix(string expression) {
        vector<string> stack;
        for (char ch : expression) {
            if (isalnum(static_cast<unsigned char>(ch))) stack.push_back(string(1, ch));
            else {
                string right = stack.back(); stack.pop_back();
                string left = stack.back(); stack.pop_back();
                stack.push_back(string(1, ch) + left + right);
            }
        }
        return stack.back();
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "A postfix operator comes after the two pieces it combines. In prefix that operator has to move in front of them.",
      "Scan from the left and keep finished pieces on a stack.",
      "An operator pops the right piece, then the left piece, and pushes the operator followed by left and then right.",
      "Operands are pushed unchanged. The stack ends with one prefix string.",
    ],
    tests: [
      { input: { expression: "ab+c*" }, expectedOutput: "*+abc", visibility: "SAMPLE" },
      { input: { expression: "abc*+" }, expectedOutput: "+a*bc", visibility: "SAMPLE" },
      { input: { expression: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { expression: "abc^^" }, expectedOutput: "^a^bc", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "postfix-infix",
    title: "Postfix to Infix",
    difficulty: "EASY",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "Convert a postfix expression to infix. Operands are single letters or digits, and the operators are + - * / and ^. There are no parentheses or spaces in the input. Return a fully parenthesized infix expression.",
    constraints: ["The expression is a valid postfix expression of 1 to 200 characters."],
    examples: [
      { input: 'expression = "ab+"', output: '"(a+b)"' },
      { input: 'expression = "ab+c*"', output: '"((a+b)*c)"' },
    ],
    signature: "string postfixToInfix(string expression)",
    functionName: "postfixToInfix",
    driver: `printJson(Json::text(sol.postfixToInfix(in["expression"].asString())));`,
    method: `string postfixToInfix(string expression) {
        vector<string> stack;
        for (char ch : expression) {
            if (isalnum(static_cast<unsigned char>(ch))) stack.push_back(string(1, ch));
            else {
                string right = stack.back(); stack.pop_back();
                string left = stack.back(); stack.pop_back();
                stack.push_back("(" + left + string(1, ch) + right + ")");
            }
        }
        return stack.back();
    }`,
    expectedTime: "O(n^2)",
    expectedSpace: "O(n)",
    hints: [
      "Each postfix operator closes one pair of pieces that are already complete.",
      "Scan left to right. Push operands as strings.",
      "An operator pops the right piece, then the left piece, and pushes (left operator right).",
      "Parentheses go around every operator, including the outermost one, unless the expression is a single operand.",
    ],
    tests: [
      { input: { expression: "ab+" }, expectedOutput: "(a+b)", visibility: "SAMPLE" },
      { input: { expression: "ab+c*" }, expectedOutput: "((a+b)*c)", visibility: "SAMPLE" },
      { input: { expression: "q" }, expectedOutput: "q", visibility: "HIDDEN" },
      { input: { expression: "abc^^" }, expectedOutput: "(a^(b^c))", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "infix-prefix",
    title: "Infix to Prefix",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "Convert an infix expression to prefix. Operands are single letters or digits. The operators are + - * / and ^, and parentheses may group a subexpression. There are no spaces. ^ is right-associative and binds tightest, then * and /, then + and -. The other operators are left-associative. Return the prefix expression with no spaces.",
    constraints: ["The expression is a valid infix expression of 1 to 200 characters."],
    examples: [
      { input: 'expression = "(a+b)*c"', output: '"*+abc"' },
      { input: 'expression = "a^b^c"', output: '"^a^bc"' },
    ],
    signature: "string infixToPrefix(string expression)",
    functionName: "infixToPrefix",
    driver: `printJson(Json::text(sol.infixToPrefix(in["expression"].asString())));`,
    method: `string infixToPrefix(string expression) {
        auto rank = [](char op) { return op == '+' || op == '-' ? 1 : op == '*' || op == '/' ? 2 : 3; };
        string reversed;
        for (int index = (int)expression.size() - 1; index >= 0; --index) {
            char ch = expression[index];
            if (ch == '(') reversed.push_back(')');
            else if (ch == ')') reversed.push_back('(');
            else reversed.push_back(ch);
        }
        string postfix;
        vector<char> ops;
        for (char ch : reversed) {
            if (isalnum(static_cast<unsigned char>(ch))) postfix.push_back(ch);
            else if (ch == '(') ops.push_back(ch);
            else if (ch == ')') {
                while (ops.back() != '(') { postfix.push_back(ops.back()); ops.pop_back(); }
                ops.pop_back();
            } else {
                while (!ops.empty() && ops.back() != '(' && (rank(ops.back()) > rank(ch) || (rank(ops.back()) == rank(ch) && ch == '^'))) {
                    postfix.push_back(ops.back());
                    ops.pop_back();
                }
                ops.push_back(ch);
            }
        }
        while (!ops.empty()) { postfix.push_back(ops.back()); ops.pop_back(); }
        return string(postfix.rbegin(), postfix.rend());
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Prefix is postfix read from the other direction, once parentheses and associativity are flipped to match.",
      "Reverse the infix expression and swap the parenthesis directions. Then convert that string to postfix, but treat ^ as the left-associative operator in this reversed pass and the others as right-associative.",
      "Reverse the postfix result. That reversal is the prefix expression.",
      "A single operand stays unchanged. a^b^c becomes ^a^bc because ^ groups to the right.",
    ],
    tests: [
      { input: { expression: "(a+b)*c" }, expectedOutput: "*+abc", visibility: "SAMPLE" },
      { input: { expression: "a^b^c" }, expectedOutput: "^a^bc", visibility: "SAMPLE" },
      { input: { expression: "a+b*c" }, expectedOutput: "+a*bc", visibility: "HIDDEN" },
      { input: { expression: "a" }, expectedOutput: "a", visibility: "HIDDEN" },
      { input: { expression: "k+l-m*n+o/p^q" }, expectedOutput: "+-+kl*mn/o^pq", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "next-greater",
    title: "Next Greater Element",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack", "monotonic-stack"],
    statement:
      "For each value, find the first strictly greater value to its right. If none exists, use -1. Return one answer per index, in the same order. A separate scan from every index is too slow for the longer hidden cases.",
    constraints: ["1 <= nums.length <= 10000", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [2, 1, 2, 4, 3]", output: "[4, 2, 4, -1, -1]" },
      { input: "nums = [1, 1, 1]", output: "[-1, -1, -1]" },
    ],
    signature: "vector<int> nextGreater(vector<int>& nums)",
    functionName: "nextGreater",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::ints(sol.nextGreater(nums)));`,
    method: `vector<int> nextGreater(vector<int>& nums) {
        int n = (int)nums.size();
        vector<int> answer(n, -1);
        stack<int> waiting;
        for (int index = 0; index < n; ++index) {
            while (!waiting.empty() && nums[waiting.top()] < nums[index]) {
                answer[waiting.top()] = nums[index];
                waiting.pop();
            }
            waiting.push(index);
        }
        return answer;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A value can be the next greater one for several earlier values, but only for the ones that are still waiting for something larger.",
      "Keep a stack of indexes whose next greater value is not known yet. Keep those indexes in decreasing order of value.",
      "When the current value is greater than the stack top, it answers that index. Pop until the stack top is greater than or equal to the current value, then push the current index.",
      "Indexes left on the stack have no greater value to the right, so they stay -1. Each index is pushed and popped once.",
    ],
    tests: [
      { input: { nums: [2, 1, 2, 4, 3] }, expectedOutput: [4, 2, 4, -1, -1], visibility: "SAMPLE" },
      { input: { nums: [1, 1, 1] }, expectedOutput: [-1, -1, -1], visibility: "SAMPLE" },
      { input: { nums: [5] }, expectedOutput: [-1], visibility: "HIDDEN" },
      { input: { nums: [1, 3, 2, 4] }, expectedOutput: [3, 4, 4, -1], visibility: "HIDDEN" },
      { input: { nums: [9, 8, 7] }, expectedOutput: [-1, -1, -1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "next-greater-circular",
    title: "Next Greater Element II",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack", "monotonic-stack"],
    statement:
      "The array is circular: after the last index, the search continues from the first index and stops before returning to the starting index. For each value, find the first strictly greater value in that circular order. If none exists, use -1. Return one answer per index.",
    constraints: ["1 <= nums.length <= 10000", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [1, 2, 1]", output: "[2, -1, 2]" },
      { input: "nums = [1, 2, 3, 4, 3]", output: "[2, 3, 4, -1, 4]" },
    ],
    signature: "vector<int> nextGreaterCircular(vector<int>& nums)",
    functionName: "nextGreaterCircular",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::ints(sol.nextGreaterCircular(nums)));`,
    method: `vector<int> nextGreaterCircular(vector<int>& nums) {
        int n = (int)nums.size();
        vector<int> answer(n, -1);
        stack<int> waiting;
        for (int step = 0; step < 2 * n; ++step) {
            int index = step % n;
            while (!waiting.empty() && nums[waiting.top()] < nums[index]) {
                answer[waiting.top()] = nums[index];
                waiting.pop();
            }
            if (step < n) waiting.push(index);
        }
        return answer;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The circular order is the array followed by itself, except a value is not a candidate for itself.",
      "Use the same decreasing stack of indexes as the non-circular next-greater problem.",
      "Walk the indexes twice. Pop and answer while the current value is strictly greater than the stack top. Push an index only on the first pass, so it is not stored twice.",
      "The largest value, and any value equal to it with nothing larger anywhere, stays -1.",
    ],
    tests: [
      { input: { nums: [1, 2, 1] }, expectedOutput: [2, -1, 2], visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3, 4, 3] }, expectedOutput: [2, 3, 4, -1, 4], visibility: "SAMPLE" },
      { input: { nums: [5, 4, 3, 2, 1] }, expectedOutput: [-1, 5, 5, 5, 5], visibility: "HIDDEN" },
      { input: { nums: [2, 2, 2] }, expectedOutput: [-1, -1, -1], visibility: "HIDDEN" },
      { input: { nums: [7] }, expectedOutput: [-1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "next-smaller",
    title: "Next Smaller Element",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack", "monotonic-stack"],
    statement:
      "For each value, find the first strictly smaller value to its right. If none exists, use -1. Return one answer per index.",
    constraints: ["1 <= nums.length <= 10000", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [4, 8, 5, 2, 25]", output: "[2, 5, 2, -1, -1]" },
      { input: "nums = [3, 1, 2]", output: "[1, -1, -1]" },
    ],
    signature: "vector<int> nextSmaller(vector<int>& nums)",
    functionName: "nextSmaller",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::ints(sol.nextSmaller(nums)));`,
    method: `vector<int> nextSmaller(vector<int>& nums) {
        int n = (int)nums.size();
        vector<int> answer(n, -1);
        stack<int> waiting;
        for (int index = 0; index < n; ++index) {
            while (!waiting.empty() && nums[waiting.top()] > nums[index]) {
                answer[waiting.top()] = nums[index];
                waiting.pop();
            }
            waiting.push(index);
        }
        return answer;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "This is the next-greater walk with the comparison turned around. Values that are still larger than everything seen later stay waiting.",
      "Keep a stack of indexes in increasing order of value.",
      "When the current value is smaller than the stack top, it is the next smaller value for that index. Pop until the top is smaller than or equal to the current value.",
      "Equal values do not answer each other. Whatever remains on the stack is -1.",
    ],
    tests: [
      { input: { nums: [4, 8, 5, 2, 25] }, expectedOutput: [2, 5, 2, -1, -1], visibility: "SAMPLE" },
      { input: { nums: [3, 1, 2] }, expectedOutput: [1, -1, -1], visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3] }, expectedOutput: [-1, -1, -1], visibility: "HIDDEN" },
      { input: { nums: [5, 5, 4] }, expectedOutput: [4, 4, -1], visibility: "HIDDEN" },
      { input: { nums: [8] }, expectedOutput: [-1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "greater-counts",
    title: "Number of Greater Elements to the Right",
    difficulty: "EASY",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "You are given an array and a list of query indexes. For each query index, count how many values strictly to its right are strictly greater than the value at that index. Return the counts in the same order as the queries.",
    constraints: ["1 <= nums.length <= 2000", "1 <= queries.length <= 2000", "Each query is an index of nums.", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [3, 4, 2, 7, 5, 8, 10, 6], queries = [0, 5]", output: "[6, 1]" },
      { input: "nums = [1, 2, 3], queries = [2]", output: "[0]" },
    ],
    signature: "vector<int> greaterCounts(vector<int>& nums, vector<int>& queries)",
    functionName: "greaterCounts",
    driver: `auto nums = in["nums"].asIntVector();\n    auto queries = in["queries"].asIntVector();\n    printJson(Json::ints(sol.greaterCounts(nums, queries)));`,
    method: `vector<int> greaterCounts(vector<int>& nums, vector<int>& queries) {
        vector<int> counts;
        for (int index : queries) {
            int count = 0;
            for (int right = index + 1; right < (int)nums.size(); ++right) if (nums[right] > nums[index]) ++count;
            counts.push_back(count);
        }
        return counts;
    }`,
    expectedTime: "O(nums * queries)",
    expectedSpace: "O(1)",
    hints: [
      "Each query asks about one starting index. The values that matter are only those with a larger index.",
      "For a query index i, walk j from i + 1 to the end and count nums[j] > nums[i].",
      "Equal values are not greater. The last index always has a count of 0.",
      "The bounds are small enough that checking the suffix of every query finishes in time. A balanced tree of later values would answer the same counts with fewer comparisons.",
    ],
    tests: [
      { input: { nums: [3, 4, 2, 7, 5, 8, 10, 6], queries: [0, 5] }, expectedOutput: [6, 1], visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3], queries: [2] }, expectedOutput: [0], visibility: "SAMPLE" },
      { input: { nums: [1, 2, 3], queries: [2, 0] }, expectedOutput: [0, 2], visibility: "HIDDEN" },
      { input: { nums: [5], queries: [0] }, expectedOutput: [0], visibility: "HIDDEN" },
      { input: { nums: [4, 4, 4], queries: [0, 1] }, expectedOutput: [0, 0], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "trap-rain",
    title: "Trapping Rain Water",
    difficulty: "HARD",
    topics: ["stacks-queues"],
    tags: ["stack", "two-pointers"],
    statement:
      "Each height[i] is the height of a bar of width 1. Water sits above a bar up to the shorter of the tallest bar on its left, including itself, and the tallest bar on its right, including itself. Return the total units of water. Bars at the ends hold no water above them.",
    constraints: ["1 <= height.length <= 10000", "0 <= height[i] <= 100000"],
    examples: [
      { input: "height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]", output: "6" },
      { input: "height = [4, 2, 0, 3, 2, 5]", output: "9" },
    ],
    signature: "long long trapRain(vector<int>& height)",
    functionName: "trapRain",
    driver: `auto height = in["height"].asIntVector();\n    printJson(Json::number(sol.trapRain(height)));`,
    method: `long long trapRain(vector<int>& height) {
        int n = (int)height.size();
        vector<int> left(n), right(n);
        left[0] = height[0];
        for (int index = 1; index < n; ++index) left[index] = max(left[index - 1], height[index]);
        right[n - 1] = height[n - 1];
        for (int index = n - 2; index >= 0; --index) right[index] = max(right[index + 1], height[index]);
        long long water = 0;
        for (int index = 0; index < n; ++index) water += min(left[index], right[index]) - height[index];
        return water;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Water above a bar is limited by the shorter of the highest wall to the left and the highest wall to the right.",
      "Precompute, for every index, the maximum height at or to the left, and the maximum height at or to the right.",
      "The water at an index is min(leftMax, rightMax) - height. Sum those amounts. A negative result cannot occur because both maxima include the bar itself.",
      "A stack of decreasing bars, or two pointers moving from the ends, computes the same total in one pass. The two prefix arrays already make the bound obvious.",
    ],
    tests: [
      { input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { height: [4, 2, 0, 3, 2, 5] }, expectedOutput: 9, visibility: "SAMPLE" },
      { input: { height: [1, 0, 1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { height: [5] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { height: [2, 0, 2] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "subarray-mins",
    title: "Sum of Subarray Minimums",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack", "monotonic-stack"],
    statement:
      "Add the minimum of every contiguous subarray. Return that sum modulo 1000000007. Every subarray is included once, including the single-element ones.",
    constraints: ["1 <= nums.length <= 10000", "0 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [3, 1, 2, 4]", output: "17" },
      { input: "nums = [11, 81, 94, 43, 3]", output: "444" },
    ],
    signature: "int sumSubarrayMins(vector<int>& nums)",
    functionName: "sumSubarrayMins",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.sumSubarrayMins(nums)));`,
    method: `int sumSubarrayMins(vector<int>& nums) {
        const long long MOD = 1000000007;
        int n = (int)nums.size();
        vector<int> left(n), right(n);
        stack<int> waiting;
        for (int index = 0; index < n; ++index) {
            while (!waiting.empty() && nums[waiting.top()] > nums[index]) waiting.pop();
            left[index] = waiting.empty() ? index + 1 : index - waiting.top();
            waiting.push(index);
        }
        while (!waiting.empty()) waiting.pop();
        for (int index = n - 1; index >= 0; --index) {
            while (!waiting.empty() && nums[waiting.top()] >= nums[index]) waiting.pop();
            right[index] = waiting.empty() ? n - index : waiting.top() - index;
            waiting.push(index);
        }
        long long sum = 0;
        for (int index = 0; index < n; ++index) sum = (sum + (long long)nums[index] * left[index] % MOD * right[index]) % MOD;
        return (int)sum;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Instead of visiting every subarray, count how many subarrays have a particular index as their minimum.",
      "For each index, find the nearest strictly smaller value on the left and the nearest smaller or equal value on the right. Those bounds stop the index from being the minimum.",
      "If the left distance is L and the right distance is R, this value is the minimum of L * R subarrays. Add value * L * R, then take the answer modulo 1000000007.",
      "Use a strictly greater comparison on the left and a greater-or-equal comparison on the right so a repeated minimum is owned by one index. A monotonic stack finds both distances in one pass each.",
    ],
    tests: [
      { input: { nums: [3, 1, 2, 4] }, expectedOutput: 17, visibility: "SAMPLE" },
      { input: { nums: [11, 81, 94, 43, 3] }, expectedOutput: 444, visibility: "SAMPLE" },
      { input: { nums: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { nums: [2, 2] }, expectedOutput: 6, visibility: "HIDDEN" },
      { input: { nums: [0, 5] }, expectedOutput: 5, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "asteroid-run",
    title: "Asteroid Collision",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "Asteroids are listed from left to right. A positive value moves right and a negative value moves left. Two asteroids collide only when the left one moves right and the right one moves left. The smaller one explodes. If their sizes are equal, both explode. Asteroids moving in the same direction never meet. Return the values that remain, from left to right.",
    constraints: ["1 <= asteroids.length <= 10000", "asteroids[i] != 0", "-1000 <= asteroids[i] <= 1000"],
    examples: [
      { input: "asteroids = [5, 10, -5]", output: "[5, 10]" },
      { input: "asteroids = [10, 2, -5]", output: "[10]" },
      { input: "asteroids = [8, -8]", output: "[]" },
    ],
    signature: "vector<int> asteroidCollision(vector<int>& asteroids)",
    functionName: "asteroidCollision",
    driver: `auto asteroids = in["asteroids"].asIntVector();\n    printJson(Json::ints(sol.asteroidCollision(asteroids)));`,
    method: `vector<int> asteroidCollision(vector<int>& asteroids) {
        vector<int> alive;
        for (int rock : asteroids) {
            bool remains = true;
            while (remains && rock < 0 && !alive.empty() && alive.back() > 0) {
                if (alive.back() < -rock) alive.pop_back();
                else if (alive.back() == -rock) { alive.pop_back(); remains = false; }
                else remains = false;
            }
            if (remains) alive.push_back(rock);
        }
        return alive;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A left-moving asteroid can only collide with right-moving asteroids that are still to its left. Everything further left is already settled or also moving left.",
      "Keep the survivors in a stack, from left to right.",
      "A right-moving asteroid, or a left-moving one with no right-moving survivor in front of it, is pushed. A left-moving asteroid pops smaller right-moving survivors. Equal sizes pop the survivor and discard the new one. A larger right-moving survivor stops the new one.",
      "Asteroids that all move the same way stay in their original order. Each asteroid is pushed at most once and popped at most once.",
    ],
    tests: [
      { input: { asteroids: [5, 10, -5] }, expectedOutput: [5, 10], visibility: "SAMPLE" },
      { input: { asteroids: [10, 2, -5] }, expectedOutput: [10], visibility: "SAMPLE" },
      { input: { asteroids: [8, -8] }, expectedOutput: [], visibility: "SAMPLE" },
      { input: { asteroids: [-2, -1, 1, 2] }, expectedOutput: [-2, -1, 1, 2], visibility: "HIDDEN" },
      { input: { asteroids: [1, -1, -2, -2] }, expectedOutput: [-2, -2], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "subarray-ranges",
    title: "Sum of Subarray Ranges",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack", "monotonic-stack"],
    statement:
      "The range of a contiguous subarray is its largest value minus its smallest value. Return the sum of the ranges of every contiguous subarray. A single element has range 0.",
    constraints: ["1 <= nums.length <= 1000", "-1000000 <= nums[i] <= 1000000"],
    examples: [
      { input: "nums = [1, 2, 3]", output: "4" },
      { input: "nums = [4, -2, -3, 4, 1]", output: "59" },
    ],
    signature: "long long subarrayRanges(vector<int>& nums)",
    functionName: "subarrayRanges",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::number(sol.subarrayRanges(nums)));`,
    method: `long long subarrayRanges(vector<int>& nums) {
        auto contribution = [&](bool minimum) {
            int n = (int)nums.size();
            vector<int> left(n), right(n);
            stack<int> waiting;
            for (int index = 0; index < n; ++index) {
                while (!waiting.empty() && (minimum ? nums[waiting.top()] > nums[index] : nums[waiting.top()] < nums[index])) waiting.pop();
                left[index] = waiting.empty() ? index + 1 : index - waiting.top();
                waiting.push(index);
            }
            while (!waiting.empty()) waiting.pop();
            for (int index = n - 1; index >= 0; --index) {
                while (!waiting.empty() && (minimum ? nums[waiting.top()] >= nums[index] : nums[waiting.top()] <= nums[index])) waiting.pop();
                right[index] = waiting.empty() ? n - index : waiting.top() - index;
                waiting.push(index);
            }
            long long sum = 0;
            for (int index = 0; index < n; ++index) sum += (long long)nums[index] * left[index] * right[index];
            return sum;
        };
        return contribution(false) - contribution(true);
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "Sum of (maximum - minimum) over every subarray is the sum of all subarray maximums minus the sum of all subarray minimums.",
      "Count, for each index, how many subarrays have that index as their strict owner of the minimum, and how many have it as the owner of the maximum.",
      "The minimum distances use a smaller-neighbor stack. The maximum distances use a larger-neighbor stack. Break ties in one direction so a repeated value is counted once.",
      "Subtract the two weighted sums. Negative values are fine because they contribute to both sums with the same distances.",
    ],
    tests: [
      { input: { nums: [1, 2, 3] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { nums: [4, -2, -3, 4, 1] }, expectedOutput: 59, visibility: "SAMPLE" },
      { input: { nums: [1] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { nums: [1, 3, 3] }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { nums: [7, 7, 7] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { nums: [-5, -1, -4] }, expectedOutput: 11, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "trim-digits",
    title: "Remove K Digits",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "num is a decimal integer written without a leading zero, except that it may be 0. Delete exactly k digits so the integer formed by the remaining digits, in their original order, is as small as possible. Leading zeros in the remaining digits are not part of the result. If every digit is removed, return \"0\".",
    constraints: ["1 <= num.length <= 4000", "num has no leading zero unless it is 0", "0 <= k <= num.length"],
    examples: [
      { input: 'num = "1432219", k = 3', output: '"1219"' },
      { input: 'num = "10200", k = 1', output: '"200"' },
      { input: 'num = "10", k = 2', output: '"0"' },
    ],
    signature: "string removeKdigits(string num, int k)",
    functionName: "removeKdigits",
    driver: `printJson(Json::text(sol.removeKdigits(in["num"].asString(), (int)in["k"].asInt())));`,
    method: `string removeKdigits(string num, int k) {
        string kept;
        for (char digit : num) {
            while (k > 0 && !kept.empty() && kept.back() > digit) {
                kept.pop_back();
                --k;
            }
            kept.push_back(digit);
        }
        while (k > 0 && !kept.empty()) { kept.pop_back(); --k; }
        int start = 0;
        while (start < (int)kept.size() && kept[start] == '0') ++start;
        string answer = kept.substr(start);
        return answer.empty() ? "0" : answer;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "A digit that is larger than a later digit is a bad prefix: removing it makes the number smaller than removing the later digit.",
      "Build the answer with a stack of digits that are still increasing.",
      "Before pushing the next digit, pop a larger digit from the stack while deletions remain. After the scan, if deletions remain, they come off the end, where the largest leftover digits sit.",
      "Strip leading zeros at the end. An empty stack becomes \"0\". Each digit is pushed once and popped at most once.",
    ],
    tests: [
      { input: { num: "1432219", k: 3 }, expectedOutput: "1219", visibility: "SAMPLE" },
      { input: { num: "10200", k: 1 }, expectedOutput: "200", visibility: "SAMPLE" },
      { input: { num: "10", k: 2 }, expectedOutput: "0", visibility: "SAMPLE" },
      { input: { num: "112", k: 1 }, expectedOutput: "11", visibility: "HIDDEN" },
      { input: { num: "100", k: 1 }, expectedOutput: "0", visibility: "HIDDEN" },
      { input: { num: "9", k: 0 }, expectedOutput: "9", visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "histogram-area",
    title: "Largest Rectangle in Histogram",
    difficulty: "HARD",
    topics: ["stacks-queues"],
    tags: ["stack", "monotonic-stack"],
    statement:
      "Each heights[i] is the height of a bar of width 1. A rectangle must cover full bars and sit on the baseline. Return the largest rectangle area.",
    constraints: ["1 <= heights.length <= 10000", "0 <= heights[i] <= 10000"],
    examples: [
      { input: "heights = [2, 1, 5, 6, 2, 3]", output: "10" },
      { input: "heights = [2, 4]", output: "4" },
    ],
    signature: "long long largestRectangle(vector<int>& heights)",
    functionName: "largestRectangle",
    driver: `auto heights = in["heights"].asIntVector();\n    printJson(Json::number(sol.largestRectangle(heights)));`,
    method: `long long largestRectangle(vector<int>& heights) {
        stack<int> waiting;
        long long best = 0;
        for (int index = 0; index <= (int)heights.size(); ++index) {
            int height = index == (int)heights.size() ? 0 : heights[index];
            while (!waiting.empty() && heights[waiting.top()] > height) {
                int bar = heights[waiting.top()];
                waiting.pop();
                int left = waiting.empty() ? -1 : waiting.top();
                best = max(best, (long long)bar * (index - left - 1));
            }
            waiting.push(index);
        }
        return best;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The tallest rectangle that uses a bar as its shortest bar extends left and right until a strictly shorter bar.",
      "Keep a stack of indexes in increasing order of height.",
      "When a shorter bar arrives, the stack top can no longer extend. Its width runs from the new index back to the index now under it. Pop until the stack is increasing again.",
      "Append a bar of height 0 so the remaining stack is flushed. Equal heights can stay stacked; the later one takes the wider span when it is popped.",
    ],
    tests: [
      { input: { heights: [2, 1, 5, 6, 2, 3] }, expectedOutput: 10, visibility: "SAMPLE" },
      { input: { heights: [2, 4] }, expectedOutput: 4, visibility: "SAMPLE" },
      { input: { heights: [1] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { heights: [2, 1, 2] }, expectedOutput: 3, visibility: "HIDDEN" },
      { input: { heights: [0, 0] }, expectedOutput: 0, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "maximal-rectangle",
    title: "Maximal Rectangle",
    difficulty: "HARD",
    topics: ["stacks-queues"],
    tags: ["stack", "matrix"],
    statement:
      "grid is made of characters 0 and 1. A rectangle may use only cells that contain 1, and it must be solid. Return the area of the largest such rectangle. An empty grid of zeros has area 0.",
    constraints: ["1 <= grid.length <= 200", "1 <= grid[i].length <= 200", "Every row has the same length.", "Each cell is 0 or 1."],
    examples: [
      {
        input: 'grid = ["10100", "10111", "11111", "10010"]',
        output: "6",
        explanation: "The 2 by 3 block of ones in the middle-right has area 6.",
      },
      { input: 'grid = ["0"]', output: "0" },
    ],
    signature: "int maximalRectangle(vector<string>& grid)",
    functionName: "maximalRectangle",
    driver: `auto grid = in["grid"].asStrings();\n    printJson(Json::number(sol.maximalRectangle(grid)));`,
    method: `int maximalRectangle(vector<string>& grid) {
        int rows = (int)grid.size(), cols = (int)grid[0].size(), best = 0;
        vector<int> height(cols);
        for (int row = 0; row < rows; ++row) {
            for (int col = 0; col < cols; ++col) height[col] = grid[row][col] == '1' ? height[col] + 1 : 0;
            stack<int> waiting;
            for (int col = 0; col <= cols; ++col) {
                int bar = col == cols ? 0 : height[col];
                while (!waiting.empty() && height[waiting.top()] > bar) {
                    int value = height[waiting.top()];
                    waiting.pop();
                    int left = waiting.empty() ? -1 : waiting.top();
                    best = max(best, value * (col - left - 1));
                }
                waiting.push(col);
            }
        }
        return best;
    }`,
    expectedTime: "O(rows * cols)",
    expectedSpace: "O(cols)",
    hints: [
      "A rectangle of ones that ends on a particular row is a histogram: each column's height is the run of ones upward from that row.",
      "Build that height array row by row. A 0 resets its column to 0. A 1 adds one to the previous height.",
      "The largest rectangle ending on this row is the largest rectangle in that histogram. Solve the histogram with a monotonic stack, then move to the next row.",
      "The answer is the best histogram area seen on any row. Width and height are both at most 200, so the area fits in a 32-bit integer.",
    ],
    tests: [
      { input: { grid: ["10100", "10111", "11111", "10010"] }, expectedOutput: 6, visibility: "SAMPLE" },
      { input: { grid: ["0"] }, expectedOutput: 0, visibility: "SAMPLE" },
      { input: { grid: ["1"] }, expectedOutput: 1, visibility: "HIDDEN" },
      { input: { grid: ["11", "11"] }, expectedOutput: 4, visibility: "HIDDEN" },
      { input: { grid: ["01", "10"] }, expectedOutput: 1, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "window-max",
    title: "Sliding Window Maximum",
    difficulty: "HARD",
    topics: ["stacks-queues"],
    tags: ["queue", "monotonic-queue"],
    statement:
      "A window of length k slides from the left of nums to the right, one index at a time. Return the maximum of each window, from the first window to the last. There are nums.length - k + 1 windows.",
    constraints: ["1 <= nums.length <= 10000", "1 <= k <= nums.length", "-1e9 <= nums[i] <= 1e9"],
    examples: [
      { input: "nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3", output: "[3, 3, 5, 5, 6, 7]" },
      { input: "nums = [1], k = 1", output: "[1]" },
    ],
    signature: "vector<int> windowMaximum(vector<int>& nums, int k)",
    functionName: "windowMaximum",
    driver: `auto nums = in["nums"].asIntVector();\n    printJson(Json::ints(sol.windowMaximum(nums, (int)in["k"].asInt())));`,
    method: `vector<int> windowMaximum(vector<int>& nums, int k) {
        deque<int> waiting;
        vector<int> answer;
        for (int index = 0; index < (int)nums.size(); ++index) {
            while (!waiting.empty() && waiting.front() <= index - k) waiting.pop_front();
            while (!waiting.empty() && nums[waiting.back()] <= nums[index]) waiting.pop_back();
            waiting.push_back(index);
            if (index >= k - 1) answer.push_back(nums[waiting.front()]);
        }
        return answer;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(k)",
    hints: [
      "The maximum of the next window is either the new value or a value that is still inside the window and larger than everything after it.",
      "Keep a deque of indexes, ordered from largest value to smaller values that might become the maximum later.",
      "Drop the front index when it slides out of the window. Before pushing the new index, pop the back while its value is less than or equal to the new value. The front is then the window maximum.",
      "Record an answer once the window has k elements. Each index enters and leaves the deque once.",
    ],
    tests: [
      { input: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 }, expectedOutput: [3, 3, 5, 5, 6, 7], visibility: "SAMPLE" },
      { input: { nums: [1], k: 1 }, expectedOutput: [1], visibility: "SAMPLE" },
      { input: { nums: [9, 11], k: 2 }, expectedOutput: [11], visibility: "HIDDEN" },
      { input: { nums: [1, -1], k: 1 }, expectedOutput: [1, -1], visibility: "HIDDEN" },
      { input: { nums: [4, 4, 4], k: 2 }, expectedOutput: [4, 4], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "stock-span",
    title: "Stock Span",
    difficulty: "HARD",
    topics: ["stacks-queues"],
    tags: ["stack", "monotonic-stack"],
    statement:
      "prices[i] is the price on day i. The span of day i is the number of consecutive days ending on i whose price is less than or equal to prices[i]. Day i itself always counts. Return the span of every day.",
    constraints: ["1 <= prices.length <= 10000", "1 <= prices[i] <= 1e9"],
    examples: [
      { input: "prices = [100, 80, 60, 70, 60, 75, 85]", output: "[1, 1, 1, 2, 1, 4, 6]" },
      { input: "prices = [10, 10, 10]", output: "[1, 2, 3]" },
    ],
    signature: "vector<int> stockSpan(vector<int>& prices)",
    functionName: "stockSpan",
    driver: `auto prices = in["prices"].asIntVector();\n    printJson(Json::ints(sol.stockSpan(prices)));`,
    method: `vector<int> stockSpan(vector<int>& prices) {
        stack<int> waiting;
        vector<int> spans;
        for (int day = 0; day < (int)prices.size(); ++day) {
            while (!waiting.empty() && prices[waiting.top()] <= prices[day]) waiting.pop();
            spans.push_back(waiting.empty() ? day + 1 : day - waiting.top());
            waiting.push(day);
        }
        return spans;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(n)",
    hints: [
      "The span ends at the closest previous day with a strictly higher price. Everything after that day is less than or equal to today.",
      "Keep a stack of days in decreasing order of price.",
      "Pop while the stack top's price is less than or equal to today's price. The new top is the previous strictly higher day. The span is the distance to that day, or day + 1 if the stack is empty.",
      "Equal prices extend the span, so they are popped. Each day is pushed once.",
    ],
    tests: [
      { input: { prices: [100, 80, 60, 70, 60, 75, 85] }, expectedOutput: [1, 1, 1, 2, 1, 4, 6], visibility: "SAMPLE" },
      { input: { prices: [10, 10, 10] }, expectedOutput: [1, 2, 3], visibility: "SAMPLE" },
      { input: { prices: [1, 2, 3] }, expectedOutput: [1, 2, 3], visibility: "HIDDEN" },
      { input: { prices: [3, 2, 1] }, expectedOutput: [1, 1, 1], visibility: "HIDDEN" },
      { input: { prices: [5] }, expectedOutput: [1], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "celebrity",
    title: "The Celebrity Problem",
    difficulty: "HARD",
    topics: ["stacks-queues"],
    tags: ["stack"],
    statement:
      "There are n people, numbered from 0 to n - 1. knows[a][b] is 1 when person a knows person b, and 0 otherwise. The diagonal is 0. A celebrity is known by every other person and knows nobody. There is at most one celebrity. Return that person's index, or -1 when there is none.",
    constraints: ["1 <= n <= 100", "knows is an n by n matrix of 0 and 1", "knows[i][i] = 0"],
    examples: [
      { input: "knows = [[0, 1, 0], [0, 0, 0], [0, 1, 0]]", output: "1" },
      { input: "knows = [[0, 1], [1, 0]]", output: "-1" },
    ],
    signature: "int celebrity(vector<vector<int>>& knows)",
    functionName: "celebrity",
    driver: `auto knows = in["knows"].asIntMatrix();\n    printJson(Json::number(sol.celebrity(knows)));`,
    method: `int celebrity(vector<vector<int>>& knows) {
        int n = (int)knows.size(), candidate = 0;
        for (int person = 1; person < n; ++person) if (knows[candidate][person]) candidate = person;
        for (int person = 0; person < n; ++person) {
            if (person == candidate) continue;
            if (knows[candidate][person] || !knows[person][candidate]) return -1;
        }
        return candidate;
    }`,
    expectedTime: "O(n)",
    expectedSpace: "O(1)",
    hints: [
      "If A knows B, A cannot be the celebrity. If A does not know B, B cannot be the celebrity. One comparison eliminates one person.",
      "Walk the people once and keep a single candidate. Whenever the candidate knows the next person, replace the candidate with that person.",
      "The survivor is only a candidate. Check that they know nobody else and that every other person knows them.",
      "A party of one is a celebrity, because there is nobody they would have to know and nobody who must know them.",
    ],
    tests: [
      { input: { knows: [[0, 1, 0], [0, 0, 0], [0, 1, 0]] }, expectedOutput: 1, visibility: "SAMPLE" },
      { input: { knows: [[0, 1], [1, 0]] }, expectedOutput: -1, visibility: "SAMPLE" },
      { input: { knows: [[0]] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { knows: [[0, 0], [1, 0]] }, expectedOutput: 0, visibility: "HIDDEN" },
      { input: { knows: [[0, 1, 1], [0, 0, 1], [0, 0, 0]] }, expectedOutput: 2, visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lru-cache",
    title: "LRU Cache",
    difficulty: "MEDIUM",
    topics: ["stacks-queues"],
    tags: ["design", "linked-list"],
    statement:
      "Run a cache that holds at most capacity keys. get key returns the stored value, or -1 when the key is absent, and marks the key as just used. put key value stores the value. If the key was already present, replace its value and mark it as just used. If a new key would exceed capacity, evict the least recently used key first. A capacity of 0 stores nothing. Return the results of every get, in order.",
    constraints: ["0 <= capacity <= 1000", "0 <= commands.length <= 1000", "Keys are integers from 0 to 1e9.", "Values are integers from -1e9 to 1e9."],
    examples: [
      {
        input: 'capacity = 2, commands = ["put 1 1", "put 2 2", "get 1", "put 3 3", "get 2", "put 4 4", "get 1", "get 3", "get 4"]',
        output: "[1, -1, -1, 3, 4]",
      },
      { input: 'capacity = 0, commands = ["get 1", "put 1 1", "get 1"]', output: "[-1, -1]" },
    ],
    signature: "vector<long long> lruCache(int capacity, vector<string>& commands)",
    functionName: "lruCache",
    driver: commandOut("sol.lruCache((int)in[\"capacity\"].asInt(), commands)"),
    method: `vector<long long> lruCache(int capacity, vector<string>& commands) {
        unordered_map<long long, pair<long long, int>> box;
        int stamp = 0;
        vector<long long> out;
        for (const string& command : commands) {
            stringstream reader(command);
            string op;
            reader >> op;
            if (op == "put") {
                long long key, value;
                reader >> key >> value;
                if (capacity == 0) continue;
                if (!box.count(key) && (int)box.size() == capacity) {
                    long long victim = box.begin()->first;
                    for (const auto& entry : box) if (entry.second.second < box[victim].second) victim = entry.first;
                    box.erase(victim);
                }
                box[key] = {value, ++stamp};
            } else {
                long long key;
                reader >> key;
                if (!box.count(key)) out.push_back(-1);
                else {
                    out.push_back(box[key].first);
                    box[key].second = ++stamp;
                }
            }
        }
        return out;
    }`,
    expectedTime: "O(commands * capacity)",
    expectedSpace: "O(capacity)",
    hints: [
      "Every get and every successful put changes which key is the least recently used. A plain map can store the values, but it does not remember that order by itself.",
      "Store each key with the value and a timestamp. A get or a put of an existing key refreshes the timestamp. A new key does too.",
      "When the cache is full and the key is new, erase the key with the oldest timestamp before inserting. Capacity 0 ignores every put.",
      "A hash map plus a doubly linked list of keys, with the most recent key at one end, does the same eviction in constant time. The timestamp scan is enough for these command limits.",
    ],
    tests: [
      {
        input: { capacity: 2, commands: ["put 1 1", "put 2 2", "get 1", "put 3 3", "get 2", "put 4 4", "get 1", "get 3", "get 4"] },
        expectedOutput: [1, -1, -1, 3, 4],
        visibility: "SAMPLE",
      },
      { input: { capacity: 0, commands: ["get 1", "put 1 1", "get 1"] }, expectedOutput: [-1, -1], visibility: "SAMPLE" },
      { input: { capacity: 1, commands: ["put 1 -5", "get 1", "put 2 8", "get 1", "get 2"] }, expectedOutput: [-5, -1, 8], visibility: "HIDDEN" },
      { input: { capacity: 2, commands: ["put 1 1", "put 1 9", "get 1"] }, expectedOutput: [9], visibility: "HIDDEN" },
    ],
  }),
  problem({
    slug: "lfu-cache",
    title: "LFU Cache",
    difficulty: "HARD",
    topics: ["stacks-queues"],
    tags: ["design"],
    statement:
      "Run a cache that holds at most capacity keys. get key returns the stored value, or -1 when the key is absent, and counts as one use. put key value stores the value. If the key was already present, replace its value and count one use. If a new key would exceed capacity, evict the least frequently used key. When several keys share that lowest frequency, evict the one that was used least recently. A new key starts with frequency 1. A capacity of 0 stores nothing. Return the results of every get, in order.",
    constraints: ["0 <= capacity <= 1000", "0 <= commands.length <= 1000", "Keys are integers from 0 to 1e9.", "Values are integers from -1e9 to 1e9."],
    examples: [
      {
        input: 'capacity = 2, commands = ["put 1 1", "put 2 2", "get 1", "put 3 3", "get 2", "get 3", "put 4 4", "get 1", "get 3", "get 4"]',
        output: "[1, -1, 3, -1, 3, 4]",
        explanation: "Key 2 is the least frequent key when 3 arrives. Later, keys 1 and 3 are tied, and 1 was used earlier, so 4 evicts 1.",
      },
      { input: 'capacity = 2, commands = ["put 1 1", "put 2 2", "put 3 3", "get 1", "get 2", "get 3"]', output: "[-1, 2, 3]" },
    ],
    signature: "vector<long long> lfuCache(int capacity, vector<string>& commands)",
    functionName: "lfuCache",
    driver: commandOut("sol.lfuCache((int)in[\"capacity\"].asInt(), commands)"),
    method: `vector<long long> lfuCache(int capacity, vector<string>& commands) {
        struct Entry { long long value; int freq; int stamp; };
        unordered_map<long long, Entry> box;
        int stamp = 0;
        vector<long long> out;
        for (const string& command : commands) {
            stringstream reader(command);
            string op;
            reader >> op;
            if (op == "put") {
                long long key, value;
                reader >> key >> value;
                if (capacity == 0) continue;
                if (box.count(key)) {
                    box[key].value = value;
                    box[key].freq += 1;
                    box[key].stamp = ++stamp;
                    continue;
                }
                if ((int)box.size() == capacity) {
                    long long victim = box.begin()->first;
                    for (const auto& item : box) {
                        const Entry& best = box[victim];
                        if (item.second.freq < best.freq || (item.second.freq == best.freq && item.second.stamp < best.stamp)) victim = item.first;
                    }
                    box.erase(victim);
                }
                box[key] = {value, 1, ++stamp};
            } else {
                long long key;
                reader >> key;
                if (!box.count(key)) out.push_back(-1);
                else {
                    out.push_back(box[key].value);
                    box[key].freq += 1;
                    box[key].stamp = ++stamp;
                }
            }
        }
        return out;
    }`,
    expectedTime: "O(commands * capacity)",
    expectedSpace: "O(capacity)",
    hints: [
      "Frequency and recency are different. Evict the lowest frequency first, and use recency only to break a tie.",
      "Store value, frequency, and a timestamp for each key. get and an update of an existing key both increase the frequency and refresh the timestamp.",
      "A brand-new key starts at frequency 1. When the cache is full, erase the entry with the smallest frequency, and among those the smallest timestamp, before inserting.",
      "Capacity 0 ignores puts. A map from frequency to a recency list of keys can evict in constant time; scanning the stored entries is enough here.",
    ],
    tests: [
      {
        input: {
          capacity: 2,
          commands: ["put 1 1", "put 2 2", "get 1", "put 3 3", "get 2", "get 3", "put 4 4", "get 1", "get 3", "get 4"],
        },
        expectedOutput: [1, -1, 3, -1, 3, 4],
        visibility: "SAMPLE",
      },
      { input: { capacity: 2, commands: ["put 1 1", "put 2 2", "put 3 3", "get 1", "get 2", "get 3"] }, expectedOutput: [-1, 2, 3], visibility: "SAMPLE" },
      { input: { capacity: 0, commands: ["put 1 1", "get 1"] }, expectedOutput: [-1], visibility: "HIDDEN" },
      { input: { capacity: 1, commands: ["put 1 1", "get 1", "put 2 2", "get 1", "get 2"] }, expectedOutput: [1, -1, 2], visibility: "HIDDEN" },
    ],
  }),
];
