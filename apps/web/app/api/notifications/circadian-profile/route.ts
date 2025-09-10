import { NextRequest, NextResponse } from 'next/server';
import { IntelligentTimingSystem } from '@/packages/core/advice/intelligentTimingSystem';
import { createClient } from '@supabase/supabase-js';

// Types from existing system
interface CircadianProfileResponse {
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  natural_wake_time: string;
  natural_sleep_time: string;
  peak_energy_hours: number[];
  low_energy_hours: number[];
  stress_peak_hours: number[];
  optimal_intervention_windows: Array<{
    start_hour: number;
    end_hour: number;
    effectiveness_score: number;
    intervention_type: 'stress_relief' | 'energy_boost' | 'mindfulness' | 'celebration';
    frequency_limit: number;
  }>;
  last_updated: string;
  confidence_score: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/auth - replace with your auth system
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch user's historical metrics for analysis
    const { data: historicalMetrics, error: metricsError } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(90); // Last 90 days for pattern analysis

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    // Check if we have existing circadian profile
    const { data: existingProfile, error: existingError } = await supabase
      .from('circadian_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    let circadianProfile: CircadianProfileResponse;

    if (existingProfile && !shouldRegenerateProfile(existingProfile.last_updated)) {
      // Return existing profile if it's recent enough (less than 7 days old)
      circadianProfile = {
        chronotype: existingProfile.chronotype,
        natural_wake_time: existingProfile.natural_wake_time,
        natural_sleep_time: existingProfile.natural_sleep_time,
        peak_energy_hours: existingProfile.peak_energy_hours,
        low_energy_hours: existingProfile.low_energy_hours,
        stress_peak_hours: existingProfile.stress_peak_hours,
        optimal_intervention_windows: existingProfile.optimal_intervention_windows,
        last_updated: existingProfile.last_updated,
        confidence_score: existingProfile.confidence_score
      };
    } else {
      // Generate new circadian profile using IntelligentTimingSystem
      const timingSystem = new IntelligentTimingSystem();
      
      if (!historicalMetrics || historicalMetrics.length < 7) {
        // Not enough data - return default profile
        circadianProfile = getDefaultCircadianProfile();
      } else {
        // Analyze circadian patterns
        const analyzedProfile = timingSystem.analyzeCircadianProfile(
          historicalMetrics,
          userProfile
        );

        // Calculate confidence score based on data quality
        const confidenceScore = calculateConfidenceScore(historicalMetrics);

        circadianProfile = {
          chronotype: analyzedProfile.chronotype,
          natural_wake_time: analyzedProfile.natural_wake_time,
          natural_sleep_time: analyzedProfile.natural_sleep_time,
          peak_energy_hours: analyzedProfile.peak_energy_hours,
          low_energy_hours: analyzedProfile.low_energy_hours,
          stress_peak_hours: analyzedProfile.stress_peak_hours,
          optimal_intervention_windows: analyzedProfile.optimal_intervention_windows,
          last_updated: new Date().toISOString(),
          confidence_score: confidenceScore
        };

        // Save updated profile to database
        await supabase
          .from('circadian_profiles')
          .upsert({
            user_id: userId,
            ...circadianProfile,
            updated_at: new Date().toISOString()
          });
      }
    }

    return NextResponse.json({
      success: true,
      data: circadianProfile
    });

  } catch (error) {
    console.error('Error in circadian profile API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { force_regenerate } = body;

    if (force_regenerate) {
      // Force regeneration by marking existing profile as outdated
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabase
        .from('circadian_profiles')
        .update({ 
          last_updated: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
        })
        .eq('user_id', userId);

      // Redirect to GET to regenerate
      return GET(request);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('Error in circadian profile POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Replace with your authentication system
  // Example using JWT or session
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  // Extract user ID from auth token
  // This is a placeholder - implement your auth logic
  try {
    // Example: verify JWT token and extract user ID
    const token = authHeader.replace('Bearer ', '');
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // return decoded.userId;
    
    // For now, return a mock user ID for development
    return 'user_123'; // Replace with real implementation
  } catch (error) {
    return null;
  }
}

function shouldRegenerateProfile(lastUpdated: string): boolean {
  const lastUpdateDate = new Date(lastUpdated);
  const now = new Date();
  const daysDiff = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Regenerate if older than 7 days
  return daysDiff > 7;
}

function getDefaultCircadianProfile(): CircadianProfileResponse {
  return {
    chronotype: 'intermediate',
    natural_wake_time: '07:00',
    natural_sleep_time: '23:00',
    peak_energy_hours: [9, 10, 11, 15, 16],
    low_energy_hours: [13, 14, 20, 21],
    stress_peak_hours: [11, 17],
    optimal_intervention_windows: [
      {
        start_hour: 9,
        end_hour: 11,
        effectiveness_score: 0.7,
        intervention_type: 'mindfulness',
        frequency_limit: 1
      },
      {
        start_hour: 15,
        end_hour: 17,
        effectiveness_score: 0.8,
        intervention_type: 'energy_boost',
        frequency_limit: 1
      }
    ],
    last_updated: new Date().toISOString(),
    confidence_score: 0.3 // Low confidence for default profile
  };
}

function calculateConfidenceScore(metrics: any[]): number {
  if (!metrics || metrics.length === 0) return 0;
  
  const dataPoints = metrics.length;
  const consistencyScore = calculateDataConsistency(metrics);
  const recencyScore = calculateDataRecency(metrics);
  
  // Combine factors for overall confidence
  let confidence = 0;
  
  // Data quantity (more data = higher confidence)
  confidence += Math.min(dataPoints / 30, 1) * 0.4; // 30 days = max points
  
  // Data consistency (less variance = higher confidence)
  confidence += consistencyScore * 0.3;
  
  // Data recency (recent data = higher confidence)
  confidence += recencyScore * 0.3;
  
  return Math.min(confidence, 1);
}

function calculateDataConsistency(metrics: any[]): number {
  // Calculate variance in sleep/wake times
  // Lower variance = higher consistency = higher score
  const sleepTimes = metrics
    .map(m => m.sleep_time)
    .filter(Boolean)
    .map(time => timeToMinutes(time));
  
  if (sleepTimes.length < 7) return 0.5; // Medium confidence for small samples
  
  const variance = calculateVariance(sleepTimes);
  const maxVariance = 120; // 2 hours in minutes
  
  return Math.max(0, 1 - (variance / maxVariance));
}

function calculateDataRecency(metrics: any[]): number {
  if (!metrics || metrics.length === 0) return 0;
  
  const mostRecentDate = new Date(Math.max(...metrics.map(m => new Date(m.date || m.timestamp).getTime())));
  const daysSinceLastData = (Date.now() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Higher score for more recent data
  return Math.max(0, 1 - (daysSinceLastData / 7)); // 7 days = 0 score
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
}
