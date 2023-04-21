import { assert } from './testUtils'

describe('compiler:codegen', () => {
  test('default', () => {
    assert(`<view/>`, `createElementVNode("view")`)
    assert(
      `<view style="width:100px;height:100px;"/>`,
      `createElementVNode("view", new Map<string,any>([["style", "width:100px;height:100px;"]]))`
    )
    assert(
      `<text>{{msg}}</text>`,
      `createElementVNode("text", null, toDisplayString(_ctx.msg), 1 /* TEXT */)`
    )
    assert(
      `<view v-if="a"></view>`,
      `isTrue(_ctx.a)\n  ? createElementVNode("view", new Map<string,any>([["key", 0]]))\n  : createCommentVNode("v-if", true)`
    )
  })
  test(`function:kotlin`, () => {
    assert(
      `<view/>`,
      `@Suppress("UNUSED_PARAMETER") function PagesIndexIndexRender(_ctx: PagesIndexIndex): VNode | null {\n  return createElementVNode("view")\n}`,
      {
        targetLanguage: 'kotlin',
        mode: 'function',
      }
    )
  })
})
