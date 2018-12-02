<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VillageController extends Controller
{
    public function index() {
        return view('website.index');
    }

    public function getAllAmenities() {
        $query =  "SELECT distinct(amenity) from planet_osm_point 
        WHERE amenity is not null 
        UNION SELECT distinct(amenity) 
        FROM planet_osm_polygon WHERE amenity is not null";
        $amenities = DB::select(DB::raw($query));
        return $amenities;
    }

    public function getNearestPoint($id, $name) {
        // query pre najblizsiu stanicu a zastavky v dedine
        $trainStation =  "SELECT array_to_json(array_agg(f)) As features
            FROM ((SELECT 'Feature' As type
            ,ST_AsGeoJSON(p.geom)::json As geometry
            ,row_to_json((SELECT l FROM (SELECT p.name,p.railway,ST_DISTANCE(p.geom::geography, k.geom::geography, true) as distance) As l)) As properties
            FROM planet_osm_point p, planet_osm_point k WHERE p.railway='station' and k.osm_id=" . $id ."
            ORDER BY ST_DISTANCE(p.geom::geography, k.geom::geography,true) LIMIT 1)
            ) As f";
        
        $busStops =  "SELECT array_to_json(array_agg(f)) As features
            FROM (
            SELECT 'Feature' As type
            ,ST_AsGeoJSON(point.geom)::json As geometry,
            row_to_json((SELECT l FROM (SELECT point.name, 'bus_stop' as type) As l)) As properties
            FROM planet_osm_point point WHERE  point.highway='bus_stop'
            and st_contains((SELECT k.geom from planet_osm_polygon as k CROSS JOIN planet_osm_point as p WHERE p.name=k.name and p.osm_id=" .$id . "
            and k.boundary='administrative' and st_contains(k.geom, p.geom) limit 1) , point.geom)
            ) As f";

        // pokrytie zastavok v dedine
        $buffersQuery =  "SELECT array_to_json(array_agg(f)) As features
            FROM (
            SELECT 'Feature' As type
            ,ST_AsGeoJSON(ST_UNION(ST_BUFFER(point.geom::geography,300)::geometry))::json As geometry,
			row_to_json((SELECT l FROM (SELECT '') As l)) As properties
            FROM planet_osm_point point WHERE  point.highway='bus_stop'
            and st_contains((SELECT k.geom from planet_osm_polygon as k CROSS JOIN planet_osm_point as p WHERE p.name=k.name and p.osm_id=" .$id . "
            and k.boundary='administrative' and st_contains(k.geom, p.geom) limit 1) , point.geom)
            ) As f";

        $shopsQuery =  "SELECT array_to_json(array_agg(f)) As features
            FROM (
            SELECT 'Feature' As type
            ,ST_AsGeoJSON(point.geom)::json As geometry,
            row_to_json((SELECT l FROM (SELECT point.name,point.shop, point.operator, point.amenity) As l)) As properties
            FROM planet_osm_point point WHERE  point.shop is not null
            and st_contains((SELECT k.geom from planet_osm_polygon as k CROSS JOIN planet_osm_point as p WHERE p.name=k.name and p.osm_id=" .$id . "
            and k.boundary='administrative' and st_contains(k.geom, p.geom) limit 1) , point.geom)
            ) As f";

        $areaQuery = "SELECT ST_AREA(geom::geography) as area FROM planet_osm_polygon
            WHERE name='" . $name . "' and boundary='administrative' LIMIT 1";
        $area = DB::select(DB::raw($areaQuery));
        $shops = DB::select(DB::raw($shopsQuery));
        $buffers = DB::select(DB::raw($buffersQuery));
        $nearestStation = DB::select(DB::raw($trainStation));
        $stops = DB::select(DB::raw($busStops));

        if ($shops[0]->features == null)
            $shops[0]->features = '{}';
        if ($buffers[0]->features == null)
            $buffers[0]->features = '{}';
        if ($nearestStation[0]->features == null)
            $nearestStation[0]->features = '{}';
        if ($stops[0]->features == null)
            $stops[0]->features = '{}';
        if (count($area) == 0)
            $area = 0;
        else
            $area = $area[0]->area;
        return json_encode(['nearest' => $nearestStation[0]->features, 'stops' => $stops[0]->features,'buffers' => $buffers[0]->features, 'area' => $area, 'shops' => $shops[0]->features]);
    }

    public function getAllVillages() {
        $query =  "SELECT array_to_json(array_agg(f)) As features
        FROM (SELECT 'Feature' As type
            ,ST_AsGeoJSON(geom)::json As geometry
            ,row_to_json((SELECT l FROM (SELECT name,population,ele,osm_id) As l)) As properties
        FROM planet_osm_point WHERE place='village' ) As f";
     
        $villages = DB::select(DB::raw($query));
        return $villages[0]->features;
    }


    // (SELECT ST_COLLECT(q.geom) as collect FROM planet_osm_point as q WHERE q.amenity='post_office') as post_office,
	// 			  (SELECT ST_COLLECT(q.geom) as collect FROM planet_osm_point as q WHERE q.amenity='parking') as parking,
	// 			  (SELECT ST_COLLECT(q.geom) as collect FROM planet_osm_point as q WHERE q.amenity='place_of_worship') as place_of_worship
    // SELECT p.name,k.name,p.geom FROM planet_osm_point p
    // CROSS JOIN (SELECT poly.name,poly.geom FROM
    //     (SELECT c.name,c.geom,ROW_NUMBER() OVER(PARTITION BY c.name) rn
    //         FROM planet_osm_polygon c
    //         WHERE c.boundary='administrative')
    //         as poly WHERE poly.rn=1) as k

    //         WHERE p.name=k.name and p.place='village' and p.name is not null)
    public function filterVillages(Request $request) {
        $data = array_keys($request->all());
        if (count($data) == 0)
            return $this->getAllVillages();

        // $query =  "SELECT array_to_json(array_agg(f)) As features
        // FROM (SELECT 'Feature' As type
        //     ,ST_AsGeoJSON(ST_AsText(ST_Transform(k.way,4326)))::json As geometry
        //     FROM planet_osm_polygon as k, planet_osm_point as s WHERE (s.amenity='" . $data[0] . "') and k.boundary='administrative' and ST_CONTAINS(k.way, s.way)) As f";
        // "SELECT k.name, k.osm_id
        // ,distinct(ST_AsGeoJSON(ST_AsText(ST_Transform(p.way,4326)))) As geometry
        // FROM planet_osm_polygon as k
        // CROSS JOIN planet_osm_point p WHERE p.place='village' and p.name=k.name
        // and k.boundary='administrative' and ST_INTERSECTS(k.way, (SELECT ST_COLLECT(q.way) FROM planet_osm_point as q WHERE q.amenity='ice_cream')) and 
        //                                                           ST_INTERSECTS(k.way, (SELECT ST_COLLECT(q.way) FROM planet_osm_point as q WHERE q.amenity='parking'))"
        $tagArrayString = '';
        $intersects = '';
        $collects = '';

        $i = 0;
        foreach($data as $tag) {
            // $tagArrayString = $tagArrayString . 'ST_INTERSECTS(k.geom, (SELECT ST_COLLECT(q.geom) FROM planet_osm_point as q WHERE q.amenity=\'' . $tag . '\'))';
            $intersects = $intersects . ' ST_INTERSECTS(polygons.kgeom,' . $tag . '.collect) ';
            $collects = $collects . ' (SELECT ST_COLLECT(q.geom) as collect FROM planet_osm_point as q WHERE q.amenity=\'' . $tag . '\') as ' . $tag;
            $i++;
            if ($i != count($data)) {
                // $tagArrayString = $tagArrayString . ' AND ';
                $intersects = $intersects . ' AND ';
                $collects = $collects  . ', ';
            }
        }
        // $query =  "SELECT array_to_json(array_agg(f)) As features
        //     FROM (SELECT DISTINCT ST_AsGeoJSON(p.geom)::jsonb As geometry, 'Feature' As type
        //     ,row_to_json((SELECT l FROM (SELECT p.name,p.population,p.ele,p.osm_id) As l))::jsonb As properties
        //     FROM planet_osm_polygon as k
        //     CROSS JOIN planet_osm_point p WHERE p.place='village' and p.name=k.name
        //     and " . $tagArrayString . " and k.boundary='administrative') As f";

        $query = "SELECT array_to_json(array_agg(f)) As features
        FROM (SELECT  ST_AsGeoJSON(polygons.pgeom)::jsonb as geometry, 'Feature' as type
            ,row_to_json((SELECT l FROM (SELECT polygons.pname as name ,polygons.population,polygons.ele,polygons.posm_id as osm_id) As l))::jsonb As properties
                FROM (SELECT p.name as pname,p.population,p.ele,p.osm_id as posm_id,k.name as kname,k.geom as kgeom, p.geom as pgeom FROM planet_osm_point p
                    CROSS JOIN (SELECT poly.name,poly.geom FROM
                                    (SELECT c.name,c.geom,ROW_NUMBER() OVER(PARTITION BY c.name) rn
                                        FROM planet_osm_polygon c
                                        WHERE c.boundary='administrative') as poly
                                    WHERE poly.rn=1) as k
                       WHERE p.name=k.name and p.place='village' and p.name is not null) as polygons,
            " . $collects . " 
            WHERE " . $intersects . ") As f ";
        $objects = DB::select(DB::raw($query));
        if ($objects[0]->features == null)
            return '{}';
        else
            return $objects[0]->features;
    }
    // ziskanie potencialnych obci - vyber obci a miest ktore maju rozlohu nad 100 km2 (top 8 miest) a najdenie obci v okruhu 7 kilometrov.
    public function getPotentialVillages() {
        $query = "SELECT array_to_json(array_agg(f)) As features
        FROM (
            SELECT  'Feature' as type, ST_AsGeoJson(points.geom)::json as geometry,
                row_to_json((SELECT l FROM (SELECT points.name,points.population,points.ele,points.osm_id) As l))::jsonb As properties
                FROM 
                    (SELECT towns.geom
                        FROM 
                            (SELECT p.geom,ST_AREA(k.geom::geography, true) as a,
                                ROW_NUMBER() OVER(PARTITION BY k.name ORDER BY ST_AREA(k.geom) DESC) rn
                                FROM planet_osm_polygon k
                                CROSS JOIN planet_osm_point p
                                WHERE p.name=k.name and k.boundary='administrative' and ST_AREA(k.geom::geography, true)>100000000  and (p.place='town' or p.place='village')
                                ORDER BY a desc) as towns 
                        WHERE rn=1 LIMIT 8) as top_towns, planet_osm_point points
                WHERE points.place='village' and ST_DWITHIN(top_towns.geom::geography, points.geom::geography, 7000)
            ) As f";
        $objects = DB::select(DB::raw($query));
        return $objects[0]->features;
    }
}



