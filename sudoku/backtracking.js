import { shuffle } from './utils.js'

const test = async (length = 9) => {
	let board = Array.from({ length: length }, () => Array(length).fill(0))
	await sleep()
	show(board)
	console.log('starting backtracking')
	for (const _ of backtracking(board)) {
		await sleep()
		show(board)
	}
}

async function sleep() {
	// If you want no animation but a fast response, just comment that.
	return new Promise(requestAnimationFrame)
}

const show = (board) => {
	const table = document.createElement('table')
	for (let i = 0; i < board.length; i++) {
		const row = document.createElement('tr')
		for (let j = 0; j < board.length; j++) {
			const cell = document.createElement('td')
			cell.textContent = board[i][j] === 0 ? '' : board[i][j]
			row.appendChild(cell)
		}
		table.appendChild(row)
	}
	document.body.innerHTML = ''
	document.body.appendChild(table)
}

const update = (x, y, value) => {
	document.querySelectorAll('tr')[x].querySelectorAll('td')[y].textContent =
		value === 0 ? '' : value
}

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

// TODO: Implement a multi-solutions solver that counts
//   the number of solutions for a given board

export const countSolutions = (board, count = 0) => {
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

export { test, backtracking }
