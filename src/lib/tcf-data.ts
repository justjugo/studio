import type { Question, UserProgress } from '@/lib/types';

export const questions: Question[] = [
  {
    id: 1,
    section: 'listening',
    difficulty: 'A1',
    audioSrc: '/audio/sample.mp3',
    questionText: 'Écoutez la conversation. Où vont-ils?',
    options: [
      { id: 'a', text: 'Au cinéma' },
      { id: 'b', text: 'Au restaurant' },
      { id: 'c', text: 'Au parc' },
      { id: 'd', text: 'À la maison' },
    ],
    correctOptionId: 'b',
    explanationVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 2,
    section: 'structure',
    difficulty: 'A2',
    questionText: 'Je ______ du piano tous les jours.',
    options: [
      { id: 'a', text: 'joue' },
      { id: 'b', text: 'joues' },
      { id: 'c', text: 'jouent' },
      { id: 'd', text: 'jouons' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 3,
    section: 'reading',
    difficulty: 'B1',
    questionText: 'Lisez le texte. Quel est le but principal de l\'auteur?',
    options: [
      { id: 'a', text: 'Informer sur un événement' },
      { id: 'b', text: 'Donner son opinion' },
      { id: 'c', text: 'Vendre un produit' },
      { id: 'd', text: 'Raconter une histoire' },
    ],
    correctOptionId: 'a',
    explanationVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 4,
    section: 'structure',
    difficulty: 'B2',
    questionText: 'Il faut que vous ______ plus attentif.',
    options: [
        { id: 'a', text: 'êtes' },
        { id: 'b', text: 'soyez' },
        { id: 'c', text: 'soit' },
        { id: 'd', text: 'êtes' },
    ],
    correctOptionId: 'b',
  },
  {
      id: 5,
      section: 'reading',
      difficulty: 'C1',
      questionText: 'Quelle est l\'inférence principale que l\'on peut tirer du dernier paragraphe?',
      options: [
          { id: 'a', text: 'La situation va s\'améliorer' },
          { id: 'b', text: 'L\'auteur est pessimiste' },
          { id: 'c', text: 'Il manque des informations' },
          { id: 'd', text: 'Une action immédiate est requise' },
      ],
      correctOptionId: 'd',
  },
  {
      id: 6,
      section: 'listening',
      difficulty: 'B1',
      audioSrc: '/audio/sample2.mp3',
      questionText: 'Selon le reportage, quelle est la cause principale du problème?',
      options: [
          { id: 'a', text: 'Le changement climatique' },
          { id: 'b', text: 'La politique gouvernementale' },
          { id: 'c', text: 'Le comportement des citoyens' },
          { id: 'd', text: 'Une crise économique' },
      ],
      correctOptionId: 'a',
  },
];

export const userProgress: UserProgress = {
  history: [
    {
      id: 'attempt1',
      date: '2024-06-10T10:00:00Z',
      score: 45,
      totalQuestions: 76,
      timeTaken: 4800, // 80 minutes
      sections: {
        listening: { score: 15, total: 29 },
        reading: { score: 20, total: 29 },
        structure: { score: 10, total: 18 },
      },
    },
    {
      id: 'attempt2',
      date: '2024-06-17T11:30:00Z',
      score: 55,
      totalQuestions: 76,
      timeTaken: 4500, // 75 minutes
      sections: {
        listening: { score: 20, total: 29 },
        reading: { score: 22, total: 29 },
        structure: { score: 13, total: 18 },
      },
    },
    {
      id: 'attempt3',
      date: '2024-06-24T09:00:00Z',
      score: 62,
      totalQuestions: 76,
      timeTaken: 4200, // 70 minutes
      sections: {
        listening: { score: 22, total: 29 },
        reading: { score: 25, total: 29 },
        structure: { score: 15, total: 18 },
      },
    },
     {
      id: 'attempt4',
      date: '2024-07-01T14:00:00Z',
      score: 58,
      totalQuestions: 76,
      timeTaken: 4600, // ~76 minutes
      sections: {
        listening: { score: 21, total: 29 },
        reading: { score: 23, total: 29 },
        structure: { score: 14, total: 18 },
      },
    },
  ],
};
