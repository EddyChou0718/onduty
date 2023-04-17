enum OnDutyType {
  Mon = "Mon", // 1
  Tue = "Tue", // 2
  Wed = "Wed", // 3
  Thu = "Thu", // 4
  Fri = "Fri", // 5
  Sat = "Sat", // 6
  Sun = "Sun", // 日
  maintain = "maintain",
}

enum statisticalType {
  all = "all",
  true = 1,
  false = 0,
}

interface GroupMember {
  id: number;
  name: string;
  Mon: Array<string>;
  Tue: Array<string>;
  Wed: Array<string>;
  Thu: Array<string>;
  Fri: Array<string>;
  Sat: Array<string>;
  Sun: Array<string>;
  maintain: Array<string>;
  maintain_afternoon: Array<string>;
}

interface DeleteMember {
  onduty_date: Date;
  isMaintain: number;
}

interface AgainOndutyDay {
  onduty_date: string;
  isMaintain: boolean;
}

interface MemberOnDutyDateObj {
  name: string;
  date: string;
  maintain_afternoon_name: string | undefined;
}
interface MemberOnDutyDate {
  id: number;
  name: string;
  onduty_date: Array<MemberOnDutyDateObj>;
}

function getOnDutyType(str: string): OnDutyType {
  let v = OnDutyType.Mon;

  switch (str) {
    case "Mon": {
      v = OnDutyType.Mon;
      break;
    }
    case "Tue": {
      v = OnDutyType.Tue;
      break;
    }
    case "Wed": {
      v = OnDutyType.Wed;
      break;
    }
    case "Thu": {
      v = OnDutyType.Thu;
      break;
    }
    case "Fri": {
      v = OnDutyType.Fri;
      break;
    }
    case "Sat": {
      v = OnDutyType.Sat;
      break;
    }
    case "Sun": {
      v = OnDutyType.Sun;
      break;
    }
    case "maintain": {
      v = OnDutyType.maintain;
      break;
    }
    default: {
      break;
    }
  }

  return v;
}

interface NewData {
  id: number;
  isMaintain: boolean;
  onduty_date: string;
  maintain_afternoon: number | undefined;
}

export {
  GroupMember,
  OnDutyType,
  NewData,
  getOnDutyType,
  MemberOnDutyDate,
  statisticalType,
  DeleteMember,
  AgainOndutyDay,
};
