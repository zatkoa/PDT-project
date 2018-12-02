var nearestPoint;
var stops;
var shops;
var buffersPolygons;
var village;
var bustStopNumber = 1;
var shopNumber = 1;
var street = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiemF0a28xNSIsImEiOiJjam95dXp3engybjhxM3Frd2RsNG1idnNzIn0.XeAu3rJjqQXAUG688RJX_w', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 17,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
});
var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiemF0a28xNSIsImEiOiJjam95dXp3engybjhxM3Frd2RsNG1idnNzIn0.XeAu3rJjqQXAUG688RJX_w', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 17,
    id: 'mapbox.satellite',
    accessToken: 'your.mapbox.access.token'
});

var custom = L.tileLayer('https://api.tiles.mapbox.com/styles/v1/zatko15/cjp4o0zv418q42sqj1vvn5awz.html?fresh=true&title=true&access_token=pk.eyJ1IjoiemF0a28xNSIsImEiOiJjam95dXp3engybjhxM3Frd2RsNG1idnNzIn0.XeAu3rJjqQXAUG688RJX_w', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 17,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
});

var mymap = L.map('mapid', {
    layers: [street]
}).setView([49.0959297, 19.7823528], 13);


var baseMaps = {
    "Street": street,
    "Satellite": satellite,
    'Custom' : custom,
};

var control = L.control.layers(baseMaps, null,{position: 'topleft', collapse:false}).addTo(mymap);