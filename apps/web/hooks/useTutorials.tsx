'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Types matching database schema
export interface TutorialStep {
  step: number;
  instruction: string;
  duration_sec?: number;
  animation_type?: 'breathing_circle' | 'timer' | 'movement' | null;
  audio_cue?: string;
  breathing_pattern?: '4-7-8' | '5-5';
}

export interface TutorialRecipe {
  id: number;
  key: string;
  title: string;
  short_copy: string;
  description: string;
  category: 'breathing' | 'meditation' | 'movement' | 'mindfulness' | 'sleep';
  difficulty: number;
  estimated_duration_sec: number;
  steps: TutorialStep[];
  tags: string[];
  benefits: string[];
  is_active: boolean;
  is_premium: boolean;
}

export interface TutorialSession {
  id: number;
  tutorial_recipe_id: number;
  started_at: string;
  completed_at?: string;
  total_duration_sec?: number;
  steps_completed: number;
  steps_total: number;
  completion_rate: number;
  final_mood_rating?: number;
  session_notes?: string;
}

export interface TutorialStats {
  total_sessions: number;
  completed_sessions: number;
  total_time_minutes: number;
  avg_completion_rate: number;
  favorite_category: string;
  current_streak: number;
}

interface UseTutorialsReturn {
  // Data
  tutorials: TutorialRecipe[];
  currentSession: TutorialSession | null;
  stats: TutorialStats | null;
  recommendations: TutorialRecipe[];
  
  // Loading states
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Actions
  loadTutorials: (category?: string) => Promise<void>;
  loadRecommendations: () => Promise<void>;
  loadStats: () => Promise<void>;
  startSession: (tutorialId: number) => Promise<number | null>;
  completeSession: (sessionId: number, moodRating?: number, notes?: string) => Promise<void>;
  logStep: (sessionId: number, stepNumber: number, action: 'started' | 'completed' | 'skipped') => Promise<void>;
  getTutorialByKey: (key: string) => TutorialRecipe | null;
}

export function useTutorials(): UseTutorialsReturn {
  const [tutorials, setTutorials] = useState<TutorialRecipe[]>([]);
  const [currentSession, setCurrentSession] = useState<TutorialSession | null>(null);
  const [stats, setStats] = useState<TutorialStats | null>(null);
  const [recommendations, setRecommendations] = useState<TutorialRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tutorials from database
  const loadTutorials = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('tutorial_recipes')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setTutorials(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading tutorials:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_recommended_tutorials', { limit_count: 5 });

      if (fetchError) throw fetchError;

      // Convert to TutorialRecipe format
      const recsWithSteps = await Promise.all(
        (data || []).map(async (rec: any) => {
          const { data: fullTutorial } = await supabase
            .from('tutorial_recipes')
            .select('*')
            .eq('id', rec.id)
            .single();
          
          return fullTutorial;
        })
      );

      setRecommendations(recsWithSteps.filter(Boolean));
    } catch (err: any) {
      console.error('Error loading recommendations:', err);
    }
  }, []);

  // Load user stats
  const loadStats = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_user_tutorial_stats');

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  }, []);

  // Start new tutorial session
  const startSession = useCallback(async (tutorialId: number): Promise<number | null> => {
    setSaving(true);
    setError(null);

    try {
      const tutorial = tutorials.find(t => t.id === tutorialId);
      if (!tutorial) throw new Error('Tutorial not found');

      const { data, error: insertError } = await supabase
        .from('tutorial_sessions')
        .insert({
          tutorial_recipe_id: tutorialId,
          steps_total: tutorial.steps.length,
          steps_completed: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setCurrentSession(data);
      return data.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error starting session:', err);
      return null;
    } finally {
      setSaving(false);
    }
  }, [tutorials]);

  // Complete tutorial session
  const completeSession = useCallback(async (
    sessionId: number, 
    moodRating?: number, 
    notes?: string
  ) => {
    setSaving(true);
    setError(null);

    try {
      const updates: any = {
        completed_at: new Date().toISOString(),
        final_mood_rating: moodRating,
        session_notes: notes
      };

      // Calculate duration if session exists
      if (currentSession) {
        const startTime = new Date(currentSession.started_at).getTime();
        const endTime = new Date().getTime();
        updates.total_duration_sec = Math.floor((endTime - startTime) / 1000);
      }

      const { error: updateError } = await supabase
        .from('tutorial_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (updateError) throw updateError;

      setCurrentSession(null);
      
      // Refresh stats after completion
      await loadStats();
    } catch (err: any) {
      setError(err.message);
      console.error('Error completing session:', err);
    } finally {
      setSaving(false);
    }
  }, [currentSession, loadStats]);

  // Log individual step progress
  const logStep = useCallback(async (
    sessionId: number, 
    stepNumber: number, 
    action: 'started' | 'completed' | 'skipped'
  ) => {
    try {
      const logData: any = {
        session_id: sessionId,
        step_number: stepNumber,
        action,
        started_at: new Date().toISOString()
      };

      if (action === 'completed' || action === 'skipped') {
        logData.completed_at = new Date().toISOString();
      }

      const { error: logError } = await supabase
        .from('tutorial_step_logs')
        .insert(logData);

      if (logError) throw logError;

      // Update session progress
      if (action === 'completed') {
        const { error: updateError } = await supabase
          .from('tutorial_sessions')
          .update({
            steps_completed: stepNumber
          })
          .eq('id', sessionId);

        if (updateError) throw updateError;

        // Update local session state
        if (currentSession && currentSession.id === sessionId) {
          setCurrentSession({
            ...currentSession,
            steps_completed: stepNumber
          });
        }
      }
    } catch (err: any) {
      console.error('Error logging step:', err);
    }
  }, [currentSession]);

  // Get tutorial by key
  const getTutorialByKey = useCallback((key: string): TutorialRecipe | null => {
    return tutorials.find(t => t.key === key) || null;
  }, [tutorials]);

  // Load initial data
  useEffect(() => {
    loadTutorials();
    loadRecommendations();
    loadStats();
  }, [loadTutorials, loadRecommendations, loadStats]);

  return {
    // Data
    tutorials,
    currentSession,
    stats,
    recommendations,
    
    // Loading states
    loading,
    saving,
    error,
    
    // Actions
    loadTutorials,
    loadRecommendations,
    loadStats,
    startSession,
    completeSession,
    logStep,
    getTutorialByKey
  };
}

// Hook specializzato per tutorial specifici
export function useTutorial(tutorialKey: string) {
  const { getTutorialByKey, startSession, currentSession, saving } = useTutorials();
  const [tutorial, setTutorial] = useState<TutorialRecipe | null>(null);

  useEffect(() => {
    const foundTutorial = getTutorialByKey(tutorialKey);
    setTutorial(foundTutorial);
  }, [tutorialKey, getTutorialByKey]);

  const start = useCallback(async () => {
    if (tutorial) {
      return await startSession(tutorial.id);
    }
    return null;
  }, [tutorial, startSession]);

  return {
    tutorial,
    start,
    currentSession,
    loading: saving
  };
}

// Hook per statistiche dashboard
export function useTutorialStats() {
  const { stats, loadStats, loading } = useTutorials();

  const refresh = useCallback(() => {
    return loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    refresh
  };
}
