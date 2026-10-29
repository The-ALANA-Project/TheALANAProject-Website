import type { KnowledgeChallengeStep } from './knowledgeChallengeTypes';

export const AI_TECHNOLOGY_STEPS: KnowledgeChallengeStep[] = [
  {
    id: 1,
    label: 'AI Basics & Definitions',
    questions: [
      {
        question: 'What is Artificial Intelligence (AI) in simple terms?',
        options: [
          'Robots that have become conscious and self-aware',
          'A technology that allows computers to perform tasks that typically require human intelligence, such as recognizing patterns, making decisions, understanding language, and solving problems',
          'A new type of social media platform',
          'A programming language used to build websites',
        ],
        correctAnswer:
          'A technology that allows computers to perform tasks that typically require human intelligence, such as recognizing patterns, making decisions, understanding language, and solving problems',
        explainer:
          'AI isn\'t magic or consciousness — it\'s math. AI systems are trained on vast amounts of data to recognize patterns and make predictions or decisions. The "intelligence" is an illusion: computers are extremely good at finding patterns in numbers, and we call that "AI" when the patterns relate to things humans typically do.',
      },
      {
        question: 'What is the key difference between "narrow AI" and "general AI" (AGI)?',
        options: [
          'Narrow AI is faster than general AI',
          'Narrow AI excels at specific tasks (like playing chess or recognizing faces); general AI (still theoretical) would have the ability to understand, learn, and apply intelligence across any domain — like a human can',
          'General AI only works on powerful supercomputers',
          'There is no real difference — they are the same thing',
        ],
        correctAnswer:
          'Narrow AI excels at specific tasks (like playing chess or recognizing faces); general AI (still theoretical) would have the ability to understand, learn, and apply intelligence across any domain — like a human can',
        explainer:
          'Every AI you interact with today is "narrow AI" — specialized for one job. AlphaGo plays Go. ChatGPT generates text. Self-driving cars navigate roads. Each one can\'t do the others\' jobs. "General AI" (Artificial General Intelligence) would be a system that can learn ANY intellectual task a human can — it doesn\'t exist yet, and experts debate when (or if) it will arrive.',
      },
      {
        question: 'Which of the following are real-world examples of AI you likely use every day?',
        options: [
          'Recommendation systems on streaming platforms (Netflix, Spotify)',
          'Voice assistants (Siri, Alexa, Google Assistant)',
          'Spam filters in email',
          'Crystal ball predictions about the future',
        ],
        correctAnswer: [
          'Recommendation systems on streaming platforms (Netflix, Spotify)',
          'Voice assistants (Siri, Alexa, Google Assistant)',
          'Spam filters in email',
        ],
        isMultiSelect: true,
        explainer:
          'AI is already woven into daily life — you might not even realize it. Recommendation algorithms analyze what you watch/listen to and suggest similar content. Voice assistants convert your speech to text and match your commands to actions. Spam filters learn from millions of emails to block unwanted messages. These are all narrow AI systems doing specific tasks very well.',
      },
    ],
  },
  {
    id: 2,
    label: 'How AI Learns (Machine Learning)',
    questions: [
      {
        question: 'What is "machine learning" (ML)?',
        options: [
          'Computers that learn to work like humans do physically (walking, lifting)',
          'A type of AI where computers learn from data and improve at tasks over time without being explicitly programmed for every specific rule',
          'A method for humans to learn coding faster',
          'Upgrading computer hardware with new chips',
        ],
        correctAnswer:
          'A type of AI where computers learn from data and improve at tasks over time without being explicitly programmed for every specific rule',
        explainer:
          'In traditional programming, you write rules and feed data to get answers. In machine learning, you feed data and expected answers, and the computer figures out the rules itself. It\'s like teaching a child to recognize cats by showing hundreds of cat and non-cat photos — the child (or ML model) learns the patterns on its own.',
      },
      {
        question: 'What does it mean that AI models are "trained on data"?',
        options: [
          'The AI goes to school and takes exams',
          'The system processes massive amounts of information (text, images, audio, etc.) to identify patterns and learn to make predictions or generate outputs',
          'The developers spend hours manually programming every possible answer',
          'The AI studies a single textbook cover to cover',
        ],
        correctAnswer:
          'The system processes massive amounts of information (text, images, audio, etc.) to identify patterns and learn to make predictions or generate outputs',
        explainer:
          'AI models are "trained" by feeding them enormous datasets — billions of web pages for language models, millions of images for vision models. The model identifies statistical patterns (which words follow which, which pixels form a cat, etc.). Garbage in = garbage out: if the training data is biased or incomplete, the AI\'s output will reflect those limitations.',
      },
      {
        question: 'What is "hallucination" in the context of generative AI?',
        options: [
          'The AI experiencing psychological distress',
          'When an AI model generates information that sounds confident and plausible but is actually incorrect, fabricated, or nonsensical',
          'A beneficial side effect that makes AI more creative',
          'When the AI temporarily stops working and needs to reboot',
        ],
        correctAnswer:
          'When an AI model generates information that sounds confident and plausible but is actually incorrect, fabricated, or nonsensical',
        explainer:
          'Hallucination is one of AI\'s biggest limitations. Language models predict what word comes next — they don\'t "know" facts. When pressed for information they haven\'t learned, they generate plausible-sounding nonsense. Always fact-check AI-generated content, especially for medical, legal, or financial advice. Think of AI as a brilliant but unreliable intern.',
      },
    ],
  },
  {
    id: 3,
    label: 'AI Ethics & Society',
    questions: [
      {
        question: 'What is "algorithmic bias" in AI?',
        options: [
          'When AI algorithms develop personal biases against their users',
          'When AI systems produce unfairly discriminatory results because the data they were trained on reflected historical prejudices or lacks representation of certain groups',
          'A feature that helps AI make more unbiased decisions',
          'A programming technique for coding algorithms efficiently',
        ],
        correctAnswer:
          'When AI systems produce unfairly discriminatory results because the data they were trained on reflected historical prejudices or lacks representation of certain groups',
        explainer:
          'If an AI is trained mostly on data from white male users, it may perform poorly for women or people of color — like facial recognition systems that struggle with darker skin tones. This isn\'t intentional discrimination by the AI; it\'s a reflection of biased or incomplete training data. Diverse, representative data is essential for fair AI.',
      },
      {
        question: 'Why is "data privacy" a concern when using AI services?',
        options: [
          'AI companies need personal data to train their models, and there are risks that sensitive information could be leaked, misused, or used without your knowledge or consent',
          'AI requires your personal data just to function, and there is no way around it',
          'Privacy concerns are not a problem because all AI companies are required to protect data',
          'Data privacy is only an issue for government AI, not for consumer AI tools',
        ],
        correctAnswer:
          'AI companies need personal data to train their models, and there are risks that sensitive information could be leaked, misused, or used without your knowledge or consent',
        explainer:
          'AI systems learn from data you provide — photos you upload, text you type, voice you record. That data can be stored, analyzed, and potentially used to train models that could reveal private information about you or others. Always read AI service terms carefully. Look for options to opt out of data storage, and avoid sharing sensitive personal information (health records, financial data) with AI tools.',
      },
      {
        question: 'Which of the following are important questions to ask about any AI tool or service?',
        options: [
          'What data was this AI trained on, and who produced it?',
          'Who is accountable if the AI makes a harmful or incorrect decision?',
          'Can the AI be used without knowing what data you share with it?',
          'How transparent is the company about how the AI works and its limitations?',
        ],
        correctAnswer: [
          'What data was this AI trained on, and who produced it?',
          'Who is accountable if the AI makes a harmful or incorrect decision?',
          'How transparent is the company about how the AI works and its limitations?',
        ],
        isMultiSelect: true,
        explainer:
          'Being an informed AI user means asking the right questions. Understanding training data reveals potential biases. Accountability matters — if an AI gives wrong medical advice, who is responsible? Transparency about limitations (like hallucination risks) is essential. The third option is often false: many AI tools do need your data and may not be clear about it, so read terms of service carefully.',
      },
    ],
  },
  {
    id: 4,
    label: 'AI Tools & Applications',
    questions: [
      {
        question: 'What is a Large Language Model (LLM) like ChatGPT or Gemini based on?',
        options: [
          'A database of pre-written answers to common questions',
          'Transformer architecture — a type of neural network trained on vast text data to recognize language patterns and generate human-like text',
          'A collection of hardcoded scripts written by developers',
          'Artificial consciousness that thinks like a human brain',
        ],
        correctAnswer:
          'Transformer architecture — a type of neural network trained on vast text data to recognize language patterns and generate human-like text',
        explainer:
          'LLMs use "transformer" neural networks — mathematical structures that pay attention to relationships between words in a sentence. They were trained on trillions of words from books, articles, code, and websites. They don\'t "understand" language like humans do; they predict the most statistically likely next word. This makes them remarkably good at many tasks but unreliable for factual accuracy.',
      },
      {
        question: 'What are "generative AI" tools used for (e.g., DALL·E, Midjourney, Stable Diffusion)?',
        options: [
          'Only for creating AI-generated images from text descriptions',
          'Creating new content — images, music, text, video, code, and more — based on patterns learned from training data, guided by user prompts or inputs',
          'Analyzing existing databases for errors',
          'Managing cloud server infrastructure',
        ],
        correctAnswer:
          'Creating new content — images, music, text, video, code, and more — based on patterns learned from training data, guided by user prompts or inputs',
        explainer:
          'Generative AI doesn\'t copy existing content — it creates NEW output by learning patterns. Text-to-image models learn how words relate to visual patterns. Music generators learn musical structures. Code generators learn programming patterns. While powerful, generative AI can produce copyrighted content, deepfakes, and misleading material — use it ethically and always verify outputs.',
      },
      {
        question: 'What is an AI "prompt" and what makes a good one?',
        options: [
          'A button you click to activate an AI model',
          'The text input you give an AI system — a good prompt is specific, provides context and desired format, and breaks complex tasks into clear steps',
          'A secret code that gives you premium access to AI tools',
          'The name of the AI model you are using',
        ],
        correctAnswer:
          'The text input you give an AI system — a good prompt is specific, provides context and desired format, and breaks complex tasks into clear steps',
        explainer:
          'Prompting is a skill. Good prompts include: who the AI should act as, what specific task to perform, what format to use, and any constraints. "Write a recipe" is weak. "Write a 3-ingredient vegan dinner recipe suitable for beginners, formatted as a numbered list with prep time and nutritional info" is strong. Treat AI like a smart colleague — clear instructions get better results.',
      },
    ],
  },
  {
    id: 5,
    label: 'Responsible AI Use',
    questions: [
      {
        question: 'What does "human-in-the-loop" mean when working with AI?',
        options: [
          'The human operator sits inside the computer',
          'A workflow where AI assists with tasks but a human reviews, validates, and makes final decisions — ensuring accountability and preventing harmful automated errors',
          'A method of training AI using only human test subjects',
          'Using AI that has human-like emotions and feelings',
        ],
        correctAnswer:
          'A workflow where AI assists with tasks but a human reviews, validates, and makes final decisions — ensuring accountability and preventing harmful automated errors',
        explainer:
          'AI should augment human decision-making, not replace it entirely — especially in high-stakes areas like healthcare, legal, hiring, and finance. "Human-in-the-loop" means the AI does the heavy lifting (drafting, analyzing, suggesting), but a human makes the final call. Always review AI outputs before sharing or acting on them.',
      },
      {
        question: 'When should you use AI-generated content?',
        options: [
          'Always — AI is more creative than humans',
          'Never — AI should never be used for content creation',
          'When used transparently (disclosing it was AI-assisted), ethically (respecting copyright and consent), and responsibly (verifying facts before sharing or publishing)',
          'Only when you are paid by a company that provides AI tools',
        ],
        correctAnswer:
          'When used transparently (disclosing it was AI-assisted), ethically (respecting copyright and consent), and responsibly (verifying facts before sharing or publishing)',
        explainer:
          'AI is a powerful tool, not a replacement for judgment. Use it ethically: disclose AI assistance, respect copyright, don\'t use it to mislead or deceive, fact-check outputs, and consider the impact on others. The best use of AI is as a collaborator — it handles the tedious parts while you provide the direction, judgment, and accountability.',
      },
      {
        question: 'What are some red flags that an AI system or service may be unethical or unsafe?',
        options: [
          'It claims to be "fully unbiased" and "100% accurate" without acknowledging limitations',
          'It stores your sensitive data without clear privacy policies or opt-out options',
          'It generates realistic fake content (deepfakes) without warnings or watermarks',
          'The company is transparent about how data is used and allows users to delete their data',
        ],
        correctAnswer: [
          'It claims to be "fully unbiased" and "100% accurate" without acknowledging limitations',
          'It stores your sensitive data without clear privacy policies or opt-out options',
          'It generates realistic fake content (deepfakes) without warnings or watermarks',
        ],
        isMultiSelect: true,
        explainer:
          'Red flags include: unrealistic claims (no AI is 100% accurate), opaque data practices, generating unmarked deepfakes, and no accountability mechanisms. A responsible AI service clearly states its limitations, has transparent data policies, provides opt-out options, and includes safeguards against misuse. The fourth option describes what a GOOD AI service does — transparency and user control.',
      },
    ],
  },
];
