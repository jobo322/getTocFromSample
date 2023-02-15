import { Molecule } from "openchemlib/full";
import { rangeFromSignal } from "nmr-processing";

export function getToc(sample) {
  const {
    $content: { general, spectra, identifier },
  } = sample;

  let { smiles } = general;
  const { name = [], ocl, mv, mf, molfile } = general;

  const result = {
    meta: {},
  };

  if (!smiles) {
    const molecule = Molecule.fromMolfile(molfile);
    smiles = molecule.toSmiles();
  }

  maybeAdd(result, "smiles", smiles);
  maybeAdd(result, "names", name.map(ensureFlatString));
  maybeAdd(result, "ocl", ocl);

  maybeAdd(result.meta, "mv", mv);
  maybeAdd(result.meta, "mf", mf);
  maybeAdd(result.meta, "descriptor", identifier);
  // maybeAdd(result.meta, 'description', description);

  const toc = [];
  for (const spectrum of spectra.nmr || []) {
    if (spectrum.isFid) continue;
    if (spectrum.dimension > 1) continue;
    const { nucleus, frequency, solvent, temperature, experiment, jcamp } =
      spectrum;
    const newSpectrum = { ...result };

    maybeAdd(newSpectrum, "solvent", solvent);
    maybeAdd(
      newSpectrum,
      "nucleus",
      nucleus && Array.isArray(nucleus) ? nucleus[0] : nucleus
    );
    newSpectrum.ranges = ensureFromToRange(
      (spectrum.range || []).map(ensurePlural),
      { frequency, nucleus: newSpectrum.nucleus }
    );

    const meta = result.meta;
    maybeAdd(meta, "frequency", frequency);
    maybeAdd(meta, "experiment", experiment);
    maybeAdd(meta, "temperature", temperature);

    if (jcamp && jcamp.filename) {
      newSpectrum.jcampURL = jcamp.filename;
    }
    toc.push(newSpectrum);
  }
  return toc;
}

function maybeAdd(target, name, value) {
  if (value) {
    target[name] = value;
  }
}

function ensurePlural(range) {
  const { signal, signals, ...resRange } = range;
  const newSignals = [];

  for (const s of signal || signals || []) {
    const { j, js, ...resSignal } = s;
    newSignals.push({
      js: j || js || [],
      ...resSignal,
    });
  }
  return {
    signals: newSignals,
    ...resRange,
  };
}

function ensureFlatString(name) {
  if (typeof name === "string") return name;
  if (typeof name === "object") {
    let newName = Object.values(name).filter(
      (value) => typeof value === "string"
    );
    return newName.join("_");
  }
  return name;
}

function ensureFromToRange(ranges, options) {
  for (let i = 0; i < ranges.length; i++) {
    const { signals = [], from, to } = ranges[i];
    if (from === undefined && to === undefined) {
      const newRange = rangeFromSignal(signals[0] || {}, options);
      ranges[i] = { ...ranges[i], ...newRange };
    }
    for (let j = 0; j < signals.length; j++) {
      const { delta } = signals[j];
      if (delta === undefined) {
        const { from, to } = ranges[i];
        signals[j].delta = (to - from) / 2;
      }
    }
    const { integral, ...resRange } = ranges[i];
    if (integral) {
      ranges[i] = { integration: integral, ...resRange };
    }
  }
  return ranges;
}
