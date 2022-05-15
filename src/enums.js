export const SIMSTATE = {
  STOPPED: 0,
  CHEMO: 1,
  RADIATION : 2,
  REPLICATING: 3,
  PAUSED: 4,
};

export const CELLTYPE = {
  HEALTHY : 0,
  TREATMENT_SENSITIVE : 1,
  CHEMO_RESISTANT : 2,
  RADIATION_RESISTANT : 3,
  NULL : 4
}

export const BUTTONTYPE = {
  PAUSE : 0,
  CHEMO : 1,
  RADIATION : 2,
  RESET : 3
}

export const MAX_TUMOR_SIZE = 5000;
export const MAX_CELL_SIZE = 10000;
export const SIM_FONT = 'Berlin Sans FB';
export const CELL_SIZE = 10;

// The rate at which the sim replicates in milliseconds
export const MUTATION_RATE = 8000;


export const MUTATION_MULTIPLIER = 2;
