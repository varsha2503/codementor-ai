import json
import sys

from support import print_json, read_input
from solution import Solution


def main() -> None:
    in_ = read_input()
    sol = Solution()
    __DRIVER__


if __name__ == "__main__":
    try:
        main()
    except Exception as ex:
        print(str(ex), file=sys.stderr)
        sys.exit(3)
