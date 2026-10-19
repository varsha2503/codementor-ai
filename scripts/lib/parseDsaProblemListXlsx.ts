import { execFileSync } from "node:child_process";
import path from "node:path";

export type XlsxSheetRow = {
  problemId: number;
  title: string;
  category: string;
  subcategory: string;
  difficulty: string;
  articleUrl: string | null;
  leetcodeUrl: string | null;
  gfgUrl: string | null;
  videoUrl: string | null;
  tufUrl: string | null;
  editorialUrl: string | null;
};

export type XlsxSheetFile = {
  source: "dsa-problem-lists.xlsx";
  generatedAt: string;
  practiceCount: number;
  items: {
    tufId: number;
    slug: string;
    title: string;
    section: string;
    sectionPath: string[];
    layout: "practice";
    tufDifficulty: string | null;
    leetcodeUrl: string | null;
    gfgUrl: string | null;
    articleUrl: string | null;
    videoUrl: string | null;
    tufUrl: string | null;
    sheetDifficulty: string | null;
  }[];
};

const PYTHON_READER = `
import json, re, sys, zipfile, xml.etree.ElementTree as ET

path = sys.argv[1]

def read_xlsx(path):
    with zipfile.ZipFile(path) as z:
        ss = []
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        for si in root.findall("m:si", ns):
            texts = [t.text or "" for t in si.findall(".//m:t", ns)]
            ss.append("".join(texts))
        sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
        rows = []
        for row in sheet.findall("m:sheetData/m:row", ns):
            cells = []
            for c in row.findall("m:c", ns):
                t = c.get("t")
                v = c.find("m:v", ns)
                if v is None or v.text is None:
                    cells.append("")
                    continue
                val = v.text
                if t == "s":
                    val = ss[int(val)]
                cells.append(val)
            rows.append(cells)
    return rows

def classify_url(url):
    if not url or not url.startswith("http"):
        return None
    if "leetcode.com/problems/" in url:
        return "leetcode"
    if "geeksforgeeks.org/problems/" in url:
        return "gfg"
    if "youtube.com" in url or "youtu.be" in url:
        return "video"
    if "takeuforward.org/plus/dsa/problems" in url:
        return "tuf"
    if "takeuforward.org/" in url:
        return "article"
    return "other"

rows = read_xlsx(path)
header = rows[0]
out = []
for raw in rows[1:]:
    row = dict(zip(header, raw + [""] * (len(header) - len(raw))))
    urls = {"leetcode": None, "gfg": None, "video": None, "article": None, "tuf": None, "editorial": None}
    for key in ["Article", "LeetCode", "YouTube", "TUF Plus", "Editorial"]:
        val = row.get(key, "") or ""
        kind = classify_url(val)
        if kind == "leetcode" and not urls["leetcode"]:
            urls["leetcode"] = val
        elif kind == "gfg" and not urls["gfg"]:
            urls["gfg"] = val
        elif kind == "video" and not urls["video"]:
            urls["video"] = val
        elif kind == "tuf" and not urls["tuf"]:
            urls["tuf"] = val
        elif kind == "article" and not urls["article"]:
            urls["article"] = val
        elif key == "Editorial" and val.startswith("http"):
            urls["editorial"] = val
    try:
        pid = int(row.get("Problem ID") or 0)
    except ValueError:
        continue
    title = (row.get("Problem Name") or "").strip()
    if not title:
        continue
    out.append({
        "problemId": pid,
        "title": title,
        "category": (row.get("Category") or "Other").strip(),
        "subcategory": (row.get("Subcategory") or "Problems").strip(),
        "difficulty": (row.get("Difficulty") or "").strip(),
        "articleUrl": urls["article"],
        "leetcodeUrl": urls["leetcode"],
        "gfgUrl": urls["gfg"],
        "videoUrl": urls["video"],
        "tufUrl": urls["tuf"],
        "editorialUrl": urls["editorial"],
    })
print(json.dumps(out))
`;

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapTufDifficulty(sheetDifficulty: string): string | null {
  const d = sheetDifficulty.toLowerCase();
  if (d === "easy") return "basic";
  if (d === "medium") return "core";
  if (d === "hard") return "advanced";
  return null;
}

export function readDsaProblemListXlsx(xlsxPath: string): XlsxSheetRow[] {
  const abs = path.resolve(xlsxPath);
  const json = execFileSync("python3", ["-c", PYTHON_READER, abs], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  return JSON.parse(json) as XlsxSheetRow[];
}

export function xlsxRowsToSheetFile(rows: XlsxSheetRow[]): XlsxSheetFile {
  const items = rows.map((row) => ({
    tufId: row.problemId,
    slug: titleToSlug(row.title),
    title: row.title,
    section: row.category,
    sectionPath: [row.category, row.subcategory],
    layout: "practice" as const,
    tufDifficulty: mapTufDifficulty(row.difficulty),
    leetcodeUrl: row.leetcodeUrl,
    gfgUrl: row.gfgUrl,
    articleUrl: row.articleUrl,
    videoUrl: row.videoUrl,
    tufUrl: row.tufUrl,
    sheetDifficulty: row.difficulty || null,
  }));
  return {
    source: "dsa-problem-lists.xlsx",
    generatedAt: new Date().toISOString(),
    practiceCount: items.length,
    items,
  };
}
