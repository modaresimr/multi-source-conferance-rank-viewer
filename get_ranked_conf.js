require('./fuzzyset.js');

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
				val = Math.min(
					row[j - 1] + 1, // substitution
					prev + 1, // insertion
					row[j] + 1
				); // deletion
			}
			row[j - 1] = prev;
			prev = val;
		}
		row[a.length] = prev;
	}

	return row[a.length];
};
var levenshteinRate = (a, b) => levenshtein(a, b) / a.length;
var probability=(a,b)=>(a&&b)?(Math.max(0.01,1-levenshtein(a, b) / a.length)*100).toFixed(0):-1
function getRankedConf(cfp_db, core_conf) {
	title2conf = {};
	abbr2conf = {};
	Object.values(cfp_db).forEach(p => title2conf[p.title] = p);
	Object.values(cfp_db).forEach(p => p.abbr.forEach(q => abbr2conf[q] = p));
	addIfGood = (conf, core) => {
		if (conf == null) return;
        conf.levDistance = levenshteinRate(core.Title, conf.description);
        conf.submission_deadline_date=new Date(conf.submission_deadline)
		// if ( > 1) return;
		if (conf.nth != null && conf.nth < 6) return;
		if (core.events.filter(p => p.event_id == conf.event_id).length > 0) return;
		core.events.push(conf);
	};
	fuzzy = FuzzySet(Object.keys(title2conf), false);
	abbrfuzzy = FuzzySet(Object.keys(abbr2conf), false);
	core_conf.forEach(core => {
		core.events = [];
		conf_title = fuzzy.get(core.Title, null, 0.8);
		conf_abbr = abbrfuzzy.get(core.Acronym.toLowerCase(), null, 0.9);
		if (core.Acronym2.length > 0) {
			conf_abbr2 = abbrfuzzy.get(core.Acronym2.toLowerCase(), null, 0.9);
			if (conf_abbr == null) conf_abbr = conf_abbr2;
			else conf_abbr.concat(conf_abbr2);
		}
		if (conf_abbr != null) for (var i = 0; i < conf_abbr.length; i++) addIfGood(abbr2conf[conf_abbr[i][1]], core);

		// if (core.Acronym2.length > 0) {
		//     addIfGood(abbr2conf[core.Acronym2.toLowerCase()], core)
		// }
		if (conf_title != null) addIfGood(title2conf[conf_title[1]], core);
		function compare(a, b) {
			ai = a.levDistance;
			bi = b.levDistance;
			if (a.submission_deadline_date < Date.now()) ai += 1000000000;
			if (b.submission_deadline_date < Date.now()) bi += 1000000000;
			if (ai < bi) return -1;
			if (ai > bi) return 1;
			return 0;
		}

		core.events.sort(compare);
	});
	return core_conf.filter(p => p.events.length > 0);
}


var getRankedConf2 =function(cfp_db, core_conf) {
	title2conf = {};
	abbr2conf = {};
	site2conf = {};
	cfp2conf = {};

	cfpregex = /http:\/\/www\.wikicfp\.com\/cfp\/program\?id=\d+/gi
	cfpclean=/\&.+/gi
	useless = /International|Conference| on | the /gi
	space = /[ ]+/gi
	removeuseless=s=>s.replace(useless,' ').replace(space,' ')
	core_conf.forEach(p => {
		title2conf[removeuseless(p.Title)] = p;
		if (p.Acronym.length > 0)
			abbr2conf[p.Acronym] = p
		if (p.Acronym2.length > 0) abbr2conf[p.Acronym2] = p;
		if (p.Links) {
			if (p.Links['site']) site2conf[p.Links['site']] = p;

			if (p.Links['WikiCFP entry']) {
				cfp2conf[p.Links['WikiCFP entry'].replace(cfpclean,'')] = p;
			}
		}
		
	});
	addIfGood = (core, conf,prob) => {
		if (core == null) return;
		
		// if ( > 1) return;
		// if (conf.nth != null && conf.nth < 6) return;
		if (conf.core_confs.filter(p => p.CoreId == core.CoreId).length > 0) return;
		
		core2 = { ...core };
		if (prob != null)
			core2.probability = prob;
		else {
			core2.probability = probability(removeuseless(core.Title), removeuseless(conf.description));
			pa = Math.max([core.Acronym, core.Acronym2].map(x => Math.max(conf.abbr.map(y => probability(x, y)))))
			if (pa > 0) core2.probability = (core2.probability + pa) / 2;
			core2.probability=Math.min(90,core2.probability)
		}
		conf.core_confs.push(core2);
	};
	fuzzy = FuzzySet(Object.keys(title2conf), false);
	abbrfuzzy = FuzzySet(Object.keys(abbr2conf), false);
	cfp_db.forEach(conf => {
		conf.core_confs = [];
		addIfGood(site2conf[conf.source], conf, 100);
		if(conf.parentLink)
			conf.parentLink=conf.parentLink.replace(cfpclean,'');
		addIfGood(cfp2conf[conf.parentLink], conf,100);
		conf_title = fuzzy.get(removeuseless(conf.description), null, 0.8);
		if (conf_title != null)
			conf_title.forEach(p => addIfGood(title2conf[p[1]],conf));
		
		conf.abbr.forEach(abbr => {
			af = abbrfuzzy.get(abbr, null, 0.9);
			if (af != null)
				af.forEach(p=>addIfGood(abbr2conf[p[1]], conf));

		})

		function compare(a, b) {
			ai = a.probability;
			bi = b.probability;
			if (ai < bi) return 1;
			if (ai > bi) return -1;
			return 0;
		}
		conf.core_confs.sort(compare);
		if (conf.core_confs.length > 1 && conf.core_confs[0].probability > 95)
			conf.core_confs = [conf.core_confs[0]]	
	});
	return cfp_db.filter(p => p.core_confs.length > 0);
}
exports.getRankedConf2=getRankedConf2;

