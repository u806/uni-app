import { initGetProvider, MPComponentInstance } from '@dcloudio/uni-mp-core'
import { mocks } from '../runtime/parseOptions'

export const getProvider = initGetProvider({
  oauth: ['weixin'],
  share: ['weixin'],
  payment: ['wxpay'],
  push: ['weixin'],
})

function initComponentMocks(
  component:
    | WechatMiniprogram.Component.TrivialInstance
    | WechatMiniprogram.Page.TrivialInstance
) {
  const res: MPComponentInstance = Object.create(null)
  mocks.forEach((name) => {
    res[name] = component[name]
  })
  return res
}
/**
 * 微信小程序内部会 Object.keys(vm)，导致告警
 * Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.
 * @returns
 */
export function createSelectorQuery() {
  const query = wx.createSelectorQuery()
  const oldIn = query.in
  query.in = function newIn(component) {
    return oldIn.call(this, initComponentMocks(component))
  }
  return query
}