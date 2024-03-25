import React from "react"
import { ReactComponent as ImageIcon } from "../assets/image.svg"
import { ReactComponent as NetworkPicture } from "../assets/net-picture.svg"
import { ReactComponent as UploadPicture } from "../assets/upload-picture.svg"
import styled from "styled-components"
import { ToolMenuList, ToolMenuItem } from "../styled"
import DorpdownMenu from "./DropdownMenu";

const ImageInputWrap = styled.div`
    position: relative;
`

const ImageInputBlock = styled.div`
    position: absolute;
    right: 0;
    bottom: -55px;
    background-color: #fff;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    z-index: 999;
    box-shadow: 0 2px 10px #0000001f;
    width: 340px;

    input {
        border-radius: 8px;
        border: 1px solid #eaeaea;
        outline: none;
        padding-left: 8px;
        padding-right: 8px;
    }
`

const ImageInput = styled.input`
    display: none;
    width: 0;
    height: 0;
`

const ImageMenu: React.FC<Record<string, any>> = ({ editor }) => {
    const inp = React.useRef<HTMLInputElement>(null)

    const [modal, setModal] = React.useState(false)
    const ref = React.useRef(null) as any
    const imgWrap = React.useRef(null) as any
    const handleClick = () => {
        inp.current?.click()
    }

    const inpImage = (src: string) => {
        editor.chain().focus().setImage({ src }).run()
        editor.chain().focus().setHardBreak().run()
    }

    const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { target } = evt
        if (!target?.files?.[0]) return
        const reader = new FileReader()
        reader.onload = (e) => {
            inpImage(e.target?.result as any)
        }
        reader.readAsDataURL(target.files?.[0])
    }

    const handleConfirm = () => {
        const { value } = ref.current
        if (!value) return
        // if (!/^https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))$/i.test(value)) return 
        inpImage(value)
        ref.current.value = ""
        setModal(false)
    }

    const handleCancel = () => {
        ref.current.value = ""
        setModal(false)
    }

    if (!editor) return <></>

    return (
        <ImageInputWrap>
            <DorpdownMenu
                title=""
                placement="rightButtom"
                menu={
                    <ToolMenuList>
                        <ToolMenuItem onClick={() => setModal(true)} >
                            <NetworkPicture />
                            网络图片
                        </ToolMenuItem>
                        <ToolMenuItem onClick={handleClick}>
                            <UploadPicture />
                            本地图片
                        </ToolMenuItem>
                    </ToolMenuList>
                }
            >
                <ImageIcon />
            </DorpdownMenu>
            <ImageInput ref={inp} type="file" onChange={handleInputChange} />
            {
                modal &&
                <ImageInputBlock ref={imgWrap}>
                    <span>图片地址：</span>
                    <input ref={ref} placeholder="请输入图片地" />
                    {/* <span>{errorMessage}</span> */}
                    <span style={{ cursor: "pointer" }} onClick={handleCancel}>取消</span>
                    <a onClick={handleConfirm}>确定</a>
                </ImageInputBlock>
            }
        </ImageInputWrap>
    )
}

export default ImageMenu