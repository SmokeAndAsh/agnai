import { v4 } from 'uuid'
import { db } from './client'
import { AppSchema } from '../../common/types/schema'

export async function updateGenSetting(chatId: string, props: AppSchema.Chat['genSettings']) {
  await db('chat').updateOne({ _id: chatId }, { $set: { genSettings: props, genPreset: '' } })
}

export async function updateGenPreset(chatId: string, preset: string) {
  await db('chat').updateOne(
    { _id: chatId },
    { $set: { genSettings: null as any, genPreset: preset } }
  )
}

export async function createUserPreset(userId: string, settings: AppSchema.GenSettings) {
  const preset: AppSchema.UserGenPreset = {
    _id: v4(),
    kind: 'gen-setting',
    userId,
    ...settings,
  }

  await db('gen-setting').insertOne(preset)
  return preset
}

export async function deleteUserPreset(presetId: string) {
  await db('gen-setting').deleteOne({ _id: presetId })
  return
}

export async function getUserPresets(userId: string) {
  const presets = await db('gen-setting').find({ userId }).toArray()
  return presets
}

export async function updateUserPreset(
  userId: string,
  presetId: string,
  update: AppSchema.GenSettings
) {
  if (update.registered) {
    const prev = await getUserPreset(presetId)
    update.registered = {
      ...prev?.registered,
      ...update.registered,
    }
  }

  await db('gen-setting').updateOne({ _id: presetId, userId }, { $set: update })
  const updated = await db('gen-setting').findOne({ _id: presetId })
  return updated
}

export async function getUserPreset(presetId: string) {
  const preset = await db('gen-setting').findOne({ _id: presetId })
  return preset
}

const subCache = new Map<string, AppSchema.SubscriptionPreset>()

export async function getSubscriptions() {
  const subs = await db('subscription-setting')
    .find({ deletedAt: { $exists: false } })
    .toArray()
  return subs
}

export async function getSubscription(id: string) {
  const sub = await db('subscription-setting').findOne({ _id: id })
  return sub
}

export async function createSubscription(settings: Partial<AppSchema.SubscriptionPreset>) {
  const preset = {
    _id: v4(),
    kind: 'subscription-setting',
    ...settings,
  } as AppSchema.SubscriptionPreset

  subCache.set(preset._id, preset)
  await db('subscription-setting').insertOne(preset)
  return preset
}

export async function updateSubscription(
  id: string,
  update: Partial<AppSchema.SubscriptionPreset>
) {
  await db('subscription-setting').updateOne({ _id: id }, { $set: update }, { upsert: false })
  const preset = await db('subscription-setting').findOne({ _id: id })

  if (preset) {
    subCache.set(preset._id, preset)
  }
  return preset
}

export async function deleteSubscription(id: string) {
  await db('subscription-setting').updateOne(
    { _id: id },
    { $set: { deletedAt: new Date().toISOString() } }
  )
  subCache.delete(id)
}

export function getCachedSubscriptions(user?: AppSchema.User): AppSchema.Subscription[] {
  const subs = Array.from(subCache.values())
    .map((sub) => ({
      _id: sub._id,
      name: sub.name,
      level: sub.subLevel,
      service: sub.service!,
    }))
    .filter((sub) => {
      if (!user?.sub) return false
      return user.sub.level >= sub.level
    })
  return subs
}

let prepared = false
export async function prepSubscriptionCache() {
  if (prepared) return
  prepared = true
  const presets = await getSubscriptions()
  for (const preset of presets) {
    subCache.set(preset._id, preset)
  }
}
