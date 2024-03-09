const urlAPI = "https://api.wheretheiss.at/v1/satellites/25544"; 
const radiusEarth = 6371000; //approximate radius of the earth

//Handle the case where the location cannot be retrieved. In this case the user should manually input their coordinates
function fail()
{
    document.querySelector(".issOutput").innerHTML =`
        <br>
        <div>Unable to retrieve location.</b></div>
        `;
}

//Handle the case where the location can be retrieved
function success(pos)
{
    const usrLat = pos.coords.latitude * Math.PI / 180; //converting to radians
    const usrLong = pos.coords.longitude * Math.PI / 180; //converting to radians
    fetch(urlAPI).then((response) => {return response.json()}).then((data) => {displayData(data, usrLat, usrLong)});
}

//Gets the user's current location
function getLocation()
{
    if (window.navigator.geolocation) 
    {
        window.navigator.geolocation.getCurrentPosition(success, fail);
    } 
    return false;
}

function submitForm(form)
{
    const usrLat = form.querySelector("input[name=lat]").value * Math.PI / 180; //storing the data and converting to radians
    const usrLong = form.querySelector("input[name=long]").value * Math.PI / 180; //storing the data and converting to radians
    fetch(urlAPI).then((response) => {return response.json()}).then((data) => {displayData(data, usrLat, usrLong)}); 
    return false;
}

//Calcuate required metrics and display the output HTML
function displayData(data, usrLat, usrLong)
{
    let issLat = data["latitude"] * Math.PI / 180;//converting to radians
    let issLong = data["longitude"] * Math.PI / 180;//converting to radians
    let issHeight = data["altitude"] * 1609.34; //converting miles to meters
    let deltaLat = issLat - usrLat;
    let deltaLong = issLong - usrLong;

    //haversine formula
    let a = (Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) ) + (Math.cos(issLat) * Math.cos(usrLat) * Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2) );
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a) );
    let globeDistance = radiusEarth * c;
    let realDistance = globeDistance + issHeight;

    //bearing formula
    let theta = Math.atan2(Math.sin(deltaLong) * Math.cos(issLat), Math.cos(usrLat) * Math.sin(issLat) - Math.sin(usrLat) * Math.cos(issLat) * Math.cos(deltaLong) );
    let bearing = (theta * 180 / Math.PI + 360) % 360; //this normalises the bearing from [-pi,pi] radians to [0,360] degrees

    document.querySelector(".issOutput").innerHTML =`
        <br>
        <div>Your latitude: <b>${Math.round( (usrLat * 180 / Math.PI) * 100) / 100}</b></div>
        <div>Your longitude: <b>${Math.round( (usrLong * 180 / Math.PI) * 100) / 100}</b></div>
        <div>To get to the ISS, you would need to traverse <b>${Math.round(realDistance * 100) / 100}m</b></div>
        <div>Walk along the earth's surface for <b>${Math.round(globeDistance * 100) / 100}m</b> with an initial bearing of <b>${Math.round(bearing * 100) / 100}°</b>
         then travel directly away from the earth for <b>${Math.round(issHeight * 100) / 100}m</b></div>
        <article>
            <h3>Explanation</h3>
            <p>The distance shown is not the length of the straight line connecting you and the ISS. It is calculated by considering the journey
                along the great circle connecting you and the ISS's projection on to the earth. The associated distance is then summed with the
                current height of the ISS.</p>
            <img src="illustration.png" alt="rough diagram of journey" style='height: 100%; width: 100%; object-fit: contain'>
            <p>The great circle distance is calculated using the haversine formula. See wikipedia for more details.</p>
            <p>Only the inital bearing is provided since it would change as you travelled.</p>
        </article>
        `;
}
