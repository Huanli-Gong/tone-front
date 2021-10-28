import { Redirect } from 'umi'
import React from 'react'

const ErrorPage: React.FC = () => <Redirect to="/500" />
export default ErrorPage;