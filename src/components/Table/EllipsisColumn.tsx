import React from 'react'
import { Tooltip } from 'antd'
import type { TooltipProps } from 'antd'
import type { ColumnProps } from 'antd/es/table'
import styled from 'styled-components'

type StyledProps = {
    width?: string | number
}

const ColumnSpan = styled.span<StyledProps>`
    max-width: 100%;
    overflow: hidden;
    display:inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${({ width }) => width ? 'width:' + width + 'px;' : null}
`

type IProps = {} & TooltipProps & ColumnProps<string>

const EllipsisColumn: React.FC<IProps> = (props) => {
    const { children } = props
    const dom = React.useRef(null)

    const [tigger, setTigger] = React.useState(false)
    const [parentNode, setParentNode] = React.useState<HTMLElement | null>(null)

    React.useEffect(() => {
        if (dom.current) {
            const { clientWidth, scrollWidth, offsetParent } = dom.current
            setParentNode(offsetParent)
            setTigger(clientWidth < scrollWidth)
        }
    }, [props])

    if (tigger)
        return (
            <Tooltip {...props}>
                <ColumnSpan width={parentNode?.clientWidth} ref={dom} >
                    {children}
                </ColumnSpan>
            </Tooltip>
        )

    return (
        <ColumnSpan width={parentNode?.clientWidth} ref={dom}>
            {children}
        </ColumnSpan>
    )
}

export default React.memo(EllipsisColumn)