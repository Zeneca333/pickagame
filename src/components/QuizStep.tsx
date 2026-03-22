interface QuizOption {
  value: string;
  label: string;
}

interface QuizStepProps {
  stepNumber: string;
  question: string;
  options: QuizOption[];
  onSelect: (value: string) => void;
  onBack: () => void;
  showTextInput?: boolean;
  textPlaceholder?: string;
  onTextSubmit?: (value: string) => void;
}

export default function QuizStep({
  stepNumber, question, options, onSelect, onBack,
  showTextInput, textPlaceholder, onTextSubmit,
}: QuizStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <button onClick={onBack} className="font-mono text-sm text-muted hover:text-accent transition-colors mb-4">
        &larr; back
      </button>
      <p className="font-mono text-sm tracking-[3px] text-muted mb-2">{stepNumber}</p>
      <h2 className="font-mono text-3xl font-bold mb-8 text-ink">{question}</h2>
      <div className="flex flex-col gap-3 max-w-lg w-full">
        {options.map((opt) => (
          <button key={opt.value} onClick={() => onSelect(opt.value)}
            className="p-5 border-2 border-ink/10 rounded-xl text-left font-mono text-base hover:border-accent hover:bg-accent-light transition-all cursor-pointer bg-bg-card shadow-sm">
            {opt.label}
          </button>
        ))}
      </div>
      {showTextInput && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("favorites") as HTMLInputElement;
          onTextSubmit?.(input.value);
        }} className="mt-6 max-w-lg w-full">
          <input name="favorites" type="text" placeholder={textPlaceholder}
            className="w-full p-5 bg-bg-card border-2 border-ink/10 rounded-xl font-mono text-base text-ink focus:border-accent focus:outline-none" />
          <div className="flex gap-3 mt-3">
            <button type="submit"
              className="flex-1 p-4 bg-accent text-white font-mono font-bold text-base rounded-lg hover:brightness-110 transition-all">
              NEXT &rarr;
            </button>
            <button type="button" onClick={() => onTextSubmit?.("")}
              className="p-4 border-2 border-ink/10 font-mono text-base rounded-lg text-muted hover:border-accent transition-all">
              SKIP
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
