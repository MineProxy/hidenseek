const { EntityList } = require('./src')
const entityPackets = ['spawn_entity', 'entity_destroy', 'rel_entity_move', 'entity_move_look', 'entity_teleport']

module.exports = {
  name: 'hidenseek',
  defaultConfig: {},
  init: proxy => {
    const entities = {}
    const refresh = () => {
      process.stdout.write('\x1Bc')
      Object.entries(entities).forEach(([username, entities]) => {
        console.log(username)
        console.log(entities.format())
      })
    }
    const chat = (client, message) => client.write('chat', { message: `{"extra":[""],"text":"${message}"}`, position: 0 })
    proxy.register('login', client => {
      entities[client.username] = new EntityList(client)
    })
    proxy.register('serverPacket', (meta, data, client, server) => {
      const clientEntities = entities[client.username]
      if (meta.name === 'spawn_entity' && data.type === 70) clientEntities.add(data)
      if (meta.name === 'named_entity_spawn' && clientEntities.has(data.entityId)) clientEntities.remove(data.entityId)
      if (meta.name === 'rel_entity_move' || meta.name === 'entity_move_look') clientEntities.handleRelativeMove(data)
      if (meta.name === 'entity_teleport') clientEntities.handleTeleport(data)
      if (meta.name === 'entity_metadata' && data.metadata.some(el => el.key === 0)) {
        let index = data.metadata.findIndex(el => el.key === 0)
        data.metadata[index].value += 64
      }
      if (entityPackets.includes(meta.name) && clientEntities.has(data.entityId)) refresh()
      return true
    })
    proxy.register('command', (command, args, client, server) => {
      if (command === 're') {
        if (!args.length) return chat(client, 'Entity ID(s) not given!') || false
        args.map(Number).filter(id => !Number.isNaN(id)).forEach(id => {
          entities[client.username].remove(id)
          chat(client, 'Removed entity ' + id)
          refresh()
        })
        return false
      }
      if (command === 'ce') {
        entities[client.username].clear()
        chat(client, 'Cleared entity list')
        refresh()
        return false
      }
      return true
    })
    console.log(`Hide'n'Seek plugin: enabled`)
  }
}
