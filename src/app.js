import { Block } from "@tarojs/components";
import React from "react";
import Taro from "@tarojs/taro";
import withWeapp from "@tarojs/with-weapp";
import "./app.scss";

@withWeapp({
  onLaunch() {
    // // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    // 获取系统信息
    Taro.getSystemInfo({
      success: res => {
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        let ratio = 750 / windowWidth;
        let pageWindowHeight = Math.ceil(windowHeight * ratio);
        this.globalData.barPageHeight = pageWindowHeight;
        this.globalData.model = res.model;
        this.globalData.windowWidth = res.windowWidth;
        this.globalData.windowHeight = res.windowHeight;
        this.globalData.screenHeight = res.screenHeight;

        // 获取手机型号
        this.globalData.height = res.statusBarHeight;
        const model = res.model;
        console.log(res, 'res.model');
        const modelInclude = ['iPhone X', 'iPhone XR', 'iPhone XS', 'iPhone XS MAX', 'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max'];
        // 是否X以上机型
        let flag = false;
        for (let i = 0; i < modelInclude.length; i++) {
          // 模糊判断是否是modelInclude 中的机型,因为真机上测试显示的model机型信息比较长无法一一精确匹配
          if (model.indexOf(modelInclude[i]) !== -1) {
            flag = true;
          }
        }
        if (flag) {
          console.log(flag);
          // 如果是这几个机型，设置距离底部的bottom值
          this.globalData.bottom = 68;
        }
      }
    });
    const updateManager = Taro.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate);
    });
    updateManager.onUpdateReady(function () {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，请重启应用',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    });
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经上线，请您删除当前小程序，重新搜索打开'
      });
    });
  },
  globalData: {
    userInfo: null,
    barPageHeight: 0,
    bottom: 0,
    finishdata: {}
  }
}, true)
class App extends React.Component {
  render() {
    return this.props.children;
  }

} // app.js


export default App;