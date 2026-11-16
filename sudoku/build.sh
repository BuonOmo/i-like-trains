# This script should be used in a pre-commit hook to make
# sure every change of `algo.c` is followed by a change
# of related files. This could be done this way:
#
# 	set -e
#
# 	if git ls-files --error-unmatch sudoku/algo.c >/dev/null; then
# 		./sudoku/build.sh
# 		git add sudoku/algo.js
# 		git add sudoku/algo.wasm
# 	fi

script_dir="$(dirname "$(readlink -f "$0")")"
emcc "$script_dir/algo.c" -O2 -o "$script_dir/algo.js" \
	-s MODULARIZE=1 \
	-s EXPORT_ES6=1 \
	-s EXPORTED_FUNCTIONS=_generate_board,_is_valid_placement,_is_valid,_malloc,_free \
	-s EXPORTED_RUNTIME_METHODS=getValue,setValue \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s ENVIRONMENT=web
