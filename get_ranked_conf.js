


var levenshtein = function (a, b) {
    if (a.length == 0) return b.length;
    if (b.length == 0) return a.length;

    // swap to save some memory O(min(a,b)) instead of O(a)
    if (a.length > b.length) {
        var tmp = a;
        a = b;
        b = tmp;
    }

    var row = [];
    // init the row
    for (var i = 0; i <= a.length; i++) {
        row[i] = i;
    }

    // fill in the rest
    for (var i = 1; i <= b.length; i++) {
        var prev = i;
        for (var j = 1; j <= a.length; j++) {
            var val;
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                val = row[j - 1]; // match
            } else {
                val = Math.min(row[j - 1] + 1, // substitution
                    prev + 1,     // insertion
                    row[j] + 1);  // deletion
            }
            row[j - 1] = prev;
            prev = val;
        }
        row[a.length] = prev;
    }

    return row[a.length];
}
var levenshteinRate = (a, b) => levenshtein(a, b) / a.length



function getRankedConf(cfp_db,core_conf) {
    title2conf = {};
    abbr2conf = {}  
    full.forEach(p => title2conf[p.title] = p)
    full.forEach(p => p.abbr.forEach(q => abbr2conf[q] = p))
    addIfGood = (conf, core) => {
        if (conf == null) return;
        if (levenshteinRate(core.Title, conf.description) < .5) return;
        if (conf.nth != null && conf.nth < 6) return;
        if (core.events.filter(p => p.identifier == conf.identifier).length > 0) return;
        core.events.push(conf);

    };
    fuzzy = FuzzySet(Object.keys(title2conf), false)
    core_conf.forEach(core => {
        core.events = [];
        conf_title = fuzzy.get(core.Title, null, .8)
        addIfGood(abbr2conf[core.Acronym.toLowerCase()], core)
        if (core.Acronym2.length > 0) {
            addIfGood(abbr2conf[core.Acronym2.toLowerCase()], core)
        }
        if (conf_title != null) addIfGood(title2conf[conf_title[1]], core);
    })
    return core_conf.filter(p => p.events.length > 0)
}