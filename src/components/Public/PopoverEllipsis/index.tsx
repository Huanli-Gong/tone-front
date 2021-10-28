import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "antd"
import styles from './style.less';
const ButtonEllipsis: React.FC<any> = ({ title, width = '100%', children, refData, customStyle }) => {
	const setStyles = customStyle || { width: width }
	useEffect(() => {
		isEllipsis()
	}, [refData]);
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
		show ?
			<Tooltip placement="topLeft" title={title} >
				<div ref={ellipsis} className={styles.ellipsis} style={setStyles}>
					{renderChildren()}
				</div>
			</Tooltip> :
			<div ref={ellipsis} className={styles.ellipsis} style={setStyles}>
				{renderChildren()}
			</div>
	);
};

export default ButtonEllipsis;


