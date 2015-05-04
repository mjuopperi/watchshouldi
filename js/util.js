var imageUrl = "https://image.tmdb.org/t/p";
var backdropWidth = "/w1280";

function backdropUrl(path) {
    return imageUrl + backdropWidth + path;
}

function posterUrl(path, width) {
    return imageUrl + "/w" + width + path;
}

function nameOrTitle(data) {
    if("name" in data) return data.name;
    else return data.title;
}

function releaseDate(data) {
    if ("first_air_date" in data) return data.first_air_date;
    else return data.release_date;
}

function generateId(length) {
    return new Array(length).join().replace(/(.|$)/g, function(){return ((Math.random()*36)|0).toString(36)[Math.random()<.5?"toString":"toUpperCase"]();});
}