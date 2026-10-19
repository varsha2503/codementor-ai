import type { SubmissionLanguage } from "./types.js";

function extractSignature(cppStarter: string): string | null {
  const match = cppStarter.match(/public:\s*\n\s*([\s\S]+?\))\s*\{/);
  if (!match?.[1]) return null;
  return match[1].replace(/\s+/g, " ").trim();
}

function cppTypeToPython(cppType: string): string {
  const t = cppType.trim();
  if (t === "int" || t === "long" || t === "long long") return "int";
  if (t === "bool") return "bool";
  if (t === "string") return "str";
  if (t === "void") return "None";
  if (t.startsWith("vector<vector<int>>") || t.startsWith("vector<vector<long long>>")) return "List[List[int]]";
  if (t.startsWith("vector<int>") || t.startsWith("vector<long long>")) return "List[int]";
  if (t.startsWith("vector<string>")) return "List[str]";
  return "Any";
}

function cppTypeToJava(cppType: string): string {
  const t = cppType.trim();
  if (t === "int") return "int";
  if (t === "long" || t === "long long") return "long";
  if (t === "bool") return "boolean";
  if (t === "string") return "String";
  if (t === "void") return "void";
  if (t.startsWith("vector<vector<int>>") || t.startsWith("vector<vector<long long>>")) return "List<List<Integer>>";
  if (t.startsWith("vector<int>") || t.startsWith("vector<long long>")) return "List<Integer>";
  if (t.startsWith("vector<string>")) return "List<String>";
  return "Object";
}

function parseParams(signature: string): { name: string; cppType: string }[] {
  const open = signature.indexOf("(");
  const close = signature.lastIndexOf(")");
  if (open < 0 || close < open) return [];
  const inside = signature.slice(open + 1, close).trim();
  if (!inside) return [];
  return inside.split(",").map((part) => {
    const bits = part.trim().split(/\s+/);
    const name = bits.pop() ?? "arg";
    const cppType = bits.join(" ");
    return { name, cppType };
  });
}

function returnType(signature: string): string {
  const open = signature.indexOf("(");
  if (open < 0) return "void";
  return signature.slice(0, open).replace(/^.*\s+/, "").trim();
}

export function starterFromCpp(cppStarter: string, language: SubmissionLanguage): string | null {
  const signature = extractSignature(cppStarter);
  if (!signature) return null;
  const methodName = signature.match(/(\w+)\s*\(/)?.[1];
  if (!methodName) return null;
  const params = parseParams(signature);
  const ret = returnType(signature);

  if (language === "python3") {
    const pyParams = params.map((p) => `${p.name}: ${cppTypeToPython(p.cppType)}`).join(", ");
    const pyRet = ret === "void" ? "None" : cppTypeToPython(ret);
    const retAnn = ret === "void" ? " -> None" : ` -> ${pyRet}`;
    return `class Solution:\n    def ${methodName}(self${pyParams ? `, ${pyParams}` : ""})${retAnn}:\n        pass\n`;
  }

  if (language === "java") {
    const jParams = params.map((p) => `${cppTypeToJava(p.cppType)} ${p.name}`).join(", ");
    const jRet = cppTypeToJava(ret);
    return `class Solution {\n    public ${jRet} ${methodName}(${jParams}) {\n        \n    }\n}\n`;
  }

  return null;
}
