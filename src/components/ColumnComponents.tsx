
import React from 'react'
import { Typography, Tooltip } from "antd"
import styled from 'styled-components'

type StyleProps = {
    width?: string | number
}

const TextCls = styled(Typography.Text) <StyleProps>`
    ${({ width }) => width ? ("width: " + width + "px") : ""}
`;

export const ColumnEllipsisText: React.FC<AnyType> = (props) => {
    const { ellipsis, children = "-", placement = "topLeft", ...rest } = props

    const ref = React.useRef<any>()
    const textRef = React.useRef<any>()

    const [open, setOpen] = React.useState(false)
    const [show, setShow] = React.useState(false)
    const [realWidth, setRealWidth] = React.useState<any>();
    const { tooltip } = ellipsis

    React.useEffect(() => {
        const { offsetParent } = ref.current
        if (!offsetParent) return
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect) {
                    const { width } = entry.contentRect
                    setRealWidth(width)
                }
            }
        });
        resizeObserver.observe(offsetParent);
        return () => {
            resizeObserver.unobserve(offsetParent)
        }
    }, [])

    React.useEffect(() => {
        if (!textRef.current) return
        const { scrollWidth, clientWidth } = textRef.current
        setShow(clientWidth < scrollWidth)
    }, [realWidth])

    const handleMouseOver = () => {
        if (show) setOpen(true)
    }

    const handleMouseLeave = () => {
        setOpen(false)
    }

    if (!ellipsis || Object.prototype.toString.call(ellipsis) === "[object Boolean]")
        return <Typography.Text {...props} />

    return (
        <div
            ref={ref}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
        >
            <Tooltip
                title={tooltip && Object.prototype.toString.call(tooltip) !== "[object Boolean]" ? tooltip : children}
                placement={placement}
                open={open}
                overlayInnerStyle={{ whiteSpace: 'break-spaces' }}
            >
                <TextCls
                    width={realWidth}
                    ellipsis
                    {...rest}
                    ref={textRef}
                >
                    {children || "-"}
                </TextCls>
            </Tooltip>
        </div>
    )
}