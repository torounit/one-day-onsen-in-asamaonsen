const client = require('cheerio-httpcli');
const fs = require('fs');

const list = 'http://asamaonsen.jp/asamap/%E5%A4%96%E6%B9%AF%E3%81%A8%E7%A5%AD%E3%82%8A%E6%A1%88%E5%86%85/';

client.fetch(list).then( result => {
	console.log('--- Fetch URL List ---')
	let $ = result.$
	return $('.asamap-list li a').map( (i,obj) => {
		if( $(obj).text().indexOf('【湯】') != -1 ) {
			return $(obj).attr('href');
		}
	}).get();

}).then( links => {
	console.log('--- Fetching onsen data ---')
	return Promise.all( links.map( (link) => {
		return client.fetch(link)
	}))
}).then(results => {
	console.log('--- Fetched onsen data ---')
	let data = results.map( result => {
		let $ = result.$
		let data = {
			title: '',
			address: '',
			tel: '',
			price: ''
		};
		data.title = $('#main_image3 h2').text().replace( /【湯】/g , "" );
		let rows = $('.culture tr');
		rows.each((i,row) => {
			"use strict";
			switch ($(row).find('th').text()) {
				case '住所':
					data.address = $(row).find('td').text();
					break;
				case 'TEL':
					data.tel = $(row).find('td').text();
					break;
				case '料金':
					data.price = $(row).find('td').text();
					break;
			}

		});
		return data
	})
	console.log('--- Create JSON ---')
	fs.writeFileSync('data.json', JSON.stringify(data, null, "    "));

})

