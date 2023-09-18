import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { ReactComponent as CopyOutline } from "../assets/copy.svg"
import ClipboardJS from 'clipboard'
import { message, Select } from "antd"

const useCopyText = (successText: string) => (text: string) => {
    const ele = document.createElement("a")
    ele.style.height = "0px"
    ele.style.width = "0px"
    ele.innerHTML = ""
    ele.id = "currentCopyLinkEle"
    document.body.appendChild(ele)
    const cb = new ClipboardJS(ele, {
        text: () => text
    })

    cb.on('success', function (e) {
        message.success(successText)
    })
    ele.click()
    cb.destroy()
}

export default ({ node, updateAttributes, extension, editor }: any) => {
    if (!editor) return
    const { attrs: { language: defaultLanguage }, textContent } = node
    const handleCopyText = useCopyText("复制成功！")

    return (
        <NodeViewWrapper className="code-block">
            {
                editor?.isEditable ?
                    <Select
                        defaultValue={defaultLanguage}
                        className="lang-selecter"
                        size="small"
                        onChange={value => updateAttributes({ language: value })}
                        optionFilterProp="children"
                        showSearch
                        filterOption={
                            /* @ts-ignore */
                            (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={
                            extension.options?.lowlight?.listLanguages()?.map((lang: string, index: number) => ({
                                key: index,
                                value: lang,
                                label: lang
                            }))
                        }
                    /> :
                    <span className='copy-outline' onClick={() => handleCopyText(textContent)}>
                        <CopyOutline />
                    </span>
            }

            <pre>
                <NodeViewContent as="code" />
            </pre>
        </NodeViewWrapper>
    )
}