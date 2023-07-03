/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var CALL_METHOD_ERROR,__assign=function(){return __assign=Object.assign||function(t){for(var s,i=1,n=arguments.length;i<n;i++)for(var p in s=arguments[i])Object.prototype.hasOwnProperty.call(s,p)&&(t[p]=s[p]);return t},__assign.apply(this,arguments)},hasOwnProperty=Object.prototype.hasOwnProperty,isUndef=function(v){return null==v},isArray=Array.isArray,PATH_RE=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;function getPaths(path,data){if(isArray(path))return path;if(data&&(val=data,key=path,hasOwnProperty.call(val,key)))return[path];var val,key,res=[];return path.replace(PATH_RE,(function(match,p1,offset,string){return res.push(offset?string.replace(/\\(\\)?/g,"$1"):p1||match),string})),res}function getPageId(page){return page.__wxWebviewId__?page.__wxWebviewId__:page.privateProperties?page.privateProperties.slaveId:page.$page?page.$page.id:void 0}function getPagePath(page){return page.route||page.uri}function getPageQuery(page){return page.options||page.$page&&page.$page.options||{}}function parsePage(page){return{id:getPageId(page),path:getPagePath(page),query:getPageQuery(page)}}function getPageVm(id){var page=function(id){return getCurrentPages().find((function(page){return getPageId(page)===id}))}(id);return page&&page.$vm}function findComponentVm(vm,nodeId){var res;return vm&&(!function(vm,nodeId){return vm.$scope&&((scope=vm.$scope).__wxExparserNodeId__||scope.nodeId||scope.id)===nodeId;var scope}(vm,nodeId)?vm.$children.find((function(child){return res=findComponentVm(child,nodeId)})):res=vm),res}function getComponentVm(pageId,nodeId){var pageVm=getPageVm(pageId);return pageVm&&findComponentVm(pageVm,nodeId)}function getData(vm,path){var data;return vm&&(data=path?function(data,path){var dataPath,paths=getPaths(path,data);for(dataPath=paths.shift();!isUndef(dataPath);){if(null==(data=data[dataPath]))return;dataPath=paths.shift()}return data}(vm.$data,path):Object.assign({},vm.$data)),Promise.resolve({data:data})}function setData(vm,data){return vm&&Object.keys(data).forEach((function(name){vm[name]=data[name]})),Promise.resolve()}function callMethod(vm,method,args){return new Promise((function(resolve,reject){if(!vm)return reject(CALL_METHOD_ERROR.VM_NOT_EXISTS);if(!vm[method])return reject(CALL_METHOD_ERROR.METHOD_NOT_EXISTS);var obj,ret=vm[method].apply(vm,args);!(obj=ret)||"object"!=typeof obj&&"function"!=typeof obj||"function"!=typeof obj.then?resolve({result:ret}):ret.then((function(res){resolve({result:res})}))}))}!function(CALL_METHOD_ERROR){CALL_METHOD_ERROR.VM_NOT_EXISTS="VM_NOT_EXISTS",CALL_METHOD_ERROR.METHOD_NOT_EXISTS="METHOD_NOT_EXISTS"}(CALL_METHOD_ERROR||(CALL_METHOD_ERROR={}));var SYNC_APIS=["stopRecord","getRecorderManager","pauseVoice","stopVoice","pauseBackgroundAudio","stopBackgroundAudio","getBackgroundAudioManager","createAudioContext","createInnerAudioContext","createVideoContext","createCameraContext","createMapContext","canIUse","startAccelerometer","stopAccelerometer","startCompass","stopCompass","hideToast","hideLoading","showNavigationBarLoading","hideNavigationBarLoading","navigateBack","createAnimation","pageScrollTo","createSelectorQuery","createCanvasContext","createContext","drawCanvas","hideKeyboard","stopPullDownRefresh","arrayBufferToBase64","base64ToArrayBuffer"],onApisEventMap=new Map,ON_APIS=["onCompassChange","onThemeChange","onUserCaptureScreen","onWindowResize","onMemoryWarning","onAccelerometerChange","onKeyboardHeightChange","onNetworkStatusChange","onPushMessage","onLocationChange","onGetWifiList","onWifiConnected","onWifiConnectedWithPartialInfo"],originUni={},SYNC_API_RE=/^\$|Sync$|Window$|WindowStyle$|sendHostEvent|sendNativeEvent|restoreGlobal|requireGlobal|getCurrentSubNVue|getMenuButtonBoundingClientRect|^report|interceptors|Interceptor$|getSubNVueById|requireNativePlugin|upx2px|hideKeyboard|canIUse|^create|Sync$|Manager$|base64ToArrayBuffer|arrayBufferToBase64|getLocale|setLocale|invokePushCallback|getWindowInfo|getDeviceInfo|getAppBaseInfo|getSystemSetting|getAppAuthorizeSetting|initUTS|requireUTS|registerUTS/,MOCK_API_BLACKLIST_RE=/^on|^off/;function isSyncApi(method){return SYNC_API_RE.test(method)||-1!==SYNC_APIS.indexOf(method)}var App$1={getPageStack:function(){return Promise.resolve({pageStack:getCurrentPages().map((function(page){return parsePage(page)}))})},getCurrentPage:function(){var pages=getCurrentPages(),len=pages.length;return new Promise((function(resolve,reject){len?resolve(parsePage(pages[len-1])):reject(Error("getCurrentPages().length=0"))}))},callUniMethod:function(params){var method=params.method,args=params.args;return new Promise((function(resolve,reject){if(ON_APIS.includes(method)){onApisEventMap.has(method)||onApisEventMap.set(method,new Map);var uuid_1=args[0],callback=function(res){send({id:uuid_1,result:__assign({method:method},res)})};return onApisEventMap.get(method).set(uuid_1,callback),uni[method](callback),resolve({result:null})}if(method.startsWith("off")&&ON_APIS.includes(method.replace("off","on"))){var onMethod=method.replace("off","on");if(onApisEventMap.has(onMethod)){var uuid=args[0];if(void 0!==uuid){callback=onApisEventMap.get(onMethod).get(uuid);uni[method](callback),onApisEventMap.get(onMethod).delete(uuid)}else{onApisEventMap.get(onMethod).forEach((function(callback){uni[method](callback)})),onApisEventMap.delete(onMethod)}}return resolve({result:null})}if(!uni[method])return reject(Error("uni."+method+" not exists"));if(isSyncApi(method))return resolve({result:uni[method].apply(uni,args)});var params=[Object.assign({},args[0]||{},{success:function(result){setTimeout((function(){resolve({result:result})}),"pageScrollTo"===method?350:0)},fail:function(res){reject(Error(res.errMsg.replace(method+":fail ","")))}})];uni[method].apply(uni,params)}))},mockUniMethod:function(params){var method=params.method;if(!uni[method])throw Error("uni."+method+" not exists");if(!function(method){return!MOCK_API_BLACKLIST_RE.test(method)}(method))throw Error("You can't mock uni."+method);var mockFn,result=params.result,functionDeclaration=params.functionDeclaration;return isUndef(result)&&isUndef(functionDeclaration)?(originUni[method]&&(uni[method]=originUni[method],delete originUni[method]),Promise.resolve()):(mockFn=isUndef(functionDeclaration)?isSyncApi(method)?function(){return result}:function(params){setTimeout((function(){result.errMsg&&-1!==result.errMsg.indexOf(":fail")?params.fail&&params.fail(result):params.success&&params.success(result),params.complete&&params.complete(result)}),4)}:function(){for(var args=[],_i=0;_i<arguments.length;_i++)args[_i]=arguments[_i];return new Function("return "+functionDeclaration)().apply(mockFn,args.concat(params.args))},mockFn.origin=originUni[method]||uni[method],originUni[method]||(originUni[method]=uni[method]),uni[method]=mockFn,Promise.resolve())},captureScreenshot:function(params){return new Promise((function(resolve,reject){var pages=getCurrentPages(),len=pages.length;if(len){var page=pages[len-1];if(page){var webview=page.$getAppWebview(),bitmap_1=new plus.nativeObj.Bitmap("captureScreenshot","captureScreenshot.png");webview.draw(bitmap_1,(function(res){var data=bitmap_1.toBase64Data().replace("data:image/png;base64,","");bitmap_1.clear(),resolve({data:data})}),(function(err){reject(Error("captureScreenshot fail: "+err.message))}),{wholeContent:!!params.fullPage})}}else reject(Error("getCurrentPage fail."))}))}},Page$1={getData:function(params){return getData(getPageVm(params.pageId),params.path)},setData:function(params){return setData(getPageVm(params.pageId),params.data)},callMethod:function(params){var _a,err=((_a={})[CALL_METHOD_ERROR.VM_NOT_EXISTS]="Page["+params.pageId+"] not exists",_a[CALL_METHOD_ERROR.METHOD_NOT_EXISTS]="page."+params.method+" not exists",_a);return new Promise((function(resolve,reject){callMethod(getPageVm(params.pageId),params.method,params.args).then((function(res){return resolve(res)})).catch((function(type){reject(Error(err[type]))}))}))},callMethodWithCallback:function(params){var _a,err=((_a={})[CALL_METHOD_ERROR.VM_NOT_EXISTS]="callMethodWithCallback:fail, Page["+params.pageId+"] not exists",_a[CALL_METHOD_ERROR.METHOD_NOT_EXISTS]="callMethodWithCallback:fail, page."+params.method+" not exists",_a),callback=params.args[params.args.length-1];callMethod(getPageVm(params.pageId),params.method,params.args).catch((function(type){callback({errMsg:err[type]})}))}};function getNodeId(params){return params.nodeId||params.elementId}var Element$1={getData:function(params){return getData(getComponentVm(params.pageId,getNodeId(params)),params.path)},setData:function(params){return setData(getComponentVm(params.pageId,getNodeId(params)),params.data)},callMethod:function(params){var _a,nodeId=getNodeId(params),err=((_a={})[CALL_METHOD_ERROR.VM_NOT_EXISTS]="Component["+params.pageId+":"+nodeId+"] not exists",_a[CALL_METHOD_ERROR.METHOD_NOT_EXISTS]="component."+params.method+" not exists",_a);return new Promise((function(resolve,reject){callMethod(getComponentVm(params.pageId,nodeId),params.method,params.args).then((function(res){return resolve(res)})).catch((function(type){reject(Error(err[type]))}))}))}},Api={};Object.keys(App$1).forEach((function(method){Api["App."+method]=App$1[method]})),Object.keys(Page$1).forEach((function(method){Api["Page."+method]=Page$1[method]})),Object.keys(Element$1).forEach((function(method){Api["Element."+method]=Element$1[method]}));var socketTask,wsEndpoint=process.env.UNI_AUTOMATOR_WS_ENDPOINT;function send(data){socketTask.send({data:JSON.stringify(data)})}function onMessage(res){var _a=JSON.parse(res.data),id=_a.id,method=_a.method,params=_a.params,data={id:id},fn=Api[method];if(!fn&&!fn)return data.error={message:method+" unimplemented"},send(data);try{if("Page.callMethodWithCallback"===method){params.args=params.args||[];return params.args.push((function(result){null!==result&&(data.result=result),send(data)})),void fn(params)}fn(params).then((function(res){res&&(data.result=res)})).catch((function(err){data.error={message:err.message}})).finally((function(){send(data)}))}catch(err){data.error={message:err.message},send(data)}}wx.$$initRuntimeAutomator=function(options){void 0===options&&(options={}),(socketTask=uni.connectSocket({url:wsEndpoint,complete:function(){}})).onMessage(onMessage),socketTask.onOpen((function(res){options.success&&options.success(),console.log("已开启自动化测试...")})),socketTask.onError((function(res){console.log("automator.onError",res)})),socketTask.onClose((function(){options.fail&&options.fail({errMsg:"$$initRuntimeAutomator:fail"}),console.log("automator.onClose")}))},setTimeout((function(){wx.$$initRuntimeAutomator()}),500);export{send};
