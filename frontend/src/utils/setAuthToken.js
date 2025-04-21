import axios from "axios";

//when called this func, attaches token to header
const setAuthToken = (token) => {
  if (token) {
    //apply to every request
    axios.defaults.headers.common["Authorization"] = token;
  } else {
    //delete auth header
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setAuthToken;
