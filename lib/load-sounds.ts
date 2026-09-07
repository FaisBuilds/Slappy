export type SoundManifest = {
  generatedAt?: string
  sounds: string[]
}

export async function loadSoundManifest(): Promise<string[]> {
  const response = await fetch('sounds/manifest.json', {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(
      `Failed to load sounds/manifest.json (${response.status})`
    )
  }

  const data = (await response.json()) as SoundManifest

  if (!Array.isArray(data.sounds)) {
    throw new Error('Invalid sound manifest: missing sounds array')
  }

  return data.sounds
    .map((p) => p.toLowerCase())
    .filter((p) => p.endsWith('.mp3'))
}
