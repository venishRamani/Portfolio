import {useEffect, useState, type FormEvent} from 'react';
import {AlertCircle, Check, X} from 'lucide-react';
import type {ProfileData} from '../types/portfolio';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: ProfileData;
  onClose: () => void;
  onSave: (updated: ProfileData) => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [location, setLocation] = useState(profile.location);
  const [email, setEmail] = useState(profile.email);
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setRole(profile.role);
      setLocation(profile.location);
      setEmail(profile.email);
      setHeadline(profile.headline);
      setBio(profile.bio);
      setError(null);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !role.trim() || !headline.trim() || !bio.trim()) {
      setError('Name, role, headline, and bio are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...profile,
        name: name.trim(),
        role: role.trim(),
        location: location.trim() || profile.location,
        email: email.trim() || profile.email,
        headline: headline.trim(),
        bio: bio.trim(),
      });
      onClose();
    } catch {
      setError('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-white/15 bg-[#161618] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="edit-profile-title" className="font-mono text-sm font-semibold text-white">
            Edit Developer Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#111111] text-white hover:border-[#00E5FF] hover:text-[#00E5FF]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-[#F87171]/40 bg-[#7F1D1D]/30 px-3.5 py-2.5 text-xs text-[#FCA5A5]"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prof-name" className="block font-mono text-xs text-[#9CA3AF]">
                Name
              </label>
              <input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-role" className="block font-mono text-xs text-[#9CA3AF]">
                Title / Role
              </label>
              <input
                id="prof-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prof-location" className="block font-mono text-xs text-[#9CA3AF]">
                Location
              </label>
              <input
                id="prof-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-email" className="block font-mono text-xs text-[#9CA3AF]">
                Contact Email
              </label>
              <input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="prof-headline" className="block font-mono text-xs text-[#9CA3AF]">
              Main Headline
            </label>
            <input
              id="prof-headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="mt-1.5 w-full min-h-[42px] rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="prof-bio" className="block font-mono text-xs text-[#9CA3AF]">
              Short Bio
            </label>
            <textarea
              id="prof-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#23232A] bg-[#0A0A0B] px-3 py-2 text-sm text-[#F4F4F5] focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] border border-white/15 px-4 py-2 text-xs font-semibold text-[#8A8A94] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="chamfer-btn inline-flex min-h-[42px] items-center gap-1.5 bg-[#00E5FF] px-5 py-2 text-xs font-bold text-[#111111] hover:bg-[#38EDFF] disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
