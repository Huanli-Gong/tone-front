import { Button, Result } from 'antd';
import React from 'react';

const ErrorPage: React.FC<{}> = () => (
    <Result
        status="500"
        title="500"
        subTitle="系统异常，请联系系统管理员."
        extra={
            <Button type="primary" onClick={() => location.href = '/'}>返回首页</Button>
        }
    />
);

export default ErrorPage;