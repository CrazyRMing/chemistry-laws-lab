(function registerCanvasResponsive(global) {
    const COMPACT_MAX_WIDTH = 480;

    function isCompact(width) {
        return width <= COMPACT_MAX_WIDTH;
    }

    function heightFor(width, desktopRatio, compactRatio) {
        return width * (isCompact(width) ? compactRatio : desktopRatio);
    }

    function marginFor(width, desktopMargin, compactMargin) {
        return isCompact(width) ? compactMargin : desktopMargin;
    }

    function bottomPair(height, gap, bottomInset) {
        const lower = height - bottomInset;
        return { upper: lower - gap, lower };
    }

    function fontFor(ctx, text, maxWidth, preferredPx, minimumPx, weight = 'bold') {
        let size = preferredPx;
        while (size > minimumPx) {
            ctx.font = `${weight} ${size}px sans-serif`;
            if (ctx.measureText(text).width <= maxWidth) break;
            size -= 1;
        }
        return `${weight} ${Math.max(size, minimumPx)}px sans-serif`;
    }

    function wrapLines(ctx, text, maxWidth) {
        const lines = [];
        let line = '';

        for (const character of text) {
            const candidate = line + character;
            if (line && ctx.measureText(candidate).width > maxWidth) {
                lines.push(line);
                line = character;
            } else {
                line = candidate;
            }
        }

        if (line || !lines.length) lines.push(line);
        return lines;
    }

    global.CanvasResponsive = {
        isCompact,
        heightFor,
        marginFor,
        bottomPair,
        fontFor,
        wrapLines,
    };
})(globalThis);
