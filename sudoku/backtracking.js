import { shuffle } from './utils.js'

const isFilled = (board) => {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board.length; j++) {
			if (board[i][j] === 0) return false
		}
	}
	return true
}

const isValid = (board) => {
	const sqrt = Math.sqrt(board.length)
	for (let i = 0; i < board.length; i++) {
		const rowSet = new Set()
		const colSet = new Set()
		const boxSet = new Set()
		for (let j = 0; j < board.length; j++) {
			const rowVal = board[i][j]
			const colVal = board[j][i]
			const boxVal =
				board[Math.floor(i / sqrt) * sqrt + Math.floor(j / sqrt)][
					(i % sqrt) * sqrt + (j % sqrt)
				]

			if (rowVal !== 0) {
				if (rowSet.has(rowVal)) return false
				rowSet.add(rowVal)
			}

			if (colVal !== 0) {
				if (colSet.has(colVal)) return false
				colSet.add(colVal)
			}

			if (boxVal !== 0) {
				if (boxSet.has(boxVal)) return false
				boxSet.add(boxVal)
			}
		}
	}
	return true
}

const findEmptyCell = (board) => {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board.length; j++) {
			if (board[i][j] === 0) return [i, j]
		}
	}
}

const validNumbers = (board, x, y) => {
	const valid = new Set(Array.from({ length: board.length }, (_, i) => i + 1))
	const sqrt = Math.sqrt(board.length)

	for (let i = 0; i < board.length; i++) {
		valid.delete(board[x][i]) // Row
		valid.delete(board[i][y]) // Column
		valid.delete(
			board[Math.floor(x / sqrt) * sqrt + Math.floor(i / sqrt)][
				Math.floor(y / sqrt) * sqrt + (i % sqrt)
			],
		) // Box
	}

	return Array.from(valid)
}

const backtracking = function (board) {
	// Stop condition
	if (!isValid(board)) return false
	if (isFilled(board)) return true

	const [x, y] = findEmptyCell(board)

	let randNumbers = shuffle(validNumbers(board, x, y))

	for (const number of randNumbers) {
		board[x][y] = number
		if (backtracking(board)) return true
		board[x][y] = 0
	}

	return false
}

const countSolutions = (board, count = 0) => {
	if (!isValid(board)) return 0
	if (isFilled(board)) return 1

	const [x, y] = findEmptyCell(board)
	for (const number of validNumbers(board, x, y)) {
		board[x][y] = number
		count += countSolutions(board, count)
		board[x][y] = 0
	}

	return count
}

export { countSolutions, backtracking, isValid }
