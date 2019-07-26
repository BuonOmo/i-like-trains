const canvas = window.canvas = document.getElementById('game')

const unit = 100

// context.fillStyle = 'lightgray'
// context.strokeRect(25, 25, 25, 25)


const SQUARE = {
  empty: 0,
  filled: 1,
  player1: 2,
  player2: 3
}

const STICK = {
  empty: 0,
  full: 1
}

const PLAYERS = [
  {
    id: 'player1',
    color: 'dodgerblue',
    score: 0
  },
  {
    id: 'player2',
    color: 'firebrick',
    score: 0
  }
]


const createMatrix = (w, h, defaultValue) => {
  return [...Array(w)].map(() => new Array(h).fill(defaultValue))
}


const initialize = (context) => {
  context.strokeStyle = 'lightgray'
  context.lineWidth = 1

  for (let x = unit; x < canvas.width; x += unit) {
    context.moveTo(x, 0)
    context.lineTo(x, canvas.height)
  }

  for (let y = unit; y < canvas.height; y += unit) {
    context.moveTo(0, y)
    context.lineTo(canvas.width, y)
  }

  context.stroke()

  const w = canvas.width / unit
  const h = canvas.height / unit
  const squares = createMatrix(w, h, SQUARE.empty)
  const hSticks = createMatrix(w, h + 1, STICK.empty)
  const vSticks = createMatrix(w + 1, h, STICK.empty)

  vSticks[0].fill(STICK.full)
  vSticks[vSticks.length - 1].fill(STICK.full)

  hSticks.forEach(line => {
    line[0] = STICK.full
    line[line.length - 1] = STICK.full
  })

  return {
    context,
    squares,
    hSticks,
    vSticks,
    playerPos: 0
  }
}

const addHStick = (state, x, y) => {
  if (state.hSticks[x][y] === STICK.full) return false

  state.hSticks[x][y] = STICK.full

  state.context.beginPath()
  state.context.strokeStyle = 'black'
  state.context.lineWidth = 1
  state.context.moveTo(x * unit, y * unit)
  state.context.lineTo((x + 1) * unit,y * unit)
  state.context.stroke()
  return true
}

const addVStick = (state, x, y) => {
  if (state.vSticks[x][y] === STICK.full) return false

  state.vSticks[x][y] = STICK.full

  state.context.beginPath()
  state.context.strokeStyle = 'black'
  state.context.lineWidth = 1
  state.context.moveTo(x * unit, y * unit)
  state.context.lineTo(x * unit,(y + 1) * unit)
  state.context.stroke()
  return true
}

const addStick = (state, mouseX, mouseY) => {
  const squareX = Math.floor(mouseX / unit)
  const squareY = Math.floor(mouseY / unit)

  // Positions relative to square center
  const x = mouseX - squareX * unit - unit / 2
  const y = mouseY - squareY * unit - unit / 2
  console.log("x:", x, "y:", y)
  if (x >= y) {
    if (x >= -y) {
      return addVStick(state, squareX + 1, squareY) && detectFullSquares(state, squareX + 1, squareY, 'v')
    } else {
      return addHStick(state, squareX, squareY) && detectFullSquares(state, squareX, squareY, 'h')
    }
  } else {
    if (x >= -y) {
      return addHStick(state, squareX, squareY + 1) && detectFullSquares(state, squareX, squareY + 1, 'h')
    } else {
      return addVStick(state, squareX, squareY) && detectFullSquares(state, squareX, squareY, 'v')
    }
  }
}

const detectFullSquares = (state, x, y, kind) => {
  if (kind.startsWith('h')) {
    return [detectFullSquare(state, x, y - 1), detectFullSquare(state, x, y)].filter(square => square !== undefined)
  } else if (kind.startsWith('v')) {
    return [detectFullSquare(state, x - 1, y), detectFullSquare(state, x, y)].filter(square => square !== undefined)
  } else {
    throw 'Pas content ! Pas content ! Pas content !'
  }
}

const detectFullSquare = (state, x, y) => {
  if (
    state.hSticks[x][y] === STICK.full
    && state.hSticks[x][y + 1] === STICK.full
    && state.vSticks[x][y] === STICK.full
    && state.vSticks[x + 1][y] === STICK.full
  ) {
    return { x, y }
  }
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return { x, y }
}

function paintSquare(state, x, y) {
  const player = PLAYERS[state.playerPos]
  state.context.beginPath()
  state.context.fillStyle = player.color
  state.context.fillRect(x * unit, y * unit, unit, unit)

  state.squares[x][y] = SQUARE[player.id]
  player.score = player.score + 1
}


const state = window.state = initialize(window.context = canvas.getContext('2d'))


canvas.addEventListener('mousedown', function(e) {
  const { x, y } = getCursorPosition(canvas, e)
  const squaresFilled = addStick(state, x, y)
  if (squaresFilled === false) return

  if (squaresFilled.length === 0) {
    state.playerPos = 1 - state.playerPos
    canvas.className = PLAYERS[state.playerPos].id
    return
  }

  squaresFilled.forEach(square => paintSquare(state, square.x, square.y))
})
