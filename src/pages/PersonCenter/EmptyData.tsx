import React , { useEffect } from 'react'
import { Empty } from 'antd'
let td:any = null
export default ({layoutHeight}: any) => {
    useEffect(()=>{
        td = document.querySelector('#content .ant-empty-normal')
        if(!td) return
        const number = (layoutHeight - 270 - 40 - 70)/2
        td.style.transform = `translateY(${number}px)`

    },[])
    useEffect(()=>{
        if(!td) return
        const number = (layoutHeight - 270 - 40 - 70)/2
        td.style.transform = `translateY(${number}px)`
    },[layoutHeight])
    return(
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    )
}