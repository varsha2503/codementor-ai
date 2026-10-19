import json
import sys
from typing import Any, List


def read_input() -> Any:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    return json.loads(raw)


def print_json(value: Any) -> None:
    print(json.dumps(value, separators=(",", ":")))
