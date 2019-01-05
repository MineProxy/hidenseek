module.exports = function Team ({ name, uuid }) {
  return {
    team: name,
    mode: 0,
    name: name,
    prefix: '§c',
    suffix: '§r',
    friendlyFire: 3,
    nameTagVisibility: 'always',
    collisionRule: 'always',
    color: 12,
    players: [ uuid ]
  }
}
module.exports.NullTeam = function NullTeam (team) {
  return {
    team,
    mode: 1,
    name: undefined,
    prefix: undefined,
    suffix: undefined,
    friendlyFire: undefined,
    nameTagVisibility: undefined,
    collisionRule: undefined,
    color: undefined,
    players: undefined
  }
}
