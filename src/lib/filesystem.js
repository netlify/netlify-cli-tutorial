export function lookup(files, cwd, path = '') {
  const segments = path.split('/').filter((s) => s);
  const startingDir = cwd ? lookup(files, '', cwd) : files;
  return segments.reduce(((dir, segment) => dir && dir[segment]), startingDir);
}
