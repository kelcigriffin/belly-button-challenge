// app.js

// // Fetch data from the URL
const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

function buildMetadata(sample, metadata) {
    d3.json(url).then((data) => {
        let metadata = data.metadata;
        let result = metadata.find(metadataObj => metadataObj.id == sample);
        // console.log("Metadata for sample", sample, ":", result);
        // Use d3 to select the panel with id of `#sample-metadata`
        let PANEL = d3.select("#sample-metadata");

        // Use `.html("") to clear any existing metadata
        PANEL.html("");

        // Inside the loop, use d3 to append new
        // tags for each key-value in the metadata.
        Object.entries(result).forEach(([key, value]) => {
            // console.log(`${key}: ${value}`);
            PANEL.append("h6").text(`${key}: ${value}`);
        });
    });
}

function buildCharts(sample, metadata) {
    d3.json(url).then((data) => {
        let samples = data.samples;
        let resultArray = samples.filter(sampleObj => sampleObj.id == sample);
        let result = resultArray[0];
        // console.log("Result for sample", sample, ":", result);

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

        // BONUS //
// I did my best here to make it like the example, but I wasn't able to figure out how to get 
// the number ranges or the gauge indicator to show... so I just used the bar like they did in the 
// Plotly documentation, and played with hex codes for different colors.
// Build the Gauge Chart
let gaugeData = [
    {
        type: "indicator",
        mode: "gauge+number",
        value: metadata.find(metaObj => metaObj.id == sample).wfreq,
        title: { text: "Weekly Washing Frequency" },
        gauge: {
            axis: { range: [0, 9] },
            steps: [
                { range: [0, 1], color: "#FFD1D1" },
                { range: [1, 2], color: "lightgray" },
                { range: [2, 3], color: "#C1EAC0" },
                { range: [3, 4], color: "#A3E4A9" },
                { range: [4, 5], color: "#85DE92" },
                { range: [5, 6], color: "#67D87A" },
                { range: [6, 7], color: "#49D264" },
                { range: [7, 8], color: "#2BCD4D" },
                { range: [8, 9], color: "#0DC737" },
            ],
            bar: { color: "#E6E6FA97" }
        }
    }
];

let gaugeLayout = { width: 600, height: 500, margin: { t: 0, b: 0 } };

// Log data for debugging
// console.log("Sample ID:", sample);
// console.log("Washing Frequency:", metadata.find(metaObj => metaObj.id == sample).wfreq);

// Log gauge data
// console.log("Gauge Data:", gaugeData);
// console.log("Gauge Layout:", gaugeLayout);

Plotly.newPlot("gauge", gaugeData, gaugeLayout);
});
}

// END BONUS //

function init() {
    // Grab a reference to the dropdown select element
    let selector = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    d3.json(url).then((data) => {
        let sampleNames = data.names;
        let metadata = data.metadata; // Fetch metadata once
        // console.log("Sample Names:", sampleNames);
        // console.log("Metadata:", metadata);
        for (let i = 0; i < sampleNames.length; i++) {
            selector.append("option")
                .text(sampleNames[i])
                .property("value", sampleNames[i]);
        }

        // Use the first sample from the list to build the initial plots
        let firstSample = sampleNames[0];
        buildCharts(firstSample, metadata);
        buildMetadata(firstSample, metadata);
    });
}

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    d3.json(url).then((data) => {
        let metadata = data.metadata; // Fetch metadata again
        buildCharts(newSample, metadata); // Pass metadata to buildCharts
        buildMetadata(newSample, metadata); // Pass metadata to buildMetadata
    });
}



// Initialize the dashboard
init();