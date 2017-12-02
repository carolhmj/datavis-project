let happinessAndSuicide = dc.scatterPlot("#happinessAndSuicide");
let happinessFactors = dc.barChart("#happinessFactors");
let happinessChanges = dc.seriesChart("#happinessChanges");
let countryResiduals = dc.barChart("#countryResiduals");
let regionResiduals = dc.barChart("#regionResiduals");

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
	.defer(d3.csv, "data/HappinessReport/whrAllYears.csv")
	.defer(d3.csv, "data/HappinessReport/whr2015.csv")
	.defer(d3.csv, "data/suicide_mortality.csv")
	.defer(d3.csv, "data/CountriesRegionWHR.csv")
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

let countryFacts;
let regionByCountry = d3.map();

function buildCharts(error, happinessAll, happiness2015, suicideRate, regions) {
	let countriesData = [];		

	regions.forEach(d => {
		regionByCountry.set(d.country, d.region);
	});

	happinessAll.forEach(function(d) {
		countriesData.push({
			country: d[WP5Country],
			happiness: +d[lifeLadder],
			year: +d.year,
			region: regionByCountry.get(d[WP5Country])
		}); 
	});

	happiness2015.forEach(function(d) {
		let index = countriesData.findIndex(c => c.year == 2015 && c.country == d.country);
		if (index > -1) {
			countriesData[index][ladderScore] = +d[ladderScore];
			countriesData[index][explLogGDP] = +d[explLogGDP];
			countriesData[index][explHealthyLife] = +d[explHealthyLife];
			countriesData[index][explSocialSupport] = +d[explSocialSupport];
			countriesData[index][explLifeChoices] = +d[explLifeChoices];
			countriesData[index][explGenerosity] = +d[explGenerosity];
			countriesData[index][explCorruption] = +d[explCorruption];
			countriesData[index][residualPlusDystopia] = +d[residualPlusDystopia];
		}
	});

	countriesData.filter(d => d.year == 2015).forEach(d => {
		if (isNaN(d[residualPlusDystopia])) {console.log(d.country + 'is NaN residualPlusDystopia');}
	});

	countryFacts = crossfilter(countriesData);
	
	suicideRate.filter(d => d.Sex == "Total");
	suicideRate.forEach(function(d) {
		let index = countriesData.findIndex(c => c.year == +d[timePeriod] && c.country == d[referenceArea]);
		if (index > -1) {
			countriesData[index].suicide = +d.Value;
		}
 	});

	buildHappinessChange();
	buildHappinessFactors();
	buildHappinessAndSuicide();
	buildCountryResiduals();
	buildRegionResiduals();
	dc.renderAll();
}

function buildRegionResiduals() {
	let regionDimension = countryFacts.dimension(d => [d.region, d.year]);
	let residualGroup = regionDimension.group().reduce(
		(p,v) => {
			if (!isNaN(v[residualPlusDystopia])) {
				++p.count; 
				p.sum += v[residualPlusDystopia];
			}
			return p;
		},
		(p,v) => {
			if (!isNaN(residualPlusDystopia)) {
				--p.count;
				p.sum -= v[residualPlusDystopia];
			}
		},
		() => {
			return {sum: 0, count: 0}
		}
	);

	residualGroup = filterBins(residualGroup, d => d.key[1] == 2015 && !isNaN(d.value.sum) && !isNaN(d.value.count));

	let allRegions = residualGroup.all().sort((x, y) => y.value.sum/y.value.count - x.value.sum/x.value.count).map(d => d.key[0]).filter(d => !(typeof d == "undefined"));
	console.log(allRegions);

	let _bbox = regionResiduals.root().node().parentNode.getBoundingClientRect();

	regionResiduals.width(_bbox.width)
				   .height(_bbox.height)
				   .x(d3.scale.ordinal().domain(allRegions))
				   .xUnits(dc.units.ordinal)
				   .elasticY(true)
				   .dimension(regionDimension)
				   .group(residualGroup)
				   .keyAccessor(d => d.key[0])
				   .valueAccessor(d => d.value.sum / d.value.count)
				   .renderHorizontalGridLines(true)
				   .colors(["#0e8373"]);
}

function buildCountryResiduals() {
	let countryDimension = countryFacts.dimension(d => [d.country, d.year]);
	let residualGroup = countryDimension.group().reduceSum(d => d[residualPlusDystopia]);

	let countriesWithResiduals = residualGroup.top(Infinity).filter(d => d.key[1] == 2015).sort((c1, c2) => {return c2.value - c1.value;}).map(d => d.key[0]);
	let topBottomCountries = countriesWithResiduals.slice(0,5).concat(countriesWithResiduals.slice(-5));
	residualGroup = filterBins(residualGroup, d => d.key[1] == 2015 && $.inArray(d.key[0], topBottomCountries) > -1 && !isNaN(d.value));

	let colorScale = d3.scale.quantize().domain([0,topBottomCountries.length-1]).range([1,2]);
	
	let _bbox = countryResiduals.root().node().parentNode.getBoundingClientRect();

	countryResiduals.width(_bbox.width)
					.height(_bbox.height)
					.xUnits(dc.units.ordinal)
					.x(d3.scale.ordinal().domain(topBottomCountries))
					.elasticY(true)
					.dimension(countryDimension)
					.group(residualGroup)
					.keyAccessor(d => d.key[0])
					.renderHorizontalGridLines(true)
					.colors(["#0e8373", "#DAF7A6"])
					.colorDomain([1,2])
					.colorAccessor(d => colorScale($.inArray(d.key[0], topBottomCountries)));


}

function buildHappinessChange() {
	let countryDimension = countryFacts.dimension(d => [d.country, d.year]);
	let happinessGroup = countryDimension.group().reduceSum(d => d.happiness);

	let _bbox = happinessChanges.root().node().parentNode.getBoundingClientRect();

	happinessChanges.width(_bbox.width)
					.height(_bbox.height)
					.xUnits(d3.time.years)
					.x(d3.scale.linear().domain([2006,2016]))
					.renderHorizontalGridLines(true)
					.brushOn(false)
					.seriesAccessor(d => d.key[0])
					.keyAccessor(d => d.key[1])
					.dimension(countryDimension)
					.group(happinessGroup);

}

function buildHappinessFactors(happiness) {
	var countryDimension = countryFacts.dimension(d => [d.country, d.year, d.happiness]);
	var factorsGroup = countryDimension.group().reduce(function (p, v) {
		p[explLogGDP] = (p[explLogGDP] | 0) + v[explLogGDP];
		p[explHealthyLife] = (p[explHealthyLife] | 0) + v[explHealthyLife];
		p[explSocialSupport] = (p[explSocialSupport] | 0) + v[explSocialSupport];
		p[explGenerosity] = (p[explGenerosity] | 0) + v[explGenerosity];
		p[explCorruption] = (p[explCorruption] | 0) + v[explCorruption];
		p[explLifeChoices] = (p[explLifeChoices] | 0) + v[explLifeChoices];
		p[residualPlusDystopia] = (p[residualPlusDystopia] | 0) + v[residualPlusDystopia];
		p[ladderScore] = (p[ladderScore] | 0) + v[ladderScore];
		return p;
	}, function(p, v) {
		p[explLogGDP] = (p[explLogGDP] | 0) - v[explLogGDP];
		p[explHealthyLife] = (p[explHealthyLife] | 0) - v[explHealthyLife];
		p[explSocialSupport] = (p[explSocialSupport] | 0) - v[explSocialSupport];
		p[explGenerosity] = (p[explGenerosity] | 0) - v[explGenerosity];
		p[explCorruption] = (p[explCorruption] | 0) - v[explCorruption];
		p[explLifeChoices] = (p[explLifeChoices] | 0) - v[explLifeChoices];
		p[residualPlusDystopia] = (p[residualPlusDystopia] | 0) - v[residualPlusDystopia];
		p[ladderScore] = (p[ladderScore] | 0) - v[ladderScore];
		return p;
	}, function(p, v) {
		return {};
	});

	let countriesWithHappinessScores = factorsGroup.top(Infinity).filter(d => d.key[1] == 2015).sort((c1, c2) => {return c2.value[ladderScore] - c1.value[ladderScore]}).map(x => x.key[0]);

	let topBottomCountries = countriesWithHappinessScores.slice(0,5).concat(countriesWithHappinessScores.slice(-5));

	var filteredGroup = filterBins(factorsGroup, function(d) {
		return d.key[1] == 2015 && $.inArray(d.key[0], topBottomCountries) >= 0 && !isNaN(d.value[explLogGDP]); 
	});

	function sel_stack(elem) {
		return function(d) {
			return d.value[elem];
		}
	}

	//We swap the width and height so the graph is drawn correctly
	var rect =  _bbox = happinessFactors.root().node().parentNode.getBoundingClientRect();
	var chartWidth = _bbox.height;
	var chartHeight = _bbox.width;

	happinessFactors.width(chartWidth)
		 .height(chartHeight)
		 .gap(20)
		 .x(d3.scale.ordinal().domain(topBottomCountries))
		 .xUnits(dc.units.ordinal)
		 .margins({left: 40, top: 80, right: 0, bottom: 40})
		 .brushOn(false)
		 .elasticY(true)
		 .dimension(countryDimension)
		 .keyAccessor(d => d.key[0])
		 .valueAccessor(d => d.value[explLogGDP])
		 .group(filteredGroup, residualPlusDystopia, sel_stack(residualPlusDystopia));
	 
	happinessFactors.stack(filteredGroup, explLogGDP, sel_stack(explLogGDP));
	happinessFactors.stack(filteredGroup, explLifeChoices, sel_stack(explLifeChoices));
	happinessFactors.stack(filteredGroup, explHealthyLife, sel_stack(explHealthyLife));
	happinessFactors.stack(filteredGroup, explSocialSupport, sel_stack(explSocialSupport));
	happinessFactors.stack(filteredGroup, explCorruption, sel_stack(explCorruption));
	happinessFactors.stack(filteredGroup, explGenerosity, sel_stack(explGenerosity));
}

function buildHappinessAndSuicide(happiness, suicideRate) {
	let happinessAndSuicideDimension = countryFacts.dimension(d => [d.happiness, d.suicide, d.country, d.year]);
	let happinessAndSuicideGroup = filterBins(happinessAndSuicideDimension.group(), d => d.key[3] == 2015 && !isNaN(d.key[1]));

	var rect =  _bbox = happinessAndSuicide.root().node().parentNode.getBoundingClientRect();
	var chartWidth = _bbox.width;
	var chartHeight = _bbox.height;

	var regions = [...new Set(regionByCountry.values())];
	var domain = d3.scale.ordinal().domain(regions).range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a']);

	happinessAndSuicide.width(chartWidth)
					   .height(chartHeight)
					   .x(d3.scale.linear().domain(d3.extent(happinessAndSuicideGroup.all().map(d => d.key[0]))))
					   .y(d3.scale.linear().domain(d3.extent(happinessAndSuicideGroup.all().map(d => d.key[1]))))
					   .dimension(happinessAndSuicideDimension)
					   .group(happinessAndSuicideGroup)
					   .brushOn(false)
					   .renderTitle(true)
					   .colors(domain)
					   .colorAccessor(d => regionByCountry.get(d.key[2]))
					   .title(function(d) {
					   	return d.key[2] + "\n" + "Happiness: " + d.key[0] + "\n" + "Suicide: " + d.key[1];
					   });		
}	
