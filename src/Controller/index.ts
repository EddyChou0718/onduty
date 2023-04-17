import "reflect-metadata";
import { Context } from "koa";
import dayjs from "dayjs";
import { plainToClassFromExist } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { addCsv, ListData, addMember, delMember } from ".././validatorData";
import { statisticalType } from "../services/type";
import services from "../services";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default class Controller {
  public static async getGroupMemberList(ctx: Context): Promise<void> {
    const groupMember = await services.getGroupMemberList();

    ctx.status = 200;
    ctx.body = groupMember;
  }

  // api = /onduty / 產生
  public static async onduty(ctx: Context): Promise<void> {
    const d = plainToClassFromExist(new addCsv(), ctx.request.body);
    const errors: ValidationError[] = await validate(d);

    if (errors.length > 0) {
      ctx.state = 400;
      ctx.body = errors;

      return;
    }

    const addData = await services.randomOnduty(
      d.endDay,
      d.maintain,
      d.startDay
    );
    if (addData === undefined) {
      ctx.state = 200;
      ctx.body = "沒有新增值班";

      return;
    }

    const groupMember = await services.getGroupMember(
      addData?.startDay,
      addData?.endDay
    );
    const data = groupMember.reduce((accumulator, currentValue) => {
      const content =
        currentValue.Fri.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Mon.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Sat.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Sun.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Thu.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Tue.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Wed.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.maintain
          .map((v) => {
            const afternoon = groupMember.find((d) => {
              return d.maintain_afternoon.indexOf(v) !== -1;
            })?.name;

            return `\r\n#${currentValue.name}/${afternoon},${v}`;
          })
          .join("");

      return `${accumulator}${content}`;
    }, "\uFEFF Subject,Start Date");

    ctx.state = 200;
    ctx.body = data;
  }

  // api = /onduty/add 新增組員
  public static async addMember(ctx: Context): Promise<void> {
    const d = plainToClassFromExist(new addMember(), ctx.request.query);
    const errors: ValidationError[] = await validate(d);
    if (errors.length > 0 || !d.name) {
      ctx.state = 400;
      ctx.body = errors;

      return;
    }

    await services.addMember(d.name)
    ctx.state = 200;
    ctx.body = 'ok';
  }

    // api = /onduty/add 新增組員
    public static async deleteMember(ctx: Context): Promise<void> {
      const d = plainToClassFromExist(new delMember(), ctx.request.query);
      const errors: ValidationError[] = await validate(d);
      if (errors.length > 0 || !d.username) {
        ctx.state = 400;
        ctx.body = errors;

        return;
      }

      const data = await services.deleteMember(d.username, d?.startDay, d?.endDay);
      const groupMember = await services.getGroupMember(
        d?.startDay,
        d?.endDay
      );

      const csv = data.reduce((accumulator, currentValue) => {
        const name = groupMember.find(d => d.id === currentValue.id)?.name;
        if(currentValue.isMaintain){
          const afternoon = groupMember.find(d => d.id === currentValue.maintain_afternoon)?.name;
          const content = `\r\n#${name}/${afternoon},${currentValue.onduty_date}`;
          return `${accumulator}${content}`;
        }

        return `${accumulator}${`\r\n#${name},${currentValue.onduty_date}`}`;
      }, "\uFEFF Subject,Start Date")
      ctx.state = 200;
      ctx.body = csv;
    }

  // api = /onduty/list 查看全部資料
  public static async list(ctx: Context): Promise<void> {
    const d = plainToClassFromExist(new ListData(), ctx.request.query);
    const errors: ValidationError[] = await validate(d);

    if (errors.length > 0) {
      ctx.state = 400;
      ctx.body = errors;

      return;
    }

    let statistical = statisticalType.true;

    if (d.statistical === "all") {
      statistical = statisticalType.all;
    }

    if (d.statistical === 0) {
      statistical = statisticalType.false;
    }

    ctx.state = 200;
    ctx.body = await services.getGroupMember(d.startDay, d.endDay, statistical);
  }

  // api = /onduty/list/filter 取得特定成員資料
  public static async filterList(ctx: Context): Promise<void> {
    const d = plainToClassFromExist(new ListData(), ctx.request.query);
    const errors: ValidationError[] = await validate(d);

    if (errors.length > 0) {
      ctx.state = 400;
      ctx.body = errors;

      return;
    }

    let statistical = statisticalType.all;

    if (d.statistical === "all") {
      statistical = statisticalType.all;
    }

    if (d.statistical === 1) {
      statistical = statisticalType.true;
    }

    ctx.state = 200;
    ctx.body = await services.getGroupMemberByName(
      d.username,
      d.startDay,
      d.endDay,
      statistical,
    );
  }

  // api = /onduty/list/length //不產生
  public static async dataLength(ctx: Context): Promise<void> {
    const d = plainToClassFromExist(new ListData(), ctx.request.query);
    const errors: ValidationError[] = await validate(d);

    if (errors.length > 0) {
      ctx.state = 400;
      ctx.body = errors;

      return;
    }

    let statistical = statisticalType.true;

    if (d.statistical === "all") {
      statistical = statisticalType.all;
    }

    if (d.statistical === 0) {
      statistical = statisticalType.false;
    }

    ctx.state = 200;
    ctx.body = await (
      await services.getGroupMember(d.startDay, d.endDay, statistical)
    ).map((vv) => ({
      name: vv.name,
      Fri: vv.Fri.length,
      Mon: vv.Mon.length,
      Sat: vv.Sat.length,
      Sun: vv.Sun.length,
      Thu: vv.Thu.length,
      Tue: vv.Tue.length,
      wed: vv.Wed.length,
      maintain: vv.maintain.length,
      maintain_afternoon: vv.maintain_afternoon.length,
    }));
  }

  // api = /onduty/list/csv 取得csv
  public static async getCsv(ctx: Context): Promise<void> {
    const d = plainToClassFromExist(new ListData(), ctx.request.query);
    const errors: ValidationError[] = await validate(d);

    if (errors.length > 0) {
      ctx.state = 400;
      ctx.body = errors;

      return;
    }

    let statistical = statisticalType.true;

    if (d.statistical === "all") {
      statistical = statisticalType.all;
    }

    if (d.statistical === 0) {
      statistical = statisticalType.false;
    }

    const groupMember = await services.getGroupMember(d.startDay, d.endDay, statistical);
    const data = groupMember.reduce((accumulator, currentValue) => {
      const content =
        currentValue.Fri.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Mon.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Sat.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Sun.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Thu.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Tue.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.Wed.map((v) => `\r\n#${currentValue.name},${v}`).join("") +
        currentValue.maintain
          .map((v) => {
            const afternoon = groupMember.find((d) => {
              return d.maintain_afternoon.indexOf(v) !== -1;
            })?.name;

            return `\r\n#${currentValue.name}/${afternoon},${v}`;
          })
          .join("");

      return `${accumulator}${content}`;
    }, "\uFEFF Subject,Start Date");

    ctx.state = 200;
    ctx.body = data;
  }

  // api:/onduty/list/filter/csv 取得特定使用者csv
  public static async getCsvByName(ctx: Context): Promise<void> {
    const d = plainToClassFromExist(new ListData(), ctx.request.query);
    const errors: ValidationError[] = await validate(d);

    if (errors.length > 0) {
      ctx.state = 400;
      ctx.body = errors;

      return;
    }

    let statistical = statisticalType.all;

    if (d.statistical === "all") {
      statistical = statisticalType.all;
    }

    if (d.statistical === 1) {
      statistical = statisticalType.true;
    }

    const groupMemberByName = await services.getGroupMemberByName(
      d.username,
      d.startDay,
      d.endDay,
      statistical
    );
    const data = groupMemberByName.onduty_date.reduce(
      (accumulator, currentValue) => {
        let content = `\r\n#${currentValue.name}`;

        if (currentValue.maintain_afternoon_name) {
          content += `/${currentValue.maintain_afternoon_name}`;
        }

        content += `,${currentValue.date}`;

        return `${accumulator}${content}`;
      },
      "\uFEFF Subject,Start Date"
    );

    ctx.state = 200;
    ctx.body = data;
  }
}
