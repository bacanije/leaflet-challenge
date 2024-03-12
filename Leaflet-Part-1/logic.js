var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// GET request to the query URL/
d3.json(queryURL).then(function(data) {
    console.log(data);
    // once we get a response, send data.features object to createFeature function
    createFeatures(data.features);
});

// Determine marker size
function getMarkerSize(magnitude) {
    return magnitude * 20000;
}

function createFeatures(earthquakeData) {
    // Give each feature a popup describing place and time of earthquakes
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // Create GeoJson layer containing features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array.
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        // Point layer used to alter markers
        pointToLayer: function(feature, latlng) {
            // Determine the style of markers based on properties
            var options = {
                radius: feature.properties.mag * 20000,
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: "black",
                weight: 0.5
            };
            return L.circleMarker(latlng, options);
        }
    });

    // Send our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    var street = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        style: 'mapbox/satellite-v9',
        access_token: api_key
    });

    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Add the layer control to the map
    L.control.layers(null, { Earthquakes: earthquakes }).addTo(myMap);

var legend = L.control ({position: "bottomright"});

legend.onAdd = function(map) {
        var div = L.DomUtil.create ("div", "info legend"),
            grades = [1.0, 2.5, 4.0, 5.5, 8.0],
            labels = [];
            for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            return div;
        };

        legend.addTo(myMap);
    }
