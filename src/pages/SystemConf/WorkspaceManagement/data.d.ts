export interface WorkspaceList {
	is_public?:number;
	onRef:any;
	tab?:string;
	top?:boolean
}

export interface WorkspaceTable {
	apply_reason?: string;
	creator_name?:string;
	creator?: number;
	description?: string;
	gmt_created?: string;
	gmt_modified?: string;
	id: number;
	is_approved?: boolean;
	is_public: boolean;
	logo?: string;
	member_count?: number;
	name?: string;
	owner: number;
	owner_name?: string;
	owner_avatar:string;
	show_name?: string;
	status?: string;
	proposer_dep?:string;
	creator_avatar:string;
	theme_color?:string;
	is_common?:boolean;
}

export interface TableListParams {
	is_approved?:number;
	is_public?:number;
	page_num?:number;
	page_size?:number;
}

export interface RemovePrams {
	id:number | null | string
}

export interface Count {
	total_count:number;
	public_count:number;
	un_public_count:number;
}