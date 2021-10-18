var rp = require('request-promise');
const cheerio = require('cheerio');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

///Usage: 
/*
 
  cats=[
     'computer science',
     'artificial intelligence',
     'machine learning',
     'internet of things',
     'healthcare',
     'IOT',
     'information retrieval',
     'intelligent systems',
     'multimedia',
     'signal processing',
     'deep learning',
     'applications',
     'AI',
     'sensors',
 ]
 cats=['computer science','data management','reliability','artificial intelligence','philosophy','web services','engineering','formal methods','data analytics','machine learning','chemistry','smart grid','security','informatics','religion','education','network security','agents','software engineering','sensor networks','nursing','data mining','agriculture','anthropology','information technology','medical','services','communications','parallel computing','medical imaging','robotics','high performance computing','music','big data','information','information system','cloud computing','materials science','VLSI','networking','cloud','ehealth','management','sustainable development','theory','signal processing','information management','text mining','image processing','internet','multi-agent systems','technology','power','linked data','NLP','civil engineering','mobility','business','computer architecture','cancer','multimedia','cyber security','knowledge representation','energy','learning','cardiology','economics','industrial engineering','workshop','control','visualization','development','computer vision','AI','software architecture','computing','culture','speech','mechanical engineering','social networks','computer security','humanities','innovation','ambient intelligence','bioinformatics','blockchain','technologies','automation','teaching','chemical','databases','cryptography','e-education','information systems','social media','safety','environment','politics','e-health','communication','marketing','public health','internet of things','programming languages','ethics','social sciences','wireless networks','augmented reality','wireless','network','conferences','electronics','physics','fuzzy systems','information retrieval','mobile computing','tourism','intelligent systems','language','transportation','computational intelligence','sociology','graphics','manufacturing','ubiquitous computing','recommender systems','healthcare','electrical','chemical engineering','IOT','wireless communications','analytics','networks','computer networks','entrepreneurship','privacy','computational linguistics','wireless communication','materials','biometrics','international relations','science','neural networks','GIS','nanotechnology','biomedical','environmental sciences','literature','mechanical','parallel processing','simulation','virtual reality','nutrition','biotechnology','pervasive computing','dependability','computer','cybersecurity','performance','e-learning','knowledge discovery','5G','semantic web','sensors','design automation','electrical engineering','arts','photonics','linguistics','electronics engineering','business intelligence','modeling','circuits','compilers','mechatronics','e-commerce','social','renewable energy','modelling','ecology','computer engineering','verification','social computing','social science','logic','logistics','pattern recognition','power engineering','grid computing','HCI','health informatics','climate change','embedded systems','smart cities','pediatrics','architecture','research','molecular biology','computer graphics','art','digital forensics','algorithms','computational biology','programming','software','neuroscience','film','health','wireless sensor networks','operating systems','conference','human-computer interaction','remote sensing','web','telecommunications','environmental','natural language processing','higher education','leadership','psychology','statistics','collaboration','information security','e-business','neurology','sustainability','software testing','trainings','finance','HPC','information theory','systems','evolutionary computation','digital humanities','interdisciplinary','media','edge computing','data science','power electronics','elearning','history','cognitive science','popular culture','distributed systems','semantics','industry','biomedical engineering','business management','measurement','biology','database','ontologies','design','trust','complexity','systems engineering','cyber-physical systems','ECONOMIC','mathematics','pedagogy','optics','information science','games','oncology','knowledge management','life sciences','civil','distributed computing','aerospace','middleware','medicine','electron devices','multidisciplinary','law','knowledge engineering','industrial electronics','environmental engineering','ICT','telecommunication','applications','theoretical computer science','data','deep learning','political science','green computing','mobile','society','applied science','optimization','ontology','english','cultural studies','human computer interaction','psychiatry','soft computing','testing','IT']
 fetch([],cats,res=>console.log(res))
 cats.forEach(p=>{
    getInfo(p,1,20,all=>{
        fillDetails(all, res => console.log('finished'))
    })
})

*/
//After that:
/*
getRankedConf(full,['A','A*','B'])

*/


function getInfo(cat, page_start, page_end, callback) {
    if (page_end < page_start) {
        callback([])
        return;
    }
    console.log(`${cat} : page=${page_start}/${page_end}`)

    rp('http://www.wikicfp.com/cfp/call?conference=' + cat + '&page=' + page_start)
        .then(data => {
            const $ = cheerio.load(data);
            const dom = new JSDOM(data);
            rows = $('table tr:nth-child(3) table tr');
            var all = []
            for (i = 1; i < rows.length; i += 2) {
                obj = {};
                tds = $('td', rows[i])
                obj.event = $(tds[0]).text();
                if (obj.event == "Expired CFPs") {
                    i++;
                    tds = $('td', rows[i])
                    obj.event = $(tds[0]).text();
                }
                tds1 = $('td', rows[i + 1])
                obj.cfpLink = "http://www.wikicfp.com" + $('a', tds[0]).attr('href').replace(/&copyownerid=\d+/, '');
                obj.event_id = /eventid=(\d+)/.exec(obj.cfpLink)[1]
                obj.title = $(tds[1]).text();
                obj.time = $(tds1[0]).text();
                obj.place = $(tds1[1]).text();
                obj.deadline = $(tds1[2]).text();;
                // console.log(JSON.stringify(obj));
                all.push(obj)
            }
            if (rows.length > 40)
                getInfo(cat, page_start + 1, page_end, (res) => {
                    callback(all.concat(res));
                })
            else callback(all)
        }).catch(function (err) {
            console.error(err);
        });
}

function fillDetails(all, processed, callback) {
    var newi = 0;
    var fetchedData=all.length;
    var fill = (indx) => {
        if (indx % 20 == 0) console.log(`processing ${indx}/${fetchedData}`)
        if (indx >= all.length) {
            console.log(`new items: ${newi} from fetched=${fetchedData}  database size=${Object.keys(processed).length} `)
            callback(processed);
            return;
        }
        var link = all[indx].cfpLink
        var event_id = all[indx].event_id
        if (processed[event_id] == null) {
            newi++;
            getDetail(link, res => {
                processed[event_id] = res
                fill(indx + 1);
            })
        } else {
            fill(indx + 1);
        }
    }
    fill(0);
}
var last = { 'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5, 'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10, 'eleventh': 11, 'twelfth': 12, 'thirteenth': 13, 'fourteenth': 14, 'fifteenth': 15, 'sixteenth': 16, 'seventeenth': 17, 'eighteenth': 18, 'nineteenth': 19, 'twentieth': 20, 'thirtieth': 30, 'fortieth': 40, 'fiftieth': 50, 'sixtieth': 60, 'seventieth': 70, 'eightieth': 80, 'ninetieth': 90, 'hundredth': 100 }
var first = { 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90 }

function getDetail(link, callback) {
    rp(link).then(content => {
        const $ = cheerio.load(content);
        var obj = {};
        var data = $('span[xmlns\\:v]');
        $('span', data[0]).each((p, q) => {
            if (q.attribs['property'] != null) {
                var t = q.attribs['property'].replace('v:', '');
                var val = q.attribs['content'] == null ? $(q).text() : q.attribs['content'];
                obj[t] = val;
            }
        });
        data.slice(1).each((p,q) => {
            title = $('span[property="v:summary"]', q)[0].attribs['content'];
            date = $('span[property="v:startDate"]', q)[0].attribs['content'];
            obj[title.toLowerCase().replace(' ', '_')] = date
        });
        obj.call = $($('div.cfp')[0]).text();
        $('div[xmlns\\:dc] span').each((p,q) => obj[q.attribs['property'].replace('dc:', '')] = q.attribs['content']);
        obj.categories = $("table table  table table tr > td > h5 > a").slice(1).map((p, q) => $(q).text()).toArray();
        parent = $("a[href*='/cfp/program']");
        if (parent.length > 0) {
            obj.parent = $(parent[0]).text();
            obj.parentLink = $(parent[0]).attr('href');
        }



        obj.year = obj.title.slice(obj.title.length - 4, obj.title.length)
        obj.title = obj.title.slice(0, obj.title.length - 5)
        obj.abbr = new Set()
        if (obj.parentLink != null) {
            let abbr = /.*s=(.*)&.*/.exec(obj.parentLink)
            if (abbr != null) obj.abbr.add(abbr[1].toLowerCase());
        }

        abbr_regex = /\((.+)\)/
        abbr = abbr_regex.exec(obj.description)
        if (abbr != null) {
            obj.abbr.add(abbr[1].toLowerCase());
            obj.description.replace(abbr_regex, '')
        }

        obj.abbr.add(obj.title.toLowerCase());
        obj.abbr.add(obj.title.replace(/(IEEE|ACM)[ -]+/i, '').toLowerCase())

        obj.description = obj.description.replace(obj.title + ":", '').replace(/^the /i, '');
        obj.event_id = /eventid=(\d+)/.exec(obj.identifier)[1]
        let nth = /(1st|2nd|3rd|\d+th)/i.exec(obj.description + " " + obj.call);
        if (nth != null) obj.nth = nth[0].replace(/(st|nd|rd|th)/, '')

        let re = /([ ]*(1st|2nd|3rd|\d+th|19\d{2}|20\d{2})[ ]*)+/gi;
        obj.description = obj.description.replace(re, '')

        regex = new RegExp("(" + Object.keys(first).join("|") + ")?[ -]?(" + Object.keys(last).join("|") + ")", 'i')
        re = regex.exec(obj.description)
        if (re != null) {
            num = re[1] == null ? 0 : first[re[1]]
            num += re[2] == null ? 0 : last[re[2]]
            obj.description = obj.description.replace(regex, '')
            obj.nth = num
        }
        obj.description = obj.description.trim();
        obj.abbr=Array.from(obj.abbr) 
        // console.log(obj);
        callback(obj)
    }).catch(function (err) {
        // Crawling failed...
    });
}


exports.fetch = function (processed, cats, callback) {
    cats.forEach(cat => {
        getInfo(cat, 1, 3, all => {
            fillDetails(all, processed, res => {
                console.log(cat + ' finished')
                callback(processed);
            })
        })
    })
    
}
exports.fetchSync = function (processed, cats, callback) {

    getCat = (indx) => {
        if (indx >= cats.length) {
            
            
            return;
        }
        var cat = cats[indx]
        getInfo(cat, 1, 3, all => {
            fillDetails(all, processed, res => {
                console.log(cat + ' finished')
                callback(processed);
                getCat(indx + 1)
            })
        })
    }
    getCat(0)
}