export const shuffle = (ary) => ary.sort(() => Math.random() - 0.5)
// for (let i = 0; i < ary.length; i++) {
// 	let swap = ary[i]
// 	let rand = Math.floor(Math.random() * ary.length)
// 	ary[i] = ary[rand]
// 	ary[rand] = swap
//  }

export function* nav(board) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board.length; j++) {
			yield [i, j]
		}
	}
}

export const divmod = (x, y) => [Math.floor(x / y), x % y]
