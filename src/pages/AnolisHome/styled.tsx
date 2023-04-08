import styled from "styled-components";
import { Space, Typography } from "antd"
import type { SpaceProps } from "antd"
import React from "react";

export const FullSpace = styled(Space)`
    width: 100%;
`

export const VerticalSpace: React.FC<React.PropsWithChildren<SpaceProps>> = (props) => <FullSpace direction="vertical" {...props} >{props.children}</FullSpace>

export const HomeContainer = styled.div`
    padding: 20px;
    width: 100%;
`

export const Whiteboard = styled(FullSpace)`
    background-color: #fff;
    border-radius: 2px;
    padding: 10px;
`

export const BaseTitle = styled(Typography)`
    font-weight: 500;
    font-size: 16px;
    color: rgba(0,0,0,0.85);
`

type TSpaceProps = {
    direction?: "row" | "column";
    gap?: number | string;
}

const transSpaceGap = (gap?: number | string) => {
    if (Object.prototype.toString.call(gap) === "[object String]") return `gap: ${gap};`
    if (Object.prototype.toString.call(gap) === "[object Number]") return `gap: ${gap}px;`
    return ""
}

export const TSpace = styled.div<TSpaceProps>`
    display: flex;
    flex-direction: ${({ direction }) => direction ?? "row"};
    ${({ gap }) => transSpaceGap(gap)}
`