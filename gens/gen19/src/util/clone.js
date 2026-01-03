export function deepClone(x) {
  return typeof structuredClone !== 'undefined' ? structuredClone(x) : JSON.parse(JSON.stringify(x));
}
