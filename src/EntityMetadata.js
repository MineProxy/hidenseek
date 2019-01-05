module.exports = function EntityMetadata (entityId, name = '§dBlock') {
  return {
    entityId,
    metadata: [
      { key: 0, type: 0, value: 64 },
      { key: 1, type: 1, value: 300 },
      { key: 2, type: 3, value: name },
      { key: 3, type: 6, value: false },
      { key: 4, type: 6, value: false },
      { key: 5, type: 6, value: false },
      { key: 6, type: 0, value: 0 },
      { key: 7, type: 2, value: 4 },
      { key: 8, type: 1, value: 0 },
      { key: 9, type: 6, value: false },
      { key: 10, type: 1, value: 0 },
      { key: 11, type: 0, value: 0 },
      { key: 12, type: 6, value: false }
    ]
  }
}
