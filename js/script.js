//Charts definition
var chart = dc.barChart("#happinessFactors");

var explLogGDP = "Explained by: Log GDP per capita";
var explHealthyLife = "Explained by: Healthy life expectancy";
var ladderScore = "Ladder score";

d3.csv("data/HappinessReport/whr2015.csv", function(data) {
	console.log(data);
	data.forEach(function(d) {
		d.show = false;
		d[explLogGDP] = +d[explLogGDP];
		d[explHealthyLife] = +d[explHealthyLife];
		d[ladderScore] = +d[ladderScore];
	});

	data.sort(function(x,y) {
		return y[ladderScore] - x[ladderScore];
	});

	for (var i = data.length - 1; i >= data.length - 5; i--) {
		data[i].show = true;
	}
	for (var i = 0; i < 5; i++) {
		data[i].show = true;
	}
	
	var facts = crossfilter(data);
	var countryDimension = facts.dimension(function(d) {
		return [d.country, d.show];
	});
	var factorsGroup = countryDimension.group().reduce(function (p, v) {
		p[explLogGDP] = (p[explLogGDP] | 0) + v[explLogGDP];
		p[explHealthyLife] = (p[explHealthyLife] | 0) + v[explHealthyLife];
		p[ladderScore] = (p[ladderScore] | 0) + v[ladderScore];
		return p;
	}, function(p, v) {
		p[explLogGDP] = (p[explLogGDP] | 0) - v[explLogGDP];
		p[explHealthyLife] = (p[explHealthyLife] | 0) - v[explHealthyLife];
		p[ladderScore] = (p[ladderScore] | 0) - v[ladderScore];
		return p;
	}, function(p, v) {
		return {};
	});
	console.log(factorsGroup.all());

	var testGroup = countryDimension.group().reduceSum(function(d) {return d[ladderScore];});
	// console.log(testGroup.all());
	var filteredGroup = filterBins(factorsGroup, function(d) {
		return d.key[1]; //d.show
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

	console.log(filteredGroup.all());

	function sel_stack(elem) {
		return function(d) {
			return d.value[elem];
		}
	}

	console.log(filteredGroup.all().sort(function(x,y) {return y.value[ladderScore]-x.value[ladderScore];}).map(function (d) {return d.key[0]; /*d.country*/}));

	chart.width(1000)
		 .height(600)
		 .x(d3.scale.ordinal().domain(filteredGroup.all().sort(function(x,y) {return y.value[ladderScore]-x.value[ladderScore];}).map(function (d) {return d.key[0]; /*d.country*/})))
		 .xUnits(dc.units.ordinal)
		 .margins({left: 20, top: 20, right: 20, bottom: 20})
		 .brushOn(false)
		 .elasticY(true)
		 .dimension(countryDimension)
		 // .group(filteredGroup)
		 .group(filteredGroup, explHealthyLife, sel_stack(explHealthyLife))
		 .keyAccessor(function(d) {return d.key[0];});	 

	chart.stack(filteredGroup, explLogGDP, sel_stack(explLogGDP));	 
	chart.render();	 

});