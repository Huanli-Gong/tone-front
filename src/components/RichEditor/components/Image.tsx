import React from "react"
import { ReactComponent as ImageIcon } from "../assets/image.svg"
import styled from "styled-components"
import { TooltipMenu } from "./TooltipMenu"

const ImageInput = styled.input`
    display: none;
    width: 0;
    height: 0;
`

const ImageMenu: React.FC<Record<string, any>> = ({ editor }) => {
    if (!editor) return <></>
    const inp = React.useRef<HTMLInputElement>(null)

    const handleClick = () => {
        inp.current?.click()
    }

    const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { target } = evt
        if (!target?.files?.[0]) return
        const reader = new FileReader()
        reader.onload = (e) => {
            editor.chain().focus().setImage({ src: e.target?.result }).run()
        }
        reader.readAsDataURL(target.files?.[0])
    }

    return (
        <TooltipMenu
            title="插入图片"
            onClick={handleClick}
        >
            <ImageIcon />
            <ImageInput ref={inp} type="file" onChange={handleInputChange} />
        </TooltipMenu>
    )
}

export default ImageMenu