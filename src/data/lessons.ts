/**
 * Lesson data model — all lesson content lives here as plain data.
 * 3D scenes read the active step; nothing lesson-specific is hardcoded
 * inside the scene components beyond object ids.
 */

export type Vec3 = [number, number, number];

export interface LessonStep {
  id: string;
  title: string;
  /** explanation text shown in the timeline bar */
  description: string;
  /** seconds this step lasts when auto-playing */
  duration: number;
  camera: { position: Vec3; target: Vec3 };
  /** object id that should be emphasised during this step */
  highlight?: string;
  /** label ids visible during this step */
  labels?: string[];
}

export interface LayerDef {
  id: string;
  label: string;
}

export interface ObjectInfo {
  title: string;
  text: string;
}

export interface LabelDef {
  id: string;
  text: string;
  position: Vec3;
}

export interface Lesson {
  id: string;
  title: string;
  tagline: string;
  description: string;
  scene: 'cell' | 'dna' | 'virus';
  /** camera used before the first step flies in (cinematic intro) */
  introCamera: { position: Vec3; target: Vec3 };
  focusDistance: number;
  layers: LayerDef[];
  labels: LabelDef[];
  steps: LessonStep[];
  info: Record<string, ObjectInfo>;
}

export const lessons: Lesson[] = [
  {
    id: 'inside-cell',
    title: 'Inside a Living Cell',
    tagline: 'Tour the organelles of an animal cell in 3D',
    description:
      'A stylized, simplified fly-through of an animal cell interior. Simplified visual prototype — structures are illustrative, not to scale.',
    scene: 'cell',
    introCamera: { position: [0, 10, 34], target: [0, 0, 0] },
    focusDistance: 8,
    layers: [
      { id: 'membrane', label: 'Cell membrane' },
      { id: 'nucleus', label: 'Nucleus' },
      { id: 'mitochondria', label: 'Mitochondria' },
      { id: 'ribosomes', label: 'Ribosomes' },
      { id: 'molecules', label: 'Molecules' },
      { id: 'particles', label: 'Particles' },
      { id: 'labels', label: 'Labels' },
    ],
    labels: [
      { id: 'nucleus', text: 'Nucleus', position: [0, 4.6, 0] },
      { id: 'dna', text: 'DNA (chromatin)', position: [1.8, 1.6, 1.2] },
      { id: 'mitochondria', text: 'Mitochondrion', position: [5.6, 1.6, 2.2] },
      { id: 'membrane', text: 'Cell membrane', position: [-7.2, 4.4, 3.4] },
      { id: 'ribosomes', text: 'Ribosomes', position: [-3.4, -3.2, 3.6] },
    ],
    steps: [
      {
        id: 'overview',
        title: 'Inside a Living Cell',
        description:
          'You are inside a living cell — a microscopic world packed with specialized compartments called organelles, each with its own job.',
        duration: 9,
        camera: { position: [0, 3, 21], target: [0, 0, 0] },
        labels: ['nucleus', 'mitochondria', 'membrane'],
      },
      {
        id: 'nucleus',
        title: 'The Nucleus',
        description:
          "The nucleus stores the cell's DNA — the complete instruction manual for building and running the cell. DNA is packaged here as chromatin.",
        duration: 10,
        camera: { position: [0.5, 2.5, 10.5], target: [0, 0.8, 0] },
        highlight: 'nucleus',
        labels: ['nucleus', 'dna'],
      },
      {
        id: 'mitochondria',
        title: 'Mitochondria — the Powerhouses',
        description:
          'Mitochondria convert nutrients into ATP, the energy currency that powers nearly everything the cell does. Their folded inner membrane holds the energy machinery.',
        duration: 10,
        camera: { position: [7.5, 3.2, 8], target: [4.4, 0.2, 1.6] },
        highlight: 'mitochondria',
        labels: ['mitochondria'],
      },
      {
        id: 'membrane',
        title: 'The Cell Membrane',
        description:
          'A flexible boundary that protects the cell and controls what enters and leaves. Watch small molecules drift through it.',
        duration: 10,
        camera: { position: [-8, 4, 11], target: [-4.5, 0.5, 2] },
        highlight: 'membrane',
        labels: ['membrane', 'ribosomes'],
      },
      {
        id: 'recap',
        title: 'One Living System',
        description:
          'Organelles work together as a single system. Explore freely — click any structure to inspect it, or toggle layers to reveal the cell piece by piece.',
        duration: 9,
        camera: { position: [0, 5, 19], target: [0, 0, 0] },
        labels: ['nucleus', 'mitochondria', 'membrane', 'dna', 'ribosomes'],
      },
    ],
    info: {
      membrane: {
        title: 'Cell Membrane',
        text: 'A flexible phospholipid bilayer that encloses the cell. It protects the interior and selectively controls which substances pass in and out.',
      },
      nucleus: {
        title: 'Nucleus',
        text: "Contains most of the cell's genetic material and coordinates activity such as growth and reproduction by regulating gene expression.",
      },
      dna: {
        title: 'DNA (Chromatin)',
        text: 'Inside the nucleus, long DNA molecules are wrapped around proteins to form chromatin — compact packaging for two meters of genetic code.',
      },
      mitochondria: {
        title: 'Mitochondrion',
        text: 'Generates ATP through cellular respiration. The folded inner membrane (cristae) provides a huge surface area for energy-producing reactions.',
      },
      ribosomes: {
        title: 'Ribosomes',
        text: 'Tiny molecular machines that build proteins by linking amino acids together, following instructions copied from DNA.',
      },
      molecules: {
        title: 'Molecules',
        text: 'Proteins, nutrients and signaling molecules drift through the cytoplasm, the jelly-like interior of the cell.',
      },
    },
  },
  {
    id: 'dna-replication',
    title: 'DNA Replication',
    tagline: 'Watch the double helix unzip and copy itself',
    description:
      'A simplified, step-by-step visualization of DNA replication. Simplified visual prototype — not to molecular scale.',
    scene: 'dna',
    introCamera: { position: [0, 6, 26], target: [0, 0, 0] },
    focusDistance: 6,
    layers: [
      { id: 'dna', label: 'DNA strands' },
      { id: 'enzyme', label: 'Helicase enzyme' },
      { id: 'nucleotides', label: 'Nucleotides' },
      { id: 'particles', label: 'Particles' },
      { id: 'labels', label: 'Labels' },
    ],
    labels: [
      { id: 'helix', text: 'Double helix', position: [-2.6, 3.4, 0] },
      { id: 'helicase', text: 'Helicase', position: [1.9, 1.4, 0] },
      { id: 'fork', text: 'Replication fork', position: [-2.2, 0.6, 0] },
      { id: 'nucleotides', text: 'Free nucleotides', position: [3.4, -2.6, 1] },
      { id: 'daughter', text: 'New DNA molecule', position: [5.2, 3.2, -1] },
    ],
    steps: [
      {
        id: 'helix',
        title: 'The Double Helix',
        description:
          'DNA stores genetic information as two complementary strands twisted into a helix, joined by paired bases: A with T, G with C.',
        duration: 9,
        camera: { position: [0, 1, 15], target: [0, 0, 0] },
        highlight: 'dna',
        labels: ['helix'],
      },
      {
        id: 'unwind',
        title: 'Unwinding',
        description:
          'An enzyme called helicase travels along the DNA, unzipping the two strands at a Y-shaped region called the replication fork.',
        duration: 11,
        camera: { position: [6, 2.5, 10.5], target: [0, 0.8, 0] },
        highlight: 'helicase',
        labels: ['helicase', 'fork'],
      },
      {
        id: 'match',
        title: 'Nucleotide Matching',
        description:
          'Free-floating nucleotides are positioned against the exposed strands, following complementary base pairing — A always pairs with T, G with C.',
        duration: 11,
        camera: { position: [-6, 0.5, 10], target: [0, -1, 0] },
        highlight: 'nucleotides',
        labels: ['nucleotides', 'fork'],
      },
      {
        id: 'complete',
        title: 'Two DNA Molecules',
        description:
          'Each original strand serves as a template for a new partner strand. The result: two identical DNA molecules, ready for cell division.',
        duration: 10,
        camera: { position: [2.6, 1.5, 16], target: [2.2, 0, 0] },
        highlight: 'daughter',
        labels: ['daughter', 'helix'],
      },
    ],
    info: {
      dna: {
        title: 'DNA Double Helix',
        text: 'Two sugar-phosphate backbones wind around each other, linked by base pairs. The sequence of bases encodes genetic instructions.',
      },
      helicase: {
        title: 'Helicase',
        text: 'A motor-like enzyme that separates the two DNA strands by breaking the hydrogen bonds between base pairs.',
      },
      nucleotides: {
        title: 'Nucleotides',
        text: 'The building blocks of DNA. Each has a base (A, T, G or C); during replication they are matched to their complement on the template strand.',
      },
      daughter: {
        title: 'New DNA Molecule',
        text: 'One complete copy: an original template strand plus a newly synthesized complementary strand (semi-conservative replication).',
      },
    },
  },
  {
    id: 'virus-entry',
    title: 'Virus Entry',
    tagline: 'Follow a virus as it invades a cell — cinematically',
    description:
      'A cinematic, simplified visualization of viral entry: approach, receptor recognition, binding and entry. Simplified visual prototype.',
    scene: 'virus',
    introCamera: { position: [26, 16, 30], target: [0, 2, 0] },
    focusDistance: 7,
    layers: [
      { id: 'virus', label: 'Virus' },
      { id: 'membrane', label: 'Cell membrane' },
      { id: 'receptors', label: 'Receptors' },
      { id: 'particles', label: 'Particles' },
      { id: 'labels', label: 'Labels' },
    ],
    labels: [
      { id: 'virus', text: 'Virus', position: [2.6, 4.6, 1] },
      { id: 'spike', text: 'Spike proteins', position: [1.6, 3.6, 1.6] },
      { id: 'receptor', text: 'Receptor', position: [-1.7, 3.1, 0.6] },
      { id: 'membrane', text: 'Cell membrane', position: [-6.5, 3.4, -2] },
      { id: 'genome', text: 'Viral genome released', position: [1.9, -1.4, 0.8] },
    ],
    steps: [
      {
        id: 'approach',
        title: 'A Virus Approaches',
        description:
          'A virus drifts through the extracellular fluid toward a host cell, searching for a compatible surface receptor.',
        duration: 10,
        camera: { position: [15, 9, 19], target: [2, 3, 0] },
        highlight: 'virus',
        labels: ['virus', 'membrane'],
      },
      {
        id: 'recognize',
        title: 'Recognizing the Receptor',
        description:
          'Spike proteins studding the virus surface recognize a matching receptor on the cell — like a key finding its lock.',
        duration: 11,
        camera: { position: [5, 5, 10], target: [0, 2.8, 0] },
        highlight: 'receptor',
        labels: ['receptor', 'spike'],
      },
      {
        id: 'bind',
        title: 'Binding',
        description:
          'The virus docks firmly onto the cell membrane at the receptor site, held in place by multiple spike–receptor contacts.',
        duration: 9,
        camera: { position: [3, 3.6, 6.5], target: [0, 2.6, 0] },
        highlight: 'virus',
        labels: ['virus', 'receptor'],
      },
      {
        id: 'enter',
        title: 'Entry',
        description:
          'The cell membrane wraps around the virus and draws it inside — a process called endocytosis. The fusion site glows as membranes merge.',
        duration: 11,
        camera: { position: [3.4, 2.4, 7.5], target: [0, 1.2, 0] },
        highlight: 'membrane',
        labels: ['membrane', 'virus'],
      },
      {
        id: 'release',
        title: 'Inside the Cell',
        description:
          'Once inside, the virus releases its genetic material into the cell — the infection begins, and the cell’s machinery is hijacked.',
        duration: 10,
        camera: { position: [0.5, -0.5, 11], target: [0, -2, 0] },
        highlight: 'genome',
        labels: ['genome'],
      },
    ],
    info: {
      virus: {
        title: 'Virus',
        text: 'A microscopic infectious particle: genetic material wrapped in a protein shell, studded with spike proteins used to enter cells.',
      },
      spike: {
        title: 'Spike Proteins',
        text: 'Proteins on the virus surface that recognize and bind to specific receptors on host cells — the "key" for entry.',
      },
      receptor: {
        title: 'Receptor',
        text: 'A protein on the cell surface with a shape the viral spike recognizes. Binding here triggers the entry process.',
      },
      membrane: {
        title: 'Cell Membrane',
        text: 'The flexible boundary of the host cell. During entry it bends inward, engulfing the bound virus.',
      },
      genome: {
        title: 'Viral Genome',
        text: 'The virus’s genetic payload. Once released inside the cell, it hijacks the cell’s machinery to make more viruses.',
      },
    },
  },
];

export function getLesson(id: string): Lesson {
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) throw new Error(`Unknown lesson: ${id}`);
  return lesson;
}
