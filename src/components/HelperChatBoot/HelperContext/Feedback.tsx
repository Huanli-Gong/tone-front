import { postFeedback } from "@/pages/SystemConf/Question/Feadback/services"
import { LeftOutlined } from "@ant-design/icons"
import { Button, Input, Result, Typography } from "antd"
import React from "react"
import styled from 'styled-components'

const Wrapper = styled.div`
    height: 500px;
    wdith: 100%;
    background-color: #fff;

    .nav-bar {
        width: 100%;
        height: 48px; 
        border-bottom: 1px solid #D9D9D9;
        padding: 0 16px;
        display: flex;
        align-items: center;
        gap: 16px;

        font-weight: 500;
        font-size: 14px;
        color: rgba(0,0,0,0.85);
    }

    .feedback {
        width: 100%;
        height: calc(100% - 48px);
        padding: 16px 16px 0;
        display: flex;
        gap: 24px;
        flex-direction: column;
        align-items: center;

        .inp {
            height: 348px;
            width: 100%;
            background-color: #FFFFFF;
            border: 1px solid #D9D9D9;
            border-radius: 2px;
            text-align: left;
            outline: none;
        }

        .btn {
            height: 40px;
            width: 240px;
            background-color: #205CE8;
            border-radius: 6px;
            color: #fff;
        }
    }
`

const Feedback: React.FC<any> = (props) => {
    const { back } = props
    const [inp, setInp] = React.useState('')
    const [success, setSuccess] = React.useState(false)

    const handleSubmit = async () => {
        if (!inp) return
        const { code, msg } = await postFeedback({ contents: inp })
        if (code !== 200) {
            return console.log(msg)
        }
        setSuccess(true)
    }

    return (
        <Wrapper>
            <div className="nav-bar">
                <LeftOutlined onClick={back} />
                <Typography.Text>意见反馈</Typography.Text>
            </div>
            {
                success ?
                    <div className="feedback">
                        <Result
                            status="success"
                            title="提交成功"
                            subTitle="返回后，可继续其他操作"
                        />
                    </div> :
                    <div className="feedback">
                        <Input.TextArea
                            className="inp"
                            placeholder="请简要描述一下你遇到的问题或建议"
                            value={inp}
                            onChange={(e) => setInp(e.target.value)}
                        />
                        <Button className="btn" onClick={handleSubmit}>
                            提交
                        </Button>
                    </div>
            }
        </Wrapper>
    )
}

export default Feedback