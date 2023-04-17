import {
  OnDutyType,
  getOnDutyType,
  GroupMember,
  NewData,
  AgainOndutyDay,
} from "./type";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(weekday);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Taipei");

export default class Onduty {
  private groupMembers: Array<GroupMember>;
  private maintain: Array<string>;
  private startDay: dayjs.Dayjs;
  private endDay: dayjs.Dayjs;
  private newData: Array<NewData> = [];

  constructor(
    groupMembers: Array<GroupMember>,
    maintain: Array<string>,
    startDay: string,
    endDay: string
  ) {
    this.groupMembers = JSON.parse(JSON.stringify(groupMembers));
    this.maintain = maintain;
    this.startDay = dayjs(startDay);
    this.endDay = dayjs(endDay);
  }

  /**
   * 篩選誰值班最少
   * @param key 星期幾
   * @returns
   */
  private ruleNoOnDutyIds(key: OnDutyType) {
    let ids: Array<number> = [];
    let length = this.groupMembers[0][key].length;

    this.groupMembers.forEach((v) => {
      if (v[key].length === length) {
        ids.push(v.id);
      } else if (v[key].length < length) {
        ids = [v.id];
        length = v[key].length;
      }
    });

    return ids;
  }

  /**
   * 篩選是否有連續值班
   * @param daySting 日期
   */
  private ruleNoContinuous(day: dayjs.Dayjs) {
    const yesterday = day.subtract(1, "day");
    const yesterdayWeekday = getOnDutyType(yesterday.format("ddd"));
    const ids: Array<number> = [];

    this.groupMembers.forEach((v) => {
      if (
        v[yesterdayWeekday].indexOf(yesterday.format("YYYY-MM-DD")) === -1 &&
        (yesterdayWeekday !== "Wed" ||
          v.maintain.indexOf(yesterday.format("YYYY-MM-DD")) === -1)
      ) {
        ids.push(v.id);
      }
    });

    return ids;
  }

  /**
   * 是否在近期有重複值班
   * @param day 值班日期
   * @param ids 值班人員
   */
  private ruleNoRepeatedly(day: dayjs.Dayjs, ids: number) {
    const dayLength = this.groupMembers.length - 1;
    const member = this.groupMembers.find((d) => d.id === ids);
    if (dayLength <= 0) {
      return false;
    }

    for (let i = this.groupMembers.length - 2; i > 0; i--) {
      const d = day.subtract(i, "day");
      const dKey = getOnDutyType(d.format("ddd"));
      if (
        member &&
        (member[dKey].indexOf(d.format("YYYY-MM-DD")) !== -1 ||
          member.maintain.indexOf(d.format("YYYY-MM-DD")) !== -1)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * 抽號碼
   * @param ids
   * @returns
   */
  private getRandom(ids: Array<number>) {
    const id = ids[Math.floor(Math.random() * ids.length)];
    const newIds = ids.filter((i) => i !== id);

    return { id, newIds };
  }

  /**
   * 抽一般天
   */
  public getOnduty(): void {
    let day = this.startDay;

    while (day.isBefore(this.endDay.add(1, "day"), "day")) {
      if (this.maintain.indexOf(day.format("YYYY-MM-DD")) !== -1) {
        day = day.add(1, "day");
        continue;
      }

      const daykey = getOnDutyType(day.format("ddd"));
      const ruleIds1 = this.ruleNoOnDutyIds(daykey);
      const ruleIds2 = this.ruleNoContinuous(day);

      let ids = ruleIds1.filter((id) => ruleIds2.indexOf(id) !== -1);
      if (ids.length <= 0) {
        ids = ruleIds2;
      }

      const newIds = ids.filter((id) => !this.ruleNoRepeatedly(day, id));

      if (newIds.length > 0) {
        ids = newIds;
      }

      if (ids.length <= 0) {
        console.log("error");
      }

      const idRandom = this.getRandom(ids);

      this.groupMembers.forEach((v, k) => {
        if (v.id === idRandom.id) {
          this.groupMembers[k][daykey].push(dayjs(day).format("YYYY-MM-DD"));
          this.newData.push({
            id: v.id,
            onduty_date: dayjs(day).format("YYYY-MM-DD"),
            isMaintain: false,
            maintain_afternoon: undefined,
          });
        }
      });
      day = day.add(1, "day");
    }
  }

  /**
   * 抽大值班
   */
  public maintainOnDuty(): void {
    let NoOnDutyIds = this.ruleNoOnDutyIds(OnDutyType.maintain);

    this.maintain.forEach((d) => {
      if (dayjs(d).isBefore(dayjs(this.startDay), "day")) {
        return;
      }

      if (NoOnDutyIds.length === 0) {
        NoOnDutyIds = this.ruleNoOnDutyIds(OnDutyType.maintain);
      }

      const idRandom = this.getRandom(NoOnDutyIds);
      NoOnDutyIds = idRandom.newIds;
      this.groupMembers.forEach((v, k) => {
        if (v.id === idRandom.id) {
          this.groupMembers[k].maintain.push(d);
          this.newData.push({
            id: v.id,
            onduty_date: dayjs(d).format("YYYY-MM-DD"),
            isMaintain: true,
            maintain_afternoon: undefined,
          });
        }
      });
    });
  }

  private findGroupMembers(day: dayjs.Dayjs): number {
    const type = getOnDutyType(day.format("ddd"));

    let d = this.groupMembers.find((d) => {
      return d[type].indexOf(day.format("YYYY-MM-DD")) !== -1;
    });

    if (d === undefined && type === OnDutyType.Wed) {
      d = this.groupMembers.find((d) => {
        return d.maintain.indexOf(day.format("YYYY-MM-DD")) !== -1;
      });
    }

    return d !== undefined ? d.id : -1;
  }

  // 選出大值班下午班
  public maintainAfternoon(): void {
    this.groupMembers.forEach((d) => {
      d.maintain.forEach((d2) => {
        let ids = this.groupMembers.map((d) => d.id);
        const d2Id = this.findGroupMembers(dayjs(d2));

        ids = ids.filter((v) => d2Id !== v);

        for (let i = 1; i <= 3; i++) {
          const addID = this.findGroupMembers(dayjs(d2).add(i, "day"));
          const subtractID = this.findGroupMembers(
            dayjs(d2).subtract(i, "day")
          );

          ids = ids.filter((v) => addID !== v);
          ids = ids.filter((v) => subtractID !== v);
        }

        if (ids.length === 0) {
          ids = this.groupMembers.map((d) => d.id);
        }
        const idRandom = this.getRandom(ids);

        this.groupMembers.forEach((v, k) => {
          if (v.id === idRandom.id) {
            this.groupMembers[k].maintain_afternoon.push(d2);
          }
        });

        this.newData.find((d, i) => {
          if (d.onduty_date === d2) {
            this.newData[i].maintain_afternoon = idRandom.id;
          }
          return d.onduty_date === d2;
        });
      });
    });
  }

  /**
   * 取得結果
   * @returns
   */
  public getGroupMembers(): Array<GroupMember> {
    return this.groupMembers;
  }

  /**
   * 取得結果
   * @returns
   */
  public getNewData(): Array<NewData> {
    return this.newData;
  }

  /**
   * 補抽值班
   * @param day 
   * @returns 
   */
  public againOnduty(day: AgainOndutyDay[]): Array<NewData> {
    const data: NewData[] = [];
    day.forEach((d) => {
        const dkey = d.isMaintain ? OnDutyType.maintain: getOnDutyType(dayjs(d.onduty_date).format("ddd"));
        const ruleIds1 = this.ruleNoOnDutyIds(dkey);
        const ruleIds2 = this.ruleNoContinuous(dayjs(d.onduty_date));

        let ids = ruleIds1.filter((id) => ruleIds2.indexOf(id) !== -1);
        if (ids.length <= 0) {
          ids = ruleIds2;
        }

        const newIds = ids.filter(
          (id) => !this.ruleNoRepeatedly(dayjs(d.onduty_date), id)
        );
        if (newIds.length > 0) {
          ids = newIds;
        }
        const idRandom = this.getRandom(ids);
        data.push({
          id: idRandom.id,
          onduty_date: dayjs(d.onduty_date).format("YYYY-MM-DD"),
          isMaintain: d.isMaintain,
          maintain_afternoon: undefined,
        });

        this.groupMembers.forEach((v, k) => {
          if (v.id === idRandom.id) {
            this.groupMembers[k][dkey].push(dayjs(d.onduty_date).format("YYYY-MM-DD"));
          }
        });
    });

    data.forEach(d => {
      if(d.isMaintain) {
        let ids = this.groupMembers.map((d) => d.id);
        const d2Id = this.findGroupMembers(dayjs(d.onduty_date));
  
        ids = ids.filter((v) => d2Id !== v);
  
        for (let i = 1; i <= 3; i++) {
          const addID = this.findGroupMembers(dayjs(d.onduty_date).add(i, "day"));
          const subtractID = this.findGroupMembers(
            dayjs(d.onduty_date).subtract(i, "day")
          );
  
          ids = ids.filter((v) => addID !== v);
          ids = ids.filter((v) => subtractID !== v);
        }
  
        if (ids.length === 0) {
          ids = this.groupMembers.map((d) => d.id);
        }
        const idRandom = this.getRandom(ids);
  
        data.find((d2, i) => {
          if (d.onduty_date === d2.onduty_date) {
            data[i].maintain_afternoon = idRandom.id;
          }
          return d.onduty_date === d2.onduty_date;
        });
      }
    })

    return data;
  }
}
