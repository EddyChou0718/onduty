import { GroupMember, getOnDutyType, NewData, MemberOnDutyDate, DeleteMember } from "./type";
import mariadb from "mariadb";
import dayjs from "dayjs";
import { DB } from "../../config";

interface MemberData {
  id: number;
  name: string;
}

interface BeforeOnduty {
  id: number;
  onduty_date: string;
  isMaintain: number;
  maintain_afternoon: number | null;
}
interface BeforeOndutyByName {
  id: number;
  name: string;
  onduty_date: string;
  maintain_afternoon_name: string | undefined;
}

interface EndDay {
  date: string;
}

export default class Data {
  private pool = mariadb.createPool({
    host: DB.host,
    user: DB.user,
    password: DB.password,
    database: DB.database,
    connectionLimit: 5,
  });

  /**
   * 查詢sql
   * @param sql sql
   * @returns 查詢結果
   */
  private async query<T = Array<string>>(sql: string): Promise<Array<T>> {
    let conn;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query(sql);
      return rows;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      if (conn) conn.release(); //release to pool
    }
  }

  /** 取得最後一天 */
  public async getEndDay(): Promise<string> {
    const row = await this.query<EndDay>(
      "SELECT MAX(`onduty_date`) as 'date' FROM `onduty`"
    );

    return dayjs(row[0].date || new Date())
      .tz("Asia/Taipei")
      .format("YYYY-MM-DD");
  }

  /**
   * 存入新增的排班資料
   * @param data 新增的排班資料
   */
  public async saveData(data: Array<NewData>): Promise<void> {
    if(data.length <= 0){
      return;
    }

    const afternoonMaintain = data
      .filter((d) => d.maintain_afternoon)
      .map((d) => ({ id: d.maintain_afternoon, date: d.onduty_date }));

    const sql =
      "INSERT INTO `onduty` (`onduty_date`, `nameID`, `isMaintain`, `maintain_afternoon`) VALUES " +
      data
        .map((d) => {
          let v = "NULL";
          const isAfternoonMaintain =
            d.isMaintain &&
            afternoonMaintain.find(
              (afternoon) => d.onduty_date === afternoon.date
            );
          if (isAfternoonMaintain) {
            v = `'${isAfternoonMaintain.id}'`;
          }

          return `('${d.onduty_date}', '${d.id}', '${Number(
            d.isMaintain
          )}', ${v} )`;
        })
        .join(",");

    await this.query(sql);
  }

  /**
   * 取的全部排班資料
   *
   * @param startDate 起始時間
   * @param endDate 結束時間
   * @returns 排班資料
   */
  public async getGroupMember(
    startDate?: string,
    endDate?: string,
    statistical?: 0 | 1
  ): Promise<GroupMember[]> {
    const member = await this.query<MemberData>(
      "SELECT * FROM `group_member` ORDER BY `id` ASC"
    );

    let beforeOndutySql =
      "SELECT group_member.id, onduty.onduty_date, onduty.isMaintain, onduty.maintain_afternoon  FROM `onduty` INNER JOIN `group_member` ON onduty.nameID = group_member.id";

    if (startDate) {
      beforeOndutySql += ` WHERE \`onduty_date\` >= '${dayjs(startDate)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD")}'`;
    }

    if (startDate && endDate) {
      beforeOndutySql += `AND \`onduty_date\` <= '${dayjs(endDate)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD")}'`;
    }

    if (statistical) {
      beforeOndutySql += ` AND \`statistical\` = ${statistical}`;
    }

    const beforeOnduty = await this.query<BeforeOnduty>(beforeOndutySql);
    const data: Array<GroupMember> = member.map((d) => ({
      id: d.id,
      name: d.name,
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
      maintain: [],
      maintain_afternoon: [],
    }));

    beforeOnduty.forEach((d) => {
      data.forEach((v, i) => {
        if (v.id === d.id && !d.isMaintain) {
          const day = dayjs(d.onduty_date);
          data[i][getOnDutyType(day.format("ddd"))].push(
            dayjs(d.onduty_date).format("YYYY-MM-DD")
          );
        }

        if (v.id === d.id && d.isMaintain) {
          data[i].maintain.push(dayjs(d.onduty_date).format("YYYY-MM-DD"));
        }

        if (v.id === d.maintain_afternoon) {
          data[i].maintain_afternoon.push(
            dayjs(d.onduty_date).format("YYYY-MM-DD")
          );
        }
      });
    });

    return data;
  }

  /**
   * 取得傳入組員的排班資料
   * @param username 名稱
   * @param startDate 起始時間
   * @param endDate 結束時間
   * @returns 排班的資料
   */
  public async getGroupMemberByName(
    username: string,
    startDate?: string,
    endDate?: string,
    statistical?: 0 | 1
  ): Promise<MemberOnDutyDate> {
    let beforeOndutySql = `SELECT nameID as id , group_member.name, onduty_date, maintain_afternoon,
      Replace(onduty.maintain_afternoon,onduty.maintain_afternoon, (SELECT name FROM group_member WHERE onduty.maintain_afternoon = group_member.id)) as maintain_afternoon_name
      FROM onduty INNER JOIN group_member ON group_member.id = onduty.nameID
      WHERE (name = '${username}' OR maintain_afternoon = (SELECT id FROM group_member WHERE name = '${username}'))`;

    if (statistical) {
      beforeOndutySql += ` AND \`statistical\` = ${statistical}`;
    }

    if (startDate) {
      beforeOndutySql += ` AND \`onduty_date\` >= '${dayjs(startDate)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD")}'`;
    }

    if (startDate && endDate) {
      beforeOndutySql += `AND \`onduty_date\` <= '${dayjs(endDate)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD")}'`;
    }

    beforeOndutySql += `ORDER BY onduty_date ASC`;

    const beforeOnduty = await this.query<BeforeOndutyByName>(beforeOndutySql);

    const data: MemberOnDutyDate = {
      id: beforeOnduty[0].id,
      name: username,
      onduty_date: [],
    };

    data.onduty_date = beforeOnduty.map((d) => {
      const a = {
        name: d.name,
        date: dayjs(d.onduty_date).format("YYYY-MM-DD"),
        maintain_afternoon_name: d.maintain_afternoon_name,
      };

      if (!d.maintain_afternoon_name) {
        delete a.maintain_afternoon_name;
      }

      return a;
    });

    return data;
  }

  /**
   *
   * @param day 日期YYYY-MM-DD
   * @param statistical 0=不納入權重計算
   */
  public async editStatisticale(
    day: string[],
    statistical: 0 | 1
  ): Promise<void> {
    let sql = `UPDATE \`onduty\` SET \`statistical\` = '${statistical}' WHERE`;
    sql += day.map((d) => `\`onduty\`.\`onduty_date\` = '${d}'`).join(" OR ");

    await this.query(sql);
  }

  /**
   * 新增組員
   * @param name 名稱
   */
  public async addMember(name: string): Promise<void> {
    const sql = `INSERT INTO \`group_member\` (\`name\`) VALUES ('${name}')`;

    await this.query(sql);
  }

  /**
   * 刪除組員
   * @param name 名稱
   */
    public async deleteMember(
    name: string,
    startDate?: string,
    endDate?: string,
    ): Promise<DeleteMember[]> {
    let getDelDay = `SELECT \`onduty_date\` , \`isMaintain\` FROM \`onduty\` WHERE \`nameID\` = (SELECT id FROM group_member WHERE name = '${name}')`;

    if (startDate) {
      getDelDay += ` AND \`onduty_date\` >= '${dayjs(startDate)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD")}'`;
    }

    if (startDate && endDate) {
      getDelDay += `AND \`onduty_date\` <= '${dayjs(endDate)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD")}'`;
    }

    const delday = `DELETE FROM \`onduty\` WHERE \`nameID\` = (SELECT id FROM group_member WHERE name = '${name}')
      OR \`maintain_afternoon\` = (SELECT id FROM group_member WHERE name = '${name}')`;
    const delmember =  `DELETE FROM group_member WHERE name = '${name}'`

    let delDayData = await this.query<DeleteMember>(getDelDay);
    await this.query(delday);
    await this.query(delmember);
    await this.query('SET FOREIGN_KEY_CHECKS=1')

    return delDayData;
  }

  /**
   * getGroupMemberList
   */
  public async getGroupMemberList(): Promise<MemberData[]> {
    const member = await this.query<MemberData>(
      "SELECT * FROM `group_member` ORDER BY `id` ASC"
    );

    return member;
  }
}
