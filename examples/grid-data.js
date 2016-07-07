/**
 * @pageNo 页码，默认为 1
 * @pageSize 页容量，默认为 25
 */
const page = function (url, pageNo = 1, pageSize = 25) {
	console.log("url=%s, pageNo=%s, pageSize=%s", url, pageNo, pageSize);
	let d = { pageNo: pageNo, pageSize: pageSize, count: 333 };

	// 表头列
	d.columns = [
		{
			"id": "date",
			"label": "日期",
			"width": "7em"
		},
		{
			"id": "str",
			"label": "文本",
			"width": "15em"
		},
		{
			"id": "money",
			"label": "金额（元）",
			"children": [
				{
					"id": "moneyIn",
					"label": "支出",
					"width": "7em"
				},
				{
					"id": "moneyOut",
					"label": "收入",
					"width": "7em"
				}
			]
		},
		{
			"id": "num",
			"label": "数字",
			"width": "7em"
		}
	];

	// 生成数据
	d.rows = [];
	let row;
	let from = (pageNo - 1) * pageSize + 1;
	let to = Math.min(from + pageSize - 1, d.count);
	for (let n = from; n <= to; n++) {
		d.rows[n - from] = row = {};
		// date
		row.date = new Date();
		row.date.setDate(row.date.getDate() - n);
		row.date.setHours(0, 0, 0, 0);
		row.date = row.date.getFullYear() + "-" + (row.date.getMonth() + 1) + "-" + row.date.getDate();

		// str
		row.str = "文本" + n;

		// num
		row.num = n;

		// money
		row.moneyIn = n * 100;
		row.moneyOut = n + 100.05;
	}

	return d;
};

/*! 动态生成 grid 的 demo 数据 */
module.exports = {
	page: page
};