// get all villages
document.getElementById("loading").style.display = "block";
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
    control.addOverlay(villages, 'villages')
    document.getElementById("loading").style.display = "none";
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
    document.getElementById("loading").style.display = "block";
    $.ajax({
        url: "/nearest/" + e.target.feature.properties.osm_id + "/" + e.target.feature.properties.name,
    }).done(function(response) {
        if (nearestPoint) {
            mymap.removeLayer(nearestPoint);
            control.removeLayer(nearestPoint);
            nearestPoint = null;
        }
        if (buffersPolygons) {
            mymap.removeLayer(buffersPolygons);
            control.removeLayer(buffersPolygons);
            buffersPolygons = null;
        }
        if (shops) {
            mymap.removeLayer(shops);
            control.removeLayer(shops);
            shops = null;
            shopNumber = 1;
        }
        if (stops) {
            mymap.removeLayer(stops);
            control.removeLayer(stops);
            stops = null;
            busStopNumber = 1;
        }
        let data = JSON.parse(response);
        //buffers
        var buffers = JSON.parse(data['buffers']);
        if (!(Object.keys(buffers).length === 0) || !(buffers.constructor === Object)) {
            buffersPolygons = L.geoJSON(buffers);
            mymap.addLayer(buffersPolygons);
            control.addOverlay(buffersPolygons,'pokrytie zástavok');
        }

        //shops
        var shopsData = JSON.parse(data['shops']);
        if (!(Object.keys(shopsData).length === 0) || !(shopsData.constructor === Object)) {
            shops = L.geoJSON(shopsData, {
                pointToLayer: function (feature, latlng) {
                    geojsonMarkerOptions.radius = 8;
                    geojsonMarkerOptions.fillColor = legend['shops'];
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: shopsPopup
            });
            mymap.addLayer(shops);
            control.addOverlay(shops,'obchody');
        }

        //stops
        var stopsData = JSON.parse(data['stops']);
        if (!(Object.keys(stopsData).length === 0) || !(stopsData.constructor === Object)) {
            stops = L.geoJSON(stopsData, {
                pointToLayer: function (feature, latlng) {
                    geojsonMarkerOptions.radius = 8;
                    geojsonMarkerOptions.fillColor = legend['bus_stop'];
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: stopsPopup
            });
            mymap.addLayer(stops);
            control.addOverlay(stops,'autobusové zástavky');
        }

        //nearest
        var nearest = JSON.parse(data['nearest']);
        if (!(Object.keys(nearest).length === 0) || !(nearest.constructor === Object)) {
            nearestPoint = L.geoJSON(nearest, {
                pointToLayer: function (feature, latlng) {
                    geojsonMarkerOptions.radius = 8;
                    geojsonMarkerOptions.fillColor = legend['stations'];
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: nearestPopup
            });
            mymap.addLayer(nearestPoint);
            control.addOverlay(nearestPoint,'vlakové stanice');
        }

        document.getElementById("loading").style.display = "none";
        openNav(e, nearestPoint, stops, shops, data['area']);  
    });
}

//filter villages by tags
$('.accept').click(function() {
    var $select = $('select');
    // Run via plugin facade and get instance
    var selectedValues = $select.data('fastselect').optionsCollection.selectedValues;
        document.getElementById("loading").style.display = "block";
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
                if (villages) {
                    mymap.removeLayer(villages);
                    control.removeLayer(villages);
                    villages = null;
                }
                if (!(Object.keys(data).length === 0) || !(data.constructor === Object)) {
                    villages = L.geoJSON(data,{
                        pointToLayer: function (feature, latlng) {
                            geojsonMarkerOptions.radius = (feature.properties.population / 800 ) + 8;
                            geojsonMarkerOptions.fillColor = legend['basic'];
                            return L.circleMarker(latlng, geojsonMarkerOptions).on('click', markerOnClick);
                        },
                        onEachFeature: villagePopup
                    });  
                    mymap.addLayer(villages);
                    control.addOverlay(villages,'villages');
                }
                document.getElementById("loading").style.display = "none";
            },
            error: function( jqXhr, textStatus, errorThrown ){
                alert('Server problem');
                console.log( errorThrown );
                document.getElementById("loading").style.display = "none";
            }
        });
});

//filter villages by tags
$('.potential').click(function() {
    document.getElementById("loading").style.display = "block";
    $.ajax({
        url: "/potential-villages",
    }).done(function(response) {
        if (villages) {
            mymap.removeLayer(villages);
            control.removeLayer(villages);
        }
        villages = null;
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
        control.addOverlay(villages,'villages');
    document.getElementById("loading").style.display = "none";
    });
});

$('.closesidenav').click(function() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("magic").style.visibility = "hidden";
    document.getElementById("magic").style.opacity = "0";


    if (nearestPoint) {
        mymap.removeLayer(nearestPoint);
        control.removeLayer(nearestPoint);
        nearestPoint = null;
    }
    if (buffersPolygons) {
        mymap.removeLayer(buffersPolygons);
        control.removeLayer(buffersPolygons);
        buffersPolygons = null;
    }
    if (shops) {
        mymap.removeLayer(shops);
        control.removeLayer(shops);
        shops = null;
        shopNumber = 1;
    }
    if (stops) {
        mymap.removeLayer(stops);
        control.removeLayer(stops);
        stops = null;
        busStopNumber = 1;
    }
});

$('.filter').click( function() {
    document.getElementById("myFilter").style.width = "350px";
    document.getElementById("filter-content").style.marginLeft = "20px";
    document.getElementById("filter").style.width = "0px";
});

$('.closefilter').click(function() {
    document.getElementById("myFilter").style.width = "0px";
    document.getElementById("filter-content").style.marginLeft = "-500px";
    document.getElementById("filter").style.width = "48px";
});
