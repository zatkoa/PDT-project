<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VillageController extends Controller
{
    public function index() {
        // $nearByQuery = "SELECT id,name,
        //             ST_Distance(ST_GeographyFromText('SRID=4326;POINT($srid_point[1] $srid_point[0])'), location) as distance
        //             FROM places
        //             WHERE ST_DWithin(ST_GeographyFromText('SRID=4326;POINT($srid_point[1] $srid_point[0])'), location, 10000)";
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
        $query =  "SELECT array_to_json(array_agg(f)) As features
            FROM ((SELECT 'Feature' As type
            ,ST_AsGeoJSON(p.geom)::json As geometry
            ,row_to_json((SELECT l FROM (SELECT p.name,p.railway,ST_DISTANCE(p.geom, k.geom) as distance) As l)) As properties
            FROM planet_osm_point p, planet_osm_point k WHERE p.railway='station' and k.osm_id=" . $id ."
            ORDER BY ST_DISTANCE(p.geom, k.geom) LIMIT 1)
            UNION ALL
            SELECT 'Feature' As type
            ,ST_AsGeoJSON(point.geom)::json As geometry,
            row_to_json((SELECT l FROM (SELECT point.name, 'bus_stop' as type) As l)) As properties
            FROM planet_osm_point point WHERE  point.highway='bus_stop'
            and st_contains((SELECT geom from planet_osm_polygon WHERE boundary='administrative' and name='" . $name . "' limit 1) , point.geom)
            UNION ALL
            SELECT 'Feature' As type
            ,ST_AsGeoJSON(ST_UNION(ST_BUFFER(point.geom,0.003)))::json As geometry,
			row_to_json((SELECT l FROM (SELECT '') As l)) As properties
            FROM planet_osm_point point WHERE  point.highway='bus_stop'
            and st_contains((SELECT geom from planet_osm_polygon WHERE boundary='administrative' and name='" . $name . "' limit 1) , point.geom)
            ) As f";

        $nearestPoint = DB::select(DB::raw($query));
        return json_encode($nearestPoint[0]->features);
    }

    public function getAllVillages() {
        // SELECT * from planet_osm_polygon WHERE boundary='administrative'
        $query =  "SELECT array_to_json(array_agg(f)) As features
        FROM (SELECT 'Feature' As type
            ,ST_AsGeoJSON(geom)::json As geometry
            ,row_to_json((SELECT l FROM (SELECT name,population,ele,osm_id) As l)) As properties
        FROM planet_osm_point WHERE place='village' ) As f";
     
        // $nearByQuery = "SELECT  json_build_object( 
        //     'type',       'Feature',
        //     'geometry',   ST_AsGeoJSON(ST_AsText(ST_Transform(way,4326)))
        //  ) FROM planet_osm_point WHERE place='village'";
        $villages = DB::select(DB::raw($query));
        // $arr = [];
        // foreach($places as $place) {
        //     $arr->push($place->json_build_object);
        // }
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
        $i = 0;
        foreach($data as $tag) {
            $tagArrayString = $tagArrayString . 'ST_INTERSECTS(k.geom, (SELECT ST_COLLECT(q.geom) FROM planet_osm_point as q WHERE q.amenity=\'' . $tag . '\'))';
            $i++;
            if ($i != count($data))
                $tagArrayString = $tagArrayString . ' AND ';
        }
        $query =  "SELECT array_to_json(array_agg(f)) As features
            FROM (SELECT DISTINCT ST_AsGeoJSON(p.geom)::jsonb As geometry, 'Feature' As type
            ,row_to_json((SELECT l FROM (SELECT p.name,p.population,p.ele,p.osm_id) As l))::jsonb As properties
            FROM planet_osm_polygon as k
            CROSS JOIN planet_osm_point p WHERE p.place='village' and p.name=k.name
            and " . $tagArrayString . " and k.boundary='administrative') As f";

    //     $query = "   SELECT polygons.geom FROM (SELECT p.name,k.name,k.geom FROM planet_osm_point p
    //     CROSS JOIN (SELECT poly.name,poly.geom FROM
    //         (SELECT c.name,c.geom,ROW_NUMBER() OVER(PARTITION BY c.name) rn
    //             FROM planet_osm_polygon c
    //             WHERE c.boundary='administrative')
    //             as poly WHERE poly.rn=1) as k
    //                    WHERE p.name=k.name and p.place='village' and p.name is not null) as polygons,
    //         (SELECT ST_COLLECT(q.geom) as collect FROM planet_osm_point as q WHERE q.amenity='post_office') as post_office,
    //   (SELECT ST_COLLECT(q.geom) as collect FROM planet_osm_point as q WHERE q.amenity='parking') as parking,
    //   (SELECT ST_COLLECT(q.geom) as collect FROM planet_osm_point as q WHERE q.amenity='place_of_worship') as place_of_worship,
    //   (SELECT ST_COLLECT(q.geom) as collect FROM planet_osm_point as q WHERE q.amenity='school') as school,
    //   (SELECT ST_COLLECT(q.geom) as collect FROM planet_osm_point as q WHERE q.amenity='library') as library
    //     WHERE ST_INTERSECTS(polygons.geom,post_office.collect)and
    //     ST_INTERSECTS(polygons.geom,library.collect) and
    //     ST_INTERSECTS(polygons.geom,school.collect) and
    //     ST_INTERSECTS(polygons.geom,place_of_worship.collect) and
    //     ST_INTERSECTS(polygons.geom,post_office.collect) ";
        $objects = DB::select(DB::raw($query));
        return $objects[0]->features;
    }

    // public function getObjectInsideVillage() {
    //     $query =  "SELECT array_to_json(array_agg(f)) As features
    //     FROM (SELECT 'Feature' As type
    //         ,ST_AsGeoJSON(ST_AsText(ST_Transform(s.way,4326)))::json As geometry
    //         FROM planet_osm_polygon as k, planet_osm_polygon as s WHERE (k.boundary='administrative' and k.name='Pribylina')  and ST_CONTAINS(k.way, s.way)) As f";
    //     // $query =  "SELECT * FROM planet_osm_polygon as k, planet_osm_point as s WHERE (k.boundary='administrative' and k.name='Pribylina')  and ST_CONTAINS(k.way, s.way)";
    //     $objects = DB::select(DB::raw($query));
    //     return $objects[0]->features;
    // }
    public function getPotentialVillages() {
        $query = "SELECT array_to_json(array_agg(f)) As features
        FROM (
            SELECT  'Feature' as type, ST_AsGeoJson(points.geom)::json as geometry,
                row_to_json((SELECT l FROM (SELECT points.name,points.population,points.ele,points.osm_id) As l))::jsonb As properties
                FROM 
                    (SELECT ST_Buffer(towns.geom,0.07) as buffer 
                        FROM 
                            (SELECT p.geom,ST_AREA(k.geom) as a,
                                ROW_NUMBER() OVER(PARTITION BY k.name ORDER BY ST_AREA(k.geom) DESC) rn
                                FROM planet_osm_polygon k
                                CROSS JOIN planet_osm_point p
                                WHERE p.name=k.name and k.boundary='administrative' and ST_AREA(k.geom)>0.005 and p.place='town'
                                ORDER BY a desc) as towns 
                        WHERE rn=1 LIMIT 8) as top_towns, planet_osm_point points
                WHERE points.place='village' and ST_CONTAINS(top_towns.buffer, points.geom)
            ) As f";

        // $query = "SELECT array_to_json(array_agg(f)) As features
        // FROM (SELECT 'Feature' as type, ST_AsGeoJson(ST_Buffer(towns.geom,0.1,'quad_segs=8'))::json as geometry 
        //                 FROM 
        //                     (SELECT p.geom,k.osm_id,ST_AREA(k.geom) as a,
        //                         ROW_NUMBER() OVER(PARTITION BY k.name ORDER BY ST_AREA(k.geom) DESC) rn
        //                         FROM planet_osm_polygon k
        //                         CROSS JOIN planet_osm_point p
        //                         WHERE p.name=k.name and k.boundary='administrative' and ST_AREA(k.geom)>0.01 and p.place='town'
        //                         ORDER BY a desc) as towns 
        //                 WHERE rn=1 LIMIT 5) As f";
        $objects = DB::select(DB::raw($query));
        return $objects[0]->features;
    }
}



