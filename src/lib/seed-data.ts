
import type { Question } from '@/lib/types';

export const seedQuestions: Omit<Question, 'id'>[] = [
  // Language Structures (Grammar & Vocabulary)
  {
    section: 'structure',
    difficulty: 'A1',
    questionText: 'Nous ______ au marché le dimanche.',
    options: [
      { id: 'a', text: 'allons' },
      { id: 'b', text: 'allez' },
      { id: 'c', text: 'vais' },
      { id: 'd', text: 'vont' },
    ],
    correctOptionId: 'a',
    explanation: 'La bonne conjugaison du verbe "aller" à la première personne du pluriel (nous) au présent est "allons".'
  },
  {
    section: 'structure',
    difficulty: 'A2',
    questionText: 'Elle a acheté une ______ robe pour la fête.',
    options: [
      { id: 'a', text: 'joli' },
      { id: 'b', text: 'jolie' },
      { id: 'c', text: 'jolies' },
      { id: 'd', text: 'jolis' },
    ],
    correctOptionId: 'b',
    explanation: 'L\'adjectif s\'accorde en genre et en nombre avec le nom. "Robe" est féminin singulier, donc on utilise "jolie".'
  },
  {
    section: 'structure',
    difficulty: 'B1',
    questionText: 'Si j\'avais su, je ne ______ pas venu.',
    options: [
      { id: 'a', text: 'serais' },
      { id: 'b', text: 'serai' },
      { id: 'c', text: 'suis' },
      { id: 'd', text: 'serais' },
    ],
    correctOptionId: 'd',
    explanation: 'Cette phrase utilise le conditionnel passé pour exprimer un regret. La structure est "si + plus-que-parfait, conditionnel passé". La bonne forme est "je ne serais pas venu".'
  },
  {
    section: 'structure',
    difficulty: 'B2',
    questionText: 'Il est important que vous ______ vos devoirs avant de sortir.',
    options: [
      { id: 'a', text: 'finissez' },
      { id: 'b', text: 'finissiez' },
      { id: 'c', text: 'finirez' },
      { id: 'd', text: 'avez fini' },
    ],
    correctOptionId: 'b',
    explanation: 'Après l\'expression "Il est important que...", on utilise le subjonctif. La forme correcte pour "vous" au subjonctif présent du verbe "finir" est "finissiez".'
  },
  {
    section: 'structure',
    difficulty: 'C1',
    questionText: '______ soit la difficulté, nous devons persévérer.',
    options: [
      { id: 'a', text: 'Quelque' },
      { id: 'b', text: 'Quoique' },
      { id: 'c', text: 'Quelle que' },
      { id: 'd', text: 'Quoi que' },
    ],
    correctOptionId: 'c',
    explanation: '"Quelle que soit" est une locution qui signifie "peu importe" et s\'accorde avec le nom qui suit ("la difficulté").'
  },

  // Reading Comprehension (Written)
  {
    section: 'reading',
    difficulty: 'A1',
    questionText: 'Lisez l\'email : "Bonjour, je voudrais réserver une table pour deux personnes ce soir à 20h. Merci, M. Dubois." Que veut M. Dubois ?',
    options: [
      { id: 'a', text: 'Annuler une réservation.' },
      { id: 'b', text: 'Réserver une table au restaurant.' },
      { id: 'c', text: 'Demander le menu.' },
      { id: 'd', text: 'Payer l\'addition.' },
    ],
    correctOptionId: 'b',
    explanation: 'Le texte "je voudrais réserver une table" indique clairement qu\'il souhaite faire une réservation.'
  },
  {
    section: 'reading',
    difficulty: 'A2',
    questionText: 'Lisez le panneau : "Ne pas donner à manger aux animaux." Qu\'est-ce que cela signifie ?',
    options: [
      { id: 'a', text: 'Les animaux n\'ont pas faim.' },
      { id: 'b', text: 'Il est interdit de nourrir les animaux.' },
      { id: 'c', text: 'On peut acheter de la nourriture pour les animaux.' },
      { id: 'd', text: 'Les animaux sont dangereux.' },
    ],
    correctOptionId: 'b',
    explanation: 'L\'expression "Ne pas..." est une forme de négation utilisée pour donner un ordre ou une interdiction.'
  },
  {
    section: 'reading',
    difficulty: 'B1',
    questionText: 'Lisez le début de l\'article : "Suite aux fortes pluies de ces derniers jours, plusieurs routes de la région sont désormais impraticables." Quelle est la conséquence des fortes pluies ?',
    options: [
      { id: 'a', text: 'Le temps va s\'améliorer.' },
      { id: 'b', text: 'Les transports en commun sont gratuits.' },
      { id: 'c', text: 'On ne peut plus circuler sur certaines routes.' },
      { id: 'd', text: 'Il y a des soldes dans les magasins.' },
    ],
    correctOptionId: 'c',
    explanation: '"Impraticables" signifie qu\'on ne peut pas y passer ou circuler.'
  },
  {
    section: 'reading',
    difficulty: 'B2',
    questionText: 'Lisez cet extrait de critique de film : "Bien que la performance des acteurs soit irréprochable, le scénario manque cruellement d\'originalité et laisse le spectateur sur sa faim." Quel est l\'avis général du critique ?',
    options: [
      { id: 'a', text: 'Le film est une réussite totale.' },
      { id: 'b', text: 'Le film est décevant malgré de bons acteurs.' },
      { id: 'c', text: 'Les acteurs ne sont pas convaincants.' },
      { id: 'd', text: 'Le scénario est le point fort du film.' },
    ],
    correctOptionId: 'b',
    explanation: 'La conjonction "Bien que" introduit une concession. Le critique apprécie les acteurs mais critique le scénario, ce qui mène à une déception globale ("laisse le spectateur sur sa faim").'
  },
  {
    section: 'reading',
    difficulty: 'C1',
    questionText: 'Lisez la phrase : "L\'avènement du numérique a bouleversé les paradigmes de l\'industrie musicale, rendant obsolètes des modèles économiques jadis florissants." Que signifie cette phrase ?',
    options: [
      { id: 'a', text: 'Le numérique a eu peu d\'impact sur l\'industrie musicale.' },
      { id: 'b', text: 'L\'industrie musicale a connu une croissance grâce aux anciens modèles.' },
      { id: 'c', text: 'L\'arrivée du numérique a radicalement transformé le fonctionnement de l\'industrie musicale.' },
      { id: 'd', text: 'Les artistes sont moins bien payés à cause du numérique.' },
    ],
    correctOptionId: 'c',
    explanation: '"Avènement" signifie arrivée, "bouleversé les paradigmes" signifie a changé les modèles, et "rendant obsolètes" signifie que les anciens modèles ne fonctionnent plus. La phrase décrit donc une transformation radicale.'
  },
];

    