import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import styled from 'styled-components';

const TextWarp = styled.div`
overflow:hidden;
text-overflow:ellipsis;
display:-webkit-box;
-webkit-box-orient: vertical;
// -webkit-line-clamp: 2; 
`

interface EllipsisProps {
    title: string,
    children?: React.ReactNode,
    style?: any,
    height?: number,
    color?:string,
    lineClamp?: number,
}

const EllipsisPulic: React.FC<EllipsisProps> = (props) => {
    const { title, children, height, color, lineClamp = 2, style, ...rest } = props
    const ellipsis = useRef<any>(null)
    const [show, setShow] = useState<boolean>(false)

    useEffect(() => {
        setEllipsis();
    }, [title])

    const setEllipsis = () => {
        const clientHeight = ellipsis?.current?.clientHeight
        const scrollHeight = ellipsis?.current?.scrollHeight
        const flag = clientHeight < scrollHeight
        setShow(flag)
    }

    const TypographyDiv = (
        <TextWarp ref={ellipsis} style={{ height, color, WebkitLineClamp: lineClamp, ...style }} {...rest}>
            { children || title || '-' }
        </TextWarp>
    )

    return (
        show ?
            <Tooltip title={title} placement="top" overlayStyle={{ wordBreak: 'break-all' }}>
                {TypographyDiv}
            </Tooltip> : TypographyDiv
    )
}
export default EllipsisPulic;