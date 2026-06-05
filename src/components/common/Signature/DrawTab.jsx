import React from "react";
import { Button } from "@/components/ui";
import { PenTool, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const DrawTab = ({
    canvasRef,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                    <PenTool className="w-4 h-4" />
                    <span>{t("invoice.drawBelow")}</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCanvas}
                    className="text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10"
                >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    {t("common.clear")}
                </Button>
            </div>
            <div className="relative border-2 border-dashed border-[rgb(var(--color-border-primary))] rounded-2xl bg-white overflow-hidden touch-none shadow-sm">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="w-full h-auto cursor-crosshair min-h-[300px]"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <p className="text-[10px] text-center text-[rgb(var(--color-text-tertiary))] uppercase font-bold tracking-widest">
                {t("invoice.signInstructions")}
            </p>
        </div>
    );
};

export default DrawTab;
