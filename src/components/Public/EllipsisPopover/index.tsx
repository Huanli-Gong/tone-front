import React, { useEffect, useRef, useState } from 'react';
import { Popover } from 'antd';
import styled from 'styled-components';

const TextWarp = styled.div`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`
interface EllipsisProps {
    title: string,
    children?: React.ReactNode,
    style?: any,
    width?: number,
    color?:string,
    placement?: any,
}

const EllipsisPopover: React.FC<EllipsisProps> = (props) => {
    const { title, children, width, color, placement='topLeft', style, ...rest } = props
    const ellipsis = useRef<any>(null)
    const [show, setShow] = useState<boolean>(false)

    useEffect(() => {
        setEllipsis();
    }, [title])

    const setEllipsis = () => {
        const clientWidth = ellipsis?.current?.clientWidth
        const scrollWidth = ellipsis?.current?.scrollWidth
        setShow(clientWidth < scrollWidth)
    }
    const TypographyDiv = (
        <TextWarp ref={ellipsis} style={{ width, color, ...style }} {...rest}>
            {children || title || '-'}
        </TextWarp>
    )

    return (
        show ?
            <Popover content={title} placement={placement} overlayStyle={{ wordBreak: 'break-all' }}>
                 {TypographyDiv}
            </Popover> : TypographyDiv
    )
}
export default EllipsisPopover;