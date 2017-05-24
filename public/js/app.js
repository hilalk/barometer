// This example requires the Places library. Include the libra  ries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAGinFKaPAfggVpedFtgLYXLN9tOmtHjhk",
  authDomain: "barometer-4d159.firebaseapp.com",
  databaseURL: "https://barometer-4d159.firebaseio.com", projectId: "barometer-4d159",
  storageBucket: "barometer-4d159.appspot.com",
  messagingSenderId: "979199373746"
};
firebase.initializeApp(config);
firebase.auth().signInAnonymously().catch(function(error) {});
var map;
var infowindow;
var userId = null;
var places = {};

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    userId = user.uid;
  }
});

function init() {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      initMap(pos.lat,pos.lng);
      firebase.database().ref('places').once('value').then(function(snapshot) {
        places = snapshot.val();
      })
    }, function(err) {
      //print error
      console.log("error",err);
      //display default location to run the app
      initMap(33,-74);
      // handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    //print error
    console.log(" browser error");
    //display default location to run the app
    initMap(33,-74);
    // handleLocationError(false, infoWindow, map.getCenter());
  }
} //init ends
function initMap(lat,lng) {
  var pos = {lat: lat, lng: lng};
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 18
  });

  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: pos,
    radius: 500,
    type: ['bar']
  }, callback);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function getCount(place_id) {
  if (places[place_id]) {
    return places[place_id];
  } else {
    return 0;
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });


  google.maps.event.addListener(marker, 'click', function() {
    var info = "<h1>" + place.name + "</h1>" + "<h2>" + place.vicinity + "</h2>" +
    "<div id=\""+place.id+"\"><button class='button minus'>NOPE</button>"+"<span class='count'>"+getCount(place.id)+"</span>"+"<button class='button plus'>YAS</button></div>";
    // var address = "address goes here"
    // infowindow.setContent(place.name);
    infowindow.setContent(info);
    infowindow.open(map, this);
  });
}

init();

function saveToFireBase(){
  firebase.database().ref("places").set(places);
}

$(document).ready(function() {
  $(document).on('click', '.plus', function() {
    var counter = $(this).prev();
    var id = $(this).parent().attr('id');
    if (!places[id]) {
      places[id] = 1;
      places['hasVotedUp'] = true;
    } else {
      if (!places['hasVotedUp']) {
        places[id]++;
        places['hasVotedDown'] = false;
      }
    }
    $(counter).text(places[id]);
    saveToFireBase();
  });

  $(document).on('click', '.minus', function() {
    var counter = $(this).next();
    var id = $(this).parent().attr('id');
    if (!places[id]) {
      places[id] = -1;
      places['hasVotedDown'] = true;
    } else {
      if (!places['hasVotedDown']) {
        places[id]--;
        places['hasVotedUp'] = false;
      }
    }
    $(counter).text(places[id]);
    saveToFireBase();
  });
});
