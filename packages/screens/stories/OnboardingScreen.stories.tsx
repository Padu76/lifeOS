import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingScreen } from '../OnboardingScreen';

const meta = {
  title: 'Screens/OnboardingScreen',
  component: OnboardingScreen,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  argTypes: {
    navigation: {
      description: 'React Navigation object',
      control: false,
    },
  },
} satisfies Meta<typeof OnboardingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock navigation object
const mockNavigation = {
  navigate: (screen: string) => console.log(`Navigate to: ${screen}`),
  replace: (screen: string) => console.log(`Replace with: ${screen}`),
  goBack: () => console.log('Go back'),
};

// Mock user initialization hook with different states
const createMockUserInitialization = (overrides = {}) => ({
  progress: {
    currentSection: 'profile',
    step: 1,
    totalSteps: 4,
    ...overrides.progress,
  },
  answers: {
    chronotype: null,
    sensitivity_level: null,
    preferred_tone: null,
    focus_areas: [],
    main_goals: [],
    current_stress_level: 5,
    current_energy_level: 5,
    current_sleep_quality: 5,
    time_availability: null,
    notification_preferences: { push_enabled: true, optimal_times: [] },
    quiet_hours: { start_time: '22:00', end_time: '07:00' },
    ...overrides.answers,
  },
  result: null,
  isCompleted: false,
  loading: false,
  error: null,
  nextStep: () => console.log('Next step'),
  previousStep: () => console.log('Previous step'),
  setChronotype: (type: string) => console.log('Set chronotype:', type),
  setSensitivityLevel: (level: string) => console.log('Set sensitivity:', level),
  setPreferredTone: (tone: string) => console.log('Set tone:', tone),
  setFocusAreas: (areas: string[]) => console.log('Set focus areas:', areas),
  setCurrentLevels: (stress: number, energy: number, sleep: number) => 
    console.log('Set levels:', { stress, energy, sleep }),
  setMainGoals: (goals: string[]) => console.log('Set goals:', goals),
  setTimeAvailability: (time: string) => console.log('Set time availability:', time),
  setNotificationPreferences: (enabled: boolean, times: string[]) => 
    console.log('Set notifications:', { enabled, times }),
  setQuietHours: (start: string, end: string) => 
    console.log('Set quiet hours:', { start, end }),
  completeOnboarding: () => Promise.resolve(),
  getCompletionPercentage: () => 25,
  canProceed: () => true,
  ...overrides,
});

// Profile step stories
export const ProfileStep: Story = {
  name: '1. Profile Step',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'profile', step: 1, totalSteps: 4 },
        }),
      },
    ],
  },
};

export const ProfileStepWithSelections: Story = {
  name: '1. Profile Step - With Selections',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'profile', step: 1, totalSteps: 4 },
          answers: {
            chronotype: 'early_bird',
            sensitivity_level: 'moderate',
            preferred_tone: 'friendly',
          },
        }),
      },
    ],
  },
};

// Assessment step stories
export const AssessmentStep: Story = {
  name: '2. Assessment Step',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'assessment', step: 2, totalSteps: 4 },
          answers: {
            chronotype: 'early_bird',
            sensitivity_level: 'moderate',
            preferred_tone: 'friendly',
          },
        }),
      },
    ],
  },
};

export const AssessmentStepWithValues: Story = {
  name: '2. Assessment Step - With Values',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'assessment', step: 2, totalSteps: 4 },
          answers: {
            chronotype: 'early_bird',
            sensitivity_level: 'moderate',
            preferred_tone: 'friendly',
            current_stress_level: 7,
            current_energy_level: 4,
            current_sleep_quality: 6,
          },
        }),
      },
    ],
  },
};

// Preferences step stories
export const PreferencesStep: Story = {
  name: '3. Preferences Step',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'preferences', step: 3, totalSteps: 4 },
          getCompletionPercentage: () => 75,
        }),
      },
    ],
  },
};

export const PreferencesStepWithAreas: Story = {
  name: '3. Preferences Step - With Focus Areas',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'preferences', step: 3, totalSteps: 4 },
          answers: {
            focus_areas: [
              '🧘 Gestione stress',
              '⚡ Energia e vitalità',
              '😴 Qualità del sonno',
              '🎯 Focus e concentrazione',
            ],
          },
          getCompletionPercentage: () => 75,
        }),
      },
    ],
  },
};

// Goals step stories
export const GoalsStep: Story = {
  name: '4. Goals Step',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'goals', step: 4, totalSteps: 4 },
          getCompletionPercentage: () => 85,
        }),
      },
    ],
  },
};

export const GoalsStepWithSelections: Story = {
  name: '4. Goals Step - With Goals Selected',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'goals', step: 4, totalSteps: 4 },
          answers: {
            main_goals: [
              'Ridurre lo stress',
              'Migliorare il sonno',
              'Aumentare l\'energia',
            ],
            time_availability: 'medium',
          },
          getCompletionPercentage: () => 85,
        }),
      },
    ],
  },
};

// Finalization step stories
export const FinalizationStep: Story = {
  name: '5. Finalization Step',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'finalization', step: 5, totalSteps: 4 },
          answers: {
            chronotype: 'early_bird',
            sensitivity_level: 'moderate',
            preferred_tone: 'friendly',
            focus_areas: ['🧘 Gestione stress', '⚡ Energia e vitalità'],
            main_goals: ['Ridurre lo stress', 'Migliorare il sonno'],
            time_availability: 'medium',
          },
          getCompletionPercentage: () => 95,
        }),
      },
    ],
  },
};

export const FinalizationStepComplete: Story = {
  name: '5. Finalization Step - Ready to Complete',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'finalization', step: 5, totalSteps: 4 },
          answers: {
            chronotype: 'early_bird',
            sensitivity_level: 'moderate',
            preferred_tone: 'friendly',
            focus_areas: ['🧘 Gestione stress', '⚡ Energia e vitalità', '😴 Qualità del sonno'],
            main_goals: ['Ridurre lo stress', 'Migliorare il sonno', 'Aumentare l\'energia'],
            time_availability: 'medium',
            notification_preferences: { push_enabled: true, optimal_times: [] },
            quiet_hours: { start_time: '22:00', end_time: '07:00' },
          },
          getCompletionPercentage: () => 100,
        }),
      },
    ],
  },
};

// Loading states
export const LoadingState: Story = {
  name: 'Loading State',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          loading: true,
        }),
      },
    ],
  },
};

export const CompletingOnboarding: Story = {
  name: 'Completing Onboarding',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'POST',
        status: 200,
        response: createMockUserInitialization({
          loading: true,
          progress: { currentSection: 'finalization', step: 5, totalSteps: 4 },
        }),
      },
    ],
  },
};

// Error states
export const ErrorState: Story = {
  name: 'Error State',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 500,
        response: createMockUserInitialization({
          error: 'Impossibile caricare i dati di inizializzazione',
        }),
      },
    ],
  },
};

export const NetworkError: Story = {
  name: 'Network Error',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 0,
        response: createMockUserInitialization({
          error: 'Errore di connessione. Verifica la tua connessione internet.',
        }),
      },
    ],
  },
};

// Edge cases
export const CannotProceedProfile: Story = {
  name: 'Cannot Proceed - Profile Incomplete',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'profile', step: 1, totalSteps: 4 },
          canProceed: () => false,
        }),
      },
    ],
  },
};

export const MinimalFocusAreas: Story = {
  name: 'Minimal Focus Areas Selected',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'preferences', step: 3, totalSteps: 4 },
          answers: {
            focus_areas: ['🧘 Gestione stress'],
          },
          canProceed: () => false, // Need at least 2 areas
        }),
      },
    ],
  },
};

export const MaximalFocusAreas: Story = {
  name: 'Maximum Focus Areas Selected',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'preferences', step: 3, totalSteps: 4 },
          answers: {
            focus_areas: [
              '🧘 Gestione stress',
              '⚡ Energia e vitalità',
              '😴 Qualità del sonno',
              '🎯 Focus e concentrazione',
              '🏃 Attività fisica',
            ],
          },
        }),
      },
    ],
  },
};

// Completion flow
export const CompletedOnboarding: Story = {
  name: 'Completed Onboarding',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'POST',
        status: 200,
        response: createMockUserInitialization({
          isCompleted: true,
          result: {
            user_id: 'user123',
            profile_created: true,
            initial_life_score: 6.5,
          },
          getCompletionPercentage: () => 100,
        }),
      },
    ],
  },
};

// Different chronotypes showcase
export const EarlyBirdProfile: Story = {
  name: 'Early Bird Chronotype',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'profile', step: 1, totalSteps: 4 },
          answers: {
            chronotype: 'early_bird',
            sensitivity_level: 'gentle',
            preferred_tone: 'professional',
          },
        }),
      },
    ],
  },
};

export const NightOwlProfile: Story = {
  name: 'Night Owl Chronotype',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'profile', step: 1, totalSteps: 4 },
          answers: {
            chronotype: 'night_owl',
            sensitivity_level: 'enthusiastic',
            preferred_tone: 'casual',
          },
        }),
      },
    ],
  },
};

// Different assessment levels
export const HighStressAssessment: Story = {
  name: 'High Stress Assessment',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'assessment', step: 2, totalSteps: 4 },
          answers: {
            current_stress_level: 9,
            current_energy_level: 2,
            current_sleep_quality: 3,
          },
        }),
      },
    ],
  },
};

export const OptimalLevelsAssessment: Story = {
  name: 'Optimal Levels Assessment',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'assessment', step: 2, totalSteps: 4 },
          answers: {
            current_stress_level: 3,
            current_energy_level: 8,
            current_sleep_quality: 8,
          },
        }),
      },
    ],
  },
};

// Different time availability scenarios
export const LowTimeAvailability: Story = {
  name: 'Low Time Availability',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'goals', step: 4, totalSteps: 4 },
          answers: {
            time_availability: 'low',
            main_goals: ['Ridurre lo stress'],
          },
        }),
      },
    ],
  },
};

export const HighTimeAvailability: Story = {
  name: 'High Time Availability',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'goals', step: 4, totalSteps: 4 },
          answers: {
            time_availability: 'high',
            main_goals: [
              'Ridurre lo stress',
              'Migliorare il sonno',
              'Aumentare l\'energia',
              'Essere più produttivo',
            ],
          },
        }),
      },
    ],
  },
};

// Mobile responsive showcase
export const TabletView: Story = {
  name: 'Tablet View',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    mockData: [
      {
        url: '/api/user/initialization',
        method: 'GET',
        status: 200,
        response: createMockUserInitialization({
          progress: { currentSection: 'preferences', step: 3, totalSteps: 4 },
          answers: {
            focus_areas: ['🧘 Gestione stress', '⚡ Energia e vitalità'],
          },
        }),
      },
    ],
  },
};
