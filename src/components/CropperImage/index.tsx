import React , { useRef } from 'react'

import { Modal , Row } from 'antd'
import 'cropperjs/dist/cropper.css';
import Cropper from 'react-cropper';
import { request } from 'umi';

export default ( props : any ) => {
    const { visible , url } = props

    const cropper = useRef<any>(null)

    const handleCancel = () => {
        props.onCancel()
    }
    const handleOk = () => {
        cropper.current.getCroppedCanvas().toBlob(
            async ( blob : Blob ) => {
                const formData = new FormData()
                // 添加要上传的文件
                formData.append('file', blob )
                // 上传图片
                const data = await request(
                    `/api/sys/upload/`,
                    {
                        method : 'post',
                        data : formData
                    }
                )
                console.log( data )
                props.onOk( data )
            }
        )
    }

    return (
        <Modal
            visible={ visible }
            onCancel={ handleCancel }
            onOk={ handleOk }
            title="图片裁切"
            maskClosable={ false }
        >
            <Row>
                <Cropper
                    ref={cropper}
                    src={ url }
                    style={{ height: 200, width: 200 }}
                    aspectRatio={ 1 }
                    guides={true}
                    preview=".preview"
                />
                <div className="preview" style={{ width : 'calc(100% - 200px - 20px)' , height : 100 , overflow : 'hidden' , marginLeft : 20 }}></div>
            </Row>
        </Modal>
    )
}