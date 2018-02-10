// HELPERS
// in order to parse float

function loadData(){
  d3.queue()
  .defer(d3.csv,'data/wave3.csv')
  .defer(d3.csv,'data/wave4.csv')
  .defer(d3.csv,'data/wave5.csv')
  .defer(d3.csv,'data/wave6.csv')
  .await(function(error,wave3,wave4,wave5,wave6){
    if(error) {console.log(error);}
    // Main part

    var data = [parseData(wave3),parseData(wave4),parseData(wave5),parseData(wave6)];
    var bounds = [getBounds(data[0],1),getBounds(data[1],1),getBounds(data[2],1),getBounds(data[3],1)];

    // SVG canvas
    var svg = d3.select("#bubble-wrapper")
      .append("svg")
      .attr("width", 1100)
      .attr("height", 740);

    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d,s) {
                  return "<strong>Country: </strong><span class='details'>" + d.Name + "<br></span>" + "<strong>" + s + ": </strong><span class='details'>" + d[s] +"</span>";
                })

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
                width = 1060 - margin.left - margin.right,
                height = 600 - margin.top - margin.bottom;

    var xScale, yScale;
    var selectedHighlight = [];

    svg.append('g')
      .classed('chart', true)
      .attr('transform', 'translate(80, -60)');

    svg.call(tip);
    d3.select("#reset-btn")
    .attr('class','ui green button')
    .text('deselect highlight')
    .on('click',function(d){
      selectedHighlight = [];
      updateChart();
    });
    d3.select('#wave-text').text(waveDescriptions[curWave]);
    d3.select('#r-text').text('⚫ Size: ' + descriptions[rAxis]);


    d3.select('#wave-slider')
    .on("input",function(){
      curWave = d3.select('#wave-slider').property("value");
      updateChart();
      updateMenus();

    });
    // Build menus
    d3.select('#wave-menu')
    .selectAll('div')
    .data(wave)
    .enter().append('div')
    .attr('class','item')
    .text(function(d){return waveDescriptions[d];})
    .classed('selected',function(d){
      return d === curWave;
    })
    .on('click',function(d){
      curWave = d;
      updateChart();
    });

    d3.select('#x-axis-menu')
      .selectAll('div')
      .data(xAxisOptions)
      .enter().append('div')
      .attr('class','item')
      .text(function(d) {return d;})
      .classed('selected', function(d) {
        return d === xAxis;
      })
      .on('click', function(d) {
        xAxis = d;
        updateChart();
        updateMenus();
      });

    d3.select('#y-axis-menu')
      .selectAll('div')
      .data(yAxisOptions)
      .enter().append('div')
      .attr('class','item')
      .text(function(d) {return d;})
      .classed('selected', function(d) {
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
      .classed('selected', function(d) {
        return d === rAxis;
      })
      .on('click', function(d) {
        rAxis = d;
        updateChart();
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

    //d3.select('svg g.chart')
      //.append('text')
      //.attr({'id': 'rLabel', 'x':700, 'y':690, 'text-anchor': 'right'})
      //.text(descriptions[rAxis]);

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
      })
      .on('mouseover', function(d) {
        d3.select('svg g.chart #countryLabel')
          .text(d.Name)
          .transition()
          .style('opacity', 1);
        tip.show(d,rAxis);
        //d3.select(this).moveToFront();
      })
      .on('mouseout', function(d) {
        d3.select('svg g.chart #countryLabel')
          .transition()
          .duration(1500)
          .style('opacity', 0);
        tip.hide(rAxis);
        //d3.select(this).moveToBack();
      });

    var r_ordinal = d3.select('#r-ordinal')
    .append("svg")
    .attr("width",200)
    .attr("height",300)
    
    r_ordinal.append('circle').attr('id','r-min').attr('cx',70).attr('cy',50).attr('fill','#ffff1a').attr('r',rScale(bounds[curWave][rAxis].min));
    r_ordinal.append('circle').attr('id','r-medium').attr('cx',70).attr('cy',100).attr('fill','#ffff1a').attr('r',rScale(bounds[curWave][rAxis].min+bounds[curWave][rAxis].max)/2);
    r_ordinal.append('circle').attr('id','r-max').attr('cx',70).attr('cy',200).attr('fill','#ffff1a').attr('r',rScale(bounds[curWave][rAxis].max));
    r_ordinal.append('text').attr('id','r-min-t').attr('x',90).attr('y',55).text(bounds[curWave][rAxis].min);
    r_ordinal.append('text').attr('id','r-medium-t').attr('x',110).attr('y',105).text(((bounds[curWave][rAxis].min+bounds[curWave][rAxis].max)/2).toExponential(2));
    r_ordinal.append('text').attr('id','r-max-t').attr('x',130).attr('y',205).text(bounds[curWave][rAxis].max.toExponential(2));
    updateChart(true);
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



    //// RENDERING FUNCTIONS
    function updateChart(init) {
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
                      .range([20, 700]);
      yScale = d3.scale.linear()
                      .domain([bounds[curWave][yAxis].min, bounds[curWave][yAxis].max])
                      .range([650, 130]);

      rScale = d3.scale.linear()
                      .domain([bounds[curWave][rAxis].min, bounds[curWave][rAxis].max])
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
        .selectAll('li')
        .classed('selected', function(d) {
          return d === xAxis;
        });
      d3.select('#y-axis-menu')
        .selectAll('li')
        .classed('selected', function(d) {
          return d === yAxis;
      });
      d3.select('#r-axis-menu')
        .selectAll('li')
        .classed('selected', function(d) {
          return d === rAxis;
        });
      d3.select('#wave-text').text(waveDescriptions[curWave]);
      d3.select('#r-text').text('⚫ Size: ' + descriptions[rAxis]);

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
      d3.select('#r-ordinal').select('svg').selectAll('circle')
      .transition()
      .duration(500)
      .ease('quad-out')
      .attr('r',function(d){
        var tt = d3.select(this).attr('id');
        console.log(tt);
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
