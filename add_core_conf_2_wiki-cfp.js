get_ranked_conf = require('./get_ranked_conf.js');
wiki_cfp = require('./wiki-cfp-full.json');
core_conf = require('./core-conf.json');

// $.get('wiki_cfp_fetcher.js', data => {
//     eval(data);
res = [];
repeated_rg = /((^|\W)+(IEEE|ACM|IOP|MSF|KEM|shanghai|Ei|Compendex|Scopus|\W|\d{4})+(\W|$)+)+|(^\W+|\W+$)/ig;
begin_end = /(^[ -]+(the|and)+)|((the|and)+([ -])+$)/gi;
exists = {}
Object.values(wiki_cfp).forEach(p => {
	delete p.call;
    if (new Date(p.submission_deadline) > Date.now()) {
        p.abbr=p.abbr.map(q =>
            q.replace(repeated_rg, ' ').replace(begin_end, ' ').replace(/[ ]+/g, ' ').trim().split(" ")).flat();
        p.abbr = Array.from(new Set(p.abbr.filter(q => q.length >= 2)));
        p.description = p.description.replace(repeated_rg, ' ').replace(begin_end, ' ').replace(/[ ]+/g, ' ').trim();
        if (exists[p.source]) {
            parentLink = res[exists[p.source]].parentLink;;
            parent = res[exists[p.source]].parent;
            if (parentLink && p.parentLink == null) {
                p.parent = parent
                p.parentLink = parentLink
            }
            res[exists[p.source]] = p //todo merge
            
        } else {
            exists[p.source] = res.length
            res.push(p);
        }
    }
});

wiki_cfp_new = get_ranked_conf.getRankedConf2(res, core_conf);

const fs = require('fs');
fs.writeFileSync('wiki-cfp.json', JSON.stringify(wiki_cfp_new, null, '\t'));
