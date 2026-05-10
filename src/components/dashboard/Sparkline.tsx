import { createMemo, type Accessor } from 'solid-js';

interface Props {
  /** Array of numeric values to render as a line. */
  values: Accessor<number[]>;
  /** Width of the SVG viewport. */
  width?: number;
  /** Height of the SVG viewport. */
  height?: number;
  /** Stroke color class (Tailwind). */
  strokeClass?: string;
  /** Fill color class (Tailwind) for the area under the line. */
  fillClass?: string;
}

/** A lightweight SVG sparkline chart component. */
export default function Sparkline(props: Props) {
  const width = () => props.width ?? 120;
  const height = () => props.height ?? 32;
  const strokeClass = () => props.strokeClass ?? 'text-sky-500';
  const fillClass = () => props.fillClass ?? 'text-sky-500/10';

  const path = createMemo(() => {
    const values = props.values();
    if (values.length < 2) return { line: '', area: '' };

    const w = width();
    const h = height();
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h * 0.85) - h * 0.05;
      return `${x},${y}`;
    });

    const line = `M${points.join(' L')}`;
    const area = `${line} L${width()},${height()} L0,${height()} Z`;

    return { line, area };
  });

  return (
    <svg
      viewBox={`0 0 ${width()} ${height()}`}
      class={`overflow-visible ${strokeClass()}`}
      preserveAspectRatio="none"
      style={{ width: `${width()}px`, height: `${height()}px` }}
    >
      <path
        d={path().area}
        class={fillClass()}
        fill="currentColor"
        stroke="none"
      />
      <path
        d={path().line}
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
