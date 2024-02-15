// app.js

// // Fetch data from the URL
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

function buildMetadata(sample) {
    d3.json(url).then((data) => {
        let metadata = data.metadata;
        let result = metadata.find(metadataObj => metadataObj.id == sample);

        // Use d3 to select the panel with id of `#sample-metadata`
        let PANEL = d3.select("#sample-metadata");

        // Use `.html("") to clear any existing metadata
        PANEL.html("");

        // Hint: Inside the loop, you will need to use d3 to append new
        // tags for each key-value in the metadata.
        Object.entries(result).forEach(([key, value]) => {
            PANEL.append("h6").text(`${key}: ${value}`);
        });
    });
}

function buildCharts(sample) {
    d3.json(url).then((data) => {
        let samples = data.samples;
        let resultArray = samples.filter(sampleObj => sampleObj.id == sample);
        let result = resultArray[0];

        let otu_ids = result.otu_ids;
        let otu_labels = result.otu_labels;
        let sample_values = result.sample_values;

        // Build a Bubble Chart
        let bubbleLayout = {
            margin: { t: 0 },
            hovermode: "closest",
            xaxis: { title: "OTU ID" },
        };

        let bubbleData = [
            {
                x: otu_ids,
                y: sample_values,
                text: otu_labels,
                mode: "markers",
                marker: {
                    size: sample_values,
                    color: otu_ids,
                    colorscale: "Earth",
                }
            } 
        ];

        Plotly.newPlot("bubble", bubbleData, bubbleLayout);

        let yticks = otu_ids.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse();
        let barData = [
            {
                x: sample_values.slice(0, 10).reverse(),
                y: yticks,
                type: "bar",
                orientation: "h",
                text: otu_labels.slice(0, 10).reverse()
            }
        ];

        let barLayout = {
            title: "Top 10 OTUs",
            xaxis: { title: "Sample Values" },
            yaxis: { title: "OTU IDs", tickvals: yticks, ticktext: yticks },
            bargap: 0.1,  // Gap between bars
            margin: { t: 30, l: 150 }  // Adjust top and left margins 
        };

        Plotly.newPlot("bar", barData, barLayout);
    });
}

function init() {
    // Grab a reference to the dropdown select element
    let selector = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    d3.json(url).then((data) => {
        let sampleNames = data.names;

        for (let i = 0; i < sampleNames.length; i++) {
            selector.append("option")
                .text(sampleNames[i])
                .property("value", sampleNames[i]);
        }

        // Use the first sample from the list to build the initial plots
        let firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });
}

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
}

// Initialize the dashboard
init();