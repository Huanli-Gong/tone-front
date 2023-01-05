import React from "react"
import { ReactComponent as LinkIcon } from "../assets/link.svg"
import { MenuItem, DropdownWrapper } from "../styled"
import styled from "styled-components"
import { useClickAway } from "ahooks"

const MenuDorp = styled.div`
    /* width: 365px; */
    ${DropdownWrapper}
    padding: 8px;
`

const MenuButton = styled.button<{ disabled?: boolean }>`
    border: 1px solid #d9d9d9;
    background: rgba(0,0,0,0);
    text-shadow: none;
    box-shadow: none;
    text-align: center;
    display: inline-block;
    font-weight: 400;
    height: 32px;
    padding: 4px 15px;
    user-select: none;
    cursor: pointer;
    white-space: nowrap;
    /* ${({ disabled }) => !disabled && `
        cursor: not-allowed;
        color: #becobf;
        border-color: #d9d9d9;
    `} */
`

const FormRow = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 8px;
    span {
        display: inline-flex;
        text-align: right;
        &::after {
            content: "："
        }
    }
    input {
        border: 1px solid #d9d9d9;
        outline: none;
        padding: 4px 11px;
        border-radius: 6px;
    }
`


const LinkMenu: React.FC<Record<string, any>> = ({ editor }) => {
    if (!editor) return <></>
    const wrap = React.useRef<HTMLSpanElement>(null)

    const [open, setOpen] = React.useState(false)
    const [val, setVal] = React.useState<any>("")

    useClickAway(() => {
        setOpen(false)
    }, wrap)

    const handleClick = () => {
        const href = editor.getAttributes('link').href
        if (href) setVal(href)
        setOpen(true)
    }

    const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setVal(evt.target.value)
    }

    const handleSubmit = () => {
        editor.chain().focus().extendMarkRange('link').setLink({ href: val })
            .run()
        setTimeout(() => {
            setOpen(false)
        }, 10)
    }

    React.useEffect(() => {
        if (!open) {
            setVal("")
        }
    }, [open])

    return (
        <MenuItem
            onClick={handleClick}
            style={{ position: "relative" }}
            ref={wrap}
        >
            <LinkIcon />
            {
                open &&
                <MenuDorp >
                    <FormRow>
                        <input
                            value={val}
                            type="text"
                            defaultValue={""}
                            placeholder="https://example.com"
                            onChange={(evt) => handleInputChange(evt)}
                        />
                        <MenuButton
                            type="button"
                            onClick={handleSubmit}
                        >
                            确定
                        </MenuButton>
                    </FormRow>
                </MenuDorp>
            }
        </MenuItem>
    )
}

export default LinkMenu