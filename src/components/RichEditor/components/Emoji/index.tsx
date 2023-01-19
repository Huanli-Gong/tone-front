import React from "react"
import data from "./data"

import { ToolMenu, ToolMenuList } from "../../styled"

import { ReactComponent as EmojiOutlined } from "../../assets/emoji.svg"
import { TooltipMenu } from "../TooltipMenu"
import type { Editor } from "@tiptap/react"
import { useClickAway } from "ahooks"

import styled from "styled-components"

const EmojiClassRow = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 8px;
    margin-bottom: 8px;
    overflow: auto;
`
type EmojiClassItemProps = {
    is_active: boolean
}

const EmojiClassItem = styled.div <EmojiClassItemProps>`
    border-radius: 8px;
    padding: 0 4px;
    ${({ is_active }) => is_active && `background-color: #dbeafe;`}
    &:hover {
        background-color: #dbeafe;
    }
`

const EmojiItemWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    max-height: 248px;
    overflow: auto;
    svg {
        width: 24px !important;
        height: 24px !important;
    }
`

const Emoji: React.FC<{ editor: Editor }> = ({ editor }) => {
    const [emojiIndex, setEmojiIndex] = React.useState(0)
    const [show, setShow] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)

    useClickAway(() => {
        setShow(false)
    }, ref)

    return (
        <ToolMenu
            ref={ref}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <TooltipMenu
                title="表情"
            >
                <EmojiOutlined />
            </TooltipMenu>
            {
                show &&
                <ToolMenuList style={{ right: 0, left: "unset", padding: 8, maxWidth: 320 }} >
                    <EmojiClassRow>
                        {
                            data.map((item: any, index: number) => (
                                <EmojiClassItem
                                    key={item.title}
                                    onClick={() => setEmojiIndex(index)}
                                    is_active={emojiIndex === index}
                                >
                                    {item.title}
                                </EmojiClassItem>
                            ))
                        }
                    </EmojiClassRow>
                    <EmojiItemWrapper>
                        {
                            data[emojiIndex].list.map((i: any) => (
                                <TooltipMenu
                                    title={i.name}
                                    key={i.keyword}
                                    onClick={() => {
                                        editor.commands.insertContent(i.emoji)
                                        setShow(false)
                                    }}
                                >
                                    {i.emoji}
                                </TooltipMenu>
                            ))
                        }
                    </EmojiItemWrapper>
                </ToolMenuList>
            }
        </ToolMenu>
    )
}

export default Emoji