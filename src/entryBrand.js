// Words and colors for this app's welcome, sign-in and unlock screens (components/EntryScreens.jsx).
export const BRAND = {
  name: 'Armed & Anchored',
  shortName: 'Armed & Anchored',
  icon: '/icon.png',
  tagline: 'Spiritual Warfare Training Journal',
  verse: {
    text: 'Put on the whole armor of God, that you may be able to stand against the schemes of the devil.',
    ref: 'Ephesians 6:11 · ESV',
  },
  // Purchase page: three short groups, the price, one button (components/EntryScreens.jsx, Welcome).
  headline: 'Your personal war room, built on Scripture.',
  unlockHeadline: 'Take up the whole arsenal.',
  groups: [
    { title: 'Train', items: ['All 26 weapons of the believer', 'A five-minute Daily Drill on any weapon', 'Scripture memory on every weapon'] },
    { title: 'Stand', items: ['Under Attack: the right weapon in a minute', 'Enemy tactics, so you see it coming', 'Declarations and prayers to speak'] },
    { title: 'Go deeper', items: ['Greek and Hebrew word studies with audio', 'A private battle journal on every device', 'Share cards for every weapon'] },
  ],
  price: '$39 once',
  priceNote: 'No subscription. Yours for good.',
  cta: '⚔️ Get Lifetime Access',
  fine: '',
  // Giving line on the purchase page (components/EntryScreens.jsx, GivingLine). The running total comes from eloraradiance.com/giving.json.
  giving: "10% of this app's net sales each month is given to Children's Cup.",
  freeCta: '🛡️ Start Free: The Armor of God',
  freeFine: 'Free account, no card. One complete weapon with the Daily Drill and Under Attack.',
  signInPrompt: 'Already have an account?',
  signinSubtitle: 'Welcome back, warrior',
  colors: {
    bg: '#070E17',
    glow: 'radial-gradient(ellipse at 20% 0%, rgba(158,40,40,0.22) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(176,138,78,0.10) 0%, transparent 50%)',
    eyebrow: '#E08A8A', title: '#EDE6D6', text: '#D6CCB8', muted: '#9CB0C2', accent: '#CFA968', link: '#E8A3A3',
    card: 'linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))', cardBorder: 'rgba(176,138,78,0.28)',
    divider: 'rgba(255,255,255,0.08)',
    ctaBg: 'linear-gradient(135deg, rgba(158,40,40,0.62), rgba(158,40,40,0.28))', ctaBorder: 'rgba(201,72,72,0.65)', ctaText: '#F2EDE3',
    panel: 'rgba(13,26,42,0.97)', panelBorder: 'rgba(176,138,78,0.22)',
    inputBg: 'rgba(255,255,255,0.045)', inputBorder: 'rgba(176,138,78,0.3)', inputText: '#EDE6D6',
    tabBg: 'rgba(255,255,255,0.03)', tabActiveBg: 'rgba(158,40,40,0.34)', tabActiveText: '#F2EDE3',
    errorBg: 'rgba(201,72,72,0.12)', errorBorder: 'rgba(201,72,72,0.42)', errorText: '#F2A6A6',
    okBg: 'rgba(124,146,132,0.14)', okBorder: 'rgba(157,181,166,0.42)', okText: '#BFD6C7',
  },
}
