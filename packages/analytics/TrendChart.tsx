// =====================================================
// LifeOS - Trend Chart Component
// File: TrendChart.tsx
// =====================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface MetricTrend {
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface TrendChartProps {
  data: MetricTrend[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  type?: 'line' | 'bar' | 'area';
}

interface DataPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  height = 200,
  color = '#7c3aed',
  showGrid = true,
  showLabels = true,
  animated = true,
  style,
  type = 'line',
}) => {
  const containerAnim = useRef(new Animated.Value(0)).current;
  const chartWidth = screenWidth - 80; // Account for padding

  // Prepare chart data
  const prepareData = (): DataPoint[] => {
    if (data.length === 0) return [];

    return data.map((item, index) => ({
      x: (index / (data.length - 1)) * chartWidth,
      y: 0, // Will be calculated based on value
      value: item.current_value,
      label: item.metric_name,
    }));
  };

  const chartData = prepareData();

  // Calculate Y positions based on values
  const minValue = Math.min(...data.map(d => Math.min(d.current_value, d.previous_value)));
  const maxValue = Math.max(...data.map(d => Math.max(d.current_value, d.previous_value)));
  const valueRange = maxValue - minValue || 1;

  const dataPoints: DataPoint[] = chartData.map(point => ({
    ...point,
    y: height - ((point.value - minValue) / valueRange) * (height - 40),
  }));

  // Entry animation
  useEffect(() => {
    if (animated) {
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    } else {
      containerAnim.setValue(1);
    }
  }, [animated, containerAnim]);

  // Generate path for line chart
  const generateLinePath = (): string => {
    if (dataPoints.length === 0) return '';

    let path = `M ${dataPoints[0].x} ${dataPoints[0].y}`;
    
    for (let i = 1; i < dataPoints.length; i++) {
      // Smooth curve using quadratic bezier
      const prevPoint = dataPoints[i - 1];
      const currentPoint = dataPoints[i];
      const controlPointX = (prevPoint.x + currentPoint.x) / 2;
      
      path += ` Q ${controlPointX} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
    }
    
    return path;
  };

  // Generate path for area chart
  const generateAreaPath = (): string => {
    if (dataPoints.length === 0) return '';

    const linePath = generateLinePath();
    const lastPoint = dataPoints[dataPoints.length - 1];
    const firstPoint = dataPoints[0];
    
    return `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
  };

  // Render grid lines
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const gridCount = 4;

    // Horizontal grid lines
    for (let i = 0; i <= gridCount; i++) {
      const y = (height / gridCount) * i;
      gridLines.push(
        <View
          key={`h-${i}`}
          style={[
            styles.gridLine,
            {
              top: y,
              width: chartWidth,
              height: 1,
            },
          ]}
        />
      );
    }

    // Vertical grid lines
    for (let i = 0; i <= data.length - 1; i++) {
      const x = (chartWidth / (data.length - 1)) * i;
      gridLines.push(
        <View
          key={`v-${i}`}
          style={[
            styles.gridLine,
            {
              left: x,
              width: 1,
              height: height,
            },
          ]}
        />
      );
    }

    return <View style={styles.gridContainer}>{gridLines}</View>;
  };

  // Render data points
  const renderDataPoints = () => {
    return dataPoints.map((point, index) => {
      const trend = data[index]?.trend;
      const pointColor = trend === 'improving' ? '#10b981' : 
                        trend === 'declining' ? '#ef4444' : 
                        color;

      return (
        <Animated.View
          key={index}
          style={[
            styles.dataPoint,
            {
              left: point.x - 4,
              top: point.y - 4,
              backgroundColor: pointColor,
              opacity: containerAnim,
              transform: [
                {
                  scale: containerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Value label */}
          {showLabels && (
            <Animated.View
              style={[
                styles.valueLabel,
                {
                  opacity: containerAnim,
                  transform: [
                    {
                      translateY: containerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.valueLabelText}>
                {point.value.toFixed(1)}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      );
    });
  };

  // Render line chart
  const renderLineChart = () => {
    if (dataPoints.length < 2) return null;

    return (
      <Animated.View
        style={[
          styles.lineContainer,
          {
            opacity: containerAnim,
          },
        ]}
      >
        {/* This would use react-native-svg in a real implementation */}
        {/* For now, we'll simulate with connected dots */}
        {dataPoints.slice(1).map((point, index) => {
          const prevPoint = dataPoints[index];
          const distance = Math.sqrt(
            Math.pow(point.x - prevPoint.x, 2) + 
            Math.pow(point.y - prevPoint.y, 2)
          );
          const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x);

          return (
            <View
              key={index}
              style={[
                styles.lineSegment,
                {
                  left: prevPoint.x,
                  top: prevPoint.y,
                  width: distance,
                  transform: [{ rotate: `${angle}rad` }],
                  backgroundColor: color,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    );
  };

  // Render bar chart
  const renderBarChart = () => {
    const barWidth = chartWidth / data.length * 0.6;
    const barSpacing = chartWidth / data.length * 0.4;

    return dataPoints.map((point, index) => {
      const trend = data[index]?.trend;
      const barColor = trend === 'improving' ? '#10b981' : 
                      trend === 'declining' ? '#ef4444' : 
                      color;
      
      const barHeight = height - point.y;

      return (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              left: point.x - barWidth / 2,
              bottom: 0,
              width: barWidth,
              height: containerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, barHeight],
              }),
              backgroundColor: barColor,
            },
          ]}
        />
      );
    });
  };

  // Render labels
  const renderLabels = () => {
    if (!showLabels) return null;

    return (
      <View style={styles.labelsContainer}>
        {data.map((item, index) => (
          <Animated.View
            key={index}
            style={[
              styles.labelContainer,
              {
                left: dataPoints[index]?.x - 30 || 0,
                opacity: containerAnim,
              },
            ]}
          >
            <Text style={styles.labelText} numberOfLines={1}>
              {item.metric_name.length > 8 
                ? item.metric_name.substring(0, 8) + '...'
                : item.metric_name
              }
            </Text>
            
            {/* Trend indicator */}
            <View style={styles.trendIndicator}>
              <Text style={[
                styles.trendText,
                {
                  color: item.trend === 'improving' ? '#10b981' :
                        item.trend === 'declining' ? '#ef4444' :
                        '#6b7280',
                },
              ]}>
                {item.trend === 'improving' ? '↗' :
                 item.trend === 'declining' ? '↘' : '→'}
                {Math.abs(item.change_percentage).toFixed(1)}%
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    );
  };

  // Empty state
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }, style]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>Nessun dato disponibile</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      <View style={[styles.chartContainer, { height, width: chartWidth }]}>
        {/* Grid */}
        {renderGrid()}

        {/* Chart based on type */}
        {type === 'line' && renderLineChart()}
        {type === 'bar' && renderBarChart()}
        {type === 'area' && (
          <>
            {/* Area fill would go here */}
            {renderLineChart()}
          </>
        )}

        {/* Data points */}
        {(type === 'line' || type === 'area') && renderDataPoints()}
      </View>

      {/* Labels */}
      {renderLabels()}

      {/* Y-axis labels */}
      <View style={styles.yAxisContainer}>
        <Text style={styles.yAxisLabel}>{maxValue.toFixed(1)}</Text>
        <Text style={styles.yAxisLabel}>{((maxValue + minValue) / 2).toFixed(1)}</Text>
        <Text style={styles.yAxisLabel}>{minValue.toFixed(1)}</Text>
      </View>
    </View>
  );
};

// Preset Chart Components
export const LifeScoreTrendChart: React.FC<{
  data: MetricTrend[];
  style?: ViewStyle;
}> = ({ data, style }) => (
  <TrendChart
    data={data}
    height={180}
    color="#7c3aed"
    type="area"
    style={style}
  />
);

export const EngagementTrendChart: React.FC<{
  data: MetricTrend[];
  style?: ViewStyle;
}> = ({ data, style }) => (
  <TrendChart
    data={data}
    height={160}
    color="#3b82f6"
    type="line"
    style={style}
  />
);

export const CompletionTrendChart: React.FC<{
  data: MetricTrend[];
  style?: ViewStyle;
}> = ({ data, style }) => (
  <TrendChart
    data={data}
    height={140}
    color="#10b981"
    type="bar"
    style={style}
  />
);

export const MiniTrendChart: React.FC<{
  data: MetricTrend[];
  color?: string;
  style?: ViewStyle;
}> = ({ data, color = '#7c3aed', style }) => (
  <TrendChart
    data={data}
    height={60}
    color={color}
    type="line"
    showGrid={false}
    showLabels={false}
    style={style}
  />
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'relative',
  },
  chartContainer: {
    position: 'relative',
    marginLeft: 40,
    marginRight: 20,
    marginBottom: 40,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#374151',
    opacity: 0.3,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  valueLabel: {
    position: 'absolute',
    bottom: 12,
    left: -15,
    width: 30,
    alignItems: 'center',
  },
  valueLabelText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bar: {
    position: 'absolute',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  labelsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 20,
    height: 40,
  },
  labelContainer: {
    position: 'absolute',
    width: 60,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 2,
  },
  trendIndicator: {
    alignItems: 'center',
  },
  trendText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  yAxisContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 40,
    width: 35,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

// Advanced Chart with Multiple Series
export const MultiSeriesChart: React.FC<{
  series: Array<{
    name: string;
    data: MetricTrend[];
    color: string;
  }>;
  height?: number;
  style?: ViewStyle;
}> = ({ series, height = 200, style }) => {
  if (series.length === 0) {
    return (
      <View style={[styles.container, { height }, style]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>Nessuna serie di dati</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      {/* Legend */}
      <View style={styles.legendContainer}>
        {series.map((serie, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: serie.color }]} />
            <Text style={styles.legendText}>{serie.name}</Text>
          </View>
        ))}
      </View>

      {/* Charts overlay */}
      {series.map((serie, index) => (
        <View key={index} style={StyleSheet.absoluteFill}>
          <TrendChart
            data={serie.data}
            height={height - 30}
            color={serie.color}
            type="line"
            showLabels={index === 0} // Only show labels for first series
          />
        </View>
      ))}
    </View>
  );
};

const legendStyles = StyleSheet.create({
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#e5e7eb',
  },
});
