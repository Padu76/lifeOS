'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle, Clock } from 'lucide-react';

interface StretchExercise {
  id: number;
  name: string;
  description: string;
  duration: number;
  instructions: string[];
  targetMuscles: string[];
  difficulty: 'Facile' | 'Medio' | 'Avanzato';
  illustration: string;
}

const stretchingExercises: StretchExercise[] = [
  {
    id: 1,
    name: "Stretching del collo",
    description: "Rilassa i muscoli del collo e delle spalle",
    duration: 30,
    instructions: [
      "Siediti o stai in piedi con la schiena dritta",
      "Inclina lentamente la testa verso destra",
      "Mantieni la posizione per 15 secondi",
      "Ripeti sul lato sinistro"
    ],
    targetMuscles: ["Collo", "Trapezio"],
    difficulty: 'Facile',
    illustration: "🔄"
  },
  {
    id: 2,
    name: "Stretching delle spalle",
    description: "Allunga e rilassa le spalle tese",
    duration: 45,
    instructions: [
      "Porta il braccio destro attraverso il petto",
      "Con la mano sinistra, tira delicatamente il gomito",
      "Mantieni per 20 secondi",
      "Ripeti con l'altro braccio"
    ],
    targetMuscles: ["Deltoidi", "Trapezio"],
    difficulty: 'Facile',
    illustration: "🤗"
  },
  {
    id: 3,
    name: "Stretching della schiena",
    description: "Decomprime la colonna vertebrale",
    duration: 60,
    instructions: [
      "Siediti su una sedia con i piedi a terra",
      "Inclina lentamente il busto in avanti",
      "Lascia che le braccia pendano naturalmente",
      "Respira profondamente e rilassati"
    ],
    targetMuscles: ["Colonna vertebrale", "Lombari"],
    difficulty: 'Medio',
    illustration: "🧘‍♂️"
  },
  {
    id: 4,
    name: "Stretching dei polsi",
    description: "Allevia la tensione da computer e scrittura",
    duration: 30,
    instructions: [
      "Estendi il braccio destro davanti a te",
      "Con la mano sinistra, piega delicatamente il polso verso il basso",
      "Mantieni per 15 secondi",
      "Ripeti nella direzione opposta e cambia braccio"
    ],
    targetMuscles: ["Polsi", "Avambracci"],
    difficulty: 'Facile',
    illustration: "✋"
  },
  {
    id: 5,
    name: "Stretching delle gambe",
    description: "Rilassa muscoli delle gambe e migliora circolazione",
    duration: 45,
    instructions: [
      "Stai in piedi, appoggiati a una parete",
      "Porta una gamba indietro tenendo il tallone a terra",
      "Spingi delicatamente il bacino in avanti",
      "Ripeti con l'altra gamba"
    ],
    targetMuscles: ["Polpacci", "Tendini"],
    difficulty: 'Medio',
    illustration: "🦵"
  }
];

export const StretchingSequence: React.FC = () => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeLeft, setTimeLeft] = useState(stretchingExercises[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleExerciseComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleExerciseComplete = () => {
    setIsActive(false);
    setCompletedExercises(prev => [...prev, currentExercise]);
    
    if (currentExercise < stretchingExercises.length - 1) {
      // Passa al prossimo esercizio
      setTimeout(() => {
        setCurrentExercise(prev => prev + 1);
        setTimeLeft(stretchingExercises[currentExercise + 1].duration);
        setShowInstructions(true);
      }, 2000);
    } else {
      // Sequenza completata
      setTimeout(() => {
        setIsCompleted(true);
      }, 2000);
    }
  };

  const startTimer = () => {
    setIsActive(true);
    setShowInstructions(false);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const skipExercise = () => {
    handleExerciseComplete();
  };

  const resetSequence = () => {
    setCurrentExercise(0);
    setTimeLeft(stretchingExercises[0].duration);
    setIsActive(false);
    setIsCompleted(false);
    setCompletedExercises([]);
    setShowInstructions(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = stretchingExercises.reduce((sum, ex) => sum + ex.duration, 0);
  const progress = ((currentExercise + (stretchingExercises[currentExercise].duration - timeLeft) / stretchingExercises[currentExercise].duration) / stretchingExercises.length) * 100;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Stretching Completato!</h1>
          <p className="text-xl text-white/70 mb-8">
            Hai completato tutti i {stretchingExercises.length} esercizi di stretching. I tuoi muscoli sono ora più rilassati e flessibili.
          </p>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Benefici ottenuti</h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/80">
              <div className="text-left space-y-2">
                <p>✓ Muscoli più rilassati</p>
                <p>✓ Miglioramento della postura</p>
                <p>✓ Riduzione delle tensioni</p>
              </div>
              <div className="text-left space-y-2">
                <p>✓ Maggiore flessibilità</p>
                <p>✓ Miglior circolazione</p>
                <p>✓ Sensazione di benessere</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetSequence}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
            >
              Ripeti Stretching
            </button>
            
            <a
              href="/suggestions"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
            >
              Altre Suggestions
            </a>
            
            <a
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const exercise = stretchingExercises[currentExercise];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-green-900 to-teal-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header con progresso */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{exercise.illustration}</div>
          <h1 className="text-3xl font-bold text-white mb-2">Sequenza Stretching</h1>
          <p className="text-white/70 mb-4">
            Esercizio {currentExercise + 1} di {stretchingExercises.length}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-white/60 text-sm">
            Tempo totale rimanente: {formatTime(stretchingExercises.slice(currentExercise).reduce((sum, ex, index) => 
              index === 0 ? sum + timeLeft : sum + ex.duration, 0
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pannello esercizio */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                exercise.difficulty === 'Facile' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                exercise.difficulty === 'Medio' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                'bg-red-500/20 text-red-300 border border-red-400/30'
              }`}>
                {exercise.difficulty}
              </span>
            </div>

            <p className="text-white/80 mb-6">{exercise.description}</p>

            {/* Muscoli target */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Muscoli coinvolti:</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map(muscle => (
                  <span key={muscle} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-400/30">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white mb-2">{formatTime(timeLeft)}</div>
              <div className="text-white/60">
                {isActive ? 'In corso...' : showInstructions ? 'Pronto per iniziare' : 'In pausa'}
              </div>
            </div>

            {/* Controlli */}
            <div className="flex justify-center gap-4">
              {showInstructions ? (
                <button
                  onClick={startTimer}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Inizia Esercizio
                </button>
              ) : (
                <>
                  <button
                    onClick={isActive ? pauseTimer : startTimer}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all border border-white/20"
                  >
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={skipExercise}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all border border-white/20"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={resetSequence}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all border border-white/20"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Pannello istruzioni */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Istruzioni passo-passo</h3>
            
            <div className="space-y-4">
              {exercise.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-white/80 leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>

            {/* Consigli */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <h4 className="text-blue-200 font-medium mb-2">Consigli importanti:</h4>
              <ul className="text-blue-100/80 text-sm space-y-1">
                <li>• Non forzare mai i movimenti</li>
                <li>• Respira lentamente e profondamente</li>
                <li>• Fermati se senti dolore</li>
                <li>• Mantieni le posizioni senza rimbalzare</li>
              </ul>
            </div>

            {/* Prossimo esercizio */}
            {currentExercise < stretchingExercises.length - 1 && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Prossimo esercizio:</h4>
                <p className="text-white/70 text-sm">
                  {stretchingExercises[currentExercise + 1].name} - {stretchingExercises[currentExercise + 1].duration}s
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lista esercizi completati */}
        {completedExercises.length > 0 && (
          <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Esercizi completati:</h3>
            <div className="flex flex-wrap gap-2">
              {completedExercises.map(index => (
                <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-400/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {stretchingExercises[index].name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
