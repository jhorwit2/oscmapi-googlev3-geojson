oscmapi-googlev3-geojson
========================

## Open Source Common Map API GeoJson Parser

This project is a clone from [Jason Sanford](https://github.com/JasonSanford/geojson-google-maps); however, this project now extends the geojson specification to conform to the [Common Map API Specification v1.2](http://www.cmwapi.org/docs/Common_map_widget_API_v1.2.0.docx).

The current code base also has been completely refactored with a prototype approach and complete documentation. 

### Dependencies

[Underscore.js](http://underscorejs.org/) or [Lodash.js](http://lodash.com/)

### version 2.0

### Joshua Horwitz

#### Overview
GeoJSON is used to create Google Maps API v3 vectors (Marker, Polyline, Polygon) from GeoJSON objects (Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, Feature, GeometryCollection, FeatureCollection). Specifically, I'm translating some GeoJSON types to arrays of Google Maps vectors as there aren't really Google Maps equivalents of MultiPoint, MultiLineString, etc.

#### Constructor Parameters
@param {Object} geojson
A valid GeoJSON object. One of Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, Feature, GeometryCollection, FeatureCollection. See the [official GeoJSON spec](http://geojson.org) for more details. GeoJSON examples below.
		
@param? {Object} options - Optional
Options for the specific type of Google Maps vector (Marker, Polyline, Polygon). If none specified, boring black vectors and red markers will be created - Optional. Samples Below.

#### GeoJSON -> Google Maps equivalents
<table>
<tr><th>GeoJSON Type</th><th>Output</th></tr>
<tr><td>Point</td><td>google.maps.Point</td></tr>
<tr><td>LineString</td><td>google.maps.Polyline</td></tr>
<tr><td>Polygon</td><td>google.maps.Polygon</td></tr>
<tr><td>MultiPoint</td><td>Array of google.maps.Point</td></tr>
<tr><td>MultiLineString</td><td>Array of google.maps.Polyline</td></tr>
<tr><td>MultiPolygon</td><td>Array of google.maps.Polygon</td></tr>
<tr><td>Feature</td><td>google.maps.[Point,Polyline,Polygon] (depends on Feature geometry type)</td></tr>
<tr><td>FeatureCollection</td><td>Array of google.maps.[Point,Polyline,Polygon] (depends on Feature geometry type)</td></tr>
<tr><td>GeometryCollection</td><td>Array of google.maps.[Point,Polyline,Polygon] (depends on geometry type)</td></tr>
</table>

========================
### Common Map API Specification v1.2 additions

## Important

Currently, the only style feature implemented is the url for iconStyle. The other style features are on the list to be implemented in the near future though. 

Any values added to the properties field will be included in the Google object generated via this library and can be accessed via:
```javascript
var googleObject = new GeoJSON(geojson);
// Access properties
console.log(googleObject.properties);
```

The Common Map Widget API specification extends the GeoJSON specification by adding the “style”, “name”, “id”, “description“, and “timePrimitive“ objects to the “Properties” object of the GeoJSON specification.  These extended objects ONLY apply to the GeoJSON Feature object.
```javascript
style: { 
	lineStyle:  {
		color: {
			r: (required), g: (required), b: (required), a: (required)
		} (required)
	} (optional), 
	polyStyle:  {
		color: {
			r: (required), g: (required), b: (required), a: (required)
		} (required)
	} (optional),
	iconStyle: {
		url: (required)
	}(optional)
} (optional),
name: (optional), 
id: (recommended), 
description: (optional),
timePrimitive: {
	timeSpan: {
		begin: (required),
		end: (required)
	} (optional),
	timestamp: (optional)
} (optional)
```

**color:**   	Object representing [CSS3 RGBA](http://www.w3.org/wiki/CSS3/Color/RGBA).  No value sent results in default settings on the map.

   **r:**	Integer value between 0 and 255 for red.<br>
   **g:**	Integer value between 0 and 255 for green.<br>
   **b:**	Integer value between 0 and 255 for blue.<br>
   **a:**	Number value between 0.0 (fully transparent) to 1.0 (fully opaque).<br>


**iconStyle:**
**url:*	URL to an image file that will be used for the icon for a point. If no URL is provided, result will be map’s default icon.

**name:** name of the specific GeoJSON feature. Generally used when the GeoJSON parent object is a featureCollection or feature objects.

**id:** a unique identifier for the feature object.If the id of the GeoJSON Feature.properties.id is omitted, and part of a FeatureCollection, selection may not work for these features as they cannot be uniquely identified. 

**description:** user supplied content that appears in a pop-up balloon associated with the feature.  Can be plain text, or HTML formatted.

