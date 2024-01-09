import io from "socket.io-client";

const ENDPOINT = "http://localhost:8080"; // Your server URL
const socket = io(ENDPOINT, {
  query: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjljM2Y5ZGIyLWU4MGMtNDg5NC04ZWMyLTNmZmU5ZWY2ZjE1NCIsImlhdCI6MTcwNDc2NDczOSwiZXhwIjoxNzA0NzY4MzM5fQ.OGP7wW_1ChnBkMF-Kwt3REIAlEyiqNkccriQBZC-ghA", // Client sends the JWT token here
  },
});

export default socket;
