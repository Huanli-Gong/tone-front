import { Button, Result } from 'antd';
import React from 'react';

const ErrorPage: React.FC<{}> = () => (
    <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong."
        extra={
            <Button type="primary" onClick={() => location.href = '/'}>Back Home</Button>
        }
    />
);

export default ErrorPage;