import { Block, View, OpenData, Button, Image, Text } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'
// index.js
// 获取应用实例
const app = Taro.getApp()

@withWeapp({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: Taro.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData:
      Taro.canIUse('open-data.type.userAvatarUrl') &&
      Taro.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    Taro.navigateTo({
      url: '../logs/logs',
    })
  },
  onLoad() {
    if (Taro.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    Taro.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
      },
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    })
  },
})
class _C extends React.Component {
  render() {
    const {
      canIUseOpenData,
      hasUserInfo,
      canIUseGetUserProfile,
      canIUse,
      userInfo,
      motto,
    } = this.data
    return (
      <View className="container">
        <View className="userinfo">
          {canIUseOpenData ? (
            <Block>
              <View className="userinfo-avatar" onClick={this.bindViewTap}>
                <OpenData type="userAvatarUrl"></OpenData>
              </View>
              <OpenData type="userNickName"></OpenData>
            </Block>
          ) : !hasUserInfo ? (
            <Block>
              {canIUseGetUserProfile ? (
                <Button onClick={this.getUserProfile}>获取头像昵称</Button>
              ) : canIUse ? (
                <Button openType="getUserInfo" onGetuserinfo={this.getUserInfo}>
                  获取头像昵称
                </Button>
              ) : (
                <View>请使用1.4.4及以上版本基础库</View>
              )}
            </Block>
          ) : (
            <Block>
              <Image
                onClick={this.bindViewTap}
                className="userinfo-avatar"
                src={userInfo.avatarUrl}
                mode="cover"
              ></Image>
              <Text className="userinfo-nickname">{userInfo.nickName}</Text>
            </Block>
          )}
        </View>
        <View className="usermotto">
          <Text className="user-motto">{motto}</Text>
        </View>
      </View>
    )
  }
}

export default _C
