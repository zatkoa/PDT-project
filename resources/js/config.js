
var mymap = L.map('mapid').setView([49.0959297, 19.7823528], 13);
var nearestPoint;
var village;
var bustStopNumber = 1;
var base = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiemF0a28xNSIsImEiOiJjam95dXp3engybjhxM3Frd2RsNG1idnNzIn0.XeAu3rJjqQXAUG688RJX_w', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

var legend = {
    'basic': 'orange',
    'bus_stop' : 'red',
    'stations' : 'green',
};

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.5
};

function villagePopup(feature, layer) {
    if (feature.properties && feature.properties.name) {
        var str = '<h5>Dedina</h5>';
        str += '<dl>';
        str += '<dt>Názov</dt>';
        str += '<dd>' + feature.properties.name + '</dd>';
        if (feature.properties.ele) {
            str += '<dt>Prevýšenie</dt>';
            str += '<dd>' + feature.properties.ele + '</dd>';
        }

        if (feature.properties.population) {
            str += '<dt>Počet obyvateľov</dt>';
            str += '<dd>' + feature.properties.population + '</dd>';
        }
        str += '</dl>';
        layer.bindPopup(str,  {closeButton: false, offset: L.point(0, -20)});
        layer.on('mouseover', function() { layer.openPopup(); });
        layer.on('mouseout', function() { layer.closePopup(); });
    }
}

function nearestPopup(feature, layer) {

    if (feature.properties) {
        let str = '';
        if (feature.properties.type === 'bus_stop') {
            str += '<h5>Autobusová zástavka</h5>';
            if (feature.properties.name)
                str += '<span>' + feature.properties.name + '</span>';
            else {
                str += '<span>Nepomenovaná zástavka č. ' + bustStopNumber +'</span>';
                feature.properties.name = 'Nepomenovaná zástavka č. ' + bustStopNumber; 
                bustStopNumber++;
            }
        } else if (feature.properties.railway === 'station') {
            str += '<h5>Vlaková stanica</h5>';
            str += '<dl>';
            str += '<dt>Názov</dt>';
            str += '<dd>' + feature.properties.name + '</dd>';
            str += '<dt>Vzdialenosť</dt>';
            str += '<dd>' + feature.properties.distance + '</dd>';
            str += '</dl>';
        }
        // } else {
        //     return;
        // }
        layer.bindPopup(str,  {closeButton: false, offset: L.point(0, -20)});
        layer.on('mouseover', function() { layer.openPopup(); });
        layer.on('mouseout', function() { layer.closePopup(); });
    }
}

// get all villages
$.ajax({
    url: "/villages",
}).done(function(response) {
    var jsonReponse = JSON.parse(response);
    villages = L.geoJSON(jsonReponse,{
        pointToLayer: function (feature, latlng) {
            geojsonMarkerOptions.radius = (feature.properties.population / 800 ) + 8;
            geojsonMarkerOptions.fillColor = legend['basic'];
            return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick);
        },
        onEachFeature: villagePopup
    });
    mymap.addLayer(villages);
});

//get all amenities
var amenities;
$.ajax({
    url: "/amenities",
    // context: document.body
}).done(function(response) {
    amenities = response;
    var tagSelect = document.getElementById('tagSelect');
    for(var i=0; i< amenities.length; i++) {
        var amenity = amenities[i]['amenity'];
        if (translates[amenity])
            tagSelect.options[tagSelect.options.length] = new Option(translates[amenity],amenity);
    }
});

//get nearest villages on click
function markerOnClick(e)
{
    $.ajax({
        url: "/nearest/" + e.target.feature.properties.osm_id + "/" + e.target.feature.properties.name,
    }).done(function(response) {
        if (nearestPoint) {
            mymap.removeLayer(nearestPoint);
            nearestPoint = null;
            bustStopNumber = 1;
        }
        var nearest = JSON.parse(response);
        nearestPoint = L.geoJSON(JSON.parse(nearest), {
            pointToLayer: function (feature, latlng) {
                if (feature.properties.type === 'bus_stop')
                    geojsonMarkerOptions.fillColor = legend['bus_stop'];
                if (feature.properties.railway === 'station')
                    geojsonMarkerOptions.fillColor = legend['stations'];
                return L.circleMarker(latlng, geojsonMarkerOptions);
            },
            onEachFeature: nearestPopup
        }).addTo(mymap);
        openNav(e, nearestPoint._layers);  
    });
}

//filter villages by tags
$('.accept').click(function() {
    var $select = $('select');
    // Run via plugin facade and get instance
    var selectedValues = $select.data('fastselect').optionsCollection.selectedValues;
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
    });
    $.ajax({
        type: "POST",
        url: '/villages',
        data: JSON.stringify(selectedValues),
        contentType: 'application/json',
        dataType: 'json',
        success: function( data, textStatus, jQxhr ){
            mymap.removeLayer(villages);
            villages = null;
            villages = L.geoJSON(data,{
                pointToLayer: function (feature, latlng) {
                    geojsonMarkerOptions.radius = (feature.properties.population / 800 ) + 8;
                    return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick);
                },
                onEachFeature: villagePopup
            });  
            mymap.addLayer(villages);
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log( errorThrown );
        }
    });
});

//filter villages by tags
$('.potential').click(function() {
    $.ajax({
        url: "/potential-villages",
    }).done(function(response) {
        mymap.removeLayer(villages);
        villages = null;
        var jsonReponse = JSON.parse(response);
        villages = L.geoJSON(jsonReponse,{
            pointToLayer: function (feature, latlng) {
                geojsonMarkerOptions.radius = (feature.properties.population / 800 ) + 8;
                return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick);
            },
            onEachFeature: villagePopup
        });
        mymap.addLayer(villages);
    });
});

/* Set the width of the side navigation to 250px */
function openNav(e, nearest) {
    let html = '<h2>' + e.target.feature.properties.name + '</h2>';
    if (e.target.feature.properties.population) {
        html += '<h5>Populácia</h5>';
        html += '<span>' + e.target.feature.properties.population + ' obyvateľov</span>';
    }
    if (e.target.feature.properties.ele) {
        html += '<h5>Prevýšenie</h5>';
        html += '<span>' + e.target.feature.properties.ele + ' m.n.m.</span>';
    }
    let busStops = [];
    let trainStation = null;
    let htmlBusStops = '<ul>';
    let htmlStation = '<dl>';
    busStopExists = false;
    for(var key in nearest) {
        if (nearest[key].feature.properties.type === 'bus_stop') {
            busStopExists = true;
            busStops[key] = nearest[key].feature;
            if (nearest[key].feature.properties.name)
                htmlBusStops += '<li data='+ key +'>' + nearest[key].feature.properties.name + '</li>';
        } else
            if (nearest[key].feature.properties.railway === 'station') {
                trainStation = nearest[key].feature;
                htmlStation += '<dt>Názov</dt>';
                htmlStation += '<dd>' + nearest[key].feature.properties.name + '</dd>'; 
                htmlStation += '<dt>Vzdialenosť</dt>';
                htmlStation += '<dd>' + nearest[key].feature.properties.distance + '</dd>';                   
            }
    }
    htmlBusStops += '</ul>';
    htmlStation+= '</dl>';
    if (busStopExists == false)
        htmlBusStops += '<span>V dedine sa nenachádzajú žiadne autobusové zástavky</span>';
    html +='<h5>Autobusové zástavky</h5>' + htmlBusStops;
    html +='<h5 class="focus">Najbližšia vlaková stanica</h5>' + htmlStation;

    document.getElementById("sidenav-content").innerHTML = html;
    document.getElementById("mySidenav").style.width = "350px";
    $('#sidenav-content li').click(function() {
        var key = $(this).attr('data');
        var stop = busStops[key];
        mymap.setView({lat: busStops[key].geometry.coordinates[1], lng: busStops[key].geometry.coordinates[0]});
    });
    $('.focus').click(function() {
        mymap.setView({lat: trainStation.geometry.coordinates[1], lng: trainStation.geometry.coordinates[0]});
    });
}

$('.closebtn').click(function() {
    document.getElementById("mySidenav").style.width = "0";
    if (nearestPoint) {
        mymap.removeLayer(nearestPoint);
        nearestPoint = null;
        bustStopNumber = 1;
    }
});

// function clickZoom(e) {
//     mymap.setView(e.target.getLatLng(),5);
// }

// $(document).ready(function() {

    // L.mapbox.accessToken = 'pk.eyJ1IjoiemF0a28xNSIsImEiOiJjam95dXp3engybjhxM3Frd2RsNG1idnNzIn0.XeAu3rJjqQXAUG688RJX_w';
    // var map = L.mapbox.map('map', 'cimox.f6cc44ed');//.setView([48.714569,19.0302847], 12);
    // var myLayer = L.mapbox.featureLayer().addTo(map);
    // // var info = document.getElementById('info');
    // // var currentPos;

    // //add default user location
    // // Creates a single, draggable marker
    // currentPos = L.marker(new L.LatLng(48.685216, 18.630821), {
    //     icon: L.mapbox.marker.icon({
    //         'marker-color': '#ff8888',
    //         'marker-symbol': 'circle-stroked'
    //     }),
    //     draggable: true
    // }).bindPopup('Current position!\nDrag me around!').addTo(map);

    // //locate user using HTML5 geolocation API
    // if (!navigator.geolocation) {
    //     alert('Geolocation is not available');
    // } else {
    //         map.locate();
    // }

    // // Add marker to user location
    // map.on('locationfound', function(e) {
    //     map.removeLayer(currentPos);
    //     //map.setView([e.latlng.lat, e.latlng.lng],12);
    //     map.setView([48.7096701,19.025564], 12);

    //     // Creates a single, draggable marker
    //     //currentPos = L.marker(new L.LatLng(e.latlng.lat, e.latlng.lng), {
    //     currentPos = L.marker(new L.LatLng(48.7096701,19.025564), {
    //         icon: L.mapbox.marker.icon({
    //             'marker-color': '#ff8888',
    //             'marker-symbol': 'circle-stroked'
    //         }),
    //         draggable: true
    //     }).bindPopup('Current position!\nDrag me around!').addTo(map);
    // });
// });