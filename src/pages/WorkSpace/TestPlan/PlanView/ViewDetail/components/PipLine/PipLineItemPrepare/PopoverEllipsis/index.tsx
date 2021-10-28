import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "antd"
import styles from './style.less';

const ButtonEllipsis = ({ title, width='100%', children } : any) => {
	const ellipsis = useRef<any>(null)
	const [show, setShow] = useState(false)
  useEffect(() => {
		isEllipsis()
	}, [title]);

	const isEllipsis = () => {
		const clientHeight = ellipsis.current.clientHeight
		const scrollHeight = ellipsis.current.scrollHeight
		setShow(clientHeight < scrollHeight)
	};

	return (
		show?
			<Tooltip placement="bottomLeft" title={title} >
				<div ref={ellipsis} className={styles.ellipsis} style={{ width: width }}>
					{children ? children : title||''}
				</div>
			</Tooltip>
      :
			<div ref={ellipsis} className={styles.ellipsis} style={{ width: width }}>
				{children ? children : title||''}
			</div>
	);
};

export default ButtonEllipsis;


