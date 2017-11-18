//Charts definition
var chart = dc.barChart("#happinessFactors");

var explLogGDP = "Explained by: Log GDP per capita";
var explHealthyLife = "Explained by: Healthy life expectancy";

d3.csv("data/HappinessReport/whr2015.csv", function(data) {
	console.log("raw data ");
	console.log(data);
	var allCountries = [];
	data.forEach(function(d) {
		allCountries.push(d.country);
		d[explLogGDP] = +d[explLogGDP];
		d[explHealthyLife] = +d[explHealthyLife];
	});
	console.log(allCountries);
	var facts = crossfilter(data);
	console.log("# of records: " + facts.size());
	var countryDimension = facts.dimension(function(d) {
		return d.country;
	});
	console.log(countryDimension.top(5));
	var factorsGroup = countryDimension.group().reduce(function (p, v) {
		p[explLogGDP] = (p[explLogGDP] | 0) + v[explLogGDP];
		return p;
	}, function(p, v) {
		p[explLogGDP] = (p[explLogGDP] | 0) - v[explLogGDP];
		return p;
	}, function(p, v) {
		return {};
	});
	var testGroup = countryDimension.group();
	console.log(testGroup.all());

	function sel_stack(elem) {
		return function(d) {
			return d[elem];
		}
	}

	chart.width(1000)
		 .height(500)
		 .x(d3.scale.ordinal().domain(allCountries))
		 .margins({left: 20, top: 20, right: 20, bottom: 20})
		 .brushOn(false)
		 .elasticY(true)
		 .dimension(countryDimension)
		 .group(testGroup);

	console.log(chart);	 

	chart.render();	 

});