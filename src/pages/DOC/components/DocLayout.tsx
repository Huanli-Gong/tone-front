import React from 'react'
import { useClientSize } from '@/utils/hooks'
import styled from 'styled-components'
import { Row } from 'antd'

const Container = styled(Row) <{ height: number }>`
    width: 100%;
    height: ${({ height }) => height ? height + 'px' : '100%'};
    display: flex;
    flex-direction: column;
`

const DocLayout: React.FC = ({ children }) => {
    const { height } = useClientSize()

    return (
        <Container height={height - 50}>
            {children}
        </Container>
    )
}

export default DocLayout