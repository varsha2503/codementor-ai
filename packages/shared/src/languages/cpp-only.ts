/** Drivers that use C++-only judge helpers cannot run in Python/Java yet. */
const CPP_ONLY_MARKERS = [
  "buildList",
  "buildTree",
  "listToJson",
  "treeToJson",
  "ListNode",
  "TreeNode",
  "DoublyNode",
  "RandomNode",
  "ChildNode",
  "asIntMatrix",
  "asString",
  ".asString()",
  "serialize",
  "deserialize",
];

export function isCppOnlyDriver(driverCode: string): boolean {
  return CPP_ONLY_MARKERS.some((marker) => driverCode.includes(marker));
}
