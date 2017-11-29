let happinessAndSuicide = dc.scatterPlot("#happinessAndSuicide");
let happinessFactors = dc.barChart("#happinessFactors");

let explLogGDP = "Explained by: Log GDP per capita";
let explSocialSupport = "Explained by: Social support";
let explHealthyLife = "Explained by: Healthy life expectancy";
let explLifeChoices = "Explained by: Freedom to make life choices";
let explGenerosity = "Explained by: Generosity";
let explCorruption = "Explained by: Perceptions of corruption";
let residualPlusDystopia = "Dystopia + residual";
let ladderScore = "Ladder score";
let lifeLadder = "Life Ladder";
let referenceArea = "Reference Area";
let timePeriod = "Time Period";
let WP5Country = "WP5 Country";

d3.queue()
	.defer(d3.csv, "data/HappinessReport/whrBruteAllYears.csv")
	.defer(d3.csv, "data/HappinessReport/whr2015.csv")
	.defer(d3.csv, "data/suicide_mortality.csv")
	.await(buildCharts);

function filterBins(source_group, f) {
		return {
			all:function () {
				return source_group.all().filter(function(d) {
					return f(d);
				});
			}
		};
}

let countries = d3.map();
let countryFacts;

function setupCountry(data) {
	let country = {
		country: data[WP5Country],
		onSuicideAndHappiness: true,
		showHappinessFactors: true
	};
	countries.set(data.country, country);
}

function buildCharts(error, happinessAll, happiness2015, suicideRate) {
		
	happinessAll.forEach(function(d) {
		if (!countries.has(d[WP5Country])) {
			setupCountry(d);
		}

		d[lifeLadder] = +d[lifeLadder]; 
	});

	let happiness2015Map = d3.map();
	happiness2015.forEach(function(d) {
		let data = {
			ladderScore: +d[ladderScore],
			explLogGDP: +d[explLogGDP],
			explHealthyLife: +d[explHealthyLife],
			explSocialSupport: +d[explSocialSupport],
			explLifeChoices: +d[explLifeChoices],
			explGenerosity: +d[explGenerosity],
			explCorruption: +d[explCorruption],
			residualPlusDystopia: +d[residualPlusDystopia]
		};
		happiness2015Map.set(d.country, data);
	});

	let suicideRateMap = d3.map();
	suicideRate.filter(function(d) {
		return d.Sex === "Total" && d[timePeriod] === "2015";
	});

	suicideRate.forEach(function(d) {
		let data = {
			"Value" : +d.Value
		}
		suicideRateMap.set(d[referenceArea], data);
	});

	console.log(happiness2015Map);
	console.log(suicideRateMap);
	console.log(countries);

	countryFacts = crossfilter(countries.values());
	console.log(countryFacts.size());

	buildHappinessFactors(happiness2015Map);
	buildHappinessAndSuicide(happiness2015Map, suicideRateMap);

	dc.renderAll();
}

function buildHappinessFactors(happiness) {
	// var countryDimension = countryFacts.dimension((d) => [d.country, d.showHappinessFactors]);
	var countryDimension = countryFacts.dimension((d) => d.country);
	// countryDimension.top(Infinity).forEach(d => { console.log(d); d.showHappinessFactors = true; })
	var factorsGroup = countryDimension.group().reduce(function (p, v) {
		let country = happiness.get(v.country);
		if (country) {
			p[explLogGDP] = (p[explLogGDP] | 0) + happiness.get(v.country).explLogGDP;
			p[explHealthyLife] = (p[explHealthyLife] | 0) + happiness.get(v.country).explHealthyLife;
			p[explSocialSupport] = (p[explSocialSupport] | 0) + happiness.get(v.country).explSocialSupport;
			p[explGenerosity] = (p[explGenerosity] | 0) + happiness.get(v.country).explGenerosity;
			p[explCorruption] = (p[explCorruption] | 0) + happiness.get(v.country).explCorruption;
			p[explLifeChoices] = (p[explLifeChoices] | 0) + happiness.get(v.country).explLifeChoices;
			p[residualPlusDystopia] = (p[residualPlusDystopia] | 0) + happiness.get(v.country).residualPlusDystopia;
			p[ladderScore] = (p[ladderScore] | 0) + happiness.get(v.country).ladderScore;
		}
		return p;
	}, function(p, v) {
		let country = happiness.get(v.country);
		if (country) {
			p[explLogGDP] = (p[explLogGDP] | 0) - happiness.get(v.country).explLogGDP;
			p[explHealthyLife] = (p[explHealthyLife] | 0) - happiness.get(v.country).explHealthyLife;
			p[explSocialSupport] = (p[explSocialSupport] | 0) - happiness.get(v.country).explSocialSupport;
			p[explGenerosity] = (p[explGenerosity] | 0) - happiness.get(v.country).explGenerosity;
			p[explCorruption] = (p[explCorruption] | 0) - happiness.get(v.country).explCorruption;
			p[explLifeChoices] = (p[explLifeChoices] | 0) - happiness.get(v.country).explLifeChoices;
			p[residualPlusDystopia] = (p[residualPlusDystopia] | 0) - happiness.get(v.country).residualPlusDystopia;
			p[ladderScore] = (p[ladderScore] | 0) - happiness.get(v.country).ladderScore;
		}
		return p;
	}, function(p, v) {
		return {};
	});
	console.log(factorsGroup.all());

	let countriesWithHappinessScores = countries.values().filter(d => happiness.get(d.country)).sort((c1, c2) => {return happiness.get(c2.country).ladderScore - happiness.get(c1.country).ladderScore}).map(x => x.country);

	let topBottomCountries = countriesWithHappinessScores.slice(0,5).concat(countriesWithHappinessScores.slice(-5));

	var filteredGroup = filterBins(factorsGroup, function(d) {
		return $.inArray(d.key, topBottomCountries) >= 0; 
	});

	// var filteredGroup = filterBins(factorsGroup, function(d) {
	// 	return d.key[1]; //d.show
	// });

	console.log(filteredGroup.all());

	function sel_stack(elem) {
		return function(d) {
			return d.value[elem];
		}
	}

	//We swap the width and height so the graph is drawn correctly
	var rect =  _bbox = happinessFactors.root().node().parentNode.getBoundingClientRect();
	var chartWidth = _bbox.height;
	var chartHeight = _bbox.width;
	console.log('size: ' + chartWidth + ' ' + chartHeight);

	happinessFactors.width(chartWidth)
		 .height(chartHeight)
		 .gap(20)
		 // .x(d3.scale.ordinal().domain(countries.values().map(d => d.country)))
		 .x(d3.scale.ordinal().domain(topBottomCountries))
		 .xUnits(dc.units.ordinal)
		 .margins({left: 40, top: 80, right: 0, bottom: 40})
		 .brushOn(false)
		 .elasticY(true)
		 .dimension(countryDimension)
		 .group(filteredGroup, residualPlusDystopia, sel_stack(residualPlusDystopia));
		 // .keyAccessor(d => d.key[0]);	 
	 
	happinessFactors.stack(filteredGroup, explLogGDP, sel_stack(explLogGDP));
	happinessFactors.stack(filteredGroup, explLifeChoices, sel_stack(explLifeChoices));
	happinessFactors.stack(filteredGroup, explHealthyLife, sel_stack(explHealthyLife));
	happinessFactors.stack(filteredGroup, explSocialSupport, sel_stack(explSocialSupport));
	happinessFactors.stack(filteredGroup, explCorruption, sel_stack(explCorruption));
	happinessFactors.stack(filteredGroup, explGenerosity, sel_stack(explGenerosity));
}

function buildHappinessAndSuicide(happiness, suicideRate) {
	let happinessAndSuicideDimension = countryFacts.dimension(function(d) {
		let happy = happiness.get(d.country) ? happiness.get(d.country).ladderScore : 0;
		if (happy == 0) console.log(d.country + " happy not found");
		let suicide = suicideRate.get(d.country) ? suicideRate.get(d.country).Value : 0;
		if (suicide == 0) console.log(d.country + " suicide not found");
		return [happy, suicide, d.country];
	});
	let happinessAndSuicideGroup = filterBins(happinessAndSuicideDimension.group(), function(d) {
		return d.key[0] != 0 && d.key[1] != 0;
	});

	console.log(happinessAndSuicideDimension.top(Infinity));
	console.log(happinessAndSuicideGroup.all());

	var rect =  _bbox = happinessAndSuicide.root().node().parentNode.getBoundingClientRect();
	var chartWidth = _bbox.width;
	var chartHeight = _bbox.height;

	happinessAndSuicide.width(chartWidth)
					   .height(chartHeight)
					   .x(d3.scale.linear().domain(d3.extent(happinessAndSuicideGroup.all().map(d => d.key[0]))))
					   .y(d3.scale.linear().domain(d3.extent(happinessAndSuicideGroup.all().map(d => d.key[1]))))
					   .dimension(happinessAndSuicideDimension)
					   .group(happinessAndSuicideGroup)
					   .brushOn(false)
					   .renderTitle(true)
					   .title(function(d) {
					   	return d.key[2] + "\n" + "Happiness: " + d.key[0] + "\n" + "Suicide: " + d.key[1];
					   });		
}	
