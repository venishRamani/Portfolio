/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  DirectMessage,
  GitHubProject,
  MessageStatus,
  ProfileData,
} from './types/portfolio';
import {
  DEFAULT_PROFILE,
  deleteDirectMessage,
  deleteGitHubProject,
  loadGitHubProjects,
  loadMessages,
  loadProfile,
  saveProfile,
  syncGitHubProject,
  updateGitHubProjectHighlight,
  updateMessageStatus,
} from './lib/portfolioApi';
import {Navbar} from './components/Navbar';
import {IntroHero} from './components/IntroHero';
import {ProjectShowcase} from './components/ProjectShowcase';
import {GitHubShowcase} from './components/GitHubShowcase';
import {AboutSection} from './components/AboutSection';
import {ContactSection} from './components/ContactSection';
import {Footer} from './components/Footer';
import {EditProfileModal} from './components/EditProfileModal';
import {AddGitHubProjectModal} from './components/AddGitHubProjectModal';
import {MessageInboxModal} from './components/MessageInboxModal';

export default function App() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [githubProjects, setGithubProjects] = useState<GitHubProject[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  const [inboxOpen, setInboxOpen] = useState(false);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const loaded = await loadProfile();
      setProfile(loaded);
    } catch {
      // Keep default profile on transient failure
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const loaded = await loadMessages();
      setMessages(loaded);
    } catch {
      setMessagesError('Unable to load saved messages right now.');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const fetchGitHubProjects = useCallback(async () => {
    setGithubLoading(true);
    setGithubError(null);
    try {
      const loaded = await loadGitHubProjects();
      setGithubProjects(loaded);
    } catch {
      setGithubError('Unable to load pinned GitHub repositories.');
    } finally {
      setGithubLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
    void fetchMessages();
    void fetchGitHubProjects();
  }, [fetchProfile, fetchMessages, fetchGitHubProjects]);

  const scrollToProjectOne = () => {
    const projectEl = document.getElementById('project-1');
    if (projectEl) {
      projectEl.scrollIntoView({behavior: 'smooth'});
    }
  };

  const scrollToContactAndFocus = () => {
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({behavior: 'smooth'});
    }
    setTimeout(() => {
      nameInputRef.current?.focus({preventScroll: true});
    }, 350);
  };

  const handleSaveProfile = async (updated: ProfileData) => {
    const saved = await saveProfile(updated);
    setProfile(saved);
  };

  const handleMessageSubmitted = (message: DirectMessage) => {
    setMessages((prev) => [message, ...prev]);
  };

  const handleUpdateMessageStatus = async (id: string, status: MessageStatus) => {
    const updated = await updateMessageStatus(id, status);
    if (updated) {
      setMessages((prev) => prev.map((item) => (item.id === id ? updated : item)));
    }
  };

  const handleDeleteMessage = async (id: string) => {
    const deleted = await deleteDirectMessage(id);
    if (deleted) {
      setMessages((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleGitHubAdded = (project: GitHubProject) => {
    setGithubProjects((prev) => [project, ...prev]);
  };

  const handleSyncGitHubProject = async (id: string) => {
    const updated = await syncGitHubProject(id);
    if (updated) {
      setGithubProjects((prev) => prev.map((item) => (item.id === id ? updated : item)));
    }
  };

  const handleUpdateGitHubHighlight = async (id: string, customHighlight: string) => {
    const updated = await updateGitHubProjectHighlight(id, customHighlight);
    if (updated) {
      setGithubProjects((prev) => prev.map((item) => (item.id === id ? updated : item)));
    }
  };

  const handleDeleteGitHubProject = async (id: string) => {
    const deleted = await deleteGitHubProject(id);
    if (deleted) {
      setGithubProjects((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar
        ownerName={profile.name}
        ownerEmail={profile.email}
        messageCount={messages.length}
        onContactClick={scrollToContactAndFocus}
        onOpenInbox={() => {
          void fetchMessages();
          setInboxOpen(true);
        }}
      />

      <div className="md:pl-16">
        <main>
          <IntroHero
            profile={profile}
            onScrollToProject={scrollToProjectOne}
          />
          <ProjectShowcase onContactClick={scrollToContactAndFocus} />
          <GitHubShowcase
            projects={githubProjects}
            loading={githubLoading}
            error={githubError}
            onOpenAddModal={() => setGithubModalOpen(true)}
            onProjectAdded={handleGitHubAdded}
            onSyncProject={handleSyncGitHubProject}
            onUpdateHighlight={handleUpdateGitHubHighlight}
            onDeleteProject={handleDeleteGitHubProject}
          />
          <AboutSection
            profile={profile}
            onEditProfile={() => setEditProfileOpen(true)}
            onContactClick={scrollToContactAndFocus}
          />
          <ContactSection
            ownerEmail={profile.email}
            nameInputRef={nameInputRef}
            messageCount={messages.length}
            onMessageSubmitted={handleMessageSubmitted}
            onOpenInbox={() => {
              void fetchMessages();
              setInboxOpen(true);
            }}
          />
        </main>

        <Footer
          profile={profile}
          onOpenInbox={() => {
            void fetchMessages();
            setInboxOpen(true);
          }}
        />
      </div>

      <EditProfileModal
        isOpen={editProfileOpen}
        profile={profile}
        onClose={() => setEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <AddGitHubProjectModal
        isOpen={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        existingUrls={githubProjects.map((item) => item.htmlUrl)}
        onProjectAdded={handleGitHubAdded}
      />

      <MessageInboxModal
        isOpen={inboxOpen}
        onClose={() => setInboxOpen(false)}
        messages={messages}
        loading={messagesLoading}
        error={messagesError}
        onRefresh={() => void fetchMessages()}
        onUpdateStatus={handleUpdateMessageStatus}
        onDelete={handleDeleteMessage}
      />
    </div>
  );
}
