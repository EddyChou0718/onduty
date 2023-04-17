import Router from "koa-router";
import controller from "./Controller";


const router = new Router();

// 產生 回傳csv
router.post("/onduty", controller.onduty);

// 新增人員
router.post("/onduty/add_member", controller.addMember);

// 取得
router.get("/onduty/list", controller.list);

// 取得特定使用者
router.get("/onduty/list/filter", controller.filterList);

// 取得長度
router.get("/onduty/list/length", controller.dataLength);

// 取得csv
router.get("/onduty/list/csv", controller.getCsv);

// 取得特定使用者csv
router.get("/onduty/list/filter/csv", controller.getCsvByName);

// 刪除特定使用者
router.delete("/onduty/delete", controller.deleteMember);

// 取得使用者列表
router.get("/onduty/groupMember", controller.getGroupMemberList);

export default router;
