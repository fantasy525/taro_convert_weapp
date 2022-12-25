import { Block, View, OpenData, Button, Image, Text } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './index.scss'
import { a } from '@/config/config'
// index.js
// 获取应用实例
const app = Taro.getApp()


class _C extends React.Component {
  render() {
    console.log(a)
    return (
      <View className="container">
      </View>
    )
  }
}

export default _C
