import type { SubmissionLanguage } from "./types.js";

function replaceInputAccess(expr: string, language: SubmissionLanguage): string {
  let out = expr;
  out = out.replace(
    /\(int\)in\["([^"]+)"\]\.asInt\(\)/g,
    language === "java" ? 'Support.getInt(in, "$1")' : 'in_["$1"]',
  );
  out = out.replace(/in\["([^"]+)"\]\.asInt\(\)/g, language === "java" ? 'Support.getInt(in, "$1")' : 'in_["$1"]');
  out = out.replace(
    /in\["([^"]+)"\]\.asIntVector\(\)/g,
    language === "java" ? 'Support.getIntList(in, "$1")' : 'in_["$1"]',
  );
  out = out.replace(
    /in\["([^"]+)"\]\.asString\(\)/g,
    language === "java" ? 'Support.getString(in, "$1")' : 'in_["$1"]',
  );
  out = out.replace(/\(int\)in\["([^"]+)"\]/g, language === "java" ? 'Support.getInt(in, "$1")' : 'in_["$1"]');
  return out;
}

function translateCallLine(line: string, language: SubmissionLanguage): string | null {
  const trimmed = line.trim().replace(/;$/, "");
  let m = trimmed.match(/^printJson\(Json::number\((.+)\)\)$/);
  if (m) {
    const arg = replaceInputAccess(m[1]!, language);
    return language === "java" ? `Support.printJson(${arg});` : `print_json(${arg})`;
  }
  m = trimmed.match(/^printJson\(Json::boolean\((.+)\)\)$/);
  if (m) {
    const arg = replaceInputAccess(m[1]!, language);
    return language === "java" ? `Support.printJson(${arg});` : `print_json(${arg})`;
  }
  m = trimmed.match(/^printJson\(Json::text\((.+)\)\)$/);
  if (m) {
    const arg = replaceInputAccess(m[1]!, language);
    return language === "java" ? `Support.printJson(${arg});` : `print_json(${arg})`;
  }

  m = trimmed.match(/^auto values = (.+);$/);
  if (m && trimmed.includes("numbersOut")) return null;
  if (trimmed.startsWith("auto values = ")) {
    const call = replaceInputAccess(trimmed.replace(/^auto values = /, "").replace(/;$/, ""), language);
    if (language === "java") return `Support.printJson(${call});`;
    return `print_json(${call})`;
  }

  m = trimmed.match(/^auto rows = (.+);$/);
  if (m) {
    const call = replaceInputAccess(m[1]!.replace(/;$/, ""), language);
    if (language === "java") return `Support.printJson(${call});`;
    return `print_json(${call})`;
  }

  if (trimmed.includes("Json out") || trimmed.includes("printJson(out)")) {
    const valuesMatch = trimmed.match(/auto values = (.+);/);
    if (valuesMatch) {
      const call = replaceInputAccess(valuesMatch[1]!, language);
      return language === "java" ? `Support.printJson(${call});` : `print_json(${call})`;
    }
  }

  const multi = trimmed.split("\n").map((l) => l.trim());
  if (multi.length >= 2 && multi[0]?.startsWith("auto nums = in[")) {
    const numsLine = replaceInputAccess(multi[0].replace(/;$/, ""), language);
    const callLine = multi.find((l) => l.includes("sol.") && l.includes("("));
    if (!callLine) return null;
    const call = callLine.match(/(sol\.\w+\([^)]*\))/)?.[1];
    if (!call) return null;
    const fixed = replaceInputAccess(call.replace("nums", language === "java" ? "nums" : "nums"), language);
    if (language === "java") {
      return `${numsLine.replace("auto ", "var ")};\n        Support.printJson(${fixed});`;
    }
    return `${numsLine.replace("auto ", "")}\n        ${`print_json(${fixed})`}`;
  }

  if (/^auto nums = /.test(trimmed)) {
    const rhs = replaceInputAccess(trimmed.replace(/^auto nums = /, "").replace(/;$/, ""), language);
    if (language === "java") return `var nums = ${rhs};`;
    return `nums = ${rhs}`;
  }

  if (trimmed.startsWith("printJson(")) {
    return null;
  }
  return null;
}

function expandNumbersOut(driverCode: string): string {
  return driverCode.replace(/numbersOut\("((?:\\.|[^"\\])*)"\)/g, (_full, call: string) => {
    const unescaped = call.replace(/\\"/g, '"');
    return `auto values = ${unescaped};\n    Json out;\n    out.type = Json::ARR;\n    for (long long value : values) out.a.push_back(Json::number(value));\n    printJson(out);`;
  });
}

function expandRowsOut(driverCode: string): string {
  return driverCode.replace(/rowsOut\("((?:\\.|[^"\\])*)"\)/g, (_full, call: string) => {
    const unescaped = call.replace(/\\"/g, '"');
    return `auto rows = ${unescaped};\n    Json out;\n    out.type = Json::ARR;\n    for (const auto& row : rows) out.a.push_back(Json::ints(row));\n    printJson(out);`;
  });
}

/** Expand numbersOut / rowsOut helpers embedded in manifest drivers. */
function normalizeDriver(driverCode: string): string {
  let d = driverCode.trim();
  d = expandNumbersOut(d);
  d = expandRowsOut(d);
  return d;
}

export function translateDriver(cppDriver: string, language: SubmissionLanguage): string | null {
  if (language === "cpp") return cppDriver;
  const normalized = normalizeDriver(cppDriver.trim());

  if (normalized.includes("for (") && normalized.includes("out.a.push_back")) {
    const values = normalized.match(/auto values = (.+);/)?.[1];
    if (values) {
      const call = replaceInputAccess(values, language);
      return language === "java" ? `Support.printJson(${call});` : `print_json(${call})`;
    }
    const rows = normalized.match(/auto rows = (.+);/)?.[1];
    if (rows) {
      const call = replaceInputAccess(rows, language);
      return language === "java" ? `Support.printJson(${call});` : `print_json(${call})`;
    }
  }

  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith("Json ") &&
        !l.startsWith("out.") &&
        !l.startsWith("for (") &&
        l !== "printJson(out);",
    );
  const translated: string[] = [];
  for (const line of lines) {
    if (line.startsWith("auto values = ")) {
      const call = replaceInputAccess(line.replace(/^auto values = /, "").replace(/;$/, ""), language);
      translated.push(language === "java" ? `Support.printJson(${call});` : `print_json(${call})`);
      continue;
    }
    if (line.startsWith("auto rows = ")) {
      const call = replaceInputAccess(line.replace(/^auto rows = /, "").replace(/;$/, ""), language);
      translated.push(language === "java" ? `Support.printJson(${call});` : `print_json(${call})`);
      continue;
    }
    const t = translateCallLine(line, language);
    if (!t) return null;
    translated.push(...t.split("\n"));
  }
  return translated.join("\n        ");
}
