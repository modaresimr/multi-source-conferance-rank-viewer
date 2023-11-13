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
			responsive: true,
			data: data,
			select: {
				style: 'multi',
				selector: 'td:first-child'
			},
			dom: '<"top"f>it<"bottom"lrp><"clear">',

			columns: [
				{
					data: 'EISSN', render: () => '',
					orderable: false,
					className: 'select-checkbox',
					targets: 0, width: "80px"
				},
				{
					data: 'Journal Name', orderable: false,

					render: function (data, type, row) {
						if (data == "") {
							return data
						}
						var searchQuery = encodeURIComponent(data + " Journal scimagojr " + row['ISSN'] + " " + row['EISSN']);
						return '<a href="https://www.google.com/search?q=' + searchQuery + '" target="_blank">' + replace_extra_keywords(data) + '</a>';
					}
				},
				{ data: 'Best Quartile', orderable: false, },
				{
					data: 'Quartiles', orderable: false,
					render: function (data, type, row) {
						return "<div style=''>• " + data.replaceAll(";", "<br>• ") + "</div>"
					},
				},
				{
					data: 'ISSN', orderable: false,
					render: function (data, type, row) {
						return '<div class="issn">' + row['ISSN'] + "," + row['EISSN'].replace("N/A,", "").replace(",N/A", "").trim() + "</div>"

					}
				},
				{ data: 'IF' },
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
		table.on("search.dt", function () {

			updateShare("#q=" + table.search());
		});
		function hashfunc() {
			if (old_hash == window.location.hash)
				return
			old_hash = window.location.hash

			params = new URLSearchParams(
				window.location.hash.substr(1) // skip the first char (#)
			);

			if (params.get("q") != null) {
				table.search(params.get("q")).draw();
			}
			if (params.get("issn") != null && params.get("issn") != "") {
				already_selected = get_selected_ISSN()
				old_select = {}
				params.get("issn").split(",").forEach(p => {
					old_select[p] = 1
					if (already_selected.includes(p)) return
					table.rows().every(function () {
						var data = this.data();
						if (data['ISSN'].includes(p)) {
							this.select();
						}
					});
				})
				already_selected.forEach(p => {
					if (old_select[p] != 1) {
						table.rows().every(function () {
							var data = this.data();
							if (data['ISSN'].includes(p)) {
								this.deselect();
							}
						});
					}
				})


				table.draw();
			}
		}
		window.addEventListener("hashchange", hashfunc, false);

		function get_selected_ISSN() {
			return Array.from(table.rows({ selected: true }).data().map(p => (p['ISSN'] + "," + p['EISSN']).replace("N/A,", "").replace(",N/A", "")))
		}
		table.on('select', function (e, dt, type, indexes) {
			var res = get_selected_ISSN()
			updateShare("#issn=" + res)
		})
			.on('deselect', function (e, dt, type, indexes) {
				var res = get_selected_ISSN()
				updateShare("#issn=" + res)
			});
		$(".dataTables_filter").append($(".dataTables_filter label input"));
		$(".dataTables_filter, .dataTables_filter input").attr("style", "width:100%");
		$(".dataTables_filter label").hide();
		$(".dataTables_filter input").attr("placeholder", "Search any topic, conference journal, etc.");

		//$("div.toolbar").html('<input type="search" class="" placeholder="" aria-controls="rankTable" style="width: 100%;">'
		$("#csvDataTable tbody").on('click', 'label', function () {
			$(this).parent().parent().toggleClass('selected');
			// if (row['Issn']) {
			//     row['Issn'].forEach(p=>{
			//         if ($(this).parent().parent().hasClass('selected'))
			//             selectedIssns[p]=1
			//         else
			//             delete selectedIssns[p]
			//     })
			//     updateShare("#issn="+Object.keys(selectedIssns).join(","))
			// }

		});
		cols = ["Select", "Journal Name", "Rank", "Quartiles", "ISSN", "IF", "EF", "MIF"]
		table.columns().every(function () {
			var column = this;
			if (["ISSN", 'IF', 'EF', 'MIF'].indexOf(cols[column[0]]) >= 0) {
				$("<span>" + cols[column[0]] + "</span>").appendTo($(column.header()).empty());
				return;
			}
			if (["Select"].indexOf(cols[column[0]]) >= 0) {
				$("<input class='filter-table' type='checkbox'/>").appendTo($(column.header()).empty()).on('change', (ev) => {
					var val = ev.target.checked;
					console.log(val);
					if (val) {
						$.fn.dataTable.ext.search.push(
							function (settings, data, dataIndex) {
								return ($(table.row(dataIndex).node()).hasClass('selected')) ? true : false;
							}
						);
						table.draw();
					} else {//if ('✗' == val) {
						while ($.fn.dataTable.ext.search.length > 0)
							$.fn.dataTable.ext.search.pop();
						table.draw();
					}
				}
				);
				return;
			}
			var scimagRanks = ['Q1|Q2', 'Q1|Q2|Q3', 'Q1', 'Q2', 'Q3', 'Q4']

			var select = $('<select class="filter-table" style="width:100%" data-placeholder="' + cols[column[0]] + '"><option value=""></option></select>')
				.appendTo($(column.header()).empty())
				.on("change", function () {
					var val = $.fn.dataTable.util.escapeRegex($(this).val());
					if (["Quartiles"].indexOf(cols[column[0]]) >= 0) column.search(val ? val.replaceAll('\\', '') : "", true, false).draw();
					else if (["Quartiles"].indexOf(cols[column[0]]) >= 0) {
						column.search(val ? val : "", true, false).draw();
						// $(`td span`).removeClass('bold')
						// $(`td span:contains("${val}")`).addClass('bold')
					} else if (["Select"].indexOf(cols[column[0]]) >= 0) {
						if ('✓' == val) {
							$.fn.dataTable.ext.search.push(
								function (settings, data, dataIndex) {
									return ($(table.row(dataIndex).node()).hasClass('selected')) ? true : false;
								}
							);
							table.draw();
						} else {//if ('✗' == val) {
							$.fn.dataTable.ext.search.pop();
							table.draw();
						}
					}

					// else if (["Rank"].indexOf(cols[column[0]]) >= 0) {
					//     val = val.replaceAll('\\', '').replaceAll('A*', 'A\\*')
					//     column.search(val ? `^(${val})$` : "", true, false, false).draw();
					// }
					else column.search(val ? "^(" + val.replaceAll('\\', '') + ")$" : "", true, false, false).draw();
				});

			if (cols[column[0]] == "Quartiles") {
				var alltopics = {};
				data.forEach((d) => d['Quartiles'].split(';').forEach(p => alltopics[p] = 1));

				Array.from(Object.keys(alltopics))
					.sort()
					//.forEach((p) => {var d=p.split('-')[1].trim(); select.append('<option value="' + d + '">' + d + "</option>")});
					.forEach((d) => select.append('<option value="' + d + '">' + d + "</option>"));
			} else if (cols[column[0]] == "Rank") {
				scimagRanks.forEach((d) => select.append('<option value="' + d + '">' + d + "</option>"));
			} else if (cols[column[0]] == "Select") {
				['✓'].forEach((d) => select.append('<option value="' + d + '">' + d + "</option>"));
			}


			else if (cols[column[0]] == "CatRank") {
				scimagRanks.forEach((d) => select.append('<option value="' + d + '">' + d + "</option>"));
			} else {
				column
					.data()
					.unique()
					.sort()
					.each(function (d, j) {
						select.append('<option value="' + d + '">' + d + "</option>");
					});
			}

		});
		table.on('draw', function () {
			var body = $(table.table().body());

			body.find('td span').removeClass('bold');
			var sear = table.columns(cols.indexOf('Quartiles')).search()?.[0]
			if (sear)
				body.find(`td span:contains('${sear}')`).addClass('bold');

		});
		$("select.filter-table").select2({ dropdownCssClass: "bigdrop", tags: true, allowClear: true });

		function updateShare(search) {
			url = document.location.href.split("#")[0] + search;
			if (search.length < 6) return
			$("#share").attr("href", url);
			$("#share").text(url);
			old_hash = search
			window.location.hash = search;
		}
		if (document.location.hash.includes("issn")) {
			$(".filter-table")[0].checked = true
			$.fn.dataTable.ext.search.push(
				function (settings, data, dataIndex) {
					return ($(table.row(dataIndex).node()).hasClass('selected')) ? true : false;
				}
			);
		}
		updateShare(document.location.hash);
		old_hash = ""
		hashfunc();
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



	$("#share").click(function () {
		if (navigator.share) {
			navigator.share({
				//   title: document.title,
				text: "Journals",
				url: $("#share").attr("href")
			})
				.then(() => console.log('Successful share'))
				.catch(error => console.log('Error sharing:', error));
		}
	})
});

function replace_extra_keywords(input) {
	a = `${input}`.replace(/Journal/gi, "").replace(/ of /g, "").replace(/ & /g, " ").replace(/ and /g, " ").replaceAll(/[ ]+/g, " ").trim();
	return a;
}
old_hash = ""
var selectedIssns = []
function format_row(item) {
	return '<tr>' + item + "</tr>"
}
function format_a(text, link) {
	return `<a href='${link}' target="_blank">${text}</a> `
}

