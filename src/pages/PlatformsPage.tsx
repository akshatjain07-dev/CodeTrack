import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ExternalLink,
  Save,
  Terminal,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const PlatformsPage: React.FC = () => {
  const { settings, updateSettings, progress, questions } = useCodeTrack();

  const [leetcodeUser, setLeetcodeUser] = useState(settings.leetcodeUsername || '');
  const [codeforcesUser, setCodeforcesUser] = useState(settings.codeforcesUsername || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const platforms = [
    {
      id: 'LeetCode',
      name: 'LeetCode',
      description: 'The premier online platform for technical coding interview practice and algorithmic questions.',
      url: 'https://leetcode.com',
      profileBase: 'https://leetcode.com/u/',
      count: questions.filter((q) => q.platform === 'LeetCode').length,
      solvedCount: questions.filter((q) => q.platform === 'LeetCode' && progress[q.id]?.status === 'Solved').length,
    },
    {
      id: 'GeeksforGeeks',
      name: 'GeeksforGeeks (GFG)',
      description: 'Extensive repository of interview practice questions, company archives, and detailed articles.',
      url: 'https://www.geeksforgeeks.org',
      count: questions.filter((q) => q.platform === 'GeeksforGeeks').length,
      solvedCount: questions.filter((q) => q.platform === 'GeeksforGeeks' && progress[q.id]?.status === 'Solved').length,
    },
    {
      id: 'CodingNinjas',
      name: 'Coding Ninjas Studio',
      description: 'Curated problem sets and guided coding paths tailored for Indian engineering campus placements.',
      url: 'https://www.naukri.com/code360',
      count: questions.filter((q) => q.platform === 'CodingNinjas').length,
      solvedCount: questions.filter((q) => q.platform === 'CodingNinjas' && progress[q.id]?.status === 'Solved').length,
    },
    {
      id: 'TakeUForward',
      name: 'TakeUForward (TUF+)',
      description: "Striver's official editorial and video curriculum hub providing in-depth intuition.",
      url: 'https://takeuforward.org',
      count: questions.filter((q) => q.platform === 'TakeUForward').length,
      solvedCount: questions.filter((q) => q.platform === 'TakeUForward' && progress[q.id]?.status === 'Solved').length,
    },
  ];

  const handleSaveHandles = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      leetcodeUsername: leetcodeUser.trim(),
      codeforcesUsername: codeforcesUser.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
              External Coding Ecosystem
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs text-muted font-mono">
              Verified Problem Links & Profiles
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Coding Platforms</h1>
          <p className="text-xs text-secondary mt-0.5">
            Organize questions by original host platform and configure your public handles for quick navigation.
          </p>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-lg border border-subtle bg-surface-elevated flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
        <div className="text-xs text-secondary space-y-1">
          <span className="font-semibold text-primary block">
            Independent, Safe & Zero-Credential Policy
          </span>
          <p>
            CodeTrack does not ask for or store passwords from LeetCode or Codeforces. We do not use fragile web scraping. Your progress is your own, safely recorded and portable.
          </p>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((p, idx) => (
          <div
            key={p.id}
            style={{ animationDelay: `${Math.min(idx * 40, 200)}ms` }}
            className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow flex flex-col justify-between space-y-4 animate-fade-in hover:border-default transition-all duration-150"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted">{p.id}</span>
                <span className="text-xs font-mono text-primary font-medium">
                  {p.solvedCount} / {p.count} Solved
                </span>
              </div>
              <h3 className="text-base font-semibold text-primary flex items-center justify-between">
                {p.name}
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary p-1 transition-colors"
                  title={`Visit ${p.name}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </h3>
              <p className="text-xs text-secondary mt-1 leading-relaxed">{p.description}</p>
            </div>

            <div className="pt-3 border-t border-subtle flex items-center justify-between">
              <NavLink
                to={`/questions?platform=${p.id}`}
                className="text-xs font-medium text-secondary hover:text-primary inline-flex items-center gap-1 transition-colors"
              >
                Filter {p.count} Questions
                <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>
          </div>
        ))}
      </div>

      {/* Public Profile Configuration */}
      <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow space-y-4 max-w-2xl">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Terminal className="w-4 h-4 text-secondary" />
          Link Your Public Profiles
        </h3>
        <p className="text-xs text-secondary">
          Save your public usernames to enable one-click access to your online submissions and profiles.
        </p>

        <form onSubmit={handleSaveHandles} className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              LeetCode Username
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted">leetcode.com/u/</span>
              <Input
                placeholder="e.g. akshat_jain"
                value={leetcodeUser}
                onChange={(e) => setLeetcodeUser(e.target.value)}
              />
              {leetcodeUser && (
                <a
                  href={`https://leetcode.com/u/${leetcodeUser}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-secondary block mb-1">
              Codeforces Handle
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted">codeforces.com/profile/</span>
              <Input
                placeholder="e.g. tourist"
                value={codeforcesUser}
                onChange={(e) => setCodeforcesUser(e.target.value)}
              />
              {codeforcesUser && (
                <a
                  href={`https://codeforces.com/profile/${codeforcesUser}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" icon={<Save className="w-3.5 h-3.5" />}>
              Save Profiles
            </Button>
            {saveSuccess && (
              <span className="text-xs text-primary font-medium font-mono">
                Profiles saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
