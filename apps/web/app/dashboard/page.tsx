'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

// Enhanced Types for LifeScore V2
interface LifeScoreV2 {
  date: string;
  score: number;
  sleep_score?: number;
  activity_score?: number;
  mental_score?: number;
  trend_3d?: number;
  trend_7d?: number;
  flags?: any;
  reasons?: string[];
  // New V2 fields
  confidence_level?: number;
  prediction_3d?: number;
  prediction_7d?: number;
  anomaly_score?: number;
  circadian_factor?: number;
  personal_baseline?: number;
  improvement_suggestions?: string[];
}

interface SuggestionAnalytics {
  suggestion_key: string;
  total_suggested: number;
  total_completed: number;
  avg_feedback: number;
  avg_duration: number;
  completion_rate: number;
}

interface DashboardData {
  lifeScores: LifeScoreV2[];
  suggestionAnalytics: SuggestionAnalytics[];
  currentStreak: number;
  totalCheckIns: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

// Utility functions
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: 'short' 
  });
}

// Confidence Indicator Component
function ConfidenceIndicator({ level }: { level: number }) {
  const getColor = () => {
    if (level >= 0.8) return 'text-green-600 bg-green-100';
    if (level >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLabel = () => {
    if (level >= 0.8) return 'Alta';
    if (level >= 0.6) return 'Media';
    return 'Bassa';
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getColor()}`}>
      <div className="w-2 h-2 rounded-full bg-current mr-1"></div>
      {getLabel()} ({Math.round(level * 100)}%)
    </div>
  );
}

// Predictions Panel Component
function PredictionsPanel({ data }: { data: LifeScoreV2[] }) {
  const latestScore = data[data.length - 1];
  
  if (!latestScore || !latestScore.prediction_3d) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predizioni AI</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-3xl mb-2">🔮</div>
          <p className="text-gray-600">Raccogli più dati per vedere le predizioni</p>
        </div>
      </div>
    );
  }

  const trend3d = latestScore.prediction_3d! - latestScore.score;
  const trend7d = latestScore.prediction_7d! - latestScore.score;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Predizioni AI</h3>
        <ConfidenceIndicator level={latestScore.confidence_level || 0} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{Math.round(latestScore.prediction_3d!)}</div>
          <div className="text-sm text-blue-700 mb-1">Tra 3 giorni</div>
          <div className={`text-xs ${trend3d > 0 ? 'text-green-600' : trend3d < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend3d > 0 ? '+' : ''}{Math.round(trend3d)} dal oggi
          </div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{Math.round(latestScore.prediction_7d!)}</div>
          <div className="text-sm text-purple-700 mb-1">Tra 7 giorni</div>
          <div className={`text-xs ${trend7d > 0 ? 'text-green-600' : trend7d < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend7d > 0 ? '+' : ''}{Math.round(trend7d)} dal oggi
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 mb-1">Baseline personale</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{latestScore.personal_baseline || 'N/A'}</span>
          <span className="text-xs text-gray-500">
            Fattore circadiano: {latestScore.circadian_factor?.toFixed(2) || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Anomaly Detection Component
function AnomalyDetection({ data }: { data: LifeScoreV2[] }) {
  const recentAnomalies = data.filter(d => d.anomaly_score && d.anomaly_score > 0.3).slice(-5);
  const latestAnomaly = data[data.length - 1]?.anomaly_score || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rilevamento Anomalie</h3>
      
      {latestAnomaly > 0.5 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <h4 className="font-medium text-red-900">Pattern Anomalo Rilevato</h4>
              <p className="text-sm text-red-700">
                I tuoi dati di oggi mostrano variazioni significative rispetto al normale
              </p>
            </div>
          </div>
        </div>
      ) : latestAnomaly > 0.3 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 text-xl">🔍</span>
            <div>
              <h4 className="font-medium text-yellow-900">Lieve Variazione</h4>
              <p className="text-sm text-yellow-700">
                Alcuni valori sono leggermente fuori dal tuo pattern normale
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 text-xl">✅</span>
            <div>
              <h4 className="font-medium text-green-900">Pattern Normale</h4>
              <p className="text-sm text-green-700">
                I tuoi dati seguono il pattern abituale
              </p>
            </div>
          </div>
        </div>
      )}

      {recentAnomalies.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Anomalie Recenti</h4>
          <div className="space-y-2">
            {recentAnomalies.map((anomaly, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{formatDate(anomaly.date)}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-12 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(anomaly.anomaly_score || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {Math.round((anomaly.anomaly_score || 0) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// AI Suggestions Component
function AISuggestions({ data }: { data: LifeScoreV2[] }) {
  const latestScore = data[data.length - 1];
  const suggestions = latestScore?.improvement_suggestions || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggerimenti AI Personalizzati</h3>
      
      {suggestions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-3xl mb-2">🤖</div>
          <p className="text-gray-600">L'AI sta analizzando i tuoi pattern...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-600 text-lg mt-0.5">💡</span>
              <div>
                <p className="text-sm text-blue-900 font-medium">
                  {suggestion}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Suggerimento basato sui tuoi pattern personali
                </p>
              </div>
            </div>
          ))}
          
          <Link
            href="/suggestions"
            className="block w-full text-center py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Esplora Tutti i Suggerimenti
          </Link>
        </div>
      )}
    </div>
  );
}

// Enhanced Line Chart with predictions
function EnhancedLineChart({ 
  data, 
  breakdown = false 
}: { 
  data: LifeScoreV2[]; 
  breakdown?: boolean; 
}) {
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'sleep_score' | 'activity_score' | 'mental_score'>('score');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showPredictions, setShowPredictions] = useState(true);
  
  const height = 300;
  const width = 800;
  const padding = 50;
  
  const getMetricValue = (item: LifeScoreV2, metric: string) => {
    switch (metric) {
      case 'sleep_score': return item.sleep_score || 0;
      case 'activity_score': return item.activity_score || 0;
      case 'mental_score': return item.mental_score || 0;
      default: return item.score;
    }
  };

  const values = data.map(d => getMetricValue(d, selectedMetric));
  const maxY = Math.max(100, ...values);
  const minY = Math.min(0, ...values);
  const xStep = (width - padding * 2) / Math.max(1, data.length - 1);
  
  const points = data.map((d, i) => {
    const x = padding + i * xStep;
    const y = height - padding - ((getMetricValue(d, selectedMetric) - minY) / (maxY - minY)) * (height - padding * 2);
    return { x, y, data: d, index: i };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Prediction points
  const latestPoint = points[points.length - 1];
  const predictionPoints = [];
  
  if (showPredictions && latestPoint && latestPoint.data.prediction_3d) {
    const pred3d = {
      x: latestPoint.x + xStep * 3,
      y: height - padding - ((latestPoint.data.prediction_3d - minY) / (maxY - minY)) * (height - padding * 2)
    };
    const pred7d = {
      x: latestPoint.x + xStep * 7,
      y: height - padding - ((latestPoint.data.prediction_7d! - minY) / (maxY - minY)) * (height - padding * 2)
    };
    predictionPoints.push(pred3d, pred7d);
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'sleep_score': return '#3b82f6';
      case 'activity_score': return '#10b981';
      case 'mental_score': return '#8b5cf6';
      default: return '#6366f1';
    }
  };

  return (
    <div className="space-y-4">
      {breakdown && (
        <div className="flex space-x-2 flex-wrap">
          {[
            { key: 'score', label: 'Totale', color: '#6366f1' },
            { key: 'sleep_score', label: 'Sonno', color: '#3b82f6' },
            { key: 'activity_score', label: 'Attività', color: '#10b981' },
            { key: 'mental_score', label: 'Mentale', color: '#8b5cf6' }
          ].map(metric => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedMetric === metric.key
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedMetric === metric.key ? metric.color : undefined
              }}
            >
              {metric.label}
            </button>
          ))}
          
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              showPredictions ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Predizioni
          </button>
        </div>
      )}
      
      <div className="relative">
        <svg 
          width="100%" 
          height={height} 
          viewBox={`0 0 ${width} ${height}`}
          className="border border-gray-200 rounded-lg bg-white"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(value => {
            const y = height - padding - ((value - minY) / (maxY - minY)) * (height - padding * 2);
            return (
              <g key={value}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="#f3f4f6" 
                  strokeWidth="1"
                />
                <text 
                  x={padding - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  fontSize="12" 
                  fill="#6b7280"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Main line */}
          <path 
            d={pathData} 
            fill="none" 
            stroke={getMetricColor(selectedMetric)} 
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Prediction line */}
          {showPredictions && predictionPoints.length > 0 && latestPoint && (
            <path
              d={`M ${latestPoint.x} ${latestPoint.y} L ${predictionPoints[0].x} ${predictionPoints[0].y} L ${predictionPoints[1].x} ${predictionPoints[1].y}`}
              fill="none"
              stroke={getMetricColor(selectedMetric)}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          )}

          {/* Data points */}
          {points.map((point, i) => {
            const hasAnomaly = point.data.anomaly_score && point.data.anomaly_score > 0.3;
            return (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === i ? 6 : hasAnomaly ? 5 : 4}
                  fill={hasAnomaly ? '#ef4444' : getMetricColor(selectedMetric)}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(i)}
                />
                
                {/* X-axis labels */}
                <text 
                  x={point.x} 
                  y={height - 10} 
                  textAnchor="middle" 
                  fontSize="11" 
                  fill="#6b7280"
                >
                  {formatDate(point.data.date)}
                </text>
              </g>
            );
          })}

          {/* Prediction points */}
          {showPredictions && predictionPoints.map((point, i) => (
            <circle
              key={`pred-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="none"
              stroke={getMetricColor(selectedMetric)}
              strokeWidth="2"
              strokeDasharray="2,2"
              opacity="0.7"
            />
          ))}

          {/* Enhanced tooltip */}
          {hoveredPoint !== null && (
            <g>
              <rect
                x={points[hoveredPoint].x - 80}
                y={points[hoveredPoint].y - 100}
                width="160"
                height="80"
                rx="8"
                fill="rgba(0,0,0,0.9)"
              />
              <text 
                x={points[hoveredPoint].x} 
                y={points[hoveredPoint].y - 75} 
                textAnchor="middle" 
                fontSize="12" 
                fill="white" 
                fontWeight="bold"
              >
                {formatDate(data[hoveredPoint].date)}
              </text>
              <text 
                x={points[hoveredPoint].x} 
                y={points[hoveredPoint].y - 55} 
                textAnchor="middle" 
                fontSize="14" 
                fill="white"
              >
                Score: {getMetricValue(data[hoveredPoint], selectedMetric)}
              </text>
              {data[hoveredPoint].confidence_level && (
                <text 
                  x={points[hoveredPoint].x} 
                  y={points[hoveredPoint].y - 35} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#ccc"
                >
                  Confidenza: {Math.round(data[hoveredPoint].confidence_level! * 100)}%
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

// Enhanced Insights Component with V2 data
function EnhancedInsights({ data }: { data: DashboardData }) {
  const { lifeScores, currentStreak, improvementTrend } = data;
  const latestScore = lifeScores[lifeScores.length - 1];
  
  const recentScores = lifeScores.slice(-7);
  const avgRecentScore = recentScores.length > 0 
    ? Math.round(recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length)
    : 0;

  const insights = [];

  // Burnout risk detection
  if (latestScore?.flags?.burnout_risk) {
    insights.push({
      type: 'critical',
      icon: '🚨',
      title: 'Rischio Burnout Rilevato',
      description: 'L\'AI ha identificato segnali di possibile burnout. Considera di rallentare e prenderti cura di te.'
    });
  }

  // Prediction-based insights
  if (latestScore?.prediction_7d && latestScore.prediction_7d > latestScore.score + 10) {
    insights.push({
      type: 'positive',
      icon: '📈',
      title: 'Miglioramento Previsto',
      description: `L'AI prevede un miglioramento del benessere nei prossimi giorni (+${Math.round(latestScore.prediction_7d - latestScore.score)} punti)`
    });
  } else if (latestScore?.prediction_7d && latestScore.prediction_7d < latestScore.score - 10) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Attenzione al Trend',
      description: 'L\'AI prevede un possibile calo del benessere. È il momento di agire preventivamente.'
    });
  }

  // Confidence-based insights
  if (latestScore?.confidence_level && latestScore.confidence_level < 0.6) {
    insights.push({
      type: 'info',
      icon: '📊',
      title: 'Raccolta Dati',
      description: 'Continua i check-in per migliorare la precisione delle predizioni AI.'
    });
  }

  // Anomaly insights
  if (latestScore?.anomaly_score && latestScore.anomaly_score > 0.5) {
    insights.push({
      type: 'warning',
      icon: '🔍',
      title: 'Pattern Anomalo',
      description: 'I tuoi dati di oggi sono insoliti. Potresti aver bisogno di attenzioni extra.'
    });
  }

  // Standard insights (fallback)
  if (insights.length === 0) {
    if (improvementTrend === 'improving') {
      insights.push({
        type: 'positive',
        icon: '📈',
        title: 'Tendenza Positiva',
        description: `Il tuo LifeScore è in miglioramento! Media degli ultimi 7 giorni: ${avgRecentScore}`
      });
    }

    if (currentStreak >= 7) {
      insights.push({
        type: 'achievement',
        icon: '🔥',
        title: 'Streak Fantastico!',
        description: `${currentStreak} giorni consecutivi di check-in. Continua così!`
      });
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Insights AI</h3>
      
      {insights.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔍</span>
            <div>
              <h4 className="font-medium text-blue-900">Analisi in corso</h4>
              <p className="text-sm text-blue-700">
                L'AI sta analizzando i tuoi pattern per generare insights personalizzati
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`border rounded-lg p-4 ${
                insight.type === 'positive' ? 'bg-green-50 border-green-200' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                insight.type === 'critical' ? 'bg-red-50 border-red-200' :
                insight.type === 'achievement' ? 'bg-purple-50 border-purple-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <h4 className={`font-medium ${
                    insight.type === 'positive' ? 'text-green-900' :
                    insight.type === 'warning' ? 'text-yellow-900' :
                    insight.type === 'critical' ? 'text-red-900' :
                    insight.type === 'achievement' ? 'text-purple-900' :
                    'text-blue-900'
                  }`}>
                    {insight.title}
                  </h4>
                  <p className={`text-sm ${
                    insight.type === 'positive' ? 'text-green-700' :
                    insight.type === 'warning' ? 'text-yellow-700' :
                    insight.type === 'critical' ? 'text-red-700' :
                    insight.type === 'achievement' ? 'text-purple-700' :
                    'text-blue-700'
                  }`}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Suggestions Analytics Component (unchanged)
function SuggestionsAnalytics({ analytics }: { analytics: SuggestionAnalytics[] }) {
  const topSuggestions = analytics
    .sort((a, b) => b.completion_rate - a.completion_rate)
    .slice(0, 3);

  const getSuggestionIcon = (key: string) => {
    if (key.includes('breathing')) return '🫁';
    if (key.includes('meditation')) return '🧘‍♀️';
    if (key.includes('walk')) return '🚶‍♂️';
    if (key.includes('nap')) return '😴';
    return '💡';
  };

  const getSuggestionName = (key: string) => {
    return key.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Efficacia Suggerimenti</h3>
      
      {topSuggestions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">Completa alcuni suggerimenti per vedere le statistiche</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {topSuggestions.map((suggestion, index) => (
            <div key={suggestion.suggestion_key} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSuggestionIcon(suggestion.suggestion_key)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {getSuggestionName(suggestion.suggestion_key)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {suggestion.total_completed} di {suggestion.total_suggested} completati
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(suggestion.completion_rate * 100)}%
                  </div>
                  {suggestion.avg_feedback > 0 && (
                    <div className="text-sm text-gray-500">
                      {suggestion.avg_feedback.toFixed(1)}/5 ⭐
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${suggestion.completion_rate * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Dashboard Component
export default function AdvancedDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setError('Devi essere autenticato per vedere la dashboard');
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const fromDate = daysAgo(timeRange);
        
        // Load LifeScores with V2 fields
        const { data: lifeScores, error: scoresError } = await supabase
          .from('lifescores')
          .select('*')
          .eq('user_id', userId)
          .gte('date', fromDate)
          .order('date', { ascending: true });

        if (scoresError) throw scoresError;

        // Load suggestion analytics
        const { data: suggestions, error: suggestionsError } = await supabase
          .from('user_suggestions')
          .select('suggestion_key, completed, feedback_mood, time_spent_sec')
          .eq('user_id', userId)
          .gte('date', fromDate);

        if (suggestionsError) throw suggestionsError;

        // Process suggestion analytics
        const analyticsMap = new Map<string, {
          total_suggested: number;
          total_completed: number;
          total_feedback: number;
          feedback_count: number;
          total_duration: number;
        }>();

        suggestions?.forEach(s => {
          if (!s.suggestion_key) return;
          
          const existing = analyticsMap.get(s.suggestion_key) || {
            total_suggested: 0,
            total_completed: 0,
            total_feedback: 0,
            feedback_count: 0,
            total_duration: 0
          };

          existing.total_suggested += 1;
          if (s.completed) {
            existing.total_completed += 1;
            if (s.feedback_mood) {
              existing.total_feedback += s.feedback_mood;
              existing.feedback_count += 1;
            }
            if (s.time_spent_sec) {
              existing.total_duration += s.time_spent_sec;
            }
          }
          
          analyticsMap.set(s.suggestion_key, existing);
        });

        const suggestionAnalytics: SuggestionAnalytics[] = Array.from(analyticsMap.entries()).map(([key, data]) => ({
          suggestion_key: key,
          total_suggested: data.total_suggested,
          total_completed: data.total_completed,
          completion_rate: data.total_suggested > 0 ? data.total_completed / data.total_suggested : 0,
          avg_feedback: data.feedback_count > 0 ? data.total_feedback / data.feedback_count : 0,
          avg_duration: data.total_completed > 0 ? data.total_duration / data.total_completed : 0
        }));

        // Calculate streak and other metrics
        const allCheckins = await supabase
          .from('health_metrics')
          .select('date')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        let currentStreak = 0;
        if (allCheckins.data && allCheckins.data.length > 0) {
          const dates = allCheckins.data.map(c => c.date).sort().reverse();
          const today = todayISO();
          
          for (let i = 0; i < dates.length; i++) {
            const expectedDate = daysAgo(-i);
            if (dates[i] === expectedDate || (i === 0 && dates[i] === today)) {
              currentStreak++;
            } else {
              break;
            }
          }
        }

        // Determine improvement trend
        const recentScores = (lifeScores || []).slice(-7);
        const olderScores = (lifeScores || []).slice(-14, -7);
        
        let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
        if (recentScores.length >= 3 && olderScores.length >= 3) {
          const recentAvg = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;
          const olderAvg = olderScores.reduce((sum, s) => sum + s.score, 0) / olderScores.length;
          
          if (recentAvg - olderAvg > 5) {
            improvementTrend = 'improving';
          } else if (olderAvg - recentAvg > 5) {
            improvementTrend = 'declining';
          }
        }

        setDashboardData({
          lifeScores: lifeScores || [],
          suggestionAnalytics,
          currentStreak,
          totalCheckIns: allCheckins.data?.length || 0,
          improvementTrend
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId, timeRange]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Errore</h2>
          <p className="text-red-700 mb-4">{error}</p>
          {error.includes('autenticato') && (
            <Link 
              href="/sign-in"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Vai al Login
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { lifeScores, suggestionAnalytics, currentStreak, totalCheckIns, improvementTrend } = dashboardData;
  
  const currentScore = lifeScores.length > 0 ? lifeScores[lifeScores.length - 1].score : 0;
  const avgScore = lifeScores.length > 0 
    ? Math.round(lifeScores.reduce((sum, s) => sum + s.score, 0) / lifeScores.length)
    : 0;
  
  const totalCompleted = suggestionAnalytics.reduce((sum, s) => sum + s.total_completed, 0);
  const latestScore = lifeScores[lifeScores.length - 1];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard LifeOS AI</h1>
          <p className="text-gray-600 mt-1">
            Analisi avanzata degli ultimi {timeRange} giorni con predizioni AI
          </p>
          {latestScore?.confidence_level && (
            <div className="mt-2">
              <ConfidenceIndicator level={latestScore.confidence_level} />
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days as 7 | 14 | 30)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === days
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} giorni
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">LifeScore Attuale</p>
              <p className="text-3xl font-bold">{currentScore}</p>
              {latestScore?.prediction_3d && (
                <p className="text-xs text-blue-200 mt-1">
                  Prev. 3g: {Math.round(latestScore.prediction_3d)}
                </p>
              )}
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Media Periodo</p>
              <p className="text-3xl font-bold">{avgScore}</p>
              {latestScore?.personal_baseline && (
                <p className="text-xs text-green-200 mt-1">
                  Baseline: {latestScore.personal_baseline}
                </p>
              )}
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Streak Giorni</p>
              <p className="text-3xl font-bold">{currentStreak}</p>
              {latestScore?.anomaly_score !== undefined && (
                <p className="text-xs text-purple-200 mt-1">
                  Anomalie: {Math.round(latestScore.anomaly_score * 100)}%
                </p>
              )}
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Attività Completate</p>
              <p className="text-3xl font-bold">{totalCompleted}</p>
              {latestScore?.circadian_factor && (
                <p className="text-xs text-orange-200 mt-1">
                  Ritmo: {latestScore.circadian_factor.toFixed(2)}x
                </p>
              )}
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Andamento e Predizioni AI</h2>
            <p className="text-gray-600 text-sm">
              Visualizza trend storico e predizioni future del tuo benessere
            </p>
          </div>
          <Link
            href="/checkin"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Nuovo Check-in
          </Link>
        </div>
        
        {lifeScores.length > 0 ? (
          <EnhancedLineChart data={lifeScores} breakdown={true} />
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">Nessun dato disponibile per il periodo selezionato</p>
              <Link
                href="/checkin"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Inizia con un Check-in
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* AI Features Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PredictionsPanel data={lifeScores} />
        <AnomalyDetection data={lifeScores} />
        <AISuggestions data={lifeScores} />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SuggestionsAnalytics analytics={suggestionAnalytics} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <EnhancedInsights data={dashboardData} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/checkin"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <span className="text-2xl">📝</span>
            <div>
              <h4 className="font-medium text-gray-900">Check-in Giornaliero</h4>
              <p className="text-sm text-gray-600">Registra il tuo stato di oggi</p>
            </div>
          </Link>

          <Link
            href="/suggestions"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
          >
            <span className="text-2xl">🤖</span>
            <div>
              <h4 className="font-medium text-gray-900">Suggerimenti AI</h4>
              <p className="text-sm text-gray-600">Consigli personalizzati e tutorial</p>
            </div>
          </Link>

          <Link
            href="/profile"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
          >
            <span className="text-2xl">⚙️</span>
            <div>
              <h4 className="font-medium text-gray-900">Profilo AI</h4>
              <p className="text-sm text-gray-600">Personalizza l'algoritmo</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
