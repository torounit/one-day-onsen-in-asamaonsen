const client = require('cheerio-httpcli');
const fs = require('fs');

const list = 'http://asamaonsen.jp/asamap/%E5%A4%96%E6%B9%AF%E3%81%A8%E7%A5%AD%E3%82%8A%E6%A1%88%E5%86%85/';

client.fetch(list).then( result => {
	let $ = result.$
	return $('.asamap-list li a').map( (i,obj) => {
		if( $(obj).text().indexOf('【湯】') != -1 ) {
			return $(obj).attr('href');
		}
	}).get();

}).then( links => {
	return links.map( (link) => {
		return client.fetch(link)
	})
}).then((p) => {
	return Promise.all(p)

}).then(results => {
	"use strict";
	let data = results.map( result => {
		let $ = result.$
		let title = $('#main_image3 h2').text().replace( /【湯】/g , "" )
		let tds = $('.culture td');
		let address = tds.eq(0).text().replace(/〒390-0303　|\[地図\]/g,'');
		let tel = tds.eq(1).text();
		let price = tds.eq(2).text();

		return {
			title,
			address,
			tel,
			price
		}
	})

	fs.writeFileSync('data.json', JSON.stringify(data, null, "    "));

})

