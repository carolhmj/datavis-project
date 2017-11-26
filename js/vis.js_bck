//Charts definition
var chart = dc.barChart("#happinessFactors");

var explLogGDP = "Explained by: Log GDP per capita";
var explSocialSupport = "Explained by: Social support";
var explHealthyLife = "Explained by: Healthy life expectancy";
var explLifeChoices = "Explained by: Freedom to make life choices";
var explGenerosity = "Explained by: Generosity";
var explCorruption = "Explained by: Perceptions of corruption";
var residualPlusDystopia = "Dystopia + residual";
var ladderScore = "Ladder score";

d3.csv("data/HappinessReport/whr2015.csv", function(data) {
	console.log(data);
	data.forEach(function(d) {
		d.show = false;
		d[explLogGDP] = +d[explLogGDP];
		d[explHealthyLife] = +d[explHealthyLife];
		d[explSocialSupport] = +d[explSocialSupport];
		d[explLifeChoices] = +d[explLifeChoices];
		d[explGenerosity] = +d[explGenerosity];
		d[explCorruption] = +d[explCorruption];
		d[residualPlusDystopia] = +d[residualPlusDystopia];
		d[ladderScore] = +d[ladderScore];
	});

	data.sort(function(x,y) {
		return y[ladderScore] - x[ladderScore];
	});

	for (var i = data.length - 1; i >= data.length - 5; i--) {
		data[i].show = true;
	}
	// for (var i = 0; i < 5; i++) {
	// 	data[i].show = true;
	// }
	
	var facts = crossfilter(data);
	var countryDimension = facts.dimension(function(d) {
		return [d.country, d.show];
	});
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

	//We swap the width and height so the graph is drawn correctly
	var rect =  _bbox = chart.root().node().parentNode.getBoundingClientRect();
	var chartWidth = _bbox.height;
	var chartHeight = _bbox.width;
	console.log('size: ' + chartWidth + ' ' + chartHeight);

	chart.width(chartWidth)
		 .height(chartHeight)
		 .gap(20)
		 .x(d3.scale.ordinal().domain(filteredGroup.all().sort(function(x,y) {return y.value[ladderScore]-x.value[ladderScore];}).map(function (d) {return d.key[0]; /*d.country*/})))
		 .xUnits(dc.units.ordinal)
		 .margins({left: 40, top: 80, right: 0, bottom: 40})
		 .brushOn(false)
		 .elasticY(true)
		 .dimension(countryDimension)
		 .group(filteredGroup, residualPlusDystopia, sel_stack(residualPlusDystopia))
		 .keyAccessor(function(d) {return d.key[0];});	 
	 
	chart.stack(filteredGroup, explLogGDP, sel_stack(explLogGDP));
	chart.stack(filteredGroup, explLifeChoices, sel_stack(explLifeChoices));
	chart.stack(filteredGroup, explHealthyLife, sel_stack(explHealthyLife));
	chart.stack(filteredGroup, explSocialSupport, sel_stack(explSocialSupport));
	chart.stack(filteredGroup, explCorruption, sel_stack(explCorruption));
	chart.stack(filteredGroup, explGenerosity, sel_stack(explGenerosity));
	chart.render();	 

});