import useVoiceCommand from '../hooks/useVoiceCommand';

const VoiceAssistant = ({ onCommand }) => {
  const { isListening, transcript, supported, startListening, stopListening } =
    useVoiceCommand(onCommand);

  if (!supported) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-200 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 voice-active'
            : 'bg-green-500 hover:bg-green-600'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice command'}
        aria-label={isListening ? 'Stop listening' : 'Activate voice assistant'}
      >
        {isListening ? '🛑' : '🎤'}
      </button>

      {isListening && (
        <div className="flex items-center gap-2 text-green-400 text-sm animate-pulse">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Listening...
        </div>
      )}

      {transcript && !isListening && (
        <p className="text-slate-400 text-xs text-center max-w-xs">
          &ldquo;{transcript}&rdquo;
        </p>
      )}

      <div className="text-center text-xs text-slate-500 max-w-xs">
        Try: &quot;Find low crowd pump&quot; or &quot;Best time to visit&quot;
      </div>
    </div>
  );
};

export default VoiceAssistant;
