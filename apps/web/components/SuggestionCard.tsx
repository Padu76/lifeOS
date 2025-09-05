'use client'
import React, { useState } from 'react';
import { Clock, Play, Check, SkipForward } from 'lucide-react';

interface Suggestion {
  id: string;
  key: string;
  title: string;
  short_copy: string;
  category: 'breathing' | 'meditation' | 'movement' | 'rest' | 'nutrition';
  duration_sec: number;
  difficulty: 1 | 2 | 3;
  priority: number;
  reason?: string;
  completed?: boolean;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  onStart: (suggestionKey: string) => void;
  onComplete?: (suggestionKey: string) => void;
  onSkip?: (suggestionKey: string) => void;
  className?: string;
}

export default function SuggestionCard({
  suggestion,
  onStart,
  onComplete,
  onSkip,
  className = ''
}: SuggestionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get category styling
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'breathing':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: '🫁',
          color: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800'
        };
      case 'meditation':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: '🧘‍♀️',
          color: 'text-purple-700',
          badge: 'bg-purple-100 text-purple-800'
        };
      case 'movement':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: '🏃‍♂️',
          color: 'text-green-700',
          badge: 'bg-green-100 text-green-800'
        };
      case 'rest':
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          icon: '😴',
          color: 'text-indigo-700',
          badge: 'bg-indigo-100 text-indigo-800'
        };
      case 'nutrition':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: '🥗',
          color: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: '💡',
          color: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const categoryStyle = getCategoryStyle(suggestion.category);

  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  // Get difficulty stars
  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span
        key={i}
        className={i < difficulty ? 'text-yellow-400' : 'text-gray-300'}
      >
        ⭐
      </span>
    ));
  };

  // Get priority indicator
  const getPriorityIndicator = (priority: number) => {
    if (priority >= 8) return { text: 'Alta', color: 'bg-red-100 text-red-800' };
    if (priority >= 5) return { text: 'Media', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Bassa', color: 'bg-gray-100 text-gray-600' };
  };

  const priorityIndicator = getPriorityIndicator(suggestion.priority);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
        isHovered ? 'shadow-lg transform scale-105' : 'shadow-sm'
      } ${categoryStyle.bg} ${categoryStyle.border} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Completed overlay */}
      {suggestion.completed && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center z-10">
          <div className="bg-green-500 text-white rounded-full p-3">
            <Check className="w-8 h-8" />
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{categoryStyle.icon}</span>
            <div>
              <h3 className={`font-semibold text-lg ${categoryStyle.color}`}>
                {suggestion.title}
              </h3>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${categoryStyle.badge}`}>
                {suggestion.category}
              </span>
            </div>
          </div>
          
          {/* Priority badge */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityIndicator.color}`}>
            {priorityIndicator.text}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 leading-relaxed">
          {suggestion.short_copy}
        </p>

        {/* Reason (why suggested) */}
        {suggestion.reason && (
          <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Perché ora:</span> {suggestion.reason}
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {/* Duration */}
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(suggestion.duration_sec)}</span>
            </div>

            {/* Difficulty */}
            <div className="flex items-center space-x-1">
              <span className="text-xs">Difficoltà:</span>
              <div className="flex">
                {getDifficultyStars(suggestion.difficulty)}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          {!suggestion.completed ? (
            <>
              <button
                onClick={() => onStart(suggestion.key)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  isHovered 
                    ? `${categoryStyle.color} bg-white shadow-md transform translate-y-[-2px]`
                    : `${categoryStyle.color} bg-white hover:shadow-md`
                }`}
              >
                <Play className="w-4 h-4" />
                <span>Inizia Tutorial</span>
              </button>

              {onSkip && (
                <button
                  onClick={() => onSkip(suggestion.key)}
                  className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Salta questo suggerimento"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-green-100 text-green-700 font-medium">
              <Check className="w-4 h-4" />
              <span>Completato</span>
            </div>
          )}
        </div>

        {/* Progress indicator for current activity */}
        {isHovered && !suggestion.completed && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Pronto per iniziare</span>
            </div>
          </div>
        )}
      </div>

      {/* Hover effect glow */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 rounded-2xl opacity-20 ${categoryStyle.bg}`} />
        </div>
      )}
    </div>
  );
}
