"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
}

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    // 初始化星星
    const initStars = () => {
      const starCount = Math.floor((canvas.width * canvas.height) / 10000);
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      }));
    };

    // 创建流星
    const createShootingStar = () => {
      if (shootingStarsRef.current.length < 2 && Math.random() < 0.005) {
        shootingStarsRef.current.push({
          x: Math.random() * canvas.width,
          y: 0,
          length: Math.random() * 60 + 30,
          speed: Math.random() * 6 + 4,
          opacity: 1,
          angle: (Math.random() * 30 + 15) * (Math.PI / 180),
        });
      }
    };

    // 绘制星云
    const drawNebula = () => {
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.2,
        canvas.height * 0.3,
        0,
        canvas.width * 0.2,
        canvas.height * 0.3,
        canvas.width * 0.3
      );
      gradient1.addColorStop(0, "rgba(139, 92, 246, 0.06)");
      gradient1.addColorStop(0.5, "rgba(139, 92, 246, 0.02)");
      gradient1.addColorStop(1, "transparent");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.8,
        canvas.height * 0.7,
        0,
        canvas.width * 0.8,
        canvas.height * 0.7,
        canvas.width * 0.25
      );
      gradient2.addColorStop(0, "rgba(34, 211, 238, 0.04)");
      gradient2.addColorStop(0.5, "rgba(34, 211, 238, 0.01)");
      gradient2.addColorStop(1, "transparent");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // 绘制太阳
    const drawSun = () => {
      const sunRadius = Math.min(canvas.width, canvas.height) * 0.035;
      const sunX = canvas.width * 0.88;
      const sunY = canvas.height * 0.15;

      // 太阳光芒（多层）
      for (let i = 3; i >= 0; i--) {
        const glowRadius = sunRadius * (3 + i * 1.5);
        const glowGradient = ctx.createRadialGradient(
          sunX, sunY, sunRadius * 0.5,
          sunX, sunY, glowRadius
        );
        glowGradient.addColorStop(0, `rgba(251, 191, 36, ${0.15 - i * 0.03})`);
        glowGradient.addColorStop(0.5, `rgba(251, 146, 60, ${0.08 - i * 0.02})`);
        glowGradient.addColorStop(1, "transparent");
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 太阳本体
      const sunGradient = ctx.createRadialGradient(
        sunX - sunRadius * 0.3,
        sunY - sunRadius * 0.3,
        0,
        sunX,
        sunY,
        sunRadius
      );
      sunGradient.addColorStop(0, "#fef3c7");
      sunGradient.addColorStop(0.3, "#fcd34d");
      sunGradient.addColorStop(0.6, "#f59e0b");
      sunGradient.addColorStop(1, "#d97706");

      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = sunGradient;
      ctx.fill();

      return { x: sunX, y: sunY };
    };

    // 绘制地球（围绕太阳旋转）
    const drawEarth = (time: number, sunPos: { x: number; y: number }) => {
      const earthOrbitRadius = Math.min(canvas.width, canvas.height) * 0.18;
      const earthRadius = Math.min(canvas.width, canvas.height) * 0.025;
      
      // 地球公转角度
      const earthAngle = (time * 0.0002) % (Math.PI * 2);
      const earthX = sunPos.x + Math.cos(earthAngle) * earthOrbitRadius;
      const earthY = sunPos.y + Math.sin(earthAngle) * earthOrbitRadius * 0.4;

      // 地球轨道
      ctx.beginPath();
      ctx.ellipse(sunPos.x, sunPos.y, earthOrbitRadius, earthOrbitRadius * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 地球光晕
      const glowGradient = ctx.createRadialGradient(
        earthX, earthY, earthRadius * 0.8,
        earthX, earthY, earthRadius * 1.8
      );
      glowGradient.addColorStop(0, "rgba(59, 130, 246, 0.25)");
      glowGradient.addColorStop(1, "transparent");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 地球本体
      const earthGradient = ctx.createRadialGradient(
        earthX - earthRadius * 0.3,
        earthY - earthRadius * 0.3,
        0,
        earthX,
        earthY,
        earthRadius
      );
      earthGradient.addColorStop(0, "#60a5fa");
      earthGradient.addColorStop(0.4, "#3b82f6");
      earthGradient.addColorStop(0.7, "#2563eb");
      earthGradient.addColorStop(1, "#1e3a5f");

      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.fillStyle = earthGradient;
      ctx.fill();

      // 大陆
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.clip();

      const continentOffset = (time * 0.0001) % (Math.PI * 2);
      ctx.fillStyle = "rgba(34, 197, 94, 0.35)";
      ctx.beginPath();
      ctx.ellipse(
        earthX + Math.cos(continentOffset) * earthRadius * 0.2,
        earthY - earthRadius * 0.15,
        earthRadius * 0.2,
        earthRadius * 0.25,
        0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        earthX + Math.cos(continentOffset + 2) * earthRadius * 0.3,
        earthY + earthRadius * 0.2,
        earthRadius * 0.15,
        earthRadius * 0.1,
        -0.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // 大气层
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(147, 197, 253, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      return { x: earthX, y: earthY, radius: earthRadius };
    };

    // 绘制月球（围绕地球旋转）
    const drawMoon = (time: number, earthPos: { x: number; y: number; radius: number }) => {
      const moonOrbitRadius = earthPos.radius * 2.5;
      const moonRadius = earthPos.radius * 0.28;

      // 月球公转角度（比地球公转快）
      const moonAngle = (time * 0.001) % (Math.PI * 2);
      const moonX = earthPos.x + Math.cos(moonAngle) * moonOrbitRadius;
      const moonY = earthPos.y + Math.sin(moonAngle) * moonOrbitRadius * 0.5;

      // 月球轨道
      ctx.beginPath();
      ctx.ellipse(earthPos.x, earthPos.y, moonOrbitRadius, moonOrbitRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 月球光晕
      const moonGlow = ctx.createRadialGradient(
        moonX, moonY, moonRadius * 0.5,
        moonX, moonY, moonRadius * 2
      );
      moonGlow.addColorStop(0, "rgba(226, 232, 240, 0.2)");
      moonGlow.addColorStop(1, "transparent");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // 月球本体
      const moonGradient = ctx.createRadialGradient(
        moonX - moonRadius * 0.3,
        moonY - moonRadius * 0.3,
        0,
        moonX,
        moonY,
        moonRadius
      );
      moonGradient.addColorStop(0, "#f1f5f9");
      moonGradient.addColorStop(0.5, "#cbd5e1");
      moonGradient.addColorStop(1, "#64748b");

      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fillStyle = moonGradient;
      ctx.fill();

      // 环形山
      ctx.fillStyle = "rgba(100, 116, 139, 0.25)";
      ctx.beginPath();
      ctx.arc(moonX + moonRadius * 0.15, moonY - moonRadius * 0.1, moonRadius * 0.12, 0, Math.PI * 2);
      ctx.fill();
    };

    // 绘制星星
    const drawStars = (time: number) => {
      for (const star of starsRef.current) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const currentOpacity = star.opacity * (0.5 + twinkle * 0.5);

        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2.5
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
        gradient.addColorStop(0.4, `rgba(200, 220, 255, ${currentOpacity * 0.4})`);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();
      }
    };

    // 绘制流星
    const drawShootingStars = () => {
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        const endX = star.x + Math.cos(star.angle) * star.length;
        const endY = star.y + Math.sin(star.angle) * star.length;

        const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(0.3, `rgba(200, 220, 255, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.01;

        return star.opacity > 0 && star.y < canvas.height && star.x < canvas.width;
      });
    };

    // 动画循环
    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawNebula();
      drawStars(time * 0.001);
      
      const sunPos = drawSun();
      const earthPos = drawEarth(time, sunPos);
      drawMoon(time, earthPos);
      
      createShootingStar();
      drawShootingStars();

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-20"
      style={{ background: "linear-gradient(to bottom, #0f172a, #020617)" }}
    />
  );
}
