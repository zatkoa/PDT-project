var nearestPoint;
var stops;
var shops;
var buffersPolygons;
var village;
var busStopNumber = 1;
var shopNumber = 1;
L.mapbox.accessToken = 'pk.eyJ1IjoiemF0a28xNSIsImEiOiJjam95dXp3engybjhxM3Frd2RsNG1idnNzIn0.XeAu3rJjqQXAUG688RJX_w';
var mymap = L.mapbox.map('mapid').setView([49.0959297, 19.7823528], 13);
var street = L.mapbox.tileLayer('mapbox.streets');
var satellite = L.mapbox.tileLayer('mapbox.satellite');
var custom = L.mapbox.styleLayer('mapbox://styles/zatko15/cjp6xcjp12p1b2sl8a88lfazz').addTo(mymap);
var baseMaps = {
    "Street": street,
    "Satellite": satellite,
    "Custom" : custom
};

var control = L.control.layers(baseMaps, null,{position: 'topleft'}).addTo(mymap);