export interface ProvinceItem {
  id: string;
  name: string;
  status: string;
  isCentrallyGoverned: boolean;
}

export interface WardItem {
  id: string;
  provinceId?: string;
  name: string;
  status: string;
}

export interface IndustryItem {
  id: string;
  groupId?: string;
  name: string;
  status?: string;
  isActive: boolean;
}

export interface IndustryGroupItem {
  id: string;
  name: string;
  isActive: boolean;
}

export interface IndustryGroupWithIndustriesItem {
  id: string;
  name: string;
  isActive: boolean;
  items?: IndustryItem[];
  industries?: IndustryItem[];
}

export interface SkillItem {
  id: string;
  name: string;
  isActive: boolean;
}
