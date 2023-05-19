/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { forwardRef, useRef } from 'react'

import { Modal, Row } from 'antd'
import 'cropperjs/dist/cropper.css';
import Cropper from 'react-cropper';
import { request } from 'umi';
import styled from 'styled-components'

const PreviewCls = styled.div`
    width: calc(100% - 200px - 20px);
    height: 100px;
    overflow: hidden;
    margin-left: 20px;
`

const WrapperCls = styled(Cropper)`
    & {
        height: 200px;
        width: 200px;  
    }
`

type IProps = {
    onCancel?: () => void
    onOk: (data: any) => void
}

const CropperModal: React.ForwardRefRenderFunction<AnyType, IProps> = (props, ref) => {
    const { onCancel, onOk } = props

    const [avatar, setAvatar] = React.useState('')
    const [visible, setVisible] = React.useState(false)

    React.useImperativeHandle(ref, () => ({
        show(url: string) {
            setVisible(true)
            setAvatar(url)
        }
    }))


    const cropper = useRef<any>(null)

    const handleCancel = () => {
        setVisible(false)
        setAvatar('')
        onCancel && onCancel()
    }

    const handleOk = () => {
        cropper.current.getCroppedCanvas().toBlob(
            async (blob: Blob) => {
                const formData = new FormData()
                // 添加要上传的文件
                formData.append('file', blob)
                // 上传图片
                const data = await request(
                    `/api/sys/upload/`,
                    {
                        method: 'post',
                        data: formData
                    }
                )
                onOk(data)
                handleCancel()
            }
        )
    }

    return (
        <Modal
            open={visible}
            onCancel={handleCancel}
            onOk={handleOk}
            title="图片裁切"
            maskClosable={false}
        >
            <Row>
                <WrapperCls
                    ref={cropper}
                    src={avatar}
                    aspectRatio={1}
                    guides={true}
                    preview=".preview"
                />
                <PreviewCls className="preview" />
            </Row>
        </Modal>
    )
}

export default forwardRef(CropperModal)