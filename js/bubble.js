// HELPERS
// in order to parse float
function parseData(d) {
  var keys = _.keys(d[0]);
  return _.map(d, function(d) {
    var o = {};
    _.each(keys, function(k) {
      if( k == 'Name' || k=='Code' || k=='Continent')
        o[k] = d[k];
      else
        o[k] = parseFloat(d[k]);
    });
    return o;
  });
}

function getBounds(d, paddingFactor) {
  // Find min and maxes (for the scales)
  paddingFactor = typeof paddingFactor !== 'undefined' ? paddingFactor : 1;

  var keys = _.keys(d[0]), b = {};
  _.each(keys, function(k) {
    b[k] = {};
    _.each(d, function(d) {
      if(isNaN(d[k]))
        return;
      if(b[k].min === undefined || d[k] < b[k].min)
        b[k].min = d[k];
      if(b[k].max === undefined || d[k] > b[k].max)
        b[k].max = d[k];
    });
    b[k].max > 0 ? b[k].max *= paddingFactor : b[k].max /= paddingFactor;
    b[k].min > 0 ? b[k].min /= paddingFactor : b[k].min *= paddingFactor;
  });
  return b;
}

function getCorrelation(xArray, yArray) {
  function sum(m, v) {return m + v;}
  function sumSquares(m, v) {return m + v * v;}
  function filterNaN(m, v, i) {isNaN(v) ? null : m.push(i); return m;}

  // clean the data (because we know that some values are missing)
  var xNaN = _.reduce(xArray, filterNaN , []);
  var yNaN = _.reduce(yArray, filterNaN , []);
  var include = _.intersection(xNaN, yNaN);
  var fX = _.map(include, function(d) {return xArray[d];});
  var fY = _.map(include, function(d) {return yArray[d];});

  var sumX = _.reduce(fX, sum, 0);
  var sumY = _.reduce(fY, sum, 0);
  var sumX2 = _.reduce(fX, sumSquares, 0);
  var sumY2 = _.reduce(fY, sumSquares, 0);
  var sumXY = _.reduce(fX, function(m, v, i) {return m + v * fY[i];}, 0);

  var n = fX.length;
  var ntor = ( ( sumXY ) - ( sumX * sumY / n) );
  var dtorX = sumX2 - ( sumX * sumX / n);
  var dtorY = sumY2 - ( sumY * sumY / n);
 
  // Pearson ( http://www.stat.wmich.edu/s216/book/node122.html )
  var r = ntor / (Math.sqrt( dtorX * dtorY ));

  var m = ntor / dtorX; // y = mx + b
  var b = ( sumY - m * sumX ) / n;

  return {r: r, m: m, b: b};
}

function loadData(){
  d3.queue()
  .defer(d3.csv,'data/wave3.csv')
  .defer(d3.csv,'data/wave4.csv')
  .defer(d3.csv,'data/wave5.csv')
  .defer(d3.csv,'data/wave6.csv')
  .await(function(error,wave3,wave4,wave5,wave6){
    if(error) {console.log(error);}
    // Main part

    //init
    var xAxis = 'neighborImmigrant', yAxis = 'universityManImp',rAxis='Population';

    var xAxisOptions=["neighborImmigrant","childrenHardWork","universityManImp","childrenFaith","neighborReligion","neighborRace","BetterLeader","fightCountry","HomosexJustify","trust","SuicideJus","EnvImp","childrenThrift","religiousPerson","divorceJus","childrenImagination","NationProud"];
    var yAxisOptions=["neighborImmigrant","childrenHardWork","universityManImp","childrenFaith","neighborReligion","neighborRace","BetterLeader","fightCountry","HomosexJustify","trust","SuicideJus","EnvImp","childrenThrift","religiousPerson","divorceJus","childrenImagination","NationProud"];
    var rAxisOptions=["Mortality","CO2-avg","CO2-total","Life-length","Fertility","GDP","Population"];

    var descriptions = {
      "neighborImmigrant": "Would not like to have neighbors like immigrants (%)",
      "childrenHardWork":  "Important for children to be hard-working (%)",
      "universityManImp": "University education is important for men than women (pt)",
      "childrenFaith": "Important for children to have faith (%)",
      "neighborReligion": "Would not like to have neighbors with different religion (%)",
      "neighborRace": "Would not like to have neighbors with different race (%)",
      "BetterLeader": "Men make better political leaders than women do (pt)",
      "fightCountry": "Willingness to fight for country (pt)",
      "HomosexJustify": "Homosexuality is justifiable (mean pt)",
      "trust": "Most people can be trusted (%)",
      "SuicideJus":"Suicide is justifiable (mean pt)",
      "EnvImp": "Environment protection is more important than economic development",
      "childrenThrift": "Important for children to save money (%)",
      "religiousPerson": "Be religious (%)",
      "divorceJus": "Divorce is justifiable (mean pt)",
      "childrenImigination": "Important for children to have imagination (%)",
      "NationProud": "Proud of country (pt)",
      "Mortality":"0-5 year-olds dying per 1000 born",
      "CO2-avg":"CO2 emission (tonnes per person)",
      "CO2-total":"Yearly CO2 emission (1000 tonnes)",
      "Life-length":"Average number of years a newborn child live (years)",
      "Fertility":"Babies per woman",
      "GDP":"GDP per person (US$)",
      "Population":"Total Population"
    };

    var toColor={
      'AF':"#990099",
      'AS':"#ff9900",
      'EU':"#3366cc",
      'NAA':"#dc3912",
      'SA':"#109618",
      'OC':"#dd4477"
    }

    var curWave = 0;
    var wave = [0,1,2,3];
    var waveDescriptions= ['Wave3','Wave4','Wave5','Wave6'];
    var data = [parseData(wave3),parseData(wave4),parseData(wave5),parseData(wave6)];
    var bounds = [getBounds(data[0],1),getBounds(data[1],1),getBounds(data[2],1),getBounds(data[3],1)];

    // SVG canvas
    var svg = d3.select("#bubble-wrapper")
      .append("svg")
      .attr("width", 1300)
      .attr("height", 740);



    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d,s) {
                  return "<strong>Country: </strong><span class='details'>" + d.Name + "<br></span>" + "<strong>" + s + ": </strong><span class='details'>" + d[s] +"</span>";
                })

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
                width = 1260 - margin.left - margin.right,
                height = 600 - margin.top - margin.bottom;

    var xScale, yScale;
    var selectedHighlight = [];

    svg.append('g')
      .classed('chart', true)
      .attr('transform', 'translate(80, -60)');

    svg.call(tip);
    d3.select("#reset-btn")
    .attr('class','ui red button')
    .text('deselect highlight')
    .on('click',function(d){
      selectedHighlight = [];
      updateChart();
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

    d3.select('svg g.chart')
      .append('text')
      .attr({'id': 'rLabel', 'x':700, 'y':690, 'text-anchor': 'right'})
      .text(descriptions[rAxis]);

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
        console.log(indx);
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
          return isNaN(d[xAxis]) ? d3.select(this).attr('cx') : xScale(d[xAxis]);
        })
        .attr('cy', function(d) {
          return isNaN(d[yAxis]) ? d3.select(this).attr('cy') : yScale(d[yAxis]);
        })
        .attr('r', function(d) {
          return (isNaN(d[xAxis]) || isNaN(d[yAxis]) || isNaN(d[rAxis])) ? 0 : rScale(d[rAxis]);
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
      d3.select('#rLabel')
        .text("● "+descriptions[rAxis]);
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
                      .range([20, 900]);
      yScale = d3.scale.linear()
                      .domain([bounds[curWave][yAxis].min, bounds[curWave][yAxis].max])
                      .range([650, 130]);

      if(rAxis == 'CO2-total' || rAxis == 'CO2-avg'){
        rScale = d3.scale.linear()
                        .domain([bounds[curWave][rAxis].min, bounds[curWave][rAxis].max])
                        .range([3, 50]);    
      }
      else if(rAxis == 'Population'){
        rScale = d3.scale.sqrt()
                        .domain([bounds[curWave][rAxis].min, bounds[curWave][rAxis].max])
                        .range([5, 50]);    
      }
      else{
        rScale = d3.scale.linear()
                        .domain([bounds[curWave][rAxis].min, bounds[curWave][rAxis].max])
                        .range([2, 40]);    
      }
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
    }

    });
}
