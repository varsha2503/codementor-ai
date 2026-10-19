#include "support.hpp"
#include <cassert>
#include <iostream>

int main() {
  Json input = Json::parse(R"({"nums":[2,7,11],"target":9,"ok":true,"name":"a\"b","empty":[]})");
  assert(input["nums"].asIntVector() == std::vector<int>({2, 7, 11}));
  assert(input["target"].asInt() == 9);
  assert(input["ok"].asBool());
  assert(input["name"].asString() == "a\"b");
  assert(input["empty"].asIntVector().empty());

  Json treeJson = Json::parse(R"([3,9,20,null,null,15,7])");
  TreeNode* root = buildTree(treeJson);
  assert(root && root->val == 3);
  assert(root->left && root->left->val == 9 && root->left->left == nullptr);
  assert(root->right && root->right->left && root->right->left->val == 15);
  assert(buildTree(Json::parse("[]")) == nullptr);

  ListNode* list = buildList(Json::parse("[1,4,3,2,5]"));
  assert(listToJson(list).dump() == "[1,4,3,2,5]");

  ListNode* cycle = buildCyclicList(Json::parse("[1,2,3]"), 1);
  assert(cycle && cycle->next && cycle->next->next && cycle->next->next->next == cycle->next);

  assert(Json::ints({4, 5, 1}).dump() == "[4,5,1]");
  assert(Json::boolean(false).dump() == "false");
  std::cout << "support ok\n";
}
