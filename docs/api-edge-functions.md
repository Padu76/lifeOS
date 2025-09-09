# LifeOS Edge Functions API Documentation

Documentazione completa delle Edge Functions di LifeOS per integrazione con Supabase.

## Panoramica

Le Edge Functions di LifeOS gestiscono la logica AI-powered per micro-consigli, analytics e gestione utenti. Tutte le functions richiedono autenticazione Bearer token.

**Base URL:** `https://your-project.supabase.co/functions/v1/`

**Headers richiesti:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1. generate-micro-advice

Genera micro-consigli personalizzati basati su metriche di salute e LifeScore.

### Endpoint
```
POST /generate-micro-advice
```

### Input Parameters

```typescript
{
  current_metrics: HealthMetrics;      // Metriche salute attuali
  current_life_score: LifeScoreV2;    // Score vita corrente
  force_immediate?: boolean;           // Forza generazione immediata
  preferred_category?: string;         // Categoria preferita
}
```

#### HealthMetrics Interface
```typescript
{
  timestamp: string;                   // ISO timestamp
  stress_level?: number;               // 1-10
  energy_level?: number;               // 1-10  
  sleep_quality?: number;              // 1-10
  mood?: string;                       // es. "good", "tired", "stressed"
  heart_rate?: number;                 // BPM
  steps?: number;                      // Passi giornalieri
}
```

#### LifeScoreV2 Interface
```typescript
{
  stress: number;                      // 1-10
  energy: number;                      // 1-10
  sleep: number;                       // 1-10
  overall: number;                     // 1-10
}
```

### Response

```typescript
{
  success: boolean;
  data?: {
    session_id: string;
    advice: {
      content: string;                 // Testo del consiglio
      tone: string;                    // Tono del messaggio
      template_id: string;             // ID template usato
      personalization_score: number;   // 0-1
      predicted_effectiveness: number; // 0-1
    };
    timing: {
      suggested_time: string;          // ISO timestamp
      confidence_score: number;        // 0-1
      urgency_level: string;           // "low" | "medium" | "high" | "emergency"
      reasoning: string;               // Spiegazione timing
    };
    gamification: {
      streaks: any[];                  // Streak aggiornati
      new_achievements: any[];         // Nuovi achievement
      celebration?: any;               // Celebrazione se applicabile
    };
    notification: {
      scheduled: boolean;
      scheduled_time?: string;         // ISO timestamp
      notification_id?: string;
    };
    next_advice_eta?: string;          // Prossimo consiglio ETA
  };
  message?: string;                    // Se no intervention needed
  next_check_eta?: string;             // Prossimo check ETA
  error?: string;
}
```

### Esempi

#### Richiesta Standard
```json
{
  "current_metrics": {
    "timestamp": "2025-01-15T14:30:00Z",
    "stress_level": 7,
    "energy_level": 4,
    "sleep_quality": 6,
    "mood": "stressed"
  },
  "current_life_score": {
    "stress": 7,
    "energy": 4,
    "sleep": 6,
    "overall": 5
  }
}
```

#### Risposta di Successo
```json
{
  "success": true,
  "data": {
    "session_id": "uuid-123",
    "advice": {
      "content": "Ehi, vedo che lo stress è un po' alto oggi. Che ne dici di 3 respiri profondi? Sei più forte di quanto pensi 💙",
      "tone": "warm",
      "template_id": "stress_relief_0",
      "personalization_score": 0.8,
      "predicted_effectiveness": 0.75
    },
    "timing": {
      "suggested_time": "2025-01-15T14:30:00Z",
      "confidence_score": 0.95,
      "urgency_level": "high",
      "reasoning": "High stress levels detected"
    }
  }
}
```

---

## 2. handle-advice-response

Gestisce le risposte dell'utente ai micro-consigli (completato, rimandato, rifiutato).

### Endpoint
```
POST /handle-advice-response
```

### Input Parameters

```typescript
{
  session_id: string;                  // ID sessione consiglio
  response_type: "completed" | "dismissed" | "snoozed";
  completion_rating?: number;          // 1-5 (solo per completed)
  user_feedback?: string;              // Feedback testuale
  actual_duration_minutes?: number;    // Durata reale (solo per completed)
  snooze_duration_minutes?: number;    // Durata snooze (solo per snoozed)
}
```

### Response

```typescript
{
  success: boolean;
  data?: {
    next_advice?: MicroAdvice;         // Prossimo consiglio se disponibile
    streak_updated?: boolean;          // Streak aggiornato
    achievement_earned?: any;          // Achievement guadagnato
  };
  error?: string;
}
```

### Esempi

#### Completamento con Rating
```json
{
  "session_id": "uuid-123",
  "response_type": "completed",
  "completion_rating": 4,
  "actual_duration_minutes": 3,
  "user_feedback": "Mi ha aiutato molto"
}
```

---

## 3. get-wellness-dashboard

Recupera tutti i dati per la dashboard wellness dell'utente.

### Endpoint
```
GET /get-wellness-dashboard?days=7
```

### Query Parameters
- `days` (optional): Numero giorni di dati (default: 7)
- `include_trends` (optional): Include analisi trend (default: true)

### Response

```typescript
{
  success: boolean;
  data?: {
    current_life_score: LifeScoreV2;
    recent_metrics: HealthMetrics[];
    active_streaks: Streak[];
    recent_achievements: Achievement[];
    wellness_trends: {
      stress_trend: TrendData;
      energy_trend: TrendData;
      sleep_trend: TrendData;
    };
    quick_stats: {
      avg_daily_score: number;
      best_category: string;
      improvement_areas: string[];
    };
  };
  error?: string;
}
```

---

## 4. update-user-preferences

Aggiorna le preferenze utente per personalizzazione.

### Endpoint
```
PUT /update-user-preferences
```

### Input Parameters

```typescript
{
  intervention_frequency?: "minimal" | "balanced" | "frequent";
  preferred_tone?: "warm" | "direct" | "encouraging";
  notification_settings?: {
    enabled: boolean;
    quiet_hours_start?: string;     // HH:mm
    quiet_hours_end?: string;       // HH:mm
    days_of_week?: number[];        // 0-6 (domenica=0)
  };
  focus_areas?: ("stress" | "energy" | "sleep" | "mindfulness")[];
  chronotype?: "morning" | "evening" | "flexible";
  difficulty_preference?: "easy" | "moderate" | "challenging";
}
```

### Response

```typescript
{
  success: boolean;
  data?: {
    preferences_updated: boolean;
    recalibration_needed: boolean;  // Se serve ricalibrazione AI
  };
  error?: string;
}
```

---

## 5. get-system-analytics

Fornisce analytics di sistema per amministratori e insights utente.

### Endpoint
```
GET /get-system-analytics?scope=user&timeframe=week
```

### Query Parameters
- `scope`: "user" | "system" (default: "user")
- `timeframe`: "day" | "week" | "month" (default: "week")

### Response

```typescript
{
  success: boolean;
  data?: {
    user_analytics?: {
      total_sessions: number;
      completion_rate: number;
      avg_rating: number;
      most_effective_category: string;
      streak_data: StreakAnalytics;
    };
    system_analytics?: {
      total_users: number;
      avg_engagement: number;
      top_performing_advice: AdvicePerformance[];
    };
  };
  error?: string;
}
```

---

## 6. initialize-user-profile

Inizializza il profilo wellness per nuovi utenti.

### Endpoint
```
POST /initialize-user-profile
```

### Input Parameters

```typescript
{
  initial_assessment: {
    stress_level: number;            // 1-10
    energy_level: number;            // 1-10
    sleep_quality: number;           // 1-10
    activity_level: number;          // 1-10
  };
  goals?: ("reduce_stress" | "increase_energy" | "better_sleep" | "mindfulness")[];
  chronotype?: "morning" | "evening" | "flexible";
  experience_level?: "beginner" | "intermediate" | "advanced";
}
```

### Response

```typescript
{
  success: boolean;
  data?: {
    profile_created: boolean;
    initial_life_score: LifeScoreV2;
    recommended_settings: UserPreferences;
    welcome_advice?: MicroAdvice;
  };
  error?: string;
}
```

---

## 7. daily-rollup

Elabora dati giornalieri e calcola metriche aggregate (tipicamente chiamata via cron).

### Endpoint
```
POST /daily-rollup
```

### Input Parameters

```typescript
{
  date?: string;                     // YYYY-MM-DD (default: oggi)
  user_id?: string;                  // Specifico utente (admin only)
}
```

### Response

```typescript
{
  success: boolean;
  data?: {
    users_processed: number;
    life_scores_calculated: number;
    trends_updated: number;
    notifications_scheduled: number;
  };
  error?: string;
}
```

---

## 8. send-weekly-report

Genera e invia report settimanali via email.

### Endpoint
```
POST /send-weekly-report
```

### Input Parameters

```typescript
{
  week_start?: string;               // YYYY-MM-DD (default: questa settimana)
  user_id?: string;                  // Specifico utente (default: tutti)
}
```

### Response

```typescript
{
  success: boolean;
  data?: {
    reports_sent: number;
    avg_weekly_score: number;
    top_improvements: string[];
    email_delivery_status: "sent" | "queued" | "failed";
  };
  error?: string;
}
```

---

## 9. verify-receipts

Verifica receipt di acquisti in-app per premium features.

### Endpoint
```
POST /verify-receipts
```

### Input Parameters

```typescript
{
  receipt_data: string;              // Base64 receipt data
  platform: "ios" | "android" | "web";
  product_id: string;
}
```

### Response

```typescript
{
  success: boolean;
  data?: {
    verification_status: "valid" | "invalid" | "expired";
    subscription_details?: {
      product_id: string;
      expires_date: string;
      auto_renewable: boolean;
    };
    features_unlocked?: string[];
  };
  error?: string;
}
```

---

## Error Handling

Tutte le functions restituiscono errori in formato standardizzato:

```typescript
{
  success: false,
  error: string,                     // Messaggio errore
  error_code?: string,               // Codice errore specifico
  details?: any                      // Dettagli aggiuntivi per debug
}
```

### Codici di Errore Comuni

- `UNAUTHORIZED`: Token di autenticazione mancante o invalido
- `VALIDATION_ERROR`: Parametri input non validi
- `RATE_LIMITED`: Troppo richieste (implementazione futura)
- `USER_NOT_FOUND`: Utente non esistente
- `INSUFFICIENT_DATA`: Dati insufficienti per operazione
- `INTERNAL_ERROR`: Errore interno del server

---

## Rate Limiting

Attualmente non implementato, ma pianificato:
- 100 richieste/ora per utente su generate-micro-advice
- 500 richieste/ora per altre endpoint
- Rate limit più elevati per utenti premium

---

## Testing

Per testare le functions in sviluppo:

```bash
# Setup locale Supabase
supabase functions serve

# Test con curl
curl -X POST "http://localhost:54321/functions/v1/generate-micro-advice" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"current_metrics": {...}, "current_life_score": {...}}'
```

Per testing automatizzato, utilizzare i file nella cartella `supabase/tests/` (da implementare).
