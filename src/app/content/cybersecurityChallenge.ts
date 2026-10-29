import type { KnowledgeChallengeStep } from './knowledgeChallengeTypes';

export const CYBERSECURITY_STEPS: KnowledgeChallengeStep[] = [
  {
    id: 1,
    label: 'Threat Landscape Basics',
    questions: [
      {
        question: 'What is a phishing attack?',
        options: [
          'A method for catching digital fish in online games',
          'A fraudulent attempt to trick you into revealing sensitive information (like passwords or credit card numbers) through deceptive emails, messages, or websites',
          'A legitimate email from your bank asking you to verify your account',
          'A tool used by cybersecurity experts to test network security',
        ],
        correctAnswer:
          'A fraudulent attempt to trick you into revealing sensitive information (like passwords or credit card numbers) through deceptive emails, messages, or websites',
        explainer:
          'Phishing is the most common cyberattack method. Attackers pose as trusted entities (banks, services, colleagues) to trick you into clicking malicious links, downloading infected attachments, or sharing login credentials. Always check the sender address carefully — fake emails often use addresses that look similar but aren\'t quite right.',
      },
      {
        question: 'Which of the following signs should make you suspicious of an email or message?',
        options: [
          'The sender\'s email address doesn\'t exactly match the organization it claims to be from',
          'The message creates a sense of urgency or panic (e.g., "Your account will be closed in 24 hours!")',
          'Links in the message look odd or don\'t match the claimed destination when you hover over them',
          'The message is personalized with your real name and account details',
        ],
        correctAnswer: [
          'The sender\'s email address doesn\'t exactly match the organization it claims to be from',
          'The message creates a sense of urgency or panic (e.g., "Your account will be closed in 24 hours!")',
          'Links in the message look odd or don\'t match the claimed destination when you hover over them',
        ],
        isMultiSelect: true,
        explainer:
          'Legitimate organizations rarely create panic or use urgency tactics. Always hover over links to check the real URL, verify the sender\'s email address carefully (scammers often use typos like "support@gooogle.com"), and remember: if something feels off, it probably is. The fourth option is actually a sign of a *legitimate* message — personalization alone doesn\'t prove legitimacy.',
      },
      {
        question: 'What is malware?',
        options: [
          'A type of smartphone memory that runs slowly',
          'Malicious software designed to harm computers, networks, or devices (including viruses, ransomware, spyware, and trojans)',
          'A built-in security feature on modern computers',
          'A user-friendly software tool for creating websites',
        ],
        correctAnswer:
          'Malicious software designed to harm computers, networks, or devices (including viruses, ransomware, spyware, and trojans)',
        explainer:
          'Malware (short for malicious software) is any program intentionally designed to cause damage. Viruses attach to files and spread, ransomware locks your files and demands payment, spyware secretly monitors your activity, and trojans disguise themselves as legitimate software. Keeping antivirus software updated is your first line of defense.',
      },
    ],
  },
  {
    id: 2,
    label: 'Passwords & Authentication',
    questions: [
      {
        question: 'What makes a password "strong"?',
        options: [
          'It\'s short (6 characters or less) so it\'s easy to remember',
          'It uses only lowercase letters for consistency',
          'It\'s at least 12 characters long and combines uppercase letters, lowercase letters, numbers, and special symbols',
          'It includes your birthday or pet\'s name for easy recall',
        ],
        correctAnswer:
          'It\'s at least 12 characters long and combines uppercase letters, lowercase letters, numbers, and special symbols',
        explainer:
          'A strong password is long (12+ characters), unpredictable, and uses a mix of character types. Avoid personal information (birthdays, pet names, common words) — attackers use dictionaries and personal data breaches to guess these. A good trick: use a passphrase of random words (e.g., "Coral-Maple-Bridge-Sky!").',
      },
      {
        question: 'What is Two-Factor Authentication (2FA)?',
        options: [
          'A method of writing down your password twice for backup',
          'An extra security layer that requires a second form of verification (like a code from your phone, a fingerprint, or a hardware key) in addition to your password',
          'A password reset process that sends you a new password every two weeks',
          'Logging into two different accounts at the same time',
        ],
        correctAnswer:
          'An extra security layer that requires a second form of verification (like a code from your phone, a fingerprint, or a hardware key) in addition to your password',
        explainer:
          '2FA (or multi-factor authentication) adds a second barrier. Even if someone steals your password, they still can\'t access your account without the second factor — something you *have* (phone, hardware key), something you *are* (fingerprint, face scan), or something you *know* (a PIN). Always enable 2FA wherever possible.',
      },
      {
        question: 'Which password management approach is the safest for everyday use?',
        options: [
          'Using the same password everywhere — it\'s easier to remember',
          'Writing all passwords on a sticky note near your desk',
          'Using a reputable password manager (like Dashlane) to generate and store unique passwords for every account',
          'Sharing passwords with trusted friends so you can help each other if locked out',
        ],
        correctAnswer:
          'Using a reputable password manager (like Dashlane) to generate and store unique passwords for every account',
        explainer:
          'Password managers generate strong, unique passwords for each site and store them encrypted behind one master password. This way, even if one site is breached, your other accounts stay safe. Don\'t reuse passwords, don\'t write them on paper, and never share them. Your password manager\'s master password should be a long passphrase — that\'s the one you need to remember.',
      },
    ],
  },
  {
    id: 3,
    label: 'Encryption & Privacy',
    questions: [
      {
        question: 'What does "end-to-end encryption" (E2EE) mean for your messages?',
        options: [
          'The service provider can read your messages to moderate content',
          'Only you and the person you\'re messaging can read the messages — even the company providing the service cannot access them',
          'Your messages are encrypted only when you\'re on a public Wi-Fi network',
          'Messages are automatically deleted after 24 hours',
        ],
        correctAnswer:
          'Only you and the person you\'re messaging can read the messages — even the company providing the service cannot access them',
        explainer:
          'End-to-end encryption scrambles your message so that ONLY the sender and recipient can unlock (decrypt) and read it. Not even the messaging company (WhatsApp, Signal, etc.) can see the content. This is the gold standard for private communication. Look for "E2EE" labels in apps you use for sensitive conversations.',
      },
      {
        question: 'What is the difference between HTTP and HTTPS?',
        options: [
          'HTTPS is faster than HTTP',
          'HTTPS (the S stands for "Secure") encrypts the data between your browser and the website, while HTTP sends data in plain text that anyone can intercept',
          'HTTP is only for mobile apps, HTTPS only for desktop',
          'There is no meaningful difference between them',
        ],
        correctAnswer:
          'HTTPS (the S stands for "Secure") encrypts the data between your browser and the website, while HTTP sends data in plain text that anyone can intercept',
        explainer:
          'Always look for the lock icon and "https://" in your browser address bar. HTTP sends everything (passwords, messages, credit card numbers) in readable text that hackers on the same network can steal. HTTPS encrypts the connection, protecting your data in transit. Never enter sensitive information on an HTTP (non-secure) website.',
      },
      {
        question: 'Which of the following are good privacy practices online?',
        options: [
          'Reviewing and limiting app permissions on your phone (e.g., denying camera/microphone access to apps that don\'t need it)',
          'Using the same email address for every account and service',
          'Regularly reviewing and adjusting privacy settings on social media platforms',
          'Opting out of data tracking and cookies when offered the choice',
        ],
        correctAnswer: [
          'Reviewing and limiting app permissions on your phone (e.g., denying camera/microphone access to apps that don\'t need it)',
          'Regularly reviewing and adjusting privacy settings on social media platforms',
          'Opting out of data tracking and cookies when offered the choice',
        ],
        isMultiSelect: true,
        explainer:
          'Protecting your online privacy is an ongoing practice, not a one-time task. Revoke unnecessary app permissions, tighten social media privacy settings, and say no to tracking cookies. Using a single email everywhere makes it easier for companies to link all your online activity together. Consider using a "burner" email for less important accounts.',
      },
    ],
  },
  {
    id: 4,
    label: 'Network & Device Security',
    questions: [
      {
        question: 'Why is using public Wi-Fi dangerous for sensitive activities like online banking?',
        options: [
          'Public Wi-Fi connections are too slow for banking transactions',
          'Public Wi-Fi networks are often unencrypted, meaning anyone on the same network could potentially intercept (eavesdrop on) your data',
          'Public Wi-Fi automatically installs malware on your device',
          'Banks block all public Wi-Fi connections by policy',
        ],
        correctAnswer:
          'Public Wi-Fi networks are often unencrypted, meaning anyone on the same network could potentially intercept (eavesdrop on) your data',
        explainer:
          'Public Wi-Fi (cafés, airports, hotels) is often unsecured — attackers can set up fake networks and snoop on traffic. If you must use public Wi-Fi, avoid banking or entering passwords. Better yet, use a VPN (Virtual Private Network) to encrypt your connection, or switch to your phone\'s cellular data for sensitive tasks.',
      },
      {
        question: 'What should you do when your software (operating system, apps, browser) shows an update is available?',
        options: [
          'Ignore it — updates are just cosmetic changes',
          'Wait for a friend to tell you if it\'s safe',
          'Install it promptly — updates often include critical security patches that fix vulnerabilities attackers exploit',
          'Uninstall the app and find a replacement instead',
        ],
        correctAnswer:
          'Install it promptly — updates often include critical security patches that fix vulnerabilities attackers exploit',
        explainer:
          'Software updates frequently include "patches" that fix security holes discovered by researchers. Hackers actively look for unpatched vulnerabilities. Enabling automatic updates is the safest approach — it ensures you don\'t miss critical fixes while keeping your device protected.',
      },
      {
        question: 'What is a firewall?',
        options: [
          'A decorative physical wall around a building',
          'A security system that monitors and controls incoming and outgoing network traffic based on predetermined rules, acting as a barrier between trusted and untrusted networks',
          'A type of antivirus software that only works on Windows computers',
          'A feature that speeds up your internet connection',
        ],
        correctAnswer:
          'A security system that monitors and controls incoming and outgoing network traffic based on predetermined rules, acting as a barrier between trusted and untrusted networks',
        explainer:
          'A firewall is like a bouncer for your network traffic — it decides which connections are allowed in and which get turned away. Most operating systems have built-in firewalls (Windows Firewall, macOS Firewall). Make sure they\'re enabled. Firewalls don\'t replace antivirus software; they work together to protect your device.',
      },
    ],
  },
  {
    id: 5,
    label: 'Recovery & Incident Response',
    questions: [
      {
        question: 'If you suspect your account has been hacked, what are the most important first steps?',
        options: [
          'Change your password immediately and enable 2FA if it\'s not already on',
          'Continue using the account as normal while you investigate',
          'Notify your contacts about the hack so they don\'t click malicious links from you',
          'Report the incident to the platform/provider and check for unauthorized transactions or changes',
        ],
        correctAnswer: [
          'Change your password immediately and enable 2FA if it\'s not already on',
          'Notify your contacts about the hack so they don\'t click malicious links from you',
          'Report the incident to the platform/provider and check for unauthorized transactions or changes',
        ],
        isMultiSelect: true,
        explainer:
          'Quick action limits damage. Change your password, enable 2FA, notify contacts who may receive scam messages in your name, and report the breach to the platform. Review recent activity for unauthorized changes or purchases. If financial accounts are involved, contact your bank. Don\'t panic — responding quickly is the most important step.',
      },
      {
        question: 'What is "data backup" and why is it critical?',
        options: [
          'A trendy tech term for cloud storage that is no longer relevant',
          'Creating copies of your important files and storing them separately (offline, on an external drive, or in a different cloud account) so you can recover if your primary data is lost, corrupted, or encrypted by ransomware',
          'Deleting old files to free up storage space on your device',
          'Backing up your phone screen to share with friends',
        ],
        correctAnswer:
          'Creating copies of your important files and storing them separately (offline, on an external drive, or in a different cloud account) so you can recover if your primary data is lost, corrupted, or encrypted by ransomware',
        explainer:
          'The 3-2-1 backup rule: keep 3 copies of your data, on 2 different types of storage, with 1 copy offsite (cloud or a physical drive at a friend\'s house). Backups are your last line of defense against ransomware, hardware failure, and accidental deletion. If you don\'t have a backup, you\'re playing with your data.',
      },
      {
        question: 'What is a "seed phrase" (recovery phrase) and what should you do with it?',
        options: [
          'A hint your bank gives you to remember your PIN — share it with customer support if needed',
          'A set of 12-24 random words that recover access to your crypto wallet or encrypted data — write it on paper, store it securely offline, and never, ever share it or store it digitally',
          'A numeric security code sent to your phone when logging in',
          'A phrase you need to speak to unlock a biometric security feature',
        ],
        correctAnswer:
          'A set of 12-24 random words that recover access to your crypto wallet or encrypted data — write it on paper, store it securely offline, and never, ever share it or store it digitally',
        explainer:
          'Your seed phrase IS your wallet. Anyone with those words can access all your assets. Write it on paper, store it in a fireproof safe or safety deposit box — never screenshot it, never save it in cloud storage, never type it into a website. If someone asks you for your seed phrase, it is ALWAYS a scam.',
      },
    ],
  },
];
