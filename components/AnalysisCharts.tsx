import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { DebateResponse } from '../types';

interface AnalysisChartsProps {
  data: DebateResponse;
}

const COLORS = ['#124E66', '#748D92', '#D3D9D4'];

export const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ data }) => {
  
  // Calculate pseudo-metrics based on text length and complexity for visualization
  const getScore = (text: string) => Math.min(100, Math.max(40, text.length / 5));
  
  const openaiScore = getScore(data.models.openai);
  const claudeScore = getScore(data.models.claude);
  const geminiScore = getScore(data.models.gemini);

  const radarData = [
    { subject: 'Reasoning', A: openaiScore, B: claudeScore, C: geminiScore, fullMark: 100 },
    { subject: 'Factuality', A: openaiScore * 0.9, B: claudeScore * 1.1, C: geminiScore * 0.95, fullMark: 100 },
    { subject: 'Conciseness', A: 100 - (openaiScore * 0.2), B: 100 - (claudeScore * 0.2), C: 100 - (geminiScore * 0.2), fullMark: 100 },
    { subject: 'Creativity', A: openaiScore * 0.8, B: claudeScore * 0.9, C: geminiScore * 1.1, fullMark: 100 },
    { subject: 'Safety', A: 90, B: 95, C: 85, fullMark: 100 },
  ];

  const pieData = [
    { name: 'OpenAI Contribution', value: openaiScore },
    { name: 'Claude Contribution', value: claudeScore },
    { name: 'Gemini Contribution', value: geminiScore },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-nexus-bg border border-nexus-primary p-2 rounded shadow-lg">
          <p className="text-nexus-text text-sm font-semibold">{`${label || payload[0].name}`}</p>
          <p className="text-nexus-accent text-xs">
            {payload.map((p: any) => `${p.name}: ${Math.round(p.value)}`).join(', ')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Radar Chart for Model Comparison */}
      <div className="bg-nexus-card rounded-xl p-6 border border-nexus-primary/20 shadow-xl">
        <h3 className="text-nexus-text text-lg font-semibold mb-4 flex items-center">
          <span className="w-2 h-6 bg-nexus-primary mr-2 rounded-sm"></span>
          Comparative Model Analysis
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#748D92" strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#D3D9D4', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="OpenAI" dataKey="A" stroke="#124E66" fill="#124E66" fillOpacity={0.3} />
              <Radar name="Claude" dataKey="B" stroke="#748D92" fill="#748D92" fillOpacity={0.3} />
              <Radar name="Gemini" dataKey="C" stroke="#D3D9D4" fill="#D3D9D4" fillOpacity={0.3} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart for Synthesis Weight */}
      <div className="bg-nexus-card rounded-xl p-6 border border-nexus-primary/20 shadow-xl">
        <h3 className="text-nexus-text text-lg font-semibold mb-4 flex items-center">
          <span className="w-2 h-6 bg-nexus-primary mr-2 rounded-sm"></span>
          Synthesis Influence Distribution
        </h3>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center text-xs text-nexus-text"><div className="w-3 h-3 rounded-full bg-[#124E66] mr-2"></div> OpenAI</div>
            <div className="flex items-center text-xs text-nexus-text"><div className="w-3 h-3 rounded-full bg-[#748D92] mr-2"></div> Claude</div>
            <div className="flex items-center text-xs text-nexus-text"><div className="w-3 h-3 rounded-full bg-[#D3D9D4] mr-2"></div> Gemini</div>
        </div>
      </div>
    </div>
  );
};
