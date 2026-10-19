export const COMPILE_COMMAND = "g++ -std=c++17 -O2 -pipe -Werror=return-type -I/src -o /tmp/prog /src/main.cpp > /out/compile.out 2>&1";

export function buildScript(timeLimitSec: number, cpuSeconds: number): string {
  return `#!/bin/sh
ulimit -t ${cpuSeconds} || true
ulimit -f 65536 || true
ulimit -n 64 || true
ulimit -u 64 || true
${COMPILE_COMMAND}
echo $? > /out/compile.code
if [ "$(cat /out/compile.code)" != "0" ]; then
  exit 0
fi
i=0
while [ -f "/src/tests/$i.in" ]; do
  /usr/bin/time -o "/out/$i.meta" -f "%e %M" timeout -k 1s ${timeLimitSec}s /tmp/prog < "/src/tests/$i.in" > "/out/$i.out" 2> "/out/$i.err"
  echo $? > "/out/$i.code"
  i=$((i + 1))
done
`;
}

export function mainSource(driverCode: string): string {
  return `#include "support.hpp"
#include "solution.cpp"

int main() {
  std::ios::sync_with_stdio(false);
  std::cin.tie(nullptr);
  try {
    Json in = Json::parse(readAll());
    Solution sol;
    ${driverCode}
  } catch (const std::exception& ex) {
    std::cerr << ex.what() << "\\n";
    return 3;
  }
  return 0;
}
`;
}
