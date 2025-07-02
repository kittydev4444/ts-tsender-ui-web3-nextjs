export function calculateTotal(input: string): number {
  // Replace all newlines (\n) and commas (,) with spaces
  const normalized = input.replace(/[\n,]/g, " ")

  const numbers = normalized
    .split(/\s+/) // Split the string by any whitespace (spaces, tabs, newlines)
    .filter(Boolean) // Remove any empty strings from the result
    .map(Number) // Convert each string into a number
    .filter((n) => Number.isFinite(n)) // Remove NaN, Infinity, or -Infinity values

  // Add up all valid numbers
  return numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  )
}
