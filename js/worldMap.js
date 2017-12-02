function WorldMap(){
    const map = L.map('worldmap',{maxZoom:10,minZoom:1.25}),
    topoLayer = new L.TopoJSON(),
    $countryName = $('.country-name'),
    colorScale = d3.scale.quantile()
                .range(['#edf8fb', '#ccece6', '#99d8c9', '#66c2a4', '#2ca25f', '#0e8373'])
                .domain([2,8]),
    legend = L.control({position: 'bottomright'});
    
    map.setView([20,0], 2);

    var happinessByCountry;
    var happinessData = [];
    happinessData[0] = "data/HappinessReport/whr2015_topoJSON.csv";
    happinessData[1] = "data/HappinessReport/whr2016_topoJSON.csv";
    happinessData[2] = "data/HappinessReport/whr2017_topoJSON.csv";

    d3.csv(happinessData[2],createHappinessHashMap);
    $.getJSON('data/countries.topo.json').done(addTopoData);
        
    function createHappinessHashMap(data){
        happinessByCountry = d3.map();
        data.forEach(function(d) {
            happinessByCountry.set(d.Country, (+d["Happiness score"]).toFixed(2))
        });
    }

    //add countries layers data to be shown on map
    function addTopoData(topoData){
        topoLayer.addData(topoData);
        topoLayer.addTo(map);
        topoLayer.eachLayer(handleLayer);
    }

    //set countries style, including color and set mouse event functions
    function handleLayer(layer){
        const countryName = layer.feature.properties.name;
        const happinessScore = happinessByCountry.get(countryName);
        let fillColor;

        if (happinessScore){
            fillColor = colorScale(happinessScore);    
        }
        else {
            fillColor = '#dddddd';
        }
        
        layer.setStyle({
          fillColor : fillColor,
          fillOpacity: 1,
          color:'#555',
          weight:1,
          opacity:.5
        });

        layer.on({
          mousemove : enterLayer,
          mouseout: leaveLayer
        });
    }

    //add map colors legend
    legend.onAdd = function (map) {
        var legendContainer = L.DomUtil.create('div', 'mapLegend'),
            grades = [0, 3, 4, 5, 6, 7];

        //generate a label with a colored square for each grade interval representing the color quantiles
        for (var i = 0; i < grades.length; i++) {
            legendContainer.innerHTML +=
                //sum 0.01 because the color quantiles are not exact
                '<i style="background: ' + colorScale(grades[i]+0.01) + ' "></i> ' +
                grades[i] + (grades[i + 1] ? ' &ndash;' + grades[i + 1] + '<br>' : '+');
        }
        legendContainer.innerHTML += ' <br><i style="background: #dddddd "></i> N/A';
        return legendContainer;
    };

    legend.addTo(map);


    //when mouse enter layer (country), show tooltip
    function enterLayer(event){
        const countryName = this.feature.properties.name;
        const happinessScore = happinessByCountry.get(countryName);
        let info;

        if (happinessScore){
            info = `${countryName} <br> ${happinessScore}`;
        }
        else{
            info = `${countryName} <br> sem dados`;
        }
        $countryName.html(info).show();

        const eventX = event.containerPoint.x + 220;
        const eventY = event.containerPoint.y + 200;

        const tooltip = document.querySelector(".country-name");
        tooltip.style.left = eventX + 'px';
        tooltip.style.top = eventY + 'px';

        this.bringToFront();
        this.setStyle({
            weight:2,
            opacity: 1
        });
    }

    //when mouse leave layer (country), hide tooltip
    function leaveLayer(){
        $countryName.hide();

        this.bringToBack();
        this.setStyle({
            weight:1,
            opacity:.5
        });
    }

    //slider input callback
    function onSliderInput(data){
        createHappinessHashMap(data);
        topoLayer.eachLayer(handleLayer);
    }

    //check if slider has changed
    $('#year-slider').on('input',function(){
        d3.csv(happinessData[this.value-1], onSliderInput);

        //update year label colors
        $('.range-labels span').removeClass('active');
        $('.range-labels').find('span:nth-child(' + this.value + ')').addClass('active');;
    });

    //check if year label was clicked
    $('.range-labels span').on('click',function() {
        $('#year-slider').val(($(this).index()) + 1).trigger('input');
    });
}