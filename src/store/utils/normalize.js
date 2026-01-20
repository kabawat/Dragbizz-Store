export const normalizeArray = (array, idKey = 'id') => {
  if (!Array.isArray(array)) return { byId: {}, allIds: [] };
  
  return array.reduce(
    (acc, item) => {
      const id = item[idKey] || item._id;
      if (id) {
        acc.byId[id] = item;
        acc.allIds.push(id);
      }
      return acc;
    },
    { byId: {}, allIds: [] }
  );
};

export const denormalizeArray = (normalized) => {
  if (!normalized || !normalized.byId || !normalized.allIds) {
    return [];
  }
  return normalized.allIds.map((id) => normalized.byId[id]).filter(Boolean);
};

export const updateNormalizedItem = (normalized, id, updates) => {
  if (!normalized.byId[id]) return normalized;
  
  return {
    ...normalized,
    byId: {
      ...normalized.byId,
      [id]: {
        ...normalized.byId[id],
        ...updates,
      },
    },
  };
};

export const addNormalizedItem = (normalized, item, idKey = 'id') => {
  const id = item[idKey] || item._id;
  if (!id) return normalized;
  
  if (normalized.byId[id]) {
    return updateNormalizedItem(normalized, id, item);
  }
  
  return {
    byId: {
      ...normalized.byId,
      [id]: item,
    },
    allIds: [...normalized.allIds, id],
  };
};

export const removeNormalizedItem = (normalized, id) => {
  if (!normalized.byId[id]) return normalized;
  
  const { [id]: removed, ...byId } = normalized.byId;
  return {
    byId,
    allIds: normalized.allIds.filter((itemId) => itemId !== id),
  };
};

