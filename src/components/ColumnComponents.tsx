
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

    const [ell, setEll] = React.useState(false);
    const [realWidth, setRealWidth] = React.useState<any>();
    const { tooltip } = ellipsis

    React.useEffect(() => {
        const { offsetParent } = ref.current
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

    if (!ellipsis || Object.prototype.toString.call(ellipsis) === "[object Boolean]")
        return <Typography.Text {...props} />

    ellipsis.onEllipsis = () => setEll(true)

    if (!ell)
        return (
            <Typography.Text ref={ref} {...props}  >
                {children || "-"}
            </Typography.Text>
        );

    return (
        <Tooltip
            title={tooltip && Object.prototype.toString.call(tooltip) !== "[object Boolean]" ? tooltip : children}
            placement={placement}
        >
            <TextCls width={realWidth} ellipsis {...rest}  >
                {children || "-"}
            </TextCls>
        </Tooltip>
    )
}