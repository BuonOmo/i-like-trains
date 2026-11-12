import { backtracking, countSolutions, isValid } from './backtracking.js'
import { nav, shuffle, divmod, DIFFICULTY } from './utils.js'

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
	const count = Math.floor(size * size * DIFFICULTY)
	console.debug(
		`Removing ${count} random elements from the board for difficulty`,
	)
	removeRandomElements(board, count)
	while (countSolutions(board) > 1) {
		backtracking(board)
		removeRandomElements(board, count)
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

// Builds the initial, immutable game state from the keyboard layout and the
// already-rendered board. `prefilled` is captured once here (rather than
// re-derived from the DOM on every keystroke) so that state updates stay pure.
const createState = (board, keyCodes, keyMapping) => {
	const size = board.length
	const prefilled = Array.from({ length: size }, (_, x) =>
		Array.from({ length: size }, (_, y) =>
			document.getElementById(`cell-${x}-${y}`).classList.contains('prefilled'),
		),
	)

	let filledCount = 0
	for (const [x, y] of nav(board)) if (board[x][y] !== 0) filledCount++

	return {
		board,
		prefilled,
		keyCodes,
		keyMapping,
		selectedGroup: null,
		selectedCell: null,
		filledCount,
		finished: false,
	}
}

const update = (state, event) => {
	const patches = []

	if (state.finished) return patches

	if (event.key === 'Escape' || event.key === 'Backspace') {
		if (state.selectedCell) state.selectedCell = null
		else state.selectedGroup = null
		patches.push({ type: 'selection' })
		return patches
	}

	let [x, y] = [null, null]
	if ('0123456789'.includes(event.key))
		[x, y] = divmod(parseInt(event.key) - 1, 3)
	if (state.keyCodes[event.code]) [x, y] = state.keyCodes[event.code]
	if (x === null || y === null) return patches

	if (!state.selectedGroup) {
		state.selectedGroup = [x, y]
		// Shortcut: if there's only one empty cell in the group,
		// select it immediately.
		let emptyCell
		out: for (let dx = 0; dx < 3; dx++) {
			for (let dy = 0; dy < 3; dy++) {
				const [pX, pY] = [x * 3 + dx, y * 3 + dy]
				if (state.board[pX][pY] === 0)
					if (emptyCell) {
						emptyCell = null
						break out
					} else {
						emptyCell = [pX, pY]
					}
			}
		}
		if (emptyCell) {
			state.selectedCell = emptyCell
		}
		patches.push({ type: 'selection' })
	} else if (!state.selectedCell) {
		const [gX, gY] = state.selectedGroup
		const [pX, pY] = [gX * 3 + x, gY * 3 + y]
		if (!state.prefilled[pX][pY]) {
			state.selectedCell = [pX, pY]
			patches.push({ type: 'selection' })
		}
	} else {
		const [pX, pY] = state.selectedCell
		const value = y + 3 * x + 1
		if (state.board[pX][pY] === 0) state.filledCount++
		state.board[pX][pY] = value
		state.selectedCell = null
		state.selectedGroup = null
		patches.push({ type: 'cell', x: pX, y: pY, value })
		patches.push({ type: 'selection' })

		if (state.filledCount === state.board.length ** 2 && isValid(state.board)) {
			state.finished = true
			patches.push({ type: 'win' })
		}
	}

	return patches
}

// Graphics: applies a list of patches to the DOM. Never mutates state.
const render = (state, patches) => {
	for (const patch of patches) {
		switch (patch.type) {
			case 'cell':
				renderCell(patch)
				break
			case 'selection':
				renderHelpers(state)
				break
			case 'win':
				renderWin()
				break
		}
	}
}

const renderCell = ({ x, y, value }) => {
	document.getElementById(`cell-${x}-${y}`).textContent = value || ''
}

const renderHelpers = ({
	selectedGroup,
	selectedCell,
	keyMapping,
	prefilled,
}) => {
	if (!selectedCell && valueHelperInterval) {
		clearInterval(valueHelperInterval)
		valueHelperInterval = null
	}

	if (!selectedGroup) showGroupHelper(prefilled)
	else if (!selectedCell) showCellHelper(selectedGroup, prefilled)
	else showValueHelper(selectedCell, keyMapping)
}

const gameLoop = async (keyCodes, board) => {
	const layoutMap = await navigator.keyboard.getLayoutMap()
	const keyMapping = Object.keys(keyCodes)
		.map((code) => [code, layoutMap.get(code).toUpperCase()])
		.andThen(Object.fromEntries)

	setKeyMapping(keyMapping)

	const state = createState(board, keyCodes, keyMapping)

	render(state, [{ type: 'selection' }])
	startTimer()

	return function listener(event) {
		render(state, update(state, event))
	}
}

const setKeyMapping = (keyMapping) => {
	for (let [code, value] of Object.entries(keyMapping)) {
		document.querySelector(`.helper-${code}`).textContent = value
	}
}

let timerRafId = null

const startTimer = () => {
	const t0 = performance.now()
	const timerEl = document.querySelector('.timer')

	const updateTimer = () => {
		const t = Math.round((performance.now() - t0) / 1000)
		const [mm, ss] = divmod(t, 60)
		timerEl.textContent = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
		timerRafId = requestAnimationFrame(updateTimer)
	}

	timerRafId = requestAnimationFrame(updateTimer)
}

const stopTimer = () => {
	if (timerRafId !== null) cancelAnimationFrame(timerRafId)
	timerRafId = null
}

const renderWin = () => {
	stopTimer()
	hideHelpers()
	const timerEl = document.querySelector('.timer')
	const resultEl = document.querySelector('.result')
	resultEl.textContent = `Solved in ${timerEl.textContent}!`
	resultEl.classList.remove('hidden')
}

const showGroupHelper = (prefilled) => {
	document.querySelector('.local-helper').classList.add('hidden')
	const helper = document.querySelector('.helper')
	helper
		.querySelectorAll('td.hidden')
		.forEach((el) => el.classList.remove('hidden'))
	for (let y of [0, 1, 2])
		for (let x of [0, 1, 2]) {
			let allPrefilled = true
			for (let dy of [0, 1, 2])
				for (let dx of [0, 1, 2])
					if (!prefilled[3 * y + dy][3 * x + dx]) allPrefilled = false
			if (allPrefilled) helper.rows[y].cells[x].classList.add('hidden')
		}

	helper.classList = 'helper global'
}

const showCellHelper = ([row, col], prefilled) => {
	document.querySelector('.local-helper').classList.add('hidden')
	const helper = document.querySelector('.helper')
	helper
		.querySelectorAll('td.hidden')
		.forEach((el) => el.classList.remove('hidden'))
	for (let y of [0, 1, 2])
		for (let x of [0, 1, 2])
			if (prefilled[row * 3 + y][col * 3 + x])
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

const hideHelpers = () => {
	document.querySelector('.helper').classList.add('hidden')
	document.querySelector('.local-helper').classList.add('hidden')
	if (valueHelperInterval) clearInterval(valueHelperInterval)
	valueHelperInterval = null
}

export { startGame, gameLoop }
