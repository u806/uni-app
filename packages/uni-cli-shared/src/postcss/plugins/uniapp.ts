import { extend } from '@vue/shared'
import type { Rule, Declaration, Plugin, Root } from 'postcss'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'
import {
  createRpx2Unit,
  defaultRpx2Unit,
  isBuiltInComponent,
  COMPONENT_SELECTOR_PREFIX,
  normalizeStyles,
} from '@dcloudio/uni-shared'

import {
  parsePagesJsonOnce,
  normalizeThemeConfigOnce,
  getPlatformManifestJsonOnce,
} from '../../json'

export interface UniAppCssProcessorOptions {
  unit?: string // 目标单位，默认rem
  unitRatio?: number // 单位转换比例，默认10/320
  unitPrecision?: number // 单位精度，默认5
}

const defaultUniAppCssProcessorOptions = extend({}, defaultRpx2Unit)

const BG_PROPS = [
  'background',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-repeat',
  'background-size',
  'background-attachment',
]

function transform(
  selector: selectorParser.Node,
  state: { bg: boolean },
  { rewriteTag }: TransformOptions
) {
  if (selector.type !== 'tag') {
    return
  }

  const { value } = selector
  selector.value = rewriteTag(value)
  if (value === 'page' && selector.value === 'uni-page-body') {
    state.bg = true
  }
}

function createBodyBackgroundRule(origRule: Rule) {
  const bgDecls: Declaration[] = []
  origRule.walkDecls((decl) => {
    if (BG_PROPS.indexOf(decl.prop) !== -1) {
      bgDecls.push(decl.clone())
    }
  })
  if (bgDecls.length) {
    const { rule } = require('postcss')
    origRule.after(rule({ selector: 'body' }).append(bgDecls))
  }
}

type RewriteTag = (tag: string) => string

interface TransformOptions {
  rewriteTag: RewriteTag
}

function walkRules(options: TransformOptions) {
  return (rule: Rule) => {
    const state = { bg: false }
    rule.selector = selectorParser((selectors) =>
      selectors.walk((selector) => transform(selector, state, options))
    ).processSync(rule.selector)
    state.bg && createBodyBackgroundRule(rule)
  }
}

function walkDecls(rpx2unit: ReturnType<typeof createRpx2Unit>) {
  return (decl: Declaration) => {
    const { value } = decl
    if (value.indexOf('rpx') === -1 && value.indexOf('upx') === -1) {
      return
    }
    decl.value = rpx2unit(decl.value)
  }
}

function darkmodeAtRule(root: Root, platform: UniApp.PLATFORM) {
  const pageJson = parsePagesJsonOnce(process.env.UNI_PLATFORM, platform)
  const filePath = root.source?.input.file || ''
  if (
    process.env.VUE_APP_DARK_MODE === 'true' &&
    filePath.indexOf('App.vue') !== -1
  ) {
    const pageBGC = (pageJson.globalStyle || {}).backgroundColor || ''
    if (pageBGC.indexOf('@') === 0) {
      ;['dark', 'light'].forEach((theme) => {
        const { backgroundColor } = normalizeStyles(
          { backgroundColor: pageBGC },
          normalizeThemeConfigOnce(getPlatformManifestJsonOnce()),
          theme as UniApp.ThemeMode
        )
        if (backgroundColor !== 'undefined') {
          const mediaRoot = postcss.parse(`
            /* #ifndef APP-NVUE*/
            @media (prefers-color-scheme: ${theme}) {
              body,
              uni-page-body {
                background-color: ${backgroundColor};
              }
            }
            /* #endif */
          `)
          root.nodes = [...mediaRoot.nodes, ...root.nodes]
        }
      })
    }
  }
}

const baiduTags: Record<string, string> = {
  navigator: 'nav',
}

function rewriteBaiduTags(tag: string) {
  return baiduTags[tag] || tag
}

function rewriteUniH5Tags(tag: string) {
  if (tag === 'page') {
    return 'uni-page-body'
  }
  if (isBuiltInComponent(tag)) {
    return COMPONENT_SELECTOR_PREFIX + tag
  }
  return tag
}

function rewriteUniAppTags(tag: string) {
  if (tag === 'page') {
    return 'body'
  }
  if (isBuiltInComponent(tag)) {
    return COMPONENT_SELECTOR_PREFIX + tag
  }
  return tag
}

const transforms: Record<string, RewriteTag | undefined> = {
  h5: rewriteUniH5Tags,
  app: rewriteUniAppTags,
  'mp-baidu': rewriteBaiduTags,
}

const uniapp = (opts?: UniAppCssProcessorOptions) => {
  const platform = process.env.UNI_PLATFORM
  const { unit, unitRatio, unitPrecision } = extend(
    {},
    defaultUniAppCssProcessorOptions,
    opts
  )
  const rpx2unit = createRpx2Unit(unit, unitRatio, unitPrecision)
  return {
    postcssPlugin: 'uni-app',
    prepare() {
      return {
        OnceExit(root) {
          root.walkDecls(walkDecls(rpx2unit))
          const rewriteTag = transforms[platform]
          if (['h5', 'app'].includes(platform)) {
            darkmodeAtRule(root, platform)
          }
          if (rewriteTag) {
            root.walkRules(
              walkRules({
                rewriteTag,
              })
            )
          }
        },
      }
    },
  } as Plugin
}
uniapp.postcss = true
export default uniapp
