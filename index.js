const { EntityList } = require('./src')
const entityPackets = ['spawn_entity', 'entity_destroy', 'rel_entity_move', 'entity_move_look', 'entity_teleport', 'named_entity_spawn']

module.exports = {
  name: 'hidenseek',
  defaultConfig: {},
  init: proxy => {
    const entities = {}
    const glowingEntities = {}
    let isDisabled = false
    const refresh = () => {
      proxy.display.setContent(Object.entries(entities).map(([username, entities]) => `${username}:\n${entities.format()}`).join('\n'))
      proxy.display.screen.render()
    }
    const chat = (client, message) => client.write('chat', { message: `{"extra":[""],"text":"${message}"}`, position: 0 })
    proxy.register('login', client => {
      entities[client.username] = new EntityList(client)
      glowingEntities[client.username] = []
    })
    proxy.register('serverPacket', (meta, data, client, server) => {
      const glowingClientEntities = glowingEntities[client.username]
      if (meta.name === 'entity_metadata' && data.metadata.some(el => el.key === 0)) {
        const property = data.metadata.find(el => el.key === 0)
        const glowingEntity = glowingClientEntities.find(entity => data.entityId === entity.id)
        if (glowingEntity) {
          glowingEntity.value = property.value
        } else {
          glowingClientEntities.push({ id: data.entityId, value: property.value })
        }
        if (!isDisabled) {
          let index = data.metadata.indexOf(property)
          data.metadata[index].value += 64
        }
      }
      if (isDisabled) return true
      const clientEntities = entities[client.username]
      if (meta.name === 'spawn_entity' && data.type === 70) clientEntities.add(data)
      if (meta.name === 'named_entity_spawn' && clientEntities.has(data.entityId)) clientEntities.remove(data.entityId)
      if (meta.name === 'rel_entity_move' || meta.name === 'entity_move_look') clientEntities.handleRelativeMove(data)
      if (meta.name === 'entity_teleport') clientEntities.handleTeleport(data)
      if (entityPackets.includes(meta.name) && clientEntities.has(data.entityId)) refresh()
      return true
    })
    proxy.register('command', (command, args, client, server) => {
      if (command === 're') {
        if (!args.length) return chat(client, 'Entity ID(s) not given!') || false
        args.split(' ').map(Number).filter(id => !Number.isNaN(id)).forEach(id => {
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
      if (command === 'hns') {
        isDisabled = !isDisabled
        glowingEntities[client.username].forEach(entity => {
          client.write('entity_metadata', {
            entityId: entity.id,
            metadata: [
              { key: 0, type: 0, value: entity.value + (isDisabled ? 0 : 64) }
            ]
          })
        })
        chat(client, `${isDisabled ? 'Disabled' : 'Enabled'} Hide'n'Seek plugin!`)
        return false
      }
      return true
    })
    proxy.log(`Hide'n'Seek plugin: enabled`)
  }
}
