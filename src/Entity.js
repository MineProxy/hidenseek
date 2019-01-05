const uuid = require('uuid/v4')

module.exports = function Entity ({ x, y, z, type }) {
  const UUID = uuid()
  return {
    entityId: Math.floor(Math.random() * 10000),
    entityUUID: UUID,
    objectUUID: UUID,
    type,
    x,
    y,
    z,
    pitch: 7,
    yaw: 126,
    intField: 1,
    velocityX: 0,
    velocityY: 0,
    velocityZ: 0
  }
}
