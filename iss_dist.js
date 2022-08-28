var url = "https://api.wheretheiss.at/v1/satellites/25544"; //storing the url for the api 
var usrLat; //setting global varibles for the users latitude and longitude
var usrLong;

//function that handles the case where the location cannot be retrieved. In this case the user should manually input their coordinates
function fail(){
}

function success(pos) {
    usrLat = pos.coords.latitude * Math.PI / 180; //converting to radians
    usrLong = pos.coords.longitude * Math.PI / 180; //converting to radians
    fetch(url).then((response) => {return response.json()}).then((data) => {displayData(data)}); //passing in the json data through the displayData function
}

//this handles the case where the user manually inputs their coordinates
function submitForm(form){
    usrLat = form.querySelector("input[name=lat]").value * Math.PI / 180; //storing the data and converting to radians
    usrLong = form.querySelector("input[name=long]").value * Math.PI / 180; //storing the data and converting to radians
    fetch(url).then((response) => {return response.json()}).then((data) => {displayData(data)}); //passing in the json data through the displayData function
    return false;
}

//this function takes the user's location and proceeds 
function submitLocation(form){
    if (window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(success, fail);
        } 
    return false;
}

//function that calculates the values and displays them
function displayData(data) {
    let radius = 6371000; //approximate radius of the earth
    let issLat = data["latitude"] * Math.PI / 180;//converting to radians
    let issLong = data["longitude"] * Math.PI / 180;//converting to radians
    let issHeight = data["altitude"] * 1609.34; //converting miles to meters
    let deltaLat = issLat - usrLat;
    let deltaLong = issLong - usrLong;

    //haversine formula
    let a = (Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) ) + (Math.cos(issLat) * Math.cos(usrLat) * Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2) );
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a) );
    let globeDistance = radius * c;
    let realDistance = globeDistance + issHeight;

    //bearing formula
    let theta = Math.atan2(Math.sin(deltaLong) * Math.cos(issLat), Math.cos(usrLat) * Math.sin(issLat) - Math.sin(usrLat) * Math.cos(issLat) * Math.cos(deltaLong) );
    let bearing = (theta * 180 / Math.PI + 360) % 360; //this normalises the bearing from [-pi,pi] radians to [0,360] degrees

    const html =`
        <br>
        <div>Your latitude: <b>${Math.round( (usrLat * 180 / Math.PI) * 100) / 100}</b></div>
        <div>Your longitude: <b>${Math.round( (usrLong * 180 / Math.PI) * 100) / 100}</b></div>
        <div>To get to the ISS, you would need to traverse <b>${Math.round(realDistance * 100) / 100}m</b></div>
        <div>Walk along the earth's surface for <b>${Math.round(globeDistance * 100) / 100}m</b> with an initial bearing of <b>${Math.round(bearing * 100) / 100}°</b>
         then travel directly away from the earth for <b>${Math.round(issHeight * 100) / 100}m</b></div>
        <article>
                <h3>Explaination</h3>
                <p>The distance shown is not the length of the straight line connecting you and the ISS. It is calculated by considering the journey
                    along the great circle connecting you and the ISS's projection on to the earth. The associated distance is then summed with the
                    current height of the ISS.
                </p>
                <img src="illustration.png" alt="rough diagram of journey" style='height: 100%; width: 100%; object-fit: contain'>
                <p>The great circle distance is calculated using the haversine formula. See wikipedia for more details.</p>
                <p>Only the inital bearing is provided since it would change as you travelled.
                </p>There are many sources of error. The calculator assumes that everything in the universe (except for you) is frozen
                    in time as you complete your journey. Humans cannot walk on water.
                    Also, the earth might be <a href="https://theflatearthsociety.org/">aspherical</a>.<p>    
                </p>
            </article>
        `;

    let issDiv = document.querySelector(".iss");
    issDiv.innerHTML = html;
}