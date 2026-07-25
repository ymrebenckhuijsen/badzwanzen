import type { Player } from './features/players/types'
import { PlayerSetupScreen } from './features/players/PlayerSetupScreen'

function App() {
  function handleStartGame(players: Player[]) {
    console.log('Starting game with players:', players)
  }

  return <PlayerSetupScreen onStartGame={handleStartGame} />
}

export default App
