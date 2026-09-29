import { backtracking, countSolutions } from './backtracking.js'
import { nav, shuffle } from './utils.js'

const count = (board) => {
	board.reduce((acc, line) => {
		acc + line.reduce((acc, curr) => (curr > 0 ? acc + 1 : acc), 0)
	}, 0)
}

const removeRandomElements = (board, num) => {
	let nonEmptyCells = []
	for (const [x, y] of nav(board)) {
		if (board[x][y] > 0) {
			nonEmptyCells.push([x, y])
		}
	}
	nonEmptyCells = shuffle(nonEmptyCells)
	for (let i = 0; i < Math.min(nonEmptyCells.length, num); i++) {
		let [x, y] = nonEmptyCells[i]
		board[x][y] = 0
	}
}

export const generateBoard = (size = 9) => {
	const board = Array.from({ length: size }, () => Array(size).fill(0))
	generateTable(size)
	console.log('table ok')
	for (let i = 0; i < board.length; i++) {
		board[i] = new Proxy(board[i], {
			get(target, name) {
				return target[name]
			},
			set(target, name, value) {
				requestAnimationFrame(() => {
					document.getElementById(`cell-${i}-${name}`).textContent =
						value == 0 ? '' : value
				})
				target[name] = value
				return true
			},
		})
	}
	backtracking(board)
	// TODO: remove elements one by one and counsolutions at that moment
	removeRandomElements(board, Math.floor((size * size) / 4))
	while (countSolutions(board) > 1) {
		backtracking(board)
		removeRandomElements(board, Math.floor((size * size) / 4))
	}
	console.log(countSolutions(board))
	return board
}

const generateTable = (size) => {
	const table = document.createElement('table')
	for (let i = 0; i < size; i++) {
		const row = document.createElement('tr')
		for (let j = 0; j < size; j++) {
			const cell = document.createElement('td')
			cell.setAttribute('id', `cell-${i}-${j}`) // TODO: use that?
			row.appendChild(cell)
		}
		table.appendChild(row)
	}
	document.body.appendChild(table)
}

const print = (board) => {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board.length; j++) {
			const cell = document.getElementById(`cell-${i}-${j}`)
			if (+cell.textContent !== board[i][j]) {
				if (board[i][j] === 0) cell.textContent = ''
				else cell.textContent = board[i][j]
			}
		}
	}
}

const fillBoard = (board) => {
	backtracking(board)
}
