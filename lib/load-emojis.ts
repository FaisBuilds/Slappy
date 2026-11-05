export type EmojiManifest = {
  generatedAt?: string
  emojis: string[]
}

export async function loadEmojiManifest(): Promise<string[]> {
  const response = await fetch('emojis/manifest.json', {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(
      `Failed to load emojis/manifest.json (${response.status})`
    )
  }

  const data = (await response.json()) as EmojiManifest

  if (!Array.isArray(data.emojis)) {
    throw new Error('Invalid emoji manifest: missing emojis array')
  }

  return data.emojis
    .filter((path) => typeof path === 'string')
    .filter((path) => path.toLowerCase().endsWith('.png'))
}
