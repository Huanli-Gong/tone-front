import React, { useState, useCallback } from 'react';
import { queryMsgNum } from '@/services/Workspace'

export default function () {
  const [msgNum, setMsgNum] = useState<any>({})
  // 获取消息数量
  const getMsgNum = async () => {
    const data = await queryMsgNum()
    if (data.code === 200) {
      setMsgNum(data.data)
    }
  }

  const increment = useCallback(() => getMsgNum(), []);

  return { msgNum, increment };
}