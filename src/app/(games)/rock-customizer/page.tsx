import React, { useEffect, useRef, useState } from "react";

// Pet Rock Customizer - Single-file Next.js page/component
// Tailwind CSS classes assumed available in the project.
// Drop this file into pages/index.tsx (Next.js <=13) or app/page.tsx (adapt if using App Router).

export default function PetRockCustomizer() {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Rock + layer model
  type Layer = {
    id: string;
    type: "rock" | "hat" | "eyes" | "mouth" | "sticker" | "pattern" | "draw" | "background";
    x: number;
    y: number;
    scale: number;
    rotation: number; // degrees
    props: any; // variant-specific props
    z: number;
    visible?: boolean;
  };

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const [isWobbling, setIsWobbling] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<Layer[][]>([]);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);
  const [rockShape, setRockShape] = useState<number>(0); // preset shapes
  const [bgColor, setBgColor] = useState<string>("#f6f4ef");
  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(6);

  // utilities
  const uid = (p = "") => Math.random().toString(36).slice(2, 9) + p;

  // initial setup
  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = canvasSize.w * devicePixelRatio;
    canvas.height = canvasSize.h * devicePixelRatio;
    canvas.style.width = canvasSize.w + "px";
    canvas.style.height = canvasSize.h + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctxRef.current = ctx;

    // load from localStorage gallery & last design
    const saved = localStorage.getItem("petrock_design");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLayers(parsed.layers || []);
        setBgColor(parsed.bgColor || "#f6f4ef");
      } catch {}
    } else {
      // seed with a rock layer + eyes + sticker so the UI is not empty
      const seed: Layer[] = [
        {
          id: uid("rock"),
          type: "rock",
          x: 400,
          y: 350,
          scale: 1,
          rotation: 0,
          props: { color: "#c6b59c", pattern: null },
          z: 0,
          visible: true,
        },
        {
          id: uid("eyes"),
          type: "eyes",
          x: 360,
          y: 320,
          scale: 0.9,
          rotation: 0,
          props: { kind: "googly" },
          z: 1,
          visible: true,
        },
        {
          id: uid("hat"),
          type: "hat",
          x: 420,
          y: 240,
          scale: 0.8,
          rotation: -10,
          props: { kind: "party" },
          z: 2,
          visible: true,
        },
      ];
      setLayers(seed);
    }

    const savedGallery = localStorage.getItem("petrock_gallery");
    if (savedGallery) setGallery(JSON.parse(savedGallery));

    // redraw on resize
    const onResize = () => {
      // keep canvas size but also allow window controls
      drawAll();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    drawAll();
    // save current design
    localStorage.setItem("petrock_design", JSON.stringify({ layers, bgColor }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, bgColor, canvasSize, isWobbling]);

  // push to undo stack whenever layers change (simple strategy)
  useEffect(() => {
    setUndoStack((s) => {
      const copy = s.slice(-49); // cap
      copy.push(JSON.parse(JSON.stringify(layers)));
      return copy;
    });
    setRedoStack([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers.length]);

  // drawing helpers
  function clearCanvas() {
    const ctx = ctxRef.current!;
    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
  }

  function drawAll(timestamp?: number) {
    const ctx = ctxRef.current!;
    if (!ctx) return;
    clearCanvas();

    // background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

    // optional silly grid / sparkles when over-featured mode
    drawSparkles(ctx);

    // sort layers by z
    const visible = layers.filter((l) => l.visible !== false).sort((a, b) => a.z - b.z);
    visible.forEach((layer) => {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      if (isWobbling) {
        const wob = Math.sin((Date.now() + layer.z * 123) / 400) * 4;
        ctx.rotate(((layer.rotation + wob) * Math.PI) / 180);
      } else ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scale, layer.scale);

      // draw based on type
      switch (layer.type) {
        case "rock":
          drawRock(ctx, layer);
          break;
        case "eyes":
          drawEyes(ctx, layer);
          break;
        case "hat":
          drawHat(ctx, layer);
          break;
        case "mouth":
          drawMouth(ctx, layer);
          break;
        case "sticker":
          drawSticker(ctx, layer);
          break;
        case "pattern":
          drawPattern(ctx, layer);
          break;
        case "draw":
          drawFreehand(ctx, layer);
          break;
        case "background":
          // handled already
          break;
        default:
          break;
      }
      ctx.restore();
    });

    // selection highlight
    if (selectedId) {
      const sel = layers.find((l) => l.id === selectedId);
      if (sel) drawSelection(ctx, sel);
    }
  }

  function drawSparkles(ctx: CanvasRenderingContext2D) {
    // tiny animated white dots for extra silliness
    for (let i = 0; i < 6; i++) {
      const t = ((Date.now() / 800) + i) % 100;
      const x = (100 + i * 120 + (t * 2)) % canvasSize.w;
      const y = 50 + ((i * 70) % (canvasSize.h - 100));
      ctx.beginPath();
      ctx.globalAlpha = 0.12;
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // primitive rock shapes
  function drawRock(ctx: CanvasRenderingContext2D, layer: Layer) {
    const color = layer.props?.color || "#c6b59c";
    const w = 260;
    const h = 200;
    ctx.beginPath();
    if (rockShape === 0) {
      // classic oval
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    } else if (rockShape === 1) {
      // lumpy
      ctx.moveTo(-120, -10);
      ctx.bezierCurveTo(-160, -90, 100, -110, 120, -10);
      ctx.bezierCurveTo(160, 80, -120, 110, -120, -10);
    } else {
      // tall
      ctx.ellipse(0, 0, w / 2, h / 2 * 1.4, 0, 0, Math.PI * 2);
    }
    // subtle 2-color shading and texture
    const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    g.addColorStop(0, lighten(color, -8));
    g.addColorStop(1, lighten(color, 6));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.stroke();

    // speckles
    for (let i = 0; i < 25; i++) {
      const rx = -w / 2 + Math.random() * w;
      const ry = -h / 2 + Math.random() * h;
      ctx.beginPath();
      ctx.globalAlpha = 0.12;
      ctx.arc(rx * 0.6, ry * 0.7, Math.random() * 4, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawEyes(ctx: CanvasRenderingContext2D, layer: Layer) {
    const kind = layer.props?.kind || "simple";
    if (kind === "googly") {
      // left eye
      ctx.beginPath();
      ctx.arc(-40, -10, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.beginPath();
      const pupilOffsetX = Math.sin(Date.now() / 300) * 4;
      ctx.arc(-40 + pupilOffsetX, -10, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();

      // right
      ctx.beginPath();
      ctx.arc(40, -10, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.beginPath();
      const pupilOffsetX2 = Math.cos(Date.now() / 250) * 4;
      ctx.arc(40 + pupilOffsetX2, -10, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(-50, -20, 30, 14);
      ctx.fillRect(20, -20, 30, 14);
    }
  }

  function drawHat(ctx: CanvasRenderingContext2D, layer: Layer) {
    const kind = layer.props?.kind || "party";
    if (kind === "party") {
      ctx.beginPath();
      ctx.moveTo(-60, -30);
      ctx.lineTo(0, -110);
      ctx.lineTo(60, -30);
      ctx.closePath();
      ctx.fillStyle = "#ff5c7a";
      ctx.fill();
      // pompom
      ctx.beginPath();
      ctx.arc(0, -120, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd500";
      ctx.fill();
    } else if (kind === "bowler") {
      ctx.fillStyle = "#333";
      ctx.fillRect(-80, -80, 160, 30);
      ctx.beginPath();
      ctx.ellipse(0, -70, 60, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "wizard") {
      ctx.fillStyle = "#5b3eec";
      ctx.beginPath();
      ctx.moveTo(-30, -30);
      ctx.lineTo(0, -130);
      ctx.lineTo(30, -30);
      ctx.closePath();
      ctx.fill();
      // stars
      ctx.fillStyle = "#ffd500";
      ctx.fillRect(-5, -70, 4, 4);
      ctx.fillRect(10, -90, 4, 4);
    }
  }

  function drawMouth(ctx: CanvasRenderingContext2D, layer: Layer) {
    ctx.beginPath();
    ctx.moveTo(-40, 30);
    ctx.quadraticCurveTo(0, 60, 40, 30);
    ctx.strokeStyle = "#331b00";
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  function drawSticker(ctx: CanvasRenderingContext2D, layer: Layer) {
    const emoji = layer.props?.emoji || "⭐";
    ctx.font = "48px serif";
    ctx.textAlign = "center";
    ctx.fillText(emoji, 0, 12);
  }

  function drawPattern(ctx: CanvasRenderingContext2D, layer: Layer) {
    // simple stripes for demonstration
    const size = 16;
    ctx.save();
    ctx.rotate((30 * Math.PI) / 180);
    for (let i = -400; i < 400; i += size) {
      ctx.fillRect(i, -300, size / 2, 800);
    }
    ctx.restore();
  }

  function drawFreehand(ctx: CanvasRenderingContext2D, layer: Layer) {
    // props.path is array of points
    const path: [number, number][] = layer.props?.path || [];
    ctx.beginPath();
    path.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineWidth = layer.props?.width || 6;
    ctx.strokeStyle = layer.props?.color || "#000";
    ctx.stroke();
  }

  function drawSelection(ctx: CanvasRenderingContext2D, sel: Layer) {
    ctx.save();
    ctx.translate(sel.x, sel.y);
    ctx.rotate((sel.rotation * Math.PI) / 180);
    ctx.scale(sel.scale, sel.scale);
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(-130, -140, 260, 280);
    ctx.restore();
  }

  // helpers
  function lighten(hex: string, percent: number) {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return "#" + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }

  // UI actions
  function addLayer(type: Layer["type"]) {
    const l: Layer = {
      id: uid(type),
      type,
      x: canvasSize.w / 2,
      y: canvasSize.h / 2,
      scale: 1,
      rotation: 0,
      props: type === "sticker" ? { emoji: randomEmoji() } : {},
      z: layers.length + 1,
      visible: true,
    };
    setLayers((p) => [...p, l]);
    setSelectedId(l.id);
  }

  function randomEmoji() {
    const list = ["🤪", "🍌", "🎩", "🌵", "🦄", "⭐", "😜", "🍕", "💩", "👁️"]; // silly set
    return list[Math.floor(Math.random() * list.length)];
  }

  function duplicateLayer(id: string) {
    const orig = layers.find((l) => l.id === id);
    if (!orig) return;
    const copy: Layer = JSON.parse(JSON.stringify(orig));
    copy.id = uid("dup");
    copy.x += 20;
    copy.y += 20;
    copy.z = layers.length + 1;
    setLayers((p) => [...p, copy]);
    setSelectedId(copy.id);
  }

  function removeLayer(id: string) {
    setLayers((p) => p.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function bringForward(id: string) {
    setLayers((ls) => {
      const copy = ls.slice();
      const idx = copy.findIndex((l) => l.id === id);
      if (idx === -1) return ls;
      const item = copy.splice(idx, 1)[0];
      copy.push(item);
      // reassign z
      return copy.map((c, i) => ({ ...c, z: i }));
    });
  }

  function sendBackward(id: string) {
    setLayers((ls) => {
      const copy = ls.slice();
      const idx = copy.findIndex((l) => l.id === id);
      if (idx === -1) return ls;
      const item = copy.splice(idx, 1)[0];
      copy.unshift(item);
      return copy.map((c, i) => ({ ...c, z: i }));
    });
  }

  function randomizeAll() {
    // silly intense randomizer
    setLayers((ls) =>
      ls.map((l) => ({
        ...l,
        x: 120 + Math.random() * (canvasSize.w - 240),
        y: 120 + Math.random() * (canvasSize.h - 240),
        rotation: (Math.random() - 0.5) * 120,
        scale: 0.6 + Math.random() * 1.6,
        props: {
          ...l.props,
          emoji: randomEmoji(),
          kind: ["party", "wizard", "bowler"][Math.floor(Math.random() * 3)],
          color: randomColor(),
        },
      }))
    );
  }

  function randomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
  }

  // export image
  function exportPNG() {
    const canvas = canvasRef.current!;
    const data = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = data;
    a.download = `pet-rock-${new Date().toISOString()}.png`;
    a.click();
  }

  // gallery save
  function saveToGallery() {
    const canvas = canvasRef.current!;
    const data = canvas.toDataURL("image/png");
    const ng = [data, ...gallery].slice(0, 50);
    setGallery(ng);
    localStorage.setItem("petrock_gallery", JSON.stringify(ng));
  }

  // undo/redo
  function undo() {
    setUndoStack((u) => {
      if (u.length <= 1) return u;
      const next = u.slice(0, -1);
      const last = next[next.length - 1];
      setLayers(JSON.parse(JSON.stringify(last)));
      setRedoStack((r) => [u[u.length - 1], ...r]);
      return next;
    });
  }

  function redo() {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const top = r[0];
      setLayers(JSON.parse(JSON.stringify(top)));
      return r.slice(1);
    });
  }

  // keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") undo();
      if ((e.ctrlKey || e.metaKey) && e.key === "y") redo();
      if (e.key === "r") randomizeAll();
      if (e.key === "w") setIsWobbling((s) => !s);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // drag & transform handlers (simple selection + drag)
  useEffect(() => {
    const canvas = canvasRef.current!;
    let dragging = false;
    let dragId: string | null = null;
    let lastPos = { x: 0, y: 0 };

    const toCanvas = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    };

    const onDown = (ev: PointerEvent) => {
      (ev.target as Element).setPointerCapture(ev.pointerId);
      const p = toCanvas(ev);
      // hit test layers (reverse z)
      const hit = [...layers].reverse().find((l) => {
        // rough bounding box hit test
        const w = 130 * l.scale;
        const h = 140 * l.scale;
        return p.x >= l.x - w && p.x <= l.x + w && p.y >= l.y - h && p.y <= l.y + h;
      });
      if (hit) {
        setSelectedId(hit.id);
        dragId = hit.id;
        dragging = true;
        lastPos = p;
      } else {
        setSelectedId(null);
      }
    };

    const onMove = (ev: PointerEvent) => {
      if (!dragging || !dragId) return;
      const p = toCanvas(ev);
      const dx = p.x - lastPos.x;
      const dy = p.y - lastPos.y;
      setLayers((ls) => ls.map((l) => (l.id === dragId ? { ...l, x: l.x + dx, y: l.y + dy } : l)));
      lastPos = p;
    };

    const onUp = (ev: PointerEvent) => {
      dragging = false;
      dragId = null;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  // name generator + fun metadata
  function generateName() {
    const adjectives = ["Soggy", "Slimy", "Sir", "Baron", "Tiny", "Shiny", "Fizzy", "Gargantuan", "Wobbly", "Snazzy"];
    const nouns = ["Pebble", "Rock", "Boulder", "McStoneface", "Nug", "Granite", "Pebbleton", "Flint", "Puff", "Spud"];
    const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    return name + (Math.random() < 0.2 ? ` the ${["Magnificent","Eternal","Dramatic"][Math.floor(Math.random()*3)]}` : "");
  }

  // simple share
  async function shareDesign() {
    try {
      const canvas = canvasRef.current!;
      if ((navigator as any).share) {
        canvas.toBlob((blob) => {
          const file = new File([blob!], "pet-rock.png", { type: "image/png" });
          ;(navigator as any).share({ files: [file], title: "My Pet Rock" });
        });
      } else {
        alert("Web Share API not available — try exporting PNG instead.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // small UI render
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4">
        {/* Left controls */}
        <aside className="col-span-3 bg-white/80 p-4 rounded-2xl shadow-xl backdrop-blur">
          <h2 className="text-2xl font-extrabold">Pet Rock Lab 🪨✨</h2>
          <p className="text-sm text-gray-600 mb-3">The silliest, over-featured rock customizer ever.</p>

          <div className="flex gap-2 flex-wrap mb-3">
            <button onClick={() => addLayer("rock")} className="btn">Add Rock</button>
            <button onClick={() => addLayer("hat")} className="btn">Add Hat</button>
            <button onClick={() => addLayer("eyes")} className="btn">Add Eyes</button>
            <button onClick={() => addLayer("mouth")} className="btn">Add Mouth</button>
            <button onClick={() => addLayer("sticker")} className="btn">Sticker</button>
            <button onClick={() => addLayer("draw")} className="btn">Draw</button>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Background</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-md" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Rock color</label>
            <input type="color" value={(layers.find(l=>l.type==='rock')?.props.color) || '#c6b59c'} onChange={(e)=>{
              setLayers(ls=>ls.map(l=> l.type==='rock'?{...l, props:{...l.props, color:e.target.value}}:l))
            }} className="w-full h-10 rounded-md" />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Rock shape</label>
            <select value={rockShape} onChange={(e)=>setRockShape(Number(e.target.value))} className="w-full p-2 rounded-md">
              <option value={0}>Classic Oval</option>
              <option value={1}>Lumpy</option>
              <option value={2}>Tall</option>
            </select>
          </div>

          <div className="flex gap-2 mb-3">
            <button onClick={randomizeAll} className="btn">Randomize (R)</button>
            <button onClick={()=>{setIsWobbling(s=>!s)}} className="btn">Wobble (W)</button>
          </div>

          <div className="flex gap-2">
            <button onClick={undo} className="btn">Undo</button>
            <button onClick={redo} className="btn">Redo</button>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            <strong>Tips:</strong>
            <ul className="list-disc pl-5">
              <li>Drag items on the canvas to move them.</li>
              <li>Click layer in the list to select; use duplicate/trash to manage.</li>
              <li>Shortcuts: <kbd>R</kbd> randomize, <kbd>W</kbd> wobble, <kbd>Ctrl+Z</kbd> undo.</li>
            </ul>
          </div>
        </aside>

        {/* Canvas area */}
        <main className="col-span-6 bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">Canvas</h3>
              <div className="text-sm text-gray-500">Click & drag to move parts</div>
            </div>
            <div className="flex gap-2">
              <button onClick={exportPNG} className="btn">Export PNG</button>
              <button onClick={saveToGallery} className="btn">Save to Gallery</button>
              <button onClick={shareDesign} className="btn">Share</button>
            </div>
          </div>

          <div className="border border-dashed border-gray-300 rounded-lg p-2 bg-gradient-to-b from-white to-gray-50">
            <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h} className="rounded-lg shadow-inner" />
          </div>

          <div className="mt-3 w-full flex gap-2 items-center">
            <input type="text" className="flex-1 p-2 rounded-md shadow-inner" placeholder={generateName()} />
            <button onClick={()=>{ const n=generateName(); navigator.clipboard?.writeText(n); alert(`Generated name copied:\n${n}`)}} className="btn">Gen Name</button>
          </div>
        </main>

        {/* Right panel - layer manager & gallery */}
        <aside className="col-span-3 bg-white/80 p-4 rounded-2xl shadow-xl backdrop-blur flex flex-col gap-3">
          <h3 className="text-lg font-bold">Layers</h3>
          <div className="space-y-2 overflow-auto max-h-64">
            {layers.slice().reverse().map((l) => (
              <div key={l.id} className={`flex items-center justify-between p-2 rounded-md ${selectedId===l.id? 'ring-2 ring-indigo-300':''}`}>
                <div className="flex items-center gap-2" onClick={()=>setSelectedId(l.id)}>
                  <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-sm">{l.type}</div>
                  <div className="text-sm">
                    <div className="font-medium">{l.type} <span className="text-xs text-gray-500">#{l.id.slice(0,4)}</span></div>
                    <div className="text-xs text-gray-500">z: {l.z}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>duplicateLayer(l.id)} className="btn-xs">Dup</button>
                  <button onClick={()=>bringForward(l.id)} className="btn-xs">↑</button>
                  <button onClick={()=>sendBackward(l.id)} className="btn-xs">↓</button>
                  <button onClick={()=>removeLayer(l.id)} className="btn-xs">Del</button>
                </div>
              </div>
            ))}
          </div>

          {/* selected layer properties */}
          <div>
            <h4 className="text-sm font-semibold">Selected</h4>
            {selectedId ? (
              (() => {
                const s = layers.find((l) => l.id === selectedId)!;
                return (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <label className="text-xs">X</label>
                      <input type="range" min={0} max={canvasSize.w} value={s.x} onChange={(e)=>setLayers(ls=>ls.map(l=> l.id===s.id?{...l,x:Number(e.target.value)}:l))} />
                    </div>
                    <div className="flex gap-2">
                      <label className="text-xs">Y</label>
                      <input type="range" min={0} max={canvasSize.h} value={s.y} onChange={(e)=>setLayers(ls=>ls.map(l=> l.id===s.id?{...l,y:Number(e.target.value)}:l))} />
                    </div>
                    <div className="flex gap-2">
                      <label className="text-xs">Scale</label>
                      <input type="range" min={0.2} max={2} step={0.01} value={s.scale} onChange={(e)=>setLayers(ls=>ls.map(l=> l.id===s.id?{...l,scale:Number(e.target.value)}:l))} />
                    </div>
                    <div className="flex gap-2">
                      <label className="text-xs">Rotate</label>
                      <input type="range" min={-180} max={180} value={s.rotation} onChange={(e)=>setLayers(ls=>ls.map(l=> l.id===s.id?{...l,rotation:Number(e.target.value)}:l))} />
                    </div>
                    {s.type === "sticker" && (
                      <div>
                        <label className="text-xs">Emoji</label>
                        <input value={s.props.emoji} onChange={(e)=>setLayers(ls=>ls.map(l=> l.id===s.id?{...l, props:{...l.props, emoji:e.target.value}}:l))} className="w-full p-1 rounded-md" />
                      </div>
                    )}
                    {s.type === "rock" && (
                      <div>
                        <label className="text-xs">Rock color</label>
                        <input type="color" value={s.props.color || '#c6b59c'} onChange={(e)=>setLayers(ls=>ls.map(l=> l.id===s.id?{...l, props:{...l.props, color:e.target.value}}:l))} className="w-full h-8 rounded-md" />
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button onClick={()=>duplicateLayer(s.id)} className="btn">Duplicate</button>
                      <button onClick={()=>removeLayer(s.id)} className="btn">Delete</button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-xs text-gray-500">No layer selected</div>
            )}
          </div>

          {/* gallery */}
          <div>
            <h4 className="text-sm font-semibold">Gallery</h4>
            <div className="flex gap-2 overflow-x-auto p-2">
              {gallery.length === 0 && <div className="text-xs text-gray-500">No saved rocks yet.</div>}
              {gallery.map((g, i) => (
                <img key={i} src={g} className="w-20 h-20 rounded-md shadow-sm" alt={`saved-${i}`} onClick={()=>{ const img = new Image(); img.src=g; img.onload=()=>{ const ctx = ctxRef.current!; ctx.clearRect(0,0,canvasSize.w,canvasSize.h); ctx.drawImage(img,0,0,canvasSize.w,canvasSize.h); }} } />
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .btn { padding: 0.45rem 0.7rem; background: linear-gradient(180deg,#fff,#f3f4f6); border-radius: 0.5rem; box-shadow: 0 1px 0 rgba(0,0,0,0.04); font-weight: 600; }
        .btn-xs { padding: 0.25rem 0.4rem; background: #f8fafc; border-radius: 0.375rem; }
      `}</style>
    </div>
  );
}
