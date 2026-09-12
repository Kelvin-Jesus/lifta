import type { Exercise } from '../domain/exercise';
import type { MuscleGroup, Equipment } from '../domain/types';
import { EXTENDED_EXERCISE_CATALOG } from './exercisesExtended';

/** Movimentos base escritos à mão, referenciados pelas rotinas padrão. */
const CORE_EXERCISE_CATALOG: readonly Exercise[] = [
  // PEITO / CHEST
  {
    id: 'bench-press',
    name: 'Supino Reto com Barra',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'barbell',
    instructions: 'Deite-se no banco, pegada na largura dos ombros. Desça a barra controladamente até o terço médio do peito e empurre estendendo os cotovelos sem travar.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0025-EIeI8Vf.gif',
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Supino Inclinado com Halteres',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'dumbbell',
    instructions: 'Banco a 30-45 graus. Desça os halteres com os cotovelos a cerca de 60 graus do tronco. Empurre com o peitoral superior.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0314-ns0SIbU.gif',
  },
  {
    id: 'decline-bench-press',
    name: 'Supino Declinado com Barra',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'barbell',
    instructions: 'Posicione-se no banco declinado com pernas fixas. Enfatize a porção inferior do peito.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0033-GrO65fd.gif',
  },
  {
    id: 'cable-crossover-fly',
    name: 'Crucifixo no Crossover',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    equipment: 'cable',
    instructions: 'Polias na altura dos ombros ou ligeiramente acima. Aproxime as mãos à frente do peito com ligeira flexão de cotovelos.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0188-xLYSdtg.gif',
  },
  {
    id: 'chest-dips',
    name: 'Mergulho em Paralelas (Foco Peitoral)',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'bodyweight',
    instructions: 'Incline o tronco levemente para frente e abra um pouco os cotovelos para direcionar a tensão ao peitoral inferior.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0009-PAgTVaK.gif',
  },
  {
    id: 'push-up',
    name: 'Flexão de Braços',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'abs'],
    equipment: 'bodyweight',
    instructions: 'Corpo em linha reta, mãos na largura dos ombros. Desça o peito próximo ao chão mantendo o abdômen contraído.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0662-I4hDWkc.gif',
  },
  {
    id: 'pec-deck-machine',
    name: 'Peck Deck / Voador',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    equipment: 'machine',
    instructions: 'Ajuste o assento para que os braços fiquem na linha do peito. Feche os braços contraindo o miolo do peitoral.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2144-nIR4Rwl.gif',
  },

  // COSTAS / BACK
  {
    id: 'deadlift',
    name: 'Levantamento Terra Convencional',
    primaryMuscles: ['back', 'glutes', 'hamstrings'],
    secondaryMuscles: ['forearms', 'calves', 'abs'],
    equipment: 'barbell',
    instructions: 'Pés na largura do quadril, coluna neutra, empurre o chão com as pernas e finalize estendendo o quadril com as escápulas encaixadas.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0032-ila4NZS.gif',
  },
  {
    id: 'barbell-bent-over-row',
    name: 'Remada Curvada com Barra',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'barbell',
    instructions: 'Incline o tronco a cerca de 45 graus, coluna neutra. Puxe a barra em direção ao umbigo contraindo as dorsais.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0027-eZyBC3j.gif',
  },
  {
    id: 'pull-up',
    name: 'Barra Fixa Pronada',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'bodyweight',
    instructions: 'Pegada pronada aberta. Puxe o corpo até o queixo passar da barra, focando na depressão e adução das escápulas.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0652-lBDjFxJ.gif',
  },
  {
    id: 'chin-up',
    name: 'Barra Fixa Supinada',
    primaryMuscles: ['back', 'biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'bodyweight',
    instructions: 'Pegada supinada na largura dos ombros. Grande estímulo conjunto de dorsais e bíceps braquial.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1326-T2mxWqc.gif',
  },
  {
    id: 'lat-pulldown',
    name: 'Puxada Alta na Polia',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'cable',
    instructions: 'Puxe a barra até a altura da clavícula com cotovelos apontando para baixo e para os lados.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0232-CvPn9WV.gif',
  },
  {
    id: 'seated-cable-row',
    name: 'Remada Baixa Sentada no Cabo',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'cable',
    instructions: 'Pés apoiados, coluna ereta. Puxe o triângulo em direção ao abdômen apertando as escápulas atrás.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1323-SJqRxOt.gif',
  },
  {
    id: 'dumbbell-single-arm-row',
    name: 'Remada Unilateral com Halter (Serrote)',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'dumbbell',
    instructions: 'Apoie um joelho e mão no banco. Puxe o halter rente ao corpo até a cintura com controle.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0292-C0MA9bC.gif',
  },
  {
    id: 'dumbbell-shrugs',
    name: 'Encolhimento de Ombros com Halteres',
    primaryMuscles: ['back'],
    secondaryMuscles: ['shoulders', 'forearms'],
    equipment: 'dumbbell',
    instructions: 'Eleve os ombros em direção às orelhas sem girá-los, segure 1 segundo no pico de contração do trapézio.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0406-NJzBsGJ.gif',
  },

  // OMBROS / SHOULDERS
  {
    id: 'overhead-press',
    name: 'Desenvolvimento Militar com Barra',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'chest'],
    equipment: 'barbell',
    instructions: 'Em pé, barra apoiada na clavícula. Empurre a barra acima da cabeça travando o core e os glúteos.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0091-kTbSH9h.gif',
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Desenvolvimento Sentado com Halteres',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    equipment: 'dumbbell',
    instructions: 'Sentado com apoio lombar, empurre os halteres verticalmente acima da cabeça com trajetória controlada.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0405-znQUdHY.gif',
  },
  {
    id: 'lateral-raise',
    name: 'Elevação Lateral com Halteres',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    equipment: 'dumbbell',
    instructions: 'Eleve os braços no plano escapular até a altura dos ombros, cotovelos levemente flexionados.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0334-DsgkuIt.gif',
  },
  {
    id: 'cable-lateral-raise',
    name: 'Elevação Lateral na Polia Baixa',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    equipment: 'cable',
    instructions: 'Cabo cruzando por trás ou pela frente, tensão contínua em toda a amplitude de abdução do ombro.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0192-wEulIzp.gif',
  },
  {
    id: 'face-pull',
    name: 'Face Pull com Corda',
    primaryMuscles: ['shoulders', 'back'],
    secondaryMuscles: [],
    equipment: 'cable',
    instructions: 'Puxe a corda em direção aos olhos separando as mãos, promovendo rotação externa e saúde dos manguitos.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0203-wqNPGCg.gif',
  },
  {
    id: 'reverse-pec-deck',
    name: 'Crucifixo Invertido na Máquina',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back'],
    equipment: 'machine',
    instructions: 'Peito apoiado no encosto, abra os braços para trás acionando o deltoide posterior.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0233-ZfyAGhK.gif',
  },

  // PERNAS - QUADRÍCEPS / QUADRICEPS
  {
    id: 'barbell-squat',
    name: 'Agachamento Livre com Barra',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'abs'],
    equipment: 'barbell',
    instructions: 'Barra nas costas sobre o trapézio, pés na largura dos ombros. Agache até quebrar a paralela mantendo a coluna alinhada.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0102-oR7O9LW.gif',
  },
  {
    id: 'front-squat',
    name: 'Agachamento Frontal',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'abs'],
    equipment: 'barbell',
    instructions: 'Barra apoiada na clavícula e deltoides frontais, tronco ereto, sobrecarga dominante no quadríceps.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0042-zG0zs85.gif',
  },
  {
    id: 'leg-press-45',
    name: 'Leg Press 45º',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    equipment: 'machine',
    instructions: 'Pés na plataforma, destrave e desça até 90 graus de joelhos sem descolar o quadril do banco. Empurre pelos calcanhares.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1463-2Qh2J1e.gif',
  },
  {
    id: 'leg-extension',
    name: 'Cadeira Extensora',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: [],
    equipment: 'machine',
    instructions: 'Joelhos alinhados com o eixo da máquina. Estenda completamente as pernas segurando 1s no topo.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0585-my33uHU.gif',
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Agachamento Búlgaro',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: 'dumbbell',
    instructions: 'Um pé apoiado atrás no banco. Desça verticalmente concentrando o esforço na perna dianteira.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0987-arsYEd3.gif',
  },
  {
    id: 'walking-lunge',
    name: 'Avanço com Halteres',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    equipment: 'dumbbell',
    instructions: 'Dê passos longos controlados afundando o joelho de trás próximo ao chão mantendo estabilidade.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0054-t8iSghb.gif',
  },

  // POSTERIOR & GLÚTEOS / HAMSTRINGS & GLUTES
  {
    id: 'romanian-deadlift',
    name: 'Stiff / RDL com Barra',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['calves'],
    equipment: 'barbell',
    instructions: 'Joelhos semirrígidos, empurre o quadril para trás mantendo as costas retas até sentir forte alongamento nos isquiotibiais.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0085-wQ2c4XD.gif',
  },
  {
    id: 'lying-leg-curl',
    name: 'Mesa Flexora',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    equipment: 'machine',
    instructions: 'Deitado de bruços, flexione os joelhos trazendo a almofada em direção aos glúteos de forma controlada.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0586-17lJ1kr.gif',
  },
  {
    id: 'seated-leg-curl',
    name: 'Cadeira Flexora',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    equipment: 'machine',
    instructions: 'Sentado com coxa travada pela almofada superior. Flexione os joelhos para baixo.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0599-Zg3XY7P.gif',
  },
  {
    id: 'hip-thrust',
    name: 'Elevação Pélvica com Barra',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: 'barbell',
    instructions: 'Escápulas apoiadas no banco, barra sobre a crista ilíaca com acolchoamento. Estenda o quadril até ficar paralelo ao chão.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1409-qKBpF7I.gif',
  },
  {
    id: 'cable-glute-kickback',
    name: 'Glúteo no Cabo (Crossover)',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: 'cable',
    instructions: 'Tornozeleira presa à polia baixa, chute para trás e para cima apertando o glúteo máximo.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0196-OM46QHm.gif',
  },

  // PANTURRILHAS / CALVES
  {
    id: 'standing-calf-raise-machine',
    name: 'Panturrilha em Pé na Máquina',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: 'machine',
    instructions: 'Almofadas nos ombros, apoie a ponta dos pés. Desça bem os calcanhares para alongar e suba na ponta dos pés ao máximo.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0605-ykUOVze.gif',
  },
  {
    id: 'seated-calf-raise',
    name: 'Panturrilha Sentado (Foco Sóleo)',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: 'machine',
    instructions: 'Com joelhos dobrados a 90 graus, o sóleo assume papel dominante. Subida completa e descida pausada.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0594-bOOdeyc.gif',
  },

  // BRAÇOS - BÍCEPS & TRÍCEPS / ARMS
  {
    id: 'barbell-bicep-curl',
    name: 'Rosca Direta com Barra W',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'barbell',
    instructions: 'Cotovelos fixos ao lado do corpo, flexione os braços trazendo a barra até o peito sem balançar o tronco.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0031-25GPyDY.gif',
  },
  {
    id: 'dumbbell-incline-curl',
    name: 'Rosca Inclinada com Halteres',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'dumbbell',
    instructions: 'Banco a 45 graus, grande alongamento da cabeça longa do bíceps no ponto inicial.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0318-ae9UoXQ.gif',
  },
  {
    id: 'hammer-curl',
    name: 'Rosca Martelo com Halteres',
    primaryMuscles: ['biceps', 'forearms'],
    secondaryMuscles: [],
    equipment: 'dumbbell',
    instructions: 'Pegada neutra (palmas viradas uma para a outra), aciona braquiorradial e braquial profundo.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0313-slDvUAU.gif',
  },
  {
    id: 'preacher-curl',
    name: 'Rosca Scott com Barra',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'machine',
    instructions: 'Braços apoiados no banco Scott, elimina impulsos corporais focando na contração isolada.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0070-qOgPVf6.gif',
  },
  {
    id: 'tricep-rope-pushdown',
    name: 'Tríceps Pulley com Corda',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: 'cable',
    instructions: 'Cotovelos firmes junto ao tronco, empurre a corda para baixo afastando as pontas no final do movimento.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0200-dU605di.gif',
  },
  {
    id: 'skull-crushers',
    name: 'Tríceps Testa com Barra W',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'barbell',
    instructions: 'Deitado no banco reto, desça a barra até a testa ou ligeiramente atrás da cabeça flexionando os cotovelos.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0060-h8LFzo9.gif',
  },
  {
    id: 'overhead-tricep-cable',
    name: 'Tríceps Francês na Polia Baixa',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: 'cable',
    instructions: 'Braços estendidos para cima, cotovelos apontando para o teto, enfatiza a cabeça longa do tríceps.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0194-2IxROQ1.gif',
  },
  {
    id: 'close-grip-bench-press',
    name: 'Supino Reto com Pegada Fechada',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    equipment: 'barbell',
    instructions: 'Mãos na largura dos ombros, desça rente ao tronco com forte torque de extensão de cotovelo.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1731-7jGOBF3.gif',
  },

  // ANTEBRAÇO / FOREARMS
  {
    id: 'wrist-curls',
    name: 'Rosca de Punho com Barra',
    primaryMuscles: ['forearms'],
    secondaryMuscles: [],
    equipment: 'barbell',
    instructions: 'Antebraços apoiados sobre o banco, flexione os punhos para cima segurando a barra com os dedos e palmas.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0126-82LxxkW.gif',
  },
  {
    id: 'farmers-walk',
    name: "Farmer's Walk (Caminhada do Fazendeiro)",
    primaryMuscles: ['forearms', 'back'],
    secondaryMuscles: ['abs', 'calves'],
    equipment: 'dumbbell',
    instructions: 'Caminhe segurando halteres pesados com pegada firme, tronco ereto e passos curtos.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2133-qPEzJjA.gif',
  },

  // ABDÔMEN & CORE / ABS & OBLIQUES
  {
    id: 'hanging-leg-raise',
    name: 'Elevação de Pernas na Barra Fixa',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques', 'forearms'],
    equipment: 'bodyweight',
    instructions: 'Pendurado na barra fixa, eleve as pernas retas ou dobradas até a altura do peito retrovertendo a pelve.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0472-I3tsCnC.gif',
  },
  {
    id: 'cable-crunch',
    name: 'Abdominal na Polia Alta (Corda)',
    primaryMuscles: ['abs'],
    secondaryMuscles: [],
    equipment: 'cable',
    instructions: 'Ajoelhado à frente da polia, curve a coluna flexionando o tronco em direção ao chão contraindo o abdômen.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0874-XU3ePuv.gif',
  },
  {
    id: 'cable-woodchopper',
    name: 'Lenhador no Cabo (Woodchopper)',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['abs', 'shoulders'],
    equipment: 'cable',
    instructions: 'Rode o tronco de cima para baixo ou transversalmente com os braços estendidos acionando os oblíquos.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0243-aVs3BR3.gif',
  },
  {
    id: 'plank',
    name: 'Prancha Isométrica no Solo',
    primaryMuscles: ['abs', 'obliques'],
    secondaryMuscles: ['shoulders', 'glutes'],
    equipment: 'bodyweight',
    instructions: 'Apoiado nos antebraços e pontas dos pés, mantenha a coluna alinhada e glúteos contraídos sem deixar o quadril cair.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/3544-5VXmnV5.gif',
  },

  // CARDIO
  {
    id: 'treadmill-running',
    name: 'Corrida na Esteira',
    primaryMuscles: ['quadriceps', 'calves'],
    secondaryMuscles: ['hamstrings', 'glutes'],
    equipment: 'cardio',
    instructions: 'Corrida aeróbica contínua ou intervalada (HIIT) para condicionamento cardiovascular.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/3666-rjiM4L3.gif',
  },
  {
    id: 'stationary-bike',
    name: 'Bicicleta Ergométrica',
    primaryMuscles: ['quadriceps', 'calves'],
    secondaryMuscles: ['hamstrings'],
    equipment: 'cardio',
    instructions: 'Pedalagem com cadência e resistência ajustadas, baixo impacto articular.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/2138-H1PESYI.gif',
  },
  {
    id: 'rowing-machine',
    name: 'Remo Seco (Rowing Machine)',
    primaryMuscles: ['back', 'quadriceps'],
    secondaryMuscles: ['biceps', 'hamstrings', 'calves'],
    equipment: 'cardio',
    instructions: 'Empurre com as pernas e puxe o pegador em direção ao tórax, movimento cíclico de corpo inteiro.',
    gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1323-SJqRxOt.gif',
  },
];

export const EXERCISE_CATALOG: readonly Exercise[] = [
  ...CORE_EXERCISE_CATALOG,
  ...EXTENDED_EXERCISE_CATALOG,
];

export function searchExercises(
  catalog: readonly Exercise[],
  query: string
): Exercise[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...catalog];
  return catalog.filter(
    (ex) =>
      ex.name.toLowerCase().includes(normalized) ||
      ex.id.toLowerCase().includes(normalized) ||
      (ex.instructions && ex.instructions.toLowerCase().includes(normalized))
  );
}

export function filterExercisesByMuscle(
  catalog: readonly Exercise[],
  muscle: MuscleGroup
): Exercise[] {
  return catalog.filter(
    (ex) =>
      ex.primaryMuscles.includes(muscle) ||
      ex.secondaryMuscles.includes(muscle)
  );
}

export function filterExercisesByEquipment(
  catalog: readonly Exercise[],
  equipment: Equipment
): Exercise[] {
  return catalog.filter((ex) => ex.equipment === equipment);
}

export function getExerciseById(
  catalog: readonly Exercise[],
  id: string
): Exercise | undefined {
  return catalog.find((ex) => ex.id === id);
}

export function createCustomExercise(params: {
  name: string;
  primaryMuscles: [MuscleGroup, ...MuscleGroup[]];
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  instructions?: string;
}): Exercise {
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    name: params.name.trim(),
    primaryMuscles: params.primaryMuscles,
    secondaryMuscles: params.secondaryMuscles ?? [],
    equipment: params.equipment,
    instructions: params.instructions?.trim(),
    isCustom: true,
  };
}
