import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react'

import { useIntl } from 'umi'
import { Tooltip } from 'antd'

const { document, location }: any = window

export const useDetectZoom = () => {
    const [ratio, setRatio] = useState<any>(1)

    const detectZoom = () => {
        var ratio: number = 0,
            screen: any = window.screen,
            ua: any = navigator.userAgent.toLowerCase();

        if (window.devicePixelRatio !== undefined) {
            ratio = window.devicePixelRatio;
        }
        else if (~ua.indexOf('msie')) {
            if (screen.deviceXDPI && screen.logicalXDPI) {
                ratio = screen.deviceXDPI / screen.logicalXDPI;
            }
        }
        else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
            ratio = window.outerWidth / window.innerWidth;
        }

        if (ratio) {
            ratio = 1.5 / ratio
        }
        console.log(ratio)
        setRatio(ratio)
    }

    useEffect(() => {
        detectZoom()
        window.addEventListener('resize', detectZoom);
        return () => {
            window.removeEventListener('resize', detectZoom);
        }
    }, []);

    return ratio
}

export const useClientSize = () => {
    const [ layout , setLayout ] = useState({ height : innerHeight , width : innerWidth })
    const onResize = useCallback(
        () => {
            setLayout({
                height: innerHeight,
                width: innerWidth
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

export const writeDocumentTitle = function (title: string) {
    const intl = useIntl()
    document.title = `${intl.messages[title]} - T-One`
}

type ListProps = {
    name: string,
    id: string
}

export const listRender: React.FC<ListProps> = ({ name, id }) => <Tooltip title={id} placement='top' >{name}</Tooltip>
export const textRender = (name:any) => {
    return <Tooltip title={name} placement='top'>{name}</Tooltip>
}

export const enumer = (name: any) => {
    const list = {
        system: '公共镜像',
        self: '自定义镜像',
        others: '共享镜像'
    }
    return list[name];
}