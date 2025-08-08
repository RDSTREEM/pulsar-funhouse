export function generateMathQuestion(difficulty = 'easy') {
  let ops, maxNum

  switch (difficulty) {
    case 'easy':
      ops = ['+', '-']
      maxNum = 20
      break
    case 'medium':
      ops = ['+', '-', '*']
      maxNum = 50
      break
    case 'hard':
      ops = ['+', '-', '*', '/']
      maxNum = 100
      break
    default:
      ops = ['+', '-']
      maxNum = 20
  }

  const op = ops[Math.floor(Math.random() * ops.length)]
  const a = Math.floor(Math.random() * maxNum) + 1
  let b = Math.floor(Math.random() * maxNum) + 1

  if (op === '/') b = b === 0 ? 1 : b

  const question = `${a} ${op} ${b}`
  let answer

  try {
    answer = eval(question)
  } catch {
    answer = 0
  }

  if (op === '/') {
    answer = (a / b).toFixed(2)
  } else {
    answer = answer.toString()
  }

  return { question, answer }
}
