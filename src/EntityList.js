const mcData = require('minecraft-data')('1.12')
const Entity = require('./Entity')
const EntityMetadata = require('./EntityMetadata')
const Team = require('./Team')

class EntityList extends Array {
  constructor (client) {
    super()
    this.client = client
  }

  has (id) {
    return this.some(entity => entity.id === id)
  }

  add (data) {
    if (this.has(data.entityId)) return
    this.push({
      id: data.entityId,
      block: mcData.blocks[data.intField] ? mcData.blocks[data.intField].displayName : 'unknown',
      x: data.x,
      y: data.y,
      z: data.z,
      waypoint: this.spawnWaypoint(data)
    })
  }

  get (id) {
    return this.find(entity => entity.id === id)
  }

  handleRelativeMove (data) {
    if (!this.has(data.entityId)) return
    const entity = this.get(data.entityId)
    entity.x += data.dX / (128 * 32)
    entity.y += data.dY / (128 * 32)
    entity.z += data.dZ / (128 * 32)
    this.client.write('rel_entity_move', { ...data, entityId: entity.waypoint.id, dY: data.dY + 2 })
  }

  handleTeleport (data) {
    if (!this.has(data.entityId)) return
    if (data.x === 0 && Math.ceil(data.y) === -1000 && data.z === 0) return this.remove(data.entityId)
    if (data.y < 0) return this.remove(data.entityId)
    const entity = this.get(data.entityId)
    entity.x = data.x
    entity.y = data.y
    entity.z = data.z
    this.client.write('entity_teleport', { ...data, entityId: entity.waypoint.id, y: data.y + 2 })
  }

  remove (id) {
    if (!this.has(id)) return
    this.despawnWaypoint(this.get(id))
    this.splice(this.findIndex(entity => entity.id === id), 1)
  }

  clear () {
    this.forEach(entity => this.despawnWaypoint(entity))
    this.splice(0, this.length)
  }

  format () {
    return this.map(entity =>
      `EntityID: ${entity.id} [${entity.waypoint.id}], block: ${entity.block}; ${entity.x} ${entity.y} ${entity.z}`
      // `EntityID: ${entity.id}, block: ${entity.block}; ${entity.x} ${entity.y} ${entity.z}`
    ).join('\n')
  }

  spawnWaypoint (data) {
    const { x, y, z } = data
    const entity = Entity({ x, y: y + 2, z, type: 93 })
    const meta = EntityMetadata(entity.entityId, 'Entity' + data.entityId)
    this.client.write('spawn_entity_living', { ...entity, metadata: meta.metadata })
    this.client.write('entity_metadata', meta)
    this.client.write('teams', Team({ name: `Entity${entity.entityId}`, uuid: entity.entityUUID }))
    return { id: entity.entityId }
  }

  despawnWaypoint (entity) {
    console.log('despawning waypoint of ' + JSON.stringify(entity))
    const { waypoint: { id } } = entity
    this.client.write('entity_destroy', { entityIds: [ id ] })
    this.client.write('teams', Team.NullTeam(`Entity${entity.entityId}`))
  }
}

module.exports = EntityList
