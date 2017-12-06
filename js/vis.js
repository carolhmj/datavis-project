const happinessAndSuicide = dc.seriesChart("#happinessAndSuicide"),
	  happinessFactors = dc.barChart("#happinessFactors"),
	  happinessChanges = dc.seriesChart("#happinessChanges"),
	  countryResiduals = dc.barChart("#countryResiduals"),
	  regionResiduals = dc.barChart("#regionResiduals"),

	  explLogGDP = "Explained by: Log GDP per capita",
	  explSocialSupport = "Explained by: Social support",
	  explHealthyLife = "Explained by: Healthy life expectancy",
	  explLifeChoices = "Explained by: Freedom to make life choices",
	  explGenerosity = "Explained by: Generosity",
	  explCorruption = "Explained by: Perceptions of corruption",
	  residualPlusDystopia = "Dystopia + residual",
	  happinessScore = "Happiness score",
	  lifeLadder = "Life Ladder",
	  referenceArea = "Reference Area",
	  timePeriod = "Time Period",
	  WP5Country = "WP5 Country";

let sliderYear = 2016;

d3.queue()
	.defer(d3.csv, "data/HappinessReport/whrAllYears.csv")
	.defer(d3.csv, "data/HappinessReport/whr2015.csv")
	.defer(d3.csv, "data/HappinessReport/whr2016.csv")
	.defer(d3.csv, "data/HappinessReport/whr2017.csv")
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
let dystopiaByYear = {'2015': 2.10, '2016': 2.33, '2017': 1.85}
let shownCountriesHappinessChanges = ["Brazil", "Egypt", "Greece", "Syria", "Liberia", "Venezuela"];

function buildCharts(error, happinessAll, happiness2015, happiness2016, happiness2017, suicideRate, regions) {
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
		let index = countriesData.findIndex(c => c.year == 2014 && c.country == d.country);
		if (index > -1) {
			countriesData[index][happinessScore] = +d[happinessScore];
			countriesData[index][explLogGDP] = +d[explLogGDP];
			countriesData[index][explHealthyLife] = +d[explHealthyLife];
			countriesData[index][explSocialSupport] = +d[explSocialSupport];
			countriesData[index][explLifeChoices] = +d[explLifeChoices];
			countriesData[index][explGenerosity] = +d[explGenerosity];
			countriesData[index][explCorruption] = +d[explCorruption];
			countriesData[index][residualPlusDystopia] = +d[residualPlusDystopia];
		}
	});

	happiness2016.forEach(function(d) {
		let index = countriesData.findIndex(c => c.year == 2015 && c.country == d.Country);
		if (index > -1) {
			countriesData[index][happinessScore] = +d[happinessScore];
			countriesData[index][explLogGDP] = +d[explLogGDP];
			countriesData[index][explHealthyLife] = +d[explHealthyLife];
			countriesData[index][explSocialSupport] = +d[explSocialSupport];
			countriesData[index][explLifeChoices] = +d[explLifeChoices];
			countriesData[index][explGenerosity] = +d[explGenerosity];
			countriesData[index][explCorruption] = +d[explCorruption];
			countriesData[index][residualPlusDystopia] = +d[residualPlusDystopia];
		}
	});

	happiness2017.forEach(function(d) {
		let index = countriesData.findIndex(c => c.year == 2016 && c.country == d.Country);
		if (index > -1) {
			countriesData[index][happinessScore] = +d[happinessScore];
			countriesData[index][explLogGDP] = +d[explLogGDP];
			countriesData[index][explHealthyLife] = +d[explHealthyLife];
			countriesData[index][explSocialSupport] = +d[explSocialSupport];
			countriesData[index][explLifeChoices] = +d[explLifeChoices];
			countriesData[index][explGenerosity] = +d[explGenerosity];
			countriesData[index][explCorruption] = +d[explCorruption];
			countriesData[index][residualPlusDystopia] = +d[residualPlusDystopia];
		}
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
	buildCountryResiduals(2016);
	buildRegionResiduals(2016);
	dc.renderAll();
	// rotateXText();
}

function rotateXText(chart) {
	let h = +d3.select("#regionResiduals svg")
	  .attr("height");
	let w = +d3.select("#regionResiduals svg")
	  .attr("width");

	d3.select("#regionResiduals svg")
	  .attr("height", h+100)
	  .attr("width", w+50)

	d3.select("#regionResiduals svg")
	  .style("transform", "translate(50px,0px)");  

	d3.select("#regionResiduals svg .x text")
	  .style("transform", "rotate(-45deg)") 
}

function buildRegionResiduals(year) {
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

	residualGroup = filterBins(residualGroup, d => d.key[1] == year && !isNaN(d.value.sum) && !isNaN(d.value.count));

	let allRegions = residualGroup.all()
								.sort((x, y) => y.value.sum/y.value.count - x.value.sum/x.value.count)
								.map(d => d.key[0])
								.filter(d => !(typeof d == "undefined"));

	let _bbox = regionResiduals.root().node().parentNode.getBoundingClientRect();

	regionResiduals.width(_bbox.width)
				   .height(_bbox.height)
				   .x(d3.scale.ordinal().domain(allRegions))
				   .xUnits(dc.units.ordinal)
				   .elasticY(true)
				   .yAxisLabel("Dystopia (" + dystopiaByYear[year.toString()] + ") + Residual in" + year.toString())
				   .dimension(regionDimension)
				   .group(residualGroup)
				   .keyAccessor(d => d.key[0])
				   .valueAccessor(d => d.value.sum / d.value.count)
				   .renderHorizontalGridLines(true)
				   .brushOn(false)
				   .colors(["#0e8373"])
				   .renderlet(chart => rotateXText(chart));

	regionResiduals.filter = function() {};			   
}

function buildCountryResiduals(year) {
	let countryDimension = countryFacts.dimension(d => [d.country, d.year]);
	let residualGroup = countryDimension.group().reduceSum(d => d[residualPlusDystopia]);

	let countriesWithResiduals = residualGroup
								.top(Infinity)
								.filter(d => d.key[1] == year)
								.sort((c1, c2) => {return c2.value - c1.value;})
								.map(d => d.key[0]);
	let topBottomCountries = countriesWithResiduals.slice(0,5).concat(countriesWithResiduals.slice(-5));
	residualGroup = filterBins(residualGroup, d => d.key[1] == year && $.inArray(d.key[0], topBottomCountries) > -1 && !isNaN(d.value));

	let colorScale = d3.scale.quantize().domain([0,topBottomCountries.length-1]).range([1,2]);
	
	let _bbox = countryResiduals.root().node().parentNode.getBoundingClientRect();

	countryResiduals.width(_bbox.width)
					.height(_bbox.height)
					.xUnits(dc.units.ordinal)
					.x(d3.scale.ordinal().domain(topBottomCountries))
					.elasticY(true)
					.yAxisLabel("Dystopia (" + dystopiaByYear[year.toString()] + ") + Residual in " + year.toString())
					.dimension(countryDimension)
					.group(residualGroup)
					.keyAccessor(d => d.key[0])
					.renderHorizontalGridLines(true)
					.colors(["#0e8373", "#DAF7A6"])
					.colorDomain([1,2])
					.brushOn(false)
					.colorAccessor(d => colorScale($.inArray(d.key[0], topBottomCountries)));

	countryResiduals.filter = function() {};					
}

function buildHappinessChange() {
	let countryDimension = countryFacts.dimension(d => [d.country, d.year]);
	let happinessGroup = countryDimension.group().reduceSum(d => d.happiness);

	happinessGroup = filterBins(happinessGroup, d => $.inArray(d.key[0], shownCountriesHappinessChanges) > -1);

	let _bbox = happinessChanges.root().node().parentNode.getBoundingClientRect();

	var domain = d3.scale.ordinal().domain(shownCountriesHappinessChanges).range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f']);

	happinessChanges.width(_bbox.width)
					.height(_bbox.height)
					.xUnits(d3.time.years)
					.x(d3.scale.linear().domain([2006,2016]))
					.yAxisLabel("Happiness score")
					.renderHorizontalGridLines(true)
					.brushOn(false)
					.seriesAccessor(d => d.key[0])
					.keyAccessor(d => d.key[1])
					.dimension(countryDimension)
					.colors(domain)
					.group(happinessGroup)
					.renderTitle(false)
					.brushOn(false)
					.legend(dc.legend().itemHeight(13).gap(5).horizontal(1).x(_bbox.width-100).y(_bbox.height-150).legendWidth(140).itemWidth(150));
	happinessChanges.filter = function() {};					
}

function buildHappinessFactors() {
	var countryDimension = countryFacts.dimension(d => [d.country, d.year, d.happiness]);
	var factorsGroup = countryDimension.group().reduce(function (p, v) {
		p[explLogGDP] = (p[explLogGDP] | 0) + v[explLogGDP];
		p[explHealthyLife] = (p[explHealthyLife] | 0) + v[explHealthyLife];
		p[explSocialSupport] = (p[explSocialSupport] | 0) + v[explSocialSupport];
		p[explGenerosity] = (p[explGenerosity] | 0) + v[explGenerosity];
		p[explCorruption] = (p[explCorruption] | 0) + v[explCorruption];
		p[explLifeChoices] = (p[explLifeChoices] | 0) + v[explLifeChoices];
		p[residualPlusDystopia] = (p[residualPlusDystopia] | 0) + v[residualPlusDystopia];
		p[happinessScore] = (p[happinessScore] | 0) + v[happinessScore];
		return p;
	}, function(p, v) {
		p[explLogGDP] = (p[explLogGDP] | 0) - v[explLogGDP];
		p[explHealthyLife] = (p[explHealthyLife] | 0) - v[explHealthyLife];
		p[explSocialSupport] = (p[explSocialSupport] | 0) - v[explSocialSupport];
		p[explGenerosity] = (p[explGenerosity] | 0) - v[explGenerosity];
		p[explCorruption] = (p[explCorruption] | 0) - v[explCorruption];
		p[explLifeChoices] = (p[explLifeChoices] | 0) - v[explLifeChoices];
		p[residualPlusDystopia] = (p[residualPlusDystopia] | 0) - v[residualPlusDystopia];
		p[happinessScore] = (p[happinessScore] | 0) - v[happinessScore];
		return p;
	}, function(p, v) {
		return {};
	});

	let countriesWithHappinessScores = factorsGroup.top(Infinity).filter(d =>
		d.key[1] == sliderYear && !(isNaN(d.value[happinessScore])))
									.sort((c1, c2) => {return c2.value[happinessScore] - c1.value[happinessScore]})
									.map(x => x.key[0]);

	let topBottomCountries = (countriesWithHappinessScores.slice(0,5).concat(countriesWithHappinessScores.slice(-5)));

	var filteredGroup = filterBins(factorsGroup, function(d) {
		return d.key[1] == sliderYear && $.inArray(d.key[0], topBottomCountries) >= 0 && !isNaN(d.value[explLogGDP]); 
	});

	function sel_stack(elem) {
		return function(d) {
			return d.value[elem];
		}
	}

	var domain = d3.scale.ordinal()
		.domain([0,7])
		.range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628']);

	//We swap the width and height so the graph is drawn correctly
	var rect =  _bbox = happinessFactors.root().node().parentNode.getBoundingClientRect();
	var chartWidth = _bbox.height;
	var chartHeight = _bbox.width;
	$("#happinessFactorsContainer").css("margin-left",chartHeight - 70);
	$("#happinessFactorsContainer").parent().css("overflow","hidden");
	happinessFactors.width(chartWidth)
		.height(chartHeight)
		.gap(10)
		.x(d3.scale.ordinal().domain(topBottomCountries))
		.xUnits(dc.units.ordinal)
		.margins({left: 30, top: 80, right: 170, bottom: 75})
		.brushOn(false)
		.elasticY(true)
		.dimension(countryDimension)
		.keyAccessor(d => d.key[0])
		.group(filteredGroup, residualPlusDystopia, sel_stack(residualPlusDystopia))
		.title(function(d) {
			return this.layer + '\n' + d.value[this.layer];
		})
		.movableStacks(true)
		.legend(dc.legend().x(310)
			.y(chartHeight - 40)
			.rotation(270)
			.horizontal(true)
			.itemWidth(250)
			.legendWidth(chartHeight));
	
		happinessFactors.stack(filteredGroup, explLogGDP, sel_stack(explLogGDP));
		happinessFactors.stack(filteredGroup, explLifeChoices, sel_stack(explLifeChoices));
		happinessFactors.stack(filteredGroup, explHealthyLife, sel_stack(explHealthyLife));
		happinessFactors.stack(filteredGroup, explSocialSupport, sel_stack(explSocialSupport));
		happinessFactors.stack(filteredGroup, explCorruption, sel_stack(explCorruption));
		happinessFactors.stack(filteredGroup, explGenerosity, sel_stack(explGenerosity));

	happinessFactors.filter = function() {};		
}

function buildHappinessAndSuicide() {
	
	let happinessAndSuicideDimension = countryFacts.dimension(d => [d.happiness, d.suicide, d.country, d.year]);
	let happinessAndSuicideGroup = filterBins(happinessAndSuicideDimension.group(), d => d.key[3] == 2015 && !isNaN(d.key[1]));

	var rect =  _bbox = happinessAndSuicide.root().node().parentNode.getBoundingClientRect();
	var chartWidth = _bbox.width;
	var chartHeight = _bbox.height;

	var regions = [...new Set(regionByCountry.values())].filter(d => !(typeof d == "undefined"));
	var domain = d3.scale.ordinal()
						 .domain(regions)
						 .range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a']);

	//set x and y chart values, they need to be a little bigger so data can fit correctly on chart
	const xValue = d3.extent(happinessAndSuicideGroup.all().map(d => d.key[0])),
		  yValue = d3.extent(happinessAndSuicideGroup.all().map(d => d.key[1]));
	xValue[0] -= 0.5;
	xValue[1] += 0.5;
	yValue[0] -= 0.5;
	yValue[1] += 0.5;

	var subChart = function(c) {
		return dc.scatterPlot(c)
        .symbolSize(8)
        .highlightedSize(10)
	};
	
	happinessAndSuicide.width(chartWidth)
		.height(chartHeight)
		.chart(subChart)
		.x(d3.scale.linear().domain(xValue))
		.xAxisLabel("Happiness score in 2015")
		.y(d3.scale.linear().domain(yValue))
		.yAxisLabel("Suicide mortality rate (per 100,000 population) in 2015")
		.margins({left: 40, top: 40, right: 300, bottom: 40})
		.dimension(happinessAndSuicideDimension)
		.group(happinessAndSuicideGroup)
		.brushOn(false)
		.colors(domain)
		.seriesAccessor(d => !(typeof d == "undefined") ? regionByCountry.get(d.key[2]) : null)
		.keyAccessor(d => !(typeof d == "undefined") ? d.key[0] : null)
		.valueAccessor(d => !(typeof d == "undefined") ? d.key[1] : null)
		.title(function(d) {
			return d.key[2] + "\n" + "Happiness: " + d.key[0] + "\n" + "Suicide: " + d.key[1];
		})
		.legend(dc.legend().itemHeight(13).gap(5).horizontal(1).x(chartWidth-250).y(210).legendWidth(140).itemWidth(150));

	happinessAndSuicide.filter = function() {};		

}

$(window).on("resize", function() {
	resizeCharts();
});
// 

function resizeCharts() {
	buildHappinessChange();
	buildHappinessFactors();
	buildHappinessAndSuicide();
	buildCountryResiduals(2016);
	buildRegionResiduals(2016);
	dc.redrawAll();
	
	// rotateXText(); 
}
