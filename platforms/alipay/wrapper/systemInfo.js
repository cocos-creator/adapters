const systemInfo = require('../common/engine3d/globalAdapter/BaseSystemInfo');
let adaptSysFunc = systemInfo.adaptSys;

Object.assign(systemInfo, {
    // Extend adaptSys interface
    adaptSys (sys) {
        adaptSysFunc.call(this, sys);
        sys.platform = sys.ALIPAY_MINI_GAME;
    }
});

__globalAdapter.init = systemInfo.init;
__globalAdapter.adaptSys = systemInfo.adaptSys;