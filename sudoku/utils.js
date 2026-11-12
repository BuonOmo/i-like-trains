// Percentage of cells to remove from the board.
export const DIFFICULTY =
	parseFloat(new URLSearchParams(window.location.search).get('d')) || 0.25

// Random seed can be set.
let seed =
	parseInt(new URLSearchParams(window.location.search).get('s')) ||
	Math.floor(Math.random() * 0xffffffff)

console.debug(
	`Using seed: ${seed}, difficulty: ${DIFFICULTY}\n` +
		` Generated URL:\n` +
		`${window.location.href.split('?')[0]}?s=${seed}&d=${DIFFICULTY}`,
)

export const rand = () => {
	let t = (seed += 0x6d2b79f5)
	t = Math.imul(t ^ (t >>> 15), t | 1)
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const shuffle = (ary) => ary.sort(() => rand() - 0.5)

export function* nav(board) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board.length; j++) {
			yield [i, j]
		}
	}
}

export const divmod = (x, y) => [Math.floor(x / y), x % y]
