import { Block, View, Text } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './logs.scss'
// logs.js
const util = require('../../utils/util.js')

@withWeapp({
  data: {
    logs: [],
  },
  onLoad() {
    this.setData({
      logs: (Taro.getStorageSync('logs') || []).map((log) => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log,
        }
      }),
    })
  },
})
class _C extends React.Component {
  render() {
    const { logs } = this.data
    return (
      <View className="container log-list">
        {logs.map((log, index) => {
          return (
            <Block key={log.timeStamp}>
              <Text className="log-item">{index + 1 + '. ' + log.date}</Text>
            </Block>
          )
        })}
      </View>
    )
  }
}

export default _C
