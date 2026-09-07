type SoundPool = {
  getNext: () => string
}

function shuffleArray(array: string[]): string[] {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export function createSoundPool(paths: string[]): SoundPool {
  if (paths.length === 0) {
    throw new Error('Sound pool requires at least one sound path')
  }

  let queue: string[] = []
  let lastPlayed: string | null = null

  const refillQueue = () => {
    const shuffled = shuffleArray(paths)

    if (
      paths.length > 1 &&
      lastPlayed &&
      shuffled[0] === lastPlayed
    ) {
      const swapIndex = shuffled.findIndex(
        (path) => path !== lastPlayed
      )

      if (swapIndex > 0) {
        ;[shuffled[0], shuffled[swapIndex]] = [
          shuffled[swapIndex],
          shuffled[0],
        ]
      }
    }

    queue = shuffled
  }

  refillQueue()

  return {
    getNext() {
      if (queue.length === 0) {
        refillQueue()
      }

      const nextSound = queue.shift()

      if (!nextSound) {
        return paths[0]
      }

      lastPlayed = nextSound

      return nextSound
    },
  }
}