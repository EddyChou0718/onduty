# Api

- ## POST: /onduty 產生值班

|req|type|Description|
|---|----|----|
|endDay|string|產生結束時間 YYYY-MM-DD|
|startDay|string|產生結束時間 YYYY-MM-DD|
|maintain|string[]|大維護時間 ["YYYY-MM-DD", "YYYY-MM-DD"]|

res: 排班csv

- ## POST /onduty/add_member 新增人員 !尚未完成 目前只有歸零

操作方式: 先打api 在去資料庫手動新增人員

|req|type|Description|
|---|----|----|
|name|string|名稱|

- ## GET  /onduty/list 取得排班資料 (不會產生排班)

|req|type|Description|
|---|----|----|
|statistical|'all' or 0 or 1|要查詢是否納入權重 (可選) 預設: all|
|endDay|string|查詢結束時間 YYYY-MM-DD|
|startDay|string|查詢結束時間 YYYY-MM-DD|

res:

```javaScript
[{
  id: number,
  name: string,
  Mon: [],
  Tue: [],
  Wed: [],
  Thu: [],
  Fri: [],
  Sat: [],
  Sun: [],
  maintain: [],
  maintain_afternoon: [],
}]
```

- ## GET /onduty/list/length 取得長度 (不會產生排班)

|req|type|Description|
|---|----|----|
|statistical|'all' or 0 or 1|要查詢是否納入權重 (可選) 預設: all|
|endDay|string|查詢結束時間 YYYY-MM-DD|
|startDay|string|查詢結束時間 YYYY-MM-DD|

res:

```javaScript
[{
  id: number,
  name: string,
  Mon: number,
  Tue: number,
  Wed: number,
  Thu: number,
  Fri: number,
  Sat: number,
  Sun: number,
  maintain: number,
  maintain_afternoon: number,
}]
```

- ## GET /onduty/list/csv 取得csv (不會產生排班)

|req|type|Description|
|---|----|----|
|statistical|'all' or 0 or 1|要查詢是否納入權重 (可選) 預設: all|
|endDay|string|查詢結束時間 YYYY-MM-DD|
|startDay|string|查詢結束時間 YYYY-MM-DD|

res: csv

- ## GET /onduty/list/filter 取得特定使用者 (不會產生排班)

|req|type|Description|
|---|----|----|
|statistical|'all' or 0 or 1|要查詢是否納入權重 (可選) 預設: all|
|endDay|string|查詢結束時間 YYYY-MM-DD|
|startDay|string|查詢結束時間 YYYY-MM-DD|
|username|string|名稱|

- ## GET /onduty/list/filter/csv 取得特定使用者csv (不會產生排班)

|req|type|Description|
|---|----|----|
|statistical|'all' or 0 or 1|要查詢是否納入權重 (可選) 預設: all|
|endDay|string|查詢結束時間 YYYY-MM-DD|
|startDay|string|查詢結束時間 YYYY-MM-DD|
|username|string|名稱|

res: csv

- ## delete /onduty/delete 刪除特定使用者並且將刪除的人重新產生值班

|req|type|Description|
|---|----|----|
|endDay|string|重新產生結束時間 YYYY-MM-DD|
|startDay|string|重新產生起始時間 YYYY-MM-DD|
|username|string|名稱|

res: csv
