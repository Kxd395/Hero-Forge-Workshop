import { DATA_SOURCE_STRATEGIES } from "../data/dataSources.js";

export function getDataSourceRoadmap(strategies = DATA_SOURCE_STRATEGIES) {
  return [...strategies].sort((left, right) => left.priority - right.priority);
}

export function getActiveDataSource(strategies = DATA_SOURCE_STRATEGIES) {
  return strategies.find((strategy) => strategy.status === "active");
}

export function validateDataSources(strategies = DATA_SOURCE_STRATEGIES) {
  const ids = new Set();
  const failures = [];

  strategies.forEach((strategy) => {
    if (ids.has(strategy.id)) {
      failures.push(`${strategy.id}: duplicate source id`);
    }
    ids.add(strategy.id);

    if (
      !strategy.name ||
      !strategy.type ||
      !strategy.status ||
      !strategy.endpoint ||
      !strategy.authModel ||
      !strategy.coverage ||
      !strategy.bestFor
    ) {
      failures.push(`${strategy.id}: source must include name, type, status, endpoint, authModel, coverage, and bestFor`);
    }

    if (!Number.isInteger(strategy.priority) || strategy.priority < 1) {
      failures.push(`${strategy.id}: priority must be a positive integer`);
    }

    if (!Array.isArray(strategy.securityNotes) || strategy.securityNotes.length === 0) {
      failures.push(`${strategy.id}: securityNotes must include at least one item`);
    }

    if (!Array.isArray(strategy.implementationNotes) || strategy.implementationNotes.length === 0) {
      failures.push(`${strategy.id}: implementationNotes must include at least one item`);
    }
  });

  return failures;
}
