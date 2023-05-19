export interface UserList {
	role_id?: number;
	onRef: any;
	RoleChange: any;
	select: any[];
	onSearch: any;
	rolelist: any[];
}

export interface UserTable {
	id: number;
	avatar: string;
	dep_desc: string;
	email: string;
	first_name: string;
	job_desc: string;
	last_name: string;
	role_list: number;
	username: string;
	ws_list: string[];
}

export interface RoleList {
	list: number[]
}

export interface TableListParams {
	role_id?: number;
	page_num?: number;
	page_size?: number;
}

export interface RoleChangeParams {
	user_id: number;
	role_id: any;
}