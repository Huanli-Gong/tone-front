import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import styled from 'styled-components';
import { useClientSize } from '@/utils/hooks';

const TextWarp = styled.div`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`
interface EllipsisProps {
    title: string,
    children?: React.ReactNode,
    style?: any,
    width?: number | string,
    color?: string,
    placement?: any,
}

const EllipsisPulic: React.FC<EllipsisProps> = (props) => {
    const { title, children, width, color, placement = 'topLeft', style, ...rest } = props
    const ellipsis = useRef<any>(null)
    const [show, setShow] = useState<boolean>(false)
    const { width: innerWidth } = useClientSize()

    const setEllipsis = () => {
        const clientWidth = ellipsis?.current?.clientWidth
        const scrollWidth = ellipsis?.current?.scrollWidth
        setShow(clientWidth < scrollWidth)
    }

    useEffect(() => {
        setEllipsis();
    }, [title, innerWidth])

    const TypographyDiv = (
        <TextWarp ref={ellipsis} style={{ width, color, ...style }} {...rest}>
            {children || title || '-'}
        </TextWarp>
    )

    return (
        show ?
            <Tooltip title={title} placement={placement} overlayStyle={{ wordBreak: 'break-all' }}>
                {TypographyDiv}
            </Tooltip> : TypographyDiv
    )
}
export default EllipsisPulic;