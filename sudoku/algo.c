#include <stdlib.h>
#include <time.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

#define N 9
#define BOX 3

static int board[N][N];

static unsigned int rng_state;

// xorshift32: fast, good-enough PRNG for shuffling. Seeded per call so the
// same seed always produces the same board.
static unsigned int next_rand(void) {
  unsigned int x = rng_state;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  rng_state = x;
  return x;
}

static int rand_below(int n) { return (int)(next_rand() % (unsigned int)n); }

static void shuffle(int *array, int length) {
  for (int i = length - 1; i > 0; i--) {
    int j = rand_below(i + 1);
    int tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}

int is_valid_placement(int b[N][N], int x, int y, int value) {
  for (int i = 0; i < N; i++) {
    if (i != y && b[x][i] == value)
      return 0;
    if (i != x && b[i][y] == value)
      return 0;
  }

  int boxX = (x / BOX) * BOX;
  int boxY = (y / BOX) * BOX;
  for (int i = 0; i < BOX; i++)
    for (int j = 0; j < BOX; j++) {
      int cx = boxX + i, cy = boxY + j;
      if ((cx != x || cy != y) && b[cx][cy] == value)
        return 0;
    }

  return 1;
}

// Whether the board has no conflicting (duplicate) values in any row,
// column or box. Empty (`0`) cells are ignored, so this does not require
// the board to be fully filled in.
EMSCRIPTEN_KEEPALIVE
int is_valid(int board[N][N]) {
  for (int i = 0; i < N; i++) {
    int rowSeen = 0, colSeen = 0, boxSeen = 0;
    for (int j = 0; j < N; j++) {
      int rowVal = board[i][j];
      int colVal = board[j][i];
      int boxVal = board[(i / BOX) * BOX + j / BOX][(i % BOX) * BOX + j % BOX];

      if (rowVal != 0) {
        int bit = 1 << rowVal;
        if (rowSeen & bit)
          return 0;
        rowSeen |= bit;
      }
      if (colVal != 0) {
        int bit = 1 << colVal;
        if (colSeen & bit)
          return 0;
        colSeen |= bit;
      }
      if (boxVal != 0) {
        int bit = 1 << boxVal;
        if (boxSeen & bit)
          return 0;
        boxSeen |= bit;
      }
    }
  }
  return 1;
}

static int find_empty_cell(int b[N][N], int *x, int *y) {
  for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
      if (b[i][j] == 0) {
        *x = i;
        *y = j;
        return 1;
      }
  return 0;
}

// Fill a sudoku board using a backtracking algorithm.
static int fill_board(int b[N][N]) {
  int x, y;
  if (!find_empty_cell(b, &x, &y))
    return 1;

  int numbers[N];
  for (int i = 0; i < N; i++)
    numbers[i] = i + 1;
  shuffle(numbers, N);

  for (int i = 0; i < N; i++) {
    int value = numbers[i];
    if (!is_valid_placement(b, x, y, value))
      continue;

    b[x][y] = value;
    if (fill_board(b))
      return 1;
    b[x][y] = 0;
  }

  return 0;
}

static int count_solutions(int b[N][N], int limit) {
  int x, y;
  if (!find_empty_cell(b, &x, &y))
    return 1;

  int count = 0;
  for (int value = 1; value <= N; value++) {
    if (!is_valid_placement(b, x, y, value))
      continue;

    b[x][y] = value;
    count += count_solutions(b, limit - count);
    b[x][y] = 0;
    if (count >= limit)
      break;
  }

  return count;
}

static void dig_holes(int b[N][N], int holes) {
  int cells[N * N];
  for (int i = 0; i < N * N; i++)
    cells[i] = i;

  int remaining = holes;
  while (remaining > 0) {
    remaining = holes;
    shuffle(cells, N * N);

    for (int i = 0; i < N * N; i++) {
      if (remaining <= 0)
        break;

      int x = cells[i] / N;
      int y = cells[i] % N;
      int backup = b[x][y];

      b[x][y] = 0;
      if (count_solutions(b, 2) > 1)
        b[x][y] = backup;
      else
        remaining--;
    }
  }
}

// Generates a 9x9 sudoku board with `holes` empty cells, and a unique
// solution. Returns a pointer to a freshly `malloc`-ed, row-major array of
// 81 ints; the caller is responsible for `free`-ing it.
EMSCRIPTEN_KEEPALIVE
int *generate_board(int holes, unsigned int seed) {
  rng_state = seed != 0 ? seed : (unsigned int)time(NULL);

  for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
      board[i][j] = 0;

  fill_board(board);

  if (holes > N * N)
    holes = N * N;
  dig_holes(board, holes);

  int *result = (int *)malloc(N * N * sizeof(int));
  for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
      result[i * N + j] = board[i][j];

  return result;
}
