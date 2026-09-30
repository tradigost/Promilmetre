import React from 'react';
import { ProjectionPoint } from '../utils/calculator';
import { TrendingDown, ShieldCheck, AlertCircle } from 'lucide-react';

interface ProjectionChartProps {
  points: ProjectionPoint[];
  currentBac: number;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ points, currentBac }) => {
  if (!points || points.length < 2) return null;

  // Chart dimensions
  const width = 500;
  const height = 150;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Compute maximum BAC on the chart
  const maxBac = Math.max(1.2, ...points.map((p) => p.bac), currentBac) * 1.15;

  // Scaling helpers
  const getX = (index: number) => padding.left + (index / (points.length - 1)) * innerWidth;
  const getY = (bac: number) => padding.top + innerHeight - (Math.min(bac, maxBac) / maxBac) * innerHeight;

  // Build SVG path
  const pathD = points.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.bac);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Build Area path
  const areaD = `${pathD} L ${getX(points.length - 1)} ${padding.top + innerHeight} L ${getX(0)} ${
    padding.top + innerHeight
  } Z`;

  // Legal limit (0.50 promil) Y position
  const legalY = getY(0.50);
  const showLegalLine = 0.50 <= maxBac;

  return (
    <div className="w-full bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-pink-400" />
          <h4 className="text-sm font-semibold text-white">Promil Düşüş Simülasyonu</h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            Tahmini Eğri
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-amber-400"></span>
            0.50 Yasal Sınır
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="bacCurveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top + innerHeight}
            x2={width - padding.right}
            y2={padding.top + innerHeight}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
          />

          {/* Legal limit line (0.50 promil) */}
          {showLegalLine && (
            <g>
              <line
                x1={padding.left}
                y1={legalY}
                x2={width - padding.right}
                y2={legalY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={width - padding.right}
                y={legalY - 4}
                fill="#f59e0b"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                0.50 Promil Yasal Sınır
              </text>
            </g>
          )}

          {/* Area Fill */}
          <path d={areaD} fill="url(#bacCurveGradient)" />

          {/* Curve Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Labels */}
          {points.map((point, index) => {
            // Show label every few steps to avoid clutter
            const showLabel =
              index === 0 ||
              index === points.length - 1 ||
              (points.length > 6 && index % Math.ceil(points.length / 5) === 0);

            const cx = getX(index);
            const cy = getY(point.bac);

            return (
              <g key={point.timeMs}>
                {/* Data point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={index === 0 ? 4 : 2.5}
                  fill={index === 0 ? '#ffffff' : '#f43f5e'}
                  stroke="#1e1b4b"
                  strokeWidth="1.5"
                />

                {/* Bottom Time label */}
                {showLabel && (
                  <text
                    x={cx}
                    y={padding.top + innerHeight + 16}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {point.timeLabel}
                  </text>
                )}

                {/* Point BAC value on first and last points */}
                {(index === 0 || index === points.length - 1) && (
                  <text
                    x={cx}
                    y={cy - 7}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {point.bac.toFixed(2)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>* Standart karaciğer eliminasyon hızı (-0.15 promil/saat) esas alınmıştır.</span>
        {currentBac > 0.50 && (
          <span className="text-amber-400 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> 0.50 altına inmeden araç kullanmayınız
          </span>
        )}
      </div>
    </div>
  );
};
