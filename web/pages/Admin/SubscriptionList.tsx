import { A, useNavigate } from '@solidjs/router'
import { Copy, Plus, Trash } from 'lucide-solid'
import { Component, createSignal, For, onMount } from 'solid-js'
import Button from '../../shared/Button'
import { ConfirmModal } from '../../shared/Modal'
import PageHeader from '../../shared/PageHeader'
import { presetStore } from '../../store'
import { setComponentPageTitle } from '../../shared/util'
import { getServiceName, sortByLabel } from '/web/shared/adapter'

const SubscriptionList: Component = () => {
  setComponentPageTitle('Subscriptions')
  const nav = useNavigate()
  const state = presetStore((s) => ({
    subs: s.subs
      .map((pre) => ({ ...pre, label: `[${getServiceName(pre.service)}] ${pre.name}` }))
      .sort(sortByLabel),
  }))

  const [deleting, setDeleting] = createSignal<string>()

  const deletePreset = () => {
    const presetId = deleting()
    if (!presetId) return

    presetStore.deletePreset(presetId, () => nav('/admin/subscriptions'))
    setDeleting()
  }

  onMount(() => {
    presetStore.getSubscriptions()
  })

  return (
    <>
      <PageHeader title="Subscription Presets" />
      <div class="mb-4 flex w-full justify-end">
        <A href="/admin/subscriptions/new">
          <Button>
            <Plus />
            New Subscription
          </Button>
        </A>
      </div>

      <div class="flex flex-col items-center gap-2">
        <For each={state.subs}>
          {(sub) => (
            <div class="flex w-full items-center gap-2">
              <A
                href={`/admin/subscriptions/${sub._id}`}
                class="bg-800 flex h-12 w-full gap-2 rounded-xl hover:bg-[var(--bg-600)]"
              >
                <div class="ml-4 flex w-full items-center">
                  <div>
                    <span class="mr-1 text-xs italic text-[var(--text-600)]">
                      {getServiceName(sub.service)}
                    </span>
                    {sub.name}
                  </div>
                </div>
              </A>
              <Button
                schema="clear"
                size="sm"
                onClick={() => nav(`/admin/subscriptions/new?preset=${sub._id}`)}
                class="icon-button"
              >
                <Copy />
              </Button>
              <Button
                schema="clear"
                size="sm"
                onClick={() => setDeleting(sub._id)}
                class="icon-button"
              >
                <Trash />
              </Button>
            </div>
          )}
        </For>
      </div>

      <ConfirmModal
        show={!!deleting()}
        close={() => setDeleting()}
        confirm={deletePreset}
        message="Are you sure you wish to delete this preset?"
      />
    </>
  )
}

export default SubscriptionList
