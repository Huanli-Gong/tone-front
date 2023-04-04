export interface UserTable {
	id: number;
	action?: string;
	approver?: any;
	approver_name?: string;
	description?: string;
	gmt_created?: string;
	gmt_modified?: string;
	object_id: number;
	object_type?: string;
	proposer?: number;
	proposer_avatar?: string;
	proposer_dep?: string;
	proposer_name?: string;
	reason?: string;
	status?: string;
	title?: string;
	is_public?: true;
	ws_logo?: string
}

export interface TableListParams {
	action?: string;
	status?: number;
	page_num?: number;
	page_size?: number;
}

export interface ApproveParams {
	action?: string;
	id: number;
	reason?: string;
}

export interface Count {
	backlog_count: number;
	finished_count: number;
}


export interface UserList {
	status: number;
	onRef: any;
	getNum?: any;
}