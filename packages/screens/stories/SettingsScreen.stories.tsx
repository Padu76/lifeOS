import type { Meta, StoryObj } from '@storybook/react';
import { SettingsScreen } from '../SettingsScreen';

const meta = {
  title: 'Screens/SettingsScreen',
  component: SettingsScreen,
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
} satisfies Meta<typeof SettingsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock navigation object
const mockNavigation = {
  navigate: (screen: string) => console.log(`Navigate to: ${screen}`),
  goBack: () => console.log('Go back'),
  replace: (screen: string) => console.log(`Replace with: ${screen}`),
};

// Mock user preferences hook with different states
const createMockUserPreferences = (overrides = {}) => ({
  preferences: {
    chronotype: 'early_bird',
    sensitivity_level: 'moderate',
    preferred_tone: 'friendly',
    focus_areas: ['Gestione stress', 'Energia e vitalità', 'Qualità del sonno'],
    quiet_hours: {
      enabled: true,
      start_time: '22:00',
      end_time: '07:00',
    },
    notification_settings: {
      push_enabled: true,
      advice_notifications: true,
      achievement_notifications: true,
      weekly_report_notifications: true,
      reminder_notifications: false,
    },
    max_daily_interventions: 5,
    min_intervention_gap_minutes: 90,
    ...overrides.preferences,
  },
  loading: false,
  error: null,
  updateChronotype: (type: string) => console.log('Update chronotype:', type),
  updateSensitivityLevel: (level: string) => console.log('Update sensitivity:', level),
  updateTonePreference: (tone: string) => console.log('Update tone:', tone),
  updateFocusAreas: (areas: string[]) => console.log('Update focus areas:', areas),
  updateQuietHours: (hours: any) => console.log('Update quiet hours:', hours),
  toggleQuietHours: () => console.log('Toggle quiet hours'),
  toggleNotification: (type: string) => console.log('Toggle notification:', type),
  updateInterventionLimits: (max?: number, gap?: number) => 
    console.log('Update intervention limits:', { max, gap }),
  hasPendingChanges: () => false,
  getTimeSinceLastSave: () => 'salvato',
  ...overrides,
});

// Default state
export const Default: Story = {
  name: 'Default Settings',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences(),
      },
    ],
  },
};

// Different chronotypes
export const EarlyBirdChronotype: Story = {
  name: 'Early Bird Profile',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            chronotype: 'early_bird',
            sensitivity_level: 'gentle',
            preferred_tone: 'professional',
          },
        }),
      },
    ],
  },
};

export const NightOwlChronotype: Story = {
  name: 'Night Owl Profile',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            chronotype: 'night_owl',
            sensitivity_level: 'enthusiastic',
            preferred_tone: 'casual',
            quiet_hours: {
              enabled: true,
              start_time: '02:00',
              end_time: '10:00',
            },
          },
        }),
      },
    ],
  },
};

export const IntermediateChronotype: Story = {
  name: 'Intermediate Profile',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            chronotype: 'intermediate',
            sensitivity_level: 'moderate',
            preferred_tone: 'motivational',
          },
        }),
      },
    ],
  },
};

// Different sensitivity levels
export const GentleSensitivity: Story = {
  name: 'Gentle Sensitivity',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            sensitivity_level: 'gentle',
            max_daily_interventions: 2,
            min_intervention_gap_minutes: 180,
          },
        }),
      },
    ],
  },
};

export const EnthusiasticSensitivity: Story = {
  name: 'Enthusiastic Sensitivity',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            sensitivity_level: 'enthusiastic',
            max_daily_interventions: 8,
            min_intervention_gap_minutes: 30,
          },
        }),
      },
    ],
  },
};

// Focus areas variations
export const MinimalFocusAreas: Story = {
  name: 'Minimal Focus Areas',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            focus_areas: ['Gestione stress'],
          },
        }),
      },
    ],
  },
};

export const ExtensiveFocusAreas: Story = {
  name: 'Extensive Focus Areas',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            focus_areas: [
              'Gestione stress',
              'Energia e vitalità',
              'Qualità del sonno',
              'Focus e concentrazione',
              'Attività fisica',
              'Alimentazione',
              'Relazioni sociali',
              'Mindfulness',
              'Produttività',
              'Recovery e riposo',
            ],
          },
        }),
      },
    ],
  },
};

export const NoFocusAreas: Story = {
  name: 'No Focus Areas',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            focus_areas: [],
          },
        }),
      },
    ],
  },
};

// Notification variations
export const AllNotificationsEnabled: Story = {
  name: 'All Notifications Enabled',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            notification_settings: {
              push_enabled: true,
              advice_notifications: true,
              achievement_notifications: true,
              weekly_report_notifications: true,
              reminder_notifications: true,
            },
          },
        }),
      },
    ],
  },
};

export const MinimalNotifications: Story = {
  name: 'Minimal Notifications',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            notification_settings: {
              push_enabled: true,
              advice_notifications: true,
              achievement_notifications: false,
              weekly_report_notifications: false,
              reminder_notifications: false,
            },
          },
        }),
      },
    ],
  },
};

export const NotificationsDisabled: Story = {
  name: 'All Notifications Disabled',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            notification_settings: {
              push_enabled: false,
              advice_notifications: false,
              achievement_notifications: false,
              weekly_report_notifications: false,
              reminder_notifications: false,
            },
          },
        }),
      },
    ],
  },
};

// Quiet hours variations
export const QuietHoursDisabled: Story = {
  name: 'Quiet Hours Disabled',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            quiet_hours: {
              enabled: false,
              start_time: '22:00',
              end_time: '07:00',
            },
          },
        }),
      },
    ],
  },
};

export const ExtendedQuietHours: Story = {
  name: 'Extended Quiet Hours',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            quiet_hours: {
              enabled: true,
              start_time: '20:00',
              end_time: '09:00',
            },
          },
        }),
      },
    ],
  },
};

export const ShortQuietHours: Story = {
  name: 'Short Quiet Hours',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            quiet_hours: {
              enabled: true,
              start_time: '23:30',
              end_time: '06:30',
            },
          },
        }),
      },
    ],
  },
};

// Intervention limits variations
export const LowInterventionLimits: Story = {
  name: 'Low Intervention Limits',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            max_daily_interventions: 1,
            min_intervention_gap_minutes: 240,
          },
        }),
      },
    ],
  },
};

export const HighInterventionLimits: Story = {
  name: 'High Intervention Limits',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            max_daily_interventions: 10,
            min_intervention_gap_minutes: 30,
          },
        }),
      },
    ],
  },
};

// Pending changes state
export const PendingChanges: Story = {
  name: 'Pending Changes',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          hasPendingChanges: () => true,
          getTimeSinceLastSave: () => '2 minuti fa',
        }),
      },
    ],
  },
};

export const RecentlySaved: Story = {
  name: 'Recently Saved',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          hasPendingChanges: () => false,
          getTimeSinceLastSave: () => 'appena salvato',
        }),
      },
    ],
  },
};

export const LongTimeSinceLastSave: Story = {
  name: 'Long Time Since Last Save',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          hasPendingChanges: () => true,
          getTimeSinceLastSave: () => '15 minuti fa',
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
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          loading: true,
          preferences: null,
        }),
      },
    ],
  },
};

export const LoadingWithData: Story = {
  name: 'Loading with Existing Data',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          loading: true,
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
        url: '/api/user/preferences',
        method: 'GET',
        status: 500,
        response: createMockUserPreferences({
          error: 'Impossibile caricare le preferenze',
          preferences: null,
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
        url: '/api/user/preferences',
        method: 'GET',
        status: 0,
        response: createMockUserPreferences({
          error: 'Errore di connessione. Verifica la tua connessione internet.',
          preferences: null,
        }),
      },
    ],
  },
};

export const ErrorWithFallbackData: Story = {
  name: 'Error with Fallback Data',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 500,
        response: createMockUserPreferences({
          error: 'Errore durante il salvataggio',
        }),
      },
    ],
  },
};

// Modal states
export const TimePickerModal: Story = {
  name: 'Time Picker Modal Open',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences(),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    // Simulate opening time picker modal
    const canvas = within(canvasElement);
    const startTimeButton = canvas.getByText('22:00');
    await userEvent.click(startTimeButton);
  },
};

export const FocusAreaModal: Story = {
  name: 'Focus Area Modal Open',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences(),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    // Simulate opening focus area modal
    const canvas = within(canvasElement);
    const addButton = canvas.getByText('+');
    await userEvent.click(addButton);
  },
};

// Different preference combinations
export const PowerUserProfile: Story = {
  name: 'Power User Profile',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            chronotype: 'early_bird',
            sensitivity_level: 'enthusiastic',
            preferred_tone: 'motivational',
            focus_areas: [
              'Gestione stress',
              'Energia e vitalità',
              'Qualità del sonno',
              'Focus e concentrazione',
              'Attività fisica',
              'Produttività',
            ],
            max_daily_interventions: 8,
            min_intervention_gap_minutes: 30,
            notification_settings: {
              push_enabled: true,
              advice_notifications: true,
              achievement_notifications: true,
              weekly_report_notifications: true,
              reminder_notifications: true,
            },
            quiet_hours: {
              enabled: true,
              start_time: '23:00',
              end_time: '05:00',
            },
          },
        }),
      },
    ],
  },
};

export const MinimalistProfile: Story = {
  name: 'Minimalist Profile',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            chronotype: 'intermediate',
            sensitivity_level: 'gentle',
            preferred_tone: 'professional',
            focus_areas: ['Gestione stress'],
            max_daily_interventions: 1,
            min_intervention_gap_minutes: 240,
            notification_settings: {
              push_enabled: true,
              advice_notifications: true,
              achievement_notifications: false,
              weekly_report_notifications: false,
              reminder_notifications: false,
            },
            quiet_hours: {
              enabled: true,
              start_time: '20:00',
              end_time: '09:00',
            },
          },
        }),
      },
    ],
  },
};

export const WorkFocusedProfile: Story = {
  name: 'Work-Focused Profile',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences({
          preferences: {
            chronotype: 'early_bird',
            sensitivity_level: 'moderate',
            preferred_tone: 'professional',
            focus_areas: [
              'Focus e concentrazione',
              'Produttività',
              'Gestione stress',
            ],
            max_daily_interventions: 4,
            min_intervention_gap_minutes: 120,
            notification_settings: {
              push_enabled: true,
              advice_notifications: true,
              achievement_notifications: true,
              weekly_report_notifications: true,
              reminder_notifications: true,
            },
            quiet_hours: {
              enabled: true,
              start_time: '18:00',
              end_time: '09:00',
            },
          },
        }),
      },
    ],
  },
};

// Responsive design
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
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences(),
      },
    ],
  },
};

export const DesktopView: Story = {
  name: 'Desktop View',
  args: {
    navigation: mockNavigation,
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    mockData: [
      {
        url: '/api/user/preferences',
        method: 'GET',
        status: 200,
        response: createMockUserPreferences(),
      },
    ],
  },
};
