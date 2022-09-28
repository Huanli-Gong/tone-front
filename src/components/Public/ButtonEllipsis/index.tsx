import React, { useState, useRef, useEffect } from 'react';
import { Space, Tooltip } from 'antd'
import styles from './style.less';
import { FileTextOutlined } from '@ant-design/icons';
import CodeViewer from '@/components/CodeViewer';

const ButtonEllipsis: React.FC<any> = ({ title, width = 150, onClick = () => { }, children, isCode = false }) => {
	useEffect(() => {
		isEllipsis()
	}, []);

	const ellipsis = useRef<any>(null)
	const [show, setShow] = useState<boolean>(false)
	const isEllipsis = () => {
		const clientWidth = ellipsis.current.clientWidth
		const scrollWidth = ellipsis.current.scrollWidth
		setShow(clientWidth < scrollWidth)
	};
	const renderChildren = () => {
		return (
			children ? React.cloneElement(children) : title || '-'
		)
	}
	return (
		<Space>
			<div ref={ellipsis} className={styles.ellipsis} style={{ width: width }}>
				<Tooltip
					overlayClassName={styles.tooltipCss}
					color={isCode ? '#fff' : ''}
					placement="leftTop"
					title={isCode ? <CodeViewer code={title} /> : title}
				>
					{title || '-'}
				</Tooltip>
				<span></span>
				{!show && children && renderChildren()}
			</div>
			{show && children && renderChildren()}
			{show && !children &&
				<FileTextOutlined className={styles.edit} onClick={onClick} />
			}
		</Space>
	);
};

export default ButtonEllipsis;


