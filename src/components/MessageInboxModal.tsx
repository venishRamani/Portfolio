import {useEffect, useState} from 'react';
import {AlertCircle, Inbox, Mail, Trash2, X} from 'lucide-react';
import type {DirectMessage, MessageStatus} from '../types/portfolio';

interface MessageInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: DirectMessage[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: MessageStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_LABELS: Record<MessageStatus, string> = {
  unread: 'Unread',
  read: 'Read',
  replied: 'Replied',
};

export function MessageInboxModal({
  isOpen,
  onClose,
  messages,
  loading,
  error,
  onRefresh,
  onUpdateStatus,
  onDelete,
}: MessageInboxModalProps) {
  const [filter, setFilter] = useState<'all' | MessageStatus>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const filtered =
    filter === 'all' ? messages : messages.filter((item) => item.status === filter);

  const handleStatusChange = async (id: string, status: MessageStatus) => {
    setBusyId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await onDelete(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-inbox-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden border border-white/15 bg-[#161618] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div>
            <h2 id="message-inbox-title" className="font-mono text-sm font-semibold text-white">
              Message Log
            </h2>
            <p className="font-mono text-xs text-[#8A8A94] tabular-nums">
              {messages.length} total {messages.length === 1 ? 'note' : 'notes'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close message log"
            className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#111111] text-white transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#111111] px-6 py-3">
          <div className="flex items-center gap-1 border border-white/10 bg-[#161618] p-1">
            {(['all', 'unread', 'read', 'replied'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-bold capitalize transition-colors ${
                  filter === tab
                    ? 'bg-[#00E5FF] text-[#111111]'
                    : 'text-[#8A8A94] hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All' : STATUS_LABELS[tab]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="font-mono text-xs font-semibold text-[#00E5FF] hover:underline"
          >
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-12 text-center font-mono text-xs text-[#9CA3AF]">
              Loading saved notes...
            </div>
          ) : error ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[#F87171]/40 bg-[#7F1D1D]/30 p-4 text-xs text-[#FCA5A5]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
              <button type="button" onClick={onRefresh} className="font-semibold underline">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="h-7 w-7 text-[#52525B]" aria-hidden="true" />
              <p className="mt-3 font-display text-sm font-semibold text-[#F4F4F5]">
                No messages yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-[#9CA3AF]">
                Notes sent from the direct contact form appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#23232A] bg-[#0A0A0B] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[#9CA3AF] tabular-nums">
                        <span className="font-semibold text-white">{item.referenceCode}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span aria-hidden="true">·</span>
                        <span>{STATUS_LABELS[item.status]}</span>
                      </div>
                      <h3 className="mt-1.5 font-display text-base font-bold text-[#F4F4F5]">
                        {item.name}
                      </h3>
                      <div className="mt-0.5 font-mono text-xs text-[#9CA3AF]">{item.email}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Status for ${item.name}`}
                        disabled={busyId === item.id}
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value as MessageStatus)
                        }
                        className="min-h-[36px] rounded-lg border border-[#23232A] bg-[#121215] px-2.5 py-1 text-xs font-semibold text-[#F4F4F5]"
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>

                      <a
                        href={`mailto:${item.email}?subject=Re:%20Note%20(${item.referenceCode})`}
                        aria-label={`Reply by email to ${item.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#23232A] bg-[#121215] text-[#F4F4F5] hover:border-white"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>

                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete message from ${item.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#23232A] bg-[#121215] text-[#9CA3AF] hover:border-[#F87171] hover:text-[#F87171]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 border-t border-[#23232A] pt-3 text-sm leading-relaxed text-[#E4E4E7]">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
