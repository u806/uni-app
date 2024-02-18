/// <reference types="@dcloudio/uni-app-x/types/native-global" />
import { defineBuiltInComponent } from '@dcloudio/uni-components'
import {
  UniProgressElement,
  progressProps,
  UniProgressActiveendEvent,
} from './model'
import { _style } from './style'
import {
  computed,
  reactive,
  onMounted,
  onUnmounted,
  watch,
  getCurrentInstance,
  camelize,
} from 'vue'

export default /*#__PURE__*/ defineBuiltInComponent({
  name: 'Progress',
  rootElement: {
    name: 'uni-progress-element',
    // @ts-expect-error not web element
    class: UniProgressElement,
  },
  emit: ['activeend'],
  props: progressProps,
  setup(props, { emit, slots }) {
    // data
    const data = reactive({
      $uniProgressElement: null as null | UniProgressElement,
      curPercent: 0,
      _timerId: 0,
      _lastPercent: 0,
    })
    const textStr = `${data.curPercent}%`

    const instance = getCurrentInstance()

    const styleUniProgress = computed(() => _style['uni-progress'])
    const styleUniProgressBar = computed(() => _style['uni-progress-bar'])
    // const styleUniProgressInfo = computed(() => _style['uni-progress-info'])

    const barStyle = computed(() => {
      const style = {
        height: `${props.strokeWidth}px`,
        borderRadius: `${props.borderRadius}px`,
        backgroundColor: props.backgroundColor,
      }
      return Object.assign({}, styleUniProgressBar.value[''], style)
    })

    const innerBarStyle = computed(() => {
      const style = {
        width: `${data.curPercent}%`,
        height: `${props.strokeWidth}px`,
        backgroundColor: `${props.activeColor}`,
      }
      return Object.assign({}, style)
    })
    const textStyle = computed(() => {
      const fontSize = props.fontSize
      const style = {
        fontSize: `${fontSize}px`,
        minWidth: `${fontSize * 2}px`,
      }

      return Object.assign({}, style)
    })

    const finalPercent = computed((): number => {
      let percent = props.percent
      if (percent > 100) percent = 100
      if (percent < 0) percent = 0
      return percent
    })

    watch(
      () => finalPercent.value,
      (_, oldVal) => {
        data._lastPercent = oldVal
        clearTimer()
        _animate()
      }
    )

    const _animate = () => {
      let percent = finalPercent.value
      if (!props.active) {
        data.curPercent = percent
        return
      }
      data.curPercent = props.activeMode === 'forwards' ? data._lastPercent : 0
      data._timerId = setInterval(() => {
        if (percent <= data.curPercent + 1) {
          clearTimer()
          data.curPercent = percent
          emit('activeend', new UniProgressActiveendEvent(percent))
        } else {
          ++data.curPercent
        }
      }, props.duration) as unknown as number
    }

    const clearTimer = () => {
      clearInterval(data._timerId)
    }

    onMounted(() => {
      instance?.$waitNativeRender(() => {
        if (!instance) return
        data.$uniProgressElement = instance.proxy?.$el as UniProgressElement
        data.$uniProgressElement!._getAttribute = (
          key: string
        ): string | null => {
          const keyString = camelize(key) as keyof typeof props
          return props[keyString] !== null
            ? props[keyString]?.toString() ?? null
            : null
        }
        //  this._animate()
      })
    })
    onUnmounted(() => {
      clearTimer()
    })
    // onUnload(() => {})

    return () => {
      return (
        <uni-progress-element class="uni-progress" style={styleUniProgress}>
          <view class="uni-progress-bar" style={barStyle.value}>
            <view
              class="uni-progress-inner-bar"
              style={innerBarStyle.value}
            ></view>
          </view>
          <text
            v-if="showInfo"
            class="uni-progress-info"
            style={textStyle.value}
          >
            {textStr}
          </text>
        </uni-progress-element>
      )
    }
  },
})
