export function* pairs(obj) {
  const keys = Object.keys(obj);
  while (keys.length > 0) {
    const k = keys.splice(0, 1)[0];
    yield [k, obj[k]];
  }
}
