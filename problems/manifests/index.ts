import { arrayProblems } from "./arrays.js";
import { bstProblems } from "./bst.js";
import { bitProblems } from "./bits.js";
import { greedyProblems } from "./greedy.js";
import { heapProblems } from "./heaps.js";
import { stackProblems } from "./stacks.js";
import { arrayCoreProblems } from "./arrays-core.js";
import { arrayRestProblems } from "./arrays-rest.js";
import { basicProblems } from "./basics.js";
import { languageBasicsProblems } from "./language-basics.js";
import { patternProblems } from "./patterns.js";
import { sortingProblems } from "./sorting.js";
import { dpCoreProblems } from "./dp-core.js";
import { dpProblems } from "./dp.js";
import { dpSeqProblems } from "./dp-seq.js";
import { dpTextProblems } from "./dp-text.js";
import { graphCoreProblems } from "./graphs-core.js";
import { graphProblems } from "./graphs.js";
import { graphMoreProblems } from "./graphs-more.js";
import { listCoreProblems } from "./lists-core.js";
import { listProblems } from "./lists.js";
import { recursionProblems } from "./recursion.js";
import { searchCoreProblems } from "./search-core.js";
import { searchRestProblems } from "./search-rest.js";
import { stringCoreProblems } from "./strings-core.js";
import { stringRestProblems } from "./strings-rest.js";
import { stringProblems, searchProblems } from "./strings.js";
import { trieProblems } from "./tries.js";
import { windowProblems } from "./windows.js";
import { treeCoreProblems } from "./trees-core.js";
import { treeProblems } from "./trees.js";

export const problems = [
  ...basicProblems,
  ...languageBasicsProblems,
  ...patternProblems,
  ...arrayProblems,
  ...arrayCoreProblems,
  ...arrayRestProblems,
  ...sortingProblems,
  ...stringProblems,
  ...stringCoreProblems,
  ...stringRestProblems,
  ...searchProblems,
  ...searchCoreProblems,
  ...searchRestProblems,
  ...listProblems,
  ...listCoreProblems,
  ...recursionProblems,
  ...bitProblems,
  ...stackProblems,
  ...heapProblems,
  ...greedyProblems,
  ...treeProblems,
  ...treeCoreProblems,
  ...bstProblems,
  ...graphProblems,
  ...graphCoreProblems,
  ...graphMoreProblems,
  ...dpProblems,
  ...dpCoreProblems,
  ...dpTextProblems,
  ...dpSeqProblems,
  ...trieProblems,
  ...windowProblems,
];
