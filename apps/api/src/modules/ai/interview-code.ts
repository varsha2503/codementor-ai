function stripComments(code: string): string {
  return code.replace(/\/\/[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
}

export function codeLooksLikeStub(code: string): boolean {
  const body = stripComments(code).replace(/\s+/g, " ").trim();
  if (body.length < 50) return true;
  return !/\b(return|for\s*\(|while\s*\(|if\s*\()/.test(body);
}

export function codeDiscussionPrompt(title: string, code: string): string | null {
  const body = stripComments(code);
  if (body.trim().length < 40 || codeLooksLikeStub(code)) return null;
  const titleLower = title.toLowerCase();
  if (/\b(unordered_map|map<|unordered_set|set<|HashMap)/.test(body)) {
    return `I can see a hash-based structure in your editor for "${title}". What does each key represent, and what happens on a duplicate or miss?`;
  }
  if (/for\s*\([^)]*\)[\s\S]{0,400}?for\s*\(/.test(body)) {
    return `Your code uses nested loops on "${title}". What is the inner loop doing per outer step, and is that cost acceptable here?`;
  }
  if (/\bwhile\s*\(/.test(body) && /\bleft|\bright|\blow|\bhigh|\bmid\b/.test(body)) {
    return `This looks like a two-pointer or binary-search style loop. Walk me through one iteration on a small example for "${title}".`;
  }
  if (/\bqueue|stack|deque|priority_queue/.test(body)) {
    return `You are using a container for order — what invariant does it maintain for "${title}", and when do you push versus pop?`;
  }
  if (/\breturn\b[\s\S]{0,200}?\(/.test(body) && (titleLower.includes("recursion") || /\brecurs|dfs\b/i.test(body))) {
    return `Talk through the base case and one recursive step in your function for "${title}" — what shrinks each call?`;
  }
  if (/\bvector|array|\[\]/.test(body) && /sort\s*\(/.test(body)) {
    return `You sort in this solution. What does sorting buy you on "${title}", and what work happens after the sort?`;
  }
  if (/\bdp\[|memo|cache|prev1|prev2/.test(body)) {
    return `I see table or memo-style state. What does one entry mean, and which smaller subproblem does it build on?`;
  }
  return `I am looking at your implementation for "${title}". In your own words, what does the main loop or return path compute before we trust the runner?`;
}
