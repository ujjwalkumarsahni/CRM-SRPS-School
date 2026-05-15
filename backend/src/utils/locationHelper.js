// const axios = require("axios");

// const getAddressFromCoordinates = async (lat, lng) => {
//   try {

//     const response = await axios.get(
//       "https://nominatim.openstreetmap.org/reverse",
//       {
//         params: {
//           lat,
//           lon: lng,
//           format: "json"
//         },

//         headers: {
//           "User-Agent": "attendance-system"
//         }
//       }
//     );

//     return response.data.display_name;

//   } catch (error) {

//     console.log("Location Error:", error.message);

//     return "Unknown Location";
//   }
// };

// module.exports = {
//   getAddressFromCoordinates
// };

const axios = require("axios");

const getAddressFromCoordinates = async (lat, lng) => {
  try {

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json",
          addressdetails: 1
        },

        headers: {
          "User-Agent": "attendance-system"
        }
      }
    );

    const data = response.data;

    if (!data || !data.address) {
      return "Unknown Location";
    }

    const address = data.address;

    const formattedAddress = [
      address.road,
      address.suburb,
      address.city || address.town || address.village,
      address.state,
      address.country
    ]
      .filter(Boolean)
      .join(", ");

    return formattedAddress;

  } catch (error) {

    console.log("Location Error:", error.message);

    return "Unknown Location";
  }
};

module.exports = {
  getAddressFromCoordinates
};