import React, { useRef, useState } from "react";

interface DraggableResizableProps {
  x: number;
  y: number;
  width: number;
  height: number;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  children: React.ReactNode;
}

export default function DraggableResizable({ x, y, width, height, onMove, onResize, children }: DraggableResizableProps) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [pos, setPos] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const dragRef = useRef<HTMLDivElement>(null);

  // Drag logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = pos.x;
    const origY = pos.y;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setPos({ x: origX + dx, y: origY + dy });
      onMove(origX + dx, origY + dy);
    };
    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Resize logic
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const origW = size.width;
    const origH = size.height;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dw = moveEvent.clientX - startX;
      const dh = moveEvent.clientY - startY;
      setSize({ width: Math.max(40, origW + dw), height: Math.max(20, origH + dh) });
      onResize(Math.max(40, origW + dw), Math.max(20, origH + dh));
    };
    const onMouseUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={dragRef}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        zIndex: dragging || resizing ? 1000 : undefined,
        boxShadow: dragging ? "0 0 8px #888" : undefined,
        background: "rgba(255,255,255,0.8)",
        border: "1px solid #bbb",
        borderRadius: 4,
        userSelect: "none"
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 16,
          height: 16,
          background: "#eee",
          border: "1px solid #aaa",
          borderRadius: "0 0 4px 0",
          cursor: "nwse-resize"
        }}
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
}
