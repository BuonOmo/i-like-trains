import { backtracking, countSolutions } from './backtracking.js'
import { nav, shuffle, divmod } from './utils.js'

Object.prototype.andThen = function (callback) {
	return callback(this)
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

const startGame = (size = 9) => {
	const board = generateBoard(size)
	generateTable(size)
	for (const [x, y] of nav(board)) {
		if (board[x][y] === 0) continue

		const el = document.getElementById(`cell-${x}-${y}`)
		el.textContent = board[x][y]
		el.classList.add('prefilled')
	}
	return board
}
const generateBoard = (size = 9) => {
	const board = Array.from({ length: size }, () => Array(size).fill(0))
	backtracking(board)
	removeRandomElements(board, Math.floor((size * size) / 4))
	while (countSolutions(board) > 1) {
		backtracking(board)
		removeRandomElements(board, Math.floor((size * size) / 4))
	}
	return board
}

const generateTable = (size) => {
	const table = document.createElement('table')
	table.classList.add('sudoku')
	for (let i = 0; i < size; i++) {
		const row = document.createElement('tr')
		for (let j = 0; j < size; j++) {
			const cell = document.createElement('td')
			cell.setAttribute('id', `cell-${i}-${j}`)
			row.appendChild(cell)
		}
		table.appendChild(row)
	}
	document.getElementById('wrapper').appendChild(table)
}

const gameLoop = async (keyCodes, board) => {
	const layoutMap = await navigator.keyboard.getLayoutMap()
	const keyMapping = Object.keys(keyCodes)
		.map((code) => [code, layoutMap.get(code).toUpperCase()])
		.andThen(Object.fromEntries)

	setKeyMapping(keyMapping)
	printHelper(null, null, keyMapping)
	startTimer()

	let selectedGroup = null
	let selectedCell = null
	return function listener(event) {
		console.log({
			selectedGroup,
			selectedCell,
			event,
			board,
		})

		// State update
		if (event.key == 'Escape' || event.key === 'Backspace') {
			if (selectedCell) selectedCell = null
			else selectedGroup = null
			printHelper(selectedGroup, selectedCell, keyMapping)
			return
		}
		let [x, y] = [null, null]

		if ('0123456789'.includes(event.key))
			[x, y] = divmod(parseInt(event.key) - 1, 3)

		if (keyCodes[event.code]) [x, y] = keyCodes[event.code]

		if (x === null || y === null) return

		if (!selectedGroup) {
			selectedGroup = [x, y]
		} else if (!selectedCell) {
			const [gX, gY] = selectedGroup
			const pX = gX * 3 + x
			const pY = gY * 3 + y
			if (
				!document
					.getElementById(`cell-${pX}-${pY}`)
					.classList.contains('prefilled')
			)
				selectedCell = [pX, pY]
		} else {
			const [pX, pY] = selectedCell
			const value = y + 3 * x + 1
			board[pX][pY] = value
			document.getElementById(`cell-${pX}-${pY}`).textContent = value
			selectedCell = null
			selectedGroup = null
		}

		printHelper(selectedGroup, selectedCell, keyMapping)
	}
}

const setKeyMapping = (keyMapping) => {
	for (let [code, value] of Object.entries(keyMapping)) {
		document.querySelector(`.helper-${code}`).textContent = value
	}
}

const startTimer = () => {
	const t0 = performance.now()
	const timerEl = document.querySelector('.timer')

	const updateTimer = () => {
		const t = Math.round((performance.now() - t0) / 1000)
		const [mm, ss] = divmod(t, 60)
		timerEl.textContent = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
		requestAnimationFrame(updateTimer)
	}

	requestAnimationFrame(updateTimer)
}

const printHelper = (selectedGroup, selectedCell, keyMapping) => {
	if (!selectedGroup) {
		showGroupHelper()
	} else if (!selectedCell) {
		showCellHelper(selectedGroup)
	} else {
		showValueHelper(selectedCell, keyMapping)
	}
}

const showGroupHelper = () => {
	document.querySelector('.local-helper').classList.add('hidden')
	const helper = document.querySelector('.helper')
	const game = document.querySelector('.sudoku')
	helper
		.querySelectorAll('td.hidden')
		.forEach((el) => el.classList.remove('hidden'))
	for (let y of [0, 1, 2])
		for (let x of [0, 1, 2])
			if (
				game.rows[3 * y].cells[3 * x].classList.contains('prefilled') &&
				game.rows[3 * y + 1].cells[3 * x].classList.contains('prefilled') &&
				game.rows[3 * y + 2].cells[3 * x].classList.contains('prefilled') &&
				game.rows[3 * y].cells[3 * x + 1].classList.contains('prefilled') &&
				game.rows[3 * y + 1].cells[3 * x + 1].classList.contains('prefilled') &&
				game.rows[3 * y + 2].cells[3 * x + 1].classList.contains('prefilled') &&
				game.rows[3 * y].cells[3 * x + 2].classList.contains('prefilled') &&
				game.rows[3 * y + 1].cells[3 * x + 2].classList.contains('prefilled') &&
				game.rows[3 * y + 2].cells[3 * x + 2].classList.contains('prefilled')
			)
				helper.rows[y].cells[x].classList.add('hidden')

	helper.classList = 'helper global'
}

const showCellHelper = ([row, col]) => {
	document.querySelector('.local-helper').classList.add('hidden')
	const helper = document.querySelector('.helper')
	const game = document.querySelector('.sudoku')
	helper
		.querySelectorAll('td.hidden')
		.forEach((el) => el.classList.remove('hidden'))
	for (let y of [0, 1, 2])
		for (let x of [0, 1, 2])
			if (
				game.rows[row * 3 + y].cells[col * 3 + x].classList.contains(
					'prefilled',
				)
			)
				helper.rows[y].cells[x].classList.add('hidden')

	helper.classList = `helper group col-${col} row-${row}`
}

let valueHelperInterval = null
const showValueHelper = ([row, col], keyMapping) => {
	document.querySelector('.helper').classList.add('hidden')
	const helper = document.querySelector('.local-helper')
	helper.style.top = `calc(${row} * (100% / 9)`
	helper.style.left = `calc(${col} * (100% / 9)`
	let i = 0
	helper.textContent = `${Object.values(keyMapping)[i % 9]} = ${(i % 9) + 1}`

	helper.classList.remove('hidden')

	if (valueHelperInterval) clearInterval(valueHelperInterval)
	valueHelperInterval = setInterval(() => {
		i += 1
		helper.textContent = `${Object.values(keyMapping)[i % 9]} = ${(i % 9) + 1}`
	}, 1000)
}

export { startGame, gameLoop }
