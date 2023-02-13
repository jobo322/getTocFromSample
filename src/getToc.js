export function getToc(sample) {
  const {
    $content: { general, spectra, identifier },
  } = sample;

  const { name, smiles, description, ocl, mv, mf } = general;

  const result = {
    meta: {},
  };

  maybeAdd(result, 'smiles', smiles);
  maybeAdd(result, 'names', name);
  maybeAdd(result, 'ocl', ocl);

  maybeAdd(result.meta, 'mv', mv);
  maybeAdd(result.meta, 'mf', mf);
  maybeAdd(result.meta, 'descriptor', identifier);
  maybeAdd(result.meta, 'description', description);

  const toc = [];
  for (const spectrum of spectra.nmr || []) {
    if (spectrum.isFid) continue;
    if (spectrum.dimension > 1) continue;
    const { nucleus, frequency, solvent, temperature, experiment, jcamp } =
      spectrum;
    const newSpectrum = { ...result};

    maybeAdd(newSpectrum, 'solvent', solvent);
    maybeAdd(
      newSpectrum,
      'nucleus',
      nucleus && Array.isArray(nucleus) ? nucleus[0] : nucleus,
    );
    newSpectrum.range = spectrum.range || [];

    const meta = result.meta;
    maybeAdd(meta, 'frequency', frequency);
    maybeAdd(meta, 'experiment', experiment)
    maybeAdd(meta, 'temperature', temperature);

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
