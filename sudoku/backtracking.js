const test = () => {
	let board = Array.from({ length: 9 }, () => Array(9).fill(0))
	show(board)
	console.log('starting backtracking')
	backtracking(board)
	show(board)
}

const shuffle = (ary) => {
	for (let i = 0; i < ary.length; i++) {
		let swap = ary[i]
		let rand = Math.floor(Math.random() * ary.length)
		ary[i] = ary[rand]
		ary[rand] = swap
	}
}

const show = (board) => {
	const table = document.createElement('table')
	for (let i = 0; i < 9; i++) {
		const row = document.createElement('tr')
		for (let j = 0; j < 9; j++) {
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
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (board[i][j] === 0) return false
		}
	}
	return true
}

const isValid = (board) => {
	for (let i = 0; i < 9; i++) {
		const rowSet = new Set()
		const colSet = new Set()
		const boxSet = new Set()
		for (let j = 0; j < 9; j++) {
			const rowVal = board[i][j]
			const colVal = board[j][i]
			const boxVal =
				board[Math.floor(i / 3) * 3 + Math.floor(j / 3)][(i % 3) * 3 + (j % 3)]

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
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (board[i][j] === 0) return [i, j]
		}
	}
}

const backtracking = (board) => {
	// Stop condition
	if (isFilled(board)) return true
	if (!isValid(board)) return false

	const [x, y] = findEmptyCell(board)

	let randNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	shuffle(randNumbers)

	for (const number of randNumbers) {
		board[x][y] = number
		update(x, y, number)
		if (backtracking(board)) return true
		board[x][y] = 0
		update(x, y, 0)
	}

	return false
}

// TODO: Implement a multi-solutions solver that counts
//   the number of solutions for a given board

export { test, backtracking }
