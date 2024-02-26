import {
  inject,
  onMounted,
  onBeforeUnmount,
  ref,
  nextTick,
  computed,
} from 'vue'
import type { ComputedRef } from 'vue'
import { isHTMlElement } from '../list-view/index'
import type { ListViewItemStatus } from '../list-view/index'
import { UniElement } from '../../helpers/UniElement'
import { defineBuiltInComponent } from '@dcloudio/uni-components'

class UniListItemElement extends UniElement {}
export default /*#__PURE__*/ defineBuiltInComponent({
  name: 'ListItem',
  props: {},
  //#if _X_ && !_NODE_JS_
  rootElement: {
    name: 'uni-list-item',
    class: UniListItemElement,
  },
  //#endif
  setup(props, { slots }) {
    const rootRef = ref<HTMLElement | Node | null>(null)
    const isVertical = inject('__listViewIsVertical') as ComputedRef<boolean>

    const visible = ref(false)

    // let cachedSize = 0
    // let seen = false
    // let vnode: VNode | null = null
    const status: ListViewItemStatus = {
      vnode: null,
      visible,
      cachedSize: 0,
      seen: false,
    }

    const registerItem = inject('__listViewRegisterItem') as Function
    const unregisterItem = inject('__listViewUnregisterItem') as Function
    onMounted(() => {
      registerItem(status)
    })
    onBeforeUnmount(() => {
      unregisterItem(status)
    })
    const realVisible = computed(() => {
      return visible.value || !status.seen
    })
    return () => {
      nextTick(() => {
        const rootNode = rootRef.value! as HTMLElement | Node
        if (realVisible.value && isHTMlElement(rootNode)) {
          status.cachedSize = isVertical
            ? rootNode.clientHeight
            : rootNode.clientWidth
          status.seen = true
        }
      })
      if (!realVisible.value) {
        status.vnode = <></>
        return status.vnode
      }
      status.vnode = (
        <uni-list-item ref={rootRef}>
          {slots.default && slots.default()}
        </uni-list-item>
      )
      return status.vnode
    }
  },
})
