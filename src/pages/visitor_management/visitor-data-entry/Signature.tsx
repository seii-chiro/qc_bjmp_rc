import { useRef } from "react";

type SignaturePadProps = {
    onSave: (dataUrl: string) => void;
};

export function Signature({ onSave }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);

    const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        isDrawing.current = true;
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
    };

    const end = () => {
        isDrawing.current = false;
    };

    const handleClear = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleSave = () => {
        if (!canvasRef.current) return;
        const dataURL = canvasRef.current.toDataURL("image/png");
        onSave(dataURL);
    };

    return (
        <div className="space-y-2">
            <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="border border-gray-300 rounded w-full"
                onPointerDown={start}
                onPointerMove={draw}
                onPointerUp={end}
                onPointerLeave={end}
            />
            <div className="flex justify-between">
                <button onClick={handleClear} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
                    Clear
                </button>
                <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                    Save Signature
                </button>
            </div>
        </div>
    );
}
