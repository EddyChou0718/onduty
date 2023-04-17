import { IsArray } from "class-validator";
import { Type } from "class-transformer";
import dayjs from "dayjs";

export class ListData {
  @Type(() => String || undefined)
  _endDay: string | undefined;

  @Type(() => String || undefined)
  _startDay: string | undefined;

  @Type(() => String || Number || undefined)
  statistical: (0|1| 'all') | undefined;

  @Type(() => String || undefined)
  _username: string | undefined;

  set endDay(v: any) {
    if (v && dayjs(v).isValid()) {
      this._endDay = dayjs(v).format("YYYY-MM-DD");
    }
  }

  get endDay(): string {
    return this._endDay || "";
  }

  set startDay(v: any) {
    if (v && dayjs(v).isValid()) {
      this._startDay = dayjs(v).format("YYYY-MM-DD");
    }
  }

  get startDay(): string {
    return this._startDay || "";
  }

  set username(v: any) {
    if (v) {
      this._username = v;
    }
  }

  get username(): string {
    return this._username || "";
  }
}

export class addCsv extends ListData {
  @Type(() => String)
  _endDay: string | undefined;

  @IsArray()
  private _maintain: Array<string> | undefined = [];

  set maintain(v: Array<string>) {
    v.forEach((d) => {
      if (dayjs(d).isValid()) {
        this._maintain?.push(dayjs(d).format("YYYY-MM-DD"));
      } else {
        this._maintain = undefined;
        return;
      }
    });
  }

  get maintain(): Array<string> {
    return this._maintain || [];
  }
}

export class addMember {
  @Type(() => String)
  name: string | undefined;
}

export class delMember {
  @Type(() => String || undefined)
  _endDay: string | undefined;

  @Type(() => String || undefined)
  _startDay: string | undefined;

  @Type(() => String || undefined)
  _username: string | undefined;

  set endDay(v: string) {
    if (v && dayjs(v).isValid()) {
      this._endDay = dayjs(v).format("YYYY-MM-DD");
    }
  }

  get endDay(): string {
    return this._endDay || "";
  }

  set startDay(v: any) {
    if (v && dayjs(v).isValid()) {
      this._startDay = dayjs(v).format("YYYY-MM-DD");
    }
  }

  get startDay(): string {
    return this._startDay || "";
  }

  set username(v: any) {
    if (v) {
      this._username = v;
    }
  }

  get username(): string {
    return this._username || "";
  }
}
