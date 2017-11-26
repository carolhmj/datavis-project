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

d3.queue()
	.defer(d3.csv, "data/HappinessReport/whrBruteAllYears.csv")
	.defer(d3.csv, "data/HappinessReport/whr2015.csv")
	.defer(d3.csv, "data/suicide_mortality.csv")
	.await(buildCharts);


let countries = d3.map();
let countryFacts;

function setupCountry(data) {
	let country = {
		"country": data.country,
		"onSuicideAndHappiness": true
	};
	countries.set(data.country, country);
}

function buildCharts(error, happinessAll, happiness2015, suicideRate) {
		
	happinessAll.forEach(function(d) {
		if (!countries.has(d.country)) {
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
		let suicide = suicideRate.get(d.country) ? suicideRate.get(d.country).Value : 0;
		return [happy, suicide];
	});
	let happinessAndSuicideGroup = happinessAndSuicideDimension.group();

	console.log(happinessAndSuicideDimension.top(Infinity));
	console.log(happinessAndSuicideGroup.all());

	happinessAndSuicide.width(700)
					   .height(700)
					   .x(d3.scaleLinear().domain(d3.extent(happinessAndSuicideGroup.group().map(d => d.key[0]))))
					   .y(d3.scaleLinear().domain(d3.extent(happinessAndSuicideGroup.group().map(d => d.key[0]))))
					   .dimension(happinessAndSuicideDimension)
					   .group(happinessAndSuicideGroup);		
}	
