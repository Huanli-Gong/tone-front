import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react'
import { ReactComponent as IconLink } from '@/assets/svg/Report/IconLink.svg';
import { useIntl, useParams } from 'umi'
import { Tooltip, message } from 'antd'
import Clipboard from 'clipboard'

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
    const [layout, setLayout] = useState({ height: innerHeight, width: innerWidth })
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

type ResultProps = {
    job_id: string | number,
    style?: React.CSSProperties;
    ws_id?: string;
}

export const listRender: React.FC<ListProps> = ({ name, id }) => <Tooltip title={id} placement='topLeft' >{name}</Tooltip>
export const textRender = (name: any) => {
    return <Tooltip title={name} placement='topLeft'>{name}</Tooltip>
}

export const enumer = (name: any) => {
    const list = {
        system: '公共镜像',
        self: '自定义镜像',
        others: '共享镜像'
    }
    return list[name];
}

export const getTextByJs = (obj: any) => {
    let str = "";
    let len = Object.keys(obj).length
    Object.keys(obj).map((k: any, i: number) => {
        if (i === len - 1) {
            str += `${k}=${obj[k]}`
        } else {
            str += `${k}=${obj[k]}\n`
        }
    })
    return str;
}

export const JumpResult: React.FC<ResultProps> = ({ job_id, style, ws_id }) => {
    const { ws_id: wsid } = useParams() as any

    const id = ws_id || wsid
    if (job_id && id) {
        return (
            <a
                style={{ cursor: 'pointer', ...style }}
                href={`/ws/${ws_id || wsid}/test_result/${job_id}`}
                target="_blank"
            >
                {<IconLink style={{ width: 9, height: 9 }} />}
            </a>
        )
    }
    return <></>
}


export const useCopyText = (successText: string) => (text: string) => {
    const ele = document.createElement("a")
    ele.style.height = "0px"
    ele.style.width = "0px"
    ele.innerHTML = ""
    ele.id = "currentCopyLinkEle"
    document.body.appendChild(ele)
    const cb = new Clipboard(ele, {
        text: () => text
    })

    cb.on('success', function (e) {
        message.success(successText)
    })
    ele.click()
    cb.destroy()
}