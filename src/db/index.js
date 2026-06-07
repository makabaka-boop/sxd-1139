import { openDB } from 'idb'

const DB_NAME = 'event-registration-db'
const DB_VERSION = 1

export const STORES = {
  REGISTRATIONS: 'registrations',
  DRAFTS: 'drafts',
  ACTIVITIES: 'activities',
  FIELD_CONFIGS: 'fieldConfigs'
}

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.REGISTRATIONS)) {
        const store = db.createObjectStore(STORES.REGISTRATIONS, {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('phone', 'phone', { unique: false })
        store.createIndex('email', 'email', { unique: false })
        store.createIndex('activityBatch', 'activityBatch', { unique: false })
        store.createIndex('feeStatus', 'feeStatus', { unique: false })
        store.createIndex('groupPreference', 'groupPreference', { unique: false })
        store.createIndex('reviewStatus', 'reviewStatus', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
        const store = db.createObjectStore(STORES.DRAFTS, {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('phone', 'phone', { unique: false })
        store.createIndex('email', 'email', { unique: false })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.ACTIVITIES)) {
        const store = db.createObjectStore(STORES.ACTIVITIES, {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('batch', 'batch', { unique: true })
      }

      if (!db.objectStoreNames.contains(STORES.FIELD_CONFIGS)) {
        const store = db.createObjectStore(STORES.FIELD_CONFIGS, {
          keyPath: 'id',
          autoIncrement: true
        })
      }
    }
  })
}

export async function getDB() {
  if (!window._dbInstance) {
    window._dbInstance = await initDB()
  }
  return window._dbInstance
}

export async function getAllRegistrations() {
  const db = await getDB()
  return db.getAll(STORES.REGISTRATIONS)
}

export async function getRegistrationById(id) {
  const db = await getDB()
  return db.get(STORES.REGISTRATIONS, id)
}

export async function addRegistration(data) {
  const db = await getDB()
  const now = new Date().toISOString()
  const record = {
    ...data,
    createdAt: now,
    updatedAt: now
  }
  return db.add(STORES.REGISTRATIONS, record)
}

export async function updateRegistration(id, data) {
  const db = await getDB()
  const existing = await db.get(STORES.REGISTRATIONS, id)
  if (!existing) return null
  
  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString()
  }
  await db.put(STORES.REGISTRATIONS, updated)
  return updated
}

export async function deleteRegistration(id) {
  const db = await getDB()
  return db.delete(STORES.REGISTRATIONS, id)
}

export async function findDuplicateRegistrations(phone, email) {
  const db = await getDB()
  const results = []
  
  if (phone) {
    const tx = db.transaction(STORES.REGISTRATIONS, 'readonly')
    const index = tx.store.index('phone')
    for await (const cursor of index.iterate(phone)) {
      results.push(cursor.value)
    }
  }
  
  if (email) {
    const tx = db.transaction(STORES.REGISTRATIONS, 'readonly')
    const index = tx.store.index('email')
    for await (const cursor of index.iterate(email)) {
      if (!results.find(r => r.id === cursor.value.id)) {
        results.push(cursor.value)
      }
    }
  }
  
  return results
}

export async function getAllDrafts() {
  const db = await getDB()
  return db.getAll(STORES.DRAFTS)
}

export async function getDraftById(id) {
  const db = await getDB()
  return db.get(STORES.DRAFTS, id)
}

export async function saveDraft(data) {
  const db = await getDB()
  const now = new Date().toISOString()
  
  if (data.id) {
    const existing = await db.get(STORES.DRAFTS, data.id)
    if (existing) {
      const updated = {
        ...existing,
        ...data,
        updatedAt: now
      }
      await db.put(STORES.DRAFTS, updated)
      return updated
    }
  }
  
  const record = { ...data }
  delete record.id
  record.createdAt = now
  record.updatedAt = now
  const id = await db.add(STORES.DRAFTS, record)
  return { ...record, id }
}

export async function deleteDraft(id) {
  const db = await getDB()
  return db.delete(STORES.DRAFTS, id)
}

export async function findDraftsByContact(phone, email) {
  const db = await getDB()
  const results = []
  
  if (phone) {
    const tx = db.transaction(STORES.DRAFTS, 'readonly')
    const index = tx.store.index('phone')
    for await (const cursor of index.iterate(phone)) {
      results.push(cursor.value)
    }
  }
  
  if (email) {
    const tx = db.transaction(STORES.DRAFTS, 'readonly')
    const index = tx.store.index('email')
    for await (const cursor of index.iterate(email)) {
      if (!results.find(r => r.id === cursor.value.id)) {
        results.push(cursor.value)
      }
    }
  }
  
  return results
}

export async function getAllActivities() {
  const db = await getDB()
  return db.getAll(STORES.ACTIVITIES)
}

export async function addActivity(activity) {
  const db = await getDB()
  return db.add(STORES.ACTIVITIES, activity)
}

export async function getFieldConfigs() {
  const db = await getDB()
  return db.getAll(STORES.FIELD_CONFIGS)
}

export async function saveFieldConfig(config) {
  const db = await getDB()
  if (config.id) {
    return db.put(STORES.FIELD_CONFIGS, config)
  }
  return db.add(STORES.FIELD_CONFIGS, config)
}

export function mergeRegistrationData(existing, newData) {
  const merged = { ...existing }
  
  for (const key in newData) {
    if (newData[key] !== undefined && newData[key] !== null && newData[key] !== '') {
      if (key === 'remarks' && existing.remarks) {
        merged.remarks = existing.remarks + '\n\n' + newData.remarks
      } else if (key === 'contactHistory' && Array.isArray(existing.contactHistory)) {
        merged.contactHistory = [...existing.contactHistory, ...(newData.contactHistory || [])]
      } else if (existing[key] === undefined || existing[key] === null || existing[key] === '') {
        merged[key] = newData[key]
      }
    }
  }
  
  return merged
}
