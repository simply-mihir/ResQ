'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { AnalyticsData } from './page';

// ── Constants ──

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

const ACTION_LABELS: Record<string, string> = {
  TRIGGERED: 'Case Triggered',
  DISPATCHED: 'Ambulance Dispatched',
  HOSPITAL_ACCEPTED: 'Hospital Accepted',
  TRIAGE_COMPLETE: 'Triage Complete',
  EN_ROUTE_TO_PATIENT: 'En Route to Patient',
  AT_PATIENT: 'At Patient',
  EN_ROUTE_TO_HOSPITAL: 'En Route to Hospital',
  ARRIVED: 'Patient Arrived',
  CLOSED: 'Case Closed',
};

const DATE_RANGES = ['7 days', '30 days', '90 days'] as const;
type DateRange = (typeof DATE_RANGES)[number];

// ── Helpers ──

function getRangeSlice<T>(arr: T[], range: DateRange): T[] {
  const days = range === '7 days' ? 7 : range === '30 days' ? 30 : 90;
  return arr.slice(-days);
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

// ── Sub-components ──

function TrendArrow({ value }: { value: number }) {
  if (value === 0) return <span className="text-slate-500 text-xs ml-1">0%</span>;
  const isUp = value > 0;
  return (
    <span className={cn('text-xs font-medium ml-1 flex items-center gap-0.5', isUp ? 'text-emerald-400' : 'text-red-400')}>
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
        <path
          d={isUp ? 'M6 2L10 7H2L6 2Z' : 'M6 10L2 5H10L6 10Z'}
          fill="currentColor"
        />
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

function KpiCard({
  title,
  value,
  unit,
  trend,
  icon,
  accentColor,
  delay,
}: {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon: React.ReactNode;
  accentColor: string;
  delay: number;
}) {
  return (
    <div
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-3 animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-slate-400 text-sm mb-1">{unit}</span>}
        {trend !== undefined && <TrendArrow value={trend} />}
      </div>
    </div>
  );
}

// ── Bar chart: Cases Over Time ──

function CasesBarChart({ data, range }: { data: AnalyticsData['dailyCounts']; range: DateRange }) {
  const sliced = getRangeSlice(data, range);
  const maxVal = Math.max(...sliced.map((d) => d.total), 1);
  const chartH = 200;
  const barGap = 2;
  const totalBars = sliced.length;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(totalBars * 20, 300)} ${chartH + 40}`}
        className="w-full min-w-[300px]"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Cases over time bar chart"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = chartH - pct * chartH;
          return (
            <g key={pct}>
              <line x1="30" y1={y} x2={totalBars * 20 + 30} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x="26" y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">
                {Math.round(maxVal * pct)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {sliced.map((d, i) => {
          const x = 32 + i * ((Math.max(totalBars * 20, 300) - 34) / totalBars);
          const barW = Math.max(((Math.max(totalBars * 20, 300) - 34) / totalBars) - barGap, 4);

          // Stack: low at bottom, then medium, high, critical on top
          const segments = [
            { key: 'low', val: d.low, color: SEVERITY_COLORS.LOW },
            { key: 'medium', val: d.medium, color: SEVERITY_COLORS.MEDIUM },
            { key: 'high', val: d.high, color: SEVERITY_COLORS.HIGH },
            { key: 'critical', val: d.critical, color: SEVERITY_COLORS.CRITICAL },
          ];

          let yOffset = chartH;
          return (
            <g key={d.date}>
              {segments.map((seg) => {
                const segH = (seg.val / maxVal) * chartH;
                yOffset -= segH;
                return (
                  <rect
                    key={seg.key}
                    x={x}
                    y={yOffset}
                    width={barW}
                    height={segH}
                    rx="2"
                    fill={seg.color}
                    opacity="0.85"
                  >
                    <title>{`${d.date} — ${seg.key}: ${seg.val}`}</title>
                  </rect>
                );
              })}
              {/* X label — show every nth label to avoid overlap */}
              {(i % Math.max(1, Math.floor(totalBars / 10)) === 0 || i === totalBars - 1) && (
                <text
                  x={x + barW / 2}
                  y={chartH + 16}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.35)"
                  fontSize="8"
                >
                  {formatShortDate(d.date)}
                </text>
              )}
              {/* Invisible hover target with tooltip */}
              <rect x={x} y="0" width={barW} height={chartH} fill="transparent">
                <title>{`${d.date}\nTotal: ${d.total} | C:${d.critical} H:${d.high} M:${d.medium} L:${d.low}`}</title>
              </rect>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-2 flex-wrap">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((tier) => (
          <div key={tier} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: SEVERITY_COLORS[tier] }} />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{tier}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Donut chart: Severity Distribution ──

function SeverityDonut({ data }: { data: AnalyticsData['severityCounts'] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 75;
  const innerR = 50;

  // Sort so they appear CRITICAL, HIGH, MEDIUM, LOW
  const order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const sorted = [...data].sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier));

  let cumulativeAngle = -90; // start at top

  const segments = sorted.map((d) => {
    const pct = d.count / total;
    const angle = pct * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1Outer = cx + outerR * Math.cos(startRad);
    const y1Outer = cy + outerR * Math.sin(startRad);
    const x2Outer = cx + outerR * Math.cos(endRad);
    const y2Outer = cy + outerR * Math.sin(endRad);

    const x1Inner = cx + innerR * Math.cos(endRad);
    const y1Inner = cy + innerR * Math.sin(endRad);
    const x2Inner = cx + innerR * Math.cos(startRad);
    const y2Inner = cy + innerR * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathD = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      'Z',
    ].join(' ');

    return { ...d, pct, pathD };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label="Severity distribution donut chart">
        {segments.map((seg) => (
          <path
            key={seg.tier}
            d={seg.pathD}
            fill={SEVERITY_COLORS[seg.tier] || '#6b7280'}
            opacity="0.9"
            stroke="rgba(10,10,15,0.5)"
            strokeWidth="1.5"
          >
            <title>{`${seg.tier}: ${seg.count} (${Math.round(seg.pct * 100)}%)`}</title>
          </path>
        ))}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="22" fontWeight="700">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">
          Total
        </text>
      </svg>

      <div className="flex flex-col gap-2.5">
        {segments.map((seg) => (
          <div key={seg.tier} className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[seg.tier] }} />
            <span className="text-sm text-slate-300 w-20">{seg.tier}</span>
            <span className="text-sm font-semibold text-white w-10 text-right">{seg.count}</span>
            <span className="text-xs text-slate-500">{Math.round(seg.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Line chart: Response Time Trend ──

function ResponseTimeChart({ data, range }: { data: AnalyticsData['responseTimeTrend']; range: DateRange }) {
  const sliced = getRangeSlice(data, range);
  const maxVal = Math.max(...sliced.map((d) => d.avgMinutes), 1);
  const minVal = Math.min(...sliced.map((d) => d.avgMinutes));
  const padding = (maxVal - minVal) * 0.15 || 2;
  const effectiveMax = maxVal + padding;
  const effectiveMin = Math.max(0, minVal - padding);
  const chartW = 500;
  const chartH = 180;
  const leftPad = 36;
  const rightPad = 10;
  const usableW = chartW - leftPad - rightPad;

  const points = sliced.map((d, i) => {
    const x = leftPad + (i / Math.max(sliced.length - 1, 1)) * usableW;
    const y = chartH - ((d.avgMinutes - effectiveMin) / (effectiveMax - effectiveMin)) * chartH;
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Area fill path
  const areaPath = [
    `M ${points[0]?.x ?? leftPad} ${chartH}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1]?.x ?? leftPad} ${chartH}`,
    'Z',
  ].join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full min-w-[300px]" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Response time trend line chart">
        <defs>
          <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const val = effectiveMin + pct * (effectiveMax - effectiveMin);
          const y = chartH - pct * chartH;
          return (
            <g key={pct}>
              <line x1={leftPad} y1={y} x2={chartW - rightPad} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={leftPad - 4} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9">
                {val.toFixed(0)}m
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#responseGrad)" />

        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <g key={p.date}>
            <circle cx={p.x} cy={p.y} r="3" fill="#06b6d4" stroke="#0a0a0f" strokeWidth="1.5">
              <title>{`${p.date}: ${p.avgMinutes} min`}</title>
            </circle>
            {/* X labels */}
            {(i % Math.max(1, Math.floor(sliced.length / 8)) === 0 || i === sliced.length - 1) && (
              <text x={p.x} y={chartH + 16} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">
                {formatShortDate(p.date)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Horizontal bar chart: Top Hospitals ──

function HospitalBarChart({ data }: { data: AnalyticsData['hospitalStats'] }) {
  const maxCases = Math.max(...data.map((d) => d.caseCount), 1);

  return (
    <div className="space-y-3">
      {data.map((h, i) => (
        <div key={h.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-300 truncate max-w-[55%]">{h.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{h.occupancyPct}% beds</span>
              <span className="text-sm font-semibold text-white w-8 text-right">{h.caseCount}</span>
            </div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(h.caseCount / maxCases) * 100}%`,
                background: `linear-gradient(90deg, #3b82f6, #8b5cf6)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Activity Feed ──

function SeverityBadge({ severity }: { severity: string }) {
  const colorMap: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border', colorMap[severity] || 'bg-slate-500/20 text-slate-400 border-slate-500/30')}>
      {severity}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, string> = {
    TRIGGERED: 'text-cyan-400',
    DISPATCHED: 'text-blue-400',
    HOSPITAL_ACCEPTED: 'text-emerald-400',
  };

  return (
    <span className={cn('text-xs font-medium', colorMap[action] || 'text-slate-400')}>
      {ACTION_LABELS[action] || action.replace(/_/g, ' ')}
    </span>
  );
}

function ActivityFeed({ data }: { data: AnalyticsData['recentActivity'] }) {
  return (
    <div className="max-h-[420px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
      {data.map((item, i) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors animate-fade-in"
          style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
        >
          {/* Timeline dot */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: SEVERITY_COLORS[item.severity] || '#6b7280' }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-slate-300">{item.caseNumber}</span>
              <SeverityBadge severity={item.severity} />
            </div>
            <ActionBadge action={item.action} />
          </div>

          <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0">
            {formatTimestamp(item.timestamp)}
          </span>
        </div>
      ))}
      {data.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">No recent activity</div>
      )}
    </div>
  );
}

// ── Main Dashboard ──

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const [range, setRange] = useState<DateRange>('30 days');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 lg:p-12 font-sans">
      <div key={refreshKey} className="max-w-7xl mx-auto space-y-6 pb-8">
        <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Analytics &amp; Insights</h1>
            <p className="text-slate-400 text-sm">
              Hospital performance metrics and emergency response data
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date range selector */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
              {DATE_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    range === r
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Cases"
            value={data.totalCases.toLocaleString()}
            trend={data.totalCasesTrend}
            accentColor="#06b6d4"
            delay={0}
            icon={
              <svg className="w-5 h-5" style={{ color: '#06b6d4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <KpiCard
            title="Avg Response Time"
            value={data.avgResponseMinutes}
            unit="min"
            trend={data.avgResponseTrend}
            accentColor="#3b82f6"
            delay={75}
            icon={
              <svg className="w-5 h-5" style={{ color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <KpiCard
            title="Active Ambulances"
            value={data.activeAmbulances}
            accentColor="#8b5cf6"
            delay={150}
            icon={
              <svg className="w-5 h-5" style={{ color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          <KpiCard
            title="Bed Occupancy"
            value={data.overallOccupancyPct}
            unit="%"
            accentColor="#f97316"
            delay={225}
            icon={
              <svg className="w-5 h-5" style={{ color: '#f97316' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>

        {/* ── Charts Row 1: Cases + Severity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cases Over Time — 2/3 width */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />
              Cases Over Time
            </h3>
            <CasesBarChart data={data.dailyCounts} range={range} />
          </div>

          {/* Severity Distribution — 1/3 width */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-red-400 to-orange-500" />
              Severity Distribution
            </h3>
            <SeverityDonut data={data.severityCounts} />
          </div>
        </div>

        {/* ── Charts Row 2: Response Time + Hospitals ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Response Time Trend */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600" />
              Response Time Trend
              <span className="text-[10px] text-slate-500 font-normal ml-auto">avg minutes</span>
            </h3>
            <ResponseTimeChart data={data.responseTimeTrend} range={range} />
          </div>

          {/* Top Hospitals */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-purple-500" />
              Top Hospitals by Cases
            </h3>
            <HospitalBarChart data={data.hospitalStats} />
          </div>
        </div>

        {/* ── Activity Feed ── */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-500" />
            Recent Activity
            <span className="text-[10px] text-slate-500 font-normal ml-auto">Last 20 events</span>
          </h3>
          <ActivityFeed data={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
