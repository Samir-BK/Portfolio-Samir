import type { Project } from './projects.ts';

export const personalizedProjects = [
  {
    slug: 'personal-trainer',
    title: 'Personal Trainer',
    summary:
      'A full-stack training management app with schedules, activity statistics, and trainer-specific customer goals.',
    category: 'Full-stack development',
    technologies: [
      'Java',
      'Spring Boot',
      'React',
      'TypeScript',
      'PostgreSQL',
      'Flyway',
      'Material UI',
    ],
    repositoryUrl: 'https://github.com/Samir-BK/Personal-Trainer',
    demoUrl: 'https://personal-trainer-five-delta.vercel.app',
    featured: true,
    featuredOrder: 1,
    visual: 'queue',
    overview:
      'The app brings customer and training records into a single interface where trainers can plan sessions, view activity totals, and manage fitness goals for assigned customers.',
    problem:
      'A shared training directory can hold customer and session records, while individual trainers still need a place to manage their own customer assignments and goals.',
    approach:
      'React views provide customer and training grids, calendar views, goal forms, and an activity chart. Spring Boot controllers handle trainer assignments and goal updates. The repository includes backend tests and CI checks for the frontend.',
    decisions:
      'The university REST service owns shared customers and training sessions. PostgreSQL stores app-specific trainer records, assignments, and goals, with Flyway migrations. The frontend uses separate clients for the two APIs.',
    challenges:
      'The same customer can be referenced by the university customer ID and by a local assignment ID. The backend checks that the trainer owns the assignment before allowing access to its goals. The shared training views depend on the external service.',
    lessons: '',
  },
  {
    slug: 'flappy-bird-dqn',
    title: 'Flappy Bird DQN',
    summary:
      'A PyTorch reinforcement learning experiment that implements a Deep Q-Network to learn when to flap.',
    category: 'Machine learning',
    technologies: ['Python', 'PyTorch', 'Gymnasium'],
    repositoryUrl: 'https://github.com/Samir-BK/Flappy-Bird-DQN',
    featured: true,
    featuredOrder: 2,
    visual: 'trace',
    overview:
      'A configurable agent trains in a Gymnasium-compatible Flappy Bird environment. The repository includes the network, replay memory, training loop, and an episode log.',
    problem:
      'The project explores how an agent can learn actions from rewards in a game environment without hand-coding a gameplay policy.',
    approach:
      'The agent uses epsilon-greedy action selection, samples past transitions from replay memory, and periodically copies weights to a target network. Hyperparameters are set in YAML.',
    decisions:
      'The network, replay buffer, and learning loop are separate Python modules. Targets mask out the next-state estimate at the end of an episode. PyTorch handles tensors and optimization, and Gymnasium provides the environment interface.',
    challenges:
      'The project notes describe debugging NumPy-to-tensor conversions and preserving the original state when storing transitions. They also document missing seed control and a repeatable multi-episode evaluation.',
    lessons:
      'The project notes explain why updating state after recording the transition and masking terminal targets matter for correct training.',
  },
  {
    slug: 'creator-scout',
    title: 'CreatorScout',
    summary:
      'A Streamlit dashboard for finding and comparing regional gaming creators across several platforms.',
    category: 'Applied AI',
    technologies: ['Python', 'Streamlit', 'Groq', 'Requests', 'ytscrape'],
    repositoryUrl: 'https://github.com/Samir-BK/CreatorScout',
    featured: true,
    featuredOrder: 3,
    visual: 'notes',
    overview:
      'The app takes a search brief and selected regions, then displays candidate creators with fit scores and an option to export results as CSV.',
    problem:
      'Regional creators often publish in local languages. Searching in English alone can miss relevant channels, and comparing public activity across platforms takes manual review.',
    approach:
      'Separate discovery modules handle YouTube, TikTok, and Instagram. Search terms are localized, platform results are normalized for display, and a scoring module produces fit assessments.',
    decisions:
      'Streamlit manages the dashboard and CSV export. The scoring module calls Groq, tries alternate models on rate limits, and includes a heuristic fallback. Discovery computes recent viewing summaries where the platform data supports them.',
    challenges:
      'Platform metadata comes in different formats and can be incomplete. The source handles missing counts, region hints, recent-post windows, and scoring errors without conflating them with successful model results.',
    lessons: '',
  },
  {
    slug: 'text-summarizer-app',
    title: 'Text Summarizer App',
    summary:
      'A FastAPI prototype for summarizing pasted dialogue with a T5 model.',
    category: 'Applied AI',
    technologies: [
      'Python',
      'FastAPI',
      'PyTorch',
      'Hugging Face Transformers',
      'JavaScript',
    ],
    repositoryUrl: 'https://github.com/Samir-BK/Text-Summarizer-App',
    featured: false,
    featuredOrder: 4,
    visual: 'notes',
    overview:
      'The repository pairs a T5 fine-tuning notebook with a web form and a JSON summarization endpoint.',
    problem:
      'Long dialogues take time to scan. The prototype explores generating a shorter summary from pasted text.',
    approach:
      'The browser submits dialogue to FastAPI. The server normalizes the text, tokenizes with a length cap, runs beam-search generation, and returns the decoded summary.',
    decisions:
      'Training and inference are separate. The notebook starts from T5-small, while the application loads a saved model and selects MPS, CUDA, or CPU at startup.',
    challenges:
      'The application currently loads its model and tokenizer from a machine-specific Windows path. Running it elsewhere requires access to the trained files and a portable model path.',
    lessons: '',
  },
  {
    slug: 'mailbrief',
    title: 'MailBrief',
    summary:
      'A Flask application that summarizes pasted emails and answers text questions through Groq.',
    category: 'Applied AI',
    technologies: ['Python', 'Flask', 'Groq', 'OpenAI SDK', 'JavaScript'],
    repositoryUrl: 'https://github.com/Samir-BK/MailBrief',
    featured: false,
    featuredOrder: 5,
    visual: 'queue',
    overview:
      'A web form supports two text workflows. Users can paste an email to summarize or submit a general question.',
    problem:
      'Email readers may want a shorter version of a long message or a quick answer without switching interfaces.',
    approach:
      'JavaScript sends the form asynchronously to separate Flask routes. The server sends a task-specific prompt through Groq’s OpenAI-compatible interface and returns the model response as JSON.',
    decisions:
      'The Groq key is read from the server environment. The two routes set distinct prompts and generation settings, while the browser handles submission and result display.',
    challenges:
      'The implementation relies on a configured Groq key and provider availability. Email content is pasted into the form and sent to the provider for summarization.',
    lessons: '',
  },
  {
    slug: 'cnn-image-classification',
    title: 'CNN Image Classification',
    summary:
      'A PyTorch notebook that trains and evaluates a convolutional network on CIFAR-10.',
    category: 'Machine learning',
    technologies: ['Python', 'PyTorch', 'torchvision', 'Jupyter'],
    repositoryUrl: 'https://github.com/Samir-BK/CNN-Image-Classification',
    featured: false,
    featuredOrder: 6,
    visual: 'trace',
    overview:
      'The notebook builds a classifier for the ten CIFAR-10 image categories and evaluates it on a separate test split.',
    problem:
      'The experiment explores how a small convolutional network can learn features that distinguish low-resolution color images.',
    approach:
      'torchvision loads and normalizes CIFAR-10. The notebook builds the network, trains with cross-entropy and Adam, evaluates held-out examples, and saves model weights.',
    decisions:
      'Three convolution and pooling blocks extract spatial features before the fully connected layers classify each image. Training and evaluation use separate data loaders.',
    challenges:
      'The repository notes possible overfitting and proposes regularization and augmentation as follow-up experiments. The notebook contains the training code, while the README describes a standalone command.',
    lessons: '',
  },
] satisfies readonly (Omit<Project, 'published'> & { featuredOrder: number })[];
