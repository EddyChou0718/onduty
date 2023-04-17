# 2021-12-14 新增是否納入統計欄位

ALTER TABLE `onduty` ADD `statistical` BOOLEAN NOT NULL DEFAULT TRUE AFTER `maintain_afternoon`;

