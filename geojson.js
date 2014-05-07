/*
Copyright (c) 2012, Jason Sanford
All rights reserved.
*/

/*global google, _ */
var GeoJSON = (function () {

    /**
     * @constructor
     * This method takes in the geojson object and any options for the
     * google maps object that will be created as a result of the geojson obj.
     *
     * @param {Object} json    Geojson object
     * @param {[type]} options options for google maps object
     */
    var GeoJSON = function (json, options) {
        return this.parseJson(json, options);
    };

    /**
     * This method is tasked with handling the geojson and building up
     * the google map objects. It parses the geojson for feature or geometry
     * collections, feature objects and normal geojson objects.
     *
     * @param  {Object} json       geojson object
     * @param  {Object} options    options for google maps
     * @param  {Object} properties geojson properties
     * @return {Array || Object || null}   Array or single google map object. Null if error
     */
    GeoJSON.prototype.parseJson = function (json, options, properties) {
        options = options || {};
        properties = json.properties || properties || {}; // not sure if second is needed
        var features = [];
        var that = this;
        switch (json.type) {
        case "FeatureCollection":
            if (json.features) {
                _(json.features).each(function (feature) {
                    features.push(that.createFeature(feature.geometry, options, properties));
                });
                return features;
            }
            break;
        case "GeometryCollection":
            if (json.geometries) {
                _(json.geometries).each(function (geometry) {
                    features.push(that.createFeature(geometry, options, properties));
                });
                return features;
            }
            break;
        case "Feature":
            if (json.geometry) {
                return that.createFeature(json.geometry, options, properties);
            }
            break;
        case "Point":
        case "MultiPoint":
        case "LineString":
        case "MultiLineString":
        case "Polygon":
        case "MultiPolygon":
            if (json.coordinates) {
                return that.createFeature(json, options, properties);
            }
            break;
        }
        // If there was an error then return null failing silenty
        return null;
    };

    /**
     * Create the google maps object from the passed in geojson object.
     *
     * @param  {Object} json       geojson object
     * @param  {Object} options    options for google maps
     * @param  {Object} properties geojson properties
     * @return {google.maps.X}            Google maps object
     */
    GeoJSON.prototype.createFeature = function (json, options, properties) {
        switch (json.type) {
            case "Point":
                return this.point(json, options, properties);
            case "MultiPoint":
                return this.multiPoint(json, options, properties);
            case "LineString":
                return this.lineString(json, options, properties);
            case "MultiLineString":
                return this.multiLineString(json, options, properties);
            case "Polygon":
                return this.polygon(json, options, properties);
            case "MultiPolygon":
                return this.multiPolygon(json, options, properties);
            case "GeometryCollection":
                return this.parseJson(json, options, properties);
        }
    };

    /**
     * Createa a google maps marker object.
     *
     * @precondition options and properties will not be undefined or null
     * @param  {Object} json       geojson object
     * @param  {Object} options    options for google maps
     * @param  {Object} properties geojson properties
     * @return {google.maps.Marker}   google maps marker object
     */
    GeoJSON.prototype.point = function (json, options, properties) {
        var marker;
        options = _(options).clone();
        properties = _(properties).clone();

        // This check allows for re-use of code in the multiPoint method;
        var coordinates = _(json.coordinates).isUndefined() ? json : json.coordinates;

        // Obtain the google.maps.latlng object for the points coordinates
        options.position = new google.maps.LatLng(coordinates[1], coordinates[0]);

        // Style addition to geojson for CMAPI specification
        if (properties.style && properties.style.iconStyle) {
            // url is required, so if we get this far it must be here
            // as per the specification.
            options.icon = properties.style.iconStyle.url;
        }
        marker = new google.maps.Marker(options);

        // Store the properties for each object and set the type.
        marker.properties = properties;
        marker.properties.type = properties.type ? properties.type : "Point";

        // Cache the bounds object for easy/efficient re-use by the map.
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(options.position);
        marker.properties.bounds = bounds;

        return marker;
    };

    /**
     * Create a group of google map marker objects from the multipoint object
     *
     * @precondition options and properties will not be undefined or null
     * @param  {Object} json       geojson object
     * @param  {Object} options    options for google maps
     * @param  {Object} properties geojson properties
     * @return {Array<google.maps.Marker>}   array of google maps marker objects
     */
    GeoJSON.prototype.multiPoint = function (json, options, properties) {
        var markers = [];
        var that = this;
        // Interate through each point in the multi point feature.
        _(json.coordinates).each(function (coords) {
            markers.push(that.point(coords, options, properties));
        });

        return markers;
    };

    /**
     * Create a polyline google map object from the geojson lineString
     *
     * @precondition options and properties will not be undefined or null
     * @param  {Object} json       geojson object
     * @param  {Object} options    options for google maps
     * @param  {Object} properties geojson properties
     * @return {google.maps.Polyline}   google maps polyline object
     */
    GeoJSON.prototype.lineString = function (json, options, properties) {
        var path = [], line;
        options = _(options).clone();
        properties = _(properties).clone();

        // This check allows for re-use of code in the multi linestring method;
        var coordinates = _(json.coordinates).isUndefined() ? json : json.coordinates;

        var bounds = new google.maps.LatLngBounds();
        // Iterate through each coordinate in the line. Build the bounds of the
        // line as we progress through each coordinate.
        _(coordinates).each(function (coordinate) {
            var latlng = new google.maps.LatLng(coordinate[1], coordinate[0]);
            bounds.extend(latlng);
            path.push(latlng);
        });
        // Set the path of the line and create the line object
        options.path = path;
        line = new google.maps.Polyline(options);

        // Set the geojson properties and type
        line.properties = properties;
        line.properties.type = properties.type ? properties.type : "LineString";

        // Cache the bounds for re-use later by the map.
        line.properties.bounds = bounds;

        return line;
    };

    /**
     * Create an array of polyline google map objects from the
     * MultiLineString geojson object
     *
     * @precondition options and properties will not be undefined or null
     * @param  {Object} json       geojson object
     * @param  {Object} options    options for google maps
     * @param  {Object} properties geojson properties
     * @return {Array<google.maps.Polyline>}   array of google maps polyline objects
     */
    GeoJSON.prototype.multiLineString = function (json, options, properties) {
        var lines = [], path;
        var that = this;
        // Create each line within the multi line string.
        _(json.coordinates).each(function (line) {
            lines.push(that.lineString(line, options, properties));
        });

        return lines;
    };

    /**
     * The algorithm below determines whether the points go clockwise
     * or counterclockwise. It's based off the shoelace formula and the
     * code was taken from here: http://stackoverflow.com/a/14506549
     *
     * @param  {Array<google.maps.LatLng>} coordinates array of latlng google objects
     * @return {Boolean}    true if points go clockwise
     */
    GeoJSON.prototype._clockwise = function (coordinates) {
        var area = 0, j;
        for (var i = 0; i < coordinates.length; i++) {
            j = (i + 1) % coordinates.length;
            area += coordinates[i].lat() * coordinates[j].lng();
            area -= coordinates[j].lat() * coordinates[i].lng();
        }
        area /= 2;
        var clockwise = area > 0;
        return clockwise;
    };

    /**
     * Create a polygon google map object from the Polygon geojson object
     *
     * @precondition options and properties will not be undefined or null
     * @param  {Object} json       geojson object
     * @param  {Object} options    options for google maps
     * @param  {Object} properties geojson properties
     * @return {google.maps.Polygon}   google maps polygon object
     */
    GeoJSON.prototype.polygon = function (json, options, properties) {
        var paths = [], path, path_length;
        var polygon;
        var outsideDirection, insideDirection;
        options = _(options).clone();
        properties = _(properties).clone();
        var bounds = new google.maps.LatLngBounds();

        // This check allows for re-use of code in the multiPolygon method;
        var coordinates = _(json.coordinates).isUndefined() ? json : json.coordinates;

        var that = this;
        _(coordinates).each(function (coordinate) {
            path = [];
            _(coordinate).each(function (latlng) {
                var latlng_obj = new google.maps.LatLng(latlng[1], latlng[0]);
                bounds.extend(latlng_obj);
                path.push(latlng_obj);
            });

            // This is needed for internal polygons to shade them correctly.
            path_length = paths.length;
            if (path_length === 0) {
                outsideDirection = that._clockwise(path);
                paths.push(path);
            } else {
                if (path_length === 1) {
                    insideDirection = that._clockwise(path);
                }
                paths[path_length] = (insideDirection === outsideDirection) ? path.reverse() : path;
            }
        });

        options.paths = paths;
        polygon = new google.maps.Polygon(options);

        polygon.properties = properties;
        polygon.properties.type = properties.type ? properties.type : "Polygon";
        polygon.properties.bounds = bounds;

        return polygon;
    };

    /**
     * Create an array of Polygon google map objects from the MultiPolygon
     * geojson geojson object.
     *
     * @precondition options and properties will not be undefined or null
     * @param  {Object} json       geojson object
     * @param  {Object} options    options for google maps
     * @param  {Object} properties geojson properties
     * @return {Array<google.maps.Polygon>}   array of google maps polygon objects
     */
    GeoJSON.prototype.multiPolygon = function (json, options, properties) {
        var polygons = [], polygon;
        var that = this;
        // Iterate through each polygon and create the object.
        _(json.coordinates).each(function (polygon) {
            polygons.push(that.polygon(polygon, options, properties));
        });

        return polygons;
    };

    return GeoJSON;
}());
