import { useState } from 'react';

interface ReplyDraftCardProps {
  replyDraft: string;
}

export function ReplyDraftCard({ replyDraft }: ReplyDraftCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(replyDraft);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="reply-draft card">
      <div className="reply-draft__header">
        <div>
          <span className="eyebrow">Client reply draft</span>
          <h2>Ready to copy, send, or refine</h2>
          <p className="reply-draft__hint">Use it as-is or trim it to match your tone before sending.</p>
        </div>
        <button
          className={`button-secondary ${copied ? 'button-secondary--success' : ''}`}
          type="button"
          onClick={handleCopy}
        >
          {copied ? 'Reply copied' : 'Copy reply'}
        </button>
      </div>
      <pre>{replyDraft}</pre>
    </section>
  );
}
