


import React from "react"
import cls from "classnames"

import { DropdownWrapper } from "../styled"

import { ReactComponent as TextLeft } from "../assets/text-left.svg"
import { ReactComponent as TextRight } from "../assets/text-right.svg"
import { ReactComponent as TextCenter } from "../assets/text-center.svg"
import { ReactComponent as TextJustify } from "../assets/text-justify.svg"

import DropdownMenu from "./DropdownMenu"
import styled from "styled-components"

const TextAlignIconItem = styled.span`
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 5px;
    .is-active {
        background-color: #BEC0BF;
    }
    &:hover {
        background-color: #BEC0BF;
    }
`

const TextAlignWrapper = styled.div`
    ${DropdownWrapper}
    padding: 4px 8px;
    display: flex;
    flex-wrap: nowrap;
`

const getTextAlignIcon = (align: string) => new Map([
    ["left", <TextLeft key={"left"} />],
    ["right", <TextRight key={"right"} />],
    ["center", <TextCenter key={"center"} />],
    ["justify", <TextJustify key={"justify"} />],
]).get(align)

const aligns = ['left', 'center', 'right', 'justify']
const TextMenu: React.FC<Record<string, any>> = ({ editor }) => {
    if (!editor) return <></>
    let active = "left"

    for (const x of aligns) {
        if (editor.isActive({ "textAlign": x })) {
            active = x
            break;
        }
    }

    return (
        <DropdownMenu
            title="对齐方式"
            menu={
                <TextAlignWrapper >
                    {
                        aligns.map((i: string) => (
                            <TextAlignIconItem
                                key={i}
                                className={
                                    cls(
                                        editor.isActive({ textAlign: i }) && 'is-active'
                                    )
                                }
                                onClick={
                                    () => editor.chain().focus().setTextAlign(i).run()
                                }
                            >
                                {getTextAlignIcon(i)}
                            </TextAlignIconItem>
                        ))
                    }
                </TextAlignWrapper>
            }
        >
            {
                getTextAlignIcon(active)
            }
        </DropdownMenu>
    )
}

export default TextMenu