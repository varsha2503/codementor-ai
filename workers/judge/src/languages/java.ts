export const JAVA_COMPILE =
  "javac -encoding UTF-8 -d /tmp/classes /src/Support.java /src/Solution.java /src/Main.java > /out/compile.out 2>&1";

export function javaMainSource(driverCode: string): string {
  const lines = driverCode
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => "        " + line)
    .join("\n");
  return `public class Main {\n    public static void main(String[] args) throws Exception {\n        var in = Support.parseInput(Support.readAll());\n        var sol = new Solution();\n${lines}\n    }\n}\n`;
}

export function buildJavaScript(timeLimitSec: number, cpuSeconds: number): string {
  return `#!/bin/sh
ulimit -t ${cpuSeconds} || true
ulimit -f 65536 || true
ulimit -n 64 || true
ulimit -u 64 || true
mkdir -p /tmp/classes
${JAVA_COMPILE}
echo $? > /out/compile.code
if [ "$(cat /out/compile.code)" != "0" ]; then
  exit 0
fi
i=0
while [ -f "/src/tests/$i.in" ]; do
  /usr/bin/time -o "/out/$i.meta" -f "%e %M" timeout -k 1s ${timeLimitSec}s java -cp /tmp/classes Main < "/src/tests/$i.in" > "/out/$i.out" 2> "/out/$i.err"
  echo $? > "/out/$i.code"
  i=$((i + 1))
done
`;
}
