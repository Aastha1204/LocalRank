/**
 * Generic, clearly-labelled illustrations for services that don't have a live demo yet.
 * Sized with container-query units (cqw) so they scale inside the carousel frame.
 * No client names, no numbers: they only show the idea.
 */
const frame = "flex h-full w-full flex-col justify-center gap-[2.4cqw] p-[4cqw] text-ink";
const chip = "rounded-full bg-white px-[2cqw] py-[0.8cqw] text-[2.2cqw] font-bold ring-1 ring-ink/15";

function Step({ n, text, done }: { n: number; text: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-[1.6cqw] rounded-[1.6cqw] bg-white px-[2cqw] py-[1.4cqw] shadow-sm ring-1 ring-ink/10">
      <span className={`flex h-[4cqw] w-[4cqw] shrink-0 items-center justify-center rounded-full text-[2.2cqw] font-extrabold ${done ? "bg-teal text-ink" : "bg-saffron text-ink"}`}>{done ? "✓" : n}</span>
      <span className="text-[2.6cqw] font-semibold">{text}</span>
    </div>
  );
}

export function MobileApp() {
  const screen = (title: string, rows: string[], accent: string) => (
    <div className="w-[19cqw] rounded-[2.6cqw] border-[0.7cqw] border-ink bg-white p-[1.4cqw] shadow-xl">
      <div className={`rounded-[1.2cqw] ${accent} px-[1.2cqw] py-[1cqw] text-[1.9cqw] font-extrabold`}>{title}</div>
      <div className="mt-[1.2cqw] space-y-[1cqw]">
        {rows.map((r) => <div key={r} className="rounded-[1cqw] bg-mist px-[1.2cqw] py-[1.1cqw] text-[1.7cqw] font-semibold">{r}</div>)}
      </div>
      <div className="mt-[1.4cqw] rounded-full bg-ink py-[0.9cqw] text-center text-[1.7cqw] font-bold text-white">Continue</div>
    </div>
  );
  return (
    <div className="flex h-full w-full items-center justify-center gap-[3cqw] bg-gradient-to-br from-paper to-teal/30 p-[3cqw]">
      {screen("Home", ["Today’s tasks", "New requests", "Messages"], "bg-saffron/60")}
      {screen("Bookings", ["Mon, 10:00", "Tue, 4:30", "Fri, 11:15"], "bg-teal/60")}
      {screen("Profile", ["My details", "Notifications", "Help"], "bg-ink/10")}
    </div>
  );
}

export function Agentic() {
  return (
    <div className={`${frame} bg-gradient-to-br from-paper to-saffron/25`}>
      <p className="text-[3cqw] font-extrabold">An AI agent works through a task step by step</p>
      <Step n={1} text="Reads the new enquiry" done />
      <Step n={2} text="Checks the calendar for free slots" done />
      <Step n={3} text="Drafts a reply and asks you to approve" />
      <Step n={4} text="Books the slot and updates your records" />
    </div>
  );
}

export function Rag() {
  return (
    <div className={`${frame} bg-gradient-to-br from-paper to-teal/25`}>
      <div className="self-end rounded-[2cqw] rounded-br-none bg-ink px-[2.4cqw] py-[1.6cqw] text-[2.6cqw] text-white">What is the refund policy?</div>
      <div className="max-w-[80%] rounded-[2cqw] rounded-bl-none bg-white px-[2.4cqw] py-[1.6cqw] text-[2.6cqw] shadow-sm ring-1 ring-ink/10">
        The answer is taken from your own document, so it matches what you have written.
        <div className="mt-[1.2cqw] flex gap-[1cqw]"><span className={chip}>Source: your policy PDF</span></div>
      </div>
      <p className="text-[2.2cqw] font-semibold text-ink/80">A chatbot that answers from your documents</p>
    </div>
  );
}

export function AgenticChat() {
  return (
    <div className={`${frame} bg-gradient-to-br from-paper to-saffron/25`}>
      <div className="self-end rounded-[2cqw] rounded-br-none bg-ink px-[2.4cqw] py-[1.6cqw] text-[2.6cqw] text-white">Can I book a visit this Saturday?</div>
      <div className="max-w-[85%] rounded-[2cqw] rounded-bl-none bg-white px-[2.4cqw] py-[1.6cqw] text-[2.6cqw] shadow-sm ring-1 ring-ink/10">
        Yes, here are the free slots. Pick one and I’ll book it.
        <div className="mt-[1.2cqw] flex flex-wrap gap-[1cqw]"><span className={chip}>11:00 AM</span><span className={chip}>2:30 PM</span><span className={chip}>5:00 PM</span></div>
      </div>
      <div className="flex items-center gap-[1.4cqw] text-[2.2cqw] font-semibold"><span className="rounded-full bg-teal px-[1.6cqw] py-[0.6cqw]">Action</span> Booking added to your calendar, owner notified</div>
    </div>
  );
}

export function Automation() {
  const node = (t: string, c: string) => <div className={`rounded-[1.6cqw] ${c} px-[2cqw] py-[1.8cqw] text-center text-[2.4cqw] font-bold shadow-sm`}>{t}</div>;
  const arrow = <span className="text-[3cqw] font-extrabold text-ink/50" aria-hidden="true">→</span>;
  return (
    <div className={`${frame} bg-gradient-to-br from-paper to-teal/25 items-center`}>
      <p className="text-[3cqw] font-extrabold">Repeat work, done automatically</p>
      <div className="flex items-center gap-[1.4cqw]">
        {node("New form or message", "bg-white ring-1 ring-ink/10")}{arrow}
        {node("Saved in your sheet", "bg-saffron/60")}{arrow}
        {node("Reply sent", "bg-teal/60")}
      </div>
      <p className="text-[2.2cqw] font-semibold text-ink/80">Illustration of a simple workflow</p>
    </div>
  );
}

export const ILLUSTRATIONS = { mobile: MobileApp, agentic: Agentic, rag: Rag, "agentic-chat": AgenticChat, automation: Automation } as const;
export type IllustrationKey = keyof typeof ILLUSTRATIONS;
