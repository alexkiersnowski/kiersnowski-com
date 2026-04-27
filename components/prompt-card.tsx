export function PromptCard({ text, onClick }: { text: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border text-foreground hover:border-foreground/20 flex h-20 w-full cursor-pointer items-start rounded-2xl border bg-transparent p-5 text-left text-sm leading-5 transition-colors sm:h-auto sm:aspect-prompt"
    >
      {text}
    </button>
  );
}
