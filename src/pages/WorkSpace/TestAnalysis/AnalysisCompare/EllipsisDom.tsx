/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "antd"
import styles from './style.less';
const ButtonEllipsis: React.FC<any> = ({ title, autoStyle, children, refData }) => {
	const ellipsis = useRef<any>(null)
	const [show, setShow] = useState<boolean>(false)
	const isEllipsis = () => {
		const clientWidth = ellipsis.current.clientWidth
		const scrollWidth = ellipsis.current.scrollWidth
		setShow(clientWidth < scrollWidth)
	};
	useEffect(() => {
		isEllipsis()
	}, [refData]);
	const renderChildren = () => {
		return (
			children ? React.cloneElement(children) : title || '-'
		)
	}
	return (
		show ?
			<Tooltip placement="topLeft" title={title} >
				<div ref={ellipsis} className={styles.ellipsis} style={autoStyle}>
					{renderChildren()}
				</div>
			</Tooltip> :
			<div ref={ellipsis} className={styles.ellipsis} style={autoStyle}>
				{renderChildren()}
			</div>
	);
};

export default ButtonEllipsis;