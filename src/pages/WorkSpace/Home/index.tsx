import React from 'react';
import { Layout , Result} from 'antd';
import { SmileOutlined } from '@ant-design/icons';
export default ( props : any ) => {

    return (
        <Layout.Content>
            <Result
                icon={<SmileOutlined />}
                title="工作台"
                subTitle="欢迎进入工作台！"
            />
        </Layout.Content>
    )
}