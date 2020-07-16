const generateMinedBoard = (mineCount, cellCount) => {
  if (mineCount > cellCount) throw "That's a lot of mines!"
  let bitArray = ones(mineCount)
  const allPermutations = binomial(cellCount, mineCount)
}


/**
 * For a mine or cell count, gives a number which binary representation contains `count` 1.
 */
const ones =  (count) => 2n**count - 1n


function binomial(n, k) {
  if ((typeof n !== 'bigint') || (typeof k !== 'bigint')) throw '`bigint` only please.'

  let coef = 1n;
  for (let x = n-k+1n; x <= n; x++) coef *= x;
  for (let x = 1n; x <= k; x++) coef /= x;
  return coef;
}
