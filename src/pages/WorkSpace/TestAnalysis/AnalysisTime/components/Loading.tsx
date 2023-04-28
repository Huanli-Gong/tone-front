import { Spin } from "antd"
import React from "react"
import styled from "styled-components"

const LoadingCls = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 999;
    background-color: #fff;
    display: flex;
    justify-content: center;
    padding-top: 220px;
`

const LoadingComp: React.FC = () => (
    <LoadingCls>
        <Spin />
    </LoadingCls>
)

export default LoadingComp