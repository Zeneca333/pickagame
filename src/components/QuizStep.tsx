interface QuizOption {
  value: string;
  label: string;
}

interface QuizStepProps {
  stepNumber: string;
  question: string;
  options: QuizOption[];
  onSelect: (value: string) => void;
  showTextInput?: boolean;
  textPlaceholder?: string;
  onTextSubmit?: (value: string) => void;
}

export default function QuizStep({
  stepNumber, question, options, onSelect,
  showTextInput, textPlaceholder, onTextSubmit,
}: QuizStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <p className="font-mono text-xs tracking-[3px] text-gray-500 mb-2">{stepNumber}</p>
      <h2 className="font-mono text-2xl font-bold mb-8">{question}</h2>
      <div className="flex flex-col gap-3 max-w-md w-full">
        {options.map((opt) => (
          <button key={opt.value} onClick={() => onSelect(opt.value)}
            className="p-4 border border-white/15 rounded-md text-left font-mono text-sm hover:border-accent hover:bg-accent/5 transition-all cursor-pointer">
            {opt.label}
          </button>
        ))}
      </div>
      {showTextInput && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("favorites") as HTMLInputElement;
          onTextSubmit?.(input.value);
        }} className="mt-6 max-w-md w-full">
          <input name="favorites" type="text" placeholder={textPlaceholder}
            className="w-full p-4 bg-transparent border border-white/15 rounded-md font-mono text-sm focus:border-accent focus:outline-none" />
          <div className="flex gap-3 mt-3">
            <button type="submit"
              className="flex-1 p-3 bg-accent text-black font-mono font-bold text-sm rounded hover:brightness-110 transition-all">
              NEXT →
            </button>
            <button type="button" onClick={() => onTextSubmit?.("")}
              className="p-3 border border-white/15 font-mono text-sm rounded text-gray-400 hover:border-accent transition-all">
              SKIP
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
