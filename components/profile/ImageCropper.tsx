"use client";
import DSButton from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useRef, useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedCanvas: HTMLCanvasElement) => void;
  onClose: () => void;
  aspectRatio?: number;
  title?: string;
}

export default function ImageCropper({ imageSrc, onCrop, onClose, aspectRatio = 1, title = "Crop image" }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  // The zoom level that exactly fills the crop frame with no gaps — the
  // floor for zooming out, so the frame can never show empty space.
  const [minZoom, setMinZoom] = useState(1);

  const baseWidth = 360;
  const containerWidth = baseWidth;
  const containerHeight = Math.round(baseWidth / aspectRatio);
  const outputWidth = 1040;
  const outputHeight = Math.round(outputWidth / aspectRatio);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
      fitAndCenter(img.width, img.height);
    };
    img.src = imageSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  // "Cover" fit: scale the image up just enough that it fills the whole
  // crop frame on both axes (no gaps), then center it — matches how the
  // crop frame will actually be sampled in handleCrop.
  const fitAndCenter = (imgWidth: number, imgHeight: number) => {
    const coverZoom = Math.max(containerWidth / imgWidth, containerHeight / imgHeight);
    setMinZoom(coverZoom);
    setZoom(coverZoom);
    setOffsetX((containerWidth - imgWidth * coverZoom) / 2);
    setOffsetY((containerHeight - imgHeight * coverZoom) / 2);
  };

  const centerImage = () => {
    if (imageDimensions.width && imageDimensions.height) fitAndCenter(imageDimensions.width, imageDimensions.height);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - offsetX,
      y: e.clientY - rect.top - offsetY,
    });
  };

  // Keeps the image covering the whole frame while dragging — offsetX/Y is
  // clamped so neither edge of the (zoomed) image can be dragged past the
  // frame's edge and expose a gap.
  const clampOffset = (value: number, imgSize: number, frameSize: number, atZoom: number) => {
    const scaledSize = imgSize * atZoom;
    const minOffset = Math.min(0, frameSize - scaledSize);
    return Math.max(minOffset, Math.min(0, value));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setOffsetX(clampOffset(e.clientX - rect.left - dragStart.x, imageDimensions.width, containerWidth, zoom));
    setOffsetY(clampOffset(e.clientY - rect.top - dragStart.y, imageDimensions.height, containerHeight, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(minZoom, Math.min(3, zoom + delta));
    setZoom(newZoom);
    setOffsetX(prev => clampOffset(prev, imageDimensions.width, containerWidth, newZoom));
    setOffsetY(prev => clampOffset(prev, imageDimensions.height, containerHeight, newZoom));
  };

  const handleCrop = () => {
    if (!imageRef.current || !canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // The preview frame is drawn at containerWidth px but the output canvas
    // is outputWidth px — offsetX/offsetY/zoom were all computed in preview
    // pixel space, so they must be scaled up by this ratio before they mean
    // anything on the (much larger) output canvas. Without this the crop
    // saved a tiny, wrongly-positioned sliver of the image.
    const outputScale = outputWidth / containerWidth;

    const img = imageRef.current;
    const scaledWidth = img.naturalWidth * zoom * outputScale;
    const scaledHeight = img.naturalHeight * zoom * outputScale;

    // Canvas fillStyle can't resolve a CSS custom property string directly —
    // it has to be the computed color, or the fill silently no-ops.
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#000";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    ctx.drawImage(
      img,
      offsetX * outputScale,
      offsetY * outputScale,
      scaledWidth,
      scaledHeight
    );

    onCrop(canvas);
  };

  if (!imageLoaded) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,0.7)" }}>
        <Card padding="none" style={{position: "relative", width: "100%", maxWidth: 400, padding: 24, textAlign: "center", color: "var(--text-secondary)"}}>
          Loading image...
        </Card>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,0.7)" }}>
      <Card padding="none" style={{position: "relative", width: "100%", maxWidth: 450, padding: 24, maxHeight: "90vh", overflowY: "auto"}}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>{title}</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "var(--radius-full)", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Crop preview */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: containerWidth,
            height: containerHeight,
            margin: "0 auto 20px",
            border: "2px solid var(--accent)",
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--bg)",
            cursor: isDragging ? "grabbing" : "grab",
            position: "relative",
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="crop preview"
            style={{
              position: "absolute",
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
              transformOrigin: "0 0",
              maxWidth: "none",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>

        <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", textAlign: "center", marginBottom: 16 }}>
          {aspectRatio === 1 ? "1:1 aspect ratio" : `${Math.round(aspectRatio * 10) / 10}:1 aspect ratio`}
        </div>

        {/* Hidden canvas for actual cropping */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={() => handleZoom(-0.1)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-secondary)",
              fontSize: "var(--font-sm)",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ZoomOut size={14} /> Zoom out
          </button>
          <button
            onClick={() => handleZoom(0.1)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-secondary)",
              fontSize: "var(--font-sm)",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ZoomIn size={14} /> Zoom in
          </button>
          <button
            onClick={centerImage}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-secondary)",
              fontSize: "var(--font-sm)",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", textAlign: "center", marginBottom: 20 }}>
          Drag to position • Zoom to scale
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <DSButton
            onClick={onClose}
            variant="outline" style={{flex: 1}}
          >
            Cancel
          </DSButton>
          <DSButton
            onClick={handleCrop}
            variant="secondary" style={{flex: 1}}
          >
            Crop image
          </DSButton>
        </div>
      </Card>
    </div>
  );
}
