// The Model, an array of locations that will be used to populate the map
var initialLocations = [
    {
        title: 'Jamaica Pond',
        location: {
            lat: 42.317161,
            lng: -71.120342
        },
        note: 'nothing to see here'
    },
    {
        title: 'FoMu Premium Alternative Ice Cream',
        location: {
            lat: 42.314303,
            lng: -71.114265
        }
    },
    {
        title: 'JP Centre Yoga',
        location: {
            lat: 42.312448,
            lng: -71.113943
        }
    },
    {
        title: 'Jamaica Pond Boat House',
        location: {
            lat: 42.315776,
            lng: -71.117557
        }
    },
    {
        title: 'JP licks',
        location: {
            lat: 42.312878,
            lng: -71.114382
        }
    },
    {
        title: 'Jackson Square MBTA Station',
        location: {
            lat: 42.323116,
            lng: -71.099783
        }
    },
    {
        title: 'Stony Brook MBTA Station',
        location: {
            lat: 42.31723,
            lng: -71.104196
        }
    },
    {
        title: 'Green Street MBTA Station',
        location: {
            lat: 42.310397,
            lng: -71.107548
        }
    },
    {
        title: 'Forest Hills MBTA Station',
        location: {
            lat: 42.300813,
            lng: -71.113725
        }
    },
    {
        title: 'Angell MSPCA Animal Care and Adoption Center',
        location: {
            lat: 42.323009,
            lng: -71.110629
        }
    },
    {
        title: 'Loring-Greenough House',
        location: {
            lat: 42.309569,
            lng: -71.114939
        }
    },
    {
        title: 'Arnold Arboretum',
        location: {
            lat: 42.298426,
            lng: -71.125541
        }
    }
];

var ViewModel = function() {
    "use strict";
    // Set self to this so we can access the this of the View Model Function while still accessing the this of a specific binding.
    var self = this;
    // Create an empty observable array to hold the locations
    self.locationList = ko.observableArray([]);

    // Constructor for a location object
    var Location = function(locationItem, id) {
        this.title = ko.observable(locationItem.title);
        this.location = ko.observable(locationItem.location);
        this.note = ko.observable(locationItem.note);
        this.id = id;
    };

    // Loop over all locations and create an observable for each and add to an to the locationList array.
    // Neat trick to get an index on an element using a for each loop instead of doing a for loop reference at:
    // http://stackoverflow.com/questions/10179815/how-do-you-get-the-loop-counter-index-using-a-for-in-syntax-in-javascript
    // Need index so we can us that when we send a click or actions to the google maps api.
    initialLocations.forEach(function(locationItem, id) {
        self.locationList.push( new Location(locationItem, id));
    });

    // Define the query variable used for filtering as an empty string to prevent undefined errors.
    self.query = ko.observable('');

    // Filter Location List and Google Maps Markers via Knockout.
    // List filtering possible through help via forums especially this example by coach John Mav http://codepen.io/JohnMav/pen/OVEzWM
    // Other good helpful filtering references:
    //      http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.
    //      http://opensoul.org/2011/06/23/live-search-with-knockoutjs/
    // Unable to find good documentation on arrayFilter which seems to be an internal utilitiy in Knockout that is accessbile for other uses.
    // It appears the arrayFilter takes two values, an array and a search value which can be a function.
    // The arrayFilter will go through each item in the array and return only those items that match.
    // Each search is completed using the indexOf Javascript function that returns -1 if the string is not found.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf
    // TODO: Update data model and search to filter on categories.
    self.search = ko.computed(function() {
        return ko.utils.arrayFilter(self.locationList(), function(Location){
            // Check to see if Markers exist so we can also filter markers.
            // TODO: Try using set visible status instead
            if(markers.length > 0) {
                if(Location.title().toLowerCase().indexOf(self.query().toLowerCase()) >= 0){
                    markers[Location.id].visible = true;
                }
                else {
                    markers[Location.id].visible = false;
                }
            }
            return Location.title().toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
        });
    });

    // When a location in the list of locations is clicked send a click to the Google Maps API to show the info window.
    self.mapClick = function() {
        google.maps.event.trigger(markers[this.id], 'click');
        // Close the menu if it is open
        if(self.menuClass() === true){
            self.menuClass(false);
            self.menuName('Menu');
        }
    };

    // Create a toggle switch to open and close the menu
    self.menuName = ko.observable('Menu');
    self.menuClass = ko.observable(false);
    self.toggleMenu = function() {
        console.log(self.menuClass());
        if(self.menuClass() === false){
            self.menuClass(true);
            self.menuName('Close Menu');
        } else {
            self.menuClass(false);
            self.menuName('Menu');
        }
    };

}; // End View Model