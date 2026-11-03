import React, { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  isAccent: 'indigo' | 'emerald' | 'normal';
}

export const InteractiveDsaBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? 300 : 300,
  });
  const [isMouseActive, setIsMouseActive] = useState(false);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isMouseActive) setIsMouseActive(true);
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      setIsMouseActive(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMouseActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create 45 floating DSA graph nodes
    const nodeCount = 45;
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const isEmerald = i % 8 === 0;
      const isIndigo = i % 5 === 0 && !isEmerald;
      const accentType: 'indigo' | 'emerald' | 'normal' = isEmerald
        ? 'emerald'
        : isIndigo
        ? 'indigo'
        : 'normal';

      const color = isEmerald
        ? '#10B981'
        : isIndigo
        ? '#6366F1'
        : 'rgba(161, 161, 170, 0.45)';

      const baseRadius = isEmerald || isIndigo ? 2.8 : 2.0;

      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: baseRadius,
        baseRadius,
        color,
        isAccent: accentType,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop (60 FPS)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // 1. Update and position nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move node
        node.x += node.vx;
        node.y += node.vy;

        // Bounce gently off borders
        if (node.x < 10) {
          node.x = 10;
          node.vx *= -1;
        } else if (node.x > width - 10) {
          node.x = width - 10;
          node.vx *= -1;
        }

        if (node.y < 10) {
          node.y = 10;
          node.vy *= -1;
        } else if (node.y > height - 10) {
          node.y = height - 10;
          node.vy *= -1;
        }

        // Mouse root-node interaction
        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180 && dist > 1) {
            // Gentle magnetic repulsion/deflection
            const force = (180 - dist) / 180;
            const fx = (dx / dist) * force * 0.6;
            const fy = (dy / dist) * force * 0.6;
            node.x += fx;
            node.y += fy;

            // Enlarge and brighten active node
            node.radius = node.baseRadius + force * 2.2;

            // Draw glowing gradient connection line between cursor and nearby nodes
            const gradient = ctx.createLinearGradient(mouse.x, mouse.y, node.x, node.y);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.6)');

            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.2 * force;
            ctx.stroke();

            // Circuit node glow around active vertex
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
            ctx.fillStyle =
              node.isAccent === 'emerald'
                ? 'rgba(16, 185, 129, 0.25)'
                : 'rgba(99, 102, 241, 0.25)';
            ctx.fill();
          } else {
            // Reset to base radius gradually
            node.radius += (node.baseRadius - node.radius) * 0.1;
          }
        } else {
          node.radius += (node.baseRadius - node.radius) * 0.1;
        }
      }

      // 2. Draw node-to-node graph edges (within 130px)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.22;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(161, 161, 170, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // 3. Draw nodes (Graph vertices)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        if (node.isAccent !== 'normal') {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 1.2, 0, Math.PI * 2);
          ctx.strokeStyle = node.isAccent === 'emerald' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)';
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Mouse Spotlight Glow */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: isMouseActive
            ? `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.04) 40%, transparent 80%)`
            : `radial-gradient(600px circle at 50% 30%, rgba(99, 102, 241, 0.08), rgba(16, 185, 129, 0.03) 40%, transparent 80%)`,
        }}
      />

      {/* 2. Interactive Canvas for DSA Graph Nodes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
    </div>
  );
};

export default InteractiveDsaBackground;
