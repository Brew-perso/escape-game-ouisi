import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Mic, ArrowRight, CheckCircle2, Flame } from 'lucide-react';
import type { CourseSession } from '../../types';
import { sounds } from '../../utils/audio';
import { createSpeechRecognizer, matchesTargetWords, requestMicPermission } from '../../utils/speech';
import { VoiceMeter } from '../VoiceMeter';

interface Stage1Props {
  course: CourseSession;
  onComplete: (digit: string, points: number) => void;
}

export const Stage1Yet: React.FC<Stage1Props> = ({ course, onComplete }) => {
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechRecognizer, setSpeechRecognizer] = useState<{ start: () => void; stop: () => void } | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [selectedMindsetOption, setSelectedMindsetOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const sentences = course.yetSentences;
  const currentSentence = sentences[activeSentenceIndex];
  const allSentencesDone = completedSentences.length === sentences.length;

  useEffect(() => {
    // Setup speech recognition
    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setSpeechFeedback(`🎙️ Entendu : "${transcript}"`);
        if (matchesTargetWords(transcript, ['yet', 'pas encore'])) {
          handleSuccessYet();
        }
      },
      (userFriendlyMsg, rawError) => {
        console.warn('Speech error:', rawError);
        setSpeechFeedback(userFriendlyMsg);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      'en-US'
    );
    setSpeechRecognizer(recognizer);

    return () => {
      if (recognizer) recognizer.stop();
    };
  }, [activeSentenceIndex]);

  const toggleMic = async () => {
    if (!speechRecognizer) {
      setSpeechFeedback("Reconnaissance vocale non disponible sur ce navigateur. Tu peux taper 'YET' ci-dessous !");
      return;
    }
    if (isListening) {
      speechRecognizer.stop();
      setIsListening(false);
    } else {
      setSpeechFeedback('Écoute active... Crie ou dis distinctement "YET !"');
      setIsListening(true);

      const hasPerm = await requestMicPermission();
      if (!hasPerm) {
        setSpeechFeedback("Microphone refusé : autorise l'accès au micro dans ton navigateur.");
        setIsListening(false);
        return;
      }

      speechRecognizer.start();
    }
  };

  const handleSuccessYet = () => {
    sounds.playSuccess();
    if (speechRecognizer && isListening) {
      speechRecognizer.stop();
      setIsListening(false);
    }

    if (!completedSentences.includes(currentSentence.id)) {
      setCompletedSentences((prev) => [...prev, currentSentence.id]);
    }

    // Play text-to-speech for the transformed sentence
    sounds.speakEnglish(currentSentence.correctedSentence);

    // Advance to next sentence
    if (activeSentenceIndex < sentences.length - 1) {
      setTimeout(() => {
        setActiveSentenceIndex((prev) => prev + 1);
        setTypedInput('');
        setSpeechFeedback(null);
      }, 1200);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim().toUpperCase() === 'YET') {
      handleSuccessYet();
    } else {
      sounds.playGentleError();
      setSpeechFeedback('Indice : tape le mot magique "YET" (en majuscules ou minuscules)');
    }
  };

  const handleMindsetAnswer = (optionIdx: number) => {
    setSelectedMindsetOption(optionIdx);
    setShowExplanation(true);
    if (optionIdx === 1) {
      sounds.playSuccess();
      setQuestionAnswered(true);
    } else {
      sounds.playGentleError();
    }
  };

  const handleFinishStage = () => {
    const digit1 = course.vaultCode[0];
    onComplete(digit1, 250);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Stage Header */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Épreuve 1/4
              </span>
              <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5" /> +250 pts
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Le Bouclier Mental & The Power of YET</h2>
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          Pour désactiver le premier verrou du coffre, nous devons neutraliser 3 pensées défaitistes
          avec l'antidote de Carol Dweck : le mot magique <strong>"YET"</strong> !
        </p>
      </div>

      {/* Progress of sentences */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Boucliers activés ({completedSentences.length}/{sentences.length})
        </span>
        <div className="flex gap-2">
          {sentences.map((s, idx) => (
            <div
              key={s.id}
              className={`w-8 h-2 rounded-full transition-all duration-300 ${
                completedSentences.includes(s.id)
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50'
                  : idx === activeSentenceIndex
                  ? 'bg-indigo-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main interactive challenge card */}
      {!allSentencesDone ? (
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl relative space-y-5">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-rose-400 font-bold flex items-center justify-center gap-1.5">
              <span>Pensée à neutraliser #{activeSentenceIndex + 1}</span>
            </span>
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-100 font-medium text-lg italic shadow-inner">
              "{currentSentence.toxicSentence}"
            </div>
          </div>

          {/* Voice and Text options */}
          <div className="space-y-4">
            <p className="text-xs text-center text-indigo-300 font-medium">
              Crie ou dis <strong className="text-white bg-indigo-600 px-2 py-0.5 rounded">YET !</strong> dans ton micro, ou tape-le :
            </p>

            {/* Microphone Button */}
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 shadow-xl ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-400/50 animate-pulse text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                }`}
              >
                <Mic className="w-8 h-8" />
                <span className="text-[10px] font-bold uppercase">{isListening ? 'Stop' : 'Micro'}</span>
              </button>

              {isListening && (
                <VoiceMeter
                  isListening={isListening}
                  onVoiceDetected={handleSuccessYet}
                  targetWordDisplay="YET !"
                />
              )}

              {speechFeedback && (
                <div className="text-xs text-center font-medium text-indigo-300 bg-slate-950/90 px-4 py-2 rounded-xl border border-indigo-500/40 max-w-sm mx-auto shadow-md">
                  {speechFeedback}
                </div>
              )}

              {/* Direct voice validation button for students in case speech recognition has noise */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  handleSuccessYet();
                }}
                className="w-full max-w-xs mx-auto py-2.5 px-4 bg-emerald-600/90 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl border border-emerald-400/40 shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>J'ai dit "YET" à voix haute ! (Valider)</span>
              </button>
            </div>

            {/* Quick Click & Manual Input Fallback */}
            <div className="pt-2 border-t border-slate-800 space-y-3">

              <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Tape YET ici..."
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-center uppercase tracking-widest text-white placeholder:text-slate-600 font-bold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs transition"
                >
                  OK
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Sentences completed -> Growth Mindset Quiz from Slides */
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">3 Boucliers "YET" activés !</h3>
            <p className="text-xs text-slate-300">
              Dernière confirmation : Pourquoi Carol Dweck et tes profs insistent tant là-dessus ?
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-indigo-200">
              Que se passe-t-il dans ton cerveau quand tu luttes sur un mot difficile ou une prononciation ?
            </p>

            <button
              onClick={() => handleMindsetAnswer(0)}
              className={`w-full p-3.5 text-left rounded-xl text-sm font-medium transition border ${
                selectedMindsetOption === 0
                  ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              A. Rien, c'est juste que les francophones ne sont pas doués pour l'anglais.
            </button>

            <button
              onClick={() => handleMindsetAnswer(1)}
              className={`w-full p-3.5 text-left rounded-xl text-sm font-medium transition border ${
                selectedMindsetOption === 1
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                  : 'bg-slate-950/60 border-slate-800 hover:border-emerald-600 text-slate-300'
              }`}
            >
              B. ✨ L'effort crée de nouvelles connexions neuronales solides : le cerveau muscle son réseau et apprend !
            </button>

            <button
              onClick={() => handleMindsetAnswer(2)}
              className={`w-full p-3.5 text-left rounded-xl text-sm font-medium transition border ${
                selectedMindsetOption === 2
                  ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              C. Il faut tout de suite abandonner pour ne pas perdre de temps.
            </button>
          </div>

          {showExplanation && (
            <div
              className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                selectedMindsetOption === 1
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              {selectedMindsetOption === 1 ? (
                <div>
                  <strong>Exactement ! (Slide 7 du cours) :</strong> "Struggling when something is difficult makes your brain grow. Mistakes are not signs of failure; they are signs that you are trying and learning."
                </div>
              ) : (
                <div>
                  <strong>Pas tout à fait !</strong> Repense à la vidéo de Carol Dweck : l'effort et la difficulté sont le moteur biologique de la croissance de ton cerveau. Clique sur la réponse B !
                </div>
              )}
            </div>
          )}

          {questionAnswered && (
            <div className="pt-2">
              <button
                onClick={handleFinishStage}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition"
              >
                <span>Débloquer le Chiffre n°1 du Coffre</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
