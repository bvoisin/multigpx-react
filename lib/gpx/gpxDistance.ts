/**
 * Calculates the distance in km between two geographical points
 * (most direct line on the surface of the earth)
 *
 * @param lat1
 * @param lon1
 * @param lat2
 * @param lon2
 */
export function getDistanceFromLatLonInKm(lat1:number, lon1:number, lat2:number, lon2:number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2-lat1);  // deg2rad below
    const dLon = deg2rad(lon2-lon1);
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
     // Distance in km
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}
