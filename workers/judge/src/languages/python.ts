export const PYTHON_COMPILE = "python3 -m py_compile /src/solution.py /src/main.py > /out/compile.out 2>&1";

export function pythonMainSource(driverCode: string): string {
  const indented = driverCode
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n    ");
  return `# Generated main\nimport json\nimport sys\n\nfrom support import print_json, read_input\nfrom solution import Solution\n\n\ndef main() -> None:\n    in_ = read_input()\n    sol = Solution()\n    ${indented}\n\n\nif __name__ == "__main__":\n    try:\n        main()\n    except Exception as ex:\n        print(str(ex), file=sys.stderr)\n        sys.exit(3)\n`;
}

export function buildPythonScript(timeLimitSec: number, cpuSeconds: number): string {
  return `#!/bin/sh
ulimit -t ${cpuSeconds} || true
ulimit -f 65536 || true
ulimit -n 64 || true
ulimit -u 64 || true
export PYTHONDONTWRITEBYTECODE=1
export PYTHONPYCACHEPREFIX=/tmp/pycache
${PYTHON_COMPILE}
echo $? > /out/compile.code
if [ "$(cat /out/compile.code)" != "0" ]; then
  exit 0
fi
i=0
while [ -f "/src/tests/$i.in" ]; do
  /usr/bin/time -o "/out/$i.meta" -f "%e %M" timeout -k 1s ${timeLimitSec}s python3 /src/main.py < "/src/tests/$i.in" > "/out/$i.out" 2> "/out/$i.err"
  echo $? > "/out/$i.code"
  i=$((i + 1))
done
`;
}
