export interface ChecklistItem {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  description: string;
}

export function calculateProfileScore(profile: any) {
  const items: ChecklistItem[] = [
    {
      id: 'bio',
      label: 'Professional Bio',
      description: 'Write a bio explaining your expertise (at least 20 characters).',
      points: 20,
      completed: !!(profile.bio && profile.bio.trim().length >= 20 && profile.bio !== "I design meaningful experiences.")
    },
    {
      id: 'avatar',
      label: 'Custom Avatar',
      description: 'Upload a custom profile image.',
      points: 20,
      completed: !!(profile.avatar && profile.avatar !== '/profile_avatar.png' && !profile.avatar.includes('profile_avatar.png'))
    },
    {
      id: 'tagline',
      label: 'Profile Tagline',
      description: 'Add a catchy professional tagline.',
      points: 15,
      completed: !!(profile.tagline && profile.tagline.trim().length > 0 && profile.tagline !== "Let's connect!")
    },
    {
      id: 'socials',
      label: 'Social Connections',
      description: 'Add at least 3 active social links.',
      points: 20,
      completed: !!(profile.socials && profile.socials.length >= 3)
    },
    {
      id: 'tags',
      label: 'Profile Tags',
      description: 'Add at least 1 role tag and 1 location tag.',
      points: 15,
      completed: (() => {
        if (!profile.tags) return false;
        const hasRole = profile.tags.some((t: any) => t.type === 'role');
        const hasLoc = profile.tags.some((t: any) => t.type === 'location');
        return hasRole && hasLoc;
      })()
    },
    {
      id: 'tap',
      label: 'First Connection',
      description: 'Get tapped or clicked by someone else (1+ tap count).',
      points: 10,
      completed: !!(profile.tapCount && profile.tapCount > 0)
    }
  ];

  const score = items.reduce((acc, item) => acc + (item.completed ? item.points : 0), 0);

  return {
    score,
    items,
    qualifiesForLeaderboard: score >= 60 // Minimum criteria score is 60
  };
}
