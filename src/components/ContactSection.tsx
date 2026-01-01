import {useState, type FormEvent, type RefObject} from 'react';
import {AlertCircle, ArrowUpRight, Check, CheckCircle2, Copy, Inbox, Send} from 'lucide-react';
import type {DirectMessage} from '../types/portfolio';
import {submitDirectMessage} from '../lib/portfolioApi';
import {DecoderText} from './DecoderText';

interface ContactSectionProps {
  ownerEmail: string;
  nameInputRef: RefObject<HTMLInputElement | null>;
  messageCount: number;
  onMessageSubmitted: (message: DirectMessage) => void;
  onOpenInbox: () => void;
}

export function ContactSection({
  ownerEmail,
  nameInputRef,
  messageCount,
  onMessageSubmitted,
  onOpenInbox,
}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedReceipt, setSubmittedReceipt] = useState<DirectMessage | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ownerEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      window.location.href = `mailto:${ownerEmail}`;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (name.trim().length < 2) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMessage('Please write a short note (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const saved = await submitDirectMessage({
        name: name.trim(),
        email: email.trim(),
        organization: '',
        topic: 'Direct Note',
        message: message.trim(),
      });
      setSubmittedReceipt(saved);
      onMessageSubmitted(saved);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Network error while sending. Please email directly.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="border-t border-white/[0.06] bg-[#111111] px-6 py-24 sm:px-12 lg:px-20"
    >
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-14 lg:grid-cols-12">
        {/* Left: Direct Channels */}
        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="inline-block h-[2px] w-16 bg-[#00E5FF]" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#00E5FF]">
                Contact
              </span>
            </div>

            <h2
              className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{textWrap: 'balance'}}
            >
              <DecoderText text="Say hello" />
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-[#C4C4CC] sm:text-base">
              Open to full-stack web roles, product engineering, and direct technical
              conversations.
            </p>

            <div className="mt-8 space-y-4">
              <div className="font-mono text-sm font-medium text-white break-all">
                {ownerEmail}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${ownerEmail}`}
                  className="chamfer-btn inline-flex min-h-[42px] items-center gap-1.5 bg-[#00E5FF] px-5 py-2 text-xs font-bold text-[#111111] transition-colors hover:bg-[#38EDFF]"
                >
                  <span>Email Me</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex min-h-[42px] items-center gap-1.5 border border-white/15 bg-[#161618] px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-[#00E5FF]"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#00E5FF]" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#8A8A94]" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/[0.08] pt-6">
            <button
              type="button"
              onClick={onOpenInbox}
              className="inline-flex items-center gap-2 font-mono text-xs font-medium text-[#8A8A94] transition-colors hover:text-[#00E5FF]"
            >
              <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Message Log ({messageCount})</span>
            </button>
          </div>
        </div>

        {/* Right: Minimalist hamishw.com Bottom-Bordered Form */}
        <div className="lg:col-span-7">
          <div className="border border-white/10 bg-[#161618] p-6 sm:p-10">
            {submittedReceipt ? (
              <div className="py-4">
                <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-[#00E5FF]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Message Sent — {submittedReceipt.referenceCode}</span>
                </div>
                <p className="mt-3 text-base leading-relaxed text-[#C4C4CC]">
                  Thanks, {submittedReceipt.name}. I’ll reply to {submittedReceipt.email} soon.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedReceipt(null)}
                  className="chamfer-btn mt-6 inline-flex min-h-[44px] items-center bg-[#00E5FF] px-5 py-2 text-xs font-bold text-[#111111] hover:bg-[#38EDFF]"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 border border-[#F87171]/40 bg-[#7F1D1D]/30 px-4 py-3 text-xs text-[#FCA5A5]"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block font-mono text-xs uppercase tracking-[0.1em] text-[#8A8A94]"
                    >
                      Name
                    </label>
                    <input
                      ref={nameInputRef}
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mt-2 w-full min-h-[44px] border-b border-white/20 bg-transparent px-0 py-2.5 text-sm text-white placeholder:text-[#5C5C66] focus:border-[#00E5FF] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block font-mono text-xs uppercase tracking-[0.1em] text-[#8A8A94]"
                    >
                      Your email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="mt-2 w-full min-h-[44px] border-b border-white/20 bg-transparent px-0 py-2.5 text-sm text-white placeholder:text-[#5C5C66] focus:border-[#00E5FF] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block font-mono text-xs uppercase tracking-[0.1em] text-[#8A8A94]"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a short note..."
                    className="mt-2 w-full border-b border-white/20 bg-transparent px-0 py-2.5 text-sm text-white placeholder:text-[#5C5C66] focus:border-[#00E5FF] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="chamfer-btn inline-flex min-h-[46px] items-center gap-2.5 bg-[#00E5FF] px-6 py-2.5 text-xs font-bold text-[#111111] transition-colors hover:bg-[#38EDFF] disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{submitting ? 'Sending...' : 'Send message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
