// HELPERS
// in order to parse float

function loadData(){
  d3.queue()
  .defer(d3.csv,'data/wave3.csv')
  .defer(d3.csv,'data/wave4.csv')
  .defer(d3.csv,'data/wave5.csv')
  .defer(d3.csv,'data/wave6.csv')
  .defer(d3.json,'data/world_countries.json')
  .await(function(error,wave3,wave4,wave5,wave6,countries){
    if(error) {console.log(error);}
    // Main part

    data = [parseData(wave3),parseData(wave4),parseData(wave5),parseData(wave6)];
    bounds = [getBounds(data[0],1),getBounds(data[1],1),getBounds(data[2],1),getBounds(data[3],1)];

    // SVG canvas
    var map_svg = d3.select('#wv-wrapper')
    .append("svg")
    .attr("width", 1100)
    .attr("height", 640)
    .attr('class','map');

    var xy = d3.geo.equirectangular().scale(200);
    var path = d3.geo.path().projection(xy);

    var svg = d3.select("#bubble-wrapper")
      .append("svg")
      .attr("width", 1100)
      .attr("height", 740);
      var map_color = d3.scale.threshold()
          .domain([100,200,300,400,500,600,700,800])
          .range(["rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);


    svg.call(tip);
    map_svg.call(map_tip);

    svg.append('g')
      .classed('chart', true)
      .attr('transform', 'translate(80, -60)');

    d3.select("#reset-btn")
    .attr('class','ui green button')
    .text('Deselect Highlight')
    .on('click',function(d){
      selectedHighlight = [];
      updateMap()
      updateChart();
    });
    d3.select('#toggle-btn')
    .attr('class', 'ui orange button')
    .text('Toggle x-y axis')
    .on('click',function(d){
      var t = xAxis;
      xAxis = yAxis;
      yAxis = t;
      updateScales();
      updateChart();
      updateMenus();
      updateMap();
    });
    d3.select('#r-text').text('⚫ Size: ' + descriptions[rAxis]);
    d3.select('#wv-x-description').text('Map of' + descriptions[xAxis]);


    d3.select('#wave-slider')
    .on("input",function(){
      curWave = d3.select(this).property("value");
      updateChart();
      updateMap();
      updateMenus();
    });

    // Build menus

    d3.select('#x-axis-menu')
      .selectAll('div')
      .data(xAxisOptions)
      .enter().append('div')
      .attr('class','item')
      .text(function(d) {return d;})
      .classed('active', function(d) {
        return d === xAxis;
      })
      .on('click', function(d) {
        xAxis = d;
        updateChart();
        updateMap();
        updateMenus();
      });

    d3.select('#y-axis-menu')
      .selectAll('div')
      .data(yAxisOptions)
      .enter().append('div')
      .attr('class','item')
      .text(function(d) {return d;})
      .classed('active', function(d) {
        return d === yAxis;
      })
      .on('click', function(d) {
        yAxis = d;
        updateChart();
        updateMenus();
      });

    d3.select('#r-axis-menu')
      .selectAll('div')
      .data(rAxisOptions)
      .enter().append('div')
      .attr('class','item')
      .text(function(d) {return d;})
      .classed('active', function(d) {
        return d === rAxis;
      })
      .on('click', function(d) {
        rAxis = d;
        updateChart();
        updateMenus();
      });

    d3.select('#wv-r-menu')
      .selectAll('div')
      .data(rAxisOptions)
      .enter().append('div')
      .attr('class','item')
      .text(function(d) {return d;})
      .classed('active', function(d) {
        return d === wv_rAxis;
      })
      .on('click', function(d) {
        wv_rAxis = d;
        updateMap();
        updateMenus();
      });

    // Country name
    d3.select('svg g.chart')
      .append('text')
      .attr({'id': 'countryLabel', 'x': 70, 'y': 100})
      .style({'font-size': '50px', 'font-weight': 'bold', 'fill': '#ddd'});

    // Best fit line (to appear behind points)
    d3.select('svg g.chart')
      .append('line')
      .attr('id', 'bestfit');

    // Axis labels
    d3.select('svg g.chart')
      .append('text')
      .attr({'id': 'xLabel', 'x': 400, 'y': 780, 'text-anchor': 'middle'})
      .text(descriptions[xAxis]);

    d3.select('svg g.chart')
      .append('text')
      .attr('transform', 'translate(-60, 330)rotate(-90)')
      .attr({'id': 'yLabel', 'text-anchor': 'middle'})
      .text(descriptions[yAxis]);

    // Render points
    updateScales();


d3.select('svg g.chart')
      .selectAll('circle')
      .data(data[curWave])
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return isNaN(d[xAxis]) ? d3.select(this).attr('cx') : xScale(d[xAxis]);
      })
      .attr('cy', function(d) {
        return isNaN(d[yAxis]) ? d3.select(this).attr('cy') : yScale(d[yAxis]);
      })
      .attr('r', function(d) {
        return (isNaN(d[xAxis]) || isNaN(d[yAxis]) || isNaN(d[rAxis])) ? 0 : rScale(d[rAxis]);
      })
      .attr('fill', function(d) {return toColor[d['Continent']];})
      .style('cursor', 'pointer')
      .on('click',function(d){
        var indx = selectedHighlight.indexOf(d.idx);
        if(indx == -1){
          selectedHighlight.push(d.idx);
        }
        else{
          selectedHighlight.splice(indx,1);
        }
        updateChart();
        updateMap();
      })
      .on('mouseover', function(d) {
        d3.select('svg g.chart #countryLabel')
          .text(d.Name)
          .transition()
          .style('opacity', 1);
        tip.show(d,rAxis,curWave);
      })
      .on('mouseout', function(d) {
        d3.select('svg g.chart #countryLabel')
          .transition()
          .duration(1500)
          .style('opacity', 0);
        tip.hide(rAxis,curWave);
      });

    map_svg.append("g").attr('id','states')
    .selectAll('path')
    .data(countries.features)
    .enter().append("svg:path")
    .attr("d", path)
    .on("mouseover", function(d) {
    d3.select(this).style("fill","#6C0")
        .append("svg:title")
        .text(d.properties.name);})
    .on("mouseout", function(d) {
        d3.select(this).style("fill","#CED8B6");})


    var circles = map_svg.append("svg:g").attr("id","circles");
    circles.selectAll("circle").data(data[curWave]).enter()
    .append("svg:circle")
    .attr("cx", function(d, i) { return xy([+d["Longitude"],+d["Latitude"]])[0]; })
      .attr("cy", function(d, i) { return xy([+d["Longitude"],+d["Latitude"]])[1]; })
      .attr("r",  function(d) { 
        return (isNaN(d[wv_rAxis]) || isNaN(d[xAxis]))?0:+wv_rScale(d[wv_rAxis]);
      })
    .attr("fill",function(d){return map_color(xScale(d[xAxis]));})
      .on('click',function(d){
        var indx = selectedHighlight.indexOf(d.idx);
        if(indx == -1){
          selectedHighlight.push(d.idx);
        }
        else{
          selectedHighlight.splice(indx,1);
        }
        updateChart();
        updateMap();
      })
      .on("mouseover", function(d) {
        map_tip.show(d,wv_rAxis,xAxis,curWave);
      })
      .on("mouseout", function(d) {
        map_tip.hide(wv_rAxis,xAxis,curWave);
      });
    

    var r_ordinal = d3.select('#r-ordinal')
    .append("svg")
    .attr("width",200)
    .attr("height",300)
    
    r_ordinal.append('circle').attr('id','r-min').attr('cx',70).attr('cy',50).attr('fill','#ffff1a').attr('r',rScale(bounds[curWave][rAxis].min));
    r_ordinal.append('circle').attr('id','r-medium').attr('cx',70).attr('cy',100).attr('fill','#ffff1a').attr('r',rScale((bounds[curWave][rAxis].min+bounds[curWave][rAxis].max)/2));
    r_ordinal.append('circle').attr('id','r-max').attr('cx',70).attr('cy',200).attr('fill','#ffff1a').attr('r',rScale(bounds[curWave][rAxis].max));
    r_ordinal.append('text').attr('id','r-min-t').attr('x',90).attr('y',55).text(bounds[curWave][rAxis].min);
    r_ordinal.append('text').attr('id','r-medium-t').attr('x',110).attr('y',105).text(((bounds[curWave][rAxis].min+bounds[curWave][rAxis].max)/2).toExponential(2));
    r_ordinal.append('text').attr('id','r-max-t').attr('x',130).attr('y',205).text(bounds[curWave][rAxis].max.toExponential(2));

    var wv_r_ordinal = d3.select('#wv-r-ordinal')
    .append("svg")
    .attr("width",200)
    .attr("height",300)
    
    wv_r_ordinal.append('circle').attr('id','wv-r-min').attr('cx',70).attr('cy',50).attr('fill','#ffff1a').attr('r',rScale(10));
    wv_r_ordinal.append('circle').attr('id','wv-r-medium').attr('cx',70).attr('cy',100).attr('fill','#ffff1a').attr('r',rScale((bounds[curWave][wv_rAxis].min+bounds[curWave][wv_rAxis].max)/2));
    wv_r_ordinal.append('circle').attr('id','wv-r-max').attr('cx',70).attr('cy',200).attr('fill','#ffff1a').attr('r',rScale(bounds[curWave][wv_rAxis].max));
    wv_r_ordinal.append('text').attr('id','wv-r-min-t').attr('x',90).attr('y',55).text(bounds[curWave][wv_rAxis].min);
    wv_r_ordinal.append('text').attr('id','wv-r-medium-t').attr('x',110).attr('y',105).text(((bounds[curWave][wv_rAxis].min+bounds[curWave][wv_rAxis].max)/2).toExponential(2));
    wv_r_ordinal.append('text').attr('id','wv-r-max-t').attr('x',130).attr('y',205).text(bounds[curWave][wv_rAxis].max.toExponential(2));
    updateChart(true);
    updateMap(true);
    updateMenus();

    // Render axes
    d3.select('svg g.chart')
      .append("g")
      .attr('transform', 'translate(0, 730)')
      .attr('id', 'xAxis')
      .call(makeXAxis);

    d3.select('svg g.chart')
      .append("g")
      .attr('id', 'yAxis')
      .attr('transform', 'translate(-10, 0)')
      .call(makeYAxis);


    function updateMap(init){
      map_svg.call(map_tip);
      updateScales();
      circles.selectAll('circle')
      .transition()
      .duration(1000).ease('linear')
      .attr('r',function(d){
        return (isNaN(data[curWave][d.idx][xAxis]) || isNaN(data[curWave][d.idx][wv_rAxis]))?0:wv_rScale(data[curWave][d.idx][wv_rAxis]);
      })
      .attr("fill",function(d){
        return map_color(xScale(data[curWave][d.idx][xAxis]));
      })
      .style("opacity",function(d){
        if(selectedHighlight.length == 0){
          return 0.8;
        }
        else{
          if(selectedHighlight.indexOf(d.idx) != -1){
            return 0.8;
          }
          else{
            return 0.2;
          }
        }
      });
    }
    //// RENDERING FUNCTIONS
    function updateChart(init) {
      svg.call(tip);
      updateScales();

      d3.select('svg g.chart')
        .selectAll('circle')
        .transition()
        .duration(500)
        .ease('quad-out')
        .attr('cx', function(d) {
          return isNaN(data[curWave][d.idx][xAxis]) ? d3.select(this).attr('cx') : xScale(data[curWave][d.idx][xAxis]);
        })
        .attr('cy', function(d) {
          return isNaN(data[curWave][d.idx][yAxis]) ? d3.select(this).attr('cy') : yScale(data[curWave][d.idx][yAxis]);
        })
        .attr('r', function(d) {
          return (isNaN(data[curWave][d.idx][xAxis]) || isNaN(data[curWave][d.idx][yAxis]) || isNaN(data[curWave][d.idx][rAxis])) ? 0 : rScale(data[curWave][d.idx][rAxis]);
        })
        .style("opacity",function(d){
          if(selectedHighlight.length == 0){
            return 1;
          }
          else{
            if(selectedHighlight.indexOf(d.idx) != -1){
              return 1;
            }
            else{
              return 0.2;
            }
          }
        });

      // Also update the axes
      d3.select('#xAxis')
        .transition()
        .call(makeXAxis);

      d3.select('#wv-x-description').text('Map of ' + descriptions[xAxis]);
      d3.select('#yAxis')
        .transition()
        .call(makeYAxis);

      // Update axis labels
      d3.select('#xLabel')
        .text(descriptions[xAxis]);

      d3.select('#yLabel')
        .text(descriptions[yAxis]);

      // Update correlation
      var xArray = _.map(data[curWave], function(d) {
        if(isNaN(d[rAxis]))
          return NaN;
        return d[xAxis];
      });
      var yArray = _.map(data[curWave], function(d) {
        if(isNaN(d[rAxis]))
          return NaN;
        return d[yAxis];
      });
      var c = getCorrelation(xArray, yArray);
      var x1 = xScale.domain()[0], y1 = c.m * x1 + c.b;
      var x2 = xScale.domain()[1], y2 = c.m * x2 + c.b;

      // Fade in
      d3.select('#bestfit')
        .style('opacity', 0)
        .attr({'x1': xScale(x1), 'y1': yScale(y1), 'x2': xScale(x2), 'y2': yScale(y2)})
        .transition()
        .duration(1500)
        .style('opacity', 1);
    }

    function updateScales() {
      xScale = d3.scale.linear()
                      .domain([bounds[curWave][xAxis].min, bounds[curWave][xAxis].max])
                      .range([20, 800]);
      yScale = d3.scale.linear()
                      .domain([bounds[curWave][yAxis].min, bounds[curWave][yAxis].max])
                      .range([650, 130]);

      rScale = d3.scale.linear()
                      .domain([bounds[curWave][rAxis].min, bounds[curWave][rAxis].max])
                      .range([5, 50]);    
      wv_rScale = d3.scale.linear()
                      .domain([bounds[curWave][wv_rAxis].min, bounds[curWave][wv_rAxis].max])
                      .range([5, 50]);    

    }

    function makeXAxis(s) {
      s.call(d3.svg.axis()
        .scale(xScale)
        .orient("bottom"));
    }

    function makeYAxis(s) {
      s.call(d3.svg.axis()
        .scale(yScale)
        .orient("left"));
    }

    function updateMenus() {
      d3.select('#x-axis-menu')
        .selectAll('div')
        .classed('active', function(d) {
          return d === xAxis;
        });
      d3.select('#y-axis-menu')
        .selectAll('div')
        .classed('active', function(d) {
          return d === yAxis;
      });
      d3.select('#r-axis-menu')
        .selectAll('div')
        .classed('active', function(d) {
          return d === rAxis;
        });
      d3.selectAll('#wave-text').text(waveDescriptions[curWave]);
      d3.select('#r-text').text('⚫ Size: ' + descriptions[rAxis]);
      d3.select('#wv-r-text').text('⚫ Size: ' + descriptions[wv_rAxis]);

      d3.select('#r-ordinal').select('svg').selectAll('text')
      .text(function(d){
        var tt = d3.select(this).attr('id');
        if(tt == 'r-min-t')
          return bounds[curWave][rAxis].min.toExponential(2);
        else if(tt == 'r-medium-t')
          return ((bounds[curWave][rAxis].min+bounds[curWave][rAxis].max)/2).toExponential(2);
        else
          return bounds[curWave][rAxis].max.toExponential(2);
      });
      d3.select('#wv-r-ordinal').select('svg').selectAll('text')
      .text(function(d){
        var tt = d3.select(this).attr('id');
        if(tt == 'wv-r-min-t')
          return bounds[curWave][wv_rAxis].min.toExponential(2);
        else if(tt == 'wv-r-medium-t')
          return ((bounds[curWave][wv_rAxis].min+bounds[curWave][wv_rAxis].max)/2).toExponential(2);
        else
          return bounds[curWave][wv_rAxis].max.toExponential(2);
      });
      d3.select('#wv-r-ordinal').select('svg').selectAll('circle')
      .transition()
      .duration(500)
      .ease('quad-out')
      .attr('r',function(d){
        var tt = d3.select(this).attr('id');
        if(tt == 'wv-r-min')
          return wv_rScale(bounds[curWave][wv_rAxis].min);
        else if(tt == 'wv-r-medium')
          return wv_rScale((bounds[curWave][wv_rAxis].min+bounds[curWave][wv_rAxis].max)/2);
        else
          return wv_rScale(bounds[curWave][wv_rAxis].max);

      });
      d3.select('#r-ordinal').select('svg').selectAll('circle')
      .transition()
      .duration(500)
      .ease('quad-out')
      .attr('r',function(d){
        var tt = d3.select(this).attr('id');
        if(tt == 'r-min')
          return rScale(bounds[curWave][rAxis].min);
        else if(tt == 'r-medium')
          return rScale((bounds[curWave][rAxis].min+bounds[curWave][rAxis].max)/2);
        else
          return rScale(bounds[curWave][rAxis].max);

      })
    }
    });
}
