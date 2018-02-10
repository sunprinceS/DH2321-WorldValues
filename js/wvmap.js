// HELPERS
// in order to parse float

function loadMapData(){
  d3.queue()
  .defer(d3.csv,'data/wave3.csv')
  .defer(d3.csv,'data/wave4.csv')
  .defer(d3.csv,'data/wave5.csv')
  .defer(d3.csv,'data/wave6.csv')
  .defer(d3.json,'data/world_countries.json')
  .await(function(error,wave3,wave4,wave5,wave6){
    if(error) {console.log(error);}
    // Main part

    var data = [parseData(wave3),parseData(wave4),parseData(wave5),parseData(wave6)];
    var bounds = [getBounds(data[0],1),getBounds(data[1],1),getBounds(data[2],1),getBounds(data[3],1)];

    // SVG canvas
    var svg = d3.select("#wv-wrapper")
      .append("svg")
      .attr("width", 1100)
      .attr("height", 740);


    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d,s) {
                  return "<strong>Country: </strong><span class='details'>" + d.Name + "<br></span>" + "<strong>" + s + ": </strong><span class='details'>" + d[s] +"</span>";
                })

    svg.call(tip);
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
                width = 1060 - margin.left - margin.right,
                height = 600 - margin.top - margin.bottom;

    var wvScale, rScale;
    var selectedHighlight = [];

    d3.select("#wv-reset-btn")
    .attr('class','ui green button')
    .text('deselect highlight')
    .on('click',function(d){
      selectedHighlight = [];
      updateChart();
    });
    d3.select('#wv-wave-text').text(waveDescriptions[wvCurWave]);
    d3.select('#wv-r-text').text('⚫ Size: ' + descriptions[wv_rAxis]);


    d3.select('#wv-wave-slider')
    .on("input",function(){
      wvCurWave = d3.select('#wv-wave-slider').property("value");
      updateChart();
      updateMenus();

    });
    // Build menus

    d3.select('#wv-wv-menu')
      .selectAll('div')
      .data(xAxisOptions)
      .enter().append('div')
      .attr('class','item')
      .text(function(d) {return d;})
      .classed('selected', function(d) {
        return d === wvAxis;
      })
      .on('click', function(d) {
        wvAxis = d;
        updateChart();
        updateMenus();
      });


    d3.select('#wv-r-menu')
      .selectAll('div')
      .data(rAxisOptions)
      .enter().append('div')
      .attr('class','item')
      .text(function(d) {return d;})
      .classed('selected', function(d) {
        return d === wv_rAxis;
      })
      .on('click', function(d) {
        wv_rAxis = d;
        updateChart();
        updateMenus();
      });

    // Country name
    //d3.select('svg g.chart')
      //.append('text')
      //.attr({'id': 'countryLabel', 'x': 70, 'y': 100})
      //.style({'font-size': '50px', 'font-weight': 'bold', 'fill': '#ddd'});

    // Render points
    updateScales();

    var r_ordinal = d3.select('#wv-r-ordinal')
    .append("svg")
    .attr("width",200)
    .attr("height",300)
    
    r_ordinal.append('circle').attr('id','wv-r-min').attr('cx',70).attr('cy',50).attr('fill','#ffff1a').attr('r',rScale(bounds[wvCurWave][wv_rAxis].min));
    r_ordinal.append('circle').attr('id','wv-r-medium').attr('cx',70).attr('cy',100).attr('fill','#ffff1a').attr('r',rScale(bounds[wvCurWave][wv_rAxis].min+bounds[wvCurWave][wv_rAxis].max)/2);
    r_ordinal.append('circle').attr('id','wv-r-max').attr('cx',70).attr('cy',200).attr('fill','#ffff1a').attr('r',rScale(bounds[wvCurWave][wv_rAxis].max));
    r_ordinal.append('text').attr('id','wv-r-min-t').attr('x',90).attr('y',55).text(bounds[wvCurWave][wv_rAxis].min);
    r_ordinal.append('text').attr('id','wv-r-medium-t').attr('x',110).attr('y',105).text(((bounds[wvCurWave][wv_rAxis].min+bounds[wvCurWave][wv_rAxis].max)/2).toExponential(2));
    r_ordinal.append('text').attr('id','wv-r-max-t').attr('x',130).attr('y',205).text(bounds[wvCurWave][wv_rAxis].max.toExponential(2));
    updateChart(true);
    updateMenus();

    //// RENDERING FUNCTIONS
    function updateChart(init) {
      updateScales();

      //d3.select('svg g.map')
        //.selectAll('circle')
        //.transition()
        //.duration(500)
        //.ease('quad-out')
        //.attr('cx', function(d) {
          //return isNaN(data[curWave][d.idx][xAxis]) ? d3.select(this).attr('cx') : xScale(data[curWave][d.idx][xAxis]);
        //})
        //.attr('cy', function(d) {
          //return isNaN(data[curWave][d.idx][yAxis]) ? d3.select(this).attr('cy') : yScale(data[curWave][d.idx][yAxis]);
        //})
        //.attr('r', function(d) {
          //return (isNaN(data[curWave][d.idx][xAxis]) || isNaN(data[curWave][d.idx][yAxis]) || isNaN(data[curWave][d.idx][rAxis])) ? 0 : rScale(data[curWave][d.idx][rAxis]);
        //})
        //.style("opacity",function(d){
          //if(selectedHighlight.length == 0){
            //return 1;
          //}
          //else{
            //if(selectedHighlight.indexOf(d.idx) != -1){
              //return 1;
            //}
            //else{
              //return 0.2;
            //}
          //}
        //});

    }

    function updateScales() {
      wvScale = d3.scale.linear()
                      .domain([bounds[wvCurWave][wvAxis].min, bounds[wvCurWave][wvAxis].max])
                      .range([20, 700]);
      rScale = d3.scale.linear()
                      .domain([bounds[wvCurWave][wv_rAxis].min, bounds[wvCurWave][wv_rAxis].max])
                      .range([5, 50]);    
    }


    function updateMenus() {
      d3.select('#wv-wv-menu')
        .selectAll('li')
        .classed('selected', function(d) {
          return d === wvAxis;
        });
      d3.select('#wv-r-menu')
        .selectAll('li')
        .classed('selected', function(d) {
          return d === wv_rAxis;
      });
      d3.select('#wv-wave-text').text(waveDescriptions[wvCurWave]);
      d3.select('#wv-r-text').text('⚫ Size: ' + descriptions[wv_rAxis]);

      d3.select('#wv-r-ordinal').select('svg').selectAll('text')
      .text(function(d){
        var tt = d3.select(this).attr('id');
        if(tt == 'wv-r-min-t')
          return bounds[wvCurWave][wv_rAxis].min.toExponential(2);
        else if(tt == 'wv-r-medium-t')
          return ((bounds[wvCurWave][wv_rAxis].min+bounds[wvCurWave][wv_rAxis].max)/2).toExponential(2);
        else
          return bounds[wvCurWave][wv_rAxis].max.toExponential(2);
      });
      d3.select('#wv-r-ordinal').select('svg').selectAll('circle')
      .transition()
      .duration(500)
      .ease('quad-out')
      .attr('r',function(d){
        var tt = d3.select(this).attr('id');
        if(tt == 'wv-r-min')
          return rScale(bounds[wvCurWave][wv_rAxis].min);
        else if(tt == 'wv-r-medium')
          return rScale((bounds[wvCurWave][wv_rAxis].min+bounds[wvCurWave][wv_rAxis].max)/2);
        else
          return rScale(bounds[wvCurWave][wv_rAxis].max);
      });
    }
    });
}
