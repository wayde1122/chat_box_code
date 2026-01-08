"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

/** 游戏状态 */
type GameState = "idle" | "playing" | "paused" | "gameover" | "won";

/** 方向 */
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

/** 游戏配置 */
const CONFIG = {
  /** 网格大小 */
  GRID_SIZE: 4,
  /** 目标数字 */
  TARGET_VALUE: 2048,
};

/** 数字对应的颜色 */
const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: "bg-slate-700/50", text: "text-transparent" },
  2: { bg: "bg-amber-100", text: "text-amber-900" },
  4: { bg: "bg-amber-200", text: "text-amber-900" },
  8: { bg: "bg-amber-300", text: "text-amber-900" },
  16: { bg: "bg-amber-400", text: "text-amber-900" },
  32: { bg: "bg-amber-500", text: "text-white" },
  64: { bg: "bg-amber-600", text: "text-white" },
  128: { bg: "bg-yellow-400", text: "text-yellow-900" },
  256: { bg: "bg-yellow-500", text: "text-white" },
  512: { bg: "bg-yellow-600", text: "text-white" },
  1024: { bg: "bg-yellow-500", text: "text-white" },
  2048: { bg: "bg-yellow-400", text: "text-yellow-900" },
  4096: { bg: "bg-purple-500", text: "text-white" },
  8192: { bg: "bg-purple-600", text: "text-white" },
} as const;

/** 初始化游戏板 */
const initializeBoard = (): number[][] =>
  Array(CONFIG.GRID_SIZE)
    .fill(null)
    .map(() => Array(CONFIG.GRID_SIZE).fill(0));

/** 在随机空位置生成一个新数字 */
const spawnTile = (board: number[][]): number[][] => {
  const emptyCells: [number, number][] = [];
  for (let r = 0; r < CONFIG.GRID_SIZE; r++) {
    for (let c = 0; c < CONFIG.GRID_SIZE; c++) {
      if (board[r][c] === 0) {
        emptyCells.push([r, c]);
      }
    }
  }

  if (emptyCells.length === 0) return board;

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newBoard = board.map((row) => [...row]);
  newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

/** 向左移动一行 */
const slideRow = (row: number[]): { newRow: number[]; score: number } => {
  // 移除0
  const filtered = row.filter((val) => val !== 0);
  const newRow: number[] = [];
  let score = 0;

  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      // 合并
      const merged = filtered[i] * 2;
      newRow.push(merged);
      score += merged;
      i++; // 跳过下一个
    } else {
      newRow.push(filtered[i]);
    }
  }

  // 填充0
  while (newRow.length < CONFIG.GRID_SIZE) {
    newRow.push(0);
  }

  return { newRow, score };
};

/** 移动游戏板 */
const moveBoard = (
  board: number[][],
  direction: Direction
): { newBoard: number[][]; score: number; moved: boolean } => {
  let newBoard = board.map((row) => [...row]);
  let score = 0;
  let moved = false;

  const rotateBoard = (b: number[][]): number[][] => {
    const size = b.length;
    const rotated: number[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        rotated[c][size - 1 - r] = b[r][c];
      }
    }
    return rotated;
  };

  // 将所有方向转换为向左移动
  let rotations = 0;
  switch (direction) {
    case "LEFT":
      rotations = 0;
      break;
    case "UP":
      rotations = 3;
      break;
    case "RIGHT":
      rotations = 2;
      break;
    case "DOWN":
      rotations = 1;
      break;
  }

  for (let i = 0; i < rotations; i++) {
    newBoard = rotateBoard(newBoard);
  }

  // 向左移动每一行
  const resultBoard = newBoard.map((row, rowIndex) => {
    const result = slideRow(row);
    score += result.score;
    if (row.join(",") !== result.newRow.join(",")) {
      moved = true;
    }
    return result.newRow;
  });

  newBoard = resultBoard;

  // 旋转回来
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    newBoard = rotateBoard(newBoard);
  }

  return { newBoard, score, moved };
};

/** 检查是否有可用的移动 */
const hasAvailableMoves = (board: number[][]): boolean => {
  // 检查是否有空格
  for (let r = 0; r < CONFIG.GRID_SIZE; r++) {
    for (let c = 0; c < CONFIG.GRID_SIZE; c++) {
      if (board[r][c] === 0) return true;
    }
  }

  // 检查是否有可以合并的相邻格子
  for (let r = 0; r < CONFIG.GRID_SIZE; r++) {
    for (let c = 0; c < CONFIG.GRID_SIZE; c++) {
      const current = board[r][c];
      if (
        (r < CONFIG.GRID_SIZE - 1 && board[r + 1][c] === current) ||
        (c < CONFIG.GRID_SIZE - 1 && board[r][c + 1] === current)
      ) {
        return true;
      }
    }
  }

  return false;
};

/**
 * 2048游戏组件
 */
export function Game2048() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [board, setBoard] = useState<number[][]>(initializeBoard);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  /** 重置游戏板数据 */
  const resetBoard = useCallback(() => {
    let newBoard = initializeBoard();
    newBoard = spawnTile(newBoard);
    newBoard = spawnTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setHasWon(false);
  }, []);

  /** 重置游戏 */
  const resetGame = useCallback(() => {
    resetBoard();
    setGameState("idle");
  }, [resetBoard]);

  /** 开始/暂停游戏 */
  const toggleGame = useCallback(() => {
    if (gameState === "idle" || gameState === "gameover" || gameState === "won") {
      resetBoard();
      setGameState("playing");
    } else if (gameState === "playing") {
      setGameState("paused");
    } else if (gameState === "paused") {
      setGameState("playing");
    }
  }, [gameState, resetBoard]);

  /** 移动方块 */
  const move = useCallback(
    (direction: Direction) => {
      if (gameState !== "playing") return;

      const { newBoard, score: gainedScore, moved } = moveBoard(board, direction);

      if (!moved) return;

      let newBoardAfterSpawn = spawnTile(newBoard);
      setBoard(newBoardAfterSpawn);
      setScore((prev) => {
        const newScore = prev + gainedScore;
        setBestScore((best) => Math.max(best, newScore));
        return newScore;
      });

      // 检查是否获胜
      const hasTarget = newBoardAfterSpawn.some((row) =>
        row.some((cell) => cell >= CONFIG.TARGET_VALUE)
      );
      if (hasTarget && !hasWon) {
        setHasWon(true);
        setGameState("won");
        return;
      }

      // 检查是否游戏结束
      if (!hasAvailableMoves(newBoardAfterSpawn)) {
        setGameState("gameover");
      }
    },
    [board, gameState, hasWon]
  );

  /** 处理键盘输入 */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 空格键控制开始/暂停
      if (e.code === "Space") {
        e.preventDefault();
        toggleGame();
        return;
      }

      // 方向键控制
      if (gameState !== "playing") return;

      let direction: Direction | null = null;

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          direction = "UP";
          break;
        case "ArrowDown":
        case "KeyS":
          direction = "DOWN";
          break;
        case "ArrowLeft":
        case "KeyA":
          direction = "LEFT";
          break;
        case "ArrowRight":
        case "KeyD":
          direction = "RIGHT";
          break;
      }

      if (direction) {
        e.preventDefault();
        move(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, move, toggleGame]);

  /** 处理触摸滑动 */
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // 防止滚动
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== "playing") return;

      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipeDistance = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > minSwipeDistance) {
          move(deltaX > 0 ? "RIGHT" : "LEFT");
        }
      } else {
        // 垂直滑动
        if (Math.abs(deltaY) > minSwipeDistance) {
          move(deltaY > 0 ? "DOWN" : "UP");
        }
      }
    };

    const gameElement = document.getElementById("game2048-board");
    if (gameElement) {
      gameElement.addEventListener("touchstart", handleTouchStart);
      gameElement.addEventListener("touchmove", handleTouchMove, { passive: false });
      gameElement.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (gameElement) {
        gameElement.removeEventListener("touchstart", handleTouchStart);
        gameElement.removeEventListener("touchmove", handleTouchMove);
        gameElement.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [gameState, move]);

  /** 从 localStorage 读取最高分 */
  useEffect(() => {
    const stored = localStorage.getItem("game2048-best-score");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        setBestScore(parsed);
      }
    }
  }, []);

  /** 保存最高分到 localStorage */
  useEffect(() => {
    if (bestScore > 0) {
      localStorage.setItem("game2048-best-score", String(bestScore));
    }
  }, [bestScore]);

  /** 继续游戏（获胜后） */
  const continueGame = useCallback(() => {
    setGameState("playing");
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 分数面板 */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-1">当前分数</div>
          <div className="text-3xl font-bold text-amber-400 tabular-nums">{score}</div>
        </div>
        <div className="h-12 w-px bg-slate-700" />
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-1">最高分</div>
          <div className="text-3xl font-bold text-yellow-400 tabular-nums">{bestScore}</div>
        </div>
      </div>

      {/* 游戏板 */}
      <div
        id="game2048-board"
        className="relative bg-slate-800/80 p-3 rounded-xl border-2 border-slate-700 shadow-2xl shadow-amber-500/10"
      >
        {/* 游戏状态覆盖层 */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
            {gameState === "gameover" ? (
              <>
                <div className="text-2xl font-bold text-rose-400 mb-2">游戏结束</div>
                <div className="text-slate-400 mb-4">得分：{score}</div>
              </>
            ) : gameState === "paused" ? (
              <div className="text-2xl font-bold text-amber-400 mb-4">暂停中</div>
            ) : gameState === "won" ? (
              <>
                <div className="text-2xl font-bold text-yellow-400 mb-2">恭喜获胜！</div>
                <div className="text-slate-400 mb-4">你达到了 2048！</div>
                <div className="flex gap-3">
                  <button
                    onClick={continueGame}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500
                               text-white font-semibold rounded-lg hover:from-amber-600 hover:to-yellow-600
                               transition-all shadow-lg shadow-amber-500/25"
                  >
                    <Play className="h-5 w-5" />
                    继续游戏
                  </button>
                  <button
                    onClick={() => {
                      resetGame();
                      setGameState("playing");
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-700
                               text-slate-300 font-semibold rounded-lg hover:bg-slate-600
                               transition-all"
                  >
                    <RotateCcw className="h-5 w-5" />
                    重新开始
                  </button>
                </div>
              </>
            ) : (
              <div className="text-lg text-slate-300 mb-4">按空格键或点击开始</div>
            )}
            {gameState !== "won" && (
              <button
                onClick={toggleGame}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500
                           text-white font-semibold rounded-lg hover:from-amber-600 hover:to-yellow-600
                           transition-all shadow-lg shadow-amber-500/25"
              >
                {gameState === "gameover" ? (
                  <>
                    <RotateCcw className="h-5 w-5" />
                    重新开始
                  </>
                ) : gameState === "paused" ? (
                  <>
                    <Play className="h-5 w-5" />
                    继续游戏
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    开始游戏
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* 网格 */}
        <div className="grid grid-cols-4 gap-2">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const colors = TILE_COLORS[cell] || TILE_COLORS[8192];
              const displayValue = cell > 8192 ? "8192+" : cell;
              const fontSize = cell >= 1024 ? "text-xl" : cell >= 128 ? "text-2xl" : "text-3xl";

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-16 h-16 sm:w-20 sm:h-20 ${colors.bg} ${colors.text} ${fontSize} font-bold
                             rounded-lg flex items-center justify-center transition-all duration-150
                             shadow-md`}
                  style={{
                    transform: cell !== 0 ? "scale(1)" : "scale(0.95)",
                  }}
                >
                  {cell !== 0 ? displayValue : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleGame}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300
                     rounded-lg border border-slate-700 hover:border-slate-600
                     hover:text-white transition-all"
        >
          {gameState === "playing" ? (
            <>
              <Pause className="h-4 w-4" />
              暂停
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {gameState === "gameover" || gameState === "won" ? "重玩" : "开始"}
            </>
          )}
        </button>
        <button
          onClick={() => {
            resetGame();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300
                     rounded-lg border border-slate-700 hover:border-slate-600
                     hover:text-white transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          重置
        </button>
      </div>

      {/* 操作说明 */}
      <div className="text-center text-sm text-slate-500">
        <p>使用 <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">↑</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">↓</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">←</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">→</kbd> 或 <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">W</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">A</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">S</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">D</kbd> 移动方块</p>
        <p className="mt-1">移动端支持滑动操作 · 按 <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">空格</kbd> 开始/暂停游戏</p>
      </div>
    </div>
  );
}
