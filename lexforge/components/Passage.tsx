import { BLANK } from "@/lib/content/constants";

/** Renders a passage, drawing `____` as an underlined blank. */
export function Passage({ text, className = "" }: { text: string; className?: string }) {
  const [before, after] = text.split(BLANK);
  return (
    <p className={className}>
      {before}
      {after !== undefined && (
        <>
          <span className="blank" role="img" aria-label="blank" />
          {after}
        </>
      )}
    </p>
  );
}
