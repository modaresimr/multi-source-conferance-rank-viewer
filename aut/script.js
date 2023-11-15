var inprogress=false;
$(document).ready(function () {
	// Read CSV File
	// $.ajax({
	// 	type: "GET",
	// 	url: "aut-els-2023.json",
	// 	dataType: "json",
	// 	success: function (data) {
	// 		processData(data);
	// 	}
	// });
	Papa.parse("aut-els-insights-lite-2023.csv", {
		download: true,
		header: true, // Set to true if your data has headers
		complete: function (results) {
			data = results.data
			data = data.filter(function (row) {
				if (row['subjectAreas'] != undefined && row['subjectAreas'] != '')
					row['Quartiles'] += ";" + JSON.parse(row['subjectAreas'].replaceAll("'", '"')).join(";")
				if (row['journal'] != undefined && row['journal'] != "") {
					row['aut_valid'] = row['aut_valid'] == '' ? "No! Not Free" : "Yes"
				} else {
					row['aut_valid'] = 'Unknown'
				}
				if (row['Best Quartile'] == "Q3" || row['Best Quartile'] == "Q4")
					row['aut_valid'] = `No! ${row['Best Quartile']}`
				// if (row['aut_valid'] != "Yes") return false
				if (row['Journal Name'] != undefined && row['Journal Name'].length > 2) {
					return true
				}
				return false
			})
			console.log(results.data);
			processData(data); // Call your function to process data
		}
	});
	function processData(data) {
		cols = ["Select", "Journal Name", "Rank", "Topics", "AUT", "AR✅", "Rev1", "TF", "RT", "SA", "AP", "ISSN", "IF", "EF", "MIF", "Search",]
		var buttonCommon = {
			exportOptions: {
				format: {
					header: function (data, column, node) {
						// Strip $ from salary column to make it numeric
						// return column === 5 ?
						return cols[column]
						// 	data.replace( /[$,]/g, '' ) :
						// 	data;
					}
				}
			}
		};

		var table = $('#csvDataTable').DataTable({
			// responsive: true,
			data: data,"lengthMenu": [10, 25, 50, 100, 500],
			select: {
				style: 'multi',
				selector: 'td:first-child'
			},
			dom: '<"top"f>it<"bottom"Blrp><"clear">',
			// dom: '',Bfrtip
			buttons: [
				$.extend(true, {}, buttonCommon, {
					extend: 'copyHtml5',
					 exportOptions: {
					    stripNewlines: false,stripHtml: false,
						 format: {
          body: function (data, row, column, node) {
            // Check if the node contains an anchor tag
            if ($(node).find('a').length > 0) {
              return $(node).find('a')[0].outerHTML;
            }
            return data;
          }
        }
					  },
					messageTop: document.location.href,
					title: 'AR=Acceptance Rate | Rev1=First Revision | TF=Time to first decision | RT=Review time | SA=Submission to acceptance | AP=Acceptance to publication'

				}),
				$.extend(true, {}, buttonCommon, {
					extend: 'excelHtml5', exportOptions: {
					    stripNewlines: false,stripHtml: false
					  },
				}),
			],

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
						if (row['journal'] != undefined && row['journal'] != '')
							data = row['journal']
						var searchQuery = encodeURIComponent(data + " Journal scimagojr " + row['ISSN'] + " " + row['EISSN']);
						return '<a href="https://www.google.com/search?q=' + searchQuery + '" target="_blank">' + replace_extra_keywords(data) + '</a>';
					}
				},
				{ data: 'Best Quartile', orderable: false, },
				{
					data: 'Quartiles', orderable: false, width: "200px",
					render: function (data, type, row) {
						if (data == "") {
							return data
						}
						return "<div style=''>• " + data.replaceAll(";", "<br>• ") + "</div>"
					},
				},

				{
					data: 'aut_valid', orderable: false, render: function (data, type, row) {
						if (row['journal'] != "") {
							var searchQuery = encodeURIComponent(`"${row['journal']}"`);
							return `<a target="_blank" href='https://journalfinder.elsevier.com/results?goldOpenAccess=true&subscription=true&elsevierOnly=true&sortBy=journal&sortOrder=asc&query=${searchQuery}&mode=search'>${data}</a>`

						}

						return data

					}
				},
				{
					data: 'AR', "type": "ali",
				},
				{ data: 'Rev1', "type": "ali" },
				// { data: 'timeToFirstDecision', },

				{ data: 'Time to first decision', "type": "ali" },
				{ data: 'Review time', "type": "ali" },
				{ data: 'Submission to acceptance', "type": "ali" },
				{ data: 'Acceptance to publication', "type": "ali" },

				// {
				// 	data: 'ISSN', orderable: false,
				// 	render: function (data, type, row) {
				// 		return '<div class="issn">' + row['ISSN'] + "," + row['EISSN'].replace("N/A,", "").replace(",N/A", "").trim() + "</div>"

				// 	}
				// },
				// { data: 'IF' },
				// { data: 'Eigen Factor' },
				// { data: 'MIF' },
				// {
				// 	data: 'Journal Name',
				// 	render: function (data, type, row) {
				// 		searchda = encodeURIComponent('"' + row['Journal Name'] + '"')
				// 		return '<a href="https://journalfinder.elsevier.com/results?goldOpenAccess=true&subscription=true&elsevierOnly=true&sortBy=default&sortOrder=desc&query=' + searchda + '&mode=search' + '" target="_blank"> SD</a>';
				// 	}
				// },
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
		$.fn.dataTable.ext.type.order['ali-asc'] = function (a, b) {
			if (a == '~' || a == '')
				return 1;
			else if (b == '~' || b == '')
				return -1;
			else {
				var ia = parseInt(a);
				var ib = parseInt(b);
				return (ia > ib) ? 1 : ((ia < ib) ? -1 : 0);
			}
		}
		$.fn.dataTable.ext.type.order['ali-desc'] = function (a, b) {
			if (a == '~' || a == '')
				return 1;
			else if (b == '~' || b == '')
				return -1;
			else {
				var ia = parseInt(a);
				var ib = parseInt(b);
				return (ia > ib) ? -1 : ((ia < ib) ? 1 : 0);
			}
		}
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
				inprogress = true;

				const already_selected = new Set(get_selected_ISSN());
				const issnList = new Set(params.get("issn").split(","));
				const rowsToSelect = new Set();
				const rowsToDeselect = new Set();
				
				table.rows().every(function () {
				  const data = this.data();
				  const issn = data['ISSN'];
				  hasissn=(data['ISSN'] !="" && issnList.has(data['ISSN'])) || (data['EISSN'] !="" &&issnList.has(data['EISSN']))
				  if (hasissn) {
				    rowsToSelect.add(this.index());
				  } else if (already_selected.has(issn)) {
				    rowsToDeselect.add(this.index());
				  }
				});
				
				table.rows(Array.from(rowsToSelect)).select();
				table.rows(Array.from(rowsToDeselect)).deselect();
				
				inprogress = false;
				table.draw();
			}
		}
		window.addEventListener("hashchange", hashfunc, false);

		function get_selected_ISSN() {
			return Array.from(table.rows({ selected: true }).data().map(p => (p['ISSN'] + "," + p['EISSN']).replace("N/A,", "").replace(",N/A", "")))
		}
		table.on('select', function (e, dt, type, indexes) {
			if (inprogress)return;
			var res = get_selected_ISSN()
			if (res.length > 0)
				updateShare("#issn=" + res)
			else
				updateShare("")
		})
			.on('deselect', function (e, dt, type, indexes) {
				if (inprogress)return;
				var res = get_selected_ISSN()
				if (res.length > 0)
					updateShare("#issn=" + res)
				else
					updateShare("#issn=")
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

		table.columns().every(function () {
			var column = this;
			if (["ISSN", 'IF', 'EF', 'Rev1', "RevF", "AR✅", 'MIF', "Search", "TF", "RT", "SA", "AP"].indexOf(cols[column[0]]) >= 0) {
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
			width = cols[column[0]] == "Rank" || cols[column[0]] == "AUT" ? "100px" : "300px"
			var select = $(`<select class="filter-table" style="min-width:${width};width:${width}" data-placeholder="${cols[column[0]]}"><option value=""></option></select>`)
				.appendTo($(column.header()).empty())
				.on("change", function () {
					var val = $.fn.dataTable.util.escapeRegex($(this).val());
					if (["Topics"].indexOf(cols[column[0]]) >= 0) column.search(val ? val.replaceAll('\\', '') : "", true, false).draw();
					else if (["Topics"].indexOf(cols[column[0]]) >= 0) {
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

			if (cols[column[0]] == "Topics") {
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
		if (document.location.hash.includes("issn") && document.location.hash.length > 6) {
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
	a = `${input}`.replace(/ of /gi, "").replace(/Journal/gi, "").replace(/ & /g, " ").replace(/ and /g, " ").replaceAll(/[ ]+/g, " ").trim();
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

