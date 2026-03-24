import { useState, useCallback, useRef } from 'react';
import { VOICE_COMMANDS } from '../utils/constants';

const useVoiceCommand = (onCommand) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(
    typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
  );
  const recognitionRef = useRef(null);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = 'en-IN';
    synth.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    if (!supported || isListening) return;

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setTranscript(text);

      const matched = VOICE_COMMANDS.find((cmd) => text.includes(cmd.phrase));
      if (matched) {
        onCommand?.(matched.action, text);
      } else {
        speak("Sorry, I didn't understand that command. Try saying 'find low crowd pump' or 'best pump'.");
      }
    };

    recognition.start();
  }, [supported, isListening, onCommand, speak]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, supported, startListening, stopListening, speak };
};

export default useVoiceCommand;
