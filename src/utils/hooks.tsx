import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react'

import { useIntl } from 'umi'
import { Tooltip } from 'antd'

const { document, location }: any = window

export const resizeClientSize = () => {
    const [layout, setLayout] = useState({
        windowHeight: innerHeight,
        windowWidth: innerWidth
    })

    const onResize = useCallback(
        () => {
            setLayout({
                windowHeight: innerHeight,
                windowWidth: innerWidth
            })
        }, []
    )

    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])

    return layout
}

export const useRemoveElementTitle = () => {
    useLayoutEffect(() => {
        document.querySelectorAll('td').forEach((el: any) => el.removeAttribute('title'))
        document.querySelectorAll('label').forEach((el: any) => el.removeAttribute('title'))
        document.querySelectorAll('a').forEach((el: any) => el.removeAttribute('title'))
        document.querySelectorAll('svg title').forEach((el: any) => el.innerHTML = '')
    }, [location.pathname])
}

export const resizeDocumentHeightHook = function (defaultHeight = innerHeight) {
    const [layoutHeight, setLayoutHeight] = useState(defaultHeight)

    const onResizeWindowHeight = () => setLayoutHeight(innerHeight)

    useEffect(() => {
        window.addEventListener('resize', onResizeWindowHeight)
        return () => {
            window.removeEventListener('resize', onResizeWindowHeight)
        }
    }, [])

    return layoutHeight
}

export const writeDocumentTitle = function (title: string) {
    const intl = useIntl()
    document.title = `${intl.messages[title]} - T-One`
}

export const resizeDocumentWidthHooks = function () {
    const [layoutWidth, setLayoutWidth] = useState(innerWidth)
    const onResizeWidth = () => setLayoutWidth(innerWidth)

    useEffect(() => {
        window.addEventListener('resize', onResizeWidth)
        return () => {
            window.removeEventListener('resize', onResizeWidth)
        }
    }, [])

    return layoutWidth
}

type ListProps = {
    name: string,
    id: string
}

export const listRender: React.FC<ListProps> = ({ name, id }) => <Tooltip title={id} placement='top' >{name}</Tooltip>
export const enumer =  ( name:any ) => {
    const list = {
        system:'公共镜像',
        self:'自定义镜像',
        others:'共享镜像'
    }
    return list[name];
}