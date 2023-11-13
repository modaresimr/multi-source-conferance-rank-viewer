$(document).ready(function () {
	// Read CSV File
	$.ajax({
		type: "GET",
		url: "aut-q-2023.csv",
		dataType: "text",
		success: function (data) {
			processData(data);
		}
	});

	function processData(allText) {
		var allTextLines = allText.split(/\r\n|\n/);
		var headers = allTextLines[0].split(',');
		var lines = [];

		for (var i = 1; i < allTextLines.length; i++) {
			data = replace_extra_keywords(allTextLines[i]);
			var data = data.split(',');

			if (data.length == headers.length) {
				var tarr = [];
				for (var j = 0; j < headers.length; j++) {
					cell = data[j]
					if (j == 0) {
						var searchQuery = encodeURIComponent(data[j] + " Journal + scimagojr " + data[1] + " " + data[2]);
						cell = '<a href="https://www.google.com/search?q=' + searchQuery + '" target="_blank">' + data[j] + '</a>';
					}
					tarr.push(cell);
				}
				lines.push(tarr);
			}
		}

		// Add data to table
		for (var i = 0; i < lines.length; i++) {
			var rowData = lines[i];
			var row = $("<tr />");
			$("#csvDataTable").append(row);
			row.append($("<td>" + rowData[0] + "</td>"));
			row.append($("<td>" + rowData[1] + "</td>"));
			row.append($("<td>" + rowData[2] + "</td>"));
			row.append($("<td>" + rowData[3] + "</td>"));
			row.append($("<td>" + rowData[4] + "</td>"));
			row.append($("<td>" + rowData[5] + "</td>"));
			row.append($("<td>" + rowData[6] + "</td>"));
			row.append($("<td>" + rowData[7] + "</td>"));
		}

		// Initialize DataTable
		$('#csvDataTable').DataTable({
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
	a = `${input}`.toLowerCase().replace(/Journal/gi, "").replace(/ of /g, "").replace(/ & /g, " ").replace(/ and /g, " ").replaceAll(/[ ]+/g, " ").trim();
	return a;
}