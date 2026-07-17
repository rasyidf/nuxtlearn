import type { Peer } from 'crossws'

const peers = new Set<Peer>()

export default defineWebSocketHandler({
  open(peer) {
    peers.add(peer)
    peer.send(JSON.stringify({ type: 'system', message: `Connected! ${peers.size} online` }))
  },
  message(peer, message) {
    const text = message.text()
    for (const p of peers) {
      if (p !== peer) {
        p.send(JSON.stringify({ type: 'message', from: peer.id?.slice(0, 6), text }))
      }
    }
  },
  close(peer) {
    peers.delete(peer)
  },
})
