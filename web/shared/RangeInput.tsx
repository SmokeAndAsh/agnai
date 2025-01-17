import { Component, Show, createSignal, createEffect, createMemo } from 'solid-js'
import type { JSX } from 'solid-js'
import { AIAdapter, PresetAISettings, ThirdPartyFormat } from '../../common/adapters'
import { isValidServiceSetting } from './util'

const RangeInput: Component<{
  label: string
  fieldName: string
  value: number
  helperText?: string | JSX.Element
  min: number
  max: number
  step: number
  disabled?: boolean
  onChange?: (value: number) => void

  service?: AIAdapter
  format?: ThirdPartyFormat
  aiSetting?: keyof PresetAISettings
  parentClass?: string
}> = (props) => {
  const [value, setValue] = createSignal(props.value)
  let input: HTMLInputElement | undefined

  function updateRangeSliders() {
    if (!input) return
    const value = Math.min(+input.value, +input.max)
    const nextSize = ((value - +input.min) * 100) / (+input.max - +input.min) + '% 100%'
    input.style.backgroundSize = nextSize
  }

  const onInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) => {
    setValue(+event.currentTarget.value)
    updateRangeSliders()
    props.onChange?.(+event.currentTarget.value)
  }

  createEffect(updateRangeSliders)

  const hide = createMemo(() => {
    const isValid = isValidServiceSetting(props.service, props.format, props.aiSetting)
    return isValid ? '' : ' hidden'
  })

  return (
    <div class={`relative pt-1 ${hide()} ${props.parentClass || ''}`}>
      <ul class="w-full">
        <div class="flex flex-row gap-2">
          <label class="form-label block-block">{props.label}</label>
        </div>
        <input
          id={props.fieldName}
          name={props.fieldName}
          class="form-field focusable-field float-right inline-block rounded-lg border border-white/5 p-1 hover:border-white/20"
          value={value()}
          type="number"
          min={props.min}
          max={props.max}
          step={props.step}
          onInput={onInput}
          disabled={props.disabled}
        />
      </ul>
      <Show when={props.helperText}>
        <p class="helper-text mt-[-0.125rem] pb-2 text-sm">{props.helperText}</p>
      </Show>
      <input
        ref={input}
        type="range"
        class="
        form-field
        form-range
        h-1
        w-full
        cursor-ew-resize
        appearance-none
        rounded-xl
        text-opacity-50
        accent-[var(--hl-400)]
        focus:shadow-none focus:outline-none focus:ring-0
      "
        min={props.min}
        max={props.max}
        step={props.step}
        onInput={onInput}
        value={value()}
        disabled={props.disabled}
      />
    </div>
  )
}

export default RangeInput
