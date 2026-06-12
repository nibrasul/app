"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Detect touch device outside of render
function getIsTouchDevice() {
  if (typeof window === "undefined") return true;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function subscribeTouchChange(callback: () => void) {
  window.addEventListener("pointerdown", callback);
  return () => window.removeEventListener("pointerdown", callback);
}

export default function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isTouchDevice = useSyncExternalStore(
    subscribeTouchChange,
    getIsTouchDevice,
    () => true
  );

  useEffect(() => {
    if (isTouchDevice) return;

    const mouse = { x: 0, y: 0 };
    const outerPos = { x: 0, y: 0 };
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!isVisible) setIsVisible(true);

      if (innerRef.current) {
        innerRef.current.style.left = `${e.clientX}px`;
        innerRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const animate = () => {
      outerPos.x += (mouse.x - outerPos.x) * 0.12;
      outerPos.y += (mouse.y - outerPos.y) * 0.12;

      if (outerRef.current) {
        outerRef.current.style.left = `${outerPos.x}px`;
        outerRef.current.style.top = `${outerPos.y}px`;
      }

      animationId = requestAnimationFrame(animate);
    };

    const attachHoverListeners = () => {
      const allInteractive = document.querySelectorAll(
        "a, button, [role='button'], input, textarea, .magnetic-hover"
      );
      allInteractive.forEach((el) => {
        el.addEventListener("mouseenter", () => setIsHovering(true));
        el.addEventListener("mouseleave", () => setIsHovering(false));
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    animationId = requestAnimationFrame(animate);

    attachHoverListeners();
    const observer = new MutationObserver(attachHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [isTouchDevice, isVisible]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Outer ring */}
      <div
        ref={outerRef}
        className="fixed top-0 left-0 z-[10000] pointer-events-none mix-blend-difference"
        style={{
          width: isHovering ? "48px" : "28px",
          height: isHovering ? "48px" : "28px",
          marginLeft: isHovering ? "-24px" : "-14px",
          marginTop: isHovering ? "-24px" : "-14px",
          borderRadius: "50%",
          border: `1.5px solid rgba(245, 245, 245, ${isHovering ? 0.3 : 0.15})`,
          opacity: isVisible ? 1 : 0,
          transition: "width 0.3s ease, height 0.3s ease, margin 0.3s ease, opacity 0.3s ease, border-color 0.3s ease",
          willChange: "left, top",
        }}
      />
      {/* Inner dot */}
      <div
        ref={innerRef}
        className="fixed top-0 left-0 z-[10000] pointer-events-none mix-blend-difference"
        style={{
          width: isHovering ? "4px" : "6px",
          height: isHovering ? "4px" : "6px",
          marginLeft: isHovering ? "-2px" : "-3px",
          marginTop: isHovering ? "-2px" : "-3px",
          borderRadius: "50%",
          backgroundColor: "#F5F5F5",
          opacity: isVisible ? 1 : 0,
          transition: "width 0.2s ease, height 0.2s ease, margin 0.2s ease, opacity 0.2s ease",
          willChange: "left, top",
        }}
      />
    </>
  );
}
