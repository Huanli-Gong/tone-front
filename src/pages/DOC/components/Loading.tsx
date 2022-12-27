import React from 'react'
import styled from 'styled-components'
import { Spin } from 'antd'

const LoadingWrapper = styled.div`
    width : 100%;
    height:100%;
    display: flex;
    justify-content: center;
    align-items: center;
`

const LoadingContainer = styled.div`
    position: absolute;
    background-color: #fff;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
`

const Loading: React.FC<{ loading: boolean }> = ({ loading }) => {
    if (loading)
        return (
            <LoadingContainer>
                <LoadingWrapper>
                    <Spin spinning={loading} />
                </LoadingWrapper>
            </LoadingContainer>
        )
    return <></>
}

export default Loading