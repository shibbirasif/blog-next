'use client';

import React, { useState, useRef, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

const ResizableImageComponent: React.FC<NodeViewProps> = ({
    node,
    updateAttributes,
    selected,
}) => {
    const { src, alt, title, width, height } = node.attrs;
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const imgRef = useRef<HTMLImageElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent, corner: string) => {
        e.preventDefault();
        setIsResizing(true);

        const rect = imgRef.current?.getBoundingClientRect();
        if (!rect) return;

        setDragStart({
            x: e.clientX,
            y: e.clientY,
            width: width || rect.width,
            height: height || rect.height,
        });

        const handleMouseMove = (e: MouseEvent) => {
            if (!imgRef.current) return;

            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;

            let newWidth = dragStart.width;
            let newHeight = dragStart.height;

            // Calculate new dimensions based on corner being dragged
            switch (corner) {
                case 'se': // Southeast corner
                    newWidth = Math.max(50, dragStart.width + deltaX);
                    newHeight = Math.max(50, dragStart.height + deltaY);
                    break;
                case 'sw': // Southwest corner
                    newWidth = Math.max(50, dragStart.width - deltaX);
                    newHeight = Math.max(50, dragStart.height + deltaY);
                    break;
                case 'ne': // Northeast corner
                    newWidth = Math.max(50, dragStart.width + deltaX);
                    newHeight = Math.max(50, dragStart.height - deltaY);
                    break;
                case 'nw': // Northwest corner
                    newWidth = Math.max(50, dragStart.width - deltaX);
                    newHeight = Math.max(50, dragStart.height - deltaY);
                    break;
            }

            // Maintain aspect ratio if shift is held
            if (e.shiftKey && imgRef.current.naturalWidth && imgRef.current.naturalHeight) {
                const aspectRatio = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    newHeight = newWidth / aspectRatio;
                } else {
                    newWidth = newHeight * aspectRatio;
                }
            }

            updateAttributes({
                width: Math.round(newWidth),
                height: Math.round(newHeight),
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [dragStart, width, height, updateAttributes]);

    const resetSize = () => {
        updateAttributes({
            width: null,
            height: null,
        });
    };

    return (
        <NodeViewWrapper className="relative inline-block">
            <img
                ref={imgRef}
                src={src}
                alt={alt || ''}
                title={title || ''}
                style={{
                    width: width ? `${width}px` : 'auto',
                    height: height ? `${height}px` : 'auto',
                    maxWidth: '100%',
                    display: 'block',
                }}
                className={`${selected ? 'ring-2 ring-blue-500' : ''} ${isResizing ? 'cursor-nw-resize' : ''}`}
                draggable={false}
            />

            {selected && (
                <>
                    {/* Resize handles */}
                    <div
                        className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
                        onMouseDown={(e) => handleMouseDown(e, 'nw')}
                    />
                    <div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
                        onMouseDown={(e) => handleMouseDown(e, 'ne')}
                    />
                    <div
                        className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
                        onMouseDown={(e) => handleMouseDown(e, 'sw')}
                    />
                    <div
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
                        onMouseDown={(e) => handleMouseDown(e, 'se')}
                    />

                    {/* Toolbar */}
                    <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded flex gap-2">
                        <button
                            onClick={resetSize}
                            className="hover:text-blue-300"
                            title="Reset to original size"
                        >
                            Reset
                        </button>
                        <span className="text-gray-400">
                            {width || 'auto'} × {height || 'auto'}
                        </span>
                    </div>
                </>
            )}
        </NodeViewWrapper>
    );
};

export default ResizableImageComponent;
