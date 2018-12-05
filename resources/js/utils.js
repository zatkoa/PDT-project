
var legend = {
    'basic': 'orange',
    'bus_stop' : 'red',
    'stations' : 'green',
    'shops' : 'purple',
};

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.5,
    riseOnHover: true,
};

function villagePopup(feature, layer) {
    if (feature.properties && feature.properties.name) {
        var str = '<h5>Dedina</h5>';
        str += '<dl>';
        str += '<dt>Názov</dt>';
        str += '<dd>' + feature.properties.name + '</dd>';
        if (feature.properties.ele) {
            str += '<dt>Prevýšenie</dt>';
            str += '<dd>' + feature.properties.ele + ' m.n.m</dd>';
        }

        if (feature.properties.population) {
            str += '<dt>Počet obyvateľov</dt>';
            str += '<dd>' + feature.properties.population + ' obyvateľov</dd>';
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
        str += '<h5>Vlaková stanica</h5>';
        str += '<dl>';
        str += '<dt>Názov</dt>';
        str += '<dd>' + feature.properties.name + '</dd>';
        str += '<dt>Vzdialenosť</dt>';
        str += '<dd>' +  formatDistance(feature.properties.distance) + ' km</dd>';
        str += '</dl>';
        layer.bindPopup(str,  {closeButton: false, offset: L.point(0, -20)});
        layer.on('mouseover', function() { layer.openPopup(); });
        layer.on('mouseout', function() { layer.closePopup(); });
    }
}

function shopsPopup(feature, layer) {
    if (feature.properties) {
        let str = '';
        str += '<h5>Obchod</h5>';
        str += '<dl>';
        if (feature.properties.name) {
            str += '<dt>Názov</dt>';
            str += '<dd>' + feature.properties.name + '</dd>';
        } else {
            str += '<span>Nepomenovaný obchod č. ' + shopNumber +'</span>';
            feature.properties.name = 'Nepomenovaný obchod č. ' + shopNumber; 
            shopNumber++;
        }
        if (feature.properties.operator) {
            str += '<dt>Operátor</dt>';
            str += '<dd>' +  feature.properties.operator + '</dd>';
        }
        str += '</dl>';
        layer.bindPopup(str,  {closeButton: false, offset: L.point(0, -20)});
        layer.on('mouseover', function() { layer.openPopup(); });
        layer.on('mouseout', function() { layer.closePopup(); });
    }
}

function stopsPopup(feature, layer) {
    if (feature.properties) {
        var str = '';
        str += '<h5>Autobusová zástavka</h5>';
        if (feature.properties.name)
            str += '<span>' + feature.properties.name + '</span>';
        else {
            str += '<span>Nepomenovaná zástavka č. ' + busStopNumber +'</span>';
            feature.properties.name = 'Nepomenovaná zástavka č. ' + busStopNumber; 
            busStopNumber++;
        }
        layer.bindPopup(str,  {closeButton: false, offset: L.point(0, -20)});
        layer.on('mouseover', function() { layer.openPopup(); });
        layer.on('mouseout', function() { layer.closePopup(); });
    }
}

/* Set the width of the side navigation to 250px */
function openNav(e, nearest, stops, shops, area) {
    let html = '<h2>' + e.target.feature.properties.name + '</h2>';
    if (e.target.feature.properties.population) {
        html += '<h5>Populácia</h5>';
        html += '<span>' + e.target.feature.properties.population + ' obyvateľov</span>';
    }
    if (e.target.feature.properties.ele) {
        html += '<h5>Prevýšenie</h5>';
        html += '<span>' + e.target.feature.properties.ele + ' m.n.m.</span>';
    }
    if (area) {
        html += '<h5>Rozloha</h5>';
        html += '<span>' + (Math.round(Number(area)/1000000 * 100)/100).toString() + ' km2</span>';
    }
    let busStops = [];
    let shopsKeys = [];
    let trainStation = null;
    busStopExists = false;
    shopsExists = false;
    html += '<h5>Autobusové zástavky</h5><ul class="stops">';
    if (stops) {
        stops = stops._layers;
        for(var key in stops) {
            busStopExists = true;
            busStops[key] = stops[key].feature;
            if (stops[key].feature.properties.name)
            html += '<li data='+ key +'>' + stops[key].feature.properties.name + '</li>';
        }
    }
    html += '</ul>';
    if (busStopExists == false)
        html += '<span>V dedine sa nenachádzajú žiadne autobusové zástavky</span>';
    html += '<h5>Obchody</h5><ul class="shops">';  
    if (shops) {
        shops = shops._layers;
        for(var key in shops) {
            shopsExists = true;
            shopsKeys[key] = shops[key].feature;
            if (shops[key].feature.properties.name)
                html += '<li data='+ key +'>' + shops[key].feature.properties.name + '</li>';
        }
    }
        html += '</ul>';
    if (shopsExists == false)
        html += '<span>V dedine sa nenachádzajú žiadne obchody</span>';
    html += '<h5 class="focus">Najbližšia vlaková stanica</h5><dl>';
    if (nearest) {
        nearest = nearest._layers;
        for(var key in nearest) {
            trainStation = nearest[key].feature;
            html += '<dt>Názov</dt>';
            html += '<dd>' + nearest[key].feature.properties.name + '</dd>'; 
            html += '<dt>Vzdialenosť</dt>';
            html += '<dd>' + formatDistance(nearest[key].feature.properties.distance) + ' km</dd>';                   
        }
    }
    html += '</dl>';
    document.getElementById("sidenav-content").innerHTML = html;
    document.getElementById("mySidenav").style.width = "350px";
    document.getElementById("magic").style.visibility = "visible";
    document.getElementById("magic").style.opacity = "1";
    $('#sidenav-content ul.stops li').click(function() {
        var key = $(this).attr('data');
        var stop = busStops[key];
        mymap.setView({lat: stop.geometry.coordinates[1], lng: stop.geometry.coordinates[0]});
    });
    $('#sidenav-content ul.shops li').click(function() {
        var key = $(this).attr('data');
        var shop = shopsKeys[key];
        mymap.setView({lat: shop.geometry.coordinates[1], lng: shop.geometry.coordinates[0]});
    });
    $('.focus').click(function() {
        mymap.setView({lat: trainStation.geometry.coordinates[1], lng: trainStation.geometry.coordinates[0]});
    });
}

function formatDistance(string) {
    return (Math.round((Number(string) / 1000)*100)/100).toString();
}