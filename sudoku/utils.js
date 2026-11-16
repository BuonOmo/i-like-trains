// Number of cells to remove from the board.
export const DIFFICULTY =
	parseInt(new URLSearchParams(window.location.search).get('d')) || 8

// Random seed can be set.
export let SEED =
	parseInt(new URLSearchParams(window.location.search).get('s')) ||
	Math.floor(Math.random() * 0xffffffff)

console.debug(
	`Using seed: ${SEED}, difficulty: ${DIFFICULTY}\n` +
		` Generated URL:\n` +
		`${window.location.href.split('?')[0]}?s=${SEED}&d=${DIFFICULTY}`,
)

export function* nav(board) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board.length; j++) {
			yield [i, j]
		}
	}
}

export const divmod = (x, y) => [Math.floor(x / y), x % y]
