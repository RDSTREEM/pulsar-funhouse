export function calculateAccuracy(input: string, reference: string) {
  let correctChars = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === reference[i]) correctChars++;
  }
  return (correctChars / reference.length) * 100;
}

export function calculateWPM(input: string, timeInSeconds: number) {
  if (timeInSeconds === 0) return 0;
  const words = input.trim().split(/\s+ /).length;
  return (words / timeInSeconds) * 60;
}
