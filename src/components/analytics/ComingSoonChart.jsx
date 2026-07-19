"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    ComposedChart,
    ScatterChart,
    Scatter,
    ZAxis,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';

const ChartLayer = ({ type, data, colors }) => {
    const containerRef = React.useRef(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
                setDimensions({ width, height });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const renderChart = () => {
        switch (type) {
            case 'area':
                return (
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.revenue} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors.revenue} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 200, 200, 0.1)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={colors.revenue}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            animationDuration={2500}
                            strokeWidth={3}
                        />
                    </AreaChart>
                );
            case 'bar':
                return (
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 200, 200, 0.1)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Bar dataKey="value" fill={colors.profit} animationDuration={2000} radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? colors.revenue : colors.profit} opacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                );
            case 'multi-line':
                return (
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 200, 200, 0.1)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Line
                            type="stepAfter"
                            dataKey="value"
                            stroke={colors.revenue}
                            strokeWidth={3}
                            dot={false}
                            animationDuration={2000}
                        />
                        <Line
                            type="monotone"
                            dataKey="value2"
                            stroke={colors.tertiary}
                            strokeWidth={2}
                            dot={false}
                            animationDuration={3000}
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                );
            case 'composed':
                return (
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 200, 200, 0.1)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Bar dataKey="value" fill={colors.revenue} opacity={0.3} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="value2" stroke={colors.tertiary} strokeWidth={2} dot={false} />
                    </ComposedChart>
                );
            case 'scatter':
                return (
                    <ScatterChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 200, 200, 0.1)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <ZAxis type="number" range={[60, 400]} />
                        <Scatter name="Value" dataKey="value" fill={colors.revenue} />
                    </ScatterChart>
                );
            case 'radar':
                return (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="rgba(200, 200, 200, 0.2)" />
                        <PolarAngleAxis dataKey="name" hide />
                        <Radar
                            name="Value"
                            dataKey="value"
                            stroke={colors.revenue}
                            fill={colors.revenue}
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                );
            default:
                return (
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 200, 200, 0.1)" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={colors.revenue}
                            strokeWidth={4}
                            dot={{ r: 4, fill: colors.revenue, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                            animationDuration={2000}
                        />
                    </LineChart>
                );
        }
    };

    return (
        <div ref={containerRef} className="flex-grow w-full h-full min-h-[inherit]">
            {dimensions.width > 0 && dimensions.height > 0 && (
                <ResponsiveContainer width={dimensions.width} height={dimensions.height} minWidth={0} minHeight={0}>
                    {renderChart()}
                </ResponsiveContainer>
            )}
        </div>
    );
};

const DynamicChartLayer = dynamic(() => Promise.resolve(ChartLayer), {
    ssr: false,
    loading: () => <div className="w-full h-full" />
});


const ComingSoonChart = ({ type = 'line' }) => {
    // Mock data with more points for smoother look
    const data = [
        { name: 'Day 1', value: 400, value2: 240 },
        { name: 'Day 2', value: 300, value2: 139 },
        { name: 'Day 3', value: 600, value2: 980 },
        { name: 'Day 4', value: 800, value2: 390 },
        { name: 'Day 5', value: 500, value2: 480 },
        { name: 'Day 6', value: 900, value2: 380 },
        { name: 'Day 7', value: 1100, value2: 430 },
    ];

    const colors = {
        primary: '#8884d8',
        secondary: '#82ca9d',
        tertiary: '#ffc658',
        profit: '#10b981',
        revenue: '#3b82f6',
    };

    return (
        <div className="relative w-full h-full flex-grow min-h-[100px] overflow-hidden rounded-xl bg-[rgb(var(--color-bg-secondary))]/10 border border-[rgb(var(--color-border-primary))]/10">
            {/* Background Chart */}
            <div className="absolute inset-0 z-0 opacity-20 blur-[0.5px] w-full h-full flex flex-col items-stretch">
                <DynamicChartLayer type={type} data={data} colors={colors} />
            </div>


            {/* Animated Overlay Elements */}
            <div className="absolute top-4 left-4 flex gap-2 z-10 opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse delay-150" />
            </div>

            {/* Backdrop Layer */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[rgb(var(--color-bg-secondary))]/20 backdrop-blur-[1px] transition-all duration-700 hover:backdrop-blur-none group">
                <div className="relative overflow-hidden px-6 py-2 rounded-xl transform transition-all duration-500 group-hover:scale-105 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]/30 shadow-sm">
                    {/* Shine effect */}
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-[rgb(var(--color-primary))]/10 to-transparent skew-x-[-20deg] animate-[shimmer_3s_infinite]" />

                    <span className="relative text-[rgb(var(--color-text-primary))] font-bold tracking-[0.15em] text-xs uppercase opacity-90">
                        Coming Soon
                    </span>
                </div>

                <p className="mt-3 text-[0.5625rem] text-[rgb(var(--color-text-tertiary))] uppercase tracking-[0.2em] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Advanced Insights
                </p>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          100% {
            left: 200%;
          }
        }
      `}</style>
        </div>
    );
};

export default ComingSoonChart;
