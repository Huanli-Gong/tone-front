import React from "react"
import DorpdownMenu from "./DropdownMenu"
import { ReactComponent as TextColor } from "../assets/text-color.svg"
import { ReactComponent as RightOutline } from "../assets/right.svg"

import { colors } from "../utils"
import styled from "styled-components"

const TextColorWrapper = styled.div`
    background-color: #fff;
    border-radius: 8px;
    margin: 0;
    width: 232px;
    box-shadow: 0 8px 16px 4px rgb(0 0 0 / 4%);
    z-index: 100;
    overflow: hidden;
    bottom: 0;
    position: absolute;
    left: 0;
    transform: translateY(100%);
`

const ColorContrl = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 8px;
    gap: 4px;
`

const ColorItem = styled.span<{ bg: string }>`
    display: inline-block;
    width: 18px;
    height: 18px;
    background-color: ${({ bg }) => bg ?? ""};
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    svg {
        fill: #fff;
    }

    &:hover {
        border: 1px solid #D8DAD9;
        box-shadow: 0 1px 2px rgb(0 0 0 / 12%);
    }
`

const DefaultColorItem = styled.div`
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 8px;

    &:hover {
        background-color: #F4F5F5;
    }
`

const ColorSvgWrapper = styled.div<{ color: any }>`
    display: flex;
    color: ${({ color }) => color ?? ""};
    & svg:first-child path {
        fill: ${({ color }) => color ?? ""};
    }
`

const TextColorMenu: React.FC<Record<string, any>> = ({ editor }) => {
    if (!editor) return <></>
    let color = "rgb(38, 38, 38)"

    for (const x of colors) {
        if (editor.isActive("textStyle", { color: x })) {
            color = x
            break;
        }
    }

    return (
        <DorpdownMenu
            menu={
                <TextColorWrapper>
                    <DefaultColorItem
                        onClick={() => editor.chain().focus().setColor("rgb(38, 38, 38)").run()}
                    >
                        <ColorItem bg={"rgb(38, 38, 38)"} />
                        <span>默认</span>
                    </DefaultColorItem>
                    <ColorContrl>
                        <>
                            {
                                colors.map((i: string) => (
                                    <ColorItem
                                        key={i}
                                        bg={i}
                                        onClick={() => editor.chain().focus().setColor(i).run()}
                                    >
                                        {
                                            editor.isActive('textStyle', { color: i }) &&
                                            <RightOutline style={{ fill: "rgb(140, 140, 140)" }} />
                                        }
                                    </ColorItem>
                                ))
                            }
                        </>
                    </ColorContrl>
                </TextColorWrapper>
            }
        >
            <ColorSvgWrapper color={color}>
                <TextColor />
            </ColorSvgWrapper>
        </DorpdownMenu>
    )
}

export default TextColorMenu