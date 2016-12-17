(function(global){
"use strict";
// Javascript Code to create a map with the Google Maps API.
// https://developers.google.com/maps/
// Much of this code is from from the Udacity Google Maps API course https://www.udacity.com/course/google-maps-apis--ud864

// Create the map variable that will store the map.
var map,
    defaultIcon,
    highlightedIcon,
    selectedIcon,
    streetViewService;

var mapLatLng = {lat: 42.3138461, lng: -71.12};

// Create a new blank array for all the markers.
global.markers = [];

global.initMap  = function () {
    if(typeof google === 'undefined'){
        console.log('Google Maps failed to load. Please try again later.');
        return;
}
    // Create a styles array to use with the map.
    // Sytle from Snazzy Maps https://snazzymaps.com/style/81/ilustra%C3%A7%C3%A3o
    var styles = [{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#71ABC3"},{"saturation":-10},{"lightness":-21},{"visibility":"simplified"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"hue":"#7DC45C"},{"saturation":37},{"lightness":-41},{"visibility":"simplified"}]},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"hue":"#C3E0B0"},{"saturation":23},{"lightness":-12},{"visibility":"simplified"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#A19FA0"},{"saturation":-98},{"lightness":-20},{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#FFFFFF"},{"saturation":-100},{"lightness":100},{"visibility":"simplified"}]}];

    // Constructor to create a new map of Jamaica Plain.
    map = new google.maps.Map(document.getElementById('map'), {
        center: mapLatLng,
        zoom: 14,
        styles: styles,
        mapTypeControl: false
    });

    // Create new infoWindow
    var largeInfowindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user mouses over the marker.
    highlightedIcon = makeMarkerIcon('FFFF24');

    // Create a "selected location" marker color for when the user selects a marker from the list.
    selectedIcon = makeMarkerIcon('4B0082');

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < initialLocations.length; i++) {
        // Get the position from the location array.
        var position = initialLocations[i].location;
        var title = initialLocations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            map: map,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });

        // Push the marker to our array of markers.
        markers.push(marker);

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            toggleBounce(this);
            // Center current marker on map thanks to tip from Udacity reviewer.
            map.panTo(this.getPosition());
        });

      // Two event listeners - one for mouseover, one for mouseout,
      // to change the colors back and forth.
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });



    }// End for Loop

    // Now that map is set up apply Knockout bindings
    window.ko.applyBindings(new ViewModel());
};// End initMap

// Make marker bounce if it is selected
function toggleBounce(currentMarker) {
    // First go through all markers and set animation to null
    markers.forEach(function(marker){
    marker.setAnimation(null);
    marker.setIcon(defaultIcon);
    });
    // Now animate the current marker
    currentMarker.setAnimation(google.maps.Animation.BOUNCE);
    currentMarker.setIcon(selectedIcon);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check for Wiki Data
    var wikiData = '<div class="wiki-info"><h3>Wikepedia Articles</h3><p>No Wikipedia Informaion Available.</p></div>';
    // Check array value is ok before proceeding. Reference: http://stackoverflow.com/questions/2672380/how-do-i-check-if-a-javascript-array-value-is-empty-or-null
    if(typeof wikiArray[marker.id] !=='undefined' &&wikiArray[marker.id][2].length > 0){
        wikiData = '<div class="wiki-info"><h3>Wikepedia Articles</h3><p>';
        wikiData +=  wikiArray[marker.id][2];
        wikiData +=  ' <a href="' + wikiArray[marker.id][3] + '" target="_blank">' + wikiArray[marker.id][3] + '</a></p>';
        wikiData +=  '</div>';
    }

    // Check for NY Times Data
    var nyTimesData = '<div class="nyt-info"><h3>NY Times Articles</h3><p>No New York Times Articles Available.</p></div>';
    // Check array value is ok before proceeding. Reference: http://stackoverflow.com/questions/2672380/how-do-i-check-if-a-javascript-array-value-is-empty-or-null
    if(typeof nyTimesArticleArray[marker.id] !== 'undefined' && nyTimesArticleArray[marker.id].response.docs.length > 0){
        nyTimesData = '<div class="nyt-info"><h3>New York Times Articles</h3>';
        // Loop through available articles
        nyTimesArticleArray[marker.id].response.docs.forEach(function(article){
            nyTimesData += '<h4>' + article.headline.main + '</h4>';
            nyTimesData += '<p>' + article.snippet;
            nyTimesData += ' <a href="' + article.web_url + '" target="_blank">' + article.web_url + '</a></p>';
        });
        nyTimesData +=  '</div>';
    }

// Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
        streetViewService = new google.maps.StreetViewService();


        infoWindowDetails(marker, infowindow, wikiData, nyTimesData);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
} // End populate infowindow

function infoWindowDetails(marker, infowindow, wikiData, nyTimesData){
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        // TODO: Think about refactoring this so it simplified. It was inside the loop and worked ok but had to move outside loop to pass "use strict"re
        var radius = 300;
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);

                infowindow.setContent('<div class="infowindow"><h1 class="infowindow-header">' + marker.title + '</h1><div id="pano"></div>' + wikiData + nyTimesData + '</div>');

                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 10
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div class="infowindow"><h1 class="infowindow-header">' + marker.title + '</h1>' + '<div>No Street View Found</div>' + wikiData + nyTimesData + '</div>');
            }
        }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34)
    );
    return markerImage;
}

 //  *** Wikipedia API ***
    // https://www.mediawiki.org/wiki/API:Main_page
    // set up new array to use for wiki articles
var wikiArray = [],
    currentWikiRequest = 0,
    countOfArticles = initialLocations.length - 1;

function getWikiArticles(){
    // Using recursion one at a time look up titles via Wikipedia API
    // Reminder of using recursion from http://stackoverflow.com/questions/14408718/wait-for-callback-before-continue-for-loop
    // Setup URL for Ajax request to include the current location title
    var wikiSearch = initialLocations[currentWikiRequest].title;
    var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + wikiSearch + '&format=json&callback=wikiCallback';

    $.ajax({
            // ajax settings
            url: wikiURL,
            dataType: 'jsonp',
        }).done(function (response) {
            // successful
            wikiArray[currentWikiRequest] = response;
            // Now we check if we need to do more requests and use recursion to do them.
            if (currentWikiRequest < countOfArticles){
                currentWikiRequest ++;
                getWikiArticles();
            }
        }).fail(function (jqXHR, textStatus) {
            // error handling
            alert('Wikipedia data not currently available. Please try again later.');
    });
}

getWikiArticles();

 //  *** NY Times API ***
var nyTimesArticleArray = [],
    currentNYTRequest = 0,
    countOfNYTArticles = initialLocations.length - 1;

function getNYTimesArticles(){
    // Using recursion one at a time look up titles via Wikipedia API
    // Reminder of using recursion from http://stackoverflow.com/questions/14408718/wait-for-callback-before-continue-for-loop
    // Setup URL for Ajax request to include the current location title

    // Built by LucyBot. www.lucybot.com via https://developer.nytimes.com/article_search_v2.json#/Console/GET/articlesearch.json
    var nytUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    nytUrl += '?' + $.param({
        'api-key': "da9fbbc94ca44e22b161868f9f7bdacc",
        'q': initialLocations[currentNYTRequest].title + ' and boston', // add boston to search parameter to limit to Boston area
        'begin_date': "20160101", //TODO: Update time to make it todays date less 1 year
        'end_date': "20161231"
    });

    // now recursion!
    $.ajax({
            // ajax settings
            url: nytUrl,
            method: 'GET',
            dataType: 'json',
        }).done(function (response) {
            // successful
            nyTimesArticleArray[currentNYTRequest] = response;
            // Now we check if we need to do more requests and use recursion to do them.
            if (currentNYTRequest < countOfNYTArticles){
                currentNYTRequest ++;
                getNYTimesArticles();
            }
        }).fail(function (jqXHR, textStatus) {
            // error handling
            alert('New York Times data not currently available. Please try again later.');
    });
}

getNYTimesArticles();

// Make map responsive and fit all markers on resize hanks to tip from Udacity reviewer.
window.onresize = function() {
    var bounds = new google.maps.LatLngBounds(null);
    markers.forEach(function(marker){
        bounds.extend(marker.getPosition());
    });
    map.fitBounds(bounds);
};

global.googleError = function() {
    alert('Google Maps Failed to load. Please try again later.');
};

}(window));