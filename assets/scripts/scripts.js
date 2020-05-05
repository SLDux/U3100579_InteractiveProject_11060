//Make arrays to store the data in, for easier retrieval
//BEN: Let's make an array to hold the results. 

//Array for all plants found in area
var allPlantsArray = new Array();
//Array for all plants found, that have complete Trefle data.
var filteredPlantArray = new Array();

// Load the function when the document is ready
$(document).ready(function () {

    //Geolocation
    //Variable for location 
    var newlat = '';
    var newlon = '';
    //Set default location to Canberra
    var defaultlat = '-35.28346';
    var defaultlon = '149.12807';
    //Default location for opencage API 
    var defaultRLocation = '-35.28346+149.12807';



    //Get location information from browser 
    //If there is a geolocation recorded 
    if (navigator.geolocation) {
        //Log the geolocation data 
        console.log(navigator.geolocation);

        //If you can retrieve a location 
        function success(position) {
            var crds = position.coords;
            console.log('Latitude: ' + crds.latitude);
            console.log('Longitude: ' + crds.longitude);

            //Get lat and lon for ALA API
            newlat = crds.latitude;
            newlon = crds.longitude;

            //Format location variable for opencage API
            var RLocation = crds.latitude + '+' + crds.longitude;

            //Run function to get plant occurences, sending location data
            getPlantOccur(newlat, newlon);
            //Run function to get location name, sending location data
            locationName(RLocation);
        }

        //Cannot retrieve the function location: error
        function error(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);

            //Run function to get plant occurences sending default location
            getPlantOccur(defaultlat, defaultlon);
            //Run function to get location name, sending default location
            locationName(defaultRLocation);
        }

        //Request to allow the location data from the browser 
        navigator.geolocation.getCurrentPosition(success, error);

        //Browser doesn't support geolocation: show error
    } else {
        showError();

    }

});

//Reverse geocode for location name 
function locationName(currentRLocation) {

    //API Key can callback url
    var GLKey = 'b3c6f8195444484eabbbfa78c4ab681f';
    var GLurl = 'https://api.opencagedata.com/geocode/v1/json?q=' + currentRLocation + '&key=' + GLKey;

    //Request reverse geolocation data
    $.getJSON(GLurl, function (Locationdata) {
        console.log(Locationdata);
        //Display data
        console.log(Locationdata.results[0].components.suburb);
        console.log(Locationdata.results[0].components.state_code);
        console.log(Locationdata.results[0].components.postcode);
        $('.Lsuburb').append(Locationdata.results[0].components.suburb);
        $('.Lstate').append(Locationdata.results[0].components.state_code);
        $('.Lpost').append(Locationdata.results[0].components.postcode);
    });


}

//Get plant occurances from location data function. 
function getPlantOccur(currentlat, currentlon) {
    console.log('in get plant occurence fn');
    var url = 'https://biocache-ws.ala.org.au/ws/occurrence/facets?q=kingdom:Plantae&lat=' + currentlat + '&lon=' + currentlon + '&radius=0.5&facets=taxon_name&flimit=100';

    console.log(url);

    //Make request to server using api call
    $.getJSON(url, function (data) {
        //Output request
        //Display in console
        console.log(data);

        //If there are occurences for your location
        if (data[0]) {

            //For each recorded plant in the area
            //BEN: loop through field results (complicated data structure)
            for (z = 0; z < data[0].fieldResult.length; z++) {
                var item = data[0].fieldResult[z];
                
                //Create an object
                //BEN: create an object (to set up our own data structure)
                var obj = {}
                
                //Take species name from API result and store in object
                //BEN: now add the plant name to it
                obj.plantName = item.label;

                //Store the object in the array
                //BEN: Add the object to the array
                allPlantsArray.push(obj);

            }
            
            //Allow time for data to load.
            //BEN: wait 3 seconds before executing the next function to ensure the data has loaded
            setTimeout(function () {
                getPlantTR(allPlantsArray);
            }, 1000);

            //If no occurances, show error, display no results
        } else {
            console.log('We can not find any recorded occurances for your area');
        };
    });
};


//Function to get details from Trefle using species name
function getPlantTR(allPlantsArray) {
    console.log('in get plant');

    //Trefle API key
    var TRkey = 'Uy9Oa00yaW42ZXlwYWtaY1BEaTdjUT09';

    //BEN: basically need to change the order of how we do things

    //Display array count and objects in console
    //check array contents
    console.log('plant array length: ' + allPlantsArray.length)
    console.log(allPlantsArray);

    //For every object in the allPlants array (all recorded plants in area)
    //BEN: change back to allPlantsArray.length
    for (i = 0; i < allPlantsArray.length; i++) {
        currentPlant = allPlantsArray[i];
        //Log the name of the plant
        console.log(currentPlant.plantName);

        //Get plants from Trefle url with plant name from allPlants array
        //create url with plantname from array
        var TRurl = 'https://cors-anywhere.herokuapp.com/https://trefle.io/api/plants/?&token=' + TRkey + '&scientific_name=' + currentPlant.plantName;

        $.getJSON(TRurl, function (TRdata) {

            //If Trefle has complete data on the plant add it to the filtered array.
            //BEN: if there is some data, add it to the array
            if (TRdata.length != 0) {
                if (TRdata[0].complete_data == true) {
                //BEN ok, so now we want to only add the plants with data to our array,
                // to do that we'll push them into the filtteredPlantsArray
                //BEN: create an object (to set up our own data structure)
                var obj = {}

                //BEN: grab the current plant name for the first array
                //                obj.plantName = currentPlant.plantName;

                //add in the id and slug
                obj.id = TRdata[0].id;
                obj.slug = TRdata[0].slug;

                //Get detailed information from Trefle and add it to the current plant object/array
                //BEN: to make it easier, let's get the rest of the data now
                var TRDurl = 'https://cors-anywhere.herokuapp.com/https://trefle.io/api/plants/' + TRdata[0].id + '?&token=' + TRkey;

                $.getJSON(TRDurl, function (TRDdata) {
                    console.log(TRDdata);


                    // Display image 
                    if (TRDdata.images.length > 0) {
                        //if there is an image then set it
                        obj.image = TRDdata.images[0].url;
                    }


                    // Get scientific name
                    obj.scientific_name = TRDdata.scientific_name;

                    // Get common name
                    obj.common_name = TRDdata.common_name;

                    // Get toxcicity
                    obj.toxicity = TRDdata.main_species.specifications.toxicity;

                    //Get other details. 
                    //Description info
                    
                    //Growing conditions
                    
                    //Taxon (scientific names list, plant family etc.)
                    
                });

                //Store all object data in new filtered plants array
                //BEN: now push all the new object data to the array
                filteredPlantArray.push(obj);

                //just checking the content is in the array
                console.log(filteredPlantArray);
                    
                } else {
                    //Data not complete. Do nothing
                };

            } else {
                //no data, do nothing
            };

        });



    } //close loop

    //BEN:
    //Now go off and create HTML

    //Wait for data before moving to next function
    setTimeout(function () {
        createHTML();
    }, 3000);


}


//Function to display data on page
function createHTML() {
    console.log('in create HTML function');

    console.log(filteredPlantArray);

    //For each plant in the filtered array
    for (i = 0; i < filteredPlantArray.length; i++) {
        var plant = filteredPlantArray[i];
        console.log(filteredPlantArray[i]);

        //create html elements
        var container = $('<div class="R">');

        var imageContainer = $('<div class="imgResult">');
        var infoContainer = $('<div class="infoResult">');

        //Put everything where it is supposed to be on index.html
        imageContainer.append('<img width="250" class="TRimg" src="' + plant.image + '"></img>');

        infoContainer.append('<div class="Minfo">Scientific name: ' + plant.scientific_name + '</div>');
        infoContainer.append('<div class="Minfo">Common name: ' + plant.common_name + '</div>');
        infoContainer.append('<div class="Minfo">Toxicity: ' + plant.toxicity + '</div>');

        //Create individual plant page and display data. 
        
        //Load data onto plant.html when plant image is clicked on


        $('.mainResults').append(imageContainer);
        $('.mainResults').append(infoContainer);
    }

    filteredPlantArray.forEach(function (plant) {



        //    $('<div class="R"><div class="imgResult"></div><div class="infoResult"> </div></div>').appendTo('.mainResults');




    })





}
                    
                    