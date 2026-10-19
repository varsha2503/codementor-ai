#pragma once

#include <cctype>
#include <cstdint>
#include <iostream>
#include <map>
#include <queue>
#include <sstream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct ListNode {
  int val;
  ListNode* next;
  ListNode() : val(0), next(nullptr) {}
  ListNode(int x) : val(x), next(nullptr) {}
  ListNode(int x, ListNode* next) : val(x), next(next) {}
};

struct DoublyNode {
  int val;
  DoublyNode* next;
  DoublyNode* prev;
  DoublyNode() : val(0), next(nullptr), prev(nullptr) {}
  DoublyNode(int x) : val(x), next(nullptr), prev(nullptr) {}
};

struct ChildNode {
  int val;
  ChildNode* next;
  ChildNode* bottom;
  ChildNode() : val(0), next(nullptr), bottom(nullptr) {}
  ChildNode(int x) : val(x), next(nullptr), bottom(nullptr) {}
};

struct RandomNode {
  int val;
  RandomNode* next;
  RandomNode* random;
  RandomNode() : val(0), next(nullptr), random(nullptr) {}
  RandomNode(int x) : val(x), next(nullptr), random(nullptr) {}
};

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  TreeNode() : val(0), left(nullptr), right(nullptr) {}
  TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
  TreeNode(int x, TreeNode* left, TreeNode* right) : val(x), left(left), right(right) {}
};

struct Json {
  enum Type { NUL, BOOL, NUM, STR, ARR, OBJ };
  Type type = NUL;
  bool b = false;
  long long n = 0;
  std::string s;
  std::vector<Json> a;
  std::map<std::string, Json> o;

  bool isNull() const { return type == NUL; }

  const Json& operator[](const std::string& key) const {
    if (type != OBJ) throw std::runtime_error("expected an object");
    auto it = o.find(key);
    if (it == o.end()) throw std::runtime_error("missing key: " + key);
    return it->second;
  }

  long long asInt() const {
    if (type != NUM) throw std::runtime_error("expected a number");
    return n;
  }

  bool asBool() const {
    if (type != BOOL) throw std::runtime_error("expected a boolean");
    return b;
  }

  const std::string& asString() const {
    if (type != STR) throw std::runtime_error("expected a string");
    return s;
  }

  std::vector<int> asIntVector() const {
    if (type != ARR) throw std::runtime_error("expected an array");
    std::vector<int> out;
    out.reserve(a.size());
    for (const auto& item : a) {
      long long value = item.asInt();
      if (value < INT32_MIN || value > INT32_MAX) throw std::runtime_error("integer out of range");
      out.push_back(static_cast<int>(value));
    }
    return out;
  }

  std::vector<std::string> asStrings() const {
    if (type != ARR) throw std::runtime_error("expected an array");
    std::vector<std::string> out;
    for (const auto& item : a) out.push_back(item.asString());
    return out;
  }

  std::vector<std::vector<int>> asIntMatrix() const {
    if (type != ARR) throw std::runtime_error("expected a matrix");
    std::vector<std::vector<int>> out;
    for (const auto& row : a) out.push_back(row.asIntVector());
    return out;
  }

  static Json nul() {
    Json json;
    json.type = NUL;
    return json;
  }

  static Json boolean(bool value) {
    Json json;
    json.type = BOOL;
    json.b = value;
    return json;
  }

  static Json number(long long value) {
    Json json;
    json.type = NUM;
    json.n = value;
    return json;
  }

  static Json text(std::string value) {
    Json json;
    json.type = STR;
    json.s = std::move(value);
    return json;
  }

  static Json ints(const std::vector<int>& values) {
    Json json;
    json.type = ARR;
    for (int value : values) json.a.push_back(number(value));
    return json;
  }

  static std::string escape(const std::string& value) {
    std::string out;
    for (unsigned char ch : value) {
      switch (ch) {
        case '"': out += "\\\""; break;
        case '\\': out += "\\\\"; break;
        case '\n': out += "\\n"; break;
        case '\r': out += "\\r"; break;
        case '\t': out += "\\t"; break;
        default:
          if (ch < 0x20) {
            const char* hex = "0123456789abcdef";
            out += "\\u00";
            out += hex[ch >> 4];
            out += hex[ch & 15];
          } else {
            out += static_cast<char>(ch);
          }
      }
    }
    return out;
  }

  std::string dump() const {
    switch (type) {
      case NUL: return "null";
      case BOOL: return b ? "true" : "false";
      case NUM: return std::to_string(n);
      case STR: return "\"" + escape(s) + "\"";
      case ARR: {
        std::string out = "[";
        for (size_t i = 0; i < a.size(); ++i) {
          if (i) out += ",";
          out += a[i].dump();
        }
        return out + "]";
      }
      case OBJ: {
        std::string out = "{";
        bool first = true;
        for (const auto& entry : o) {
          if (!first) out += ",";
          first = false;
          out += "\"" + escape(entry.first) + "\":" + entry.second.dump();
        }
        return out + "}";
      }
    }
    return "null";
  }

  static Json parse(const std::string& raw) {
    Parser parser(raw);
    Json value = parser.parseValue(0);
    parser.skip();
    if (parser.i != raw.size()) throw std::runtime_error("trailing data in JSON input");
    return value;
  }

 private:
  struct Parser {
    const std::string& raw;
    size_t i = 0;
    explicit Parser(const std::string& input) : raw(input) {}

    void skip() {
      while (i < raw.size() && std::isspace(static_cast<unsigned char>(raw[i]))) ++i;
    }

    char peek() {
      skip();
      return i < raw.size() ? raw[i] : '\0';
    }

    Json parseValue(int depth) {
      if (depth > 32) throw std::runtime_error("JSON nesting is too deep");
      char ch = peek();
      if (ch == '"') return parseString();
      if (ch == '{') return parseObject(depth);
      if (ch == '[') return parseArray(depth);
      if (ch == 't') return parseLiteral("true", Json::boolean(true));
      if (ch == 'f') return parseLiteral("false", Json::boolean(false));
      if (ch == 'n') return parseLiteral("null", Json::nul());
      if (ch == '-' || std::isdigit(static_cast<unsigned char>(ch))) return parseNumber();
      throw std::runtime_error("invalid JSON value");
    }

    Json parseLiteral(const char* word, Json value) {
      skip();
      for (size_t k = 0; word[k]; ++k) {
        if (i >= raw.size() || raw[i] != word[k]) throw std::runtime_error("invalid literal");
        ++i;
      }
      return value;
    }

    Json parseNumber() {
      skip();
      size_t start = i;
      if (raw[i] == '-') ++i;
      if (i >= raw.size() || !std::isdigit(static_cast<unsigned char>(raw[i]))) {
        throw std::runtime_error("invalid number");
      }
      while (i < raw.size() && std::isdigit(static_cast<unsigned char>(raw[i]))) ++i;
      if (i < raw.size() && (raw[i] == '.' || raw[i] == 'e' || raw[i] == 'E')) {
        throw std::runtime_error("only integers are supported");
      }
      try {
        long long value = std::stoll(raw.substr(start, i - start));
        return Json::number(value);
      } catch (...) {
        throw std::runtime_error("integer out of range");
      }
    }

    Json parseString() {
      skip();
      if (raw[i] != '"') throw std::runtime_error("expected a string");
      ++i;
      std::string out;
      while (i < raw.size()) {
        char ch = raw[i++];
        if (ch == '"') return Json::text(out);
        if (ch == '\\') {
          if (i >= raw.size()) throw std::runtime_error("bad escape");
          char esc = raw[i++];
          switch (esc) {
            case '"':
            case '\\':
            case '/': out.push_back(esc); break;
            case 'b': out.push_back('\b'); break;
            case 'f': out.push_back('\f'); break;
            case 'n': out.push_back('\n'); break;
            case 'r': out.push_back('\r'); break;
            case 't': out.push_back('\t'); break;
            default: throw std::runtime_error("unsupported escape");
          }
        } else {
          out.push_back(ch);
        }
      }
      throw std::runtime_error("unterminated string");
    }

    Json parseArray(int depth) {
      skip();
      ++i;
      Json json;
      json.type = ARR;
      if (peek() == ']') {
        ++i;
        return json;
      }
      while (true) {
        json.a.push_back(parseValue(depth + 1));
        char ch = peek();
        if (ch == ',') {
          ++i;
          continue;
        }
        if (ch == ']') {
          ++i;
          return json;
        }
        throw std::runtime_error("expected ',' or ']'");
      }
    }

    Json parseObject(int depth) {
      skip();
      ++i;
      Json json;
      json.type = OBJ;
      if (peek() == '}') {
        ++i;
        return json;
      }
      while (true) {
        Json key = parseString();
        if (peek() != ':') throw std::runtime_error("expected ':'");
        ++i;
        json.o[key.s] = parseValue(depth + 1);
        char ch = peek();
        if (ch == ',') {
          ++i;
          continue;
        }
        if (ch == '}') {
          ++i;
          return json;
        }
        throw std::runtime_error("expected ',' or '}'");
      }
    }
  };
};

inline void printJson(const Json& value) { std::cout << value.dump() << "\n"; }

inline std::string readAll() {
  std::ostringstream buffer;
  buffer << std::cin.rdbuf();
  return buffer.str();
}

inline ListNode* buildList(const Json& value) {
  ListNode dummy;
  ListNode* tail = &dummy;
  for (int item : value.asIntVector()) {
    tail->next = new ListNode(item);
    tail = tail->next;
  }
  return dummy.next;
}

inline Json listToJson(ListNode* head) {
  Json json;
  json.type = Json::ARR;
  int guard = 0;
  while (head) {
    if (++guard > 10000) throw std::runtime_error("list walked past the safety limit");
    json.a.push_back(Json::number(head->val));
    head = head->next;
  }
  return json;
}

inline ListNode* buildCyclicList(const Json& values, int pos) {
  auto nums = values.asIntVector();
  if (nums.empty()) return nullptr;
  std::vector<ListNode*> nodes;
  nodes.reserve(nums.size());
  for (int value : nums) nodes.push_back(new ListNode(value));
  for (size_t index = 0; index + 1 < nodes.size(); ++index) nodes[index]->next = nodes[index + 1];
  if (pos >= 0 && pos < static_cast<int>(nodes.size())) nodes.back()->next = nodes[pos];
  return nodes[0];
}

inline DoublyNode* buildDoubly(const Json& value) {
  DoublyNode* head = nullptr;
  DoublyNode* tail = nullptr;
  for (int item : value.asIntVector()) {
    auto* node = new DoublyNode(item);
    node->prev = tail;
    if (tail) tail->next = node;
    else head = node;
    tail = node;
  }
  return head;
}

inline Json doublyToJson(DoublyNode* head) {
  Json json;
  json.type = Json::ARR;
  DoublyNode* prev = nullptr;
  int guard = 0;
  for (DoublyNode* node = head; node; node = node->next) {
    if (++guard > 10000) throw std::runtime_error("list walked past the safety limit");
    if (node->prev != prev) throw std::runtime_error("doubly linked prev pointer is wrong");
    json.a.push_back(Json::number(node->val));
    prev = node;
  }
  return json;
}

inline void buildY(const Json& prefixA, const Json& prefixB, const Json& shared, ListNode*& left, ListNode*& right) {
  ListNode* sharedHead = buildList(shared);
  auto glue = [&](const Json& prefix) -> ListNode* {
    ListNode* head = buildList(prefix);
    if (!head) return sharedHead;
    ListNode* tail = head;
    while (tail->next) tail = tail->next;
    tail->next = sharedHead;
    return head;
  };
  left = glue(prefixA);
  right = glue(prefixB);
}

inline ChildNode* buildColumns(const Json& rows) {
  if (rows.type != Json::ARR) throw std::runtime_error("expected columns");
  ChildNode* head = nullptr;
  ChildNode* prevCol = nullptr;
  for (const auto& row : rows.a) {
    ChildNode* col = nullptr;
    ChildNode* tail = nullptr;
    for (int value : row.asIntVector()) {
      auto* node = new ChildNode(value);
      if (!col) col = node;
      else tail->bottom = node;
      tail = node;
    }
    if (!col) throw std::runtime_error("empty column");
    if (!head) head = col;
    else prevCol->next = col;
    prevCol = col;
  }
  return head;
}

inline Json bottomToJson(ChildNode* head) {
  Json json;
  json.type = Json::ARR;
  int guard = 0;
  for (ChildNode* node = head; node; node = node->bottom) {
    if (++guard > 10000) throw std::runtime_error("list walked past the safety limit");
    if (node->next) throw std::runtime_error("flattened node still has a next pointer");
    json.a.push_back(Json::number(node->val));
  }
  return json;
}

inline RandomNode* buildRandom(const Json& nodes) {
  if (nodes.type != Json::ARR) throw std::runtime_error("expected an array");
  std::vector<RandomNode*> built;
  built.reserve(nodes.a.size());
  for (const auto& item : nodes.a) {
    if (item.type != Json::ARR || item.a.size() != 2) throw std::runtime_error("expected value and random index");
    built.push_back(new RandomNode(static_cast<int>(item.a[0].asInt())));
  }
  for (size_t index = 0; index < built.size(); ++index) {
    if (index + 1 < built.size()) built[index]->next = built[index + 1];
    long long randomIndex = nodes.a[index].a[1].asInt();
    if (randomIndex >= 0) {
      if (randomIndex >= static_cast<long long>(built.size())) throw std::runtime_error("random index out of range");
      built[index]->random = built[static_cast<size_t>(randomIndex)];
    }
  }
  return built.empty() ? nullptr : built[0];
}

inline Json randomToJson(RandomNode* head, RandomNode* original) {
  std::vector<RandomNode*> source;
  for (RandomNode* node = original; node; node = node->next) {
    if (source.size() > 10000) throw std::runtime_error("list walked past the safety limit");
    source.push_back(node);
  }
  std::vector<RandomNode*> copy;
  for (RandomNode* node = head; node; node = node->next) {
    if (copy.size() > 10000) throw std::runtime_error("list walked past the safety limit");
    for (RandomNode* prior : source) {
      if (node == prior) throw std::runtime_error("copy reuses an original node");
    }
    copy.push_back(node);
  }
  Json json;
  json.type = Json::ARR;
  for (RandomNode* node : copy) {
    int index = -1;
    if (node->random) {
      for (RandomNode* prior : source) {
        if (node->random == prior) throw std::runtime_error("random points at an original node");
      }
      for (size_t slot = 0; slot < copy.size(); ++slot) {
        if (copy[slot] == node->random) index = static_cast<int>(slot);
      }
      if (index < 0) throw std::runtime_error("random points outside the copy");
    }
    Json pair;
    pair.type = Json::ARR;
    pair.a.push_back(Json::number(node->val));
    pair.a.push_back(Json::number(index));
    json.a.push_back(std::move(pair));
  }
  return json;
}

inline TreeNode* buildTree(const Json& value) {
  if (value.isNull() || value.type != Json::ARR || value.a.empty() || value.a[0].isNull()) return nullptr;
  std::queue<TreeNode*> pending;
  TreeNode* root = new TreeNode(static_cast<int>(value.a[0].asInt()));
  pending.push(root);
  size_t index = 1;
  while (!pending.empty() && index < value.a.size()) {
    TreeNode* node = pending.front();
    pending.pop();
    if (index < value.a.size() && !value.a[index].isNull()) {
      node->left = new TreeNode(static_cast<int>(value.a[index].asInt()));
      pending.push(node->left);
    }
    ++index;
    if (index < value.a.size() && !value.a[index].isNull()) {
      node->right = new TreeNode(static_cast<int>(value.a[index].asInt()));
      pending.push(node->right);
    }
    ++index;
  }
  return root;
}
