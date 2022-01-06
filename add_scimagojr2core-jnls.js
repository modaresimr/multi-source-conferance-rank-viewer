get_ranked_conf = require('./get_ranked_conf.js');
scimagojr = require('./scimagojr_2019.json');
scimagojr_info = require('./scimagojr_info.json');
core_jnl = require('./core-jnls-old.json');
require('./fuzzyset.js')
// $.get('wiki_cfp_fetcher.js', data => {
//     eval(data);
res = [];
repeated_rg = /((^|\W)+(IEEE|ACM|IOP|MSF|KEM|shanghai|Ei|Compendex|Scopus|\W|\d{4})+(\W|$)+)+|(^\W+|\W+$)/ig;
begin_end = /(^[ -]+(the|and)+)|((the|and)+([ -])+$)/gi;
exists = {}
title2scim = {}

Object.values(scimagojr).forEach(p => {
    title2scim[p.SOURCETITLE] = p;
});
fuzzy = FuzzySet(Object.keys(title2scim), false);
Object.values(core_jnl).forEach(jnl => {
    jnl.Scimagojr = []
    related = fuzzy.get(jnl.Title,null,0.9)
    if (related)
        related.forEach(p => {
            sci = title2scim[p[1]]
            sci.probability = (p[0] * 100).toFixed(2)
            jnl.Scimagojr.push(sci)
        })
});

const fs = require('fs');
fs.writeFileSync('core-jnls.json', JSON.stringify(core_jnl), null, '\t');
