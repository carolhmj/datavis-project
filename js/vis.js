let happinessAndSuicide = dc.scatterPlot("#happinessAndSuicide");

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


let countries = d3.map();
let countryFacts;

function setupCountry(data) {
	let country = {
		"country": data[WP5Country],
		"onSuicideAndHappiness": true
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
			ladderScore: +d[ladderScore]
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

	buildHappinessAndSuicide(happiness2015Map, suicideRateMap);

	dc.renderAll();
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

	function filterBins(source_group, f) {
		return {
			all:function () {
				return source_group.all().filter(function(d) {
					return f(d);
				});
			}
		};
	}

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
