$(document).ready(function () {
	// Read CSV File
	// $.ajax({
	// 	type: "GET",
	// 	url: "aut-q-2023.csv",
	// 	dataType: "text",
	// 	success: function (data) {
	// 		processData(data);
	// 	}
	// });
	Papa.parse("aut-q-2023.csv", {
		download: true,
		header: true, // Set to true if your data has headers
		complete: function (results) {
			data = results.data
			data = data.filter(function (row) {
				if (row['Journal Name'] == "") {
					return false
				}
				return true
			})
			console.log(results.data);
			processData(results.data); // Call your function to process data
		}
	});
	function processData(data) {
		console.log(data[13014]);
		var table = $('#csvDataTable').DataTable({
			data: data,
			columns: [
				{
					data: 'Journal Name',
					render: function (data, type, row) {
						if (data == "") {
							return data
						}
						var searchQuery = encodeURIComponent(data + " Journal scimagojr " + row['ISSN'] + " " + row['EISSN']);
						return '<a href="https://www.google.com/search?q=' + searchQuery + '" target="_blank">' + replace_extra_keywords(data) + '</a>';
					}
				},
				{ data: 'ISSN' },
				{ data: 'EISSN' },
				{ data: 'IF' },
				{ data: 'Best Quartile' },
				{ data: 'Quartiles' },
				{ data: 'Eigen Factor' },
				{ data: 'MIF' }
			]
			,
			// "search": {
			// 	// "smart": true,
			// 	// "search": function (search) {
			// 	// 	return replace_extra_keywords(search)
			// 	// }
			// }
			initComplete: function () {
				var api = this.api();
				$('#csvDataTable_filter input').off().on('input', function () {
					api.search(replace_extra_keywords(this.value)).draw();
				});
			}
		});
	}
	// Custom Search Function
	// $.fn.DataTable.ext.search.push(function (settings, searchData, index, rowData, counter) {
	// 	var input = $('#csvDataTable_filter input').val();
	// 	var modifiedInput = replace_extra_keywords(input)
	// 	console.log(modifiedInput);
	// 	for (var i = 0; i < searchData.length; i++) {
	// 		if (replace_extra_keywords(searchData[i]).includes(modifiedInput)) {
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// });




});

function replace_extra_keywords(input) {
	a = `${input}`.replace(/Journal/gi, "").replace(/ of /g, "").replace(/ & /g, " ").replace(/ and /g, " ").replaceAll(/[ ]+/g, " ").trim();
	return a;
}