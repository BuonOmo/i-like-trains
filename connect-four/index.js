const boardEl = document.getElementById('board')
const cursorEl = document.getElementById('cursor')
const victoryEl = document.getElementById('victory')
const pawnChar = '●'

const player1 = {
  color: 'red',
  value: 1
}

const player2 = {
  color: 'blue',
  value: -1
}

const state = new Proxy({
  victory: false,
  bitmaps: {
    [player1.value]: 0n,
    [player2.value]: 0n
  },
  board: [...Array(7)].map(() => Array(7).fill(0)),
  _currentPlayer: player1,
  get currentPlayer () {
    return this._currentPlayer
  },
  set currentPlayer (value) {
    cursorEl.classList.replace(this._currentPlayer.color, value.color)
    this._currentPlayer = value
  },
  get cursorPosition () {
    return Number(cursorEl.classList[1].slice(1))
  },
  set cursorPosition (position) {
    cursorEl.classList.replace(`p${this.cursorPosition}`, `p${position}`)

  }
}, {
  set (obj, prop, newValue) {
    obj[prop] = newValue
    refreshBoard()
  }
})

window.state = state

const refreshBoard = () => {
  state.board.forEach((row, x) => {
    row.forEach((value, y) => {
      const currentEl = boardEl.getElementsByClassName(`r${y}`)[0].getElementsByClassName(`s${x}`)[0]
      ;[player1, player2].forEach((player) => {
        if (player.value === value) {
          currentEl.classList.add(player.color)
        } else {
          currentEl.classList.remove(player.color)
        }
      })
    })
  })
}

const setBoard = (col, row, value) => {
  state.board[col][row] = value
  state.bitmaps[value] = state.bitmaps[value] | BigInt(2 ** (col + 7 * row))
}

const createBoard = (el) => {
  [...Array(7)].forEach((e, i) => {
    const row = document.createElement('div')
    row.className = `row r${6 - i}`
    row.append(...[...Array(7)].map((e, i) => {
      const col = document.createElement('span')
      col.className = `square s${i}`
      return col
    }))
    el.appendChild(row)
  })
}

const nextPawnPosition = (column = state.cursorPosition) => {
  return state.board[column].indexOf(0)
}

const dropPawn = () => {
  const column = state.cursorPosition
  if (nextPawnPosition(column) === -1) return false

  setBoard(column, nextPawnPosition(column), state.currentPlayer.value)
  return true
}

const changePlayer = () => {
  state.currentPlayer = state.currentPlayer === player1 ? player2 : player1
}

const checkVictory = () => {
  const bitBoard = state.bitmaps[state.currentPlayer.value]
  let y = bitBoard & (bitBoard >> 6n);
  if (y & (y >> BigInt(2 * 6)))     // check \ diagonal
    return true
  y = bitBoard & (bitBoard >> 7n)
  if (y & (y >> BigInt(2 * 7)))     // check horizontal
    return true
  y = bitBoard & (bitBoard >> 8n)
  if (y & (y >> BigInt(2 * 8)))     // check / diagonal
    return true
  y = bitBoard & (bitBoard >> 1n)
  if (y & (y >> 2n))         // check vertical
    return true
  return false
}

const moveCursor = (direction) => {
  const currentPosition = state.cursorPosition
  state.cursorPosition = [0, currentPosition + direction, 6].sort()[1]
}

createBoard(boardEl)

window.document.body.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight':
      moveCursor(1)
      break;
    case 'ArrowLeft':
      moveCursor(-1)
      break;
  }
})

window.document.body.addEventListener('keyup', (e) => {
  if (state.victory) return
  switch (e.key) {
    case ' ':
    case 'Enter':
      if (!dropPawn()) return
      if (checkVictory()) {
        victoryEl.innerText = `${state.currentPlayer.color} win!`
        state.victory = true
      }
      changePlayer()
      break;
  }
})
