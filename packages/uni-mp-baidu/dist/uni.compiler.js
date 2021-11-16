'use strict';

var initMiniProgramPlugin = require('@dcloudio/uni-mp-vite');
var path = require('path');
var uniCliShared = require('@dcloudio/uni-cli-shared');
var uniMpCompiler = require('@dcloudio/uni-mp-compiler');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var initMiniProgramPlugin__default = /*#__PURE__*/_interopDefaultLegacy(initMiniProgramPlugin);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

var appid = "";
var host = "baiduboxapp";
var projectname = "";
var setting = {
	autoAudits: false,
	urlCheck: false
};
var source = {
	appid: appid,
	"compilation-args": {
	common: {
		babelSetting: {
			ignore: [
			]
		},
		enhance: true,
		ignorePrefixCss: false
	},
	selected: -3
},
	host: host,
	projectname: projectname,
	setting: setting
};

const transformFor = (node, context) => {
    if (!uniMpCompiler.isForElementNode(node)) {
        return;
    }
    const { vFor, props } = node;
    let sourceCode = vFor.valueAlias + ' in ' + vFor.sourceAlias;
    const keyProp = uniMpCompiler.findProp(node, 'key', true);
    if (keyProp) {
        const { exp } = keyProp;
        if (exp) {
            const key = uniMpCompiler.rewriteExpression(exp, context).content;
            sourceCode = sourceCode + ' trackBy ' + key;
            props.splice(props.indexOf(keyProp), 1);
        }
    }
    vFor.valueAlias = '';
    vFor.sourceCode = sourceCode;
};

/**
 * 百度小程序的自定义组件，不支持动态事件绑定
 */
const transformOn = uniCliShared.createTransformOn(uniMpCompiler.transformOn);

/**
 * 百度小程序的自定义组件，不支持动态事件绑定，故 v-model 也需要调整
 */
const transformModel = uniCliShared.createTransformModel(uniMpCompiler.transformModel);

const customElements = ['follow-swan', 'login', 'inline-payment-panel'];
const nodeTransforms = [uniCliShared.transformRef, transformFor, uniCliShared.transformMatchMedia];
const directiveTransforms = {
    on: transformOn,
    model: transformModel,
};
const miniProgram = {
    class: {
        array: true,
    },
    slot: {
        fallbackContent: true,
        // https://github.com/baidu/san/discussions/601
        dynamicSlotNames: false,
    },
    directive: 's-',
};
const compilerOptions = {
    nodeTransforms,
    directiveTransforms,
};
const projectConfigFilename = 'project.swan.json';
const options = {
    vite: {
        inject: {
            uni: [path__default["default"].resolve(__dirname, 'uni.api.esm.js'), 'default'],
        },
        alias: {
            'uni-mp-runtime': path__default["default"].resolve(__dirname, 'uni.mp.esm.js'),
        },
        copyOptions: {
            assets: ['swancomponents'],
        },
    },
    global: 'swan',
    app: {
        darkmode: false,
        subpackages: true,
    },
    project: {
        filename: projectConfigFilename,
        source,
    },
    template: Object.assign(Object.assign({}, miniProgram), { customElements, filter: {
            extname: '.sjs',
            lang: 'sjs',
            generate(filter, filename) {
                if (filename) {
                    return `<import-sjs src="${filename}.sjs" module="${filter.name}"/>`;
                }
                return `<import-sjs module="${filter.name}">
  ${filter.code}
  </import-sjs>`;
            },
        }, extname: '.swan', compilerOptions }),
    style: {
        extname: '.css',
    },
};

const uniMiniProgramBaiduPlugin = {
    name: 'vite:uni-mp-baidu',
    config() {
        return {
            define: {
                __VUE_CREATED_DEFERRED__: false,
            },
        };
    },
};
var index = [uniMiniProgramBaiduPlugin, ...initMiniProgramPlugin__default["default"](options)];

module.exports = index;
