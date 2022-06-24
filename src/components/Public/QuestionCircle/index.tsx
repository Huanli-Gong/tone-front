import React from "react";
import { Popover } from "antd";
import { QuestionCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components';
const QuestionCircleOutlinedStyle = styled(QuestionCircleOutlined)`
	color: rgba(0, 0, 0, 0.65);
	cursor: pointer;
	position: absolute;
	right: -22px;
	top: 5px;
`
const QuestionCircleComponent: React.FC<any> = ({ contextNode,placement='top' }) => {
	return (
		<Popover
			placement={placement}
			overlayStyle={{zIndex: 10000}}
			content={contextNode}
			color="#fff"
		>
			<QuestionCircleOutlinedStyle />
		</Popover>
	);
};

export default QuestionCircleComponent;