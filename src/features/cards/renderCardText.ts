export function renderCardText(text: string, names: string[]): string {
  let index = 0
  return text.replace(/\{player\}/g, () => names[index++] ?? '{player}')
}
