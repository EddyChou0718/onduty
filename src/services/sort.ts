import { getOnDutyType, GroupMember } from "./type";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
dayjs.extend(minMax);

export default class sort {
  /**
   * 取得不納入統計的排班日期
   * @param groupMembers 目前排班資訊
   * @returns 返回不納入排班的日期
   */
  public getNoStatistical(groupMembers: GroupMember[]): string[] {
    const noStatistical: Array<string> = [];

    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "maintain"].forEach(
      (d) => {
        const dKey = getOnDutyType(d);
        const long = Math.min(...groupMembers.map((days) => days[dKey].length));
        noStatistical.push(
          ...groupMembers.reduce((acc, v) => {
            const i = v[dKey].length - long;

            if (i === 0) {
              acc.push(...v[dKey]);
            }

            if (i > 0) {
              let day = [...v[dKey]];
              for (let j = 0; j < long; j++) {
                const minDay = dayjs.min(day.map(k => dayjs(k))).format('YYYY-MM-DD');
                day = day.filter(k => k !== minDay);
                acc.push(minDay);
              }
            }

            return acc;
          }, <string[]>[])
        );
      }
    );

    return noStatistical;
  }
}
