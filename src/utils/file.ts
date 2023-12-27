export const isFile = (path: string) => {
  // check file contain \
  if (/\//.test(path)) {
    const file = path.split('/').slice(-1)[0];
    if (file.includes('.')) {
      return true;
    }
  }

  return path.includes('.');
};
