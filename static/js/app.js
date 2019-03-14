function buildMetadata(sample) {
  // @TODO: Complete the following function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  var metadata_url = `/metadata/${sample}`
  d3.json(metadata_url).then(function(response) {
    // console.log(response);  
    // Use d3 to select the panel with id of `#sample-metadata`
    var metadata_panel = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    metadata_panel.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(response).forEach(([key,value]) => {
      metadata_panel.append("p").text(`${key}: ${value}`);
    })

    // BONUS: Build the Gauge Chart--------------------------------------------------------------------
    // buildGauge(data.WFREQ);
    // Set the speed from 0-9 from WFEQ
    var level = response.WFREQ;
    // Trig to calc meter point *** bc WFEQ is split into 9 equal portions 180/9=20 degrees***
    var degrees = 180 - (level * 20),
        // This is the length of the gauge pointer!!!
        radius = .6;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    // Path: may have to change to create a better triangle
    // this is the direction of two lines that create the gauge pointer into a traingle-style look
    var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
      x: [0], y:[0],
        // This is the gauge pointer point-of-origin (without the pointer here)
        marker: {size: 1, color:'850000'},
        showlegend: false,
        name: 'speed',
        text: level,
        hoverinfo: 'text+name'},
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3',
                '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(0, 50, 0, .5)', 'rgba(0, 75, 0, .5)',
                            'rgba(0, 100, 0, .5)', 'rgba(14, 127, 0, .5)',
                            'rgba(110, 154, 22, .5)', 'rgba(170, 202, 42, .5)',
                            'rgba(202, 209, 95, .5)', 'rgba(210, 206, 145, .5)',
                            'rgba(232, 226, 202, .5)', 'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          // this is the pointer red coloring
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: 'Belly Button Wash Frequency', 
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };
    Plotly.newPlot('gauge', data, layout);
  })
}
//-------------------------------------------------------------------------------------------
function buildCharts(sample) {
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var chart_url = `/samples/${sample}`;
  d3.json(chart_url).then(function(data) {
    // @TODO: Build a Bubble Chart using the sample data
    var bubble_trace = {
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      mode: 'markers',
      marker: {
        size: data.sample_values,
        color: data.otu_ids
      }
    };
    var bubble_data = [bubble_trace];
    var bubble_layout = {
    };
    Plotly.newPlot('bubble', bubble_data, bubble_layout);

  // @TODO: Build a Pie Chart
  // HINT: You will need to use slice() to grab the top 10 sample_values,
  // otu_ids, and labels (10 each).
    var pie_data = [{
      values: data.sample_values.slice(0,10),
      labels: data.otu_ids.slice(0,10),
      hovertext: data.otu_labels.slice(0,10),
      type: 'pie'
    }];
    var pie_layout = {
    };
    Plotly.newPlot('pie', pie_data, pie_layout);
  });
}
//-----------------------------------------------------------------------------------------------------
function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
};
function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
};
// Initialize the dashboard
init();
