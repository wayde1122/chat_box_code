"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

/** 游戏状态 */
type GameState = "idle" | "playing" | "paused" | "gameover";

/** 方向 */
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

/** 坐标点 */
interface Point {
  x: number;
  y: number;
}

/** 游戏配置 */
const CONFIG = {
  /** 格子大小 */
  CELL_SIZE: 20,
  /** 横向格子数 */
  GRID_WIDTH: 20,
  /** 纵向格子数 */
  GRID_HEIGHT: 15,
  /** 初始速度（毫秒） */
  INITIAL_SPEED: 150,
  /** 最快速度 */
  MIN_SPEED: 50,
  /** 每吃一个食物加速 */
  SPEED_INCREMENT: 5,
} as const;

/** 方向向量映射 */
const DIRECTION_VECTORS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

/** 相反方向映射 */
const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

/**
 * 贪吃蛇游戏组件
 */
export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // 使用 ref 存储游戏状态，避免闭包问题
  const snakeRef = useRef<Point[]>([{ x: 10, y: 7 }]);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const foodRef = useRef<Point>({ x: 15, y: 7 });
  const speedRef = useRef(CONFIG.INITIAL_SPEED);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  /** 生成随机食物位置 */
  const generateFood = useCallback((): Point => {
    const snake = snakeRef.current;
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * CONFIG.GRID_WIDTH),
        y: Math.floor(Math.random() * CONFIG.GRID_HEIGHT),
      };
    } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  /** 重置游戏 */
  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 7 }];
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    foodRef.current = generateFood();
    speedRef.current = CONFIG.INITIAL_SPEED;
    setScore(0);
    setGameState("idle");
  }, [generateFood]);

  /** 绘制游戏画面 */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT } = CONFIG;

    // 清空画布
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格线
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    // 绘制食物
    const food = foodRef.current;
    const gradient = ctx.createRadialGradient(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      0,
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2
    );
    gradient.addColorStop(0, "#f43f5e");
    gradient.addColorStop(1, "#e11d48");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 绘制蛇
    const snake = snakeRef.current;
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;

      if (isHead) {
        // 蛇头 - 使用渐变
        const headGradient = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
        headGradient.addColorStop(0, "#22c55e");
        headGradient.addColorStop(1, "#16a34a");
        ctx.fillStyle = headGradient;
      } else {
        // 蛇身 - 渐变颜色
        const alpha = 1 - (index / snake.length) * 0.4;
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
      }

      // 圆角矩形
      const radius = 4;
      const padding = 1;
      ctx.beginPath();
      ctx.roundRect(x + padding, y + padding, CELL_SIZE - padding * 2, CELL_SIZE - padding * 2, radius);
      ctx.fill();

      // 蛇头眼睛
      if (isHead) {
        ctx.fillStyle = "#0f172a";
        const eyeSize = 3;
        const direction = directionRef.current;

        let eye1: Point, eye2: Point;
        switch (direction) {
          case "UP":
            eye1 = { x: x + 5, y: y + 6 };
            eye2 = { x: x + CELL_SIZE - 8, y: y + 6 };
            break;
          case "DOWN":
            eye1 = { x: x + 5, y: y + CELL_SIZE - 9 };
            eye2 = { x: x + CELL_SIZE - 8, y: y + CELL_SIZE - 9 };
            break;
          case "LEFT":
            eye1 = { x: x + 6, y: y + 5 };
            eye2 = { x: x + 6, y: y + CELL_SIZE - 8 };
            break;
          case "RIGHT":
          default:
            eye1 = { x: x + CELL_SIZE - 9, y: y + 5 };
            eye2 = { x: x + CELL_SIZE - 9, y: y + CELL_SIZE - 8 };
            break;
        }

        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
        ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);

  /** 游戏主循环 */
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (gameState !== "playing") return;

      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= speedRef.current) {
        lastUpdateRef.current = timestamp;

        // 更新方向
        directionRef.current = nextDirectionRef.current;

        // 计算新蛇头位置
        const snake = snakeRef.current;
        const head = snake[0];
        const vector = DIRECTION_VECTORS[directionRef.current];
        const newHead: Point = {
          x: head.x + vector.x,
          y: head.y + vector.y,
        };

        // 检查碰撞
        const hitWall =
          newHead.x < 0 ||
          newHead.x >= CONFIG.GRID_WIDTH ||
          newHead.y < 0 ||
          newHead.y >= CONFIG.GRID_HEIGHT;

        const hitSelf = snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y);

        if (hitWall || hitSelf) {
          setGameState("gameover");
          setHighScore((prev) => Math.max(prev, score));
          return;
        }

        // 移动蛇
        const newSnake = [newHead, ...snake];
        const food = foodRef.current;

        // 检查是否吃到食物
        if (newHead.x === food.x && newHead.y === food.y) {
          // 吃到食物，不移除尾巴，生成新食物
          foodRef.current = generateFood();
          setScore((prev) => prev + 10);
          // 加速
          speedRef.current = Math.max(CONFIG.MIN_SPEED, speedRef.current - CONFIG.SPEED_INCREMENT);
        } else {
          // 没吃到食物，移除尾巴
          newSnake.pop();
        }

        snakeRef.current = newSnake;
      }

      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [gameState, score, draw, generateFood]
  );

  /** 开始/暂停游戏 */
  const toggleGame = useCallback(() => {
    if (gameState === "idle" || gameState === "gameover") {
      if (gameState === "gameover") {
        resetGame();
      }
      setGameState("playing");
      lastUpdateRef.current = performance.now();
    } else if (gameState === "playing") {
      setGameState("paused");
    } else if (gameState === "paused") {
      setGameState("playing");
      lastUpdateRef.current = performance.now();
    }
  }, [gameState, resetGame]);

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

      let newDirection: Direction | null = null;

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          newDirection = "UP";
          break;
        case "ArrowDown":
        case "KeyS":
          newDirection = "DOWN";
          break;
        case "ArrowLeft":
        case "KeyA":
          newDirection = "LEFT";
          break;
        case "ArrowRight":
        case "KeyD":
          newDirection = "RIGHT";
          break;
      }

      if (newDirection && newDirection !== OPPOSITE_DIRECTIONS[directionRef.current]) {
        e.preventDefault();
        nextDirectionRef.current = newDirection;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, toggleGame]);

  /** 游戏循环启动 */
  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  /** 初始绘制 */
  useEffect(() => {
    draw();
  }, [draw]);

  /** 从 localStorage 读取最高分 */
  useEffect(() => {
    const stored = localStorage.getItem("snake-high-score");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        setHighScore(parsed);
      }
    }
  }, []);

  /** 保存最高分到 localStorage */
  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem("snake-high-score", String(highScore));
    }
  }, [highScore]);

  const canvasWidth = CONFIG.GRID_WIDTH * CONFIG.CELL_SIZE;
  const canvasHeight = CONFIG.GRID_HEIGHT * CONFIG.CELL_SIZE;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 分数面板 */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-1">当前分数</div>
          <div className="text-3xl font-bold text-green-400 tabular-nums">{score}</div>
        </div>
        <div className="h-12 w-px bg-slate-700" />
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-1">最高分</div>
          <div className="text-3xl font-bold text-amber-400 tabular-nums">{highScore}</div>
        </div>
      </div>

      {/* 游戏画布 */}
      <div className="relative rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl shadow-green-500/10">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="block"
        />

        {/* 游戏状态覆盖层 */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
            {gameState === "gameover" ? (
              <>
                <div className="text-2xl font-bold text-rose-400 mb-2">游戏结束</div>
                <div className="text-slate-400 mb-4">得分：{score}</div>
              </>
            ) : gameState === "paused" ? (
              <div className="text-2xl font-bold text-amber-400 mb-4">暂停中</div>
            ) : (
              <div className="text-lg text-slate-300 mb-4">按空格键开始游戏</div>
            )}
            <button
              onClick={toggleGame}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 
                         text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600
                         transition-all shadow-lg shadow-green-500/25"
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
          </div>
        )}
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
              {gameState === "gameover" ? "重玩" : "开始"}
            </>
          )}
        </button>
        <button
          onClick={resetGame}
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
        <p>使用 <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">↑</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">↓</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">←</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">→</kbd> 或 <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">W</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">A</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">S</kbd> <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">D</kbd> 控制方向</p>
        <p className="mt-1">按 <kbd className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">空格</kbd> 开始/暂停游戏</p>
      </div>
    </div>
  );
}
