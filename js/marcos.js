var xAxis = 'childrenHardWork', yAxis = 'childrenFaith',rAxis='Population';
var wvAxis = 'childrenHardWork', wv_rAxis = 'Population';

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
  'AF':"#00d5e9",
  'AS':"#ff5872",
  'EU':"#fffa00",
  'NAA':"#ff9000",
  'SA':"#7feb00",
  'OC':"#7f00ff"
}

var ordianl_color = "#1500ff";
var data = [], bounds = [];
var xScale,yScale,rScale,wvScale,wv_rScale;
var selectedHighlight = [];
var curWave = 3;
var wave = [0,1,2,3];
var waveDescriptions= ['Wave3 (1995 - 1998)','Wave4 (1999 - 2004)','Wave5 (2005 - 2009)','Wave6 (2010 - 2014)'];
var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d,s,w) {
            return "<strong>Country: </strong><span class='details'>" + data[w][d.idx].Name + "<br></span>" + "<strong>" + s + ": </strong><span class='details'>" + data[w][d.idx][s] +"</span>";
          });

var map_tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d,s,v,w) {
            return "<strong>Country: </strong><span class='details'>" + data[w][d.idx].Name + "<br></span>" + "<strong>" + s + ": </strong><span class='details'>" + data[w][d.idx][s] +"<br></span>" + "<strong>Value</strong>:<span class='details'>: " + data[w][d.idx][v] + "</span>";
          })
//rainbow color scale
//var map_color = d3.scale.threshold()
  //.domain([100,200,300,400,500,600,700,800])
  //.range(["#1decf0","#1ff1a8","#21f25c","#35f223","#83f324","#d0f426","#f4cd28","#f5832a","#f6392c"]);
var map_color = d3.scale.threshold()
  .domain([100,200,300,400,500,600,700,800])
  .range(['#ffffe0','#ffdfa9','#ffbd84','#ff976d','#f47461','#e25056','#cb2f44','#ae112a','#8b0000']);
var margin = {top: 0, right: 0, bottom: 0, left: 0},
          width = 1060 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;
